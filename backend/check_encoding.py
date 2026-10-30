from app.db.session import SessionLocal
from app.db.models import NumerologyKnowledgeRecord

db = SessionLocal()

try:
    records = db.query(NumerologyKnowledgeRecord).filter(
        NumerologyKnowledgeRecord.record_id.in_([
            "NUM-06-COMP-015-002",
            "NUM-09-CHALLENGE-002",
            "NUM-09-GENERAL-001",
        ])
    ).all()

    for record in records:
        print("\nID:", record.record_id)
        print("Claim repr:", repr(record.claim))
        print("Source wording repr:", repr(record.source_wording))
finally:
    db.close()
