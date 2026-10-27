'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { DEGRADATION_TREND_DATA } from '../lib/sampleData';
import { useTheme } from '../lib/theme';

export const DegradationTrend: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg bg-white dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] p-2.5 shadow-lg text-xs font-mono text-slate-800 dark:text-zinc-200">
          <div className="font-semibold text-slate-900 dark:text-white mb-1">{label}</div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-zinc-400">Damage Ratio:</span>
            <span className="font-medium text-slate-900 dark:text-white">{item.damagePct}%</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-slate-500 dark:text-zinc-400">Risk Tier:</span>
            <span
              className={`font-medium ${
                item.severity === 'CRITICAL'
                  ? 'text-rose-600 dark:text-rose-400'
                  : item.severity === 'MODERATE'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {item.severity}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-[#222226] p-4 flex flex-col justify-between shadow-sm transition-colors">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Degradation Progression</h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">12-month structural fissure density trajectory</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400">
            15% Warning Threshold
          </span>
        </div>

        <div className="w-full h-48 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DEGRADATION_TREND_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="cleanTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1c1c20' : '#e2e8f0'} />
              <XAxis dataKey="month" stroke={isDark ? '#52525b' : '#94a3b8'} tick={{ fill: isDark ? '#71717a' : '#64748b', fontSize: 10 }} />
              <YAxis stroke={isDark ? '#52525b' : '#94a3b8'} tick={{ fill: isDark ? '#71717a' : '#64748b', fontSize: 10 }} domain={[0, 25]} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={15} stroke="#f59e0b" strokeDasharray="3 3" />
              <ReferenceLine y={30} stroke="#f43f5e" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="damagePct"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cleanTrendGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-2 pt-2.5 border-t border-slate-100 dark:border-[#1e1e24] flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
        <span>Progression Rate: +1.18% / mo</span>
        <span className="text-slate-700 dark:text-zinc-300">Target Remediation: Q4 2026</span>
      </div>
    </div>
  );
};
