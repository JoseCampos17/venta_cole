import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  color?: 'pink' | 'purple' | 'green' | 'blue' | 'yellow';
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'pink',
}: StatsCardProps) {
  const colorMap = {
    pink: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-sky-50 text-sky-600 border-sky-100',
    yellow: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider line-clamp-1">
          {title}
        </span>
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
          {icon}
        </div>
      </div>

      <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">
        {value}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
          <span className="truncate">{subtitle}</span>
          {trend && <span className="font-bold text-emerald-600 ml-1 flex-shrink-0">{trend}</span>}
        </div>
      )}
    </div>
  );
}
