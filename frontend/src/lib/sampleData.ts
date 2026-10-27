import { InspectionData, ModelBenchmark } from './types';

const toBase64 = (str: string) => {
  if (typeof window !== 'undefined' && window.btoa) {
    return `data:image/svg+xml;base64,${window.btoa(str)}`;
  }
  return `data:image/svg+xml;base64,${Buffer.from(str).toString('base64')}`;
};

const rawConcreteSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <radialGradient id="vignette-raw" cx="50%" cy="50%" r="70%">
      <stop offset="30%" stop-color="#71717a"/>
      <stop offset="100%" stop-color="#3f3f46"/>
    </radialGradient>
  </defs>
  <rect width="800" height="600" fill="url(#vignette-raw)"/>
  <circle cx="160" cy="120" r="14" fill="#27272a" opacity="0.4"/>
  <circle cx="620" cy="380" r="18" fill="#18181b" opacity="0.35"/>
  <circle cx="480" cy="160" r="10" fill="#27272a" opacity="0.3"/>
  <circle cx="260" cy="460" r="16" fill="#18181b" opacity="0.4"/>
  <circle cx="690" cy="180" r="12" fill="#27272a" opacity="0.3"/>
  <path d="M 120 80 Q 210 160 290 220 T 420 310 Q 510 380 580 430 T 710 520" fill="none" stroke="#18181b" stroke-width="7" stroke-linecap="round"/>
  <path d="M 290 220 Q 360 210 440 190 T 520 160" fill="none" stroke="#18181b" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M 420 310 Q 400 410 430 490" fill="none" stroke="#18181b" stroke-width="5" stroke-linecap="round"/>
  <path d="M 580 430 Q 640 410 690 380" fill="none" stroke="#18181b" stroke-width="3.5" stroke-linecap="round"/>
</svg>`;

const maskConcreteSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#000000"/>
  <path d="M 120 80 Q 210 160 290 220 T 420 310 Q 510 380 580 430 T 710 520" fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round"/>
  <path d="M 290 220 Q 360 210 440 190 T 520 160" fill="none" stroke="#ffffff" stroke-width="9" stroke-linecap="round"/>
  <path d="M 420 310 Q 400 410 430 490" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
  <path d="M 580 430 Q 640 410 690 380" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
</svg>`;

const overlayConcreteSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <radialGradient id="vignette-overlay" cx="50%" cy="50%" r="70%">
      <stop offset="30%" stop-color="#71717a"/>
      <stop offset="100%" stop-color="#3f3f46"/>
    </radialGradient>
  </defs>
  <rect width="800" height="600" fill="url(#vignette-overlay)"/>
  <circle cx="160" cy="120" r="14" fill="#27272a" opacity="0.4"/>
  <circle cx="620" cy="380" r="18" fill="#18181b" opacity="0.35"/>
  <circle cx="480" cy="160" r="10" fill="#27272a" opacity="0.3"/>
  <circle cx="260" cy="460" r="16" fill="#18181b" opacity="0.4"/>
  <circle cx="690" cy="180" r="12" fill="#27272a" opacity="0.3"/>
  <path d="M 120 80 Q 210 160 290 220 T 420 310 Q 510 380 580 430 T 710 520" fill="none" stroke="#f43f5e" stroke-width="16" stroke-linecap="round" opacity="0.85"/>
  <path d="M 290 220 Q 360 210 440 190 T 520 160" fill="none" stroke="#f43f5e" stroke-width="10" stroke-linecap="round" opacity="0.8"/>
  <path d="M 420 310 Q 400 410 430 490" fill="none" stroke="#f43f5e" stroke-width="12" stroke-linecap="round" opacity="0.8"/>
  <path d="M 580 430 Q 640 410 690 380" fill="none" stroke="#f43f5e" stroke-width="8" stroke-linecap="round" opacity="0.8"/>
  <rect x="100" y="65" width="220" height="185" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4 2"/>
  <rect x="100" y="45" width="100" height="18" fill="#10b981"/>
  <text x="105" y="58" fill="#000000" font-family="monospace" font-size="10" font-weight="bold">Crack-1 96.4%</text>
  <rect x="270" y="145" width="270" height="100" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4 2"/>
  <rect x="270" y="125" width="105" height="18" fill="#10b981"/>
  <text x="275" y="138" fill="#000000" font-family="monospace" font-size="10" font-weight="bold">Branch-2 91.8%</text>
  <rect x="375" y="275" width="365" height="270" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="4 2"/>
  <rect x="375" y="255" width="115" height="18" fill="#10b981"/>
  <text x="380" y="268" fill="#000000" font-family="monospace" font-size="10" font-weight="bold">Cluster-3 98.2%</text>
