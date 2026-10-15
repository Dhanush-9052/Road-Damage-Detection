import React from 'react';
import {
  LayoutDashboard,
  Camera,
  Video,
  History,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import type { ModelInfo } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  modelInfo: ModelInfo | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  modelInfo,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'image-inspect', label: 'Image Inspection', icon: Camera },
    { id: 'video-inspect', label: 'Video Inspection', icon: Video },
    { id: 'history', label: 'Inspection History', icon: History },
    { id: 'analytics', label: 'Analytics & Trends', icon: BarChart3 },
    { id: 'about', label: 'About the Project', icon: BookOpen },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-800 bg-slate-950/90 backdrop-blur-xl transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
            <ShieldCheck className="h-6 w-6 text-slate-950 font-bold" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-extrabold tracking-tight text-white">
                RoadVision <span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 truncate">
                YOLO26 Road Inspection
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-xs shadow-cyan-500/10'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Model & Device Telemetry Pill in Sidebar Footer */}
      {!collapsed ? (
        <div className="border-t border-slate-800 p-3.5 bg-slate-950/40">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                <span>Inference Engine</span>
              </span>
              <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-400 border border-emerald-800/60">
                {modelInfo?.device?.toUpperCase() || 'READY'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 space-y-0.5">
              <div className="flex justify-between">
                <span>Model:</span>
                <span className="text-slate-200 font-mono">YOLO26s</span>
              </div>
              <div className="flex justify-between">
                <span>Classes:</span>
                <span className="text-cyan-300 font-mono">
                  {modelInfo?.num_classes || 6} Loaded
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-800 p-3 flex justify-center">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" title="Inference Engine Ready" />
        </div>
      )}
    </aside>
  );
};
