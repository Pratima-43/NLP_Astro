from app.db.session import SessionLocal
from app.modules.numerology.knowledge_base.repository import retrieve_records

db = SessionLocal()

try:
    tests = [
        ("personal_year", 4, None, 2026),
        ("moolank", 6, 15, None),
    ]

    for component, number, compound_number, target_year in tests:
        records = retrieve_records(
            db,
            component=component,
            number=number,
            compound_number=compound_number,
            target_year=target_year,
        )

        print(f"\n{component}: {len(records)} records")

        for record in records:
            print(
                record.record_id,
                "|", record.numerology_component,
                "|", record.context,
                "|", (record.claim or "")[:100],
            )
finally:
    db.close()
