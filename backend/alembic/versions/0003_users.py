"""Add user accounts with profile and premium entitlement."""
from alembic import op
import sqlalchemy as sa

revision = "0003_users"
down_revision = "0002_multi_system"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=True),
        sa.Column("auth_provider", sa.String(20), nullable=False),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column("time_of_birth", sa.String(5), nullable=True),
        sa.Column("time_of_birth_unknown", sa.Boolean(), nullable=False),
        sa.Column("place_of_birth", sa.String(255), nullable=True),
        sa.Column("gender", sa.String(30), nullable=True),
        sa.Column("dominant_hand", sa.String(10), nullable=False),
        sa.Column("onboarded", sa.Boolean(), nullable=False),
        sa.Column("premium_plan", sa.String(60), nullable=False),
        sa.Column("premium_activated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("premium_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("coupon_used", sa.String(40), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
