import cv2
import numpy as np

from app.modules.palmistry.vision import S, THRESHOLDS, LINE_SPECS, _check_model_fate, _trace_probability, build_frame

# Index knuckle, little-finger knuckle and wrist in image pixels; the other landmarks are unused here.
POINTS = np.zeros((21, 2))
POINTS[5], POINTS[17], POINTS[0] = (100, 100), (300, 100), (200, 350)
FRAME = build_frame(POINTS)


def raster(u: float, v: float) -> tuple[int, int]:
    x, y = FRAME.uv_to_raster(u, v)
    return int(x), int(y)


def blank() -> np.ndarray:
    return np.zeros((FRAME.height, FRAME.width), np.float32)


def test_broken_line_is_traced_across_the_gap_and_oriented_like_its_template():
    prob = blank()
    cv2.line(prob, raster(0.50, 0.95), raster(0.49, 0.70), 0.9, 6)
    cv2.line(prob, raster(0.49, 0.60), raster(0.47, 0.30), 0.9, 6)  # a gap between v=0.70 and v=0.60
    path = _trace_probability(FRAME, LINE_SPECS["fate"], prob)
    assert path is not None
    start, end = FRAME.raster_to_uv(*path[0]), FRAME.raster_to_uv(*path[-1])
    assert start[1] > 0.9 and end[1] < 0.35, "fate line runs from the wrist up toward the fingers"


def test_stray_region_far_from_the_line_is_ignored():
    prob = blank()
    cv2.line(prob, raster(0.0, 0.32), raster(0.9, 0.48), 0.95, 6)
    cv2.circle(prob, raster(0.95, 1.0), 10, 0.9, -1)  # strong-ish blob well away from the head line
    path = _trace_probability(FRAME, LINE_SPECS["head"], prob)
    vs = [FRAME.raster_to_uv(x, y)[1] for x, y in path]
    assert max(vs) < 0.6


def _fate_lines(start_uv, end_uv, crease):
    path = np.array([raster(*start_uv), raster(*end_uv)], np.float64)
    path = np.linspace(path[0], path[1], 80)
    heart = np.linspace(raster(1.0, 0.17), raster(0.25, 0.09), 80)
    return {
        "fate": {"detected": True, "raster_path": path, "start_uv": list(start_uv), "end_uv": list(end_uv), "mean_crease_response": crease},
        "heart": {"detected": True, "raster_path": heart, "mean_crease_response": 0.6},
        "head": {"detected": True, "raster_path": heart + (0, 0.2 * S), "mean_crease_response": 0.6},
    }


def test_upright_well_creased_fate_line_is_kept():
    lines = _fate_lines((0.52, 0.98), (0.47, 0.45), crease=0.5)
    _check_model_fate(FRAME, lines)
    assert lines["fate"]["detected"]


def test_fate_candidate_running_across_the_palm_is_rejected():
    lines = _fate_lines((0.15, 0.95), (0.9, 0.55), crease=0.6)
    _check_model_fate(FRAME, lines)
    assert not lines["fate"]["detected"] and lines["fate"]["tilt_degrees"] > THRESHOLDS["fate_max_tilt"]


def test_faint_fate_candidate_is_rejected():
    lines = _fate_lines((0.52, 0.98), (0.47, 0.45), crease=0.2)
    _check_model_fate(FRAME, lines)
    assert not lines["fate"]["detected"] and "faint" in lines["fate"]["reason"]
