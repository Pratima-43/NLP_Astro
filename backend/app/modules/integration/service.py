from __future__ import annotations

import json
import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.llm import generate_json, llm_available, normalize_text, with_plain_style
from app.db.models import ChatMessageRecord, ChatSession, CombinedReport
from app.modules.integration.claims import (
    THEMES, build_claim_pool, contributions, load_sources, select_relevant, themes_for_text, valid_ids,
)
from app.modules.integration.profile import build_profile_facts

logger = logging.getLogger(__name__)

MODULE_LABELS = {"numerology": "Numerology", "astrology": "Vedic Astrology", "palmistry": "Palmistry"}


def _claims_payload(selected: dict[str, list[dict]]) -> dict:
    return {
        module: [{"id": c["claim_id"], "trait": c["trait"], "claim": c["claim"], "basis": c["basis"],
                  "polarity": c["polarity"], "weight": c["weight"]} for c in claims]
        for module, claims in selected.items()
    }


def _availability(sources: dict) -> dict:
    return {module: bool(sources.get(module)) for module in MODULE_LABELS}


CHAT_PROMPT = """
You are AstroVerse Guide, a kind helper who answers questions in simple words, using three
readings: numbers (numerology), stars (Indian astrology) and hand (palm reading). You receive the user's question,
recent conversation, and for each system a list of claims already derived from THIS user's own
readings (each with an id, the claim, and the `basis` - the calculation that produced it).

RULES
1. Answer only from the supplied claims. Never invent placements, numbers, palm features, dates or
   predictions. If the claims cannot answer the question, say so and suggest which reading would help.
2. Cite claim ids for every point. Treat each system's claims as distinct evidence.
3. Compare systems explicitly: where they point the same way, call it agreement; where they partly
   overlap, partial overlap; where they speak to different aspects, difference; where they pull in
   opposite directions, contradiction. Semantic similarity alone is not agreement.
4. This is what old traditions say, not science. No medical, legal or financial advice.
   Be kind and calm; never frightening.
5. Do not show claim ids, snake_case or field names inside prose text.
6. If a system has no reading (marked unavailable), do not speculate about it.

Return ONE JSON object:
{
  "answer": "A direct, simple answer in 2-4 short paragraphs separated by \\n\\n.",
  "key_points": [{"text": "one-sentence insight", "claim_ids": ["N:...", "A:..."]}],
  "module_insights": [{"module": "numerology|astrology|palmistry",
                       "summary": "what this system contributes to the answer, 1-2 sentences",
                       "claim_ids": ["..."]}],
  "cross_system": [{"relation": "agreement|partial_overlap|difference|contradiction",
                    "text": "how the systems relate on this point", "claim_ids": ["..."]}],
  "follow_up_questions": ["up to 3 short follow-up questions the user could ask"]
}
""".strip()


