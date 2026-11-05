"""Plain-language profile facts for the combined report.

Each fact pairs a value read from a saved reading (a number, a sign, a dasha period, a palm line)
with a fixed, beginner-friendly explanation of what that concept is in its tradition. The concept
text is deterministic so it is accurate in every report; the model only writes what each fact
means for this person, citing claims.
"""
from __future__ import annotations

from typing import Any

CONCEPTS: dict[str, str] = {
    # Numerology
    "moolank": "Your birthday number (Moolank) comes from the day of the month you were born, added up to one digit. "
               "It shows who you are inside: how you think, how you react and what drives you.",
    "bhagyank": "Your life number (Bhagyank) adds up every digit of your full birth date. "
                "It shows where your life is going: the lessons and chances that keep coming back to you.",
    "namank": "Your name number (Namank) turns each letter of your name into a number and adds them up. "
              "It shows how other people see you.",
    "personal_year": "This year's number (Personal Year) mixes your birthday with the current year, so it changes every year. "
                     "It shows what this one year is about for you.",
    # Vedic astrology
    "lagna": "Your rising sign (Lagna) is the sign that was coming up over the sky at the minute and place you were born. "
             "It shapes how you come across, your body and how you go about life. Its planet matters a lot for you.",
    "moon_sign": "Your sign (Moon sign, or Rashi) is the sign the Moon was in when you were born. "
                 "It shows your mind and feelings, and what makes you feel safe. Indian daily horoscopes use this sign.",
    "sun_sign": "Your Sun sign here uses the star-based zodiac, so it is often one sign before the Western star sign you may know. "
                "The Sun stands for your confidence and what drives you.",
    "nakshatra": "The sky is split into 27 star groups (nakshatras). Your birth star is the one the Moon was in when you were born. "
                 "It adds detail to your sign and sets the order of the times in your life.",
    "dasha": "In Indian astrology, each planet takes a turn to shape your life for some years (a dasha). "
             "Each turn lasts 6 to 20 years and has shorter turns inside it. It shows which part of your chart matters most right now.",
    "yogas": "A special mix (yoga) is when planets sit in a certain way, like two planets in the same sign. "
             "The old books say each mix brings a certain result.",
    "transits": "Transits are where the slow planets are today, compared with your birth chart. Saturn and Jupiter stay in one sign "
                "for a long time, so they show the mood of these years. Sade Sati is Saturn's hard time of about seven and a half "
                "years over your sign. It can feel heavy, but it helps you grow.",
    "domains": "Each part of life, like love, money or work, has its own place in the chart. Its score shows how much your chart "
               "helps that part of life. A higher score means more help.",
    # Palmistry
    "hand_shape": "Palm readers sort hands into four types (earth, air, fire, water) by the shape of the palm and the length of the "
                  "fingers. Your type shows your basic nature.",
    "heart": "The heart line runs across the top of the palm, below the fingers. It shows how you love and show your feelings.",
    "head": "The head line runs across the middle of the palm. It shows how you think: practical or dreamy, focused or wide.",
    "life": "The life line curves around the bottom of the thumb. It does not show how long you will live. "
            "It shows your energy and the big changes in your life.",
    "fate": "The fate line runs up the middle of the palm toward the middle finger. It shows your work and how much outside events "
            "shape your life. Many hands have no clear fate line, which means you shape your own path.",
    "sun": "The sun line runs up toward the ring finger. It shows success and being noticed.",
    "mounts": "The soft pads (mounts) at the bottom of each finger and around the palm each have a planet's name. "
              "A full pad makes that planet's side of you stronger; a flat one makes it smaller.",
    "thumb": "The thumb shows willpower. A long thumb means you are set on what you want and steer your own life.",
}

NUMEROLOGY_LABELS = {"moolank": "Birthday number (Moolank)", "bhagyank": "Life number (Bhagyank)",
                     "namank": "Name number (Namank)", "personal_year": "This year's number (Personal Year)"}
DIGNITY_WORDS = {"exalted": "at its very best", "moolatrikona": "very strong", "own_sign": "at home and strong",
                 "own": "at home and strong", "friendly": "helped by friends", "friendly_sign": "helped by friends",
                 "enemy": "uneasy", "enemy_sign": "uneasy", "debilitated": "weak"}
DOMAIN_WORDS = {"career": "Work", "relationships": "Love", "finance": "Money", "health": "Health", "education": "Learning",
                "family": "Family", "communication": "Speaking up", "spirituality": "Inner peace"}
YOGA_WORDS = {"gaja_kesari": "Moon and Jupiter together", "budha_aditya": "Sun and Mercury together",
              "chandra_mangala": "Moon and Mars together", "ruchaka": "a strong Mars", "bhadra": "a strong Mercury",
              "hamsa": "a strong Jupiter", "malavya": "a strong Venus", "shasha": "a strong Saturn",
              "sunapha": "a planet just after the Moon", "anapha": "a planet just before the Moon",
              "durudhara": "planets on both sides of the Moon", "kemadruma": "a lonely Moon", "yogakaraka": "a lucky planet",
              "raja_yoga": "a pattern for rising up", "dhana_yoga": "a pattern for wealth", "viparita_raja": "good from hard times",
              "mangal_dosha": "Mars and marriage", "neecha_bhanga": "a weak spot that turns strong"}
ASSESSMENT_WORDS = {"strong": "very good", "supportive": "good", "mixed": "up and down", "challenging": "take care"}
PALM_LINE_ORDER = ("heart", "head", "life", "fate", "sun")


def _fact(module: str, key: str, label: str, value: str, concept_key: str | None = None) -> dict[str, Any]:
    return {"module": module, "key": key, "label": label, "value": value, "concept": CONCEPTS[concept_key or key]}


