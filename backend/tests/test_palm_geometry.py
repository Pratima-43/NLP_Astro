import numpy as np

from app.modules.palmistry.vision import MOUNT_SPECS

# Canonical (u, v) landmarks measured from a real right palm photo (index knuckle at u=0,
# little-finger knuckle at u=1, wrist at v=1). Only the indices the mounts use are filled in.
LANDMARKS = np.zeros((21, 2))
LANDMARKS[[0, 1, 2, 5, 9, 13, 17]] = [
    (0.91, 1.0), (0.29, 0.90), (-0.26, 0.71), (0.0, 0.0), (0.33, -0.09), (0.66, -0.08), (1.0, 0.0),
]


def center(key: str) -> np.ndarray:
    return np.asarray(MOUNT_SPECS[key]["center"](LANDMARKS))


def test_finger_mounts_sit_on_their_knuckles_not_below_the_heart_line():
    for key, knuckle in (("jupiter", 5), ("saturn", 9), ("sun", 13), ("mercury", 17)):
        c = center(key)
        assert abs(c[0] - LANDMARKS[knuckle][0]) < 0.05
        assert -0.1 < c[1] < 0.08, key


def test_thumb_side_and_edge_mounts_are_on_the_correct_sides():
    assert center("venus")[0] < center("plain_of_mars")[0] < center("moon")[0]
    assert center("lower_mars")[1] < center("venus")[1], "lower Mars lies above the ball of the thumb"
    assert center("upper_mars")[1] < center("moon")[1], "upper Mars lies above the Mount of the Moon"
    assert center("moon")[0] > 1.0 and center("upper_mars")[0] > 1.0, "both sit toward the little-finger edge"
