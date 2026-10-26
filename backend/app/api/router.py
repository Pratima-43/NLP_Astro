from fastapi import APIRouter
from app.modules.numerology.router import router as numerology_router

api_router = APIRouter()
api_router.include_router(numerology_router)