def _date(iso: str | None) -> str:
    """'2029-03-13' -> 'Mar 2029'."""
    if not iso or len(iso) < 7:
        return iso or ""
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return f"{months[int(iso[5:7]) - 1]} {iso[:4]}"


def _numerology_facts(report: dict) -> list[dict]:
    facts = []
    for key, label in NUMEROLOGY_LABELS.items():
        comp = report.get("components", {}).get(key)
        if not comp:
            continue
        value = str(comp["number"])
        if comp.get("compound_number") is not None:
            value += f" (from {comp['compound_number']})"
        if comp.get("planet"):
            value += f" · its planet: {comp['planet']}"
        if key == "personal_year" and report.get("target_year"):
            value += f" · for {report['target_year']}"
        facts.append(_fact("numerology", key, label, value))
    return facts


def _yoga_words(yoga: dict) -> str:
    """'Kemadruma Yoga' -> 'A lonely Moon (Kemadruma Yoga)'."""
    plain = YOGA_WORDS.get(yoga.get("key", ""))
    if not plain:
        return yoga["name"]
    proper = yoga["name"].split(" (")[0]
    return f"{plain[0].upper()}{plain[1:]} ({proper})"


def _astrology_facts(result: dict) -> list[dict]:
    chart = result.get("chart", {})
    facts = []
    lagna = chart.get("lagna")
    if lagna and not result.get("birth_time_unknown"):
        facts.append(_fact("astrology", "lagna", "Rising sign (Lagna)",
                           f"{lagna['sign']} ({lagna.get('sign_sanskrit', '')}), ruled by {lagna.get('lord', '')}"))
    moon = chart.get("planets", {}).get("Moon", {})
    if chart.get("moon_sign"):
        dignity = DIGNITY_WORDS.get(str(moon.get("dignity") or ""), "")
        dignity = f"; the Moon is {dignity} here" if dignity else ""
        facts.append(_fact("astrology", "moon_sign", "Your sign (Moon sign, Rashi)", f"{chart['moon_sign']}{dignity}"))
    if moon.get("nakshatra"):
        n = moon["nakshatra"]
        facts.append(_fact("astrology", "nakshatra", "Birth star (Nakshatra)",
                           f"{n['name']} (part {n.get('pada')} of 4), its planet: {n.get('lord')}"))
    if chart.get("sun_sign"):
        facts.append(_fact("astrology", "sun_sign", "Sun sign (star-based)", chart["sun_sign"]))
    period = chart.get("dasha", {}).get("current_period")
    if period:
        facts.append(_fact("astrology", "dasha", "The time you are in now (dasha)",
                           f"{period['mahadasha']}'s turn until {_date(period.get('mahadasha_end'))}, with a shorter "
                           f"{period['antardasha']} time from {_date(period.get('antardasha_start'))} to {_date(period.get('antardasha_end'))}"))
    yogas = chart.get("yogas") or []
    facts.append(_fact("astrology", "yogas", "Special mixes in your chart (yogas)",
                       "; ".join(dict.fromkeys(_yoga_words(y) for y in yogas)) if yogas else "None of the special mixes we look for"))
    transits = chart.get("transits")
    if transits:
        parts = []
        for planet in ("saturn", "jupiter"):
            t = transits.get(planet)
            if t:
                parts.append(f"{planet.title()} is in {t['sign']}")
        sade = transits.get("sade_sati", {})
        parts.append("Saturn's hard time (Sade Sati) is on now" if sade.get("active") else "Saturn's hard time (Sade Sati) is not on now")
        facts.append(_fact("astrology", "transits", f"Where the slow planets are now ({_date(transits.get('as_of'))})", "; ".join(parts)))
    domains = chart.get("domains")
    if domains:
        facts.append(_fact("astrology", "domains", "Love, money, work and more",
                           "; ".join(f"{DOMAIN_WORDS.get(k, d['label'])} {d['score']} out of 100 ({ASSESSMENT_WORDS.get(d['assessment'], d['assessment'])})"
                                     for k, d in domains.items())))
    return facts


def _palm_facts(result: dict) -> list[dict]:
    analysis = result.get("analysis", {})
    facts = []
    geom = analysis.get("geometry") or {}
    if geom.get("element"):
        facts.append(_fact("palmistry", "hand_shape", "Hand shape",
                           f"{geom['element'].title()} hand ({geom.get('palm_shape', '')} palm, {geom.get('finger_length', '')} fingers)"))
    for key in PALM_LINE_ORDER:
        line = analysis.get("lines", {}).get(key)
        if not line:
            continue
        if line.get("detected"):
            bits = [line.get("depth"), line.get("curvature")]
            if line.get("breaks"):
                bits.append(f"{line['breaks']} break(s)")
            if line.get("forked_end"):
                bits.append("forked end")
            value = ", ".join(b for b in bits if b)
        else:
            value = "Not clear in your photo"
        facts.append(_fact("palmistry", key, line.get("name", key.title()), value))
    mounts = analysis.get("mounts") or {}
    notable = [f"{m['name']}: {m['development']}" for m in mounts.values() if m.get("development") and m["development"] != "average"]
    if mounts:
        facts.append(_fact("palmistry", "mounts", "Soft pads of the palm (mounts)", "; ".join(notable) if notable else "All pads look average"))
    if geom.get("thumb"):
        facts.append(_fact("palmistry", "thumb", "Thumb", f"{geom['thumb'].title()} thumb"))
    return facts


def build_profile_facts(sources: dict) -> dict[str, list[dict]]:
    builders = {"numerology": _numerology_facts, "astrology": _astrology_facts, "palmistry": _palm_facts}
    return {module: (builders[module](sources[module][1]) if sources.get(module) else []) for module in builders}
