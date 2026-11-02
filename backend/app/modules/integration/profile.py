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
    "moolank": "Your Moolank (psychic number) comes from the day of the month you were born, reduced to a single digit. "
               "It describes your instinctive, inner nature: how you think, react and what drives you when nobody is watching.",
    "bhagyank": "Your Bhagyank (destiny number) adds every digit of your full date of birth. It is read as the wider direction "
                "of your life: the lessons, opportunities and kinds of work that keep returning to you over the years.",
    "namank": "Your Namank (name number) turns each letter of your name into a number with the Chaldean table and adds them up. "
              "It describes how other people experience you: your public image and the impression your name carries.",
    "personal_year": "Your Personal Year number combines your birth day and month with the current year, so it changes every "
                     "birthday cycle. It sets the theme of one year, which makes it a short-term forecast rather than a fixed trait.",
    # Vedic astrology
    "lagna": "Your Lagna (ascendant) is the zodiac sign rising on the eastern horizon at the exact minute and place you were born. "
             "It is the most personal point of a Vedic chart: it fixes all twelve houses and describes your temperament, body and "
             "approach to life. The planet that rules it, your lagna lord, carries special weight for you.",
    "moon_sign": "Your Moon sign (Rashi) is the sign the Moon occupied at your birth. Vedic astrology treats it as the sign of the mind: "
                 "it describes your emotions, moods and what makes you feel secure, and Indian daily horoscopes are read from it.",
    "sun_sign": "Your Sun sign here uses the sidereal (star-based) zodiac, so it is often one sign earlier than the Western star sign "
                "you may know. The Sun stands for your core self, vitality, confidence and relationship with authority.",
    "nakshatra": "The sky is divided into 27 nakshatras (lunar mansions), each with a ruling planet and a deity. The nakshatra holding "
                 "your Moon is your birth star: it fine-tunes the Moon sign's meaning and decides the order of your dasha periods.",
    "dasha": "Vimshottari Dasha is the Vedic timing system. Life is divided into planetary periods (mahadashas) lasting 6 to 20 years, "
             "each split into sub-periods (antardashas). The planets running the current period are believed to bring their own "
             "themes forward, so the dasha shows which part of your chart is 'switched on' right now and until when.",
    "yogas": "A yoga is a special combination of planets, for example two planets sharing a sign, that classical texts link to a "
             "particular result. Charts differ in how many they have; each one present adds a specific promise or tendency.",
    "transits": "Transits are where the slow-moving planets are today compared with your birth chart. Saturn and Jupiter stay in a "
                "sign for years, so they describe the climate of the current period. Sade Sati is Saturn's roughly 7.5-year passage "
                "around your Moon sign, traditionally a demanding but maturing time.",
    "domains": "Each area of life is linked to a house of the chart. Its score combines the strength of that house, the planet that "
               "rules it and the planets that naturally signify it (karakas). A higher score means the chart supports that area more.",
    # Palmistry
    "hand_shape": "Palmists sort hands into four elements (earth, air, fire, water) from the shape of the palm and the length of the "
                  "fingers. Your hand's element is read as your basic temperament.",
    "heart": "The Heart line runs across the top of the palm, below the fingers. It is read for your emotional style: how you love, "
             "show feelings and attach to people.",
    "head": "The Head line runs across the middle of the palm. It is read for your way of thinking: practical or imaginative, "
            "focused or wide-ranging.",
    "life": "The Life line curves around the base of the thumb. Despite its name, palmists do not read it for lifespan; it reflects "
            "vitality, energy and major changes in direction.",
    "fate": "The Fate line runs up the centre of the palm toward the middle finger. It is read for career and how much life feels "
            "shaped by outside circumstances. Many hands have no clear fate line, which is traditionally read as a self-made path.",
    "sun": "The Sun (Apollo) line runs up toward the ring finger and is linked with recognition, creativity and personal success.",
    "mounts": "Mounts are the fleshy pads at the base of each finger and around the palm, each named after a planet. A well-developed "
              "mount strengthens that planet's qualities in you; a flat one suggests they play a smaller role.",
    "thumb": "The thumb is read for willpower and reasoning. A long thumb is traditionally linked with determination and self-direction.",
}

