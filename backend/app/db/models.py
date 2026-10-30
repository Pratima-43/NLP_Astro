from datetime import date, datetime, timezone
from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    """An AstroVerse account. `id` doubles as the owner key on every saved reading.

    Local accounts store a salted scrypt hash; Supabase accounts (id prefixed `sb_`) have no
    password here because Supabase Auth verifies them.
    """

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    auth_provider: Mapped[str] = mapped_column(String(20), nullable=False, default="local")
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    time_of_birth: Mapped[str | None] = mapped_column(String(5), nullable=True)
    time_of_birth_unknown: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    place_of_birth: Mapped[str | None] = mapped_column(String(255), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(30), nullable=True)
    dominant_hand: Mapped[str] = mapped_column(String(10), nullable=False, default="right")
    onboarded: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    premium_plan: Mapped[str] = mapped_column(String(60), nullable=False, default="Free Standard Tier")
    premium_activated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    premium_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    coupon_used: Mapped[str | None] = mapped_column(String(40), nullable=True)
    # JSON object of notification switches (see app.auth.accounts.NOTIFICATION_DEFAULTS).
    notification_prefs: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Access tokens issued before this moment are rejected (set on password change/reset).
    password_changed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now, onupdate=_now)


class PasswordResetToken(Base):
    """One-time password reset link. Only the SHA-256 of the emailed token is stored."""

    __tablename__ = "password_reset_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now)


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
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now)


class NumerologyReport(Base):
    __tablename__ = "numerology_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    target_year: Mapped[int] = mapped_column(Integer, nullable=False)
    result_json: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now)


class KnowledgeClaim(Base):
    """Source-attributed claims for Vedic Astrology and Palmistry.

    Uses the same provenance fields as the numerology knowledge base so the integration layer
    can compare claims across systems. `feature_key` identifies what the claim is about
    (for example `planet:saturn`, `house:10`, `line:heart`), `condition` narrows it
    (for example `exalted`, `curved`, `developed`), and `theme` is the shared cross-system
    theme used by the chatbot (career, relationships, ...).
    """

    __tablename__ = "knowledge_claims"
    __table_args__ = (UniqueConstraint("record_id", name="uq_knowledge_claims_record_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    record_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    system: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    feature_key: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    condition: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    theme: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    trait: Mapped[str] = mapped_column(String(200), nullable=False)
    claim: Mapped[str] = mapped_column(Text, nullable=False)
    polarity: Mapped[str | None] = mapped_column(String(20), nullable=True)
    source_name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_wording: Mapped[str | None] = mapped_column(Text, nullable=True)
    claim_type: Mapped[str] = mapped_column(String(50), nullable=False, default="traditional_interpretation")
    verification_status: Mapped[str] = mapped_column(String(50), nullable=False, default="classical_paraphrase")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now)


class LLMCacheEntry(Base):
    """Validated model output keyed by a hash of (prompt version, model, grounded input).

    Readings are written person-agnostically, so identical evidence produces a reusable answer and
    the project stays within Groq's tokens-per-minute limits.
    """

    __tablename__ = "llm_cache"

    cache_key: Mapped[str] = mapped_column(String(64), primary_key=True)
    namespace: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    response_json: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now)


class AstrologyChart(Base):
    __tablename__ = "astrology_charts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    birth_datetime_local: Mapped[str] = mapped_column(String(40), nullable=False)
    place_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), nullable=False)
    result_json: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now)


class PalmReading(Base):
    """Derived palm features only; the uploaded photo itself is not stored."""

    __tablename__ = "palm_readings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    hand: Mapped[str] = mapped_column(String(10), nullable=False)
    image_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    detector: Mapped[str] = mapped_column(String(40), nullable=False)
    result_json: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now)


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now)


class ChatMessageRecord(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    # Assistant answers keep the structured answer, module contributions and cited claims.
    payload_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now)


class CombinedReport(Base):
    __tablename__ = "combined_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    numerology_report_id: Mapped[int | None] = mapped_column(ForeignKey("numerology_reports.id", ondelete="SET NULL"), nullable=True)
    astrology_chart_id: Mapped[int | None] = mapped_column(ForeignKey("astrology_charts.id", ondelete="SET NULL"), nullable=True)
    palm_reading_id: Mapped[int | None] = mapped_column(ForeignKey("palm_readings.id", ondelete="SET NULL"), nullable=True)
    result_json: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now)
