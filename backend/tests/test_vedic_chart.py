from datetime import datetime, timezone

import pytest

from app.modules.vedic_astrology.chart import BirthData, calculate_chart, dignity, vimshottari

J2000 = BirthData(datetime(2000, 1, 1, 12, 0), 51.4769, 0.0, "UTC")
NOW = datetime(2026, 10, 28, tzinfo=timezone.utc)


@pytest.fixture(scope="module")
def chart():
    return calculate_chart(J2000, now_utc=NOW)


def test_lahiri_ayanamsa_at_j2000(chart):
    assert chart["birth"]["ayanamsa_lahiri"] == pytest.approx(23.857, abs=0.01)


def test_sidereal_positions_match_reference_ephemeris(chart):
    planets = chart["planets"]
    # Sidereal (Lahiri) longitudes at J2000 cross-checked against published ephemerides.
    assert planets["Sun"]["sign"] == "Sagittarius" and planets["Sun"]["degree"] == pytest.approx(16.5, abs=0.2)
    assert planets["Moon"]["sign"] == "Libra"
    assert planets["Saturn"]["sign"] == "Aries" and planets["Saturn"]["dignity"] == "debilitated"
    assert planets["Ketu"]["longitude"] == pytest.approx((planets["Rahu"]["longitude"] + 180) % 360, abs=1e-6)


def test_whole_sign_houses_follow_lagna(chart):
    lagna = chart["lagna"]["sign_index"]
    for planet in chart["planets"].values():
        assert planet["house"] == (planet["sign_index"] - lagna) % 12 + 1


def test_dignity_rules():
    assert dignity("Sun", 0, 10) == "exalted"
    assert dignity("Sun", 6, 10) == "debilitated"
    assert dignity("Sun", 4, 10) == "moolatrikona"
    assert dignity("Sun", 4, 25) == "own_sign"
    assert dignity("Saturn", 4, 10) == "enemy_sign"


def test_vimshottari_covers_120_years_and_one_active_period(chart):
    dasha = chart["dasha"]
    assert sum(m["years"] for m in dasha["mahadashas"][:9]) == 120
    assert sum(m["is_active"] for m in dasha["mahadashas"]) == 1
    assert dasha["current_period"] is not None


def test_vimshottari_starts_from_moon_nakshatra_lord():
    # 0° Aries is the start of Ashwini (Ketu), so a full 7-year Ketu balance remains.
    result = vimshottari(0.0001, datetime(2000, 1, 1, tzinfo=timezone.utc), NOW)
    assert result["starting_lord"] == "Ketu"
    assert result["balance_at_birth_years"] == pytest.approx(7, abs=0.01)


def test_domains_report_their_factors(chart):
    for outlook in chart["domains"].values():
        assert 5 <= outlook["score"] <= 95
        assert outlook["factors"]
