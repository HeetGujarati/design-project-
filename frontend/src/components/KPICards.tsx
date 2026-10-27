'use client';

import React from 'react';
import { InspectionData } from '../lib/types';
import { Layers, Percent, AlertCircle, Zap } from 'lucide-react';

interface KPICardsProps {
  inspection: InspectionData;
}

export const KPICards: React.FC<KPICardsProps> = ({ inspection }) => {
  const isCritical = inspection.severity === 'CRITICAL';
  const isModerate = inspection.severity === 'MODERATE';

  const severityBadge = isCritical
    ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20'
    : isModerate
    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
    : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';

  const cmEstimate = ((inspection.damagedPixels / (inspection.totalPixels || 480000)) * 120).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Metric 1: Damaged Area */}
      <div className="rounded-xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-[#222226] p-4 flex flex-col justify-between shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            Damaged Surface
          </span>
          <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight font-mono">
            {inspection.damagedPixels.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 dark:text-zinc-500 font-mono">px²</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-600 dark:text-zinc-400 font-mono">
          ≈ {cmEstimate} cm² surface area
        </div>
      </div>

      {/* Metric 2: Defect Ratio */}
      <div className="rounded-xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-[#222226] p-4 flex flex-col justify-between shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            Defect Ratio
          </span>
          <Percent className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight font-mono">
            {inspection.damagePercentage.toFixed(2)}%
          </span>
          <span className="text-xs text-slate-500 dark:text-zinc-500">of surface</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-600 dark:text-zinc-400">
          {inspection.bboxData?.length || 0} defect cluster(s) mapped
        </div>
      </div>

      {/* Metric 3: Structural Risk */}
      <div className="rounded-xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-[#222226] p-4 flex flex-col justify-between shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            Structural Risk
          </span>
          <AlertCircle className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
        </div>
        <div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide border ${severityBadge}`}>
            {inspection.severity}
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-1">
          {isCritical
            ? 'Action: Immediate intervention required'
            : isModerate
            ? 'Action: Seal with epoxy within 90 days'
            : 'Status: Routine monitoring scheduled'}
        </div>
      </div>

      {/* Metric 4: Inference Latency */}
      <div className="rounded-xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-[#222226] p-4 flex flex-col justify-between shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            Inference Latency
          </span>
          <Zap className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight font-mono">
            {inspection.inferenceTimeMs.toFixed(1)}
          </span>
          <span className="text-xs text-slate-500 dark:text-zinc-500 font-mono">ms</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-600 dark:text-zinc-400 flex items-center justify-between">
          <span className="truncate">{inspection.modelUsed}</span>
          <span className="text-slate-500 dark:text-zinc-500 font-mono text-[10px]">CUDA</span>
        </div>
      </div>
    </div>
  );
};
