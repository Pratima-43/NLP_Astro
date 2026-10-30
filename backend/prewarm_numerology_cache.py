"""Pre-generate the person-agnostic Numerology component readings (4 components x 9 numbers).

Component readings depend only on the calculated number and its source records, so caching them
once makes every later report fast and keeps live requests within Groq's tokens-per-minute limit.
Moolank compound birth days (10-31) and business context are cached on first use.

Run from backend/:  python prewarm_numerology_cache.py
"""
from app.db.session import SessionLocal
from app.modules.numerology.calculations import NUMBER_PLANETS
from app.modules.numerology.interpretation_generator import generate_component_interpretation
from app.modules.numerology.knowledge_base.repository import retrieve_records
from app.modules.numerology.service import _record_dict

if __name__ == "__main__":
    with SessionLocal() as db:
        for component in ("moolank", "bhagyank", "namank", "personal_year"):
            for number in range(1, 10):
                records = [_record_dict(r, component) for r in retrieve_records(db, component=component, number=number)]
                calculation = {"number": number, "planet": None if component == "personal_year" else NUMBER_PLANETS[number], "steps": []}
                result = generate_component_interpretation(
                    component=component, number=number, records=records, full_name="",
                    target_year=0, calculation=calculation,
                )
                print(f"{component} {number}: {result['generation_status']} - {result['headline']}")
