import React from 'react';
import { Camera, Video, Activity, Sparkles } from 'lucide-react';
import type { ModelInfo } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  modelInfo: ModelInfo | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  modelInfo,
}) => {
  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Infrastructure Overview Dashboard',
      subtitle: 'Real-time telemetry, defect distribution, and municipal road condition index',
    },
    'image-inspect': {
      title: 'Single Image Road Damage Inspection',
      subtitle: 'High-resolution defect localization, bounding-box regression, and severity assessment',
    },
    'video-inspect': {
      title: 'Continuous Video Telemetry & HUD Processing',
      subtitle: 'Sampled frame inference with exponential moving average (EMA) road risk smoothing',
    },
    history: {
      title: 'Inspection Audit Records',
      subtitle: 'Persistent SQLite database of past diagnostic inspections and downloadable reports',
    },
    analytics: {
      title: 'Multi-Perspective Defect Analytics',
      subtitle: 'Comprehensive distribution trends across pavement materials and sensing platforms',
    },
    about: {
      title: 'Academic Methodology & Architecture',
      subtitle: 'MRDD 2026 dataset provenance, YOLO26 neural network evaluation, and risk equations',
    },
  };

  const current = pageTitles[activeTab] || {
    title: 'RoadVision AI',
    subtitle: 'AI-powered road damage inspection platform',
  };

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 backdrop-blur-xl">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-white">
            {current.title}
          </h1>
          <span className="hidden md:inline-flex items-center gap-1 rounded-md bg-cyan-950/60 px-2 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-800/40">
            <Sparkles className="h-3 w-3" /> MRDD 2026
          </span>
        </div>
        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
          {current.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Model status pill */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs">
          <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span className="text-slate-300 font-medium">Model:</span>
          <span className="font-mono text-cyan-300">YOLO26s</span>
          <span className="text-slate-500">•</span>
          <span className="font-mono text-emerald-400">
            {modelInfo?.device?.toUpperCase() || 'CPU'}
          </span>
        </div>

        {/* Quick actions */}
        <button
          onClick={() => setActiveTab('image-inspect')}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-2 text-xs font-bold text-slate-950 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
        >
          <Camera className="h-4 w-4" />
          <span className="hidden sm:inline">Inspect Image</span>
        </button>

        <button
          onClick={() => setActiveTab('video-inspect')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-700 transition-all shadow-xs active:scale-95"
        >
          <Video className="h-4 w-4 text-cyan-400" />
          <span className="hidden sm:inline">Inspect Video</span>
        </button>
      </div>
    </header>
  );
};
