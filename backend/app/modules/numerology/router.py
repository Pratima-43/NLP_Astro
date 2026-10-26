from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db.models import NumerologyKnowledgeRecord
from app.db.session import get_db
from app.modules.numerology.schemas import KnowledgeRecordOut, NumerologyCalculateRequest
from app.modules.numerology.service import build_report

router = APIRouter(prefix="/numerology", tags=["Numerology"])


@router.post("/calculate")
def calculate(payload: NumerologyCalculateRequest, db: Session = Depends(get_db)) -> dict:
    if payload.date_of_birth > date.today():
        raise HTTPException(status_code=422, detail="Date of birth cannot be in the future.")
    try:
        return build_report(db, payload.full_name, payload.date_of_birth, payload.target_year, payload.context)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/knowledge", response_model=list[KnowledgeRecordOut])
def list_knowledge(
    number: int = Query(ge=1, le=9),
    component: str = Query(pattern="^(general|moolank|bhagyank|namank|personal_year)$"),
    context: str | None = None,
    db: Session = Depends(get_db),
) -> list[NumerologyKnowledgeRecord]:
    query = select(NumerologyKnowledgeRecord).where(
        NumerologyKnowledgeRecord.number == number,
        NumerologyKnowledgeRecord.numerology_component == component,
    )
    if context:
        query = query.where((NumerologyKnowledgeRecord.context.is_(None)) | (NumerologyKnowledgeRecord.context == context))
    return list(db.scalars(query.order_by(NumerologyKnowledgeRecord.record_id)))
