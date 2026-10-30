from __future__ import annotations

import hashlib
import json
import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.llm import generate_json, llm_available, normalize_text
from app.db.models import KnowledgeClaim, PalmReading
from app.modules.palmistry.vision import analyse, annotate, decode_image, detector_name

logger = logging.getLogger(__name__)

CLAIM_FIELDS = ("record_id", "feature_key", "condition", "theme", "category", "trait", "claim", "polarity",
                "source_name", "source_url", "source_wording", "claim_type", "verification_status")


def derive_conditions(analysis: dict) -> list[dict]:
    """Translate measurements into named palmistry conditions. Every condition records the rule
    and the measured values that triggered it, which the UI shows in the calculation section."""
    lines, mounts, geometry = analysis["lines"], analysis["mounts"], analysis["geometry"]
    out: list[dict] = []

    def add(feature_key: str, condition: str | None, rule: str, measured: str, weight: float, label: str) -> None:
        out.append({"feature_key": feature_key, "condition": condition, "rule": rule, "measured": measured, "weight": weight, "label": label})

    def line_basics(key: str, line: dict, long_at: float, short_at: float) -> None:
        name = line["name"]
        add(f"line:{key}", None, f"{name} detected", f"confidence {line['confidence']}", 0.6, f"{name} present")
        length = line["length_palm_widths"]
        if length >= long_at:
            add(f"line:{key}", "long", f"length >= {long_at} palm widths", f"{length}", 0.8, f"Long {name.lower()}")
        elif length <= short_at:
            add(f"line:{key}", "short", f"length <= {short_at} palm widths", f"{length}", 0.7, f"Short {name.lower()}")
        if line["depth"] in ("deep", "faint"):
            add(f"line:{key}", line["depth"], "mean crease response band", f"{line['mean_crease_response']}", 0.6, f"{line['depth'].capitalize()} {name.lower()}")
        if line["breaks"] >= 1:
            add(f"line:{key}", "broken", "gap longer than 0.06 palm widths", f"{line['breaks']} gap(s)", 0.5, f"Break(s) in the {name.lower()}")
        if line.get("forked_end"):
            add(f"line:{key}", "forked_end", "two or more crease arms at the terminal point", "fork found", 0.5, f"Forked {name.lower()}")

    heart, head, life, fate, sun = (lines[k] for k in ("heart", "head", "life", "fate", "sun"))
    uv = analysis.get("landmarks_uv")

    if heart["detected"]:
        line_basics("heart", heart, long_at=0.95, short_at=0.5)
        end_u = heart["end_uv"][0]
        index_u, middle_u = 0.0, uv[9][0] if uv else 0.33
        nearest = min((abs(end_u - index_u), "ends_under_jupiter", "Jupiter (index finger)"),
                      (abs(end_u - (index_u + middle_u) / 2), "ends_between_jupiter_saturn", "between index and middle fingers"),
                      (abs(end_u - middle_u), "ends_under_saturn", "Saturn (middle finger)"))
        add("line:heart", nearest[1], "nearest finger-base anchor to the radial end of the heart line",
            f"end u={end_u} (index 0.00, middle {middle_u:.2f})", 0.9, f"Heart line ends toward {nearest[2]}")
        if head["detected"]:
            gap = head["start_uv"][1] - heart["end_uv"][1]
            if gap < 0.12:
                add("line:heart", "close_to_head", "vertical gap between heart end and head start < 0.12", f"{gap:.3f}", 0.6, "Heart line lies close to the head line")

    if head["detected"]:
        line_basics("head", head, long_at=0.85, short_at=0.45)
        slope = head["end_uv"][1] - head["start_uv"][1]
        if slope <= 0.12:
            add("line:head", "straight", "head line drops <= 0.12 palm heights across the palm", f"drop {slope:.3f}", 0.9, "Straight head line")
        elif slope >= 0.2:
            add("line:head", "sloping", "head line drops >= 0.20 palm heights toward the Mount of the Moon", f"drop {slope:.3f}", 0.9, "Sloping head line")
        if life["detected"]:
            distance = ((head["start_uv"][0] - life["start_uv"][0]) ** 2 + (head["start_uv"][1] - life["start_uv"][1]) ** 2) ** 0.5
            joined = distance <= analysis["thresholds"]["joined_units"]
            add("line:head", "joined_to_life" if joined else "separated_from_life",
                f"head and life line starts {'within' if joined else 'further than'} {analysis['thresholds']['joined_units']} palm widths",
                f"{distance:.3f}", 0.9, "Head line joined to life line" if joined else "Head line separate from life line")

    if life["detected"]:
        line_basics("life", life, long_at=0.75, short_at=0.4)
        bulge = life["sagitta_ratio"]
        if bulge >= 0.16:
            add("line:life", "wide_arc", "life line sagitta/chord >= 0.16", f"{bulge}", 0.8, "Life line sweeps wide into the palm")
        elif bulge <= 0.07:
            add("line:life", "close_to_thumb", "life line sagitta/chord <= 0.07", f"{bulge}", 0.8, "Life line hugs the thumb")
        if life["start_uv"][1] <= 0.3:
            add("line:life", "starts_high", "life line starts at v <= 0.30 (toward Jupiter)", f"v={life['start_uv'][1]}", 0.6, "Life line begins high")

    if fate["detected"]:
        line_basics("fate", fate, long_at=0.7, short_at=0.3)
        su, sv = fate["start_uv"]
        if sv >= 0.82 and 0.35 <= su <= 0.68:
            add("line:fate", "from_wrist", "fate line starts near the wrist (v >= 0.82) in the centre", f"start ({su}, {sv})", 0.9, "Fate line rises from the wrist")
        elif su > 0.62:
            add("line:fate", "from_moon", "fate line starts on the ulnar side (u > 0.62)", f"start ({su}, {sv})", 0.9, "Fate line rises from the Mount of the Moon")
        elif sv < 0.7:
            add("line:fate", "from_life", "fate line starts mid-palm (v < 0.70)", f"start ({su}, {sv})", 0.8, "Fate line begins in mid-palm")
    else:
        add("line:fate", "absent", "no fate line passed the detection threshold", f"confidence {fate.get('confidence', 0)}", 0.4, "No clear fate line")

    if sun["detected"]:
        add("line:sun", "present", "sun line passed the detection threshold", f"length {sun['length_palm_widths']}", 0.7, "Sun (Apollo) line present")

    for key, mount in mounts.items():
        if mount["development"] in ("prominent", "flat"):
            add(f"mount:{key}", mount["development"], f"mount index {'>=' if mount['development'] == 'prominent' else '<='} threshold (0.7 x shading z - 0.3 x line-density z)",
                f"index {mount['index']}", 0.4, f"{mount['name']} appears {mount['development']}")

    add(f"hand_shape:{geometry['element']}", None, "palm shape x finger length (see geometry rules)",
        f"palm {geometry['palm_shape']} ({geometry['palm_length_to_width']}), fingers {geometry['finger_length']} ({geometry['middle_finger_to_palm']})",
        0.6, f"{geometry['element'].capitalize()} hand")
    if geometry["index_vs_ring"] == "index_longer":
        add("finger:index", "longer_than_ring", geometry["rules"]["index_vs_ring"], f"index/ring {geometry['index_to_ring']}", 0.5, "Index finger longer than ring finger")
    elif geometry["index_vs_ring"] == "ring_longer":
        add("finger:ring", "longer_than_index", geometry["rules"]["index_vs_ring"], f"index/ring {geometry['index_to_ring']}", 0.5, "Ring finger longer than index finger")
    if geometry["thumb"] == "long":
        add("finger:thumb", "long", geometry["rules"]["thumb"], f"thumb/index {geometry['thumb_to_index']}", 0.5, "Long thumb")
    return out


