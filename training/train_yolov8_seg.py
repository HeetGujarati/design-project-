"""
YOLOv8-seg Training Script for Concrete Crack/Damage Segmentation.

Trains a YOLOv8m-seg model on a structural damage dataset.
Run this script before deploying the worker — it produces the
trained model weights (best.pt) used by the inference engine.

Usage:
    python train_yolov8_seg.py
"""
from ultralytics import YOLO
import os


def train(
    data_yaml: str = "dataset.yaml",
    epochs: int = 100,
    imgsz: int = 640,
    batch: int = 16,
    device: str = "0",
    project: str = "runs/segment",
    name: str = "damage_seg_v1",
):
    """
    Train YOLOv8-seg on the structural damage dataset.
    
    Args:
        data_yaml: Path to dataset YAML config
        epochs: Number of training epochs
        imgsz: Training image size
        batch: Batch size (adjust based on GPU VRAM)
        device: CUDA device ID ("0" for first GPU)
        project: Output project directory
        name: Experiment name
    """
    print("=" * 60)
    print("🚀 Starting YOLOv8-seg Training for Damage Segmentation")
    print("=" * 60)

    # Load pre-trained YOLOv8m-seg (medium model — good speed/accuracy balance)
    model = YOLO("yolov8m-seg.pt")
    print(f"✅ Base model loaded: yolov8m-seg.pt")

    # Train
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        device=device,
        workers=4,
        patience=15,           # Early stopping after 15 epochs without improvement
        save=True,
        save_period=10,        # Save checkpoint every 10 epochs
        project=project,
        name=name,

        # Data Augmentation (blueprint: 'Data augmentation' task)
        augment=True,
        mosaic=1.0,
        flipud=0.5,
        fliplr=0.5,
        scale=0.5,
        translate=0.1,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,

        # Optimization
        optimizer="AdamW",
        lr0=0.001,
        lrf=0.01,
        weight_decay=0.0005,
        warmup_epochs=3,

        # Logging
        verbose=True,
        plots=True,
    )

    # Copy best weights to worker/models/
    best_weights = os.path.join(project, name, "weights", "best.pt")
    target_path = os.path.join("..", "worker", "models", "yolov8_damage_seg.pt")

    if os.path.exists(best_weights):
        import shutil
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        shutil.copy2(best_weights, target_path)
        print(f"\n✅ Best model weights copied to: {target_path}")
    else:
        print(f"\n⚠️ Best weights not found at: {best_weights}")

    print(f"\n{'=' * 60}")
    print(f"✅ Training complete!")
    print(f"📁 Results saved to: {project}/{name}/")
    print(f"🏆 Best model: {best_weights}")
    print(f"{'=' * 60}")

    return results


if __name__ == "__main__":
    train()
