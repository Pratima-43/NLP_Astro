"""Builds seed_claims.json for the Vedic Astrology knowledge base.

Run: python -m app.modules.vedic_astrology.knowledge_base.build_seed

Each claim is a short paraphrase of a widely cited classical signification. `source_wording` is
left null because these are paraphrases, not quotations, and `verification_status` is
`classical_paraphrase` so the UI and the integration layer can label them honestly. Edit the
tables below rather than the generated JSON.
"""
import json
from pathlib import Path

BPHS = "Brihat Parashara Hora Shastra (classical Parashari text), paraphrased"
PHALADEEPIKA = "Phaladeepika of Mantreswara, paraphrased"
BRIHAT_JATAKA = "Brihat Jataka of Varahamihira, paraphrased"
NAKSHATRA_SRC = "Traditional nakshatra descriptions in Jyotish literature, paraphrased"
DASHA_SRC = "Vimshottari dasha principles (Brihat Parashara Hora Shastra), paraphrased"
GOCHARA_SRC = "Traditional gochara (transit) rules, paraphrased"

# (theme, trait, claim, polarity)
PLANETS = {
    "Sun": {
        None: [
            ("personality", "Soul and self-identity", "The Sun signifies the soul (atma), self-identity and the sense of purpose.", "neutral"),
            ("leadership", "Authority", "The Sun is the significator of authority, government and positions of command.", "neutral"),
            ("family", "Father", "The Sun represents the father and paternal figures.", "neutral"),
            ("health", "Vitality", "The Sun governs vitality, constitution and the heart.", "neutral"),
        ],
        "strong": [
            ("leadership", "Confidence and recognition", "A strong Sun is traditionally read as confidence, dignity and recognition from those in authority.", "positive"),
            ("career", "Public standing", "A strong Sun supports public standing and success in administrative or leadership roles.", "positive"),
        ],
        "weak": [
            ("personality", "Ego strain", "An afflicted Sun is associated with wavering self-confidence or friction with authority figures.", "challenge"),
            ("health", "Lower vitality", "An afflicted Sun is traditionally linked with lower vitality.", "challenge"),
        ],
    },
    "Moon": {
        None: [
            ("emotions", "Mind and emotions", "The Moon signifies the mind (manas), feelings and emotional responses.", "neutral"),
            ("family", "Mother and nurture", "The Moon represents the mother, nurture and home comforts.", "neutral"),
            ("career", "Public and popularity", "The Moon is associated with the public, popularity and caring professions.", "neutral"),
        ],
        "strong": [
            ("emotions", "Emotional steadiness", "A strong Moon is traditionally read as emotional steadiness, empathy and a contented mind.", "positive"),
            ("relationships", "Nurturing nature", "A strong Moon supports a nurturing, receptive and sociable nature.", "positive"),
        ],
        "weak": [
            ("emotions", "Restless mind", "An afflicted Moon is associated with mood fluctuation, worry and a restless mind.", "challenge"),
        ],
    },
    "Mars": {
        None: [
            ("personality", "Energy and courage", "Mars signifies energy, courage, drive and the capacity to act.", "neutral"),
            ("family", "Siblings", "Mars represents younger siblings.", "neutral"),
            ("career", "Technical and protective work", "Mars is associated with land, engineering, surgery, sport and protective services.", "neutral"),
        ],
        "strong": [
            ("leadership", "Decisive action", "A strong Mars is read as decisiveness, stamina and the courage to compete.", "positive"),
        ],
        "weak": [
            ("personality", "Impulsiveness", "An afflicted Mars is linked with impatience, anger and conflict.", "challenge"),
            ("health", "Injuries and inflammation", "An afflicted Mars is traditionally associated with cuts, injuries and inflammatory conditions.", "challenge"),
        ],
    },
    "Mercury": {
        None: [
            ("communication", "Intellect and speech", "Mercury signifies intellect, speech, writing and analytical ability.", "neutral"),
            ("career", "Commerce", "Mercury is associated with commerce, trade, accounting and communication work.", "neutral"),
            ("education", "Learning", "Mercury governs learning, discrimination (buddhi) and adaptability.", "neutral"),
        ],
        "strong": [
            ("communication", "Articulate and witty", "A strong Mercury is read as articulate expression, wit and sharp reasoning.", "positive"),
            ("finance", "Business acumen", "A strong Mercury supports business acumen and skill with numbers.", "positive"),
        ],
        "weak": [
            ("emotions", "Nervousness and indecision", "An afflicted Mercury is linked with nervousness, indecision and scattered thinking.", "challenge"),
        ],
    },
    "Jupiter": {
        None: [
            ("spirituality", "Wisdom and dharma", "Jupiter signifies wisdom, dharma, faith and higher knowledge.", "neutral"),
            ("family", "Children and teachers", "Jupiter represents children, teachers and gurus.", "neutral"),
            ("finance", "Expansion and fortune", "Jupiter is the natural significator of wealth, expansion and good fortune.", "neutral"),
        ],
        "strong": [
            ("education", "Good counsel", "A strong Jupiter is read as sound judgement, generosity and the ability to teach or advise.", "positive"),
            ("finance", "Prosperity", "A strong Jupiter is traditionally linked with prosperity and protection in difficulty.", "positive"),
        ],
        "weak": [
            ("finance", "Over-extension", "An afflicted Jupiter is associated with over-optimism, poor judgement or misplaced trust.", "challenge"),
        ],
    },
    "Venus": {
        None: [
            ("relationships", "Love and marriage", "Venus signifies love, marriage, partnership and attraction.", "neutral"),
            ("creativity", "Arts and beauty", "Venus governs the arts, music, beauty and refinement.", "neutral"),
            ("finance", "Comforts and luxuries", "Venus is associated with comforts, vehicles and luxuries.", "neutral"),
        ],
        "strong": [
            ("relationships", "Harmony and charm", "A strong Venus is read as charm, harmony in relationships and appreciation of beauty.", "positive"),
            ("creativity", "Artistic talent", "A strong Venus supports artistic talent and aesthetic sensibility.", "positive"),
        ],
        "weak": [
            ("relationships", "Relationship dissatisfaction", "An afflicted Venus is linked with dissatisfaction in relationships or over-indulgence.", "challenge"),
        ],
    },
    "Saturn": {
        None: [
            ("career", "Discipline and labour", "Saturn signifies discipline, labour, service, structure and responsibility.", "neutral"),
            ("timing", "Time and delay", "Saturn governs time, longevity, patience and delays.", "neutral"),
            ("personality", "Justice and endurance", "Saturn is associated with justice, endurance and detachment.", "neutral"),
        ],
        "strong": [
            ("career", "Lasting achievement", "A strong Saturn is read as perseverance, organisation and achievements that last.", "positive"),
        ],
        "weak": [
            ("emotions", "Heaviness and pessimism", "An afflicted Saturn is associated with delays, burdens, fear or pessimism.", "challenge"),
            ("health", "Chronic strain", "An afflicted Saturn is traditionally linked with chronic or slow-moving health concerns.", "challenge"),
        ],
    },
    "Rahu": {
        None: [
            ("career", "Ambition and the unconventional", "Rahu signifies worldly ambition, unconventional paths, foreign lands and innovation.", "neutral"),
            ("emotions", "Desire and obsession", "Rahu is associated with intense desire, obsession and amplification.", "neutral"),
        ],
        "strong": [
            ("career", "Unconventional success", "A well-placed Rahu is read as success through unconventional, foreign or technological avenues.", "positive"),
        ],
        "weak": [
            ("emotions", "Confusion and restlessness", "An afflicted Rahu is linked with confusion, restlessness and illusion.", "challenge"),
        ],
    },
    "Ketu": {
        None: [
            ("spirituality", "Detachment and liberation", "Ketu signifies detachment, spirituality, moksha and past-life tendencies.", "neutral"),
            ("education", "Research and intuition", "Ketu is associated with intuition, research and subtle or occult knowledge.", "neutral"),
        ],
        "strong": [
            ("spirituality", "Insight", "A well-placed Ketu is read as penetrating insight and spiritual inclination.", "positive"),
        ],
        "weak": [
            ("emotions", "Aimlessness", "An afflicted Ketu is linked with isolation, aimlessness or sudden losses.", "challenge"),
        ],
    },
}

