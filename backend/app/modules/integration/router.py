from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.auth.identity import Identity, get_identity, require_premium
from app.db.session import get_db
from app.modules.integration import service
from app.modules.integration.claims import build_claim_pool, load_sources

router = APIRouter(prefix="/integration", tags=["Integration"])


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    session_id: int | None = None


class ReportRequest(BaseModel):
    numerology_report_id: int | None = None
    astrology_chart_id: int | None = None
    palm_reading_id: int | None = None


@router.post("/chat")
def chat(payload: ChatRequest, db: Session = Depends(get_db), identity: Identity = Depends(require_premium)) -> dict:
    return service.chat(db, owner_key=identity.owner_key, message=payload.message.strip(), session_id=payload.session_id)


@router.get("/chat/history")
def chat_history(db: Session = Depends(get_db), identity: Identity = Depends(require_premium)) -> list[dict]:
    return service.history(db, identity.owner_key)


@router.post("/report")
def report(payload: ReportRequest, db: Session = Depends(get_db), identity: Identity = Depends(require_premium)) -> dict:
    return service.combined_report(db, owner_key=identity.owner_key, ids={
        "numerology": payload.numerology_report_id, "astrology": payload.astrology_chart_id, "palmistry": payload.palm_reading_id,
    })


@router.get("/status")
def status(db: Session = Depends(get_db), identity: Identity = Depends(get_identity)) -> dict:
    """Which module readings exist for this user, and how many comparable claims each provides."""
    sources = load_sources(db, identity.owner_key)
    pool = build_claim_pool(sources)
    return {module: {"available": bool(sources.get(module)), "reading_id": sources[module][0] if sources.get(module) else None,
                     "claims": len(pool[module])} for module in pool}
