'use client';

import React, { useState, useRef } from 'react';
import { Upload, Play, AlertCircle, Building2 } from 'lucide-react';
import { requestUploadTicket, enqueueSegmentationJob } from '../lib/api';
import { SAMPLE_ORIGINAL_IMAGE } from '../lib/sampleData';

interface ImageUploaderProps {
  onTaskStarted: (taskId: string, previewUrl?: string, structureType?: string) => void;
  isProcessing: boolean;
}

const STRUCTURE_TYPES = [
  'Bridge Pier #42',
  'Tunnel Arch Section B',
  'Highway Pavement Slab KM48',
  'Retaining Wall East',
  'Dam Spillway Face #3',
  'Industrial Silo Wall',
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onTaskStarted, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState(STRUCTURE_TYPES[0]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMsg(null);
    setUploadProgress(10);
    const previewUrl = URL.createObjectURL(file);

    try {
      setUploadProgress(30);
      let taskId = `task-local-${Date.now().toString().slice(-4)}`;

      try {
        const ticket = await requestUploadTicket(file.name, file.type || 'image/jpeg');
        setUploadProgress(50);

        if (ticket.upload_url) {
          const uploadRes = await fetch(ticket.upload_url, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type || 'image/jpeg' },
          });
          if (!uploadRes.ok) throw new Error('MinIO direct upload failed');
        }

        setUploadProgress(75);

        const enqueueRes = await enqueueSegmentationJob(ticket.image_key || file.name, selectedStructure);
        if (enqueueRes.task_id) {
          taskId = enqueueRes.task_id;
        }
      } catch (backendErr) {
        console.warn('Backend upload fallback used for client demo', backendErr);
      }

      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(null);
        onTaskStarted(taskId, previewUrl, selectedStructure);
      }, 250);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Upload failed. Please check network connection.');
      setUploadProgress(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDemoClick = () => {
    if (isProcessing) return;
    const demoTaskId = `task-demo-${Math.floor(1000 + Math.random() * 9000)}`;
    onTaskStarted(demoTaskId, SAMPLE_ORIGINAL_IMAGE, selectedStructure);
  };

  return (
    <div className="rounded-xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-[#222226] p-4 flex flex-col justify-between h-full shadow-sm transition-colors">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Ingest Inspection Data</h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">Direct S3 presigned upload & inference</p>
          </div>

          <button
            onClick={handleDemoClick}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700/60 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Play className="w-3 h-3 text-slate-500 dark:text-zinc-400" />
            <span>Load Demo</span>
          </button>
        </div>

        {/* Structure Selector */}
        <div className="mb-3">
          <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
            <Building2 className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
            <span>Target Structure Asset</span>
          </label>
          <select
            value={selectedStructure}
            onChange={(e) => setSelectedStructure(e.target.value)}
            disabled={isProcessing}
            className="w-full text-xs bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] text-slate-900 dark:text-zinc-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-500 transition-colors"
          >
            {STRUCTURE_TYPES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`relative border border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-slate-500 dark:border-zinc-400 bg-slate-100/60 dark:bg-zinc-900/60'
              : 'border-slate-300 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700 bg-slate-50/60 dark:bg-[#09090b]/60'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/tiff,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-1.5">
            <Upload className="w-4 h-4 text-slate-400 dark:text-zinc-400" />
            <div className="text-xs text-slate-700 dark:text-zinc-300">
              Drop structural image or <span className="text-slate-900 dark:text-zinc-100 font-medium underline underline-offset-2">browse</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-zinc-400">PNG, JPG, TIFF up to 25MB</div>
          </div>

          {uploadProgress !== null && (
            <div className="absolute inset-x-3 bottom-2">
              <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-slate-900 dark:bg-zinc-200 h-1 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mt-2.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#1e1e24] flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
        <span>640px auto-normalization</span>
        <span className="font-mono text-slate-600 dark:text-zinc-400">YOLOv8m-seg</span>
      </div>
    </div>
  );
};