def collect_evidence(db: Session, conditions: list[dict]) -> list[dict]:
    evidence = []
    for cond in conditions:
        query = select(KnowledgeClaim).where(KnowledgeClaim.system == "palmistry", KnowledgeClaim.feature_key == cond["feature_key"])
        query = query.where(KnowledgeClaim.condition.is_(None) if cond["condition"] is None else KnowledgeClaim.condition == cond["condition"])
        records = list(db.scalars(query.order_by(KnowledgeClaim.record_id)))
        cond["record_ids"] = [r.record_id for r in records]
        for record in records:
            evidence.append({
                "evidence_id": f"P{len(evidence) + 1:02d}",
                **{field: getattr(record, field) for field in CLAIM_FIELDS},
                "basis": f"{cond['label']} ({cond['measured']})", "factor": cond["feature_key"], "weight": cond["weight"],
            })
    return evidence


SYSTEM_PROMPT = """
You are the writer of a premium palm-reading report in the tradition of Cheiro. You are strictly
grounded: the evidence list is the ONLY permitted source of meaning.

Each evidence item has an evidence_id, a traditional claim, and a `basis` naming the measured palm
feature that activated it (for example "Sloping head line (drop 0.24)"). Weight reflects how reliably
the feature was measured from the photo; mount readings from a photo are the least reliable.

RULES
1. Do not invent features, traits, events, dates or predictions. Use only the evidence.
2. Every section and prediction must cite evidence_ids from the input.
3. Frame everything as traditional palmistry ("in Cheiro's tradition", "traditionally read as"), never
   as fact or certainty. Give no medical, lifespan or health diagnoses and no advice.
4. Where evidence conflicts, say so and explain which carries more weight.
5. Address the reader as "you". Never show evidence IDs, snake_case or field names in prose.

WRITE
- headline: an evocative 5-10 word title for the hand.
- overview: 3-4 graceful sentences synthesising the hand shape and principal lines.
- sections: for each of personality, relationships, career, education (mind), creativity, health
  (vitality, never diagnosis) that has evidence: {"key", "title", "text" (2-3 sentences), "evidence_ids"}.
- predictions: 3-5 items {"area", "text" (one cautious traditional tendency), "reasoning" (which
  measured features lead to it and why), "confidence" ("high" if several well-measured features agree,
  "medium" for one clear feature, "low" for mount-only or conflicting evidence), "evidence_ids"}.

Return ONE JSON object: {"headline": "", "overview": "", "sections": [], "predictions": []}
""".strip()


