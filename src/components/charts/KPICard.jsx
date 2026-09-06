import { useState } from 'react';
import { cn } from '@/lib/utils';
import { GrowthChip } from '../shared/SharedComponents';
import Sparkline from './Sparkline';

const COLOR_MAP = {
  emerald: { text: 'text-[#0F172A]', bg: 'bg-emerald-50', border: 'border-slate-200', hoverBorder: 'hover:border-emerald-400', ring: '#059669', icon: 'bg-emerald-50 text-emerald-700 border border-emerald-200', glow: 'rgba(5,150,105,0.08)' },
  blue:    { text: 'text-[#0F172A]', bg: 'bg-blue-50',    border: 'border-slate-200', hoverBorder: 'hover:border-blue-400',    ring: '#2563EB', icon: 'bg-blue-50 text-blue-700 border border-blue-200', glow: 'rgba(37,99,235,0.08)' },
  purple:  { text: 'text-[#0F172A]', bg: 'bg-indigo-50',  border: 'border-slate-200', hoverBorder: 'hover:border-indigo-400',  ring: '#6366F1', icon: 'bg-indigo-50 text-indigo-700 border border-indigo-200', glow: 'rgba(99,102,241,0.08)' },
  amber:   { text: 'text-[#0F172A]', bg: 'bg-amber-50',   border: 'border-slate-200', hoverBorder: 'hover:border-amber-400',   ring: '#D97706', icon: 'bg-amber-50 text-amber-700 border border-amber-200', glow: 'rgba(217,119,6,0.08)' },
  red:     { text: 'text-[#0F172A]', bg: 'bg-rose-50',    border: 'border-slate-200', hoverBorder: 'hover:border-rose-400',    ring: '#E11D48', icon: 'bg-rose-50 text-rose-700 border border-rose-200', glow: 'rgba(225,29,72,0.08)' },
  slate:   { text: 'text-[#0F172A]', bg: 'bg-slate-50',   border: 'border-slate-200', hoverBorder: 'hover:border-slate-400',   ring: '#475569', icon: 'bg-slate-100 text-slate-700 border border-slate-200', glow: 'rgba(71,85,105,0.08)' },
};

function renderDisplayValue(displayValue, textClass) {
  if (displayValue == null) return '—';
  const str = String(displayValue).trim();
  
  if (str.endsWith('ر.س')) {
    const numPart = str.replace(/\s*ر\.س$/, '').trim();
    return (
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className={cn('text-2xl lg:text-3xl font-black tracking-tight text-[#0F172A]')}>
          {numPart}
        </span>
        <span className="text-xs font-bold text-slate-500">
          ر.س
        </span>
      </div>
    );
  }

  return (
    <div className={cn('text-2xl lg:text-3xl font-black tracking-tight text-[#0F172A]')}>
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
        'group relative rounded-3xl border border-slate-200/90 p-5 flex flex-col justify-between gap-3',
        'bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5',
        scheme.hoverBorder,
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {/* Top row: Icon + Growth + Sparkline */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-xs', scheme.icon)}>
            {typeof icon === 'string' ? icon : icon}
          </div>
          {growth != null && <GrowthChip value={growth} />}
        </div>
        <div className="opacity-80 group-hover:opacity-100 transition-opacity">
          <Sparkline data={trendData} color={scheme.ring} width={76} height={28} />
        </div>
      </div>

      {/* Value & Title */}
      <div>
        {renderDisplayValue(displayValue, scheme.text)}
        <div className="text-slate-700 text-xs mt-1.5 font-bold">{title}</div>
        {sublabel && <div className="text-slate-500 text-[11px] mt-0.5 font-medium">{sublabel}</div>}
      </div>

      {/* Target progress */}
      {target != null && targetPct != null && (
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">{targetLabel || 'الهدف المحدد'}</span>
            <span className="font-black text-slate-800">{targetPct?.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${targetPct}%`, background: scheme.ring }}
            />
          </div>
        </div>
      )}

      {/* Modern subtle accent line */}
      <div
        className="absolute inset-x-0 bottom-0 h-[2.5px] rounded-b-3xl opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: scheme.ring }}
      />
    </div>
  );
}

