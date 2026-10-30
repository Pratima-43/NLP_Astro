from __future__ import annotations

from datetime import date, datetime, time
import json
import logging
from functools import lru_cache

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.llm import clean_cited_items, generate_json, llm_available, normalize_text
from app.db.models import AstrologyChart, KnowledgeClaim
from app.modules.vedic_astrology.chart import BirthData, calculate_chart
from app.modules.vedic_astrology.constants import CONVENTIONS, DOMAINS

logger = logging.getLogger(__name__)

CLAIM_FIELDS = ("record_id", "feature_key", "condition", "theme", "category", "trait", "claim", "polarity",
                "source_name", "source_url", "source_wording", "claim_type", "verification_status")


# ── Location ──────────────────────────────────────────────────────────────────
@lru_cache(maxsize=1)
def _timezone_finder():
    from timezonefinder import TimezoneFinder
    return TimezoneFinder()


def timezone_for(latitude: float, longitude: float) -> str:
    tz = _timezone_finder().timezone_at(lat=latitude, lng=longitude)
    if not tz:
        raise ValueError("Could not determine a time zone for these coordinates.")
    return tz


@lru_cache(maxsize=512)
def geocode(query: str) -> list[dict]:
    from geopy.geocoders import Nominatim
    geolocator = Nominatim(user_agent=settings.geocoder_user_agent, timeout=10)
    results = geolocator.geocode(query, exactly_one=False, limit=5, language="en") or []
    return [
        {"name": r.address, "latitude": round(r.latitude, 5), "longitude": round(r.longitude, 5),
         "timezone": timezone_for(r.latitude, r.longitude)}
        for r in results
    ]


# ── Evidence retrieval ────────────────────────────────────────────────────────
def _claims(db: Session, feature_key: str, condition: str | None = None) -> list[KnowledgeClaim]:
    query = select(KnowledgeClaim).where(KnowledgeClaim.system == "vedic_astrology", KnowledgeClaim.feature_key == feature_key)
    query = query.where(KnowledgeClaim.condition.is_(None) if condition is None else KnowledgeClaim.condition == condition)
    return list(db.scalars(query.order_by(KnowledgeClaim.record_id)))


def collect_evidence(db: Session, chart: dict, time_unknown: bool) -> list[dict]:
    """Map computed chart factors to knowledge claims. Each evidence item records *why* it applies
    (`basis`) and how much weight the integration layer should give it."""
    evidence: list[dict] = []

    def add(records: list[KnowledgeClaim], basis: str, factor: str, weight: float) -> None:
        for record in records:
            evidence.append({
                "evidence_id": f"A{len(evidence) + 1:02d}",
                **{field: getattr(record, field) for field in CLAIM_FIELDS},
                "basis": basis, "factor": factor, "weight": weight,
            })

    planets = chart["planets"]
    if not time_unknown:
        lagna = chart["lagna"]
        add(_claims(db, f"sign:{lagna['sign'].lower()}"), f"Ascendant (lagna) in {lagna['sign']} at {lagna['degree_label']}", "lagna", 1.0)
    moon = planets["Moon"]
    add(_claims(db, f"sign:{moon['sign'].lower()}"), f"Moon sign (rashi) {moon['sign']}", "moon_sign", 0.9)
    nak = moon["nakshatra"]
    add(_claims(db, f"nakshatra:{nak['name'].lower().replace(' ', '_')}"), f"Moon in {nak['name']} nakshatra, pada {nak['pada']} (lord {nak['lord']})", "nakshatra", 0.8)

    for name, p in planets.items():
        place = f"{name} in {p['sign']}" + ("" if time_unknown else f", house {p['house']}")
        if p["strength"] >= 2:
            add(_claims(db, f"planet:{name.lower()}", "strong"), f"{place}; strength score {p['strength']:+.1f}", f"planet_strong:{name}", 0.8)
        elif p["strength"] <= -1:
            add(_claims(db, f"planet:{name.lower()}", "weak"), f"{place}; strength score {p['strength']:+.1f}", f"planet_weak:{name}", 0.8)
        if p["dignity"] in ("exalted", "debilitated", "own_sign", "moolatrikona"):
            add(_claims(db, "dignity", p["dignity"]), f"{name} is {p['dignity'].replace('_', ' ')} in {p['sign']}", f"dignity:{name}", 0.6)

    for yoga in chart["yogas"]:
        if time_unknown and yoga["key"] not in ("gaja_kesari", "budha_aditya", "chandra_mangala", "sunapha", "anapha", "durudhara", "kemadruma"):
            continue  # lagna-dependent yogas are unreliable without a birth time
        add(_claims(db, f"yoga:{yoga['key']}"), f"{yoga['name']}: {yoga['condition']}", f"yoga:{yoga['key']}", 0.9)

    if not time_unknown:
        houses_to_domains: dict[int, list[str]] = {}
        for key, domain in DOMAINS.items():
            for house in domain["houses"]:
                houses_to_domains.setdefault(house, []).append(key)
        for house, keys in sorted(houses_to_domains.items()):
            info = chart["houses"][house - 1]
            outlooks = "; ".join(f"{chart['domains'][k]['label']} outlook {chart['domains'][k]['score']}/100 ({chart['domains'][k]['assessment']})" for k in keys)
            add(_claims(db, f"house:{house}"), f"House {house} in {info['sign']}, lord {info['lord']}; {outlooks}", f"domain:{keys[0]}", 0.5)

    dasha = chart["dasha"]
    if dasha.get("current_period"):
        period = dasha["current_period"]
        add(_claims(db, f"dasha:{period['mahadasha'].lower()}"), f"Current Mahadasha of {period['mahadasha']} (until {period['mahadasha_end']})", "dasha:maha", 1.0)
        if period["antardasha"] != period["mahadasha"]:
            add(_claims(db, f"dasha:{period['antardasha'].lower()}"),
                f"Current Antardasha of {period['antardasha']} ({period['antardasha_start']} to {period['antardasha_end']})", "dasha:antar", 0.8)

    transits = chart["transits"]
    if transits["sade_sati"]["active"]:
        add(_claims(db, "transit:sade_sati", "active"), f"Saturn transiting {transits['saturn']['sign']}, house {transits['saturn']['house_from_moon']} from the Moon ({transits['sade_sati']['phase']})", "transit:sade_sati", 0.9)
    if transits["jupiter"]["house_from_moon"] in (2, 5, 7, 9, 11):
        add(_claims(db, "transit:jupiter", "favourable"), f"Jupiter transiting {transits['jupiter']['sign']}, house {transits['jupiter']['house_from_moon']} from the Moon", "transit:jupiter", 0.7)

    # De-duplicate identical record+basis pairs while keeping the first evidence ID.
    seen, unique = set(), []
    for item in evidence:
        key = (item["record_id"], item["basis"])
        if key not in seen:
            seen.add(key)
            unique.append(item)
    return unique


