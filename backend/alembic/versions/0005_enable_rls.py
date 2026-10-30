"""Enable row level security on every application table (PostgreSQL / Supabase only).

Supabase exposes the public schema through its REST API to anyone holding the anon key. The backend
connects as the table owner and bypasses RLS, so enabling RLS with no policies blocks that API path
without affecting the app. Newer Supabase projects enable RLS automatically; this makes it explicit.
"""
from alembic import op

revision = "0005_enable_rls"
down_revision = "0004_account_security"
branch_labels = None
depends_on = None

TABLES = (
    "users", "password_reset_tokens", "numerology_knowledge_records", "numerology_reports", "knowledge_claims",
    "llm_cache", "astrology_charts", "palm_readings", "chat_sessions", "chat_messages", "combined_reports", "alembic_version",
)


def upgrade() -> None:
    if op.get_bind().dialect.name != "postgresql":
        return
    for table in TABLES:
        op.execute(f'ALTER TABLE "{table}" ENABLE ROW LEVEL SECURITY')


def downgrade() -> None:
    if op.get_bind().dialect.name != "postgresql":
        return
    for table in TABLES:
        op.execute(f'ALTER TABLE "{table}" DISABLE ROW LEVEL SECURITY')
