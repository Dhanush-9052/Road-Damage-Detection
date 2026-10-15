import React, { useState } from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';
import type { DetectionItem } from '../types';
import { SeverityBadge } from './SeverityBadge';

interface DetectionTableProps {
  detections: DetectionItem[];
}

export const DetectionTable: React.FC<DetectionTableProps> = ({ detections }) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'idx' | 'conf' | 'area' | 'sev'>('sev');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Available classes
  const classes = Array.from(new Set(detections.map((d) => d.class_name)));

  // Filtered detections
  const filtered = detections.filter((d) => {
    if (selectedClass !== 'all' && d.class_name !== selectedClass) return false;
    if (selectedSeverity !== 'all' && d.severity_level !== selectedSeverity) return false;
    return true;
  });

  // Sorted detections
  const sorted = [...filtered].sort((a, b) => {
    let diff = 0;
    if (sortBy === 'conf') diff = a.confidence - b.confidence;
    else if (sortBy === 'area') diff = a.relative_area - b.relative_area;
    else if (sortBy === 'sev') diff = a.severity_score - b.severity_score;
    else diff = 0;
    return sortAsc ? diff : -diff;
  });

  const toggleSort = (field: 'conf' | 'area' | 'sev') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
      {/* Table Header & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/60 p-4">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Detected Damage Instances ({filtered.length} of {detections.length})
          </h4>
          <p className="text-xs text-slate-400">
            Bounding box coordinates, confidence scores, and severity index
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-2.5 py-1 border border-slate-700">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              aria-label="Filter by damage class"
              className="bg-transparent text-xs text-slate-200 outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Classes</option>
              {classes.map((cls) => (
                <option key={cls} value={cls} className="bg-slate-900 text-white">
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-800/80 px-2.5 py-1 border border-slate-700">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              aria-label="Filter by severity level"
              className="bg-transparent text-xs text-slate-200 outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Severities</option>
              <option value="High" className="bg-slate-900 text-rose-400">High</option>
              <option value="Medium" className="bg-slate-900 text-amber-400">Medium</option>
              <option value="Low" className="bg-slate-900 text-emerald-400">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Defect Class</th>
              <th
                onClick={() => toggleSort('conf')}
                className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Confidence</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('area')}
                className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Viewport Area</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('sev')}
                className="px-4 py-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Severity Score</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-4 py-3">Severity Level</th>
              <th className="px-4 py-3 text-right">Bounding Box (xyxy)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No defect instances match the selected filter criteria.
                </td>
              </tr>
            ) : (
              sorted.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-slate-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-white">
                    {item.class_name}
                  </td>
                  <td className="px-4 py-3 font-mono text-cyan-400">
                    {(item.confidence * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400">
                    {(item.relative_area * 100).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-white">
                    {item.severity_score.toFixed(3)}
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge level={item.severity_level} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[11px] text-slate-400">
                    [{item.bbox.join(', ')}]
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