SIGNS = {
    "Aries": [("personality", "Pioneering", "Aries (Mesha), a movable fire sign ruled by Mars, is associated with initiative, courage and a pioneering spirit.", "neutral"),
              ("leadership", "Leads from the front", "Aries emphasis is traditionally read as a direct, energetic and competitive nature.", "positive"),
              ("personality", "Haste", "Aries emphasis can show as impatience and hasty decisions.", "challenge")],
    "Taurus": [("personality", "Steady and sensual", "Taurus (Vrishabha), a fixed earth sign ruled by Venus, is associated with steadiness, patience and enjoyment of comforts.", "neutral"),
               ("finance", "Accumulation", "Taurus emphasis is traditionally linked with building resources and valuing security.", "positive"),
               ("personality", "Stubbornness", "Taurus emphasis can show as stubbornness and resistance to change.", "challenge")],
    "Gemini": [("communication", "Curious communicator", "Gemini (Mithuna), a dual air sign ruled by Mercury, is associated with curiosity, conversation and versatility.", "neutral"),
               ("education", "Quick learner", "Gemini emphasis is read as quick learning and skill with words.", "positive"),
               ("emotions", "Scattered focus", "Gemini emphasis can show as restlessness and scattered attention.", "challenge")],
    "Cancer": [("emotions", "Sensitive and caring", "Cancer (Karka), a movable water sign ruled by the Moon, is associated with sensitivity, care and attachment to home.", "neutral"),
               ("family", "Protective of family", "Cancer emphasis is traditionally read as devotion to family and a protective nature.", "positive"),
               ("emotions", "Moodiness", "Cancer emphasis can show as moodiness and over-sensitivity.", "challenge")],
    "Leo": [("leadership", "Regal and generous", "Leo (Simha), a fixed fire sign ruled by the Sun, is associated with dignity, generosity and a desire to lead.", "neutral"),
            ("creativity", "Creative self-expression", "Leo emphasis is read as warmth, creativity and natural presence.", "positive"),
            ("personality", "Pride", "Leo emphasis can show as pride and a need for recognition.", "challenge")],
    "Virgo": [("education", "Analytical and precise", "Virgo (Kanya), a dual earth sign ruled by Mercury, is associated with analysis, precision and service.", "neutral"),
              ("career", "Skilled service", "Virgo emphasis is read as diligence and practical, detail-oriented skill.", "positive"),
              ("emotions", "Over-criticism", "Virgo emphasis can show as worry and self-criticism.", "challenge")],
    "Libra": [("relationships", "Balance and partnership", "Libra (Tula), a movable air sign ruled by Venus, is associated with balance, diplomacy and partnership.", "neutral"),
              ("creativity", "Refined taste", "Libra emphasis is read as fairness, charm and refined aesthetic sense.", "positive"),
              ("personality", "Indecision", "Libra emphasis can show as indecision and dependence on others' approval.", "challenge")],
    "Scorpio": [("emotions", "Intense and private", "Scorpio (Vrishchika), a fixed water sign ruled by Mars, is associated with intensity, depth and secrecy.", "neutral"),
                ("education", "Investigative depth", "Scorpio emphasis is read as resilience and a talent for research.", "positive"),
                ("emotions", "Jealousy and resentment", "Scorpio emphasis can show as suspicion or holding on to grievances.", "challenge")],
    "Sagittarius": [("spirituality", "Philosophical", "Sagittarius (Dhanu), a dual fire sign ruled by Jupiter, is associated with idealism, faith and philosophy.", "neutral"),
                    ("education", "Teacher and seeker", "Sagittarius emphasis is read as optimism, honesty and a love of higher learning.", "positive"),
                    ("personality", "Bluntness", "Sagittarius emphasis can show as bluntness and over-confidence.", "challenge")],
    "Capricorn": [("career", "Ambitious and disciplined", "Capricorn (Makara), a movable earth sign ruled by Saturn, is associated with ambition, discipline and practicality.", "neutral"),
                  ("career", "Persistent achiever", "Capricorn emphasis is read as patience and steady climbing toward goals.", "positive"),
                  ("emotions", "Reserve", "Capricorn emphasis can show as emotional reserve and rigidity.", "challenge")],
    "Aquarius": [("personality", "Humanitarian and original", "Aquarius (Kumbha), a fixed air sign ruled by Saturn, is associated with independence, originality and concern for society.", "neutral"),
                 ("education", "Innovative thinker", "Aquarius emphasis is read as inventive, systematic thinking.", "positive"),
                 ("relationships", "Detachment", "Aquarius emphasis can show as emotional detachment.", "challenge")],
    "Pisces": [("spirituality", "Compassionate and devotional", "Pisces (Meena), a dual water sign ruled by Jupiter, is associated with compassion, imagination and devotion.", "neutral"),
               ("creativity", "Imaginative", "Pisces emphasis is read as intuition, artistic imagination and kindness.", "positive"),
               ("emotions", "Escapism", "Pisces emphasis can show as escapism and difficulty with boundaries.", "challenge")],
}

