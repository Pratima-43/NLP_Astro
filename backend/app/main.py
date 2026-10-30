from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.seed import sync_all
from app.db.session import SessionLocal, engine
from app.db import models  # noqa: F401 - registers models with SQLAlchemy metadata


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.auto_create_tables and settings.app_env == "development":
        Base.metadata.create_all(bind=engine)
        # Keep local knowledge bases in step with the reviewed seed files.
        with SessionLocal() as db:
            sync_all(db)
    else:
        # Open the first pooled connection now so the first request doesn't pay the handshake.
        with engine.connect() as connection:
            connection.exec_driver_sql("select 1")
    yield


app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/health", tags=["Health"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}
