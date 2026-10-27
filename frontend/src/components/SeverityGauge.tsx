'use client';

import React from 'react';
import { SeverityLevel } from '../lib/types';

interface SeverityGaugeProps {
  damagePercentage: number;
  severity: SeverityLevel;
}

export const SeverityGauge: React.FC<SeverityGaugeProps> = ({ damagePercentage, severity }) => {
  const clampedPct = Math.min(100, Math.max(0, damagePercentage));
  const needleRotation = -90 + (clampedPct / 100) * 180;

  const isLow = severity === 'LOW';
  const isModerate = severity === 'MODERATE';
  const isCritical = severity === 'CRITICAL';

  const severityBadge = isCritical
    ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
    : isModerate
    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';

  return (
    <div className="rounded-xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-[#222226] p-4 flex flex-col justify-between shadow-sm transition-colors">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Structural Health Gauge</h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">Calibrated risk threshold index</p>
          </div>
          <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${severityBadge}`}>
            {severity}
          </span>
        </div>

        {/* Semi-circle Gauge */}
        <div className="relative w-full h-44 flex flex-col items-center justify-end">
          <svg viewBox="0 0 240 140" className="w-52 h-32">
            <defs>
              <linearGradient id="cleanGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="30%" stopColor="#10b981" />
                <stop offset="40%" stopColor="#f59e0b" />
                <stop offset="60%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>

            {/* Background Arc */}
            <path
              d="M 30 125 A 90 90 0 0 1 210 125"
              fill="none"
              stroke="currentColor"
              className="text-slate-200 dark:text-zinc-800"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Active Gauge Arc */}
            <path
              d="M 30 125 A 90 90 0 0 1 210 125"
              fill="none"
              stroke="url(#cleanGaugeGrad)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={283 - (clampedPct / 100) * 283}
              className="transition-all duration-700 ease-out"
            />

            {/* Center Pivot */}
            <circle cx="120" cy="125" r="7" className="fill-slate-100 dark:fill-[#18181b] stroke-slate-400 dark:stroke-zinc-500" strokeWidth="2" />

            {/* Needle */}
            <g
              transform={`rotate(${needleRotation} 120 125)`}
              className="transition-transform duration-700 ease-out"
            >
              <line
                x1="120"
                y1="125"
                x2="120"
                y2="48"
                className="stroke-slate-900 dark:stroke-zinc-100"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="120" cy="48" r="2.5" className="fill-slate-900 dark:fill-zinc-100" />
            </g>
          </svg>

          {/* Value Display */}
          <div className="text-center mt-1">
            <span className="text-xl font-semibold text-slate-900 dark:text-white font-mono">
              {damagePercentage.toFixed(2)}%
            </span>
            <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">Defect Surface Density</div>
          </div>
        </div>
      </div>

      {/* Threshold Indicators */}
      <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-slate-100 dark:border-[#1e1e24] text-[10px] font-mono text-center">
        <div className="p-1 rounded bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] text-slate-600 dark:text-zinc-400">
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">0 - 15%</span> Low
        </div>
        <div className="p-1 rounded bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] text-slate-600 dark:text-zinc-400">
          <span className="text-amber-600 dark:text-amber-400 font-medium">15 - 30%</span> Mod
        </div>
        <div className="p-1 rounded bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] text-slate-600 dark:text-zinc-400">
          <span className="text-rose-600 dark:text-rose-400 font-medium">&gt; 30%</span> Crit
        </div>
      </div>
    </div>
  );
};
