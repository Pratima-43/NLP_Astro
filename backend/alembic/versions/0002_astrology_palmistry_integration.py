"""Add cross-system knowledge claims, astrology charts, palm readings, chat and combined reports."""
from alembic import op
import sqlalchemy as sa

revision = "0002_multi_system"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def _timestamps() -> sa.Column:
    return sa.Column("created_at", sa.DateTime(timezone=True), nullable=False)


def upgrade() -> None:
    # Indexes declared on the numerology model but missing from 0001.
    op.create_index("ix_numerology_knowledge_records_category", "numerology_knowledge_records", ["category"])
    op.create_index("ix_numerology_knowledge_records_id", "numerology_knowledge_records", ["id"])

    op.create_table(
        "knowledge_claims",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("record_id", sa.String(100), nullable=False),
        sa.Column("system", sa.String(40), nullable=False),
        sa.Column("feature_key", sa.String(80), nullable=False),
        sa.Column("condition", sa.String(80), nullable=True),
        sa.Column("theme", sa.String(60), nullable=False),
        sa.Column("category", sa.String(80), nullable=False),
        sa.Column("trait", sa.String(200), nullable=False),
        sa.Column("claim", sa.Text(), nullable=False),
        sa.Column("polarity", sa.String(20), nullable=True),
        sa.Column("source_name", sa.String(255), nullable=False),
        sa.Column("source_url", sa.Text(), nullable=True),
        sa.Column("source_wording", sa.Text(), nullable=True),
        sa.Column("claim_type", sa.String(50), nullable=False),
        sa.Column("verification_status", sa.String(50), nullable=False),
        _timestamps(),
        sa.UniqueConstraint("record_id", name="uq_knowledge_claims_record_id"),
    )
    for column in ("record_id", "system", "feature_key", "condition", "theme"):
        op.create_index(f"ix_knowledge_claims_{column}", "knowledge_claims", [column])

    op.create_table(
        "llm_cache",
        sa.Column("cache_key", sa.String(64), primary_key=True),
        sa.Column("namespace", sa.String(60), nullable=False),
        sa.Column("response_json", sa.Text(), nullable=False),
        _timestamps(),
    )
    op.create_index("ix_llm_cache_namespace", "llm_cache", ["namespace"])

    op.create_table(
        "astrology_charts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.String(128), nullable=True),
        sa.Column("full_name", sa.String(200), nullable=False),
        sa.Column("birth_datetime_local", sa.String(40), nullable=False),
        sa.Column("place_name", sa.String(255), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("timezone", sa.String(64), nullable=False),
        sa.Column("result_json", sa.Text(), nullable=False),
        _timestamps(),
    )
    op.create_index("ix_astrology_charts_user_id", "astrology_charts", ["user_id"])

    op.create_table(
        "palm_readings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.String(128), nullable=True),
        sa.Column("hand", sa.String(10), nullable=False),
        sa.Column("image_sha256", sa.String(64), nullable=False),
        sa.Column("detector", sa.String(40), nullable=False),
        sa.Column("result_json", sa.Text(), nullable=False),
        _timestamps(),
    )
    op.create_index("ix_palm_readings_user_id", "palm_readings", ["user_id"])

    op.create_table(
        "chat_sessions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.String(128), nullable=True),
        sa.Column("title", sa.String(200), nullable=False),
        _timestamps(),
    )
    op.create_index("ix_chat_sessions_user_id", "chat_sessions", ["user_id"])

    op.create_table(
        "chat_messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("session_id", sa.Integer(), sa.ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("payload_json", sa.Text(), nullable=True),
        _timestamps(),
    )
    op.create_index("ix_chat_messages_session_id", "chat_messages", ["session_id"])

    op.create_table(
        "combined_reports",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.String(128), nullable=True),
        sa.Column("numerology_report_id", sa.Integer(), sa.ForeignKey("numerology_reports.id", ondelete="SET NULL"), nullable=True),
        sa.Column("astrology_chart_id", sa.Integer(), sa.ForeignKey("astrology_charts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("palm_reading_id", sa.Integer(), sa.ForeignKey("palm_readings.id", ondelete="SET NULL"), nullable=True),
        sa.Column("result_json", sa.Text(), nullable=False),
        _timestamps(),
    )
    op.create_index("ix_combined_reports_user_id", "combined_reports", ["user_id"])


def downgrade() -> None:
    for table in ("combined_reports", "chat_messages", "chat_sessions", "palm_readings", "astrology_charts", "llm_cache"):
        op.drop_table(table)
    for column in ("theme", "condition", "feature_key", "system", "record_id"):
        op.drop_index(f"ix_knowledge_claims_{column}", table_name="knowledge_claims")
    op.drop_table("knowledge_claims")
    op.drop_index("ix_numerology_knowledge_records_id", table_name="numerology_knowledge_records")
    op.drop_index("ix_numerology_knowledge_records_category", table_name="numerology_knowledge_records")
