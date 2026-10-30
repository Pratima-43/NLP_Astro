"""Classical Parashari reference tables (Brihat Parashara Hora Shastra conventions).

Where traditions differ (Rahu/Ketu exaltation, Moolatrikona ranges) the most widely used
Parashari convention is chosen and documented in `CONVENTIONS`.
"""

SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]
SIGN_SANSKRIT = [
    "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
    "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena",
]
SIGN_SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"]
SIGN_LORDS = [
    "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
    "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter",
]
SIGN_ELEMENTS = ["Fire", "Earth", "Air", "Water"] * 3
SIGN_MODALITIES = ["Movable", "Fixed", "Dual"] * 4

PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
PLANET_SANSKRIT = {
    "Sun": "Surya", "Moon": "Chandra", "Mars": "Mangala", "Mercury": "Budha", "Jupiter": "Guru",
    "Venus": "Shukra", "Saturn": "Shani", "Rahu": "Rahu", "Ketu": "Ketu",
}
NATURAL_BENEFICS = {"Jupiter", "Venus", "Mercury", "Moon"}
NATURAL_MALEFICS = {"Sun", "Mars", "Saturn", "Rahu", "Ketu"}

# sign index of exaltation and the deepest-exaltation degree.
EXALTATION = {
    "Sun": (0, 10), "Moon": (1, 3), "Mars": (9, 28), "Mercury": (5, 15),
    "Jupiter": (3, 5), "Venus": (11, 27), "Saturn": (6, 20), "Rahu": (1, 20), "Ketu": (7, 20),
}
DEBILITATION = {planet: ((sign + 6) % 12, degree) for planet, (sign, degree) in EXALTATION.items()}
OWN_SIGNS = {
    "Sun": {4}, "Moon": {3}, "Mars": {0, 7}, "Mercury": {2, 5},
    "Jupiter": {8, 11}, "Venus": {1, 6}, "Saturn": {9, 10}, "Rahu": set(), "Ketu": set(),
}
# (sign index, start degree, end degree)
MOOLATRIKONA = {
    "Sun": (4, 0, 20), "Moon": (1, 3, 30), "Mars": (0, 0, 12), "Mercury": (5, 15, 20),
    "Jupiter": (8, 0, 10), "Venus": (6, 0, 15), "Saturn": (10, 0, 20),
}

# Naisargika (natural) relationships from BPHS.
FRIENDS = {
    "Sun": {"Moon", "Mars", "Jupiter"}, "Moon": {"Sun", "Mercury"},
    "Mars": {"Sun", "Moon", "Jupiter"}, "Mercury": {"Sun", "Venus"},
    "Jupiter": {"Sun", "Moon", "Mars"}, "Venus": {"Mercury", "Saturn"},
    "Saturn": {"Mercury", "Venus"},
}
ENEMIES = {
    "Sun": {"Venus", "Saturn"}, "Moon": set(), "Mars": {"Mercury"},
    "Mercury": {"Moon"}, "Jupiter": {"Mercury", "Venus"},
    "Venus": {"Sun", "Moon"}, "Saturn": {"Sun", "Moon", "Mars"},
}

# Maximum distance from the Sun (degrees) at which a planet is considered combust (asta).
COMBUSTION_ORBS = {"Moon": 12, "Mars": 17, "Mercury": 14, "Jupiter": 11, "Venus": 10, "Saturn": 15}
COMBUSTION_ORBS_RETRO = {"Mercury": 12, "Venus": 8}

