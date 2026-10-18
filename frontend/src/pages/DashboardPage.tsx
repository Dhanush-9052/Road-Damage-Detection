import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Target,
  Sparkles,
  Camera,
  Video,
  Eye,
  Activity,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';

import { api } from '../services/api';
import type { DashboardSummary, InspectionListItem } from '../types';
import { MetricCard } from '../components/MetricCard';
import { SeverityBadge } from '../components/SeverityBadge';

interface DashboardPageProps {
  onSelectInspection: (id: string) => void;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectInspection,
  onNavigate,
}) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recent, setRecent] = useState<InspectionListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumData, recData] = await Promise.all([
        api.getDashboardSummary(),
        api.getRecentActivity(),
      ]);
      setSummary(sumData);
      setRecent(recData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-400">Loading Dashboard Telemetry...</span>
        </div>
      </div>
    );
  }

  const hasData = summary && summary.total_inspections > 0;

  // Prepare class distribution chart data
  const classChartData = summary?.class_distribution
    ? Object.entries(summary.class_distribution)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    : [];

  const classColors: Record<string, string> = {
    Pothole: '#ef4444',
    pothole: '#ef4444',
    Crack: '#10b981',
    crack: '#10b981',
    Rut: '#3b82f6',
    rut: '#3b82f6',
    Abscission: '#f97316',
    abscission: '#f97316',
    Undulation: '#a855f7',
    undulation: '#a855f7',
    Repair: '#06b6d4',
    repair: '#06b6d4',
    damage: '#f43f5e',
    pothole_water: '#dc2626',
    pothole_water_m: '#b91c1c',
  };

  // Severity Chart Data
  const severityChartData = [
    { name: 'High', value: summary?.high_severity_detections || 0, color: '#ef4444' },
    { name: 'Medium', value: summary?.medium_severity_detections || 0, color: '#f59e0b' },
    { name: 'Low', value: summary?.low_severity_detections || 0, color: '#10b981' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6 p-6">
      {error && (
        <div className="rounded-lg border border-rose-900/50 bg-rose-950/30 p-3 text-xs text-rose-300">
          ⚠️ {error}
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Inspections"
          value={summary?.total_inspections || 0}
          subtitle={`${summary?.image_inspections || 0} Images • ${summary?.video_inspections || 0} Videos`}
          icon={Layers}
          accentColor="cyan"
        />
        <MetricCard
          title="Damage Instances"
          value={summary?.total_detections || 0}
          subtitle="Total defects identified"
          icon={Target}
          accentColor="blue"
        />
        <MetricCard
          title="High Severity Hazards"
          value={summary?.high_severity_detections || 0}
          subtitle="Immediate repair priority"
          icon={ShieldAlert}
          accentColor="rose"
        />
        <MetricCard
          title="Average Confidence"
          value={summary && summary.avg_confidence > 0 ? `${(summary.avg_confidence * 100).toFixed(1)}%` : '0%'}
          subtitle="Mean detector certainty"
          icon={Activity}
          accentColor="emerald"
        />
      </div>

      {!hasData ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center backdrop-blur-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 mb-4">
            <Activity className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            No Road Inspections Performed Yet
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            All analytics and KPI counters strictly reflect completed inference runs. 
            Upload an image or video to launch your first road damage inspection.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => onNavigate('image-inspect')}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
            >
              <Camera className="h-4 w-4" />
              <span>Inspect First Image</span>
            </button>
            <button
              onClick={() => onNavigate('video-inspect')}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-all"
            >
              <Video className="h-4 w-4 text-cyan-400" />
              <span>Process Video Stream</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Defect Class Distribution Bar Chart */}
            <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Defect Classification
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Damage Instances by Target Class
                  </h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {classChartData.reduce((acc, curr) => acc + curr.count, 0)} Total
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={11}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {classChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={classColors[entry.name] || '#06b6d4'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Severity Distribution Donut Chart */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
              <div className="border-b border-slate-800 pb-3 mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Hazard Tier Analysis
                </span>
                <h4 className="text-sm font-bold text-white">
                  Severity Breakdown
                </h4>
              </div>

              <div className="h-48 w-full flex items-center justify-center">
                {severityChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {severityChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#f8fafc',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-xs text-slate-500">No severity instances</span>
                )}
              </div>

              {/* Legend */}
              <div className="mt-2 space-y-2 border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="text-slate-300 font-medium">High Severity</span>
                  </div>
                  <span className="font-mono text-white font-bold">{summary?.high_severity_detections || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-300 font-medium">Medium Severity</span>
                  </div>
                  <span className="font-mono text-white font-bold">{summary?.medium_severity_detections || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-300 font-medium">Low Severity</span>
                  </div>
                  <span className="font-mono text-white font-bold">{summary?.low_severity_detections || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Recent Inspections
              </h4>

              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                View All History →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Filename / Source</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Total Defects</th>
                    <th className="px-4 py-3">Highest Severity</th>
                    <th className="px-4 py-3">Road Risk Score</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recent.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-white max-w-[200px] truncate">
                        {item.original_filename || item.filename}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          item.media_type === 'video' ? 'bg-purple-950/60 text-purple-300 border border-purple-800/40' : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40'
                        }`}>
                          {item.media_type === 'video' ? <Video className="h-3 w-3" /> : <Camera className="h-3 w-3" />}
                          {item.media_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-white">
                        {item.total_detections}
                      </td>
                      <td className="px-4 py-3">
                        <SeverityBadge level={item.highest_severity} size="sm" />
                      </td>
                      <td className="px-4 py-3 font-mono font-bold">
                        <span className={item.risk_score > 70 ? 'text-rose-400' : item.risk_score > 30 ? 'text-amber-400' : 'text-emerald-400'}>
                          {item.risk_score.toFixed(1)} / 100
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onSelectInspection(item.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-cyan-500 hover:text-slate-950 transition-all border border-slate-700"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Audit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
