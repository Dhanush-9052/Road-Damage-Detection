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
  Shield,
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'image-inspect', label: 'Image Inspection', icon: Camera },
    { id: 'video-inspect', label: 'Video Inspection', icon: Video },
    { id: 'history', label: 'Inspection History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'about', label: 'Specifications', icon: BookOpen },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-800 bg-slate-950 transition-all duration-200 z-30 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-600 text-white">
            <Shield className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold tracking-tight text-white">
                RoadVision <span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                Pavement Inspection
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800 text-cyan-300 font-semibold border-l-2 border-cyan-400'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Model & Device Telemetry Pill in Sidebar Footer */}
      {!collapsed ? (
        <div className="border-t border-slate-800 p-3 bg-slate-950">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Cpu className="h-3 w-3 text-cyan-400" />
                <span>Inference</span>
              </span>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono text-emerald-400 border border-slate-700">
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
                <span className="text-slate-200 font-mono">
                  {modelInfo?.num_classes || 5} Loaded
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-800 p-2.5 flex justify-center">
          <div className="h-2 w-2 rounded-full bg-emerald-400" title="Inference Engine Ready" />
        </div>
      )}
    </aside>
  );
};
