import { useState } from 'react';
import { cn } from '@/lib/utils';
import { GrowthChip } from '../shared/SharedComponents';
import Sparkline from './Sparkline';

const COLOR_MAP = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', hoverBorder: 'hover:border-emerald-500/50', ring: '#10B981', icon: 'bg-emerald-500/15 text-emerald-400', glow: 'rgba(16,185,129,0.15)' },
  blue:    { text: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    hoverBorder: 'hover:border-blue-500/50',    ring: '#3B82F6', icon: 'bg-blue-500/15 text-blue-400', glow: 'rgba(59,130,246,0.15)' },
  purple:  { text: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  hoverBorder: 'hover:border-purple-500/50',  ring: '#8B5CF6', icon: 'bg-purple-500/15 text-purple-400', glow: 'rgba(139,92,246,0.15)' },
  amber:   { text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   hoverBorder: 'hover:border-amber-500/50',   ring: '#F59E0B', icon: 'bg-amber-500/15 text-amber-400', glow: 'rgba(245,158,11,0.15)' },
  red:     { text: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     hoverBorder: 'hover:border-red-500/50',     ring: '#EF4444', icon: 'bg-red-500/15 text-red-400', glow: 'rgba(239,68,68,0.15)' },
  slate:   { text: 'text-slate-300',   bg: 'bg-slate-500/10',   border: 'border-slate-500/20',   hoverBorder: 'hover:border-slate-500/50',   ring: '#6B7280', icon: 'bg-slate-500/15 text-slate-300', glow: 'rgba(107,114,128,0.15)' },
};

function renderDisplayValue(displayValue, textClass) {
  if (displayValue == null) return '—';
  const str = String(displayValue).trim();
  
  if (str.endsWith('ر.س')) {
    const numPart = str.replace(/\s*ر\.س$/, '').trim();
    return (
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className={cn('text-2xl lg:text-3xl font-extrabold tracking-tight', textClass)}>
          {numPart}
        </span>
        <span className="text-xs font-semibold text-slate-400">
          ر.س
        </span>
      </div>
    );
  }

  return (
    <div className={cn('text-2xl lg:text-3xl font-extrabold tracking-tight', textClass)}>
      {str}
    </div>
  );
}

export default function KPICard({
  title,
  displayValue,
  growth,
  icon,
  color = 'emerald',
  sublabel,
  target,
  targetLabel,
  sparklineData,
  onClick,
  tooltip,
  className,
}) {
  const scheme = COLOR_MAP[color] || COLOR_MAP.emerald;
  const targetPct = target ? Math.min((parseFloat(displayValue?.toString().replace(/[^0-9.]/g, '')) / target) * 100, 100) : null;

  // Generate fallback micro-trend line if not provided
  const trendData = sparklineData || (growth >= 0 
    ? [20, 24, 22, 28, 26, 31, 29, 36, 34, 40] 
    : [40, 36, 38, 32, 30, 26, 28, 22, 24, 18]);

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative rounded-2xl border p-5 flex flex-col justify-between gap-3',
        'bg-gradient-to-br from-[#121c32]/90 via-[#0d1627]/90 to-[#0a101d]/90 backdrop-blur-md shadow-xl shadow-black/20',
        scheme.border,
        scheme.hoverBorder,
        'transition-all duration-300 hover:shadow-2xl hover:-translate-y-1',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {/* Ambient background hover glow */}
      <div 
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: scheme.glow }}
      />

      {/* Top row: Icon + Growth + Sparkline */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner border border-white/5', scheme.icon)}>
            {typeof icon === 'string' ? icon : icon}
          </div>
          {growth != null && <GrowthChip value={growth} />}
        </div>
        <div className="opacity-75 group-hover:opacity-100 transition-opacity">
          <Sparkline data={trendData} color={scheme.ring} width={76} height={28} />
        </div>
      </div>

      {/* Value & Title */}
      <div>
        {renderDisplayValue(displayValue, scheme.text)}
        <div className="text-slate-300 text-xs mt-1.5 font-semibold">{title}</div>
        {sublabel && <div className="text-slate-500 text-[11px] mt-0.5">{sublabel}</div>}
      </div>

      {/* Target progress */}
      {target != null && targetPct != null && (
        <div className="space-y-1 pt-1 border-t border-white/5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{targetLabel || 'الهدف المحدد'}</span>
            <span className={cn('font-bold', scheme.text)}>{targetPct?.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${targetPct}%`, background: scheme.ring }}
            />
          </div>
        </div>
      )}

      {/* Modern bottom highlight line */}
      <div
        className="absolute inset-x-0 bottom-0 h-[2px] rounded-b-2xl opacity-40 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${scheme.ring}, transparent)` }}
      />
    </div>
  );
}

