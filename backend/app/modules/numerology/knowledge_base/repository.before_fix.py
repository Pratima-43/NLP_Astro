from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db.models import NumerologyKnowledgeRecord


def retrieve_records(
    db: Session,
    *,
    component: str,
    number: int,
    compound_number: int | None = None,
    context: str | None = None,
    target_year: int | None = None,
) -> list[NumerologyKnowledgeRecord]:
    """Return source-backed records in explicit priority order, without mixing components."""
    query = select(NumerologyKnowledgeRecord).where(NumerologyKnowledgeRecord.number == number)
    if target_year is not None:
        query = query.where(
            (NumerologyKnowledgeRecord.target_year.is_(None))
            | (NumerologyKnowledgeRecord.target_year == target_year)
        )
    if component == "moolank" and compound_number is not None:
        compound = query.where(
            NumerologyKnowledgeRecord.numerology_component == "moolank",
            NumerologyKnowledgeRecord.compound_number == compound_number,
            NumerologyKnowledgeRecord.context.is_(None),
        )
        component_records = query.where(
            NumerologyKnowledgeRecord.numerology_component == "moolank",
            NumerologyKnowledgeRecord.compound_number.is_(None),
            NumerologyKnowledgeRecord.context.is_(None),
        )
    else:
        compound = None
        component_records = query.where(
            NumerologyKnowledgeRecord.numerology_component == component,
            NumerologyKnowledgeRecord.context.is_(None),
        )
    general_records = query.where(
        NumerologyKnowledgeRecord.numerology_component == "general",
        NumerologyKnowledgeRecord.context.is_(None),
    )

    results: list[NumerologyKnowledgeRecord] = []
    seen: set[str] = set()
    ordered_queries = [q for q in (compound, component_records, general_records) if q is not None]
    for q in ordered_queries:
        for record in db.scalars(q.order_by(NumerologyKnowledgeRecord.record_id)):
            if record.record_id not in seen:
                results.append(record)
                seen.add(record.record_id)
    if context:
        contextual = query.where(
            NumerologyKnowledgeRecord.context == context,
            NumerologyKnowledgeRecord.numerology_component.in_([component, "general"]),
        )
        for record in db.scalars(contextual.order_by(NumerologyKnowledgeRecord.record_id)):
            if record.record_id not in seen:
                results.append(record)
                seen.add(record.record_id)
    return results
