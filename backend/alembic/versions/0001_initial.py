"""Create numerology knowledge and report tables."""
from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "numerology_knowledge_records",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("record_id", sa.String(100), nullable=False),
        sa.Column("number", sa.Integer(), nullable=False),
        sa.Column("compound_number", sa.Integer(), nullable=True),
        sa.Column("planet", sa.String(80), nullable=True),
        sa.Column("numerology_component", sa.String(40), nullable=False),
        sa.Column("target_year", sa.Integer(), nullable=True),
        sa.Column("context", sa.String(100), nullable=True),
        sa.Column("category", sa.String(80), nullable=False),
        sa.Column("trait", sa.String(200), nullable=False),
        sa.Column("claim", sa.Text(), nullable=False),
        sa.Column("polarity", sa.String(20), nullable=True),
        sa.Column("source_name", sa.String(255), nullable=False),
        sa.Column("source_url", sa.Text(), nullable=True),
        sa.Column("source_wording", sa.Text(), nullable=True),
        sa.Column("claim_type", sa.String(50), nullable=False),
        sa.Column("verification_status", sa.String(50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("record_id", name="uq_numerology_knowledge_record_id"),
    )
    for column in ("record_id", "number", "compound_number", "numerology_component", "context"):
        op.create_index(f"ix_numerology_knowledge_records_{column}", "numerology_knowledge_records", [column])
    op.create_table(
        "numerology_reports",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.String(128), nullable=True),
        sa.Column("full_name", sa.String(200), nullable=False),
        sa.Column("date_of_birth", sa.Date(), nullable=False),
        sa.Column("target_year", sa.Integer(), nullable=False),
        sa.Column("result_json", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_numerology_reports_id", "numerology_reports", ["id"])
    op.create_index("ix_numerology_reports_user_id", "numerology_reports", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_numerology_reports_user_id", table_name="numerology_reports")
    op.drop_index("ix_numerology_reports_id", table_name="numerology_reports")
    op.drop_table("numerology_reports")
    for column in ("context", "numerology_component", "compound_number", "number", "record_id"):
        op.drop_index(f"ix_numerology_knowledge_records_{column}", table_name="numerology_knowledge_records")
    op.drop_table("numerology_knowledge_records")
