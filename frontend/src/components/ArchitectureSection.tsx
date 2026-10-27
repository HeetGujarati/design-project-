'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

const ARCH_PILLARS = [
  {
    title: 'Direct-to-Storage Ingestion',
    tech: 'MinIO S3 Presigned URLs',
    desc: 'Drone feeds bypass the API memory entirely by uploading multi-megabyte binaries straight to object storage. Eliminates OOM crashes during concurrent inspections.',
    metric: '0 Bytes API RAM Overhead',
  },
  {
    title: 'Asynchronous Task Queue',
    tech: 'Celery + Redis Distributed Broker',
    desc: 'Stateless FastAPI instances dispatch segmentation jobs to an asynchronous worker queue with persistent ack guarantees (task_acks_late) and dead-letter recovery.',
    metric: 'Zero Packet Drop Guarantee',
  },
  {
    title: 'GPU Inference Acceleration',
    tech: 'YOLOv8-seg + OpenCV Contours',
    desc: 'Workers group image batches and utilize optimized CUDA kernels to extract polygon coordinates, calculate pixel surface area, and render translucent overlays.',
    metric: '55 FPS Real-Time Engine',
  },
  {
    title: 'Live WebSocket Telemetry',
    tech: 'Redis Pub/Sub Event Stream',
    desc: 'Replaces HTTP polling. Workers publish progress at every stage (10% MinIO → 40% Celery → 80% YOLOv8 → 100% Persisted), pushed directly to the inspector dashboard.',
    metric: '< 10ms Telemetry Latency',
  },
];

export const ArchitectureSection: React.FC = () => {
  return (
    <section id="architecture" className="py-12 border-b border-slate-200 dark:border-[#1c1c20] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-2">
              High-Concurrency Architecture
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Distributed Cloud-Native Microservices
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
              Engineered to support 10,000+ concurrent drone feeds without server bottlenecking
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>KEDA Event-Driven Autoscaling</span>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {ARCH_PILLARS.map((p, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-[#222226] p-4 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Tier 0{idx + 1}
                </div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white">{p.title}</h3>
                <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 mb-2">{p.tech}</div>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                  {p.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1e1e24] text-[11px] font-mono text-slate-800 dark:text-zinc-300 font-medium">
                {p.metric}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