NUMEROLOGY_LABELS = {"moolank": "Moolank · Psychic number", "bhagyank": "Bhagyank · Destiny number",
                     "namank": "Namank · Name number", "personal_year": "Personal Year"}
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
            value += f" · ruled by {comp['planet']}"
        if key == "personal_year" and report.get("target_year"):
            value += f" · for {report['target_year']}"
        facts.append(_fact("numerology", key, label, value))
    return facts


def _astrology_facts(result: dict) -> list[dict]:
    chart = result.get("chart", {})
    facts = []
    lagna = chart.get("lagna")
    if lagna and not result.get("birth_time_unknown"):
        facts.append(_fact("astrology", "lagna", "Lagna · Ascendant",
                           f"{lagna['sign']} ({lagna.get('sign_sanskrit', '')}), ruled by {lagna.get('lord', '')}"))
    moon = chart.get("planets", {}).get("Moon", {})
    if chart.get("moon_sign"):
        dignity = f", {moon['dignity']}" if moon.get("dignity") and moon["dignity"] not in ("neutral", "none") else ""
        house = f" in house {moon['house']}" if moon.get("house") and not result.get("birth_time_unknown") else ""
        facts.append(_fact("astrology", "moon_sign", "Moon sign · Rashi", f"{chart['moon_sign']}{house}{dignity}"))
    if moon.get("nakshatra"):
        n = moon["nakshatra"]
        facts.append(_fact("astrology", "nakshatra", "Birth star · Nakshatra",
                           f"{n['name']} (pada {n.get('pada')}), ruled by {n.get('lord')}, deity {n.get('deity')}"))
    if chart.get("sun_sign"):
        facts.append(_fact("astrology", "sun_sign", "Sun sign (sidereal)", chart["sun_sign"]))
    period = chart.get("dasha", {}).get("current_period")
    if period:
        facts.append(_fact("astrology", "dasha", "Current dasha period",
                           f"{period['mahadasha']} mahadasha (until {_date(period.get('mahadasha_end'))}) with "
                           f"{period['antardasha']} antardasha ({_date(period.get('antardasha_start'))} – {_date(period.get('antardasha_end'))})"))
    yogas = chart.get("yogas") or []
    facts.append(_fact("astrology", "yogas", "Yogas in your chart",
                       "; ".join(f"{y['name']} ({y.get('condition', '').rstrip('.')})" for y in yogas) if yogas else "No classical yoga from the checked list"))
    transits = chart.get("transits")
    if transits:
        parts = []
        for planet in ("saturn", "jupiter"):
            t = transits.get(planet)
            if t:
                parts.append(f"{planet.title()} in {t['sign']} ({t.get('house_from_moon')}th from your Moon)")
        sade = transits.get("sade_sati", {})
        parts.append(f"Sade Sati active ({sade.get('phase')})" if sade.get("active") else "Sade Sati not active")
        facts.append(_fact("astrology", "transits", f"Transits as of {_date(transits.get('as_of'))}", "; ".join(parts)))
    domains = chart.get("domains")
    if domains:
        facts.append(_fact("astrology", "domains", "Life areas in your chart",
                           "; ".join(f"{d['label']} {d['score']}/100 ({d['assessment']})" for d in domains.values())))
    return facts


def _palm_facts(result: dict) -> list[dict]:
    analysis = result.get("analysis", {})
    facts = []
    geom = analysis.get("geometry") or {}
    if geom.get("element"):
        facts.append(_fact("palmistry", "hand_shape", "Hand shape · Element",
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
            value = "Not clearly visible in your photo"
        facts.append(_fact("palmistry", key, line.get("name", key.title()), value))
    mounts = analysis.get("mounts") or {}
    notable = [f"{m['name']}: {m['development']}" for m in mounts.values() if m.get("development") and m["development"] != "average"]
    if mounts:
        facts.append(_fact("palmistry", "mounts", "Mounts", "; ".join(notable) if notable else "All mounts of average development"))
    if geom.get("thumb"):
        facts.append(_fact("palmistry", "thumb", "Thumb", f"{geom['thumb'].title()} thumb"))
    return facts


def build_profile_facts(sources: dict) -> dict[str, list[dict]]:
    builders = {"numerology": _numerology_facts, "astrology": _astrology_facts, "palmistry": _palm_facts}
    return {module: (builders[module](sources[module][1]) if sources.get(module) else []) for module in builders}
