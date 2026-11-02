"""Train the palm-line segmentation model used by app/modules/palmistry/vision.py.

Data: Roboflow Universe "Palm lines recognition" v5 (CC BY 4.0), exported in COCO keypoint format.
Each image labels the heart, head, life and fate lines with 10 points each. The points are drawn as
thick polylines to make one mask channel per line, and a U-Net (MobileNetV2 encoder) learns all four
channels with independent sigmoids, since lines touch where they join or cross.

Usage (GPU recommended):
    python train.py --data <export dir with train/ valid/ test/> --out runs/v1 --epochs 30
    python export_onnx.py --weights runs/v1/best.pt --out ../../app/modules/palmistry/models/palm_lines_unet.onnx
"""
from __future__ import annotations

import argparse
import json
import random
import time
from pathlib import Path

import albumentations as A
import cv2
import numpy as np
import segmentation_models_pytorch as smp
import torch
from torch.utils.data import DataLoader, Dataset

# Channel order shared with export_onnx.py and the backend.
LINES = ["heart", "head", "life", "fate"]
SIZE = 384
THICKNESS = 5  # mask line width in pixels at SIZE
MEAN, STD = (0.485, 0.456, 0.406), (0.229, 0.224, 0.225)


def load_split(split_dir: Path) -> list[tuple[Path, dict[str, np.ndarray]]]:
    coco = json.loads((split_dir / "_annotations.coco.json").read_text(encoding="utf-8"))
    names = {c["id"]: c["name"] for c in coco["categories"]}
    by_image: dict[int, dict[str, np.ndarray]] = {}
    for ann in coco["annotations"]:
        name = names.get(ann["category_id"])
        if name not in LINES:
            continue
        k = np.asarray(ann["keypoints"], np.float32).reshape(-1, 3)
        by_image.setdefault(ann["image_id"], {})[name] = k[k[:, 2] > 0][:, :2]
    return [(split_dir / im["file_name"], by_image[im["id"]]) for im in coco["images"] if im["id"] in by_image]


def render_masks(lines: dict[str, np.ndarray], size: int) -> np.ndarray:
    masks = np.zeros((len(LINES), size, size), np.uint8)
    for i, name in enumerate(LINES):
        pts = lines.get(name)
        if pts is not None and len(pts) >= 2:
            cv2.polylines(masks[i], [np.round(pts).astype(np.int32)], False, 1, THICKNESS, cv2.LINE_AA)
    return masks


class PalmLines(Dataset):
    def __init__(self, items, train: bool):
        self.items = items
        geo = [A.Affine(scale=(0.7, 1.25), translate_percent=(-0.08, 0.08), rotate=(-35, 35), p=0.85),
               A.HorizontalFlip(p=0.5)] if train else []
        photo = [A.RandomBrightnessContrast(0.25, 0.25, p=0.6), A.HueSaturationValue(8, 20, 15, p=0.4),
                 A.OneOf([A.GaussianBlur(blur_limit=(3, 5)), A.ImageCompression(quality_range=(45, 90)), A.GaussNoise(std_range=(0.02, 0.06))], p=0.35),
                 A.RandomShadow(p=0.15)] if train else []
        self.tf = A.Compose([A.Resize(SIZE, SIZE), *geo, *photo],
                            keypoint_params=A.KeypointParams(format="xy", label_fields=["line_ids"], remove_invisible=False))

    def __len__(self):
        return len(self.items)

    def __getitem__(self, idx):
        path, lines = self.items[idx]
        img = cv2.cvtColor(cv2.imread(str(path)), cv2.COLOR_BGR2RGB)
        kps, ids = [], []
        for i, name in enumerate(LINES):
            for x, y in lines.get(name, []):
                kps.append((float(x), float(y)))
                ids.append(i)
        out = self.tf(image=img, keypoints=kps, line_ids=ids)
        pts = np.asarray(out["keypoints"], np.float32).reshape(-1, 2)
        ids = np.asarray(out["line_ids"])
        masks = render_masks({name: pts[ids == i] for i, name in enumerate(LINES)}, SIZE)
        x = ((out["image"].astype(np.float32) / 255.0 - MEAN) / STD).transpose(2, 0, 1)
        return torch.from_numpy(x.astype(np.float32)), torch.from_numpy(masks.astype(np.float32))


def dice_loss(logits, target, eps=1.0):
    p = torch.sigmoid(logits)
    inter = (p * target).sum((2, 3))
    return 1 - ((2 * inter + eps) / (p.sum((2, 3)) + target.sum((2, 3)) + eps)).mean()


