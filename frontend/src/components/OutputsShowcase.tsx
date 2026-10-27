'use client';

import React from 'react';
import { Camera, Binary, Layers, Box, Maximize2, ShieldAlert } from 'lucide-react';

const OUTPUT_ITEMS = [
  {
    num: '01',
    title: 'Raw Inspection Image',
    desc: 'Uncompressed high-definition structural photograph preserved with cryptographic SHA-256 verification.',
    icon: Camera,
    tag: 'Input Stream',
  },
  {
    num: '02',
    title: 'Binary Damage Mask',
    desc: 'Pixel-level segmentation mask where defect fissures equal 1 (white) and sound substrate equals 0 (black).',
    icon: Binary,
    tag: 'Ground Truth Mask',
  },
  {
    num: '03',
    title: 'Translucent Overlay',
    desc: 'Semi-transparent crimson color mask (α = 0.65) blended over structural substrate for visual confirmation.',
    icon: Layers,
    tag: 'Composite Render',
  },
  {
    num: '04',
    title: 'Defect Bounding Boxes',
    desc: 'Localized coordinate clusters enclosing defect boundaries with Ultralytics model confidence scores.',
    icon: Box,
    tag: 'Object Localization',
  },
  {
    num: '05',
    title: 'Quantified Surface Area',
    desc: 'Exact damaged pixel count and calibrated metric surface area in cm² for structural engineers.',
    icon: Maximize2,
    tag: 'Morphometric Metric',
  },
  {
    num: '06',
    title: 'Severity Risk Index',
    desc: 'Surface loss ratio classified into Low (<15%), Moderate (15-30%), and Critical (>30%) intervention bands.',
    icon: ShieldAlert,
    tag: 'Safety Assessment',
  },
];

export const OutputsShowcase: React.FC = () => {
  return (
    <section id="deliverables" className="py-12 border-b border-slate-200 dark:border-[#1c1c20] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Engineering Protocol
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              The 6 Standardized Inspection Deliverables
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
              Every structural image processed by AegisDamage AI generates six verified analytical artifacts
            </p>
          </div>

          <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
            Standard Compliance: ACI 224.1R-07
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {OUTPUT_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                className="rounded-xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-[#222226] p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-zinc-700/80 transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-slate-400 dark:text-zinc-400">{item.num}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-50 dark:bg-[#09090b] text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800">
                      {item.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
