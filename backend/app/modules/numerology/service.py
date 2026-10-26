from datetime import date
from sqlalchemy.orm import Session
from app.modules.numerology.calculations import calculate_all
from app.modules.numerology.knowledge_base.repository import retrieve_records


COMPONENT_LABELS = {
    "moolank": "Moolank (Psychic Number)",
    "bhagyank": "Bhagyank (Destiny Number)",
    "namank": "Namank (Name Number)",
    "personal_year": "Personal Year Number",
}


def build_report(db: Session, full_name: str, dob: date, target_year: int, context: str | None = None) -> dict:
    result = calculate_all(full_name, dob, target_year)
    retrieved: dict[str, list[dict]] = {}
    for component, calculation in result["components"].items():
        records = retrieve_records(
            db,
            component=component,
            number=calculation["number"],
            compound_number=calculation.get("compound_number"),
            context=context,
            target_year=target_year if component == "personal_year" else None,
        )
        retrieved[component] = [
            {
                "record_id": record.record_id,
                "number": record.number,
                "compound_number": record.compound_number,
                "planet": record.planet,
                "numerology_component": record.numerology_component,
                "target_year": record.target_year,
                "context": record.context,
                "category": record.category,
                "trait": record.trait,
                "claim": record.claim,
                "polarity": record.polarity,
                "source_name": record.source_name,
                "source_url": record.source_url,
                "source_wording": record.source_wording,
                "claim_type": record.claim_type,
                "verification_status": record.verification_status,
            }
            for record in records
        ]
    result["interpretations"] = retrieved
    result["interpretation_coverage"] = {
        component: ("source_records_available" if records else "no_source_record_available")
        for component, records in retrieved.items()
    }
    return result
