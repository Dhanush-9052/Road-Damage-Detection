import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Info } from 'lucide-react';
import type { RiskAssessment } from '../types';

interface RiskGaugeProps {
  risk: RiskAssessment;
  defectCount?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ risk, defectCount = 0 }) => {
  const score = risk.score;

  let statusBadge = {
    bg: 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300',
    icon: CheckCircle2,
    gradient: 'from-emerald-500 to-teal-400',
    text: 'SAFE (LOW RISK)',
  };

  if (score > 70) {
    statusBadge = {
      bg: 'bg-rose-950/80 border-rose-600/70 text-rose-300',
      icon: ShieldAlert,
      gradient: 'from-amber-500 via-rose-500 to-red-600',
      text: 'DANGER (CRITICAL RISK)',
    };
  } else if (score > 30) {
    statusBadge = {
      bg: 'bg-amber-950/80 border-amber-600/70 text-amber-300',
      icon: AlertTriangle,
      gradient: 'from-emerald-400 via-amber-400 to-orange-500',
      text: 'CAUTION (MODERATE RISK)',
    };
  }

  const StatusIcon = statusBadge.icon;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur-md shadow-xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Aggregate Road Risk Index
          </span>
          <h3 className="text-lg font-bold text-white">Surface Condition Assessment</h3>
        </div>

        <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold tracking-wide shadow-xs ${statusBadge.bg}`}>
          <StatusIcon className="h-4 w-4" />
          <span>{statusBadge.text}</span>
        </div>
      </div>

      {/* Main Score & Progress Bar */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Score Number Display */}
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black tracking-tight text-white">
            {score.toFixed(1)}
          </span>
          <span className="text-xl font-medium text-slate-500">/ 100</span>
          <div className="ml-auto md:ml-4 text-right md:text-left">
            <span className="text-xs text-slate-400 block">Identified Defects</span>
            <span className="text-lg font-bold text-cyan-400">{defectCount}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="md:col-span-2 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span className="text-emerald-400">0 - Safe</span>
            <span className="text-amber-400">30 - Caution</span>
            <span className="text-rose-400">70 - Danger</span>
            <span>100</span>
          </div>
          <div className="h-3.5 w-full rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${statusBadge.gradient} transition-all duration-700 ease-out`}
              style={{ width: `${Math.max(3, Math.min(100, score))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Civil Engineering Advisory Box */}
      <div className="mt-5 rounded-lg border border-cyan-900/40 bg-cyan-950/20 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold tracking-wider text-cyan-300 uppercase">
              Civil Inspection Advisory
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {risk.advisory}
            </p>
          </div>
        </div>
      </div>

      {/* Contributing Factors */}
      {risk.factors && risk.factors.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Primary Risk Factors:
          </span>
          <div className="flex flex-wrap gap-2">
            {risk.factors.map((factor, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-md border border-slate-700/80 bg-slate-800/90 px-2.5 py-1 text-xs text-slate-300"
              >
                • {factor}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
