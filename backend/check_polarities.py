from collections import Counter
from app.db.session import SessionLocal
from app.db.models import NumerologyKnowledgeRecord

db = SessionLocal()

try:
    records = db.query(NumerologyKnowledgeRecord).all()
    counts = Counter(
        (record.polarity or "").strip().lower() or "(empty)"
        for record in records
    )

    print("Total knowledge records:", len(records))
    print("\nPolarity distribution:")
    for polarity, count in sorted(counts.items()):
        print(f"{polarity}: {count}")

    print("\nSample records tagged with challenge-like polarity:")
    challenge_labels = {"negative", "challenge", "weakness"}

    samples = [
        record for record in records
        if (record.polarity or "").strip().lower() in challenge_labels
    ][:10]

    for record in samples:
        print(
            record.record_id,
            "|", repr(record.polarity),
            "|", (record.claim or "")[:100],
        )
finally:
    db.close()
