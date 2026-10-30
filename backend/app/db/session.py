from collections.abc import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from app.core.config import settings


def _database_url(url: str) -> str:
    # SQLAlchemy 2.x needs an explicit psycopg driver for the installed PostgreSQL adapter.
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


if settings.database_url.startswith("sqlite"):
    engine = create_engine(settings.database_url, pool_pre_ping=True, connect_args={"check_same_thread": False})
else:
    # Hosted Postgres (Supabase pooler) sits behind a high-latency link: fail fast instead of hanging,
    # keep idle sockets alive, and recycle before the pooler drops them.
    engine = create_engine(
        _database_url(settings.database_url),
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=5,
        pool_recycle=300,
        pool_timeout=30,
        connect_args={"connect_timeout": 15, "keepalives": 1, "keepalives_idle": 30, "keepalives_interval": 10, "keepalives_count": 3},
    )
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