HOUSES = {
    1: [("personality", "Self and body", "The 1st house (lagna) signifies the self, body, temperament and general vitality.", "neutral")],
    2: [("finance", "Wealth and speech", "The 2nd house signifies accumulated wealth, family, speech and food.", "neutral")],
    3: [("communication", "Courage and effort", "The 3rd house signifies courage, initiative, younger siblings, short journeys and communication.", "neutral")],
    4: [("family", "Home and mother", "The 4th house signifies the mother, home, property, vehicles and inner contentment.", "neutral"),
        ("education", "Foundational education", "The 4th house is also associated with foundational education.", "neutral")],
    5: [("creativity", "Intelligence and creativity", "The 5th house signifies intelligence, creativity, children, romance and past merit (purva punya).", "neutral"),
        ("education", "Higher intellect", "The 5th house is associated with intellect and the capacity for learning.", "neutral")],
    6: [("health", "Illness and obstacles", "The 6th house signifies illness, debts, enemies, competition and daily service.", "neutral")],
    7: [("relationships", "Marriage and partnership", "The 7th house signifies marriage, spouse, business partnerships and public dealings.", "neutral")],
    8: [("timing", "Transformation", "The 8th house signifies longevity, sudden events, transformation, inheritance and hidden matters.", "neutral")],
    9: [("spirituality", "Fortune and dharma", "The 9th house signifies fortune (bhagya), dharma, father, teachers and long journeys.", "neutral")],
    10: [("career", "Career and status", "The 10th house signifies career, action (karma), status and reputation.", "neutral")],
    11: [("finance", "Gains and networks", "The 11th house signifies gains, income, fulfilment of desires, elder siblings and social networks.", "neutral")],
    12: [("spirituality", "Loss and liberation", "The 12th house signifies expenditure, foreign lands, isolation, sleep and liberation (moksha).", "neutral")],
}

