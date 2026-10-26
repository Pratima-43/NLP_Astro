import json
from pathlib import Path
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db.models import NumerologyKnowledgeRecord

SEED_FILE = Path(__file__).with_name("seed_records.json")


def seed_knowledge_base(db: Session) -> int:
    """Insert guide-derived records once; existing records are never overwritten."""
    records = json.loads(SEED_FILE.read_text(encoding="utf-8"))
    inserted = 0
    for item in records:
        exists = db.scalar(select(NumerologyKnowledgeRecord.id).where(NumerologyKnowledgeRecord.record_id == item["record_id"]))
        if exists:
            continue
        db.add(NumerologyKnowledgeRecord(**item))
        inserted += 1
    db.commit()
    return inserted
