from fastapi import APIRouter
from app.auth.password_router import router as password_router
from app.auth.router import router as auth_router
from app.modules.integration.router import router as integration_router
from app.modules.numerology.router import router as numerology_router
from app.modules.palmistry.router import router as palmistry_router
from app.modules.vedic_astrology.router import router as astrology_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(password_router)
api_router.include_router(numerology_router)
api_router.include_router(astrology_router)
api_router.include_router(palmistry_router)
api_router.include_router(integration_router)
