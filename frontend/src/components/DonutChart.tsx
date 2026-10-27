'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutChartProps {
  damagedPixels: number;
  totalPixels: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ damagedPixels, totalPixels }) => {
  const healthyPixels = Math.max(0, totalPixels - damagedPixels);
  const damagedPct = ((damagedPixels / (totalPixels || 1)) * 100).toFixed(1);
  const healthyPct = ((healthyPixels / (totalPixels || 1)) * 100).toFixed(1);

  const data = [
    { name: 'Healthy Surface', value: healthyPixels, percentage: healthyPct, color: '#10b981' },
    { name: 'Damaged Area', value: damagedPixels, percentage: damagedPct, color: '#f43f5e' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg bg-white dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] p-2.5 shadow-lg text-xs font-mono text-slate-800 dark:text-zinc-200">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
            <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
          </div>
          <div className="text-slate-600 dark:text-zinc-400">Pixels: {item.value.toLocaleString()} px</div>
          <div className="text-slate-600 dark:text-zinc-400">Ratio: {item.percentage}%</div>
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
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Surface Composition</h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">Healthy concrete vs defect fissures</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800">
            Pixel Ratio
          </span>
        </div>

        <div className="relative w-full h-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={78}
                paddingAngle={3}
                dataKey="value"
                stroke="transparent"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-semibold text-slate-900 dark:text-white font-mono">{damagedPct}%</span>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Defect</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100 dark:border-[#1e1e24] text-xs font-mono">
        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
          <div>
            <div className="text-[10px] text-slate-500 dark:text-zinc-400">Healthy</div>
            <div className="font-semibold text-emerald-600 dark:text-emerald-400">{healthyPct}%</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a]">
          <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
          <div>
            <div className="text-[10px] text-slate-500 dark:text-zinc-400">Damaged</div>
            <div className="font-semibold text-rose-600 dark:text-rose-400">{damagedPct}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
