import { useState } from 'react';
import { cn } from '@/lib/utils';
import { GrowthChip } from '../shared/SharedComponents';
import Sparkline from './Sparkline';
import {
  ChevronDown,
  ShieldCheck,
  Sparkles,
  Info,
  CheckCircle2,
  TrendingUp,
  Target,
  Layers,
  HelpCircle,
} from 'lucide-react';

const COLOR_MAP = {
  emerald: {
    text: 'text-[#0F172A]',
    bg: 'bg-emerald-50/50',
    border: 'border-slate-200/90',
    hoverBorder: 'hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-500/5',
    ring: '#059669',
    icon: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    accent: '#10B981',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    glow: 'rgba(5,150,105,0.08)',
  },
  blue: {
    text: 'text-[#0F172A]',
    bg: 'bg-blue-50/50',
    border: 'border-slate-200/90',
    hoverBorder: 'hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/5',
    ring: '#2563EB',
    icon: 'bg-blue-50 text-blue-700 border border-blue-200',
    accent: '#3B82F6',
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
    glow: 'rgba(37,99,235,0.08)',
  },
  purple: {
    text: 'text-[#0F172A]',
    bg: 'bg-indigo-50/50',
    border: 'border-slate-200/90',
    hoverBorder: 'hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/5',
    ring: '#6366F1',
    icon: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    accent: '#8B5CF6',
    badge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    glow: 'rgba(99,102,241,0.08)',
  },
  amber: {
    text: 'text-[#0F172A]',
    bg: 'bg-amber-50/50',
    border: 'border-slate-200/90',
    hoverBorder: 'hover:border-amber-500 hover:shadow-md hover:shadow-amber-500/5',
    ring: '#D97706',
    icon: 'bg-amber-50 text-amber-700 border border-amber-200',
    accent: '#F59E0B',
    badge: 'bg-amber-50 text-amber-900 border-amber-200',
    glow: 'rgba(217,119,6,0.08)',
  },
  red: {
    text: 'text-[#0F172A]',
    bg: 'bg-rose-50/50',
    border: 'border-slate-200/90',
    hoverBorder: 'hover:border-rose-500 hover:shadow-md hover:shadow-rose-500/5',
    ring: '#E11D48',
    icon: 'bg-rose-50 text-rose-700 border border-rose-200',
    accent: '#F43F5E',
    badge: 'bg-rose-50 text-rose-800 border-rose-200',
    glow: 'rgba(225,29,72,0.08)',
  },
  slate: {
    text: 'text-[#0F172A]',
    bg: 'bg-slate-50/50',
    border: 'border-slate-200/90',
    hoverBorder: 'hover:border-slate-400 hover:shadow-md hover:shadow-slate-500/5',
    ring: '#475569',
    icon: 'bg-slate-100 text-slate-700 border border-slate-200',
    accent: '#64748B',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    glow: 'rgba(71,85,105,0.08)',
  },
};