def interpret(evidence: list[dict]) -> dict:
    if not evidence:
        return {"generation_status": "no_source_records"}
    payload = {"evidence": [{k: e[k] for k in ("evidence_id", "trait", "claim", "polarity", "theme", "basis", "weight")} for e in evidence]}
    parsed = generate_json(SYSTEM_PROMPT, payload, max_tokens=2200, temperature=0.2, cache_namespace="palmistry.reading.v2")
    allowed = {e["evidence_id"] for e in evidence}

    def ids(item: dict) -> list[str]:
        raw = item.get("evidence_ids", []) if isinstance(item, dict) else []
        return list(dict.fromkeys(i for i in raw if isinstance(i, str) and i in allowed)) if isinstance(raw, list) else []

    sections = [
        {"key": str(s.get("key", "")), "title": normalize_text(str(s.get("title", ""))), "text": normalize_text(s["text"]), "evidence_ids": ids(s)}
        for s in parsed.get("sections", []) if isinstance(s, dict) and isinstance(s.get("text"), str) and ids(s)
    ] if isinstance(parsed.get("sections"), list) else []
    predictions = [
        {"area": str(p.get("area", "")), "text": normalize_text(p["text"]), "reasoning": normalize_text(str(p.get("reasoning") or "")),
         "confidence": p.get("confidence") if p.get("confidence") in ("high", "medium", "low") else "low", "evidence_ids": ids(p)}
        for p in parsed.get("predictions", []) if isinstance(p, dict) and isinstance(p.get("text"), str) and ids(p)
    ] if isinstance(parsed.get("predictions"), list) else []
    return {
        "headline": normalize_text(str(parsed.get("headline") or "")),
        "overview": normalize_text(str(parsed.get("overview") or "")),
        "sections": sections, "predictions": predictions, "generation_status": "generated",
    }


def _saved_reading(db: Session, *, owner_key: str | None, digest: str, hand: str) -> PalmReading | None:
    """A previous successful reading of this exact photo by the same user with the current pipeline."""
    if not owner_key:
        return None
    rows = db.scalars(
        select(PalmReading).where(
            PalmReading.user_id == owner_key, PalmReading.image_sha256 == digest,
            PalmReading.hand == hand, PalmReading.detector == detector_name(),
        ).order_by(PalmReading.id.desc())
    )
    for row in rows:
        if json.loads(row.result_json).get("interpretation", {}).get("generation_status") == "generated":
            return row
    return None


def build_reading(db: Session, *, image_bytes: bytes, hand: str, owner_key: str | None) -> dict:
    bgr = decode_image(image_bytes)
    digest = hashlib.sha256(image_bytes).hexdigest()
    saved = _saved_reading(db, owner_key=owner_key, digest=digest, hand=hand)
    if saved is not None:
        # Same photo, same hand, same pipeline: return the identical reading (only the image is redrawn).
        result = json.loads(saved.result_json)
        overlay = result["analysis"]["overlay"]
        return {**result, "reading_id": saved.id, "reused": True, "annotated_image": annotate(bgr, overlay["lines"], overlay["mounts"])}

    analysis = analyse(bgr, hand)
    annotated = analysis.pop("annotated_image")
    conditions = derive_conditions(analysis)
    evidence = collect_evidence(db, conditions)

    interpretation: dict = {"generation_status": "llm_not_configured"}
    if llm_available():
        try:
            interpretation = interpret(evidence)
        except Exception:
            logger.exception("Palmistry interpretation failed")
            interpretation = {"generation_status": "generation_failed"}

    result = {
        "hand": hand,
        "analysis": analysis,
        "conditions": conditions,
        "evidence": evidence,
        "interpretation": interpretation,
        "method": {
            "pipeline_version": analysis["detector"],
            "landmarks": "MediaPipe Tasks HandLandmarker (21 keypoints, float16 model)",
            "line_detector": "U-Net probability map blended with ridge filter" if analysis["detector"].startswith("unet")
            else "Sato multi-scale ridge filter + morphological black-hat, minimum-cost path tracing in landmark-anchored corridors",
            "mounts": "Relative shading and crease density inside landmark-anchored regions (low reliability from a 2D photo)",
            "knowledge_base": "Cheiro, Palmistry for All (1916), Project Gutenberg #20480, with verbatim excerpts",
        },
        "disclaimer": (
            "Palmistry is a traditional practice, not a scientifically validated method. Lines are detected "
            "automatically from a single photo and can be missed or misplaced by lighting, focus and hand pose; "
            "nothing here is a health assessment or a prediction of lifespan."
        ),
    }
    row = PalmReading(
        user_id=owner_key, hand=hand, image_sha256=digest,
        detector=analysis["detector"], result_json=json.dumps(result, ensure_ascii=False),
    )
    db.add(row)
    db.commit()
    result["reading_id"] = row.id
    result["annotated_image"] = annotated
    return result
