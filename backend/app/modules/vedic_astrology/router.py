from datetime import date, time
import json

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, model_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.identity import Identity, get_identity
from app.db.models import AstrologyChart
from app.db.session import get_db
from app.modules.vedic_astrology.service import build_reading, geocode, timezone_for

router = APIRouter(prefix="/astrology", tags=["Vedic Astrology"])


class ChartRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=200)
    date_of_birth: date
    time_of_birth: time | None = Field(default=None, description="Local clock time; omit when unknown.")
    place_name: str | None = Field(default=None, max_length=255)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    timezone: str | None = Field(default=None, max_length=64)

    @model_validator(mode="after")
    def _location(self) -> "ChartRequest":
        if (self.latitude is None) != (self.longitude is None):
            raise ValueError("Provide both latitude and longitude, or neither.")
        if self.latitude is None and not self.place_name:
            raise ValueError("Provide a birth place or coordinates.")
        if self.date_of_birth > date.today():
            raise ValueError("Date of birth cannot be in the future.")
        return self


@router.get("/geocode")
def geocode_place(q: str = Query(min_length=2, max_length=200)) -> list[dict]:
    try:
        return geocode(q.strip())
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Place lookup is unavailable right now; enter coordinates instead.") from exc


@router.post("/chart")
def chart(payload: ChartRequest, db: Session = Depends(get_db), identity: Identity = Depends(get_identity)) -> dict:
    latitude, longitude, tz, place = payload.latitude, payload.longitude, payload.timezone, payload.place_name
    if latitude is None:
        try:
            matches = geocode(payload.place_name.strip())
        except Exception as exc:
            raise HTTPException(status_code=503, detail="Place lookup is unavailable right now; enter coordinates instead.") from exc
        if not matches:
            raise HTTPException(status_code=422, detail=f"Could not find '{payload.place_name}'. Try a nearby city or enter coordinates.")
        latitude, longitude, tz, place = matches[0]["latitude"], matches[0]["longitude"], matches[0]["timezone"], matches[0]["name"]
    try:
        tz = tz or timezone_for(latitude, longitude)
        return build_reading(
            db, full_name=payload.full_name.strip(), date_of_birth=payload.date_of_birth,
            time_of_birth=payload.time_of_birth, latitude=latitude, longitude=longitude, tz=tz,
            place_name=place, owner_key=identity.owner_key,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/latest")
def latest(db: Session = Depends(get_db), identity: Identity = Depends(get_identity)) -> dict:
    if not identity.owner_key:
        raise HTTPException(status_code=404, detail="No saved chart.")
    row = db.scalar(select(AstrologyChart).where(AstrologyChart.user_id == identity.owner_key).order_by(AstrologyChart.id.desc()).limit(1))
    if row is None:
        raise HTTPException(status_code=404, detail="No saved chart.")
    return {**json.loads(row.result_json), "chart_id": row.id}