# ── Interpretation ────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """
You are the writer of a premium, beautifully written Vedic (Jyotish) astrology report. You are
strictly grounded: the evidence list is the ONLY permitted source of meaning.

Each evidence item has: evidence_id, a traditional claim, and a `basis` stating which computed chart
factor activated it (for example "Saturn debilitated in Aries"). Weight indicates importance.

RULES
1. Do not invent placements, yogas, dates, traits or predictions. Use only the evidence and the
   chart_facts supplied. Dates may only come from the dasha/transit facts provided.
2. Every section and prediction must cite evidence_ids that exist in the input.
3. Frame everything as traditional Jyotish interpretation ("traditionally", "in Jyotish"), never as
   scientific fact or certainty. Do not give advice or instructions of any kind (medical, legal,
   financial or lifestyle); describe traditional tendencies only.
4. When evidence conflicts (for example a strong and a weak indicator for the same area), say so
   and explain which carries more weight and why.
5. Address the reader as "you". Never show evidence IDs, snake_case or field names in prose.
6. If birth_time_unknown is true, do not discuss the ascendant or houses.

WRITE
- headline: an evocative 5-10 word title for the chart.
- overview: 3-5 graceful sentences synthesising ascendant, Moon sign, nakshatra and key yogas.
- sections: for each of personality, career, relationships, finance, health, spirituality that has
  evidence: {"key", "title" (a short evocative title), "text" (2-4 sentences), "evidence_ids"}.
- current_period: {"text": 2-3 sentences on the running dasha and transits, "evidence_ids"}.
- predictions: 3-6 items: {"area", "text" (one clear, cautious traditional prediction),
  "timing" (a date range only from the supplied dasha/transit facts, else ""),
  "reasoning" (1-2 sentences explaining which chart factors lead to it and why),
  "confidence" ("high" when several weighty evidence items agree, "medium" when one strong item
  supports it, "low" when evidence is thin or mixed), "evidence_ids"}.

Return ONE JSON object:
{"headline": "", "overview": "", "sections": [], "current_period": {"text": "", "evidence_ids": []},
 "predictions": []}
