"""Synchronise every source-backed knowledge base from its JSON seed file.

Seeding is idempotent: new records are inserted, changed records are updated in place, and records
removed from a seed file are deleted, so the database always mirrors the reviewed seed files.
"""
import json
from pathlib import Path
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import KnowledgeClaim, NumerologyKnowledgeRecord

MODULES_DIR = Path(__file__).resolve().parents[1] / "modules"
NUMEROLOGY_SEED = MODULES_DIR / "numerology" / "knowledge_base" / "seed_records.json"
CLAIM_SEEDS = {
    "vedic_astrology": MODULES_DIR / "vedic_astrology" / "knowledge_base" / "seed_claims.json",
    "palmistry": MODULES_DIR / "palmistry" / "knowledge_base" / "seed_claims.json",
}


def _sync(db: Session, model: Any, records: list[dict[str, Any]], scope: Any = None) -> dict[str, int]:
    query = select(model)
    if scope is not None:
        query = query.where(scope)
    existing = {row.record_id: row for row in db.scalars(query)}
    stats = {"inserted": 0, "updated": 0, "deleted": 0}
    seen: set[str] = set()
    for item in records:
        record_id = item["record_id"]
        if record_id in seen:
            raise ValueError(f"Duplicate record_id in seed file: {record_id}")
        seen.add(record_id)
        row = existing.get(record_id)
        if row is None:
            db.add(model(**item))
            stats["inserted"] += 1
            continue
        changed = False
        for key, value in item.items():
            if getattr(row, key) != value:
                setattr(row, key, value)
                changed = True
        stats["updated"] += int(changed)
    for record_id, row in existing.items():
        if record_id not in seen:
            db.delete(row)
            stats["deleted"] += 1
    return stats


def sync_all(db: Session) -> dict[str, dict[str, int]]:
    report = {
        "numerology": _sync(db, NumerologyKnowledgeRecord, json.loads(NUMEROLOGY_SEED.read_text(encoding="utf-8"))),
    }
    for system, path in CLAIM_SEEDS.items():
        if not path.exists():
            continue
        records = [{**item, "system": system} for item in json.loads(path.read_text(encoding="utf-8"))]
        report[system] = _sync(db, KnowledgeClaim, records, KnowledgeClaim.system == system)
    db.commit()
    return report
