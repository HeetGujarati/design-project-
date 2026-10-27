'use client';

import React from 'react';
import { Layers, RefreshCw, Download, Play, Sun, Moon } from 'lucide-react';
import { useTheme } from '../lib/theme';

interface HeaderProps {
  onRefresh?: () => void;
  onExportPDF?: () => void;
  onLoadDemo?: () => void;
  isInspecting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  onExportPDF,
  onLoadDemo,
  isInspecting,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-slate-200 dark:border-[#1c1c20] bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-zinc-800 border border-slate-800 dark:border-zinc-700/60 flex items-center justify-center text-white">
            <Layers className="w-3.5 h-3.5 text-slate-100" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              AegisDamage <span className="text-slate-500 dark:text-zinc-400 font-normal">AI</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700/50">
              v1.0
            </span>
          </div>
        </div>

        {/* Center Anchor Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-xs text-slate-600 dark:text-zinc-400 font-medium">
          <a href="#workspace" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Inspector
          </a>
          <a href="#deliverables" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Deliverables
          </a>
          <a href="#analytics" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Analytics & Benchmarks
          </a>
          <a href="#architecture" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Architecture
          </a>
          <a href="#registry" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Registry
          </a>
        </nav>

        {/* Right Action Controls & Status */}
        <div className="flex items-center gap-2">
          {/* Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-700 dark:text-zinc-300 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Cluster: Operational (2 Workers)</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-1.5 rounded-md bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-700" />
            )}
          </button>

          {onLoadDemo && (
            <button
              onClick={onLoadDemo}
              disabled={isInspecting}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 text-xs font-medium transition-colors disabled:opacity-50"
            >
              <Play className="w-3 h-3 text-slate-600 dark:text-zinc-400" />
              <span>Demo</span>
            </button>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              aria-label="Refresh inspection data"
              title="Refresh inspection data"
              className="p-1.5 rounded-md bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isInspecting ? 'animate-spin text-slate-900 dark:text-zinc-200' : ''}`} />
            </button>
          )}

          {onExportPDF && (
            <button
              onClick={onExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