NAKSHATRAS = {
    "Ashwini": ("Swift and healing", "Ashwini is associated with speed, initiative and healing ability.", "Impatience"),
    "Bharani": ("Endurance and restraint", "Bharani is associated with endurance, determination and the ability to carry heavy responsibilities.", "Extremes of indulgence and restraint"),
    "Krittika": ("Sharp and purifying", "Krittika is associated with sharpness, courage and a purifying, critical intelligence.", "Harsh speech"),
    "Rohini": ("Charm and growth", "Rohini is associated with beauty, charm, fertility and material growth.", "Possessiveness"),
    "Mrigashira": ("Seeker", "Mrigashira is associated with curiosity, searching and gentle restlessness.", "Indecision"),
    "Ardra": ("Storm and renewal", "Ardra is associated with intensity, intellectual effort and renewal after upheaval.", "Emotional turbulence"),
    "Punarvasu": ("Return and renewal", "Punarvasu is associated with optimism, renewal and the ability to recover.", "Over-contentment"),
    "Pushya": ("Nourishing", "Pushya is associated with nourishment, devotion, protection and good counsel.", "Rigidity in belief"),
    "Ashlesha": ("Penetrating", "Ashlesha is associated with penetrating insight, persuasion and strategic thinking.", "Secretiveness"),
    "Magha": ("Regal heritage", "Magha is associated with dignity, ancestry, tradition and authority.", "Pride"),
    "Purva Phalguni": ("Pleasure and creativity", "Purva Phalguni is associated with enjoyment, creativity, affection and leisure.", "Indulgence"),
    "Uttara Phalguni": ("Patronage", "Uttara Phalguni is associated with reliability, generosity and supportive partnerships.", "Over-commitment"),
    "Hasta": ("Skilful hands", "Hasta is associated with dexterity, craftsmanship, wit and practical skill.", "Restless worry"),
    "Chitra": ("Brilliant design", "Chitra is associated with design, beauty, craftsmanship and visual creativity.", "Vanity"),
    "Swati": ("Independent", "Swati is associated with independence, flexibility, trade and diplomacy.", "Instability"),
    "Vishakha": ("Goal-driven", "Vishakha is associated with determination, ambition and single-minded pursuit of goals.", "Impatience for results"),
    "Anuradha": ("Devoted friendship", "Anuradha is associated with friendship, cooperation, devotion and organisational skill.", "Melancholy"),
    "Jyeshtha": ("Seniority", "Jyeshtha is associated with seniority, protectiveness and the ability to take charge.", "Arrogance"),
    "Mula": ("Root investigation", "Mula is associated with getting to the root of things, research and radical change.", "Destructiveness"),
    "Purva Ashadha": ("Invincible", "Purva Ashadha is associated with conviction, persuasion and early victory.", "Stubborn pride"),
    "Uttara Ashadha": ("Final victory", "Uttara Ashadha is associated with integrity, responsibility and lasting success.", "Rigidity"),
    "Shravana": ("Listening and learning", "Shravana is associated with listening, learning, teaching and connection.", "Over-sensitivity to criticism"),
    "Dhanishta": ("Rhythm and wealth", "Dhanishta is associated with music, rhythm, generosity and prosperity.", "Restlessness in partnership"),
    "Shatabhisha": ("Healer and mystic", "Shatabhisha is associated with healing, secrecy, research and independent thinking.", "Isolation"),
    "Purva Bhadrapada": ("Fiery idealist", "Purva Bhadrapada is associated with idealism, intensity and transformation.", "Extremism"),
    "Uttara Bhadrapada": ("Deep and steady", "Uttara Bhadrapada is associated with wisdom, restraint and depth.", "Withdrawal"),
    "Revati": ("Gentle guide", "Revati is associated with compassion, protection, safe travel and completion.", "Naivety"),
}

