"""Grounded Groq interpretations for the four numerology components.

The knowledge records are the only permitted source of meaning. The model organises and
paraphrases them, and explains *why* they apply; every statement must cite record IDs, which are
validated here before anything reaches the client.
"""
import logging
from typing import Any

from app.core.llm import clean_cited_items, generate_json, normalize_text

logger = logging.getLogger(__name__)

MAX_RECORDS_PER_COMPONENT = 20
MAX_CLAIM_LENGTH = 500

COMPONENT_LABELS = {
    "moolank": "Moolank (Psychic Number) - the inner, instinctive layer, from the day of birth",
    "bhagyank": "Bhagyank (Destiny Number) - the wider life-current, from the complete date of birth",
    "namank": "Namank (Name Number) - the public and social expression of the name",
    "personal_year": "Personal Year Number - the themes traditionally associated with one specific year",
}


def evidence_layer(record: dict[str, Any], component: str) -> str:
    """Section 2.2 of the guide: component-specific, general and context-specific traits stay separate."""
    context = record.get("context")
    if record.get("compound_number") is not None and record.get("numerology_component") == "moolank":
        return "compound_birth_date"
    if context not in (None, "general", "birth_date_compound"):
        return "context_specific"
    if record.get("numerology_component") == component:
        return "component_specific"
    return "general_number"


# When a reading has more records than fit, general number traits are dropped first: the guide
# treats them as supporting evidence, while component, compound and requested-context claims define it.
LAYER_PRIORITY = {"compound_birth_date": 0, "component_specific": 1, "context_specific": 2, "general_number": 3}


def _clean_records(records: list[dict[str, Any]], component: str) -> list[dict[str, Any]]:
    cleaned = []
    ranked = sorted(records, key=lambda r: LAYER_PRIORITY[evidence_layer(r, component)])
    for record in ranked[:MAX_RECORDS_PER_COMPONENT]:
        claim = str(record.get("claim") or "").strip()
        if not claim:
            continue
        cleaned.append({
            "record_id": record.get("record_id"),
            "evidence_layer": evidence_layer(record, component),
            "number": record.get("number"),
            "compound_number": record.get("compound_number"),
            "planet": record.get("planet"),
            "context": record.get("context"),
            "category": record.get("category"),
            "trait": record.get("trait"),
            "claim": claim[:MAX_CLAIM_LENGTH],
            "polarity": record.get("polarity"),
        })
    return cleaned


def empty_component_result(status: str = "no_source_records") -> dict[str, Any]:
    return {
        "headline": "",
        "summary": "",
        "strengths": [],
        "challenges": [],
        "key_themes": [],
        "explanation": {"how_calculated": "", "why_this_reading": "", "evidence_notes": []},
        "supporting_record_ids": [],
        "generation_status": status,
    }


COMPONENT_SYSTEM_PROMPT = """
You are the editor of a premium traditional Vedic numerology report. You write warm, elegant,
easy-to-read English, but you are strictly grounded in the supplied knowledge records.

STRICT GROUNDING RULES
1. The knowledge_records are the ONLY permitted source of meaning. Do not invent traits,
   predictions, advice, events, causes, or facts.
2. Never claim numerology is scientifically validated. Use framing such as "In this tradition..."
   or "The source associates..." where natural.
3. Every strength, challenge, theme and evidence note must cite record IDs that appear in the input.
4. Respect each record's evidence_layer:
   - component_specific: belongs to this component; may be presented as such.
   - compound_birth_date: comes from the specific two-digit birth day; say so explicitly.
   - general_number: general traits of the number; present them as general, never as
     component-specific.
   - context_specific: only for the requested context (for example business); label it.
5. For personal_year, only use personal_year records; do not borrow other numbers' meanings.
6. Do not repeat the same idea across sections; merge near-duplicates and cite all their IDs.
7. Never expose field names, snake_case, or record IDs inside the prose text itself.
8. Address the reader directly as "you". Do not invent a name or gender for the reader.

WHAT TO WRITE
- headline: an evocative 4-9 word title capturing the reading (for example
  "The Steady Builder Guided by Saturn"). It must be supported by the records.
- summary: 2-4 flowing sentences that a reader would enjoy, grounded in the records.
- strengths / challenges / key_themes: concise items (one sentence each). Include every distinct,
  source-supported item. Use challenge records (negative polarity) for challenges.
  Each key_theme item has a short "title" (1-3 words) and a "text" sentence.
- explanation: explain the prediction so a curious reader understands it:
  * why_this_reading: 2-4 sentences explaining how the calculated number leads to the reading -
    which planet rules the number in this tradition (only if a record states it), which layers of
    evidence were used (component-specific, compound birth date, general, context) and why
    general traits are treated as supporting rather than defining.
  * evidence_notes: 1-4 items, each {"text": "...", "record_ids": [...]}, pointing out the most
    influential records and what they contributed.

Return ONE valid JSON object, no Markdown, exactly with these fields:
{
  "headline": "...",
  "summary": "...",
  "strengths": [{"text": "...", "record_ids": ["ID"]}],
  "challenges": [{"text": "...", "record_ids": ["ID"]}],
  "key_themes": [{"title": "...", "text": "...", "record_ids": ["ID"]}],
  "explanation": {
    "why_this_reading": "...",
    "evidence_notes": [{"text": "...", "record_ids": ["ID"]}]
  },
  "supporting_record_ids": ["ID"]
}
If no evidence supports a section, return an empty string or empty array for it.
""".strip()


