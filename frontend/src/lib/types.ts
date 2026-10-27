export type SeverityLevel = 'LOW' | 'MODERATE' | 'CRITICAL';

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
  confidence: number;
}

export interface InspectionData {
  id: string;
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  originalImageKey: string;
  originalImageUrl?: string;
  maskImageKey?: string;
  maskImageUrl?: string;
  overlayImageKey?: string;
  overlayImageUrl?: string;
  structureType: string;
  bboxData: BoundingBox[];
  damagedPixels: number;
  totalPixels: number;
  damagePercentage: number;
  severity: SeverityLevel;
  modelUsed: string;
  inferenceTimeMs: number;
  createdAt: string;
  completedAt?: string;
}

export interface ModelBenchmark {
  model: string;
  mIoU: number;
  precision: number;
  recall: number;
  f1_score: number;
  inference_ms: number;
}

export interface TaskProgressMessage {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  damagePercentage?: number;
  severity?: SeverityLevel;
  error?: string;
}