DIGNITIES = {
    "exalted": ("Exaltation", "An exalted planet is traditionally considered at its strongest and gives its best results.", "positive"),
    "moolatrikona": ("Moolatrikona", "A planet in its moolatrikona sign is considered very strong and acts with clear purpose.", "positive"),
    "own_sign": ("Own sign", "A planet in its own sign is considered comfortable and strong.", "positive"),
    "friendly_sign": ("Friendly sign", "A planet in a friend's sign is considered reasonably supported.", "positive"),
    "neutral": ("Neutral sign", "A planet in a neutral sign gives moderate results.", "neutral"),
    "enemy_sign": ("Enemy sign", "A planet in an enemy's sign is considered uncomfortable and gives mixed results.", "challenge"),
    "debilitated": ("Debilitation", "A debilitated planet is traditionally considered weak, unless the debilitation is cancelled.", "challenge"),
}

YOGAS = {
    "gaja_kesari": (PHALADEEPIKA, "career", "Gaja Kesari Yoga", "Gaja Kesari Yoga is traditionally said to give intelligence, reputation, prosperity and lasting fame.", "positive"),
    "budha_aditya": (PHALADEEPIKA, "education", "Budha-Aditya Yoga", "Budha-Aditya Yoga is traditionally associated with intelligence, skill and a good reputation.", "positive"),
    "chandra_mangala": (PHALADEEPIKA, "finance", "Chandra-Mangala Yoga", "Chandra-Mangala Yoga is traditionally associated with earning through enterprise, though sometimes by unconventional means.", "neutral"),
    "ruchaka": (BPHS, "leadership", "Ruchaka Yoga", "Ruchaka Yoga (Mars) is traditionally associated with courage, physical strength and leadership.", "positive"),
    "bhadra": (BPHS, "communication", "Bhadra Yoga", "Bhadra Yoga (Mercury) is traditionally associated with intellect, eloquence and learning.", "positive"),
    "hamsa": (BPHS, "spirituality", "Hamsa Yoga", "Hamsa Yoga (Jupiter) is traditionally associated with righteousness, wisdom and respect.", "positive"),
    "malavya": (BPHS, "relationships", "Malavya Yoga", "Malavya Yoga (Venus) is traditionally associated with charm, comfort, art and a happy marriage.", "positive"),
    "shasha": (BPHS, "career", "Shasha Yoga", "Shasha Yoga (Saturn) is traditionally associated with authority over others, endurance and organisational power.", "positive"),
    "sunapha": (BRIHAT_JATAKA, "finance", "Sunapha Yoga", "Sunapha Yoga is traditionally associated with self-earned wealth, intelligence and good reputation.", "positive"),
    "anapha": (BRIHAT_JATAKA, "personality", "Anapha Yoga", "Anapha Yoga is traditionally associated with good health, a pleasing personality and self-respect.", "positive"),
    "durudhara": (BRIHAT_JATAKA, "finance", "Durudhara Yoga", "Durudhara Yoga is traditionally associated with comforts, wealth and generosity.", "positive"),
    "kemadruma": (BRIHAT_JATAKA, "emotions", "Kemadruma Yoga", "Kemadruma Yoga is traditionally associated with periods of loneliness or struggle; classical texts also describe many cancelling conditions.", "challenge"),
    "yogakaraka": (BPHS, "career", "Yogakaraka", "A yogakaraka planet, ruling both a kendra and a trikona, is traditionally considered especially auspicious for the chart.", "positive"),
    "raja_yoga": (BPHS, "career", "Raja Yoga", "A Raja Yoga formed by kendra and trikona lords is traditionally associated with rise in status and authority, especially in their dashas.", "positive"),
    "dhana_yoga": (BPHS, "finance", "Dhana Yoga", "A Dhana Yoga linking wealth and trikona lords is traditionally associated with accumulation of wealth.", "positive"),
    "viparita_raja": (BPHS, "timing", "Viparita Raja Yoga", "Viparita Raja Yoga is traditionally said to bring gains after adversity or through the misfortune of rivals.", "positive"),
    "mangal_dosha": (BPHS, "relationships", "Mangal Dosha", "Mangal Dosha is traditionally associated with friction or delay in marriage; compatibility matching and cancellations are considered.", "challenge"),
    "neecha_bhanga": (PHALADEEPIKA, "timing", "Neecha Bhanga", "Cancellation of debilitation (Neecha Bhanga) is traditionally said to turn an early weakness into later strength.", "positive"),
}

