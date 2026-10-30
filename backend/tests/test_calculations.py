from datetime import date
import pytest
from app.modules.numerology.calculations import (
    calculate_bhagyank, calculate_moolank, calculate_namank,
    calculate_personal_year, reduce_to_digit, reduction_chain,
)


def test_moolank_keeps_compound_birth_day():
    result = calculate_moolank(27)
    assert (result["birth_day"], result["compound_number"], result["number"]) == (27, 27, 9)
    assert result["planet"] == "Mars"
    assert calculate_moolank(9)["compound_number"] is None


@pytest.mark.parametrize("day,expected", [(9, 9), (18, 9), (27, 9), (29, 2), (31, 4), (19, 1)])
def test_moolank_table_from_guide(day, expected):
    assert calculate_moolank(day)["number"] == expected


@pytest.mark.parametrize("dob,expected", [
    (date(2005, 8, 14), 2), (date(2003, 11, 5), 3), (date(2004, 2, 29), 1),
    (date(1999, 12, 31), 8), (date(2001, 8, 27), 2),
])
def test_bhagyank_worked_examples_from_guide(dob, expected):
    assert calculate_bhagyank(dob)["number"] == expected


def test_chaldean_name_mapping_from_guide():
    result = calculate_namank("LAKSHMI")
    assert (result["compound_number"], result["number"]) == (19, 1)
    john = calculate_namank("JOHN")
    assert (john["compound_number"], john["number"]) == (18, 9)


def test_spelling_changes_namank():
    assert (calculate_namank("ISHAAN")["compound_number"], calculate_namank("ISHAAN")["number"]) == (16, 7)
    assert (calculate_namank("ISHAN")["compound_number"], calculate_namank("ISHAN")["number"]) == (15, 6)


def test_namank_ignores_punctuation_and_counts_digits():
    assert calculate_namank("Haldiram's")["compound_number"] == calculate_namank("Haldirams")["compound_number"]
    studio = calculate_namank("Studio 3")
    assert (studio["compound_number"], studio["number"]) == (28, 1)


def test_personal_year_example_from_guide():
    result = calculate_personal_year(date(2005, 8, 14), 2026)
    assert result["number"] == 5
    assert result["planet"] is None


def test_invalid_names_are_rejected_instead_of_guessed():
    with pytest.raises(ValueError):
        calculate_namank("José")
    with pytest.raises(ValueError):
        calculate_namank("   ")
    with pytest.raises(ValueError):
        calculate_namank("'-.")


def test_reduce_to_digit():
    assert reduce_to_digit(35) == 8
    assert reduction_chain(29) == [29, 11, 2]