def generate_component_interpretation(
    *,
    component: str,
    number: int,
    records: list[dict[str, Any]],
    full_name: str,
    target_year: int,
    calculation: dict[str, Any] | None = None,
    compound_number: int | None = None,
    context: str | None = None,
) -> dict[str, Any]:
    clean_records = _clean_records(records, component)
    if not clean_records:
        return empty_component_result()

    # Person-agnostic payload: identical evidence yields a reusable (cached) reading.
    payload = {
        "component": COMPONENT_LABELS.get(component, component),
        "calculated_number": number,
        "compound_number": compound_number,
        "planet_reference": (calculation or {}).get("planet"),
        "requested_context": context or "general",
        "knowledge_records": clean_records,
    }
    parsed = generate_json(COMPONENT_SYSTEM_PROMPT, payload, max_tokens=1800, temperature=0.35, cache_namespace="numerology.component.v3")

    allowed_ids = {record["record_id"] for record in clean_records}
    strengths = clean_cited_items(parsed.get("strengths"), allowed_ids)
    challenges = clean_cited_items(parsed.get("challenges"), allowed_ids)
    key_themes = clean_cited_items(parsed.get("key_themes"), allowed_ids, extra_keys=("title",))

    raw_explanation = parsed.get("explanation") if isinstance(parsed.get("explanation"), dict) else {}
    evidence_notes = clean_cited_items(raw_explanation.get("evidence_notes"), allowed_ids)
    explanation = {
        # Built from the deterministic calculation, never from model output.
        "how_calculated": " ".join((calculation or {}).get("steps", [])),
        "why_this_reading": normalize_text(str(raw_explanation.get("why_this_reading") or "")),
        "evidence_notes": evidence_notes,
    }

    cited = []
    for section in (strengths, challenges, key_themes, evidence_notes):
        for item in section:
            cited.extend(item["record_ids"])
    supporting_ids = list(dict.fromkeys(cited))

    summary = normalize_text(str(parsed.get("summary") or ""))
    headline = normalize_text(str(parsed.get("headline") or ""))
    if not supporting_ids:
        # A narrative with no validated evidence would be ungrounded; drop it.
        summary, headline = "", ""

    return {
        "headline": headline,
        "summary": summary,
        "strengths": strengths,
        "challenges": challenges,
        "key_themes": key_themes,
        "explanation": explanation,
        "supporting_record_ids": supporting_ids,
        "generation_status": "generated",
    }


SYNTHESIS_SYSTEM_PROMPT = """
You are writing the opening "Your Numbers Together" section of a traditional Vedic numerology
report. You receive four already-calculated components, each with its source-backed claims.

RULES
1. Use only the supplied claims; every item must cite record IDs from the input.
2. Keep components distinct. A leadership claim from Moolank is not the same claim as a leadership
   claim from Namank; when they point the same way, call it a "resonance" and name both components.
3. A "tension" is where claims from different components pull in different directions (for example
   one favours independence and another cooperation). Do not invent tensions.
4. No scientific claims, no invented predictions or advice. Use "in this tradition" framing.
5. Do not expose record IDs, field names or snake_case in prose.
6. Address the reader directly as "you"; do not invent a name or gender.

Return ONE valid JSON object:
{
  "headline": "6-10 word evocative title for the whole profile",
  "overview": "3-5 sentences weaving the four numbers together (inner nature, life-current,
               public expression, and the target year)",
  "resonances": [{"text": "...", "components": ["moolank", "namank"], "record_ids": ["ID"]}],
  "tensions": [{"text": "...", "components": ["bhagyank", "personal_year"], "record_ids": ["ID"]}],
  "year_focus": {"text": "1-2 sentences on the Personal Year themes, from personal_year claims only",
                 "record_ids": ["ID"]}
}
""".strip()


def generate_profile_synthesis(
    *,
    full_name: str,
    target_year: int,
    components: dict[str, dict[str, Any]],
    records_by_component: dict[str, list[dict[str, Any]]],
) -> dict[str, Any]:
    compact: dict[str, Any] = {}
    allowed_ids: set[str] = set()
    for component, records in records_by_component.items():
        clean = _clean_records(records, component)[:10]
        allowed_ids.update(r["record_id"] for r in clean)
        compact[component] = {
            "label": COMPONENT_LABELS[component],
            "number": components[component]["number"],
            "planet": components[component].get("planet"),
            "claims": [{"record_id": r["record_id"], "layer": r["evidence_layer"], "trait": r["trait"], "claim": r["claim"], "polarity": r["polarity"]} for r in clean],
        }
    if not allowed_ids:
        return {"generation_status": "no_source_records"}

    parsed = generate_json(
        SYNTHESIS_SYSTEM_PROMPT,
        {"target_year": target_year, "components": compact},
        max_tokens=1400,
        temperature=0.4,
        cache_namespace="numerology.synthesis.v2",
    )
    valid_components = set(components)

    def with_components(items: Any) -> list[dict[str, Any]]:
        out = []
        for original in items if isinstance(items, list) else []:
            cleaned = clean_cited_items([original], allowed_ids)
            if not cleaned:
                continue
            comps = original.get("components", [])
            comps = [c for c in comps if c in valid_components] if isinstance(comps, list) else []
            out.append({**cleaned[0], "components": comps})
        return out

    year_focus_raw = parsed.get("year_focus") if isinstance(parsed.get("year_focus"), dict) else {}
    year_ids = {r["record_id"] for r in compact.get("personal_year", {}).get("claims", [])}
    year_focus = clean_cited_items([year_focus_raw], year_ids)

    return {
        "headline": normalize_text(str(parsed.get("headline") or "")),
        "overview": normalize_text(str(parsed.get("overview") or "")),
        "resonances": with_components(parsed.get("resonances")),
        "tensions": with_components(parsed.get("tensions")),
        "year_focus": year_focus[0] if year_focus else None,
        "generation_status": "generated",
    }
