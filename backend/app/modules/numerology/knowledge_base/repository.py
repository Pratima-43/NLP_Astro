from sqlalchemy import or_, select
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
    """Retrieve source-backed records in priority order without mixing components.

    Compound birth-date records are returned first for Moolank, followed by
    component-specific records, general number records, and requested contextual
    records. Both legacy NULL contexts and the guide's explicit "general" context
    are treated as non-contextual records.
    """
    query = select(NumerologyKnowledgeRecord).where(
        NumerologyKnowledgeRecord.number == number
    )
    if target_year is not None:
        query = query.where(
            or_(
                NumerologyKnowledgeRecord.target_year.is_(None),
                NumerologyKnowledgeRecord.target_year == target_year,
            )
        )

    default_context = or_(
        NumerologyKnowledgeRecord.context.is_(None),
        NumerologyKnowledgeRecord.context == "general",
    )

    compound_query = None
    if component == "moolank" and compound_number is not None:
        compound_query = query.where(
            NumerologyKnowledgeRecord.numerology_component == "moolank",
            NumerologyKnowledgeRecord.compound_number == compound_number,
            or_(
                NumerologyKnowledgeRecord.context.is_(None),
                NumerologyKnowledgeRecord.context == "birth_date_compound",
            ),
        )

    component_query = query.where(
        NumerologyKnowledgeRecord.numerology_component == component,
        NumerologyKnowledgeRecord.compound_number.is_(None),
        default_context,
    )
    general_query = None
    if component != "personal_year":
        general_query = query.where(
            NumerologyKnowledgeRecord.numerology_component == "general",
            default_context,
        )

    results: list[NumerologyKnowledgeRecord] = []
    seen: set[str] = set()
    ordered_queries = [
    q
    for q in (
        compound_query,
        component_query,
        general_query if component != "personal_year" else None,
        )
    if q is not None
    ]
    for current_query in ordered_queries:
        for record in db.scalars(
            current_query.order_by(NumerologyKnowledgeRecord.record_id)
        ):
            if record.record_id not in seen:
                results.append(record)
                seen.add(record.record_id)

    if context:
        allowed_components = (
            [component]
            if component == "personal_year"
            else [component, "general"]
        )

        contextual_query = query.where(
            NumerologyKnowledgeRecord.context == context,
            NumerologyKnowledgeRecord.numerology_component.in_(
                allowed_components
            ),
        )

        for record in db.scalars(
            contextual_query.order_by(NumerologyKnowledgeRecord.record_id)
        ):
            if record.record_id not in seen:
                results.append(record)
                seen.add(record.record_id)

    return results