</svg>`;

export const SAMPLE_ORIGINAL_IMAGE = toBase64(rawConcreteSvg);
export const SAMPLE_MASK_IMAGE = toBase64(maskConcreteSvg);
export const SAMPLE_OVERLAY_IMAGE = toBase64(overlayConcreteSvg);

export const INITIAL_INSPECTIONS: InspectionData[] = [
  {
    id: 'insp-8f92-a1b',
    taskId: 'celery-task-7721-a01',
    status: 'completed',
    originalImageKey: 'inspections/bridge_pier_42_raw.png',
    originalImageUrl: SAMPLE_ORIGINAL_IMAGE,
    maskImageKey: 'results/bridge_pier_42_mask.png',
    maskImageUrl: SAMPLE_MASK_IMAGE,
    overlayImageKey: 'results/bridge_pier_42_overlay.png',
    overlayImageUrl: SAMPLE_OVERLAY_IMAGE,
    structureType: 'Bridge Pier #42',
    bboxData: [
      { x: 100, y: 65, w: 220, h: 185, confidence: 0.964 },
      { x: 270, y: 145, w: 270, h: 100, confidence: 0.918 },
      { x: 375, y: 275, w: 365, h: 270, confidence: 0.982 },
    ],
    damagedPixels: 88420,
    totalPixels: 480000,
    damagePercentage: 18.42,
    severity: 'MODERATE',
    modelUsed: 'YOLOv8m-seg (v1.2)',
    inferenceTimeMs: 14.8,
    createdAt: '2026-10-13T14:20:00Z',
    completedAt: '2026-10-13T14:20:01Z',
  },
  {
    id: 'insp-4b17-c8d',
    taskId: 'celery-task-7690-f04',
    status: 'completed',
    originalImageKey: 'inspections/tunnel_arch_b.png',
    originalImageUrl: SAMPLE_ORIGINAL_IMAGE,
    maskImageKey: 'results/tunnel_arch_b_mask.png',
    maskImageUrl: SAMPLE_MASK_IMAGE,
    overlayImageKey: 'results/tunnel_arch_b_overlay.png',
    overlayImageUrl: SAMPLE_OVERLAY_IMAGE,
    structureType: 'Tunnel Arch Section B',
    bboxData: [
      { x: 140, y: 110, w: 180, h: 90, confidence: 0.941 },
    ],
    damagedPixels: 39120,
    totalPixels: 480000,
    damagePercentage: 8.15,
    severity: 'LOW',
    modelUsed: 'YOLOv8m-seg (v1.2)',
    inferenceTimeMs: 13.9,
    createdAt: '2026-10-12T09:15:00Z',
    completedAt: '2026-10-12T09:15:01Z',
  },
  {
    id: 'insp-9e03-d2a',
    taskId: 'celery-task-7582-e19',
    status: 'completed',
    originalImageKey: 'inspections/retaining_wall_east.png',
    originalImageUrl: SAMPLE_ORIGINAL_IMAGE,
    maskImageKey: 'results/retaining_wall_east_mask.png',
    maskImageUrl: SAMPLE_MASK_IMAGE,
    overlayImageKey: 'results/retaining_wall_east_overlay.png',
    overlayImageUrl: SAMPLE_OVERLAY_IMAGE,
    structureType: 'Retaining Wall East',
    bboxData: [
      { x: 80, y: 50, w: 450, h: 380, confidence: 0.988 },
      { x: 420, y: 190, w: 260, h: 220, confidence: 0.975 },
    ],
    damagedPixels: 172800,
    totalPixels: 480000,
    damagePercentage: 36.0,
    severity: 'CRITICAL',
    modelUsed: 'YOLOv8m-seg (v1.2)',
    inferenceTimeMs: 16.2,
    createdAt: '2026-10-11T16:45:00Z',
    completedAt: '2026-10-11T16:45:02Z',
  },
  {
    id: 'insp-1a44-f5e',
    taskId: 'celery-task-7420-b08',
    status: 'completed',
    originalImageKey: 'inspections/highway_slab_km48.png',
    originalImageUrl: SAMPLE_ORIGINAL_IMAGE,
    maskImageKey: 'results/highway_slab_km48_mask.png',
    maskImageUrl: SAMPLE_MASK_IMAGE,
    overlayImageKey: 'results/highway_slab_km48_overlay.png',
    overlayImageUrl: SAMPLE_OVERLAY_IMAGE,
    structureType: 'Highway Pavement Slab KM48',
    bboxData: [
      { x: 210, y: 150, w: 220, h: 140, confidence: 0.892 },
    ],
    damagedPixels: 59040,
    totalPixels: 480000,
    damagePercentage: 12.3,
    severity: 'LOW',
    modelUsed: 'YOLOv8m-seg (v1.2)',
    inferenceTimeMs: 14.1,
    createdAt: '2026-10-10T11:30:00Z',
    completedAt: '2026-10-10T11:30:01Z',
  },
];

export const BENCHMARK_DATA: ModelBenchmark[] = [
  {
    model: 'YOLOv8-seg (Ours)',
    mIoU: 0.8567,
    precision: 0.8912,
    recall: 0.8345,
    f1_score: 0.8619,
    inference_ms: 12.4,
  },
  {
    model: 'DeepLabV3+',
    mIoU: 0.8234,
    precision: 0.8567,
    recall: 0.8012,
    f1_score: 0.8281,
    inference_ms: 89.3,
  },
  {
    model: 'SAM (ViT-B)',
    mIoU: 0.7891,
    precision: 0.8123,
    recall: 0.8456,
    f1_score: 0.8286,
    inference_ms: 234.7,
  },
];

export const DEGRADATION_TREND_DATA = [
  { month: 'Nov 25', damagePct: 4.2, severity: 'LOW', alert: false },
  { month: 'Dec 25', damagePct: 5.6, severity: 'LOW', alert: false },
  { month: 'Jan 26', damagePct: 7.1, severity: 'LOW', alert: false },
  { month: 'Feb 26', damagePct: 9.4, severity: 'LOW', alert: false },
  { month: 'Mar 26', damagePct: 11.2, severity: 'LOW', alert: false },
  { month: 'Apr 26', damagePct: 13.8, severity: 'LOW', alert: false },
  { month: 'May 26', damagePct: 15.6, severity: 'MODERATE', alert: true },
  { month: 'Jun 26', damagePct: 16.9, severity: 'MODERATE', alert: true },
  { month: 'Jul 26', damagePct: 17.5, severity: 'MODERATE', alert: true },
  { month: 'Aug 26', damagePct: 18.0, severity: 'MODERATE', alert: true },
  { month: 'Sep 26', damagePct: 18.2, severity: 'MODERATE', alert: true },
  { month: 'Oct 26', damagePct: 18.42, severity: 'MODERATE', alert: true },
];

export const CRACK_HISTOGRAM_DATA = [
  { category: 'Hairline (<0.2mm)', count: 28, color: '#10b981', percentage: 48 },
  { category: 'Medium (0.2-1mm)', count: 21, color: '#f59e0b', percentage: 36 },
  { category: 'Severe (>1.0mm)', count: 9, color: '#ef4444', percentage: 16 },
];
