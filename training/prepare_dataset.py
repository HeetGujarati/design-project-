"""
Dataset Preparation & Conversion Script
Converts binary mask annotations (Kaggle Concrete Crack / Bridge Crack datasets)
into YOLOv8-seg polygon annotation format (.txt files).
"""
import os
import cv2
import glob
import shutil
import numpy as np
from pathlib import Path


def convert_mask_to_yolo_seg(mask_path: str, img_w: int, img_h: int, class_id: int = 0) -> list[str]:
    """
    Convert a binary segmentation mask image into YOLOv8 polygon segment text lines.
    Each polygon line: <class-id> <x1> <y1> <x2> <y2> ... (normalized 0 to 1)
    """
    mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
    if mask is None:
        return []

    _, binary = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    annotations = []
    for contour in contours:
        if cv2.contourArea(contour) < 40:  # Filter out tiny noise specks
            continue
        
        # Approximate contour to reduce points for cleaner polygon annotations
        epsilon = 0.002 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        points = approx.reshape(-1, 2)
        
        if len(points) < 3:
            continue
            
        normalized = []
        for x, y in points:
            nx = max(0.0, min(1.0, x / img_w))
            ny = max(0.0, min(1.0, y / img_h))
            normalized.append(f"{nx:.6f} {ny:.6f}")
            
        annotations.append(f"{class_id} " + " ".join(normalized))
    return annotations


def prepare_dataset_splits(
    raw_images_dir: str,
    raw_masks_dir: str,
    output_base: str = "./data",
    val_ratio: float = 0.2
):
    """Split raw images and masks into train and val folders with YOLO segment labels."""
    os.makedirs(f"{output_base}/images/train", exist_ok=True)
    os.makedirs(f"{output_base}/images/val", exist_ok=True)
    os.makedirs(f"{output_base}/labels/train", exist_ok=True)
    os.makedirs(f"{output_base}/labels/val", exist_ok=True)

    image_files = sorted(glob.glob(f"{raw_images_dir}/*.*"))
    print(f"Found {len(image_files)} source images.")
    
    np.random.seed(42)
    indices = np.random.permutation(len(image_files))
    val_count = int(len(image_files) * val_ratio)
    
    for idx, img_idx in enumerate(indices):
        split = "val" if idx < val_count else "train"
        img_path = image_files[img_idx]
        stem = Path(img_path).stem
        ext = Path(img_path).suffix
        
        # Find corresponding mask
        mask_candidates = [
            f"{raw_masks_dir}/{stem}{ext}",
            f"{raw_masks_dir}/{stem}.png",
            f"{raw_masks_dir}/{stem}_mask.png",
        ]
        mask_path = next((m for m in mask_candidates if os.path.exists(m)), None)
        
        # Copy image
        target_img = f"{output_base}/images/{split}/{stem}{ext}"
        shutil.copy2(img_path, target_img)
        
        if mask_path:
            img = cv2.imread(img_path)
            if img is not None:
                h, w = img.shape[:2]
                labels = convert_mask_to_yolo_seg(mask_path, w, h, class_id=0)
                label_target = f"{output_base}/labels/{split}/{stem}.txt"
                with open(label_target, "w") as f:
                    f.write("\n".join(labels) + "\n")
                    
    print(f"Dataset preparation complete in {output_base}/")


if __name__ == "__main__":
    print("Dataset preparation utility ready.")