def chat(db: Session, *, owner_key: str | None, message: str, session_id: int | None) -> dict:
    session = db.get(ChatSession, session_id) if session_id else None
    if session is not None and session.user_id != owner_key:
        session = None
    if session is None:
        session = ChatSession(user_id=owner_key, title=message[:80])
        db.add(session)
        db.flush()

    history_rows = list(db.scalars(
        select(ChatMessageRecord).where(ChatMessageRecord.session_id == session.id)
        .order_by(ChatMessageRecord.id.desc()).limit(6)
    ))[::-1]
    history = [{"role": r.role, "content": r.content[:800]} for r in history_rows]

    sources = load_sources(db, owner_key)
    pool = build_claim_pool(sources)
    themes = themes_for_text(message)
    if not themes and history:  # follow-ups like "why?" inherit the previous question's themes
        themes = themes_for_text(" ".join(h["content"] for h in history if h["role"] == "user")[-400:])
    selected = select_relevant(pool, themes)
    available = _availability(sources)
    allowed = {c["claim_id"] for claims in selected.values() for c in claims}

    db.add(ChatMessageRecord(session_id=session.id, role="user", content=message))

    if not allowed:
        payload = {
            "answer": "I don't have any of your readings yet. Generate your Numerology, Vedic Astrology "
                      "or Palmistry reading first, and I'll answer from your own results.",
            "key_points": [], "module_insights": [], "cross_system": [], "follow_up_questions": [],
            "contributions": contributions([], selected), "themes": themes, "available_modules": available,
            "claims": {}, "generation_status": "no_readings",
        }
    elif not llm_available():
        payload = {"answer": "The language model is not configured on the server (GROQ_API_KEY).",
                   "key_points": [], "module_insights": [], "cross_system": [], "follow_up_questions": [],
                   "contributions": contributions([], selected), "themes": themes, "available_modules": available,
                   "claims": {}, "generation_status": "llm_not_configured"}
    else:
        try:
            parsed = generate_json(with_plain_style(CHAT_PROMPT), {
                "question": message, "recent_conversation": history,
                "question_themes": [THEMES[t] for t in themes] or ["general"],
                "available_systems": available, "claims": _claims_payload(selected),
            }, max_tokens=2000, temperature=0.45)
            key_points = [{"text": normalize_text(k["text"]), "claim_ids": valid_ids(k.get("claim_ids"), allowed)}
                          for k in parsed.get("key_points", []) if isinstance(k, dict) and isinstance(k.get("text"), str)]
            key_points = [k for k in key_points if k["claim_ids"]]
            insights = [{"module": i["module"], "summary": normalize_text(str(i.get("summary", ""))), "claim_ids": valid_ids(i.get("claim_ids"), allowed)}
                        for i in parsed.get("module_insights", []) if isinstance(i, dict) and i.get("module") in MODULE_LABELS]
            relations = [{"relation": r["relation"], "text": normalize_text(str(r.get("text", ""))), "claim_ids": valid_ids(r.get("claim_ids"), allowed)}
                         for r in parsed.get("cross_system", [])
                         if isinstance(r, dict) and r.get("relation") in ("agreement", "partial_overlap", "difference", "contradiction")]
            relations = [r for r in relations if r["claim_ids"]]
            cited = [i for k in key_points for i in k["claim_ids"]] + [i for m in insights for i in m["claim_ids"]] + [i for r in relations for i in r["claim_ids"]]
            by_id = {c["claim_id"]: c for claims in selected.values() for c in claims}
            payload = {
                "answer": normalize_text(str(parsed.get("answer") or "")),
                "key_points": key_points, "module_insights": insights, "cross_system": relations,
                "follow_up_questions": [normalize_text(q) for q in parsed.get("follow_up_questions", []) if isinstance(q, str)][:3],
                "contributions": contributions(cited, selected),
                "themes": themes, "available_modules": available,
                "claims": {cid: {k: by_id[cid][k] for k in ("module", "trait", "claim", "basis", "weight", "source_name")} for cid in dict.fromkeys(cited)},
                "generation_status": "generated",
            }
        except Exception:
            logger.exception("Integration chat failed")
            payload = {"answer": "I couldn't generate an answer just now. Please try again in a moment.",
                       "key_points": [], "module_insights": [], "cross_system": [], "follow_up_questions": [],
                       "contributions": contributions([], selected), "themes": themes, "available_modules": available,
                       "claims": {}, "generation_status": "generation_failed"}

    db.add(ChatMessageRecord(session_id=session.id, role="assistant", content=payload["answer"], payload_json=json.dumps(payload, ensure_ascii=False)))
    db.commit()
    return {"session_id": session.id, **payload}


