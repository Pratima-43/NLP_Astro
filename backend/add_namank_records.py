import json
from pathlib import Path

path = Path("app/modules/numerology/knowledge_base/seed_records.json")

with path.open("r", encoding="utf-8") as f:
    records = json.load(f)

new_records = [
    {
        "record_id": "NUM-01-NAMANK-001",
        "number": 1,
        "compound_number": None,
        "planet": "Sun",
        "numerology_component": "namank",
        "target_year": None,
        "context": "general",
        "category": "public_visibility",
        "trait": "visibility",
        "claim": "Namank 1 is traditionally associated with visibility when it works with the other numbers.",
        "polarity": "positive",
        "source_name": "Swami Acharya",
        "source_url": "https://swamiacharya.com/en/learn/numerology/number-1-meaning-numerology",
        "source_wording": "Name number 1 can support visibility, popularity, and public memory when it works with the other numbers.",
        "claim_type": "traditional_interpretation",
        "verification_status": "source_provided"
    },
    {
        "record_id": "NUM-01-NAMANK-002",
        "number": 1,
        "compound_number": None,
        "planet": "Sun",
        "numerology_component": "namank",
        "target_year": None,
        "context": "general",
        "category": "popularity",
        "trait": "popularity",
        "claim": "Namank 1 is traditionally associated with popularity when it works with the other numbers.",
        "polarity": "positive",
        "source_name": "Swami Acharya",
        "source_url": "https://swamiacharya.com/en/learn/numerology/number-1-meaning-numerology",
        "source_wording": "Name number 1 can support visibility, popularity, and public memory when it works with the other numbers.",
        "claim_type": "traditional_interpretation",
        "verification_status": "source_provided"
    },
    {
        "record_id": "NUM-01-NAMANK-003",
        "number": 1,
        "compound_number": None,
        "planet": "Sun",
        "numerology_component": "namank",
        "target_year": None,
        "context": "general",
        "category": "public_recognition",
        "trait": "public_memory",
        "claim": "Namank 1 is traditionally associated with being remembered by the public when it works with the other numbers.",
        "polarity": "positive",
        "source_name": "Swami Acharya",
        "source_url": "https://swamiacharya.com/en/learn/numerology/number-1-meaning-numerology",
        "source_wording": "Name number 1 can support visibility, popularity, and public memory when it works with the other numbers.",
        "claim_type": "traditional_interpretation",
        "verification_status": "source_provided"
    },
    {
        "record_id": "NUM-08-NAMANK-001",
        "number": 8,
        "compound_number": None,
        "planet": "Saturn",
        "numerology_component": "namank",
        "target_year": None,
        "context": "general",
        "category": "number_compatibility",
        "trait": "compatibility_with_1_3_6",
        "claim": "Namank 8 is considered favourable mainly when supported by Psychic or Destiny Numbers 1, 3, or 6.",
        "polarity": "conditional",
        "source_name": None,
        "source_url": None,
        "source_wording": "The supplied source considers Name Number 8 favourable mainly when supported by Psychic or Destiny Numbers 1, 3, or 6.",
        "claim_type": "traditional_interpretation",
        "verification_status": "source_provided"
    },
    {
        "record_id": "NUM-09-NAMANK-001",
        "number": 9,
        "compound_number": None,
        "planet": "Mars",
        "numerology_component": "namank",
        "target_year": None,
        "context": "general",
        "category": "number_harmony",
        "trait": "harmonizing_numbers",
        "claim": "Namank 9 may help harmonize the Psychic and Destiny Numbers when chosen carefully.",
        "polarity": "conditional",
        "source_name": None,
        "source_url": None,
        "source_wording": "The supplied article suggests that Name Number 9 can help harmonize the psychic and destiny numbers when chosen with care.",
        "claim_type": "traditional_interpretation",
        "verification_status": "source_provided"
    }
]

existing_ids = {r["record_id"] for r in records}
to_add = [r for r in new_records if r["record_id"] not in existing_ids]

if to_add:
    records.extend(to_add)

ids = [r["record_id"] for r in records]
if len(ids) != len(set(ids)):
    raise ValueError("Duplicate record IDs detected; file was not saved.")

required_fields = {
    "record_id", "number", "compound_number", "planet",
    "numerology_component", "target_year", "context", "category",
    "trait", "claim", "polarity", "source_name", "source_url",
    "source_wording", "claim_type", "verification_status"
}

for record in records:
    missing = required_fields - record.keys()
    if missing:
        raise ValueError(f"{record.get('record_id')} is missing fields: {missing}")

with path.open("w", encoding="utf-8") as f:
    json.dump(records, f, indent=4, ensure_ascii=False)
    f.write("\n")

print("Records added:", len(to_add))
print("Total JSON records:", len(records))
print("Duplicate IDs: none")
print("JSON validation: passed")
