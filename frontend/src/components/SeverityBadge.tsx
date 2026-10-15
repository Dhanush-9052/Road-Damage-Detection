import React from 'react';

interface SeverityBadgeProps {
  level: 'High' | 'Medium' | 'Low' | 'None' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ level, size = 'md' }) => {
  const norm = level ? level.toLowerCase() : 'none';

  let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
  let dotColor = 'bg-slate-400';

  if (norm === 'high' || norm.includes('danger')) {
    badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-700/60 shadow-xs shadow-rose-900/30';
    dotColor = 'bg-rose-500 animate-pulse';
  } else if (norm === 'medium' || norm.includes('caution')) {
    badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-700/60 shadow-xs shadow-amber-900/30';
    dotColor = 'bg-amber-500';
  } else if (norm === 'low' || norm.includes('safe')) {
    badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-xs shadow-emerald-900/30';
    dotColor = 'bg-emerald-500';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-all ${badgeColor} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{level}</span>
    </span>
  );
};