def history(db: Session, owner_key: str | None) -> list[dict]:
    if not owner_key:
        return []
    sessions = db.scalars(select(ChatSession).where(ChatSession.user_id == owner_key).order_by(ChatSession.id.desc()).limit(30))
    out = []
    for s in sessions:
        messages = db.scalars(select(ChatMessageRecord).where(ChatMessageRecord.session_id == s.id).order_by(ChatMessageRecord.id))
        out.append({"session_id": s.id, "title": s.title, "created_at": s.created_at.isoformat(), "messages": [
            {"role": m.role, "content": m.content, "payload": json.loads(m.payload_json) if m.payload_json else None,
             "created_at": m.created_at.isoformat()} for m in messages]})
    return out


REPORT_PROMPT = """
You are writing the "Combined Reading" of a premium report that compares three traditional systems
for one person: Numerology, Vedic Astrology and Palmistry. For each theme you receive each system's
claims (id, claim, basis).

RULES
1. Use only supplied claims; cite claim ids for everything. No invented facts, dates or advice.
2. For every theme with claims from at least one system, classify how the systems relate:
   agreement (same direction), partial_overlap, difference (different aspects), contradiction
   (opposite directions), or single_source (only one system speaks to it).
3. Similar wording is not automatically agreement; consider each claim's meaning and basis.
4. This is what old traditions say, not science. Do not show ids or snake_case in prose.
5. Address the reader directly as "you", never "the person"; do not invent a name or gender.
6. Write for a reader who knows nothing about these systems: say which reading says what (your
   numbers, your stars, your hand) and use plain names only (for example "your birthday number").

Return ONE JSON object:
{
  "headline": "3-8 plain words for the whole picture",
  "overview": "4-6 short, simple sentences across the three readings",
  "themes": [{"theme": "<theme key>", "relation": "agreement|partial_overlap|difference|contradiction|single_source",
              "synthesis": "3-5 sentences: what each system says on this theme and how they fit together",
              "claim_ids": ["..."]}],
  "strongest_agreements": [{"text": "...", "claim_ids": ["..."]}],
  "notable_tensions": [{"text": "...", "claim_ids": ["..."]}]
}
""".strip()


EXPLAIN_PROMPT = """
You are writing the "Your readings explained" part of a premium report for someone who knows
nothing about numerology, Vedic astrology or palmistry. Per system you receive the person's key
facts (key, label, value) and source-backed claims (id -> text). The reader already sees a fixed
explanation of what each concept is; your job is what it means for THIS person.

RULES
1. facts: cover EVERY fact key that any claim speaks to (including lines "not clearly visible",
   which have claims about their absence). Write "meaning": 2-4 warm, plain sentences on what that
   fact suggests about the person in its tradition, citing claim ids. Skip only facts no claim supports.
2. Use plain names only, never jargon (say "a shorter time inside it", not "antardasha").
3. system_summaries: 3-4 sentences per system that has facts, on what it says about the person overall.
4. timeline: 3-6 entries on what the traditions suggest for the current and coming periods, built
   from the dasha dates, Personal Year and transits in the facts. Each has a period, a short title,
   2-4 sentences and claim ids. Take period dates ONLY from the facts (the dasha dates, or the
   Personal Year's year); transits have no end date, so label them "Now" and never invent dates. Use "is traditionally linked
   with" wording: no guaranteed events, and no medical, financial or legal advice.
5. guidance: 4-6 practical, reflective takeaways that follow from cited claims (lean on a strength,
   watch a stated challenge, use the current period well). Each cites claim ids.
6. Use only the supplied claims. Never show ids, field names or snake_case in prose. Address the
   reader as "you"; do not invent a name or gender.

Return ONE JSON object:
{
  "system_summaries": {"numerology": "...", "astrology": "...", "palmistry": "..."},
  "facts": {"<fact key>": {"meaning": "...", "claim_ids": ["..."]}},
  "timeline": [{"period": "...", "title": "...", "text": "...", "claim_ids": ["..."]}],
  "guidance": [{"text": "...", "claim_ids": ["..."]}]
}
""".strip()

EXPLAIN_CLAIM_LIMITS = {"numerology": 16, "astrology": 36, "palmistry": 20}