DASHA = {
    "Sun": "A Sun period traditionally emphasises authority, recognition, self-assertion and dealings with government or father.",
    "Moon": "A Moon period traditionally emphasises emotions, home, mother, public contact and changeability.",
    "Mars": "A Mars period traditionally emphasises energy, competition, property, siblings and decisive action.",
    "Mercury": "A Mercury period traditionally emphasises learning, communication, commerce and intellectual work.",
    "Jupiter": "A Jupiter period traditionally emphasises growth, learning, children, wisdom and good fortune.",
    "Venus": "A Venus period traditionally emphasises relationships, comforts, the arts and material enjoyment.",
    "Saturn": "A Saturn period traditionally emphasises hard work, responsibility, patience and slow but durable results.",
    "Rahu": "A Rahu period traditionally emphasises ambition, unconventional opportunities, foreign connections and restlessness.",
    "Ketu": "A Ketu period traditionally emphasises detachment, spirituality, research and endings that clear the way.",
}
DASHA_THEMES = {"Sun": "leadership", "Moon": "emotions", "Mars": "personality", "Mercury": "communication",
                "Jupiter": "spirituality", "Venus": "relationships", "Saturn": "career", "Rahu": "career", "Ketu": "spirituality"}


def _record(record_id, feature_key, condition, theme, category, trait, claim, polarity, source):
    return {
        "record_id": record_id, "feature_key": feature_key, "condition": condition, "theme": theme,
        "category": category, "trait": trait, "claim": claim, "polarity": polarity,
        "source_name": source, "source_url": None, "source_wording": None,
        "claim_type": "traditional_interpretation", "verification_status": "classical_paraphrase",
    }


