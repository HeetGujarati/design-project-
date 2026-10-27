'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ModelBenchmark } from '../lib/types';
import { BENCHMARK_DATA } from '../lib/sampleData';
import { useTheme } from '../lib/theme';

interface BenchmarkChartProps {
  benchmarks?: ModelBenchmark[];
}

export const BenchmarkChart: React.FC<BenchmarkChartProps> = ({ benchmarks = BENCHMARK_DATA }) => {
  const [metricMode, setMetricMode] = useState<'accuracy' | 'latency'>('accuracy');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const accuracyData = [
    {
      metric: 'mIoU @0.5',
      'YOLOv8-seg': 0.8567,
      'DeepLabV3+': 0.8234,
      'SAM (ViT-B)': 0.7891,
    },
    {
      metric: 'Precision',
      'YOLOv8-seg': 0.8912,
      'DeepLabV3+': 0.8567,
      'SAM (ViT-B)': 0.8123,
    },
    {
      metric: 'Recall',
      'YOLOv8-seg': 0.8345,
      'DeepLabV3+': 0.8012,
      'SAM (ViT-B)': 0.8456,
    },
    {
      metric: 'F1-Score',
      'YOLOv8-seg': 0.8619,
      'DeepLabV3+': 0.8281,
      'SAM (ViT-B)': 0.8286,
    },
  ];

  const latencyData = benchmarks.map((b) => ({
    name: b.model,
    latency: b.inference_ms,
    fps: (1000 / b.inference_ms).toFixed(1),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-white dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] p-2.5 shadow-lg text-xs font-mono text-slate-800 dark:text-zinc-200">
          <div className="font-semibold text-slate-900 dark:text-white mb-1">{label}</div>
          {payload.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-3 py-0.5">
              <span className="text-slate-500 dark:text-zinc-400">{item.name}:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {metricMode === 'accuracy' ? (item.value * 100).toFixed(1) + '%' : item.value + ' ms'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-[#222226] p-4 flex flex-col justify-between shadow-sm transition-colors">
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Model Benchmarks</h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">Segmentation precision vs latency</p>
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] text-xs">
            <button
              onClick={() => setMetricMode('accuracy')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                metricMode === 'accuracy' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              mIoU / F1
            </button>
            <button
              onClick={() => setMetricMode('latency')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                metricMode === 'latency' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              Latency (ms)
            </button>
          </div>
        </div>

        <div className="w-full h-48 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {metricMode === 'accuracy' ? (
              <BarChart data={accuracyData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1c1c20' : '#e2e8f0'} />
                <XAxis dataKey="metric" stroke={isDark ? '#52525b' : '#94a3b8'} tick={{ fill: isDark ? '#71717a' : '#64748b', fontSize: 10 }} />
                <YAxis stroke={isDark ? '#52525b' : '#94a3b8'} tick={{ fill: isDark ? '#71717a' : '#64748b', fontSize: 10 }} domain={[0.7, 1.0]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="YOLOv8-seg" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="DeepLabV3+" fill="#64748b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="SAM (ViT-B)" fill="#94a3b8" radius={[3, 3, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={latencyData} margin={{ top: 10, right: 0, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1c1c20' : '#e2e8f0'} />
                <XAxis dataKey="name" stroke={isDark ? '#52525b' : '#94a3b8'} tick={{ fill: isDark ? '#71717a' : '#64748b', fontSize: 10 }} />
                <YAxis stroke={isDark ? '#52525b' : '#94a3b8'} tick={{ fill: isDark ? '#71717a' : '#64748b', fontSize: 10 }} unit="ms" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="latency" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="pt-2.5 border-t border-slate-100 dark:border-[#1e1e24] flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-blue-500"></span>
            <span>YOLOv8</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-slate-500"></span>
            <span>DeepLab</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-slate-400"></span>
            <span>SAM</span>
          </div>
        </div>
        <span className="text-slate-600 dark:text-zinc-400">18.2ms inference</span>
      </div>
    </div>
  );
};