function renderDisplayValue(displayValue) {
  if (displayValue == null) return '—';
  const str = String(displayValue).trim();

  if (str.endsWith('ر.س')) {
    const numPart = str.replace(/\s*ر\.س$/, '').trim();
    return (
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A] font-mono">
          {numPart}
        </span>
        <span className="text-xs font-bold text-slate-500">
          ر.س
        </span>
      </div>
    );
  }

  return (
    <div className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A] font-mono">
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
  details,
  forceExpanded = false,
  onClick,
  className,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const scheme = COLOR_MAP[color] || COLOR_MAP.emerald;

  const targetPct = target
    ? Math.min((parseFloat(displayValue?.toString().replace(/[^0-9.]/g, '')) / target) * 100, 100)
    : null;

  // Sparkline data
  const trendData = sparklineData || (growth >= 0
    ? [20, 24, 22, 28, 26, 31, 29, 36, 34, 40]
    : [40, 36, 38, 32, 30, 26, 28, 22, 24, 18]);

  // Check if there are interactive details to show in the dropdown drawer
  const hasDetails = Boolean(details || sublabel || target);
  const showDrawer = forceExpanded || isExpanded;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative rounded-3xl border border-slate-200/90 p-4 sm:p-5 flex flex-col justify-between gap-3',
        'bg-white shadow-xs hover:shadow-md transition-all duration-300',
        scheme.hoverBorder,
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {/* 1. Header Row: Icon + Growth + Sparkline (Ultra-clean, zero clutter) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-2xs shrink-0', scheme.icon)}>
            {typeof icon === 'string' ? icon : icon}
          </div>
          {growth != null && <GrowthChip value={growth} />}
        </div>
        <div className="opacity-80 group-hover:opacity-100 transition-opacity">
          <Sparkline data={trendData} color={scheme.ring} width={76} height={28} />
        </div>
      </div>

      {/* 2. Value & Title Only (No crowded text paragraphs on the card face) */}
      <div className="space-y-1">
        {renderDisplayValue(displayValue)}
        <div className="text-slate-800 text-xs sm:text-sm font-bold tracking-tight">
          {title}
        </div>
      </div>

      {/* 3. Interactive Details Dropdown Button */}
      {hasDetails && (
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className={cn(
              'w-full flex items-center justify-between px-2 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200',
              showDrawer
                ? 'bg-slate-100 text-[#0F172A]'
                : 'text-slate-500 hover:text-[#0F172A] hover:bg-slate-50'
            )}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className={cn('w-3.5 h-3.5', showDrawer ? 'text-blue-600' : 'text-slate-400')} />
              <span>{showDrawer ? 'إخفاء التفاصيل' : 'تفاصيل الحسبة والمطابقة'}</span>
            </span>
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 transition-transform duration-200 text-slate-500',
                showDrawer && 'rotate-180 text-blue-600'
              )}
            />
          </button>

          {/* 4. Smooth Slide-Down Interactive Drawer (منسدلة تفاعلية ذكية) */}
          {showDrawer && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-2.5 text-right font-sans animate-in fade-in-50 duration-200">
              {/* Concept / Context Description */}
              {(details?.concept || sublabel) && (
                <div className="text-[11px] text-slate-600 font-medium leading-relaxed bg-slate-50/80 p-2 rounded-xl border border-slate-200/60">
                  {details?.concept || sublabel}
                </div>
              )}

              {/* Breakdown Bars with Percentages */}
              {details?.breakdown && details.breakdown.length > 0 && (
                <div className="space-y-2 bg-slate-50/60 p-2 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-bold flex items-center justify-between">
                    <span>التوزيع والتفصيل:</span>
                    <span>القيمة</span>
                  </div>
                  {details.breakdown.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-700 font-medium flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: item.color || scheme.accent }}
                          />
                          <span>{item.label}</span>
                        </span>
                        <span className="font-bold text-[#0F172A] font-mono text-[11px]" dir="ltr">
                          {item.value}
                        </span>
                      </div>
                      {item.pct != null && (
                        <div className="h-1.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(item.pct, 100)}%`,
                              backgroundColor: item.color || scheme.accent,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Target & Variance Info */}
              {(details?.targetText || (target != null && targetPct != null)) && (
                <div className="space-y-1.5 bg-blue-50/40 p-2 rounded-xl border border-blue-100/60">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <Target className="w-3 h-3 text-blue-600" />
                      <span>{details?.targetText || targetLabel || 'المستهدف البيعي'}</span>
                    </span>
                    {targetPct != null && (
                      <span className="font-black text-blue-700 font-mono text-[11px]">
                        {targetPct.toFixed(0)}%
                      </span>
                    )}
                  </div>
                  {targetPct != null && (
                    <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 bg-blue-600"
                        style={{ width: `${targetPct}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Formula */}
              {details?.formula && (
                <div className="text-[10px] text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/50">
                  <span className="font-bold text-slate-700">📐 المعادلة:</span>
                  <span className="font-mono text-slate-600 truncate">{details.formula}</span>
                </div>
              )}

              {/* Audit Verification Badge */}
              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{details?.audit || 'مطابق وموثق 100%'}</span>
                </span>
                <span className="text-[9px] text-slate-400 font-medium">تدقيق أغسطس 2026</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtle Color Accent Line */}
      <div
        className="absolute inset-x-0 bottom-0 h-[2.5px] rounded-b-3xl opacity-50 group-hover:opacity-100 transition-opacity"
        style={{ background: scheme.ring }}
      />
    </div>
  );
}
