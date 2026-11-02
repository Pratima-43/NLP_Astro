# Palm-line model

This folder rebuilds `app/modules/palmistry/models/palm_lines_unet.onnx`, the model that tells the palmistry module which crease is the heart, head, life or fate line.

## Data

The data is **Palm lines recognition v5** from Roboflow Universe, by the Roboflow user *palmlinedetection*. It is licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) and available at https://universe.roboflow.com/palmlinedetection/palm-lines-recognition-azgh0.

- **Size:** 7,195 images, 640×640. The split is 6,355 train, 622 valid and 220 test. The training split includes Roboflow's augmented copies of about 2,100 source photos.
- **Labels:** COCO keypoints. Each of the heart, head, life and fate lines is traced with 10 points.

The data is not stored in the repository. To download it, set `ROBOFLOW_API_KEY` from a free Roboflow account and run:

```python
from roboflow import Roboflow
Roboflow(api_key=KEY).workspace("palmlinedetection").project("palm-lines-recognition-azgh0").version(5).download("coco", location="palm_data/v5")
```

## Model

- **Architecture:** a U-Net with a MobileNetV2 encoder (ImageNet weights), built with `segmentation_models_pytorch`, which is MIT-licensed.
- **Input and output:** the input is a 384×384 RGB crop around the hand. The output has four sigmoid channels, in the order heart, head, life, fate.
- **Training targets:** each line's 10 points are drawn as a 5 px polyline mask.
- **Loss:** BCE (positive weight 4) plus Dice.
- **Optimiser:** AdamW with a one-cycle learning-rate schedule and mixed precision.
- **Augmentation:** rotation of ±35°, scaling from 0.7 to 1.25, horizontal flips, brightness, contrast and colour changes, blur, JPEG compression, noise and shadows.

## Rebuild

A GPU is recommended. A laptop RTX 3050 takes a few minutes per epoch.

```bash
python -m venv trainenv && trainenv/Scripts/pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
trainenv/Scripts/pip install segmentation-models-pytorch albumentations opencv-python-headless onnx onnxruntime roboflow
trainenv/Scripts/python train.py --data palm_data/v5 --out runs/v1 --epochs 30
trainenv/Scripts/python export_onnx.py --weights runs/v1/best.pt --out ../../app/modules/palmistry/models/palm_lines_unet.onnx
```

`train.py` saves the best checkpoint by mean validation Dice. It writes `history.json` and `test_metrics.json`, which hold per-line Dice, recall and precision on the held-out test split, measured with a 6 px tolerance.

After exporting, bump `PIPELINE_VERSION` in `vision.py` so that saved readings are recomputed with the new model.
