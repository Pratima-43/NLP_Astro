# AstroVerse / NLP_Astro

AstroVerse reads a person through **Vedic numerology**, **Vedic astrology** and **palmistry**, then compares what the three systems say. Each reading is calculated deterministically, interpreted only from a source-backed knowledge base, and shows its full calculation on request. A chatbot and a combined report answer questions from all three readings, with each system's contribution shown.

- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, in the repository root.
- **Backend:** FastAPI, SQLAlchemy 2 and Alembic, in [`backend/`](backend/README.md). It runs on Supabase PostgreSQL, or SQLite for local work.
- **AI:** Groq, which writes readings from the cited evidence only.

## Run locally (Windows PowerShell)

Backend, in one terminal:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env      # set GROQ_API_KEY, AUTH_SECRET_KEY, DATABASE_URL
alembic upgrade head             # when DATABASE_URL points at Supabase/Postgres
python seed_knowledge.py
uvicorn app.main:app --port 8000
```

Frontend, in a second terminal from the repository root:

```powershell
npm ci
Copy-Item .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`. API docs are at `http://localhost:8000/docs`. Unlock Premium (Your Full Story and Ask a Question) with the code `ASTROFREE` on the Premium page.

`.env.local` holds only browser-visible values. Never put database passwords, the Groq key, `AUTH_SECRET_KEY` or a Supabase service-role key in a `NEXT_PUBLIC_*` variable.

## How the app flows

The web app is built for anyone, from children to grandparents: large legible type (Lexend headings, Atkinson Hyperlegible body), a text-size switch, read-aloud on every summary, big buttons, plain words with the Sanskrit term in brackets, and one clear next step on every page.

| Step | Page | What happens |
|---|---|---|
| Welcome | `/` | What AstroVerse is, how it works, questions people ask |
| Account | `/signup`, `/login`, `/forgot-password`, `/reset-password` | Name, email, password |
| Setup | `/setup` | One question per screen: name, birthday, birth time (or "I don't know"), birth place, writing hand, then a check screen |
| Home | `/home` | "Your path": five numbered steps with their status and the next one highlighted |
| 1 · Numbers | `/numbers` | Numerology from the saved details, one button |
| 2 · Stars | `/stars` | Vedic birth chart from the saved details, one button |
| 3 · Hand | `/hand` | Pick the hand, take or choose a palm photo, read it |
| 4 · Full Story | `/story` | Premium: the three readings compared, saved for next time |
| 5 · Ask | `/ask` | Premium: questions in your own words, answered from your readings |
| Me | `/me` | Details, text size, Premium, emails, password, sign out, delete account |

Every reading page has the same shape: an "In short" summary you can listen to, the key facts, good things and things to watch, then "How we worked this out" (sums, measurements and book sources) folded away. Old addresses (`/dashboard/*`, `/onboarding`, `/pricing`) redirect to the new ones.

## What's included

| Area | Details |
|---|---|
| Numerology | Moolank, Bhagyank, Namank (Chaldean), Personal Year, from the research team's Numerology Guide |
| Vedic astrology | Swiss Ephemeris (Lahiri), whole-sign houses, dignities, yogas, Vimshottari dashas, transits, North-Indian chart |
| Palmistry | MediaPipe hand landmarks, crease tracing of 5 lines, 9 mounts, hand shape; Cheiro's *Palmistry for All* |
| Integration | Chatbot and combined report with per-module contribution percentages |
| Accounts | Sign up and sign in, forgot/reset password by email, change password, delete account, notification preferences |
| Premium | Server-side coupon redemption |
| Reports | "Save as PDF" on every reading and on the combined report |
| Pages | About, Privacy Policy, Terms of Service |

See [`backend/README.md`](backend/README.md) for method notes, the API table, Supabase setup, email (SMTP) configuration and migrations.

## Checks

```powershell
npx tsc --noEmit; npm run lint; npm run build      # frontend
cd backend; python -m pytest -q; alembic check      # backend
```

Numerology, astrology and palmistry are traditional practices, not scientifically validated methods. The app presents them as reflection and entertainment.
