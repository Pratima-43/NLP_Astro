"""Builds seed_claims.json for the Palmistry knowledge base.

Run: python -m app.modules.palmistry.knowledge_base.build_seed

Primary source: Cheiro, *Palmistry for All* (1916), public domain, Project Gutenberg eBook #20480
(https://www.gutenberg.org/ebooks/20480). `source_wording` holds a short verbatim excerpt from the
cited passage; `claim` is the project's neutral paraphrase. Passages with fatalistic medical or
mortality predictions were deliberately excluded. The elemental hand-shape classification is a
later (20th-century) convention and is labelled as such.
"""
import json
from pathlib import Path

CHEIRO = "Cheiro, Palmistry for All (1916), Project Gutenberg #20480"
CHEIRO_URL = "https://www.gutenberg.org/ebooks/20480"
ELEMENTAL = "Modern elemental hand classification (20th-century palmistry convention), paraphrased"

# (record suffix, feature_key, condition, theme, trait, claim, polarity, verbatim excerpt or None)
CLAIMS = [
    # Heart line ─ Cheiro ch. VII
    ("HEART-GENERAL", "line:heart", None, "relationships", "Affectionate nature",
     "In Cheiro's system the heart line relates to the affectionate disposition and the emotional side of love.", "neutral",
     "The Line of Heart relates purely to the affectionate disposition, in fact, to the mental side of the love nature of the subject."),
    ("HEART-JUPITER", "line:heart", "ends_under_jupiter", "relationships", "Idealistic, loyal affection",
     "A heart line reaching the Mount of Jupiter is read as idealistic, loyal and principled in affection.", "positive",
     "People with such a Heart Line are firm and reliable in their affections, they have an unusually high code of honour and morality."),
    ("HEART-BETWEEN", "line:heart", "ends_between_jupiter_saturn", "relationships", "Calm, deep affection",
     "A heart line ending between the first and second fingers is read as a calm but deep, self-sacrificing affection.", "positive",
     "gives a calmer but a very deep nature in all matters of the affections"),
    ("HEART-SATURN", "line:heart", "ends_under_saturn", "relationships", "Reserved in affection",
     "A heart line ending on the Mount of Saturn is read as reserved, undemonstrative and self-focused in love.", "challenge",
     "They are inclined to be cynical, reserved, undemonstrative but very insistent in trying to gain the person they want."),
    ("HEART-LONG", "line:heart", "long", "emotions", "Intense attachment",
     "An extremely long heart line is read as a tendency toward jealousy and intense attachment.", "challenge",
     "When the Line of Heart is found in excess, namely, extremely long--it denotes a terrible tendency toward jealousy"),
    ("HEART-SHORT", "line:heart", "short", "emotions", "Restrained sentiment",
     "A shorter heart line is read as less outward expression of the higher sentiments of affection.", "neutral",
     "The shorter the Line of Heart is on the Hand, the less the higher sentiments of the affection make themselves manifest."),
    ("HEART-DEEP", "line:heart", "deep", "relationships", "Warm and constant",
     "A deep, clear heart line is the form Cheiro considers healthy for the affections.", "positive",
     "The Line of Heart should be deep, clear, and well coloured."),
    ("HEART-FAINT", "line:heart", "faint", "emotions", "Cool reserve",
     "A thin or pale heart line is read as coolness or reserve in affection.", "challenge",
     "When the Line of Heart is very thin and with no branches, it denotes coldness and want of heart."),
    ("HEART-LOW", "line:heart", "close_to_head", "emotions", "Heart rules head",
     "When the heart line lies low, close to the head line, feelings tend to interfere with reasoning.", "neutral",
     "When very low down on the hand, almost touching the Line of Head, the heart will always interfere with the affairs of the head."),
    ("HEART-FORK", "line:heart", "forked_end", "relationships", "Balanced affection",
     "A heart line that forks between Jupiter and the space below the first two fingers is read as a balanced, happy affectionate disposition.", "positive",
     "it is an excellent sign of a well-balanced, happy, affectionate disposition"),
    ("HEART-BROKEN", "line:heart", "broken", "relationships", "Emotional upheaval",
     "A broken heart line is traditionally read as a period of deep emotional upheaval in relationships.", "challenge", None),

    # Head line ─ Cheiro ch. II
    ("HEAD-GENERAL", "line:head", None, "education", "Mentality",
     "Cheiro treats the head line as the most important line, indicating mentality and the direction of thought.", "neutral",
     "The Line of Head ... or indication of the Mentality of the subject, must in all cases be considered as the most important line on the hand."),
    ("HEAD-JOINED", "line:head", "joined_to_life", "personality", "Cautious and sensitive",
     "A head line joined to the life line at its start is read as a sensitive, cautious nature that tends to undervalue its own talents.", "neutral",
     "a highly sensitive disposition, which inclines towards the side of caution and also lacks self-confidence"),
    ("HEAD-SEPARATED", "line:head", "separated_from_life", "personality", "Independent thinker",
     "A head line starting slightly apart from the life line is read as independence of thought, quick judgement and mental daring.", "positive",
     "it is an excellent mark to have, giving independence of thought, quickness of judgment, and a certain mental daring"),
    ("HEAD-SEPARATED-PURPOSE", "line:head", "separated_from_life", "career", "Needs a purpose",
     "With the head line separated from the life line, Cheiro stresses that such people need a clear purpose to channel their quickness.", "challenge",
     "these people with the \"open Line of Head\" must, above all things, have purpose in their life."),
    ("HEAD-STRAIGHT", "line:head", "straight", "career", "Practical and determined",
     "A straight head line is read as practicality, conventional thinking and determination to carry plans through.", "positive",
     "The straighter the Head Line is found, the subject can be more relied on to carry out his determination"),
    ("HEAD-SLOPING", "line:head", "sloping", "creativity", "Imaginative and artistic",
     "A head line sloping toward the Mount of the Moon is read as an imaginative, artistic and romantic temperament.", "positive",
     "This form is largely found on the hands of artists, painters, and those who even in other walks of life have the sensitive artistic temperament"),
    ("HEAD-DEEP", "line:head", "deep", "education", "Concentrated mind",
     "A clean, deep head line is read as strong mental concentration; fine clear lines are associated with brain workers.", "positive",
     "A clean cut deep Line of Head is a more powerful sign of mentality than when the line is very broad"),
    ("HEAD-FAINT", "line:head", "faint", "education", "Changeable focus",
     "A broad or shallow head line is read as less concentration and a more changeable nature.", "challenge",
     "A wide broad line shows less concentration and a more vacillating changeable nature."),
    ("HEAD-FORK", "line:head", "forked_end", "education", "Two minds",
     "A forked head line is read as a balance between practical and imaginative thinking, sometimes with indecision.", "neutral",
     "this forked mark often indicates a certain want of decision."),
    ("HEAD-LONG", "line:head", "long", "education", "Broad mental range",
     "A long, well-marked head line is read as greater mental aptitude and range.", "positive",
     "With a Line of Head long and well marked, it increases all the promise of mental aptitude and success"),

    # Life line ─ Cheiro ch. III
    ("LIFE-GENERAL", "line:life", None, "health", "Vitality",
     "In Cheiro's system the life line relates to vitality and constitution rather than a fixed lifespan.", "neutral",
     "to be normal the Line of Life should be long, clearly marked, and without any irregularities or breaks of any kind."),
    ("LIFE-LONG", "line:life", "long", "health", "Strong constitution",
     "A long, clearly marked life line is read as vitality and strength of constitution.", "positive",
     "Such a formation would indicate length of life, vitality, freedom from illness, and strength of constitution"),
    ("LIFE-WIDE", "line:life", "wide_arc", "health", "Robust energy",
     "A life line sweeping in a wide curve into the palm is read as robust energy and warmth.", "positive",
     "whether it forms a well-defined curve or semicircle out into the palm"),
    ("LIFE-NARROW", "line:life", "close_to_thumb", "health", "Delicate constitution",
     "A life line hugging the thumb and narrowing the Mount of Venus is read as a more delicate constitution.", "challenge",
     "In the first case it indicates a naturally more delicate constitution, and less force of animal magnetism."),
    ("LIFE-DEEP", "line:life", "deep", "health", "Nerve and will-force",
     "A clear, thin, deep life line is read as nerve and will-force, more resilient than a broad shallow line.", "positive",
     "such an indication is not nearly as good a sign as a clear, thin, deep line."),
    ("LIFE-FAINT", "line:life", "faint", "health", "Lower reserves",
     "A broad, shallow life line is read as physical strength with less staying power under strain.", "challenge",
     "The broad Life Line seems to belong to people who have more robust animal strength"),
    ("LIFE-HIGH", "line:life", "starts_high", "leadership", "Self-control and ambition",
     "A life line rising high toward the Mount of Jupiter is read as self-control and an ambitious nature.", "positive",
     "the subject has more control over himself, and his life is more governed by the ambitious side of his nature."),
    ("LIFE-BROKEN", "line:life", "broken", "timing", "Change of circumstances",
     "Breaks in the life line are traditionally read as periods of change or reduced vitality; Cheiro reads them alongside other lines.", "challenge", None),

    # Fate line ─ Cheiro ch. V
    ("FATE-WRIST", "line:fate", "from_wrist", "career", "Steady destiny",
     "A fate line rising from the wrist straight toward Saturn is read as a strong sense of direction; Cheiro considers it most fortunate with a good Sun line.", "positive",
     "luck, brilliance, and success will attend the Destiny, and extreme good fortune may be anticipated."),
    ("FATE-MOON", "line:fate", "from_moon", "career", "Career shaped by others",
     "A fate line rising from the Mount of the Moon is read as an eventful, changeable career influenced by other people.", "neutral",
     "the Fate will be more eventful, changeable, and largely depending on the fancy and caprice of other people."),
    ("FATE-LIFE", "line:fate", "from_life", "career", "Self-made path",
     "A fate line starting in the middle of the palm is read as success won through one's own hard work.", "positive",
     "such a person will be the architect of his own fortunes"),
    ("FATE-BROKEN", "line:fate", "broken", "career", "Career changes",
     "A break in the fate line where the new piece overlaps the old is read as a change of position that can bring advancement.", "neutral",
     "it foretells a complete change in surroundings and position"),
    ("FATE-ABSENT", "line:fate", "absent", "career", "Self-directed life",
     "When no clear fate line is visible, Cheiro reads the destiny as less marked by outside events.", "neutral", None),

    # Sun line ─ Cheiro ch. VI
    ("SUN-PRESENT", "line:sun", "present", "career", "Recognition and brilliance",
     "A clear Sun (Apollo) line is read as magnetism, recognition and success.", "positive",
     "People with the Sun Line appear to have more magnetism, more influence over others."),
    ("SUN-FROM-FATE", "line:sun", "from_fate", "career", "Recognition through effort",
     "A Sun line rising from the fate line is read as recognition earned through personal effort.", "positive",
     "it is a sure sign of recognition for the career adopted, but brought about by the personal effort of the subject."),

    # Mounts ─ Cheiro Part II ch. V-XIII
    ("MOUNT-JUPITER-HIGH", "mount:jupiter", "prominent", "leadership", "Leadership and ambition",
     "A well-developed Mount of Jupiter is read as a desire to lead, organise and achieve distinct goals.", "positive",
     "When large, it shows desire to dominate, to rule and command others, to lead and organise"),
    ("MOUNT-JUPITER-RISK", "mount:jupiter", "prominent", "personality", "Pride",
     "With a weak head line, a large Mount of Jupiter is read as pride and self-opinion.", "challenge",
     "a large Mount of Jupiter gives pride, excess of vanity"),
    ("MOUNT-SATURN-HIGH", "mount:saturn", "prominent", "personality", "Prudence and seriousness",
     "A developed Mount of Saturn is read as prudence, quiet determination and love of solitude and serious study.", "neutral",
     "Its chief characteristics are love of solitude, prudence, quiet determination, the study of serious sombre things"),
    ("MOUNT-SATURN-FLAT", "mount:saturn", "flat", "personality", "Light-hearted outlook",
     "A flat Mount of Saturn is read as a lighter, less serious outlook on life.", "neutral",
     "A complete absence of this Mount indicates a more or less frivolous way of looking at life"),
    ("MOUNT-SUN-HIGH", "mount:sun", "prominent", "creativity", "Brilliance and love of beauty",
     "A well-developed Mount of the Sun (Apollo) is read as a desire to shine, enthusiasm for beauty and a sunny, generous temperament.", "positive",
     "When large or well developed it indicates glory, publicity, a desire to shine before one's fellows."),
    ("MOUNT-MERCURY-HIGH", "mount:mercury", "prominent", "communication", "Wit and eloquence",
     "A developed Mount of Mercury is read as quickness of mind, wit, eloquence and aptitude for science and commerce.", "positive",
     "It gives quickness of brain, wit, thought, eloquence. It also relates to adaptability in science and commerce"),
    ("MOUNT-MOON-HIGH", "mount:moon", "prominent", "creativity", "Imagination and romance",
     "A developed Mount of the Moon is read as imagination, romance, idealism and a love of travel and change.", "positive",
     "This Mount relates to everything that has to do with the imaginative faculties, the emotional artistic temperament, romance"),
    ("MOUNT-VENUS-HIGH", "mount:venus", "prominent", "relationships", "Warmth and companionship",
     "A well-formed Mount of Venus is read as a desire for love and companionship, warmth and love of beauty.", "positive",
     "When well-formed and not too large, it denotes a desire for love and companionship, the desire to please, worship of beauty"),
    ("MOUNT-VENUS-FLAT", "mount:venus", "flat", "relationships", "Reserved warmth",
     "A flat Mount of Venus is read as a cooler, less passionate temperament.", "neutral",
     "This Mount is therefore called Positive when high or large, and Negative when small or flat."),
    ("MOUNT-LOWER-MARS-HIGH", "mount:lower_mars", "prominent", "leadership", "Fighting spirit",
     "A developed lower (first) Mount of Mars is read as a martial, competitive nature with leadership drive.", "positive",
     "These subjects are born fighters in every sense of the word."),
    ("MOUNT-LOWER-MARS-RISK", "mount:lower_mars", "prominent", "emotions", "Quick temper",
     "A strong lower Mount of Mars is also read as a hasty temper that passes quickly.", "challenge",
     "The temper is hasty and explosive, but at the same time quickly over"),
    ("MOUNT-UPPER-MARS-HIGH", "mount:upper_mars", "prominent", "personality", "Moral courage",
     "A developed upper (second) Mount of Mars is read as moral courage and quiet determination; better organisers than leaders.", "positive",
     "The latter type are mentally very courageous, and possess _moral courage_ more than physical."),

    # Fingers and hand shape
    ("FINGER-INDEX-LONG", "finger:index", "longer_than_ring", "leadership", "Drive to lead",
     "An index finger longer than the ring finger is commonly read in palmistry as a Jupiter emphasis: ambition and a wish to lead.", "positive", None),
    ("FINGER-RING-LONG", "finger:ring", "longer_than_index", "creativity", "Creative risk-taker",
     "A ring finger longer than the index finger is commonly read as an Apollo emphasis: creativity and willingness to take risks.", "positive", None),
    ("THUMB-LONG", "finger:thumb", "long", "leadership", "Strong will",
     "A long thumb is traditionally read as strong will power and the capacity to direct one's own life.", "positive", None),
    ("SHAPE-EARTH", "hand_shape:earth", None, "career", "Practical and grounded",
     "A square palm with short fingers (earth hand) is read as practical, reliable and hands-on.", "positive", None),
    ("SHAPE-AIR", "hand_shape:air", None, "communication", "Communicative and curious",
     "A square palm with long fingers (air hand) is read as communicative, analytical and curious.", "positive", None),
    ("SHAPE-FIRE", "hand_shape:fire", None, "leadership", "Energetic and enthusiastic",
     "A long palm with short fingers (fire hand) is read as energetic, enthusiastic and action-oriented.", "positive", None),
    ("SHAPE-WATER", "hand_shape:water", None, "emotions", "Sensitive and intuitive",
     "A long palm with long fingers (water hand) is read as sensitive, intuitive and imaginative.", "positive", None),
]


def build() -> list[dict]:
    records = []
    for suffix, feature_key, condition, theme, trait, claim, polarity, wording in CLAIMS:
        is_cheiro = not (feature_key.startswith("hand_shape") or feature_key.startswith("finger:"))
        verbatim = wording is not None
        records.append({
            "record_id": f"PALM-{suffix}",
            "feature_key": feature_key,
            "condition": condition,
            "theme": theme,
            "category": feature_key.split(":")[0],
            "trait": trait,
            "claim": claim,
            "polarity": polarity,
            "source_name": CHEIRO if is_cheiro else ELEMENTAL if feature_key.startswith("hand_shape") else "General palmistry convention, paraphrased",
            "source_url": CHEIRO_URL if is_cheiro else None,
            "source_wording": wording,
            "claim_type": "traditional_interpretation",
            "verification_status": "verbatim_excerpt" if verbatim else "paraphrase",
        })
    return records


if __name__ == "__main__":
    out = Path(__file__).with_name("seed_claims.json")
    data = build()
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(data)} claims to {out}")
