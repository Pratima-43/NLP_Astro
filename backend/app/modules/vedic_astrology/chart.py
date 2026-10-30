"""Sidereal (Lahiri) birth-chart calculation and rule-based Parashari analysis.

Every derived judgement (dignity, strength, yoga, domain outlook) records the factors that
produced it so the frontend can show the full calculation.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import swisseph as swe

from app.modules.vedic_astrology.constants import (
    COMBUSTION_ORBS, COMBUSTION_ORBS_RETRO, DEBILITATION, DOMAINS, DUSTHANAS, ENEMIES, EXALTATION,
    FRIENDS, HOUSE_NAMES, KENDRAS, MOOLATRIKONA, NAKSHATRA_SPAN, NAKSHATRAS, NATURAL_BENEFICS,
    NATURAL_MALEFICS, OWN_SIGNS, PLANETS, SIGN_ELEMENTS, SIGN_LORDS, SIGN_MODALITIES, SIGN_SANSKRIT,
    SIGNS, TRIKONAS, UPACHAYAS, VIMSHOTTARI_ORDER, VIMSHOTTARI_YEARS,
)

SWE_IDS = {
    "Sun": swe.SUN, "Moon": swe.MOON, "Mars": swe.MARS, "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER, "Venus": swe.VENUS, "Saturn": swe.SATURN, "Rahu": swe.MEAN_NODE,
}
FLAGS = swe.FLG_SIDEREAL | swe.FLG_SPEED | swe.FLG_MOSEPH
YEAR_DAYS = 365.25


@dataclass(frozen=True)
class BirthData:
    local_datetime: datetime  # naive local clock time
    latitude: float
    longitude: float
    timezone: str


def _jd_ut(moment_utc: datetime) -> float:
    hours = moment_utc.hour + moment_utc.minute / 60 + moment_utc.second / 3600
    return swe.julday(moment_utc.year, moment_utc.month, moment_utc.day, hours)


def _fmt_degree(value: float) -> str:
    deg = int(value)
    minutes = int(round((value - deg) * 60))
    if minutes == 60:
        deg, minutes = deg + 1, 0
    return f"{deg}°{minutes:02d}′"


def _nakshatra(longitude: float) -> dict:
    index = int(longitude // NAKSHATRA_SPAN) % 27
    within = longitude - index * NAKSHATRA_SPAN
    name, lord, deity, symbol = NAKSHATRAS[index]
    return {
        "index": index, "name": name, "lord": lord, "deity": deity, "symbol": symbol,
        "pada": int(within // (NAKSHATRA_SPAN / 4)) + 1,
        "fraction_elapsed": within / NAKSHATRA_SPAN,
    }


def sidereal_positions(jd: float) -> dict[str, dict]:
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    positions = {}
    for planet, swe_id in SWE_IDS.items():
        values, _ = swe.calc_ut(jd, swe_id, FLAGS)
        positions[planet] = {"longitude": values[0] % 360, "speed": values[3]}
    rahu = positions["Rahu"]
    positions["Ketu"] = {"longitude": (rahu["longitude"] + 180) % 360, "speed": rahu["speed"]}
    return positions


def dignity(planet: str, sign: int, degree: float) -> str:
    if EXALTATION[planet][0] == sign:
        return "exalted"
    if DEBILITATION[planet][0] == sign:
        return "debilitated"
    mt = MOOLATRIKONA.get(planet)
    if mt and mt[0] == sign and mt[1] <= degree < mt[2]:
        return "moolatrikona"
    if sign in OWN_SIGNS[planet]:
        return "own_sign"
    if planet in ("Rahu", "Ketu"):
        return "neutral"
    lord = SIGN_LORDS[sign]
    if lord in FRIENDS[planet]:
        return "friendly_sign"
    if lord in ENEMIES[planet]:
        return "enemy_sign"
    return "neutral"


DIGNITY_POINTS = {
    "exalted": 2.0, "moolatrikona": 1.5, "own_sign": 1.5, "friendly_sign": 0.5,
    "neutral": 0.0, "enemy_sign": -0.5, "debilitated": -2.0,
}


def _planet_strength(p: dict) -> tuple[float, list[dict]]:
    factors = [{"factor": f"Dignity: {p['dignity'].replace('_', ' ')}", "points": DIGNITY_POINTS[p["dignity"]]}]
    house = p["house"]
    if house in KENDRAS:
        factors.append({"factor": f"In kendra (house {house})", "points": 1.0})
    elif house in TRIKONAS:
        factors.append({"factor": f"In trikona (house {house})", "points": 1.0})
    elif house in DUSTHANAS:
        factors.append({"factor": f"In dusthana (house {house})", "points": -1.0})
    if p["vargottama"]:
        factors.append({"factor": "Vargottama (same sign in D1 and D9)", "points": 1.0})
    if p["combust"]:
        factors.append({"factor": "Combust (too close to the Sun)", "points": -1.0})
    if p["retrograde"] and p["name"] not in ("Rahu", "Ketu"):
        factors.append({"factor": "Retrograde (cheshta strength)", "points": 0.5})
    return sum(f["points"] for f in factors), factors


def _house_from(sign: int, reference_sign: int) -> int:
    return (sign - reference_sign) % 12 + 1


def vimshottari(moon_longitude: float, birth_utc: datetime, now_utc: datetime) -> dict:
    nak = _nakshatra(moon_longitude)
    first_lord = nak["lord"]
    start_index = VIMSHOTTARI_ORDER.index(first_lord)
    balance_years = (1 - nak["fraction_elapsed"]) * VIMSHOTTARI_YEARS[first_lord]
    # The first period began before birth; its notional start lets every sub-period be computed uniformly.
    cursor = birth_utc - timedelta(days=(VIMSHOTTARI_YEARS[first_lord] - balance_years) * YEAR_DAYS)
    mahadashas, current_md, current_ad = [], None, None
    for step in range(10):
        lord = VIMSHOTTARI_ORDER[(start_index + step) % 9]
        years = VIMSHOTTARI_YEARS[lord]
        md_start, md_end = cursor, cursor + timedelta(days=years * YEAR_DAYS)
        antardashas, ad_cursor = [], md_start
        for sub in range(9):
            sub_lord = VIMSHOTTARI_ORDER[(VIMSHOTTARI_ORDER.index(lord) + sub) % 9]
            ad_end = ad_cursor + timedelta(days=years * VIMSHOTTARI_YEARS[sub_lord] / 120 * YEAR_DAYS)
            ad = {"lord": sub_lord, "start": ad_cursor.date().isoformat(), "end": ad_end.date().isoformat(),
                  "is_active": ad_cursor <= now_utc < ad_end}
            if ad["is_active"]:
                current_ad = ad
            antardashas.append(ad)
            ad_cursor = ad_end
        md = {"lord": lord, "years": years, "start": max(md_start, birth_utc).date().isoformat(),
              "end": md_end.date().isoformat(), "is_active": md_start <= now_utc < md_end,
              "antardashas": antardashas}
        if md["is_active"]:
            current_md = md
        mahadashas.append(md)
        cursor = md_end
    return {
        "moon_nakshatra": nak["name"],
        "starting_lord": first_lord,
        "balance_at_birth_years": round(balance_years, 2),
        "mahadashas": mahadashas,
        "current_mahadasha": current_md["lord"] if current_md else None,
        "current_antardasha": current_ad["lord"] if current_ad else None,
        "current_period": (
            {"mahadasha": current_md["lord"], "antardasha": current_ad["lord"],
             "antardasha_start": current_ad["start"], "antardasha_end": current_ad["end"],
             "mahadasha_end": current_md["end"]}
            if current_md and current_ad else None
        ),
    }


def _yogas(planets: dict[str, dict], lagna_sign: int, house_lords: dict[int, str]) -> list[dict]:
    yogas: list[dict] = []
    moon_sign = planets["Moon"]["sign_index"]
    sign_of = {name: p["sign_index"] for name, p in planets.items()}

    def add(key: str, name: str, condition: str, planets_involved: list[str]) -> None:
        yogas.append({"key": key, "name": name, "condition": condition, "planets": planets_involved})

    jup_from_moon = _house_from(sign_of["Jupiter"], moon_sign)
    if jup_from_moon in KENDRAS:
        add("gaja_kesari", "Gaja Kesari Yoga", f"Jupiter is in house {jup_from_moon} from the Moon (a kendra).", ["Jupiter", "Moon"])
    if sign_of["Sun"] == sign_of["Mercury"]:
        add("budha_aditya", "Budha-Aditya Yoga", f"Sun and Mercury share {SIGNS[sign_of['Sun']]}.", ["Sun", "Mercury"])
    if sign_of["Moon"] == sign_of["Mars"]:
        add("chandra_mangala", "Chandra-Mangala Yoga", f"Moon and Mars share {SIGNS[sign_of['Moon']]}.", ["Moon", "Mars"])

    for planet, key, name in (("Mars", "ruchaka", "Ruchaka"), ("Mercury", "bhadra", "Bhadra"),
                              ("Jupiter", "hamsa", "Hamsa"), ("Venus", "malavya", "Malavya"),
                              ("Saturn", "shasha", "Shasha")):
        p = planets[planet]
        if p["house"] in KENDRAS and p["dignity"] in ("exalted", "own_sign", "moolatrikona"):
            add(key, f"{name} Yoga (Pancha Mahapurusha)",
                f"{planet} is {p['dignity'].replace('_', ' ')} in {p['sign']} in house {p['house']} (a kendra).", [planet])

    flanking = [n for n in ("Mars", "Mercury", "Jupiter", "Venus", "Saturn")
                if _house_from(sign_of[n], moon_sign) in (2, 12)]
    second = [n for n in flanking if _house_from(sign_of[n], moon_sign) == 2]
    twelfth = [n for n in flanking if _house_from(sign_of[n], moon_sign) == 12]
    if second and twelfth:
        add("durudhara", "Durudhara Yoga", "Planets occupy both the 2nd and 12th from the Moon.", second + twelfth)
    elif second:
        add("sunapha", "Sunapha Yoga", "Planets (other than the Sun) occupy the 2nd from the Moon.", second)
    elif twelfth:
        add("anapha", "Anapha Yoga", "Planets (other than the Sun) occupy the 12th from the Moon.", twelfth)
    else:
        conjunct = [n for n in ("Mars", "Mercury", "Jupiter", "Venus", "Saturn") if sign_of[n] == moon_sign]
        if not conjunct:
            add("kemadruma", "Kemadruma Yoga",
                "No planet (excluding the Sun and nodes) is in the 2nd, 12th or with the Moon. Many texts list cancelling conditions.", ["Moon"])

    kendra_lords = {house_lords[h] for h in KENDRAS}
    trikona_lords = {house_lords[h] for h in TRIKONAS}
    for planet in kendra_lords & trikona_lords:
        if planet != house_lords[1]:
            add("yogakaraka", f"{planet} as Yogakaraka", f"{planet} rules both a kendra and a trikona from this lagna.", [planet])
    seen_pairs = set()
    for kl in kendra_lords:
        for tl in trikona_lords:
            if kl != tl and sign_of[kl] == sign_of[tl] and frozenset((kl, tl)) not in seen_pairs:
                seen_pairs.add(frozenset((kl, tl)))
                add("raja_yoga", "Raja Yoga (kendra-trikona lords)",
                    f"{kl} (kendra lord) and {tl} (trikona lord) are conjunct in {SIGNS[sign_of[kl]]}.", [kl, tl])
    wealth_lords = {house_lords[2], house_lords[11]}
    for wl in wealth_lords:
        for tl in trikona_lords:
            if wl != tl and sign_of[wl] == sign_of[tl] and frozenset((wl, tl, "dhana")) not in seen_pairs:
                seen_pairs.add(frozenset((wl, tl, "dhana")))
                add("dhana_yoga", "Dhana Yoga", f"{wl} (lord of 2nd/11th) joins {tl} (trikona lord) in {SIGNS[sign_of[wl]]}.", [wl, tl])
    for house in DUSTHANAS:
        lord = house_lords[house]
        if planets[lord]["house"] in DUSTHANAS and planets[lord]["house"] != house:
            add("viparita_raja", "Viparita Raja Yoga", f"Lord of house {house} ({lord}) sits in dusthana house {planets[lord]['house']}.", [lord])

    if planets["Mars"]["house"] in {1, 2, 4, 7, 8, 12}:
        add("mangal_dosha", "Mangal Dosha (Kuja Dosha)",
            f"Mars is in house {planets['Mars']['house']} from the lagna. Traditional texts also list many cancellations.", ["Mars"])

    for name, p in planets.items():
        if p["dignity"] == "debilitated" and name not in ("Rahu", "Ketu"):
            dispositor = SIGN_LORDS[p["sign_index"]]
            disp = planets[dispositor]
            if disp["house"] in KENDRAS or _house_from(disp["sign_index"], moon_sign) in KENDRAS:
                add("neecha_bhanga", "Neecha Bhanga (cancelled debilitation)",
                    f"{name} is debilitated, but its dispositor {dispositor} is in a kendra from the lagna or Moon.", [name, dispositor])
    return yogas


def _domain_outlooks(planets: dict[str, dict], house_lords: dict[int, str], dasha: dict) -> dict[str, dict]:
    occupants: dict[int, list[str]] = {h: [] for h in range(1, 13)}
    for name, p in planets.items():
        occupants[p["house"]].append(name)
    active_lords = {dasha.get("current_mahadasha"), dasha.get("current_antardasha")} - {None}
    outlooks = {}
    for key, domain in DOMAINS.items():
        factors: list[dict] = []
        for house in domain["houses"]:
            lord = house_lords[house]
            factors.append({"factor": f"Lord of house {house} ({lord}) strength", "points": round(planets[lord]["strength"] / 2, 2)})
            for occ in occupants[house]:
                if occ in NATURAL_BENEFICS:
                    factors.append({"factor": f"Benefic {occ} occupies house {house}", "points": 1.0})
                elif house in UPACHAYAS:
                    factors.append({"factor": f"Malefic {occ} in upachaya house {house} (traditionally helpful)", "points": 0.5})
                else:
                    factors.append({"factor": f"Malefic {occ} occupies house {house}", "points": -1.0})
        for karaka in domain["karakas"]:
            factors.append({"factor": f"Karaka {karaka} strength", "points": round(planets[karaka]["strength"] / 3, 2)})
        raw = sum(f["points"] for f in factors)
        score = max(5, min(95, round(50 + raw * 9)))
        label = "strong" if score >= 70 else "supportive" if score >= 55 else "mixed" if score >= 40 else "challenging"
        domain_planets = {house_lords[h] for h in domain["houses"]} | set(domain["karakas"]) | {
            o for h in domain["houses"] for o in occupants[h]
        }
        activated_by = sorted(active_lords & domain_planets)
        outlooks[key] = {
            "label": domain["label"], "score": score, "assessment": label, "houses": domain["houses"],
            "karakas": domain["karakas"], "factors": factors,
            "activated_by_current_dasha": activated_by,
        }
    return outlooks


def _transits(natal_moon_sign: int, lagna_sign: int, now_utc: datetime) -> dict:
    positions = sidereal_positions(_jd_ut(now_utc))
    saturn_sign = int(positions["Saturn"]["longitude"] // 30)
    jupiter_sign = int(positions["Jupiter"]["longitude"] // 30)
    saturn_from_moon = _house_from(saturn_sign, natal_moon_sign)
    phase = {12: "rising (first) phase", 1: "peak (second) phase", 2: "setting (third) phase"}.get(saturn_from_moon)
    return {
        "as_of": now_utc.date().isoformat(),
        "saturn": {"sign": SIGNS[saturn_sign], "house_from_moon": saturn_from_moon, "house_from_lagna": _house_from(saturn_sign, lagna_sign)},
        "jupiter": {"sign": SIGNS[jupiter_sign], "house_from_moon": _house_from(jupiter_sign, natal_moon_sign), "house_from_lagna": _house_from(jupiter_sign, lagna_sign)},
        "sade_sati": {"active": phase is not None, "phase": phase,
                      "rule": "Sade Sati is traditionally counted while Saturn transits the 12th, 1st and 2nd signs from the natal Moon."},
    }


def calculate_chart(birth: BirthData, now_utc: datetime | None = None) -> dict:
    now_utc = now_utc or datetime.now(timezone.utc)
    local = birth.local_datetime.replace(tzinfo=ZoneInfo(birth.timezone))
    birth_utc = local.astimezone(timezone.utc)
    jd = _jd_ut(birth_utc)
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(jd)

    _, ascmc = swe.houses_ex(jd, birth.latitude, birth.longitude, b"W", swe.FLG_SIDEREAL)
    asc_long = ascmc[0] % 360
    lagna_sign = int(asc_long // 30)
    house_lords = {h: SIGN_LORDS[(lagna_sign + h - 1) % 12] for h in range(1, 13)}

    raw = sidereal_positions(jd)
    sun_long = raw["Sun"]["longitude"]
    planets: dict[str, dict] = {}
    for name in PLANETS:
        lon = raw[name]["longitude"]
        sign = int(lon // 30)
        degree = lon - sign * 30
        retro = raw[name]["speed"] < 0 if name not in ("Rahu", "Ketu") else True
        navamsa_sign = int(lon * 9 // 30) % 12
        combust = False
        if name in COMBUSTION_ORBS:
            orb = (COMBUSTION_ORBS_RETRO.get(name) if retro else None) or COMBUSTION_ORBS[name]
            separation = abs((lon - sun_long + 180) % 360 - 180)
            combust = separation <= orb
        planets[name] = {
            "name": name, "longitude": round(lon, 4), "sign_index": sign, "sign": SIGNS[sign],
            "sign_sanskrit": SIGN_SANSKRIT[sign], "degree": round(degree, 4), "degree_label": _fmt_degree(degree),
            "house": _house_from(sign, lagna_sign), "retrograde": retro, "combust": combust,
            "dignity": dignity(name, sign, degree), "nakshatra": _nakshatra(lon),
            "navamsa_sign": SIGNS[navamsa_sign], "vargottama": navamsa_sign == sign,
            "sign_lord": SIGN_LORDS[sign],
            "houses_ruled": sorted(h for h, lord in house_lords.items() if lord == name),
        }
        planets[name]["strength"], planets[name]["strength_factors"] = _planet_strength(planets[name])

    # Paksha: waxing Moon is traditionally benefic, waning Moon less so.
    moon_phase_angle = (raw["Moon"]["longitude"] - sun_long) % 360
    dasha = vimshottari(raw["Moon"]["longitude"], birth_utc, now_utc)
    lagna_degree = asc_long - lagna_sign * 30
    houses = [
        {"house": h, "name": HOUSE_NAMES[h], "sign": SIGNS[(lagna_sign + h - 1) % 12],
         "lord": house_lords[h], "occupants": [n for n, p in planets.items() if p["house"] == h]}
        for h in range(1, 13)
    ]
    return {
        "birth": {
            "local_datetime": birth.local_datetime.isoformat(timespec="minutes"),
            "timezone": birth.timezone, "utc_datetime": birth_utc.isoformat(timespec="minutes"),
            "latitude": birth.latitude, "longitude": birth.longitude, "julian_day_ut": round(jd, 6),
            "ayanamsa_lahiri": round(ayanamsa, 4),
        },
        "lagna": {
            "longitude": round(asc_long, 4), "sign": SIGNS[lagna_sign], "sign_sanskrit": SIGN_SANSKRIT[lagna_sign],
            "sign_index": lagna_sign, "degree_label": _fmt_degree(lagna_degree), "lord": SIGN_LORDS[lagna_sign],
            "element": SIGN_ELEMENTS[lagna_sign], "modality": SIGN_MODALITIES[lagna_sign],
            "nakshatra": _nakshatra(asc_long),
        },
        "moon_sign": SIGNS[planets["Moon"]["sign_index"]],
        "sun_sign": SIGNS[planets["Sun"]["sign_index"]],
        "moon_paksha": "Shukla (waxing)" if moon_phase_angle < 180 else "Krishna (waning)",
        "planets": planets,
        "houses": houses,
        "yogas": _yogas(planets, lagna_sign, house_lords),
        "dasha": dasha,
        "transits": _transits(planets["Moon"]["sign_index"], lagna_sign, now_utc),
        "domains": _domain_outlooks(planets, house_lords, dasha),
    }
