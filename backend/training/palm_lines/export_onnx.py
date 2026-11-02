"""Export a trained palm-line checkpoint to ONNX for CPU inference in the backend.

    python export_onnx.py --weights runs/v1/best.pt --out ../../app/modules/palmistry/models/palm_lines_unet.onnx

The model takes a 1x3xSxS ImageNet-normalised RGB image and returns 1x4xSxS logits in the channel
order heart, head, life, fate. The ONNX metadata records that order and the input size.
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import onnx
import onnxruntime as ort
import segmentation_models_pytorch as smp
import torch


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--weights", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    args = ap.parse_args()

    ckpt = torch.load(args.weights, map_location="cpu")
    size, lines = ckpt["size"], ckpt["lines"]
    model = smp.Unet(ckpt["encoder"], encoder_weights=None, in_channels=3, classes=len(lines))
    model.load_state_dict(ckpt["state_dict"])
    model.eval()

    dummy = torch.randn(1, 3, size, size)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    torch.onnx.export(model, dummy, str(args.out), input_names=["image"], output_names=["logits"], opset_version=17, do_constant_folding=True)

    proto = onnx.load(str(args.out))
    for key, value in {"lines": ",".join(lines), "size": str(size), "epoch": str(ckpt["epoch"])}.items():
        entry = proto.metadata_props.add()
        entry.key, entry.value = key, value
    onnx.save(proto, str(args.out))

    with torch.no_grad():
        expected = model(dummy).numpy()
    got = ort.InferenceSession(str(args.out), providers=["CPUExecutionProvider"]).run(None, {"image": dummy.numpy()})[0]
    print(f"exported {args.out} ({args.out.stat().st_size / 1e6:.1f} MB), max abs diff vs torch: {np.abs(expected - got).max():.2e}")


if __name__ == "__main__":
    main()
