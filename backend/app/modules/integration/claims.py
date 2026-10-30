"""Unified, comparable claim pool built from each module's latest saved reading.

Every claim keeps its module, source record, evidence layer and weight, and is tagged with a
shared cross-system theme. Theme tags let the chatbot route a question to relevant claims from all
three systems, and weights make each module's contribution to an answer computable.
"""
from __future__ import annotations

import json
import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import AstrologyChart, NumerologyReport, PalmReading

THEMES = {
    "personality": "Personality & temperament",
    "career": "Career & purpose",
    "relationships": "Love & relationships",
    "finance": "Wealth & material life",
    "health": "Vitality & wellbeing",
    "education": "Mind & learning",
    "communication": "Expression & communication",
    "creativity": "Creativity & imagination",
    "leadership": "Leadership & drive",
    "emotions": "Emotional life",
    "spirituality": "Spirituality & meaning",
    "family": "Home & family",
    "timing": "Timing & the year ahead",
}

# Keyword routing for questions and for numerology categories (which predate the shared themes).
THEME_KEYWORDS = {
    "career": ["career", "job", "work", "business", "profession", "promotion", "office", "employ", "boss", "startup", "success", "status", "labour", "service", "enterprise"],
    "relationships": ["love", "marriage", "marry", "partner", "relationship", "spouse", "romance", "dating", "husband", "wife", "affection", "partnership", "social", "loyal"],
    "finance": ["money", "wealth", "finance", "financial", "income", "rich", "invest", "salary", "debt", "property", "material", "spend", "gain"],
    "health": ["health", "vitality", "energy", "illness", "body", "wellbeing", "stamina", "fitness"],
    "education": ["study", "exam", "education", "learn", "intellect", "intelligen", "mind", "knowledge", "research", "analy", "think", "perception"],
    "communication": ["communicat", "speech", "speak", "writ", "express", "talk", "eloquen", "public"],
    "creativity": ["creativ", "art", "music", "imagin", "design", "beauty", "aesthetic"],
    "leadership": ["leader", "authority", "ambition", "independen", "confiden", "courage", "initiative", "recognition", "visib", "command", "drive", "power"],
    "emotions": ["emotion", "feel", "mood", "anxiet", "stress", "sensitiv", "temper", "calm", "worry", "nervous", "intuition", "restless"],
    "spirituality": ["spiritual", "faith", "dharma", "meditat", "purpose", "karma", "soul", "religio", "devotion", "philosoph", "wisdom"],
    "family": ["family", "mother", "father", "home", "children", "child", "sibling", "parent"],
    "timing": ["this year", "next year", "year", "when", "future", "upcoming", "period", "month", "2025", "2026", "2027", "2028", "timing", "change", "transition", "beginning"],
    "personality": ["personality", "who am i", "nature", "character", "trait", "strength", "weakness", "temperament", "myself", "self"],
}

NUMEROLOGY_LAYER_WEIGHTS = {"component_specific": 1.0, "compound_birth_date": 0.9, "context_specific": 0.7, "general_number": 0.55}
COMPONENT_LABELS = {"moolank": "Moolank", "bhagyank": "Bhagyank", "namank": "Namank", "personal_year": "Personal Year"}


# Keywords match at word starts, so "art" matches "artistic" but not "heart".
_THEME_PATTERNS = {
    theme: re.compile(r"\b(?:" + "|".join(re.escape(w) for w in words) + ")", re.IGNORECASE)
    for theme, words in THEME_KEYWORDS.items()
}


def themes_for_text(text: str) -> list[str]:
    return [theme for theme, pattern in _THEME_PATTERNS.items() if pattern.search(text)]


def _latest(db: Session, model, owner_key: str | None, row_id: int | None):
    if row_id is not None:
        row = db.get(model, row_id)
        # Readings are private: a reading requested by id must belong to the caller.
        return row if row is not None and owner_key and row.user_id == owner_key else None
    if not owner_key:
        return None
    return db.scalar(select(model).where(model.user_id == owner_key).order_by(model.id.desc()).limit(1))


def load_sources(db: Session, owner_key: str | None, ids: dict[str, int | None] | None = None) -> dict:
    ids = ids or {}
    sources = {}
    for key, model in (("numerology", NumerologyReport), ("astrology", AstrologyChart), ("palmistry", PalmReading)):
        row = _latest(db, model, owner_key, ids.get(key))
        sources[key] = (row.id, json.loads(row.result_json)) if row else None
    return sources


