# AstroVerse backend

FastAPI backend for the existing Next.js frontend. The first implemented domain module is Numerology; Vedic Astrology, Palmistry, and cross-system integration have explicit module boundaries for later work.

## Structure

```text
backend/
  app/
    api/                 API router composition
    auth/                Supabase JWT verification boundary
    core/                environment-backed configuration
    db/                  SQLAlchemy models, engine, sessions
    modules/
      numerology/        calculations, schemas, service, routes
        knowledge_base/  source-backed records and retrieval
      vedic_astrology/   reserved domain module
      palmistry/         reserved domain module
      integration/       reserved cross-system comparison module
    payments/            entitlement boundary; provider webhook not fabricated
    main.py
  alembic/               schema migrations
  tests/
```

## Run locally (Windows PowerShell)

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
# In a second terminal, from backend/: python seed_knowledge.py
```

Open `http://localhost:8000/docs` for Swagger UI and `http://localhost:8000/health` for the health check. In development, tables are created automatically when `AUTO_CREATE_TABLES=true`. For a migration-managed database, set `AUTO_CREATE_TABLES=false`, then run `alembic upgrade head` from the `backend` directory.

## Supabase PostgreSQL

1. In Supabase, open **Project Settings → Database → Connection string**.
2. Copy a PostgreSQL URI. Prefer the **Session Pooler** if your machine/network cannot connect to the direct host (common on IPv4-only networks). Keep the password URL-encoded if it contains reserved URL characters.
3. Set `DATABASE_URL` in `backend/.env`; use the PostgreSQL URI from Supabase. Do not commit `.env`.
4. Set `AUTO_CREATE_TABLES=false`, then run `alembic upgrade head`.
5. Seed only the records currently supported by the guide with `python seed_knowledge.py`.

`DATABASE_URL` is read only by the backend. Never expose a database password or Supabase service-role key in a `NEXT_PUBLIC_*` variable. SQLAlchemy uses the `psycopg` driver and `pool_pre_ping=True`.

## API

`POST /api/v1/numerology/calculate`

```json
{
  "full_name": "Lakshmi",
  "date_of_birth": "2005-08-14",
  "target_year": 2026,
  "context": null
}
```

The response contains Moolank, Bhagyank, Namank, and Personal Year calculations plus separately labelled knowledge records and an interpretation-coverage status. Empty interpretations mean the guide does not currently supply a matching record; the service does not invent one.

`GET /api/v1/numerology/knowledge?number=9&component=personal_year`

## Calculation rules from Numerology Guide.pdf

- **Moolank:** reduce the birth day to one digit; retain a two-digit birth day as `compound_number`.
- **Bhagyank:** add the digits of the complete birth date and reduce to one digit.
- **Namank:** use the Chaldean mapping documented in the guide; retain both the compound total and reduced digit. Unsupported non-Latin characters are rejected rather than silently mapped.
- **Personal Year:** reduce the birth day, birth month, and target-year digit sum, add them, then reduce to one digit.
- Interpretations are traditional beliefs, not scientifically established assessments or predictions.

The initial seed includes only the Personal Year themes explicitly listed for 1–9 in the guide. It intentionally does not fabricate missing component-specific claims, planetary mappings, URLs, or scientific verification.

## Supabase Auth and payments

`app/auth/supabase.py` contains bearer-token verification for Supabase JWTs and is ready to be used as a FastAPI dependency once the frontend uses Supabase Auth. The current frontend still uses demo/localStorage authentication; this ZIP does not pretend that demo login is secure or silently migrate it. Payment provider integration requires the chosen provider, product/price IDs, and webhook secret. `app/payments/service.py` provides a server-side entitlement boundary but does not activate premium access based on client-side state.

## Tests

From `backend` run `pytest -q`. Tests cover the calculation examples documented in the guide.
