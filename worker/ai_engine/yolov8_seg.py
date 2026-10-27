"""
Core YOLOv8-seg Inference Engine
Produces all 6 required outputs from blueprint Section 3:
  1. Original Image
  2. Damage Mask (pixel-level binary/colored segmentation)
  3. Overlay Image (semi-transparent translucent color mask)
  4. Bounding Box (with confidence scores)
  5. Damaged Area (exact pixel count + metric area estimate)
  6. Percentage of Damaged Pixels (with severity classification)
"""
import cv2
import numpy as np
import time
import os
from dataclasses import dataclass, field
from typing import List, Optional
from ultralytics import YOLO


@dataclass
class BBoxData:
    """Single bounding box around a detected defect cluster."""
    x: int
    y: int
    w: int
    h: int
    confidence: float


@dataclass
class SegmentationResult:
    """
    Complete output package containing all 6 required workflow outputs
    from blueprint Section 3.
    """
    # Output 1: Original Image
    original_image: np.ndarray

    # Output 2: Damage Mask
    damage_mask: np.ndarray

    # Output 3: Overlay Image
    overlay_image: np.ndarray

    # Output 4: Bounding Boxes
    bounding_boxes: List[BBoxData] = field(default_factory=list)

    # Output 5: Damaged Area
    damaged_pixels: int = 0
    total_pixels: int = 0

    # Output 6: Damage Percentage & Severity
    damage_percentage: float = 0.0
    severity: str = "LOW"  # LOW | MODERATE | CRITICAL

    # Metadata
    inference_time_ms: float = 0.0


class DamageSegmentationEngine:
    """
    YOLOv8-seg based damage segmentation engine.
    
    Loads a fine-tuned YOLOv8 segmentation model and processes
    structural images to produce pixel-level damage analysis.
    """

    # Overlay colors for damage visualization (BGR format)
    DAMAGE_COLOR = (0, 0, 255)       # Red for damage
    BBOX_COLOR = (0, 255, 0)         # Green for bounding boxes
    OVERLAY_ALPHA = 0.35             # Translucency for overlay blend

    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the engine with a trained YOLOv8-seg model.
        
        Args:
            model_path: Path to .pt weights file. Falls back to
                       MODEL_PATH env var or default yolov8m-seg.pt
        """
        if model_path is None:
            model_path = os.getenv("MODEL_PATH", "yolov8m-seg.pt")

        print(f"🧠 Loading segmentation model: {model_path}")
        self.model = YOLO(model_path)
        self.device = os.getenv("DEVICE", "0")
        print(f"✅ Model loaded. Device: {self.device}")

    def process(self, image_bytes: bytes) -> SegmentationResult:
        """
        Run full segmentation pipeline on an image.
        
        Args:
            image_bytes: Raw image bytes (JPEG/PNG)
            
        Returns:
            SegmentationResult with all 6 outputs
        """
        # ── Decode Image ──
        img_array = np.frombuffer(image_bytes, np.uint8)
        original = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        if original is None:
            raise ValueError("Failed to decode image bytes")

        h, w = original.shape[:2]
        total_pixels = h * w

        # ── Run YOLOv8-seg Inference ──
        start_time = time.perf_counter()
        results = self.model.predict(
            source=original,
            imgsz=640,
            conf=0.25,
            iou=0.45,
            device=self.device,
            verbose=False,
        )
        inference_ms = (time.perf_counter() - start_time) * 1000

        # ── OUTPUT 2: Damage Mask ──
        mask = np.zeros((h, w), dtype=np.uint8)
        bboxes: List[BBoxData] = []

        result = results[0]

        if result.masks is not None and len(result.masks.data) > 0:
            for i, seg_mask in enumerate(result.masks.data):
                # Resize mask to original image dimensions
                m = seg_mask.cpu().numpy()
                m = cv2.resize(m, (w, h), interpolation=cv2.INTER_LINEAR)
                mask[m > 0.5] = 255

                # ── OUTPUT 4: Bounding Boxes ──
                if result.boxes is not None and i < len(result.boxes):
                    box = result.boxes[i]
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                    conf = float(box.conf[0].cpu().numpy())
                    bboxes.append(BBoxData(
                        x=int(x1),
                        y=int(y1),
                        w=int(x2 - x1),
                        h=int(y2 - y1),
                        confidence=round(conf, 3),
                    ))

        # ── OUTPUT 3: Overlay Image ──
        overlay = self._create_overlay(original, mask, bboxes)

        # ── OUTPUT 5: Damaged Area ──
        damaged_pixels = int(np.count_nonzero(mask))

        # ── OUTPUT 6: Damage Percentage & Severity ──
        damage_percentage = round((damaged_pixels / total_pixels) * 100, 2) if total_pixels > 0 else 0.0
        severity = self._classify_severity(damage_percentage)

        return SegmentationResult(
            original_image=original,
            damage_mask=mask,
            overlay_image=overlay,
            bounding_boxes=bboxes,
            damaged_pixels=damaged_pixels,
            total_pixels=total_pixels,
            damage_percentage=damage_percentage,
            severity=severity,
            inference_time_ms=round(inference_ms, 1),
        )

    def _create_overlay(
        self,
        original: np.ndarray,
        mask: np.ndarray,
        bboxes: List[BBoxData],
    ) -> np.ndarray:
        """
        Create a semi-transparent damage overlay on the original image.
        Red regions indicate damage, green boxes show defect clusters.
        """
        overlay = original.copy()

        # Apply red translucent mask on damaged regions
        if np.any(mask > 0):
            red_layer = np.zeros_like(original)
            red_layer[mask > 0] = self.DAMAGE_COLOR
            overlay = cv2.addWeighted(
                overlay, 1 - self.OVERLAY_ALPHA,
                red_layer, self.OVERLAY_ALPHA,
                0,
            )

        # Draw bounding boxes with confidence labels
        for bb in bboxes:
            # Box
            cv2.rectangle(
                overlay,
                (bb.x, bb.y),
                (bb.x + bb.w, bb.y + bb.h),
                self.BBOX_COLOR,
                2,
            )
            # Confidence label
            label = f"Damage {bb.confidence:.1%}"
            label_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
            cv2.rectangle(
                overlay,
                (bb.x, bb.y - label_size[1] - 10),
                (bb.x + label_size[0] + 4, bb.y),
                self.BBOX_COLOR,
                -1,
            )
            cv2.putText(
                overlay,
                label,
                (bb.x + 2, bb.y - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 0, 0),
                2,
            )

        return overlay

    @staticmethod
    def _classify_severity(damage_percentage: float) -> str:
        """
        Classify damage severity based on blueprint Section 5 (Graph 2):
        - 0% - 15%   → LOW (Green)    — Routine monitoring
        - 15% - 30%  → MODERATE (Amber) — Scheduled maintenance
        - 30% - 100% → CRITICAL (Red)  — Urgent intervention
        """
        if damage_percentage < 15.0:
            return "LOW"
        elif damage_percentage < 30.0:
            return "MODERATE"
        else:
            return "CRITICAL"
