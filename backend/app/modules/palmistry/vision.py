"""Palm image analysis: landmarks, principal-line tracing, mounts and hand geometry.

Pipeline
1. MediaPipe Tasks HandLandmarker -> 21 hand landmarks.
2. Similarity-warp the palm into a canonical frame: index-finger base at u=0, little-finger base at
   u=1, finger-base line at v=0 and wrist at v=1. The frame is the same for left/right hands and any
   rotation, so line corridors and mount positions are defined once.
3. Crease ("ridge") map: CLAHE -> Sato ridge filter (dark ridges) + morphological black-hat. If a
   trained U-Net is available (models/palm_lines_unet.onnx) its probability map is blended in.
4. Each principal line is traced as a minimum-cost path between landmark-anchored start and end
   zones, with a soft penalty for leaving its traditional corridor.
5. The traced path is trimmed to where crease evidence actually exists, and measured (length,
   depth, curvature, breaks, forks, endpoints). Mounts are scored from relative shading and line
   density.

All thresholds live in this module and are reported back in the calculation trace.
"""
from __future__ import annotations

import base64
import threading
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import cv2
import numpy as np
from skimage.filters import sato
from skimage.graph import MCP_Geometric

MODELS_DIR = Path(__file__).with_name("models")
LANDMARK_MODEL = MODELS_DIR / "hand_landmarker.task"
UNET_MODEL = MODELS_DIR / "palm_lines_unet.onnx"

S = 320  # canonical pixels per palm-width unit
CORRIDOR_WIDTH = 0.15   # palm widths at which leaving the template costs one unit
CORRIDOR_WEIGHT = 3.0
U_RANGE = (-0.45, 1.30)
V_RANGE = (-0.15, 1.12)

# Line corridors in canonical (u, v) coordinates.
LINE_SPECS = {
    "heart": {"name": "Heart line", "color": "#E0607E",
              "template": [(1.04, 0.17), (0.78, 0.17), (0.52, 0.14), (0.25, 0.09)],
              "start": ((0.90, 1.10), (0.06, 0.30)), "end": ((0.02, 0.52), (0.0, 0.24)), "min_len": 0.35},
    "head": {"name": "Head line", "color": "#4F8FE0",
             "template": [(0.00, 0.31), (0.30, 0.36), (0.60, 0.42), (0.90, 0.48)],
             "start": ((-0.14, 0.12), (0.14, 0.44)), "end": ((0.58, 1.04), (0.26, 0.75)), "min_len": 0.35},
    "life": {"name": "Life line", "color": "#3FA672",
             "template": [(0.00, 0.33), (0.12, 0.50), (0.20, 0.72), (0.28, 0.95)],
             "start": ((-0.16, 0.12), (0.16, 0.46)), "end": ((0.10, 0.50), (0.80, 1.06)), "min_len": 0.35},
    "fate": {"name": "Fate line", "color": "#B08A3E",
             "template": [(0.52, 1.00), (0.51, 0.72), (0.48, 0.45), (0.44, 0.20)],
             "start": ((0.32, 0.72), (0.80, 1.06)), "end": ((0.28, 0.62), (0.10, 0.45)), "min_len": 0.25},
    "sun": {"name": "Sun (Apollo) line", "color": "#E39B2D",
            "template": [(0.70, 0.80), (0.69, 0.55), (0.67, 0.30), (0.66, 0.12)],
            "start": ((0.56, 0.86), (0.62, 0.95)), "end": ((0.55, 0.80), (0.06, 0.30)), "min_len": 0.22},
}

# Mount centres are computed from the hand's own landmarks (canonical u, v). MediaPipe's knuckle
# points (5, 9, 13, 17) sit inside the palm at about heart-line level, so the finger mounts are
# centred on them; the little-finger edge lies ~0.17 palm widths beyond knuckle 17.
def _lerp(a, b, t: float) -> np.ndarray:
    return np.asarray(a, float) + (np.asarray(b, float) - np.asarray(a, float)) * t


