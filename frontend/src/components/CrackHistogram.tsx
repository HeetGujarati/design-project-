'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { CRACK_HISTOGRAM_DATA } from '../lib/sampleData';
import { useTheme } from '../lib/theme';

export const CrackHistogram: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg bg-white dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] p-2.5 shadow-lg text-xs font-mono text-slate-800 dark:text-zinc-200">
          <div className="font-semibold text-slate-900 dark:text-white mb-1">{item.category}</div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-zinc-400">Count:</span>
            <span className="font-medium text-slate-900 dark:text-white">{item.count} fissures</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-slate-500 dark:text-zinc-400">Share:</span>
            <span className="font-medium text-slate-800 dark:text-zinc-200">{item.percentage}%</span>
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
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Defect Width Distribution</h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">Morphological classification of crack segments</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800">
            58 Clusters
          </span>
        </div>

        <div className="w-full h-48 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CRACK_HISTOGRAM_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1c1c20' : '#e2e8f0'} />
              <XAxis dataKey="category" stroke={isDark ? '#52525b' : '#94a3b8'} tick={{ fill: isDark ? '#71717a' : '#64748b', fontSize: 10 }} />
              <YAxis stroke={isDark ? '#52525b' : '#94a3b8'} tick={{ fill: isDark ? '#71717a' : '#64748b', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {CRACK_HISTOGRAM_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100 dark:border-[#1e1e24] text-xs font-mono">
        {CRACK_HISTOGRAM_DATA.map((item, idx) => (
          <div key={idx} className="p-1.5 rounded-lg bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] text-center">
            <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">{item.category.split(' ')[0]}</div>
            <div className="font-semibold text-xs" style={{ color: item.color }}>
              {item.count} <span className="text-[10px] font-normal text-slate-500">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