def _grounded(items, allowed: set[str], *keys: str) -> list[dict]:
    """Keep list items with non-empty text that cite at least one allowed claim id."""
    out = []
    for item in items if isinstance(items, list) else []:
        if isinstance(item, dict) and isinstance(item.get("text"), str) and item["text"].strip():
            cited = valid_ids(item.get("claim_ids"), allowed)
            if cited:
                out.append({**{k: normalize_text(str(item.get(k) or "")) for k in keys},
                            "text": normalize_text(item["text"]), "claim_ids": cited})
    return out


def _explain_readings(pool: dict[str, list[dict]], facts: dict[str, list[dict]]) -> tuple[dict, set[str]]:
    """Ask the model what each profile fact means for this person; drop anything not grounded in claims."""
    chosen = {m: sorted(cs, key=lambda c: c["weight"], reverse=True)[:EXPLAIN_CLAIM_LIMITS[m]] for m, cs in pool.items()}
    allowed = {c["claim_id"] for cs in chosen.values() for c in cs}
    parsed = generate_json(with_plain_style(EXPLAIN_PROMPT), {
        m: {"facts": [{"key": f["key"], "label": f["label"], "value": f["value"]} for f in facts[m]],
            "claims": {c["claim_id"]: f"{c['claim'][:140]} (basis: {str(c['basis'])[:60]})" for c in chosen[m]}}
        for m in pool if facts[m]
    }, max_tokens=3200, temperature=0.4, cache_namespace="integration.explain.v4")

    fact_keys = {f["key"] for fs in facts.values() for f in fs}
    meanings = {}
    raw_facts = parsed.get("facts") if isinstance(parsed.get("facts"), dict) else {}
    for key, item in raw_facts.items():
        if key in fact_keys and isinstance(item, dict) and isinstance(item.get("meaning"), str) and item["meaning"].strip():
            cited = valid_ids(item.get("claim_ids"), allowed)
            if cited:
                meanings[key] = {"meaning": normalize_text(item["meaning"]), "claim_ids": cited}

    summaries = parsed.get("system_summaries") if isinstance(parsed.get("system_summaries"), dict) else {}
    timeline = _grounded(parsed.get("timeline"), allowed, "period", "title")
    guidance = _grounded(parsed.get("guidance"), allowed)
    explained = {
        "system_summaries": {m: normalize_text(str(summaries[m])) for m in pool if facts[m] and summaries.get(m)},
        "fact_meanings": meanings, "timeline": timeline, "guidance": guidance,
    }
    cited_ids = {i for x in [*meanings.values(), *timeline, *guidance] for i in x["claim_ids"]}
    return explained, cited_ids