MOUNT_SPECS = {
    "jupiter": {"name": "Mount of Jupiter", "r": 0.11, "center": lambda lm: lm[5] + (0.03, 0.02)},
    "saturn": {"name": "Mount of Saturn", "r": 0.10, "center": lambda lm: lm[9] + (0.0, 0.03)},
    "sun": {"name": "Mount of the Sun (Apollo)", "r": 0.10, "center": lambda lm: lm[13] + (0.0, 0.03)},
    "mercury": {"name": "Mount of Mercury", "r": 0.10, "center": lambda lm: lm[17] + (-0.02, 0.04)},
    # Between the thumb's middle joint and the index knuckle, just inside the start of the life line.
    "lower_mars": {"name": "Lower Mount of Mars", "r": 0.08, "center": lambda lm: _lerp(lm[5], lm[2], 0.45) + (0.08, 0.0)},
    # Ball of the thumb: between the thumb's base and middle joint, nudged toward the palm centre.
    "venus": {"name": "Mount of Venus", "r": 0.15, "center": lambda lm: _lerp(_lerp(lm[1], lm[2], 0.5), (0.5, 0.5), 0.2)},
    "upper_mars": {"name": "Upper Mount of Mars", "r": 0.09, "center": lambda lm: lm[17] + (0.05, 0.42)},
    "moon": {"name": "Mount of the Moon (Luna)", "r": 0.13, "center": lambda lm: _lerp(lm[17] + (0.04, 0.0), lm[0] + (0.17, 0.0), 0.75)},
    "plain_of_mars": {"name": "Plain of Mars", "r": 0.11, "center": lambda lm: np.mean([lm[0], lm[1], lm[5], lm[17]], axis=0)},
}

THRESHOLDS = {
    "evidence_on": 0.28,          # normalised crease response counted as "line present"
    "extent_density": 0.45,       # share of "on" pixels in a sliding window that marks the line's ends
    "presence_mean": 0.45,        # mean response along a principal line (heart, head, life) to call it detected
    "presence_mean_minor": 0.50,  # stricter for fate and sun lines, which are often absent
    "max_shared": 0.35,           # a fate/sun line sharing more than this share of its course with a principal line is dropped
    "gap_units": 0.06,            # a gap longer than this (palm widths) counts as a break
    "deep": 0.62, "medium": 0.45,  # depth bands on mean response
    "straight": 0.07, "curved": 0.16,  # sagitta / chord ratio bands
    "joined_units": 0.07,         # head and life starts closer than this are "joined"
    "mount_prominent": 0.35, "mount_flat": -0.35,
}


class PalmImageError(ValueError):
    pass


@dataclass
class Frame:
    affine: np.ndarray       # image px -> canonical raster px (2x3)
    inverse: np.ndarray      # canonical raster px -> image px (2x3)
    wrist_v_scale: float     # canonical y-units (palm widths) from finger base to wrist
    width: int
    height: int
    landmarks_uv: np.ndarray  # (21, 2) in (u, v)

    def uv_to_raster(self, u: float, v: float) -> tuple[float, float]:
        return (u - U_RANGE[0]) * S, (v * self.wrist_v_scale - V_RANGE[0] * self.wrist_v_scale) * S

    def raster_to_uv(self, x: float, y: float) -> tuple[float, float]:
        return x / S + U_RANGE[0], (y / S) / self.wrist_v_scale + V_RANGE[0]


# ── Landmarks ─────────────────────────────────────────────────────────────────
_detector_lock = threading.Lock()


@lru_cache(maxsize=1)
def _landmarker():
    from mediapipe.tasks.python import BaseOptions, vision
    options = vision.HandLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=str(LANDMARK_MODEL)),
        running_mode=vision.RunningMode.IMAGE, num_hands=1,
        min_hand_detection_confidence=0.4, min_hand_presence_confidence=0.4,
    )
    return vision.HandLandmarker.create_from_options(options)


