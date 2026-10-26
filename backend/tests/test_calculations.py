from datetime import date
import pytest
from app.modules.numerology.calculations import (
    calculate_bhagyank, calculate_moolank, calculate_namank,
    calculate_personal_year, reduce_to_digit,
)


def test_moolank_keeps_compound_birth_day():
    assert calculate_moolank(27) == {"birth_day": 27, "compound_number": 27, "number": 9}
    assert calculate_moolank(9)["compound_number"] is None


def test_bhagyank_uses_full_date():
    assert calculate_bhagyank(date(2005, 8, 14))["number"] == 2


def test_chaldean_name_mapping_from_guide():
    result = calculate_namank("LAKSHMI")
    assert result["compound_number"] == 19
    assert result["number"] == 1
    john = calculate_namank("JOHN")
    assert john["compound_number"] == 18
    assert john["number"] == 9


def test_personal_year_example_from_guide():
    result = calculate_personal_year(date(2005, 8, 14), 2026)
    assert result["number"] == 5


def test_invalid_names_are_rejected_instead_of_guessed():
    with pytest.raises(ValueError):
        calculate_namank("José")
    with pytest.raises(ValueError):
        calculate_namank("   ")


def test_reduce_to_digit():
    assert reduce_to_digit(35) == 8