def combined_report(db: Session, *, owner_key: str | None, ids: dict[str, int | None]) -> dict:
    sources = load_sources(db, owner_key, ids)
    pool = build_claim_pool(sources)
    available = _availability(sources)
    if not any(pool.values()):
        return {"generation_status": "no_readings", "available_modules": available}

    per_theme: dict[str, dict[str, list[dict]]] = {}
    for theme in THEMES:
        bucket = {m: [c for c in claims if theme in c["themes"]] for m, claims in pool.items()}
        bucket = {m: sorted(cs, key=lambda c: c["weight"], reverse=True)[:3] for m, cs in bucket.items()}
        if any(bucket.values()):
            per_theme[theme] = bucket
    allowed = {c["claim_id"] for b in per_theme.values() for cs in b.values() for c in cs}
    by_id = {c["claim_id"]: c for claims in pool.values() for c in claims}

    facts = build_profile_facts(sources)
    # The model calls below can take minutes under rate limits; return the connection to the pool
    # meanwhile so the pooler doesn't drop it before the report is saved.
    db.rollback()
    themes_out, headline, overview, agreements, tensions = [], "", "", [], []
    explained: dict = {"system_summaries": {}, "fact_meanings": {}, "timeline": [], "guidance": []}
    explained_ids: set[str] = set()
    status = "llm_not_configured"
    if llm_available():
        try:
            explained, explained_ids = _explain_readings(pool, facts)
        except Exception:
            # The comparison below still makes a useful report, so a failed explainer is not fatal.
            logger.exception("Combined report explainer failed")
        try:
            # Each claim is sent once and themes reference it by id, keeping the request inside
            # small tokens-per-minute budgets.
            parsed = generate_json(with_plain_style(REPORT_PROMPT), {
                "available_systems": available,
                "claims": {cid: f"[{by_id[cid]['module']}] {by_id[cid]['claim'][:160]} (basis: {str(by_id[cid]['basis'])[:70]})" for cid in sorted(allowed)},
                "themes": {t: {"label": THEMES[t], "claim_ids": {m: [c["claim_id"] for c in cs] for m, cs in b.items()}} for t, b in per_theme.items()},
            }, max_tokens=3200, temperature=0.4, cache_namespace="integration.report.v5")
            headline = normalize_text(str(parsed.get("headline") or ""))
            overview = normalize_text(str(parsed.get("overview") or ""))
            for item in parsed.get("themes", []) if isinstance(parsed.get("themes"), list) else []:
                if not isinstance(item, dict) or item.get("theme") not in per_theme:
                    continue
                cited = valid_ids(item.get("claim_ids"), allowed)
                if not cited:
                    continue
                theme_selected = per_theme[item["theme"]]
                themes_out.append({
                    "theme": item["theme"], "label": THEMES[item["theme"]],
                    "relation": item.get("relation") if item.get("relation") in ("agreement", "partial_overlap", "difference", "contradiction", "single_source") else "difference",
                    "synthesis": normalize_text(str(item.get("synthesis") or "")), "claim_ids": cited,
                    "contributions": contributions(cited, theme_selected),
                })
            for key, target in (("strongest_agreements", agreements), ("notable_tensions", tensions)):
                for item in parsed.get(key, []) if isinstance(parsed.get(key), list) else []:
                    if isinstance(item, dict) and isinstance(item.get("text"), str):
                        cited = valid_ids(item.get("claim_ids"), allowed)
                        if cited:
                            target.append({"text": normalize_text(item["text"]), "claim_ids": cited})
            status = "generated"
        except Exception:
            logger.exception("Combined report failed")
            status = "generation_failed"

    all_cited = [i for t in themes_out for i in t["claim_ids"]]
    full_selection = {m: [c for c in claims if c["claim_id"] in allowed] for m, claims in pool.items()}
    result = {
        "headline": headline, "overview": overview, "themes": themes_out,
        "profile_facts": facts, **explained,
        "strongest_agreements": agreements, "notable_tensions": tensions,
        "overall_contributions": contributions(all_cited, full_selection),
        "available_modules": available,
        "source_ids": {m: (sources[m][0] if sources.get(m) else None) for m in MODULE_LABELS},
        "claims": {cid: {k: by_id[cid][k] for k in ("module", "trait", "claim", "basis", "weight", "source_name")} for cid in dict.fromkeys(all_cited + [i for x in agreements + tensions for i in x["claim_ids"]] + sorted(explained_ids)) if cid in by_id},
        "method": (
            "We turn each of your saved readings into short lines from the books, and sort them by topic, like love or work. "
            "For each topic, the writer checks if your readings agree, partly agree, say different things, or disagree, and "
            "names the lines it used. How much each reading added is worked out from the lines it gave. Lines that fit you more "
            "closely count for more, and the soft pads of the palm count for less, because they are hard to see in a photo."
        ),
        "generation_status": status,
    }
    row = CombinedReport(
        user_id=owner_key, numerology_report_id=result["source_ids"]["numerology"],
        astrology_chart_id=result["source_ids"]["astrology"], palm_reading_id=result["source_ids"]["palmistry"],
        result_json=json.dumps(result, ensure_ascii=False),
    )
    db.add(row)
    db.commit()
    return {**result, "report_id": row.id}