def build() -> list[dict]:
    records = []
    for planet, groups in PLANETS.items():
        for condition, items in groups.items():
            for i, (theme, trait, claim, polarity) in enumerate(items, 1):
                suffix = condition.upper() if condition else "SIG"
                records.append(_record(f"VED-PL-{planet.upper()}-{suffix}-{i:02d}", f"planet:{planet.lower()}", condition,
                                       theme, "planet_signification", trait, claim, polarity, BPHS))
    for sign, items in SIGNS.items():
        for i, (theme, trait, claim, polarity) in enumerate(items, 1):
            records.append(_record(f"VED-SG-{sign.upper()}-{i:02d}", f"sign:{sign.lower()}", None,
                                   theme, "sign_nature", trait, claim, polarity, BPHS))
    for house, items in HOUSES.items():
        for i, (theme, trait, claim, polarity) in enumerate(items, 1):
            records.append(_record(f"VED-HS-{house:02d}-{i:02d}", f"house:{house}", None,
                                   theme, "house_signification", trait, claim, polarity, BPHS))
    for name, (trait, claim, challenge) in NAKSHATRAS.items():
        key = name.lower().replace(" ", "_")
        records.append(_record(f"VED-NK-{key.upper()}-01", f"nakshatra:{key}", None, "personality",
                               "nakshatra_nature", trait, claim, "positive", NAKSHATRA_SRC))
        records.append(_record(f"VED-NK-{key.upper()}-02", f"nakshatra:{key}", None, "personality", "nakshatra_nature",
                               challenge, f"A traditional caution for {name} is a tendency toward {challenge.lower()}.", "challenge", NAKSHATRA_SRC))
    for state, (trait, claim, polarity) in DIGNITIES.items():
        records.append(_record(f"VED-DG-{state.upper()}", "dignity", state, "personality", "planet_dignity", trait, claim, polarity, BPHS))
    for key, (source, theme, trait, claim, polarity) in YOGAS.items():
        records.append(_record(f"VED-YG-{key.upper()}", f"yoga:{key}", None, theme, "yoga", trait, claim, polarity, source))
    for lord, claim in DASHA.items():
        records.append(_record(f"VED-DS-{lord.upper()}", f"dasha:{lord.lower()}", None, "timing", "dasha_period",
                               f"{lord} period", claim, "neutral", DASHA_SRC))
    records.append(_record("VED-TR-SADESATI-01", "transit:sade_sati", "active", "timing", "transit", "Sade Sati",
                           "Sade Sati, Saturn's roughly seven-and-a-half-year transit over the natal Moon, is traditionally a period of pressure, responsibility and maturing through effort.",
                           "challenge", GOCHARA_SRC))
    records.append(_record("VED-TR-JUPITER-MOON-01", "transit:jupiter", "favourable", "timing", "transit", "Favourable Jupiter transit",
                           "Jupiter transiting the 2nd, 5th, 7th, 9th or 11th from the natal Moon is traditionally considered favourable.",
                           "positive", GOCHARA_SRC))
    return records


if __name__ == "__main__":
    out = Path(__file__).with_name("seed_claims.json")
    data = build()
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(data)} claims to {out}")
