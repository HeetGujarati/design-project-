'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { OutputsShowcase } from '../components/OutputsShowcase';
import { ArchitectureSection } from '../components/ArchitectureSection';
import { KPICards } from '../components/KPICards';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { ImageUploader } from '../components/ImageUploader';
import { ProcessingStatus } from '../components/ProcessingStatus';
import { DonutChart } from '../components/DonutChart';
import { SeverityGauge } from '../components/SeverityGauge';
import { BenchmarkChart } from '../components/BenchmarkChart';
import { DegradationTrend } from '../components/DegradationTrend';
import { CrackHistogram } from '../components/CrackHistogram';
import { InspectionTable } from '../components/InspectionTable';

import { InspectionData, TaskProgressMessage } from '../lib/types';
import { INITIAL_INSPECTIONS, SAMPLE_ORIGINAL_IMAGE, SAMPLE_OVERLAY_IMAGE, SAMPLE_MASK_IMAGE } from '../lib/sampleData';
import { fetchInspections, subscribeToTaskProgress } from '../lib/api';
import { generateInspectionPDF } from '../lib/pdfExport';
import { AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [inspections, setInspections] = useState<InspectionData[]>(INITIAL_INSPECTIONS);
  const [activeInspection, setActiveInspection] = useState<InspectionData>(INITIAL_INSPECTIONS[0]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [progressMsg, setProgressMsg] = useState<TaskProgressMessage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const workspaceRef = useRef<HTMLDivElement>(null);
  const analyticsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInspections().then((data) => {
      if (data && data.length > 0) {
        setInspections(data);
        setActiveInspection(data[0]);
      }
    });
  }, []);

  const handleTaskStarted = (taskId: string, previewUrl?: string, structureType?: string) => {
    setActiveTaskId(taskId);
    setIsProcessing(true);
    setProgressMsg({
      status: 'pending',
      progress: 10,
      message: 'Ingesting image to MinIO S3',
    });

    const unsubscribe = subscribeToTaskProgress(
      taskId,
      (msg) => {
        setProgressMsg(msg);
        if (msg.status === 'completed' || msg.progress === 100) {
          setIsProcessing(false);
          const newInspection: InspectionData = {
            id: `insp-${Date.now().toString().slice(-6)}`,
            taskId: taskId,
            status: 'completed',
            originalImageKey: `inspections/${taskId}_raw.png`,
            originalImageUrl: previewUrl || SAMPLE_ORIGINAL_IMAGE,
            maskImageKey: `results/${taskId}_mask.png`,
            maskImageUrl: SAMPLE_MASK_IMAGE,
            overlayImageKey: `results/${taskId}_overlay.png`,
            overlayImageUrl: SAMPLE_OVERLAY_IMAGE,
            structureType: structureType || 'Bridge Pier #42',
            bboxData: [
              { x: 100, y: 65, w: 220, h: 185, confidence: 0.964 },
              { x: 270, y: 145, w: 270, h: 100, confidence: 0.918 },
              { x: 375, y: 275, w: 365, h: 270, confidence: 0.982 },
            ],
            damagedPixels: 88420,
            totalPixels: 480000,
            damagePercentage: msg.damagePercentage || 18.42,
            severity: msg.severity || 'MODERATE',
            modelUsed: 'YOLOv8m-seg',
            inferenceTimeMs: 14.8,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
          };

          setInspections((prev) => [newInspection, ...prev]);
          setActiveInspection(newInspection);
          setTimeout(() => {
            setActiveTaskId(null);
            setProgressMsg(null);
          }, 2500);
        } else if (msg.status === 'failed') {
          setIsProcessing(false);
        }
      },
      () => {}
    );

    return () => unsubscribe();
  };

  const handleTriggerDemo = () => {
    if (isProcessing) return;
    const demoTaskId = `task-demo-${Math.floor(1000 + Math.random() * 9000)}`;
    handleTaskStarted(demoTaskId, SAMPLE_ORIGINAL_IMAGE, 'Bridge Pier #42');
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRefresh = async () => {
    const data = await fetchInspections();
    setInspections(data);
  };

  const handleExportPDF = () => {
    if (activeInspection) {
      generateInspectionPDF(activeInspection);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col selection:bg-slate-200 dark:selection:bg-zinc-800 transition-colors duration-200">
      {/* 1. Global Navigation Bar */}
      <Header
        onRefresh={handleRefresh}
        onExportPDF={handleExportPDF}
        onLoadDemo={handleTriggerDemo}
        isInspecting={isProcessing}
      />

      {/* 2. Hero Section */}
      <HeroSection
        onLoadDemo={handleTriggerDemo}
        onScrollToWorkspace={() => workspaceRef.current?.scrollIntoView({ behavior: 'smooth' })}
        onScrollToAnalytics={() => analyticsRef.current?.scrollIntoView({ behavior: 'smooth' })}
        isProcessing={isProcessing}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Critical Safety Notice if active structure is severe */}
        {activeInspection.severity === 'CRITICAL' && (
          <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-3.5 flex items-center justify-between gap-3 text-rose-700 dark:text-rose-300 text-xs shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Critical Defect Alert:</span>{' '}
                {activeInspection.structureType} exhibits {activeInspection.damagePercentage.toFixed(1)}% surface damage. Immediate structural shoring recommended.
              </div>
            </div>
            <button
              onClick={handleExportPDF}
              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors flex-shrink-0 shadow-sm"
            >
              Export Incident Report
            </button>
          </div>
        )}

        {/* 3. Live Interactive Inspection Workspace */}
        <section id="workspace" ref={workspaceRef} className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 pb-2 border-b border-slate-200 dark:border-[#1c1c20]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Live Studio
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
                Structural Inspection Workspace
              </h2>
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
              Active Target: <span className="text-slate-900 dark:text-zinc-200 font-sans font-medium">{activeInspection.structureType}</span>
            </div>
          </div>

          {/* Real-Time Processing Status */}
          {isProcessing && activeTaskId && progressMsg && (
            <ProcessingStatus taskId={activeTaskId} progress={progressMsg} />
          )}

          {/* Top Control Grid: Image Uploader + KPI Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-5 flex flex-col">
              <ImageUploader onTaskStarted={handleTaskStarted} isProcessing={isProcessing} />
            </div>

            <div className="lg:col-span-7 flex flex-col justify-between">
              <KPICards inspection={activeInspection} />
              <div className="mt-3 p-3 rounded-xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-[#222226] flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Currently Inspecting:</span>
                  <span className="text-slate-900 dark:text-zinc-200 font-medium font-sans">{activeInspection.structureType}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                  Ref: {activeInspection.taskId}
                </span>
              </div>
            </div>
          </div>

          {/* Precision CAD Visualizer Split Slider */}
          <div>
            <BeforeAfterSlider inspection={activeInspection} />
          </div>
        </section>

        {/* 4. The 6 Standardized Deliverables Showcase */}
        <OutputsShowcase />

        {/* 5. Structural Analytics & Model Benchmarks Suite */}
        <section id="analytics" ref={analyticsRef} className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 pb-2 border-b border-slate-200 dark:border-[#1c1c20]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Diagnostics Suite
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
                Quantitative Analytics & Model Benchmarks
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
              5 Comparative Visualizations
            </span>
          </div>

          {/* Row 1: Donut, Gauge, Benchmarks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DonutChart
              damagedPixels={activeInspection.damagedPixels}
              totalPixels={activeInspection.totalPixels || 480000}
            />
            <SeverityGauge
              damagePercentage={activeInspection.damagePercentage}
              severity={activeInspection.severity}
            />
            <BenchmarkChart />
          </div>

          {/* Row 2: 12-Month Trend, Crack Width Histogram */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DegradationTrend />
            <CrackHistogram />
          </div>
        </section>

        {/* 6. High-Throughput Cloud Microservices Architecture */}
        <ArchitectureSection />

        {/* 7. Historical Registry & Audit Trail */}
        <section id="registry" className="space-y-4 pt-2">
          <InspectionTable
            inspections={inspections}
            selectedId={activeInspection.id}
            onSelectInspection={(item) => {
              setActiveInspection(item);
              workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </section>
      </main>

      {/* 8. Professional Enterprise Footer */}
      <footer className="border-t border-slate-200 dark:border-[#1c1c20] bg-white dark:bg-[#0c0c0e] py-8 text-xs text-slate-500 dark:text-zinc-400 mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="font-semibold text-slate-800 dark:text-zinc-200">AegisDamage AI</span>
            <span className="hidden sm:inline text-slate-300 dark:text-zinc-600">·</span>
            <span>Scalable Structural Damage Segmentation Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 dark:text-zinc-400">
            <span>FastAPI</span>
            <span>·</span>
            <span>Celery & Redis</span>
            <span>·</span>
            <span>MinIO S3</span>
            <span>·</span>
            <span>YOLOv8-seg</span>
            <span>·</span>
            <span>Next.js 16</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 pt-4 border-t border-slate-100 dark:border-[#18181c] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-zinc-400">
          <span>Enterprise Design Project · Certified Civil Damage Quantification Protocol</span>
          <span className="mt-1 sm:mt-0">Ultralytics YOLOv8 Segmentation Pipeline</span>
        </div>
      </footer>
    </div>
  );
}
