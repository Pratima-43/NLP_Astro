import json

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.identity import Identity, get_identity
from app.core.config import settings
from app.db.models import PalmReading
from app.db.session import get_db
from app.modules.palmistry.service import build_reading
from app.modules.palmistry.vision import PalmImageError

router = APIRouter(prefix="/palmistry", tags=["Palmistry"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/analyze")
async def analyze(
    image: UploadFile = File(...),
    hand: str = Form("right", pattern="^(left|right)$"),
    db: Session = Depends(get_db),
    identity: Identity = Depends(get_identity),
) -> dict:
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="Upload a JPEG, PNG or WebP photo.")
    data = await image.read(settings.max_upload_mb * 1024 * 1024 + 1)
    if len(data) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"The photo must be under {settings.max_upload_mb} MB.")
    try:
        return build_reading(db, image_bytes=data, hand=hand, owner_key=identity.owner_key)
    except PalmImageError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/latest")
def latest(db: Session = Depends(get_db), identity: Identity = Depends(get_identity)) -> dict:
    if not identity.owner_key:
        raise HTTPException(status_code=404, detail="No saved palm reading.")
    row = db.scalar(select(PalmReading).where(PalmReading.user_id == identity.owner_key).order_by(PalmReading.id.desc()).limit(1))
    if row is None:
        raise HTTPException(status_code=404, detail="No saved palm reading.")
    return {**json.loads(row.result_json), "reading_id": row.id}
