'use client';

import React, { useState, useRef, useCallback } from 'react';
import { InspectionData } from '../lib/types';

interface BeforeAfterSliderProps {
  inspection: InspectionData;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ inspection }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'overlay' | 'mask' | 'original'>('slider');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) handleMove(e.touches[0].clientX);
  };

  const originalSrc = inspection.originalImageUrl || inspection.originalImageKey;
  const overlaySrc = inspection.overlayImageUrl || inspection.overlayImageKey || originalSrc;
  const maskSrc = inspection.maskImageUrl || inspection.maskImageKey || originalSrc;

  return (
    <div className="rounded-xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-[#222226] p-4 shadow-sm transition-colors">
      {/* Visualizer Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Defect Segmentation Visualizer
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Compare original surface against predicted polygon masks and localized bounding boxes
          </p>
        </div>

        {/* View Mode Segmented Controls */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] text-xs">
          {[
            { id: 'slider', label: 'Split View' },
            { id: 'overlay', label: 'Overlay' },
            { id: 'mask', label: 'Binary Mask' },
            { id: 'original', label: 'Raw Image' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === tab.id
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Image Viewport */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        className="relative w-full h-[400px] sm:h-[460px] rounded-lg overflow-hidden select-none bg-slate-950 border border-slate-800/80 cursor-ew-resize"
      >
        {viewMode === 'slider' ? (
          <>
            {/* Background Layer: Segmented Overlay */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src={overlaySrc}
                alt="Damage Segmentation Overlay"
                className="w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-zinc-800 text-zinc-300 text-[11px] font-mono">
                Segmentation Mask + BBoxes
              </div>
            </div>

            {/* Foreground Layer: Original Image (Clipped by slider position) */}
            <div
              className="absolute inset-0 w-full h-full overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={originalSrc}
                alt="Original Structural Surface"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none max-w-none"
                style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-zinc-800 text-zinc-300 text-[11px] font-mono">
                Original Structural Surface
              </div>
            </div>

            {/* Clean Minimalist Divider Handle */}
            <div
              className="absolute top-0 bottom-0 w-[1.5px] bg-white cursor-ew-resize z-20 shadow-md"
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={handleMouseDown}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-slate-900 border border-zinc-400 flex items-center justify-center shadow-lg">
                <div className="flex gap-0.5">
                  <div className="w-[1.5px] h-2.5 bg-zinc-200 rounded-full"></div>
                  <div className="w-[1.5px] h-2.5 bg-zinc-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </>
        ) : viewMode === 'overlay' ? (
          <div className="relative w-full h-full">
            <img src={overlaySrc} alt="Damage Overlay" className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-zinc-800 text-zinc-300 text-[11px] font-mono">
              Translucent Damage Mask + Defect Bounding Boxes
            </div>
          </div>
        ) : viewMode === 'mask' ? (
          <div className="relative w-full h-full bg-black">
            <img src={maskSrc} alt="Binary Mask" className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-zinc-800 text-zinc-300 text-[11px] font-mono">
              Binary Pixel Mask (1 = Defect, 0 = Background)
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <img src={originalSrc} alt="Original Image" className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-zinc-800 text-zinc-300 text-[11px] font-mono">
              Original Raw Structural Photo
            </div>
          </div>
        )}
      </div>

      {/* Canvas Footer Metadata */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Crimson Mask: Segmented Damage Fissures</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm border border-emerald-500"></span>
            <span>Green Bounding Box: Defect Cluster Bounds</span>
          </div>
        </div>
        <div className="font-mono text-slate-500 dark:text-zinc-400">
          800 × 600 · {inspection.modelUsed}
        </div>
      </div>
    </div>
  );
};