def detect_landmarks(rgb: np.ndarray) -> tuple[np.ndarray, dict]:
    import mediapipe as mp
    image = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb))
    with _detector_lock:
        result = _landmarker().detect(image)
    if not result.hand_landmarks:
        raise PalmImageError("No hand was found. Photograph your open palm, fingers together, in good light, filling most of the frame.")
    h, w = rgb.shape[:2]
    points = np.array([[lm.x * w, lm.y * h] for lm in result.hand_landmarks[0]], dtype=np.float64)
    label = result.handedness[0][0].category_name.lower() if result.handedness else "unknown"
    score = float(result.handedness[0][0].score) if result.handedness else 0.0
    world = np.array([[lm.x, lm.y, lm.z] for lm in result.hand_world_landmarks[0]])
    normal_z = float(np.cross(world[5] - world[0], world[17] - world[0])[2])
    # A palm of the labelled hand faces the camera when the 3D palm normal points toward it:
    # negative z for a "right" label, positive for "left". The back of the opposite hand has the
    # same 2D outline but the opposite normal, which is how the two are told apart.
    palm_side = normal_z < 0 if label == "right" else normal_z > 0
    return points, {"handedness": label, "handedness_score": round(score, 3), "palm_side": bool(palm_side), "normal_z": round(normal_z * 1e4, 2)}


def build_frame(points: np.ndarray) -> Frame:
    p5, p17, p0 = points[5], points[17], points[0]
    width = np.linalg.norm(p17 - p5)
    if width < 40:
        raise PalmImageError("The hand is too small in the photo. Move closer so the palm fills most of the frame.")
    ex = (p17 - p5) / width
    ey = np.array([-ex[1], ex[0]])
    if np.dot(p0 - p5, ey) < 0:
        ey = -ey
    rot = np.vstack([ex, ey])  # rows: canonical axes
    canon = (rot @ (points - p5).T).T / width  # palm-width units
    wrist_v_scale = float(canon[0, 1])
    if not 0.6 < wrist_v_scale < 2.2:
        raise PalmImageError("The hand pose is unusual. Hold the palm flat, facing the camera, with fingers pointing up.")
    uv = canon.copy()
    uv[:, 1] = canon[:, 1] / wrist_v_scale

    a = rot * (S / width)
    offset = np.array([U_RANGE[0] * S, V_RANGE[0] * wrist_v_scale * S])
    b = -a @ p5 - offset
    affine = np.hstack([a, b[:, None]])
    out_w = int((U_RANGE[1] - U_RANGE[0]) * S)
    out_h = int((V_RANGE[1] - V_RANGE[0]) * wrist_v_scale * S)
    return Frame(affine, cv2.invertAffineTransform(affine), wrist_v_scale, out_w, out_h, uv)


