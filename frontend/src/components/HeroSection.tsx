'use client';

import React from 'react';
import { Play, ArrowDown } from 'lucide-react';

interface HeroSectionProps {
  onLoadDemo: () => void;
  onScrollToWorkspace: () => void;
  onScrollToAnalytics: () => void;
  isProcessing: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onLoadDemo,
  onScrollToWorkspace,
  onScrollToAnalytics,
  isProcessing,
}) => {
  return (
    <section className="relative pt-12 pb-16 border-b border-slate-200 dark:border-[#1c1c20] bg-slate-50 dark:bg-gradient-to-b dark:from-[#0c0c0e] dark:via-[#09090b] dark:to-[#09090b] transition-colors">
      {/* Subtle background grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Top Announcement Pill */}
        <div className="flex items-center justify-start mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-slate-500 dark:text-zinc-400">YOLOv8-seg Engine</span>
            <span className="text-slate-300 dark:text-zinc-600">·</span>
            <span>Distributed Structural Defect Segmentation</span>
          </div>
        </div>

        {/* Main Editorial Hero Typography */}
        <div className="max-w-4xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Autonomous Structural Defect Segmentation & Health Monitoring
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed font-normal max-w-3xl">
            Transition from coarse binary classification to sub-millimeter pixel segmentation.
            Extract high-precision defect polygons, quantify real surface area loss, and track crack propagation
            across bridges, dams, and highway fleets in real time.
          </p>
        </div>

        {/* Action Button Row */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={onScrollToWorkspace}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-xs font-semibold transition-all shadow-sm active:scale-[0.98]"
          >
            <span>Launch Live Inspector</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onLoadDemo}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 text-xs font-medium transition-all disabled:opacity-50 shadow-sm"
          >
            <Play className="w-3 h-3 text-slate-500 dark:text-zinc-400" />
            <span>Load Sample Scan</span>
          </button>

          <button
            onClick={onScrollToAnalytics}
            className="px-4 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200 text-xs font-medium transition-colors"
          >
            Explore Model Benchmarks →
          </button>
        </div>

        {/* Key Operational Metric Telemetry Strip */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-[#1c1c20] grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white font-mono tracking-tight">
              83.4%
            </span>
            <span className="text-xs text-slate-600 dark:text-zinc-400 mt-1 font-medium">Mean IoU Segmentation</span>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">Ultralytics YOLOv8-seg</span>
          </div>

          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white font-mono tracking-tight">
              18.2 ms
            </span>
            <span className="text-xs text-slate-600 dark:text-zinc-400 mt-1 font-medium">Inference Latency</span>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">55 FPS Real-Time GPU</span>
          </div>

          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white font-mono tracking-tight">
              10,000+
            </span>
            <span className="text-xs text-slate-600 dark:text-zinc-400 mt-1 font-medium">Target Concurrency</span>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">Direct MinIO Presigned S3</span>
          </div>

          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white font-mono tracking-tight">
              6 Deliverables
            </span>
            <span className="text-xs text-slate-600 dark:text-zinc-400 mt-1 font-medium">Standardized Outputs</span>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">Mask, Overlay, px², Gauge</span>
          </div>
        </div>
      </div>
    </section>
  );
};
