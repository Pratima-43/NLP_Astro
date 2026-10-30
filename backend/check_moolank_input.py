from app.db.session import SessionLocal
from app.modules.numerology.knowledge_base.repository import retrieve_records
from app.modules.numerology.interpretation_generator import _clean_records

db = SessionLocal()

try:
    records = retrieve_records(
        db,
        component="moolank",
        number=6,
        compound_number=15,
    )

    record_dicts = [
        {
            "record_id": r.record_id,
            "number": r.number,
            "compound_number": r.compound_number,
            "numerology_component": r.numerology_component,
            "context": r.context,
            "category": r.category,
            "trait": r.trait,
            "claim": r.claim,
            "polarity": r.polarity,
            "source_name": r.source_name,
            "source_url": r.source_url,
            "verification_status": r.verification_status,
            "claim_type": r.claim_type,
        }
        for r in records
    ]

    cleaned = _clean_records(record_dicts)

    print("Records retrieved:", len(records))
    print("Records sent to generator:", len(cleaned))
    print("Total claim characters:", sum(len(r["claim"]) for r in cleaned))
    print("\nExact cleaned records:")

    for r in cleaned:
        print(r["record_id"], "| claim length:", len(r["claim"]), "|", repr(r["claim"]))
finally:
    db.close()