@torch.no_grad()
def evaluate(model, loader, device):
    """Per-line Dice, plus point recall/precision with a 6 px tolerance (thin-line friendly)."""
    model.eval()
    inter = np.zeros(len(LINES)); total = np.zeros(len(LINES))
    rec_hit = np.zeros(len(LINES)); rec_n = np.zeros(len(LINES)); prec_hit = np.zeros(len(LINES)); prec_n = np.zeros(len(LINES))
    kernel = np.ones((13, 13), np.uint8)
    for x, y in loader:
        with torch.autocast(device.type, enabled=device.type == "cuda"):
            pred = (torch.sigmoid(model(x.to(device))) > 0.5).float().cpu().numpy()
        y = y.numpy()
        inter += (pred * y).sum((0, 2, 3)); total += pred.sum((0, 2, 3)) + y.sum((0, 2, 3))
        for b in range(pred.shape[0]):
            for c in range(len(LINES)):
                gt, pr = y[b, c] > 0, pred[b, c] > 0
                if gt.any():
                    rec_n[c] += gt.sum(); rec_hit[c] += (gt & (cv2.dilate(pr.astype(np.uint8), kernel) > 0)).sum()
                if pr.any():
                    prec_n[c] += pr.sum(); prec_hit[c] += (pr & (cv2.dilate(gt.astype(np.uint8), kernel) > 0)).sum()
    dice = 2 * inter / np.maximum(total, 1)
    return {name: {"dice": round(float(dice[i]), 3), "recall": round(float(rec_hit[i] / max(rec_n[i], 1)), 3),
                   "precision": round(float(prec_hit[i] / max(prec_n[i], 1)), 3)} for i, name in enumerate(LINES)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", type=Path, required=True)
    ap.add_argument("--out", type=Path, default=Path("runs/v1"))
    ap.add_argument("--epochs", type=int, default=30)
    ap.add_argument("--batch", type=int, default=12)
    ap.add_argument("--lr", type=float, default=1e-3)
    ap.add_argument("--workers", type=int, default=4)
    args = ap.parse_args()
    random.seed(0); np.random.seed(0); torch.manual_seed(0)
    args.out.mkdir(parents=True, exist_ok=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    train_ds = PalmLines(load_split(args.data / "train"), train=True)
    valid_ds = PalmLines(load_split(args.data / "valid"), train=False)
    train_dl = DataLoader(train_ds, args.batch, shuffle=True, num_workers=args.workers, pin_memory=True, drop_last=True, persistent_workers=args.workers > 0)
    valid_dl = DataLoader(valid_ds, args.batch, shuffle=False, num_workers=args.workers, persistent_workers=args.workers > 0)
    print(f"device={device} train={len(train_ds)} valid={len(valid_ds)}", flush=True)

    model = smp.Unet("mobilenet_v2", encoder_weights="imagenet", in_channels=3, classes=len(LINES)).to(device)
    opt = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    sched = torch.optim.lr_scheduler.OneCycleLR(opt, max_lr=args.lr, total_steps=args.epochs * len(train_dl), pct_start=0.1)
    scaler = torch.amp.GradScaler(enabled=device.type == "cuda")
    # Lines cover ~2% of pixels, so positives are up-weighted in the BCE term.
    bce = torch.nn.BCEWithLogitsLoss(pos_weight=torch.full((len(LINES), 1, 1), 4.0, device=device))

    best, history = -1.0, []
    for epoch in range(1, args.epochs + 1):
        model.train(); t0 = time.time(); running = 0.0
        for x, y in train_dl:
            x, y = x.to(device, non_blocking=True), y.to(device, non_blocking=True)
            with torch.autocast(device.type, enabled=device.type == "cuda"):
                logits = model(x)
                loss = bce(logits, y) + dice_loss(logits.float(), y)
            opt.zero_grad(set_to_none=True)
            scaler.scale(loss).backward(); scaler.step(opt); scaler.update(); sched.step()
            running += loss.item()
        metrics = evaluate(model, valid_dl, device)
        mean_dice = float(np.mean([m["dice"] for m in metrics.values()]))
        history.append({"epoch": epoch, "loss": round(running / len(train_dl), 4), "mean_dice": round(mean_dice, 4), **metrics})
        print(f"epoch {epoch:02d} loss {running / len(train_dl):.4f} dice {mean_dice:.3f} "
              + " ".join(f"{k}:{v['dice']:.2f}/{v['recall']:.2f}/{v['precision']:.2f}" for k, v in metrics.items())
              + f" ({time.time() - t0:.0f}s)", flush=True)
        if mean_dice > best:
            best = mean_dice
            torch.save({"state_dict": model.state_dict(), "encoder": "mobilenet_v2", "lines": LINES, "size": SIZE, "epoch": epoch, "metrics": metrics}, args.out / "best.pt")
        (args.out / "history.json").write_text(json.dumps(history, indent=1))

    test_ds = PalmLines(load_split(args.data / "test"), train=False)
    ckpt = torch.load(args.out / "best.pt", map_location=device)
    model.load_state_dict(ckpt["state_dict"])
    test = evaluate(model, DataLoader(test_ds, args.batch, num_workers=0), device)
    (args.out / "test_metrics.json").write_text(json.dumps({"best_epoch": ckpt["epoch"], "test": test}, indent=1))
    print("best epoch", ckpt["epoch"], "test", test, flush=True)


if __name__ == "__main__":
    main()
