import React from 'react';

interface StatCardProps {
  title: string;
  amount: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  colorGradient: string;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  subtitle,
  icon,
  colorGradient,
  badge,
}) => {
  return (
    <div className="relative overflow-hidden glass-card glass-card-hover rounded-2xl p-5 group border border-slate-800">
      {/* Background Glow */}
      <div
        className={`absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40 ${colorGradient}`}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {amount}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1.5 font-medium flex items-center gap-1.5">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-200 group-hover:scale-110 transition-transform">
            {icon}
          </div>
          {badge && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
