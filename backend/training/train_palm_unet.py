"""Train the optional palm-line U-Net and export it to ONNX for the palmistry module.

Recommended data (see training/README.md): Roboflow Universe palm-line segmentation sets released
under CC BY 4.0 (e.g. "Palm-Detection-1", 286 images with heart/head/life/fate masks), exported in
"COCO Segmentation" format, optionally extended with your own labels on 11k Hands photos.

Each image is warped into the same canonical palm frame the app uses at inference
(app.modules.palmistry.vision.build_frame), so the model learns lines in a consistent position.

Usage (needs a separate environment with PyTorch):
    pip install torch segmentation-models-pytorch albumentations onnx
    python training/train_palm_unet.py --data path/to/export --epochs 60
Output: app/modules/palmistry/models/palm_lines_unet.onnx (picked up automatically; install onnxruntime).
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.modules.palmistry.vision import PalmImageError, build_frame, detect_landmarks  # noqa: E402

SIZE = 256
OUTPUT = ROOT / "app" / "modules" / "palmistry" / "models" / "palm_lines_unet.onnx"


def load_split(split_dir: Path) -> list[tuple[np.ndarray, np.ndarray]]:
    """Return (canonical image, binary line mask) pairs from a Roboflow COCO export split."""
    coco = json.loads((split_dir / "_annotations.coco.json").read_text())
    by_image: dict[int, list] = {}
    for ann in coco["annotations"]:
        by_image.setdefault(ann["image_id"], []).append(ann)
    samples = []
    for info in coco["images"]:
        bgr = cv2.imread(str(split_dir / info["file_name"]))
        if bgr is None:
            continue
        mask = np.zeros(bgr.shape[:2], np.uint8)
        for ann in by_image.get(info["id"], []):
            for poly in ann.get("segmentation", []):
                pts = np.array(poly, np.float32).reshape(-1, 2).astype(np.int32)
                cv2.fillPoly(mask, [pts], 255)
        try:
            points, pose = detect_landmarks(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))
            frame = build_frame(points)
        except PalmImageError:
            continue  # images without a detectable palm cannot be put in the canonical frame
        size = (frame.width, frame.height)
        warped = cv2.warpAffine(bgr, frame.affine, size, borderMode=cv2.BORDER_REPLICATE)
        warped_mask = cv2.warpAffine(mask, frame.affine, size, flags=cv2.INTER_NEAREST)
        samples.append((cv2.resize(warped, (SIZE, SIZE)), (cv2.resize(warped_mask, (SIZE, SIZE)) > 127).astype(np.float32)))
    return samples


def main() -> None:
    import segmentation_models_pytorch as smp
    import torch
    from torch.utils.data import DataLoader, Dataset

    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, required=True, help="Roboflow COCO export with train/ and valid/ folders")
    parser.add_argument("--epochs", type=int, default=60)
    parser.add_argument("--encoder", default="mobilenet_v2", help="lightweight encoders keep CPU inference fast")
    args = parser.parse_args()

    train, valid = load_split(args.data / "train"), load_split(args.data / "valid")
    print(f"{len(train)} training and {len(valid)} validation palms in the canonical frame")
    mean, std = np.array([0.485, 0.456, 0.406]), np.array([0.229, 0.224, 0.225])

    class Palms(Dataset):
        def __init__(self, samples, augment):
            self.samples, self.augment = samples, augment

        def __len__(self):
            return len(self.samples)

        def __getitem__(self, i):
            image, mask = self.samples[i]
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
            if self.augment:
                # Photometric jitter only: geometry is already normalised by the canonical frame.
                image = np.clip(image * np.random.uniform(0.75, 1.25) + np.random.uniform(-0.08, 0.08), 0, 1)
            image = ((image - mean) / std).transpose(2, 0, 1).astype(np.float32)
            return torch.from_numpy(image), torch.from_numpy(mask[None])

    model = smp.Unet(args.encoder, encoder_weights="imagenet", in_channels=3, classes=1)
    dice = smp.losses.DiceLoss("binary")
    bce = torch.nn.BCEWithLogitsLoss(pos_weight=torch.tensor(8.0))  # lines are a tiny fraction of pixels
    optimiser = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=1e-4)
    train_loader = DataLoader(Palms(train, True), batch_size=8, shuffle=True)
    valid_loader = DataLoader(Palms(valid, False), batch_size=8)

    best = float("inf")
    for epoch in range(args.epochs):
        model.train()
        for x, y in train_loader:
            optimiser.zero_grad()
            logits = model(x)
            loss = dice(logits, y) + bce(logits, y)
            loss.backward()
            optimiser.step()
        model.eval()
        with torch.no_grad():
            val = sum(float(dice(model(x), y)) for x, y in valid_loader) / max(1, len(valid_loader))
        print(f"epoch {epoch + 1}: validation dice loss {val:.4f}")
        if val < best:
            best = val
            OUTPUT.parent.mkdir(parents=True, exist_ok=True)
            torch.onnx.export(model, torch.randn(1, 3, SIZE, SIZE), str(OUTPUT), input_names=["image"],
                              output_names=["logits"], opset_version=17)
    print(f"Best model exported to {OUTPUT}")


if __name__ == "__main__":
    main()
