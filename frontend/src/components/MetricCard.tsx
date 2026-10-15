import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: 'cyan' | 'blue' | 'rose' | 'amber' | 'emerald';
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'cyan',
  badge
}) => {
  const accentClasses = {
    cyan: 'border-cyan-500/20 from-cyan-950/20 to-slate-900/40 text-cyan-400 bg-cyan-500/10',
    blue: 'border-blue-500/20 from-blue-950/20 to-slate-900/40 text-blue-400 bg-blue-500/10',
    rose: 'border-rose-500/20 from-rose-950/20 to-slate-900/40 text-rose-400 bg-rose-500/10',
    amber: 'border-amber-500/20 from-amber-950/20 to-slate-900/40 text-amber-400 bg-amber-500/10',
    emerald: 'border-emerald-500/20 from-emerald-950/20 to-slate-900/40 text-emerald-400 bg-emerald-500/10',
  }[accentColor];

  const iconTextClasses = {
    cyan: 'text-cyan-400',
    blue: 'text-blue-400',
    rose: 'text-rose-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
  }[accentColor];

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 backdrop-blur-sm transition-all duration-300 hover:border-slate-600 hover:shadow-lg hover:shadow-cyan-950/10 ${accentClasses}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          {title}
        </span>
        <div className={`rounded-lg p-2.5 ${accentClasses}`}>
          <Icon className={`h-5 w-5 ${iconTextClasses}`} />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-white">
          {value}
        </span>
        {badge && (
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300 border border-slate-700">
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};
