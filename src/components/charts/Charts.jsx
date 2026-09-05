import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

// Custom Tooltip
const CustomTooltip = ({ active, payload, label, formatValue }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a2332] border border-white/10 rounded-xl p-3 shadow-2xl min-w-[140px]">
      <p className="text-slate-400 text-xs mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-300 font-medium">
            {entry.name && <span className="text-slate-500 text-xs mr-1">{entry.name} </span>}
            {formatValue ? formatValue(entry.value) : entry.value?.toLocaleString('ar-SA')}
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * Multi-series area chart for revenue/spend trends
 */
export function TrendAreaChart({ data, series = [], height = 240, formatValue }) {
  if (!data?.length) return <div className="flex items-center justify-center h-40 text-slate-500 text-sm">لا توجد بيانات</div>;

  const xKey = data[0] ? Object.keys(data[0]).find(k => typeof data[0][k] === 'string') || 'month' : 'month';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        <defs>
          {series.map(s => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={s.color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
        <XAxis dataKey={xKey} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={v => formatValue ? formatValue(v) : v.toLocaleString()} width={60} />
        <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
        <Legend
          formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{series.find(s => s.key === value)?.label || value}</span>}
        />
        {series.map(s => (
          <Area
            key={s.key} type="monotone" dataKey={s.key}
            stroke={s.color} strokeWidth={2.5}
            fill={`url(#grad-${s.key})`}
            name={s.label || s.key}
            dot={false} activeDot={{ r: 4, fill: s.color }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * Grouped bar chart for comparisons
 */
export function ComparisonBarChart({ data, series = [], height = 220, formatValue }) {
  if (!data?.length) return <div className="flex items-center justify-center h-40 text-slate-500 text-sm">لا توجد بيانات</div>;

  const xKey = data[0] ? Object.keys(data[0]).find(k => typeof data[0][k] === 'string') || 'month' : 'month';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }} barGap={2} barSize={14}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
          tickFormatter={v => formatValue ? formatValue(v) : v.toLocaleString()} width={60} />
        <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
        <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{series.find(s => s.key === value)?.label || value}</span>} />
        {series.map(s => (
          <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[4, 4, 0, 0]} name={s.label || s.key} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Funnel visualization — horizontal bars with drop-off %
 */
export function FunnelViz({ data = [], height = 280 }) {
  if (!data.length) return <div className="flex items-center justify-center h-40 text-slate-500 text-sm">لا توجد بيانات</div>;

  const maxVal = data[0]?.value || 1;

  return (
    <div className="space-y-2" style={{ minHeight: height }}>
      {data.map((step, i) => {
        const pct     = (step.value / maxVal) * 100;
        const dropOff = i > 0 ? (((data[i - 1].value - step.value) / data[i - 1].value) * 100).toFixed(1) : 0;
        return (
          <div key={i} className="flex items-center gap-3">
            {/* Stage label */}
            <div className="w-32 text-xs text-slate-400 text-left shrink-0 truncate">{step.stage || step.stageEn}</div>
            {/* Bar */}
            <div className="flex-1 h-7 bg-white/3 rounded-lg overflow-hidden relative">
              <div
                className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                style={{ width: `${pct}%`, background: step.color }}
              >
                <span className="text-white text-xs font-bold whitespace-nowrap">
                  {step.value >= 1_000_000 ? `${(step.value / 1_000_000).toFixed(1)}M`
                    : step.value >= 1_000 ? `${(step.value / 1_000).toFixed(0)}K`
                    : step.value.toLocaleString()}
                </span>
              </div>
            </div>
            {/* Drop-off */}
            <div className="w-16 text-right shrink-0">
              {i > 0 && (
                <span className="text-xs text-red-400 font-semibold">-{dropOff}%</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Metric Ring — circular progress for targets
 */
export function MetricRing({ value, target, color = '#10B981', size = 90, label }) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  const r   = (size / 2) - 8;
  const circumference = 2 * Math.PI * r;
  const dashOffset    = circumference * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={6}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black text-white" dir="ltr">{Math.round(pct)}%</span>
        </div>
      </div>
      {label && <div className="text-xs text-slate-400 text-center">{label}</div>}
    </div>
  );
}
