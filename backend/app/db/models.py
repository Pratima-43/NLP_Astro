from datetime import date, datetime, timezone
from sqlalchemy import Date, DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class NumerologyKnowledgeRecord(Base):
    __tablename__ = "numerology_knowledge_records"
    __table_args__ = (
        UniqueConstraint("record_id", name="uq_numerology_knowledge_record_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    record_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    number: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    compound_number: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    planet: Mapped[str | None] = mapped_column(String(80), nullable=True)
    numerology_component: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    target_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    context: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    category: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    trait: Mapped[str] = mapped_column(String(200), nullable=False)
    claim: Mapped[str] = mapped_column(Text, nullable=False)
    polarity: Mapped[str | None] = mapped_column(String(20), nullable=True)
    source_name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_wording: Mapped[str | None] = mapped_column(Text, nullable=True)
    claim_type: Mapped[str] = mapped_column(String(50), nullable=False, default="traditional_interpretation")
    verification_status: Mapped[str] = mapped_column(String(50), nullable=False, default="source_provided")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))


class NumerologyReport(Base):
    __tablename__ = "numerology_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    target_year: Mapped[int] = mapped_column(Integer, nullable=False)
    result_json: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
