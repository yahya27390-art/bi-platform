import { useState } from 'react';
import { cn } from '@/lib/utils';
import { GrowthChip } from '../shared/SharedComponents';

const COLOR_MAP = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', ring: '#10B981', icon: 'bg-emerald-500/15 text-emerald-400' },
  blue:    { text: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    ring: '#3B82F6', icon: 'bg-blue-500/15 text-blue-400' },
  purple:  { text: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  ring: '#8B5CF6', icon: 'bg-purple-500/15 text-purple-400' },
  amber:   { text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   ring: '#F59E0B', icon: 'bg-amber-500/15 text-amber-400' },
  red:     { text: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     ring: '#EF4444', icon: 'bg-red-500/15 text-red-400' },
  slate:   { text: 'text-slate-300',   bg: 'bg-slate-500/10',   border: 'border-slate-500/20',   ring: '#6B7280', icon: 'bg-slate-500/15 text-slate-300' },
};

export default function KPICard({
  title,
  displayValue,
  growth,
  icon,
  color = 'emerald',
  sublabel,
  target,
  targetLabel,
  onClick,
  tooltip,
  className,
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const scheme = COLOR_MAP[color] || COLOR_MAP.emerald;
  const targetPct = target ? Math.min((parseFloat(displayValue?.replace(/[^0-9.]/g, '')) / target) * 100, 100) : null;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-2xl border p-5 flex flex-col gap-3',
        'bg-[#111827]/80 backdrop-blur-sm',
        scheme.border, 'border',
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5',
        className,
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-base', scheme.icon)}>
          {typeof icon === 'string' ? icon : icon}
        </div>
        {growth != null && <GrowthChip value={growth} />}
      </div>

      {/* Value */}
      <div>
        <div className={cn('text-2xl font-black tracking-tight', scheme.text)} dir="ltr">
          {displayValue ?? '—'}
        </div>
        <div className="text-slate-400 text-xs mt-1 font-medium">{title}</div>
        {sublabel && <div className="text-slate-500 text-xs mt-0.5">{sublabel}</div>}
      </div>

      {/* Target progress */}
      {target != null && targetPct != null && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">{targetLabel || 'vs الهدف'}</span>
            <span className={scheme.text}>{targetPct?.toFixed(0)}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${targetPct}%`, background: scheme.ring }}
            />
          </div>
        </div>
      )}

      {/* Subtle bottom glow */}
      <div
        className="absolute inset-x-0 bottom-0 h-[2px] rounded-b-2xl opacity-30"
        style={{ background: scheme.ring }}
      />
    </div>
  );
}