NAKSHATRAS = [
    ("Ashwini", "Ketu", "Ashwini Kumaras", "Horse's head"),
    ("Bharani", "Venus", "Yama", "Yoni"),
    ("Krittika", "Sun", "Agni", "Razor / flame"),
    ("Rohini", "Moon", "Brahma (Prajapati)", "Chariot / ox-cart"),
    ("Mrigashira", "Mars", "Soma", "Deer's head"),
    ("Ardra", "Rahu", "Rudra", "Teardrop"),
    ("Punarvasu", "Jupiter", "Aditi", "Quiver of arrows"),
    ("Pushya", "Saturn", "Brihaspati", "Cow's udder / lotus"),
    ("Ashlesha", "Mercury", "Nagas", "Coiled serpent"),
    ("Magha", "Ketu", "Pitris (ancestors)", "Royal throne"),
    ("Purva Phalguni", "Venus", "Bhaga", "Front legs of a bed"),
    ("Uttara Phalguni", "Sun", "Aryaman", "Back legs of a bed"),
    ("Hasta", "Moon", "Savitar", "Hand"),
    ("Chitra", "Mars", "Tvashtar (Vishvakarma)", "Bright jewel"),
    ("Swati", "Rahu", "Vayu", "Young shoot in the wind"),
    ("Vishakha", "Jupiter", "Indra and Agni", "Triumphal arch"),
    ("Anuradha", "Saturn", "Mitra", "Lotus"),
    ("Jyeshtha", "Mercury", "Indra", "Circular amulet / umbrella"),
    ("Mula", "Ketu", "Nirriti", "Bunch of roots"),
    ("Purva Ashadha", "Venus", "Apas (waters)", "Elephant tusk / fan"),
    ("Uttara Ashadha", "Sun", "Vishvedevas", "Elephant tusk / planks of a bed"),
    ("Shravana", "Moon", "Vishnu", "Ear / three footprints"),
    ("Dhanishta", "Mars", "Eight Vasus", "Drum"),
    ("Shatabhisha", "Rahu", "Varuna", "Empty circle"),
    ("Purva Bhadrapada", "Jupiter", "Aja Ekapada", "Front of a funeral cot / sword"),
    ("Uttara Bhadrapada", "Saturn", "Ahir Budhnya", "Back of a funeral cot / twins"),
    ("Revati", "Mercury", "Pushan", "Fish / drum"),
]
NAKSHATRA_SPAN = 360 / 27

VIMSHOTTARI_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
VIMSHOTTARI_YEARS = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7,
    "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17,
}

KENDRAS = {1, 4, 7, 10}
TRIKONAS = {1, 5, 9}
DUSTHANAS = {6, 8, 12}
UPACHAYAS = {3, 6, 10, 11}

HOUSE_NAMES = {
    1: "Tanu (self)", 2: "Dhana (wealth)", 3: "Sahaja (courage)", 4: "Sukha (home)",
    5: "Putra (creativity)", 6: "Ripu (obstacles)", 7: "Kalatra (partnership)", 8: "Ayu (transformation)",
    9: "Dharma (fortune)", 10: "Karma (career)", 11: "Labha (gains)", 12: "Vyaya (release)",
}

# Life domains used for explainable predictions and for cross-system comparison.
DOMAINS = {
    "career": {"label": "Career & status", "houses": [10], "karakas": ["Sun", "Saturn"]},
    "relationships": {"label": "Relationships & marriage", "houses": [7], "karakas": ["Venus"]},
    "finance": {"label": "Wealth & gains", "houses": [2, 11], "karakas": ["Jupiter"]},
    "health": {"label": "Vitality & health", "houses": [1, 6], "karakas": ["Sun"]},
    "education": {"label": "Learning & intellect", "houses": [4, 5], "karakas": ["Mercury", "Jupiter"]},
    "family": {"label": "Home & family", "houses": [4], "karakas": ["Moon"]},
    "communication": {"label": "Courage & communication", "houses": [3], "karakas": ["Mars", "Mercury"]},
    "spirituality": {"label": "Dharma & spirituality", "houses": [9, 12], "karakas": ["Jupiter", "Ketu"]},
}

CONVENTIONS = {
    "zodiac": "Sidereal (nirayana) with Lahiri / Chitrapaksha ayanamsa",
    "houses": "Whole-sign houses counted from the ascendant (lagna) sign",
    "nodes": "Mean lunar node for Rahu; Ketu exactly opposite",
    "node_exaltation": "Rahu exalted in Taurus, Ketu in Scorpio (one of several traditional views)",
    "dasha": "Vimshottari, 120-year cycle, 365.25-day years, starting from the Moon's nakshatra",
    "ephemeris": "Swiss Ephemeris (pyswisseph); built-in Moshier model when data files are absent",
}
