from datetime import date
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.auth.identity import Identity, get_identity
from app.db.models import NumerologyKnowledgeRecord, NumerologyReport
from app.db.session import get_db
from app.modules.numerology.calculations import CHALDEAN_VALUES, NUMBER_PLANETS
from app.modules.numerology.schemas import KnowledgeRecordOut, NumerologyCalculateRequest
from app.modules.numerology.service import build_report

router = APIRouter(prefix="/numerology", tags=["Numerology"])


@router.post("/calculate")
def calculate(
    payload: NumerologyCalculateRequest,
    db: Session = Depends(get_db),
    identity: Identity = Depends(get_identity),
) -> dict:
    if payload.date_of_birth > date.today():
        raise HTTPException(status_code=422, detail="Date of birth cannot be in the future.")
    try:
        return build_report(
            db, payload.full_name, payload.date_of_birth, payload.target_year,
            payload.context, owner_key=identity.owner_key,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/latest")
def latest(db: Session = Depends(get_db), identity: Identity = Depends(get_identity)) -> dict:
    if not identity.owner_key:
        raise HTTPException(status_code=404, detail="No saved numerology report.")
    report = db.scalar(
        select(NumerologyReport).where(NumerologyReport.user_id == identity.owner_key)
        .order_by(NumerologyReport.id.desc()).limit(1)
    )
    if report is None:
        raise HTTPException(status_code=404, detail="No saved numerology report.")
    return {**json.loads(report.result_json), "report_id": report.id}


@router.get("/reference")
def reference() -> dict:
    """The fixed Chaldean table and number-planet reference used by every calculation."""
    table: dict[int, list[str]] = {}
    for letter, value in CHALDEAN_VALUES.items():
        table.setdefault(value, []).append(letter)
    return {"chaldean_table": {str(k): sorted(v) for k, v in sorted(table.items())}, "number_planets": NUMBER_PLANETS}


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
    shared = (NumerologyKnowledgeRecord.context.is_(None)) | (NumerologyKnowledgeRecord.context == "general")
    # A specialised context includes shared and general records plus its own.
    if context and context != "general":
        shared = shared | (NumerologyKnowledgeRecord.context == context)
    return list(db.scalars(query.where(shared).order_by(NumerologyKnowledgeRecord.record_id)))