# ── Crease map ────────────────────────────────────────────────────────────────
def _palm_mask(frame: Frame, warped_bgr: np.ndarray) -> np.ndarray:
    uv = frame.landmarks_uv
    poly_uv = [uv[1], uv[2], uv[5], uv[9], uv[13], uv[17], (1.10, 0.06), (1.08, 0.97), uv[0],
               ((uv[0][0] + uv[1][0]) / 2 - 0.05, (uv[0][1] + uv[1][1]) / 2)]
    poly = np.array([frame.uv_to_raster(float(u), float(v)) for u, v in poly_uv], dtype=np.int32)
    mask = np.zeros((frame.height, frame.width), np.uint8)
    cv2.fillPoly(mask, [poly], 255)

    ycrcb = cv2.cvtColor(warped_bgr, cv2.COLOR_BGR2YCrCb)
    skin = cv2.inRange(ycrcb, (0, 128, 70), (255, 180, 135))
    combined = cv2.bitwise_and(mask, skin)
    if combined.sum() > 0.55 * mask.sum():  # trust the skin model only when it agrees with the polygon
        combined = cv2.morphologyEx(combined, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
        count, labels, stats, _ = cv2.connectedComponentsWithStats(combined)
        if count > 1:
            largest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
            mask = np.where(labels == largest, 255, 0).astype(np.uint8)
    erode = max(5, S // 40)
    return cv2.erode(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (erode, erode)))


@lru_cache(maxsize=1)
def _unet_session():
    if not UNET_MODEL.exists():
        return None
    try:
        import onnxruntime as ort
    except ImportError:
        return None
    return ort.InferenceSession(str(UNET_MODEL), providers=["CPUExecutionProvider"])


# Bump whenever detection or measurement changes, so saved readings from older logic are not reused.
PIPELINE_VERSION = "palm-v4"


def detector_name() -> str:
    return ("unet+ridge" if _unet_session() is not None else "ridge_filter") + f":{PIPELINE_VERSION}"


def crease_map(warped_bgr: np.ndarray, mask: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    lab = cv2.cvtColor(warped_bgr, cv2.COLOR_BGR2LAB)
    lum = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8)).apply(lab[:, :, 0])
    smooth = cv2.GaussianBlur(lum, (0, 0), 1.2)
    # Principal lines are wider than the fine skin texture, so the smallest scale is 3 px.
    ridges = sato(smooth.astype(np.float32) / 255.0, sigmas=(3.0, 4.5, 6.0), black_ridges=True)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (S // 14 | 1, S // 14 | 1))
    blackhat = cv2.morphologyEx(smooth, cv2.MORPH_BLACKHAT, kernel).astype(np.float32)

    def norm(x: np.ndarray) -> np.ndarray:
        inside = x[mask > 0]
        hi = np.percentile(inside, 99.0) if inside.size else 1.0
        return np.clip(x / (hi + 1e-6), 0, 1)

    response = 0.6 * norm(ridges) + 0.4 * norm(blackhat)
    session = _unet_session()
    if session is not None:
        size = 256
        inp = cv2.resize(cv2.cvtColor(warped_bgr, cv2.COLOR_BGR2RGB), (size, size)).astype(np.float32) / 255.0
        inp = ((inp - (0.485, 0.456, 0.406)) / (0.229, 0.224, 0.225)).transpose(2, 0, 1)[None].astype(np.float32)
        logits = session.run(None, {session.get_inputs()[0].name: inp})[0][0, 0]
        prob = cv2.resize(1 / (1 + np.exp(-logits)), (warped_bgr.shape[1], warped_bgr.shape[0]))
        response = 0.7 * prob + 0.3 * response
    response[mask == 0] = 0
    return response.astype(np.float32), lum


# ── Line tracing ──────────────────────────────────────────────────────────────
def _zone_pixels(frame: Frame, zone, mask: np.ndarray) -> list[tuple[int, int]]:
    (u0, u1), (v0, v1) = zone
    x0, y0 = frame.uv_to_raster(u0, v0)
    x1, y1 = frame.uv_to_raster(u1, v1)
    xs = np.arange(int(max(0, x0)), int(min(frame.width - 1, x1)), 2)
    ys = np.arange(int(max(0, y0)), int(min(frame.height - 1, y1)), 2)
    return [(int(y), int(x)) for y in ys for x in xs if mask[y, x] > 0]


def _trace(frame: Frame, spec: dict, response: np.ndarray, mask: np.ndarray) -> np.ndarray | None:
    template = np.array([frame.uv_to_raster(u, v) for u, v in spec["template"]], dtype=np.int32)
    guide = np.full(response.shape, 255, np.uint8)
    cv2.polylines(guide, [template], False, 0, 1)
    distance = cv2.distanceTransform(guide, cv2.DIST_L2, 3) / (CORRIDOR_WIDTH * S)
    # Squared response makes the path snap to real creases rather than to fine skin texture;
    # the corridor term keeps each line in its traditional region.
    cost = 1.0 / (0.02 + response ** 2) + CORRIDOR_WEIGHT * distance ** 2
    cost[mask == 0] = 400.0
    starts, ends = _zone_pixels(frame, spec["start"], mask), _zone_pixels(frame, spec["end"], mask)
    if not starts or not ends:
        return None
    mcp = MCP_Geometric(cost, fully_connected=True)
    costs, _ = mcp.find_costs(starts, ends, find_all_ends=True)
    # Choose the end with the lowest cost per unit of length. The cheapest absolute end is always
    # the nearest one, which cut lines short wherever the crease kept going.
    origin = np.mean(starts, axis=0)
    per_length = [costs[y, x] / max(float(np.hypot(y - origin[0], x - origin[1])), 0.15 * S) for y, x in ends]
    best = ends[int(np.argmin(per_length))]
    path = np.array(mcp.traceback(best), dtype=np.float64)  # (row, col)
    return path[:, ::-1]  # (x, y)


def _discount_shared_creases(lines: dict, response: np.ndarray) -> None:
    """Fate and sun lines run across the heart and head lines. Where a minor line's path rides along a
    detected principal crease, that stretch is evidence for the principal line, not the minor one, so
    it is excluded; a minor line that mostly shares another crease is not reported."""
    occupied = np.zeros(response.shape, np.uint8)
    for key in ("heart", "head", "life"):
        line = lines.get(key, {})
        if line.get("detected") and line.get("raster_path") is not None:
            cv2.polylines(occupied, [line["raster_path"].astype(np.int32)], False, 255, max(3, int(0.05 * S)))
    for key in ("fate", "sun"):
        line = lines.get(key, {})
        path = line.get("raster_path")
        if not line.get("detected") or path is None:
            continue
        xs, ys = path[:, 0].astype(int), path[:, 1].astype(int)
        shared = occupied[ys, xs] > 0
        line["shared_with_principal"] = round(float(shared.mean()), 2)
        own = response[ys[~shared], xs[~shared]]
        own_mean = float(own.mean()) if own.size else 0.0
        if shared.mean() > THRESHOLDS["max_shared"] or own_mean < THRESHOLDS["presence_mean_minor"]:
            line["detected"] = False
            line["reason"] = "Its visible course mostly follows the head or heart line, so it is not counted separately."
        line["mean_crease_response"] = round(own_mean, 3)


def _arc_length(points: np.ndarray) -> float:
    return float(np.sum(np.linalg.norm(np.diff(points, axis=0), axis=1))) if len(points) > 1 else 0.0


def _measure(frame: Frame, key: str, spec: dict, path: np.ndarray, response: np.ndarray) -> dict:
    values = response[path[:, 1].astype(int), path[:, 0].astype(int)]
    smooth = np.convolve(values, np.ones(7) / 7, mode="same")
    on = smooth >= THRESHOLDS["evidence_on"]
    window = max(9, S // 30)
    density = np.convolve(on.astype(float), np.ones(window) / window, mode="same")
    good = np.where(density >= THRESHOLDS["extent_density"])[0]
    base = {"key": key, "name": spec["name"], "color": spec["color"], "detected": False}
    if good.size == 0:
        return {**base, "reason": "No continuous crease evidence along the expected corridor."}
    start, end = int(good[0]), int(good[-1])
    extent = path[start:end + 1]
    ext_on = on[start:end + 1]
    length_units = _arc_length(extent) / S
    mean_response = float(values[start:end + 1].mean())

    gap_px = THRESHOLDS["gap_units"] * S
    breaks, run = 0, 0.0
    steps = np.linalg.norm(np.diff(extent, axis=0), axis=1)
    for is_on, step in zip(ext_on[1:], steps):
        if is_on:
            if run >= gap_px:
                breaks += 1
            run = 0.0
        else:
            run += step

    chord = extent[-1] - extent[0]
    chord_len = np.linalg.norm(chord) + 1e-6
    normal = np.array([-chord[1], chord[0]]) / chord_len
    offsets = (extent - extent[0]) @ normal
    sagitta = float(np.max(np.abs(offsets)) / chord_len)

    presence = THRESHOLDS["presence_mean_minor"] if key in ("fate", "sun") else THRESHOLDS["presence_mean"]
    detected = length_units >= spec["min_len"] and mean_response >= presence
    depth = "deep" if mean_response >= THRESHOLDS["deep"] else "medium" if mean_response >= THRESHOLDS["medium"] else "faint"
    curvature = "straight" if sagitta < THRESHOLDS["straight"] else "gently curved" if sagitta < THRESHOLDS["curved"] else "strongly curved"
    start_uv = frame.raster_to_uv(*extent[0])
    end_uv = frame.raster_to_uv(*extent[-1])
    coverage = float(ext_on.mean())
    confidence = round(float(np.clip(mean_response * 0.6 + coverage * 0.4, 0, 1)), 2)
    return {
        **base,
        "detected": bool(detected),
        "raster_path": extent,
        "raster_trace": path,
        "length_palm_widths": round(length_units, 2),
        "mean_crease_response": round(mean_response, 3),
        "coverage": round(coverage, 2),
        "depth": depth,
        "sagitta_ratio": round(sagitta, 3),
        "curvature": curvature,
        "breaks": breaks,
        "start_uv": [round(float(start_uv[0]), 3), round(float(start_uv[1]), 3)],
        "end_uv": [round(float(end_uv[0]), 3), round(float(end_uv[1]), 3)],
        "confidence": confidence,
        "forked_end": _forked(extent, response, at_start=(key in ("heart",))),
    }


def _forked(extent: np.ndarray, response: np.ndarray, at_start: bool = False) -> bool:
    """Look for two or more crease arms leaving the terminal point (excluding the incoming one)."""
    if len(extent) < 20:
        return False
    tip = extent[-1] if not at_start else extent[0]
    prev = extent[-15] if not at_start else extent[14]
    incoming = np.degrees(np.arctan2(*(prev - tip)[::-1]))
    radius = 0.07 * S
    angles = np.arange(0, 360, 6)
    hits = []
    for angle in angles:
        x = int(tip[0] + radius * np.cos(np.radians(angle)))
        y = int(tip[1] + radius * np.sin(np.radians(angle)))
        inside = 0 <= y < response.shape[0] and 0 <= x < response.shape[1]
        away = abs((angle - incoming + 180) % 360 - 180) > 70
        hits.append(inside and away and response[y, x] >= THRESHOLDS["evidence_on"] + 0.1)
    arms, previous = 0, False
    for hit in hits + hits[:1]:
        if hit and not previous:
            arms += 1
        previous = hit
    return arms >= 2


# ── Mounts and geometry ───────────────────────────────────────────────────────
def _mounts(frame: Frame, lum: np.ndarray, response: np.ndarray, mask: np.ndarray) -> dict:
    inside = mask > 0
    lum_mean, lum_std = float(lum[inside].mean()), float(lum[inside].std() + 1e-6)
    res_mean, res_std = float(response[inside].mean()), float(response[inside].std() + 1e-6)
    out = {}
    for key, spec in MOUNT_SPECS.items():
        cu, cv_ = (float(x) for x in spec["center"](frame.landmarks_uv))
        cx, cy = frame.uv_to_raster(cu, cv_)
        radius = spec["r"] * S
        region = np.zeros_like(mask)
        cv2.circle(region, (int(cx), int(cy)), int(radius), 255, -1)
        region = (region > 0) & inside
        if region.sum() < 30:
            out[key] = {"name": spec["name"], "center_raster": (cx, cy), "radius_raster": radius,
                        "development": "not_visible", "index": None, "brightness_z": None, "line_density_z": None}
            continue
        bright_z = (float(lum[region].mean()) - lum_mean) / lum_std
        density_z = (float(response[region].mean()) - res_mean) / res_std
        index = round(0.7 * bright_z - 0.3 * density_z, 2)
        development = "prominent" if index >= THRESHOLDS["mount_prominent"] else "flat" if index <= THRESHOLDS["mount_flat"] else "average"
        out[key] = {"name": spec["name"], "center_raster": (cx, cy), "radius_raster": radius,
                    "development": development, "index": index,
                    "brightness_z": round(bright_z, 2), "line_density_z": round(density_z, 2)}
    return out


def _seg_len(points: np.ndarray, ids: list[int]) -> float:
    return float(sum(np.linalg.norm(points[a] - points[b]) for a, b in zip(ids, ids[1:])))


def hand_geometry(points: np.ndarray) -> dict:
    width = np.linalg.norm(points[17] - points[5]) * 1.2  # MCP span underestimates full palm width
    palm_length = np.linalg.norm(points[0] - (points[5] + points[17]) / 2)
    middle = _seg_len(points, [9, 10, 11, 12])
    index = _seg_len(points, [5, 6, 7, 8])
    ring = _seg_len(points, [13, 14, 15, 16])
    thumb = _seg_len(points, [2, 3, 4])
    palm_ratio = palm_length / width
    finger_ratio = middle / palm_length
    square = palm_ratio < 1.0
    long_fingers = finger_ratio >= 0.86
    shape = {(True, False): "earth", (True, True): "air", (False, False): "fire", (False, True): "water"}[(square, long_fingers)]
    index_ring = index / ring
    return {
        "palm_length_to_width": round(float(palm_ratio), 3),
        "middle_finger_to_palm": round(float(finger_ratio), 3),
        "palm_shape": "square" if square else "long",
        "finger_length": "long" if long_fingers else "short",
        "element": shape,
        "index_to_ring": round(float(index_ring), 3),
        "index_vs_ring": "index_longer" if index_ring > 1.02 else "ring_longer" if index_ring < 0.98 else "equal",
        "thumb_to_index": round(float(thumb / index), 3),
        "thumb": "long" if thumb / index >= 0.72 else "average",
        "rules": {
            "palm_shape": "square when palm length / (1.2 x knuckle span) < 1.0, else long",
            "finger_length": "long when middle-finger length / palm length >= 0.86",
            "index_vs_ring": "index longer when index/ring > 1.02, ring longer when < 0.98",
            "thumb": "long when thumb length / index length >= 0.72",
        },
    }


# ── Public entry point ────────────────────────────────────────────────────────
def _to_image_points(frame: Frame, raster_points: np.ndarray) -> np.ndarray:
    homo = np.hstack([raster_points, np.ones((len(raster_points), 1))])
    return homo @ frame.inverse.T


def decode_image(data: bytes) -> np.ndarray:
    array = np.frombuffer(data, np.uint8)
    bgr = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if bgr is None:
        raise PalmImageError("The file is not a readable image. Upload a JPEG or PNG photo.")
    longest = max(bgr.shape[:2])
    if longest > 1600:
        scale = 1600 / longest
        bgr = cv2.resize(bgr, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    if min(bgr.shape[:2]) < 240:
        raise PalmImageError("The image is too small. Upload a photo at least 480 pixels across.")
    return bgr


def analyse(bgr: np.ndarray, hand: str) -> dict:
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    points, pose = detect_landmarks(rgb)
    if not pose["palm_side"]:
        raise PalmImageError("This looks like the back of the hand. Photograph the palm side, fingers together and pointing up.")
    warnings = []
    if pose["handedness"] in ("left", "right") and pose["handedness"] != hand:
        warnings.append(f"The photo looks like a {pose['handedness']} hand but '{hand}' was selected (a mirrored selfie can cause this). The reading uses your selection.")
    frame = build_frame(points)
    warped = cv2.warpAffine(bgr, frame.affine, (frame.width, frame.height), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    mask = _palm_mask(frame, warped)
    response, lum = crease_map(warped, mask)
    sharpness = float(cv2.Laplacian(lum, cv2.CV_64F)[mask > 0].var())

    lines = {}
    for key, spec in LINE_SPECS.items():
        path = _trace(frame, spec, response, mask)
        lines[key] = _measure(frame, key, spec, path, response) if path is not None else {
            "key": key, "name": spec["name"], "color": spec["color"], "detected": False, "reason": "Corridor outside the visible palm."}
    _discount_shared_creases(lines, response)
    mounts = _mounts(frame, lum, response, mask)

    h, w = bgr.shape[:2]
    scale_img = np.linalg.norm(points[17] - points[5]) / S
    overlay_lines = []
    for line in lines.values():
        if line.get("raster_path") is None:
            continue
        pts = _to_image_points(frame, line.pop("raster_path"))[::3]
        trace = _to_image_points(frame, line.pop("raster_trace"))[::4]
        line["points"] = [[round(x / w, 4), round(y / h, 4)] for x, y in pts]
        if line["detected"] or line.get("length_palm_widths", 0) >= 0.15:
            overlay_lines.append({"key": line["key"], "name": line["name"], "color": line["color"],
                                  "detected": line["detected"], "points": line["points"],
                                  "trace": [[round(x / w, 4), round(y / h, 4)] for x, y in trace]})
    overlay_mounts = []
    for key, mount in mounts.items():
        cx, cy = _to_image_points(frame, np.array([mount.pop("center_raster")]))[0]
        r = mount.pop("radius_raster") * scale_img
        mount["center"] = [round(cx / w, 4), round(cy / h, 4)]
        overlay_mounts.append({"key": key, "name": mount["name"], "development": mount["development"],
                               "cx": round(cx / w, 4), "cy": round(cy / h, 4), "rx": round(r / w, 4), "ry": round(r / h, 4)})

    return {
        "image": {"width": w, "height": h, "sharpness": round(sharpness, 1)},
        "landmarks": [[round(x / w, 4), round(y / h, 4)] for x, y in points],
        "landmarks_uv": [[round(float(u), 3), round(float(v), 3)] for u, v in frame.landmarks_uv],
        "pose": pose,
        "warnings": warnings,
        "lines": lines,
        "mounts": mounts,
        "geometry": hand_geometry(points),
        "overlay": {"lines": overlay_lines, "mounts": overlay_mounts},
        "detector": detector_name(),
        "thresholds": THRESHOLDS,
        "annotated_image": annotate(bgr, overlay_lines, overlay_mounts),
    }


def annotate(bgr: np.ndarray, lines: list[dict], mounts: list[dict]) -> str:
    h, w = bgr.shape[:2]
    canvas = bgr.copy()
    thickness = max(2, int(round(max(h, w) / 350)))
    for mount in mounts:
        center = (int(mount["cx"] * w), int(mount["cy"] * h))
        axes = (int(mount["rx"] * w), int(mount["ry"] * h))
        cv2.ellipse(canvas, center, axes, 0, 0, 360, (91, 161, 198), max(1, thickness - 1), cv2.LINE_AA)
    for line in lines:
        color = tuple(int(line["color"][i:i + 2], 16) for i in (5, 3, 1))  # hex -> BGR
        pts = np.array([[int(x * w), int(y * h)] for x, y in line["points"]], np.int32)
        cv2.polylines(canvas, [pts], False, color if line["detected"] else (170, 170, 170), thickness + 1, cv2.LINE_AA)
    scale = 1000 / max(h, w)
    if scale < 1:
        canvas = cv2.resize(canvas, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    ok, buf = cv2.imencode(".jpg", canvas, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return "data:image/jpeg;base64," + base64.b64encode(buf.tobytes()).decode() if ok else ""