def _numerology_claims(report: dict) -> list[dict]:
    claims = []
    for component, records in report.get("interpretations", {}).items():
        number = report["components"][component]["number"]
        for record in records:
            text = f"{record['category']} {record['trait']} {record['claim']}"
            themes = themes_for_text(text.replace("_", " ")) or ["personality"]
            if component == "personal_year":
                themes = list(dict.fromkeys(["timing", *themes]))
            claims.append({
                "claim_id": f"N:{record['record_id']}",
                "module": "numerology",
                "record_id": record["record_id"],
                "themes": themes,
                "trait": record["trait"],
                "claim": record["claim"],
                "polarity": record.get("polarity"),
                "basis": f"{COMPONENT_LABELS[component]} {number} ({record.get('evidence_layer', 'general_number').replace('_', ' ')})",
                "weight": NUMEROLOGY_LAYER_WEIGHTS.get(record.get("evidence_layer", "general_number"), 0.5),
                "source_name": record.get("source_name"),
            })
    return claims


def _evidence_claims(module: str, prefix: str, evidence: list[dict]) -> list[dict]:
    claims = []
    for item in evidence:
        text = f"{item.get('trait', '')} {item.get('claim', '')}"
        themes = list(dict.fromkeys([item.get("theme") or "personality", *themes_for_text(text)]))
        claims.append({
            "claim_id": f"{prefix}:{item['evidence_id']}",
            "module": module,
            "record_id": item["record_id"],
            "themes": themes,
            "trait": item["trait"],
            "claim": item["claim"],
            "polarity": item.get("polarity"),
            "basis": item.get("basis"),
            "weight": float(item.get("weight", 0.5)),
            "source_name": item.get("source_name"),
        })
    return claims


def build_claim_pool(sources: dict) -> dict[str, list[dict]]:
    pool = {"numerology": [], "astrology": [], "palmistry": []}
    if sources.get("numerology"):
        pool["numerology"] = _numerology_claims(sources["numerology"][1])
    if sources.get("astrology"):
        pool["astrology"] = _evidence_claims("astrology", "A", sources["astrology"][1].get("evidence", []))
    if sources.get("palmistry"):
        pool["palmistry"] = _evidence_claims("palmistry", "P", sources["palmistry"][1].get("evidence", []))
    return pool


def select_relevant(pool: dict[str, list[dict]], themes: list[str], per_module: int = 12) -> dict[str, list[dict]]:
    """Rank each module's claims by theme match x weight; with no theme, take the strongest claims."""
    selected = {}
    for module, claims in pool.items():
        def score(claim: dict) -> float:
            if not themes:
                return claim["weight"]
            overlap = len(set(claim["themes"]) & set(themes))
            return claim["weight"] * (1.0 + overlap) if overlap else claim["weight"] * 0.15
        ranked = sorted(claims, key=score, reverse=True)
        chosen = [c for c in ranked if not themes or set(c["themes"]) & set(themes)][:per_module]
        if len(chosen) < 4:  # keep some context even when a module has no direct match
            chosen += [c for c in ranked if c not in chosen][: 4 - len(chosen)]
        selected[module] = chosen
    return selected


def contributions(cited_ids: list[str], selected: dict[str, list[dict]]) -> list[dict]:
    """Share of the answer attributable to each module = weight of its cited claims / total cited weight."""
    by_id = {c["claim_id"]: c for claims in selected.values() for c in claims}
    totals = {module: {"weight": 0.0, "cited": 0} for module in selected}
    for claim_id in dict.fromkeys(cited_ids):
        claim = by_id.get(claim_id)
        if claim:
            totals[claim["module"]]["weight"] += claim["weight"]
            totals[claim["module"]]["cited"] += 1
    grand = sum(t["weight"] for t in totals.values())
    out = []
    for module, t in totals.items():
        percent = round(100 * t["weight"] / grand) if grand else 0
        out.append({"module": module, "percent": percent, "cited_claims": t["cited"],
                    "available_claims": len(selected[module]), "weight": round(t["weight"], 2)})
    drift = 100 - sum(o["percent"] for o in out) if grand else 0
    if drift and out:
        max(out, key=lambda o: o["weight"])["percent"] += drift
    return out


_ID_PATTERN = re.compile(r"^[NAP]:[A-Za-z0-9_\-]+$")


def valid_ids(raw, allowed: set[str]) -> list[str]:
    if not isinstance(raw, list):
        return []
    return list(dict.fromkeys(i for i in raw if isinstance(i, str) and _ID_PATTERN.match(i) and i in allowed))
