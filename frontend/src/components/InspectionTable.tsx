'use client';

import React, { useState, useEffect } from 'react';
import { InspectionData } from '../lib/types';
import { Search, ExternalLink, Download } from 'lucide-react';
import { generateInspectionPDF } from '../lib/pdfExport';

interface InspectionTableProps {
  inspections: InspectionData[];
  selectedId?: string;
  onSelectInspection: (inspection: InspectionData) => void;
}

export const InspectionTable: React.FC<InspectionTableProps> = ({
  inspections,
  selectedId,
  onSelectInspection,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filtered = inspections.filter((item) => {
    const matchesSearch =
      item.structureType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.taskId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'ALL' || item.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '2026-10-14';
    return dateStr.slice(0, 10);
  };

  return (
    <div className="rounded-xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-[#222226] p-4 shadow-sm transition-colors">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Inspection Registry</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800">
              {filtered.length} records
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Distributed scan records with automated pixel-level quantification
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search asset or task ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] text-xs text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-slate-400 dark:focus:border-zinc-500 transition-colors"
            />
          </div>

          {/* Severity Filter Tabs */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100 dark:bg-[#09090b] border border-slate-200 dark:border-[#27272a] text-xs">
            {['ALL', 'LOW', 'MODERATE', 'CRITICAL'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  filterSeverity === sev
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-[#222226]">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-[#09090b] text-slate-600 dark:text-zinc-400 font-medium border-b border-slate-200 dark:border-[#222226] text-[11px]">
            <tr>
              <th className="py-2.5 px-3">Preview</th>
              <th className="py-2.5 px-3">Structure Asset</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Damage %</th>
              <th className="py-2.5 px-3">Defect Clusters</th>
              <th className="py-2.5 px-3">Model & Date</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#1e1e24] font-mono text-[11px]">
            {filtered.map((item) => {
              const isSelected = item.id === selectedId;
              const isCritical = item.severity === 'CRITICAL';
              const isModerate = item.severity === 'MODERATE';

              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectInspection(item)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-zinc-800/40'
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-900/40'
                  }`}
                >
                  {/* Thumbnail */}
                  <td className="py-2 px-3">
                    <div className="w-10 h-7 rounded overflow-hidden bg-black border border-slate-200 dark:border-zinc-800 relative">
                      <img
                        src={item.overlayImageUrl || item.originalImageUrl}
                        alt={item.structureType}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 border border-slate-900 dark:border-zinc-300"></div>
                      )}
                    </div>
                  </td>

                  {/* Asset & Task ID */}
                  <td className="py-2 px-3 font-sans">
                    <div className="font-medium text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                      <span>{item.structureType}</span>
                      {isSelected && (
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                          (active)
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">{item.taskId}</div>
                  </td>

                  {/* Severity Tier */}
                  <td className="py-2 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                        isCritical
                          ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                          : isModerate
                          ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                          : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </td>

                  {/* Damage % */}
                  <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">
                    {item.damagePercentage.toFixed(2)}%
                  </td>

                  {/* Clusters */}
                  <td className="py-2 px-3 text-slate-600 dark:text-zinc-400">
                    {item.bboxData?.length || 0} clusters
                  </td>

                  {/* Model & Date */}
                  <td className="py-2 px-3">
                    <div className="text-slate-700 dark:text-zinc-300">{item.modelUsed}</div>
                    <div className="text-slate-400 dark:text-zinc-500 text-[10px]">
                      {isMounted ? formatDate(item.createdAt) : item.createdAt.slice(0, 10)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onSelectInspection(item)}
                        title="View in visualizer"
                        aria-label="View in visualizer"
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => generateInspectionPDF(item)}
                        title="Export inspection report PDF"
                        aria-label="Export inspection report PDF"
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
