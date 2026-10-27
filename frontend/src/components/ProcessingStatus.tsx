'use client';

import React from 'react';
import { TaskProgressMessage } from '../lib/types';
import { Loader2, CheckCircle2, AlertOctagon, Cpu } from 'lucide-react';

interface ProcessingStatusProps {
  taskId: string;
  progress: TaskProgressMessage;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ taskId, progress }) => {
  const isComplete = progress.status === 'completed' || progress.progress === 100;
  const isFailed = progress.status === 'failed';

  const getStageName = (p: number) => {
    if (p < 25) return '1/4: Ingesting image to MinIO S3';
    if (p < 50) return '2/4: Enqueuing to Celery worker fleet';
    if (p < 75) return '3/4: Executing YOLOv8-seg GPU inference';
    if (p < 100) return '4/4: Computing defect polygons & metrics';
    return 'Analysis Complete: Artifacts persisted';
  };

  return (
    <div className="rounded-xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-[#222226] p-4 relative overflow-hidden shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300">
            {isComplete ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : isFailed ? (
              <AlertOctagon className="w-4 h-4 text-rose-500" />
            ) : (
              <Loader2 className="w-4 h-4 text-slate-700 dark:text-zinc-300 animate-spin" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                {isComplete
                  ? 'Segmentation Analysis Complete'
                  : isFailed
                  ? 'Task Execution Failed'
                  : 'Processing Inspection Task...'}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800">
                {taskId}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              {progress.message || getStageName(progress.progress)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
            <Cpu className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
            <span>Celery-Worker-01</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-white font-mono text-sm">
            {progress.progress}%
          </span>
        </div>
      </div>

      {/* Minimalist Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isComplete ? 'bg-emerald-500' : isFailed ? 'bg-rose-500' : 'bg-slate-900 dark:bg-zinc-200'
          }`}
          style={{ width: `${progress.progress}%` }}
        ></div>
      </div>

      {/* Stage Dots */}
      <div className="grid grid-cols-4 gap-2 mt-2.5 text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
        <div className={`flex items-center gap-1.5 ${progress.progress >= 25 ? 'text-slate-900 dark:text-zinc-200 font-medium' : ''}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${progress.progress >= 25 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'}`}></span>
          <span>1. S3 Storage</span>
        </div>
        <div className={`flex items-center gap-1.5 ${progress.progress >= 50 ? 'text-slate-900 dark:text-zinc-200 font-medium' : ''}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${progress.progress >= 50 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'}`}></span>
          <span>2. Redis Queue</span>
        </div>
        <div className={`flex items-center gap-1.5 ${progress.progress >= 75 ? 'text-slate-900 dark:text-zinc-200 font-medium' : ''}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${progress.progress >= 75 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'}`}></span>
          <span>3. AI Inference</span>
        </div>
        <div className={`flex items-center gap-1.5 ${progress.progress >= 100 ? 'text-slate-900 dark:text-zinc-200 font-medium' : ''}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${progress.progress >= 100 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'}`}></span>
          <span>4. Metrics</span>
        </div>
      </div>
    </div>
  );
};