""".strip()


def _ids_clean(item: dict, allowed: set[str]) -> list[str]:
    ids = item.get("evidence_ids", []) if isinstance(item, dict) else []
    return list(dict.fromkeys(i for i in ids if isinstance(i, str) and i in allowed)) if isinstance(ids, list) else []


def interpret(chart: dict, evidence: list[dict], time_unknown: bool) -> dict:
    if not evidence:
        return {"generation_status": "no_source_records"}
    facts = {
        "birth_time_unknown": time_unknown,
        "ascendant": None if time_unknown else chart["lagna"]["sign"],
        "moon_sign": chart["moon_sign"], "sun_sign": chart["sun_sign"],
        "moon_nakshatra": chart["planets"]["Moon"]["nakshatra"]["name"],
        "current_dasha": chart["dasha"].get("current_period"),
        "sade_sati": chart["transits"]["sade_sati"],
        "domain_outlooks": None if time_unknown else {k: {"score": v["score"], "assessment": v["assessment"]} for k, v in chart["domains"].items()},
    }
    payload = {
        "chart_facts": facts,
        "evidence": [{k: e[k] for k in ("evidence_id", "trait", "claim", "polarity", "theme", "basis", "weight")} for e in evidence],
    }
    parsed = generate_json(SYSTEM_PROMPT, payload, max_tokens=2600, temperature=0.4, cache_namespace="astrology.reading.v1")
    allowed = {e["evidence_id"] for e in evidence}

    sections = []
    for item in parsed.get("sections", []) if isinstance(parsed.get("sections"), list) else []:
        ids = _ids_clean(item, allowed)
        if ids and isinstance(item.get("text"), str):
            sections.append({"key": str(item.get("key", "")), "title": normalize_text(str(item.get("title", ""))),
                             "text": normalize_text(item["text"]), "evidence_ids": ids})
    predictions = []
    for item in parsed.get("predictions", []) if isinstance(parsed.get("predictions"), list) else []:
        ids = _ids_clean(item, allowed)
        if ids and isinstance(item.get("text"), str):
            confidence = item.get("confidence") if item.get("confidence") in ("high", "medium", "low") else "low"
            predictions.append({
                "area": str(item.get("area", "")), "text": normalize_text(item["text"]),
                "timing": normalize_text(str(item.get("timing") or "")),
                "reasoning": normalize_text(str(item.get("reasoning") or "")),
                "confidence": confidence, "evidence_ids": ids,
            })
    current = parsed.get("current_period") if isinstance(parsed.get("current_period"), dict) else {}
    current_ids = _ids_clean(current, allowed)
    return {
        "headline": normalize_text(str(parsed.get("headline") or "")),
        "overview": normalize_text(str(parsed.get("overview") or "")),
        "sections": sections,
        "current_period": {"text": normalize_text(str(current.get("text") or "")), "evidence_ids": current_ids} if current_ids else None,
        "predictions": predictions,
        "generation_status": "generated",
    }


def build_reading(
    db: Session, *, full_name: str, date_of_birth: date, time_of_birth: time | None,
    latitude: float, longitude: float, tz: str | None, place_name: str | None, owner_key: str | None,
) -> dict:
    time_unknown = time_of_birth is None
    tz = tz or timezone_for(latitude, longitude)
    local = datetime.combine(date_of_birth, time_of_birth or time(12, 0))
    chart = calculate_chart(BirthData(local, latitude, longitude, tz))
    evidence = collect_evidence(db, chart, time_unknown)

    interpretation: dict = {"generation_status": "llm_not_configured"}
    if llm_available():
        try:
            interpretation = interpret(chart, evidence, time_unknown)
        except Exception:
            logger.exception("Astrology interpretation failed")
            interpretation = {"generation_status": "generation_failed"}

    result = {
        "full_name": full_name, "place_name": place_name, "birth_time_unknown": time_unknown,
        "chart": chart, "evidence": evidence, "interpretation": interpretation,
        "conventions": CONVENTIONS,
        "disclaimer": (
            "Vedic astrology is a traditional system of interpretation, not a scientifically validated "
            "predictor of personality or events. Positions are computed astronomically; their meanings are "
            "paraphrased classical significations." + (" Birth time unknown: noon was used, so the ascendant, "
            "houses and house-based yogas are not interpreted." if time_unknown else "")
        ),
    }
    row = AstrologyChart(
        user_id=owner_key, full_name=full_name, birth_datetime_local=local.isoformat(timespec="minutes"),
        place_name=place_name, latitude=latitude, longitude=longitude, timezone=tz,
        result_json=json.dumps(result, ensure_ascii=False, default=str),
    )
    db.add(row)
    db.commit()
    result["chart_id"] = row.id
    return result
