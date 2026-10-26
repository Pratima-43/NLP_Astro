from datetime import date
import re

# Chaldean mapping specified in Numerology Guide.pdf. Do not replace with Pythagorean mapping.
CHALDEAN_VALUES: dict[str, int] = {
    **dict.fromkeys("AIJQY", 1),
    **dict.fromkeys("BKR", 2),
    **dict.fromkeys("CGLS", 3),
    **dict.fromkeys("DMT", 4),
    **dict.fromkeys("EHNX", 5),
    **dict.fromkeys("UVW", 6),
    **dict.fromkeys("OZ", 7),
    **dict.fromkeys("FP", 8),
}


def reduce_to_digit(value: int) -> int:
    if value < 0:
        raise ValueError("Cannot reduce a negative number.")
    while value >= 10:
        value = sum(int(char) for char in str(value))
    return value


def calculate_moolank(birth_day: int) -> dict:
    if isinstance(birth_day, bool) or not isinstance(birth_day, int) or not 1 <= birth_day <= 31:
        raise ValueError("Birth day must be an integer from 1 to 31.")
    return {
        "birth_day": birth_day,
        "compound_number": birth_day if birth_day >= 10 else None,
        "number": reduce_to_digit(birth_day),
    }


def calculate_bhagyank(dob: date) -> dict:
    digits = f"{dob.day:02d}{dob.month:02d}{dob.year:04d}"
    total = sum(int(digit) for digit in digits)
    return {
        "date_of_birth": dob.isoformat(),
        "digit_sum": total,
        "number": reduce_to_digit(total),
    }


def calculate_namank(name: str) -> dict:
    normalized = " ".join(name.split()).upper()
    if not normalized:
        raise ValueError("Name cannot be blank.")
    unsupported = sorted(set(re.sub(r"[A-Z ]", "", normalized)))
    if unsupported:
        raise ValueError(
            "Name contains unsupported characters: " + ", ".join(unsupported)
            + ". Use Latin letters and spaces; transliteration rules are not defined in the guide."
        )
    letter_values = [{"letter": char, "value": CHALDEAN_VALUES[char]} for char in normalized if char != " "]
    compound_total = sum(item["value"] for item in letter_values)
    if compound_total <= 0:
        raise ValueError("Name must contain at least one Latin letter.")
    return {
        "name": name,
        "normalized_name": normalized,
        "letter_values": letter_values,
        "compound_number": compound_total,
        "number": reduce_to_digit(compound_total),
        "mapping": "Chaldean",
    }


def calculate_personal_year(dob: date, target_year: int) -> dict:
    if not 1900 <= target_year <= 2200:
        raise ValueError("Target year must be between 1900 and 2200.")
    day_reduced = reduce_to_digit(dob.day)
    month_reduced = reduce_to_digit(dob.month)
    year_digit_sum = sum(int(digit) for digit in str(target_year))
    year_reduced = reduce_to_digit(year_digit_sum)
    total = day_reduced + month_reduced + year_reduced
    return {
        "birth_day": dob.day,
        "birth_month": dob.month,
        "target_year": target_year,
        "reduced_day": day_reduced,
        "reduced_month": month_reduced,
        "reduced_target_year": year_reduced,
        "number": reduce_to_digit(total),
    }


def calculate_all(full_name: str, dob: date, target_year: int) -> dict:
    return {
        "full_name": full_name,
        "date_of_birth": dob.isoformat(),
        "target_year": target_year,
        "components": {
            "moolank": calculate_moolank(dob.day),
            "bhagyank": calculate_bhagyank(dob),
            "namank": calculate_namank(full_name),
            "personal_year": calculate_personal_year(dob, target_year),
        },
        "disclaimer": (
            "Numerology interpretations are traditional beliefs and are not scientifically established "
            "personality assessments or predictions."
        ),
    }
