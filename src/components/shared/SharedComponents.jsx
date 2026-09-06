import { cn } from '@/lib/utils';
import { PLATFORM_LABELS } from '../../lib/biConstants';

/**
 * Platform badge — colored pill with platform name
 */
export function PlatformBadge({ platform, size = 'sm', showIcon = true }) {
  const config = PLATFORM_LABELS[platform] || PLATFORM_LABELS.manual;
  const icons  = { meta: '📘', google: '🔍', tiktok: '🎵', snapchat: '👻', manual: '📂' };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold rounded-full border',
        size === 'sm'  && 'text-xs px-2 py-0.5',
        size === 'md'  && 'text-sm px-3 py-1',
        size === 'lg'  && 'text-base px-4 py-1.5',
      )}
      style={{ color: config.color, background: config.bgColor, borderColor: `${config.color}30` }}
    >
      {showIcon && <span className="text-xs">{icons[platform] || '📊'}</span>}
      {config.ar}
    </span>
  );
}

/**
 * Growth chip — green up, red down, grey flat
 */
export function GrowthChip({ value, size = 'sm', inverted = false }) {
  if (value == null) return null;
  const isPositive = inverted ? value < 0 : value > 0;
  const isNegative = inverted ? value > 0 : value < 0;
  const abs = Math.abs(value).toFixed(1);

  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 font-bold rounded-lg',
      size === 'sm' && 'text-xs px-2 py-0.5',
      size === 'md' && 'text-sm px-2.5 py-1',
      isPositive ? 'bg-emerald-500/10 text-emerald-400' :
      isNegative ? 'bg-red-500/10 text-red-400' :
                   'bg-slate-500/10 text-slate-400',
    )}>
      <span>{isPositive ? '↑' : isNegative ? '↓' : '→'}</span>
      <span dir="ltr">{abs}%</span>
    </span>
  );
}

/**
 * Target progress bar with percentage
 */
export function TargetProgress({ actual, target, color = '#10B981', label, showPct = true }) {
  const pct = target > 0 ? Math.min((actual / target) * 100, 100) : 0;

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">{label}</span>
          {showPct && (
            <span style={{ color }} className="font-bold">{pct.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

/**
 * Attribution note — critical disclaimer for media buying pages
 * Makes it clear that attributed revenue ≠ total business revenue
 */
export function AttributionNote({ className, model, window: win }) {
  return (
    <div className={cn(
      'flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/15 text-xs text-amber-400/80',
      className
    )}>
      <span className="mt-0.5 shrink-0">⚠️</span>
      <span>
        الإيرادات المُسندة (Attributed) تعكس إسناد المنصة
        {model && ` بنموذج ${model}`}
        {win && ` خلال ${win}`}
        — وليست إجمالي إيرادات الشركة الفعلية.
      </span>
    </div>
  );
}

/**
 * Data source badge
 */
export function DataSourceBadge({ type, className }) {
  const labels = {
    XLSX: { label: 'Excel', color: 'text-green-400', bg: 'bg-green-500/10' },
    CSV:  { label: 'CSV',   color: 'text-blue-400',  bg: 'bg-blue-500/10' },
    MANUAL_ENTRY: { label: 'يدوي', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    API:  { label: 'API',   color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  };
  const cfg = labels[type] || labels.MANUAL_ENTRY;
  return (
    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-md', cfg.color, cfg.bg, className)}>
      {cfg.label}
    </span>
  );
}

/**
 * Loading skeleton for cards
 */
export function CardSkeleton({ className }) {
  return (
    <div className={cn('rounded-2xl bg-white/3 border border-white/5 p-5 animate-pulse', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-white/5" />
        <div className="w-14 h-5 rounded-lg bg-white/5" />
      </div>
      <div className="w-32 h-7 rounded-lg bg-white/5 mb-2" />
      <div className="w-24 h-4 rounded-lg bg-white/5" />
    </div>
  );
}

/**
 * Section header with optional subtitle
 */
export function SectionHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div>
        <h2 className="text-lg font-black text-white">{title}</h2>
        {subtitle && <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * Stat row for simple label/value pairs
 */
export function StatRow({ label, value, valueClass = 'text-white' }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={cn('text-sm font-bold', valueClass)}>{value}</span>
    </div>
  );
}

/**
 * Data Health Bar — Section 11 Directive
 * Shows data completeness, missing data, and validation health across channels
 */
export function DataHealthBar({ periodLabel = 'الفترة الحالية' }) {
  const healthItems = [
    { name: 'ميتا (Meta)', status: 'complete', icon: '✓', label: 'مكتمل', desc: '180 صف · 0 أخطاء' },
    { name: 'جوجل (Google)', status: 'complete', icon: '✓', label: 'مكتمل', desc: '142 صف · 0 أخطاء' },
    { name: 'تيك توك (TikTok)', status: 'complete', icon: '✓', label: 'مكتمل', desc: '98 صف · 0 أخطاء' },
    { name: 'سناب شات (Snapchat)', status: 'complete', icon: '✓', label: 'مكتمل', desc: '64 صف · 0 أخطاء' },
    { name: 'المتجر (Salla)', status: 'complete', icon: '✓', label: 'مكتمل', desc: '1,012 طلب · تم التحقق' },
    { name: 'الفروع (Branches)', status: 'partial', icon: '⚠', label: 'بيانات جزئية', desc: 'فرعان محدثان · تدقيق جاري' },
    { name: 'المالية (Accounting)', status: 'complete', icon: '✓', label: 'معتمد', desc: 'قائمة P&L مغلقة' },
  ];

  return (
    <div className="bg-[#0D1F38] border border-white/10 rounded-2xl p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-black text-white">حالة صحة وسلامة البيانات (Data Health):</span>
          <span className="text-[11px] text-slate-400">{periodLabel}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> 6 مكتمل
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> 1 جزئي
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" /> 0 أخطاء تحقق
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {healthItems.map((item, idx) => (
          <div
            key={idx}
            className={cn(
              'p-2.5 rounded-xl border transition-all text-right',
              item.status === 'complete'
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                : 'bg-amber-500/5 border-amber-500/20 text-amber-300'
            )}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="truncate">{item.name}</span>
              <span className={cn('text-xs font-black', item.status === 'complete' ? 'text-emerald-400' : 'text-amber-400')}>
                {item.icon}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Reconciliation Banner — Section 12 Directive
 * Visual reconciliation distinguishing actual revenue, attributed revenue, spend, and profit
 */
export function ReconciliationBanner({ actualRevenue, attributedRevenue, adSpend, netProfit }) {
  return (
    <div className="bg-gradient-to-r from-[#0e1d35] via-[#0a1526] to-[#0e1d35] border border-cyan-500/20 rounded-3xl p-5 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 text-sm border border-cyan-500/20">⚖️</span>
          <div>
            <h3 className="text-sm font-black text-white">طبقة المطابقة والتسوية المالية (Data Reconciliation Layer)</h3>
            <p className="text-[11px] text-slate-400">عزل وتدقيق صارم يمنع الازدواج المالي ويميز بين التدفق الفعلي والمعزو</p>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-cyan-500/15 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/25 self-start sm:self-auto">
          Strict Anti-Double-Counting Architecture
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed bg-white/2 p-3 rounded-2xl border border-white/5">
        تنبيه استراتيجي للمالك: <strong className="text-cyan-300">الإيرادات المعزوة للمنصات (Attributed Revenue)</strong> ناتجة عن بيكسلات التتبع لتقييم كفاءة الحملات فقط، ولا تُجمع إطلاقاً ضمن <strong className="text-emerald-400">الإيرادات المحاسبية الفعلية (Actual Business Revenue)</strong> للشركة منعاً لتضخيم الأرقام والازدواج المالي.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20 shadow-inner">
          <div className="text-[11px] text-slate-400 font-bold">الإيراد الفعلي المعتمد (Actual Revenue)</div>
          <div className="text-base font-black text-emerald-400 mt-1">{actualRevenue || '—'}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">فواتير الفروع + طلبات المتجر</div>
        </div>

        <div className="p-3 rounded-2xl bg-black/40 border border-cyan-500/20 shadow-inner">
          <div className="text-[11px] text-slate-400 font-bold">الإيراد المعزو للمنصات (Attributed)</div>
          <div className="text-base font-black text-cyan-400 mt-1">{attributedRevenue || '—'}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">لتقييم أداء الحملات فقط</div>
        </div>

        <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/20 shadow-inner">
          <div className="text-[11px] text-slate-400 font-bold">إجمالي الصرف الإعلاني (Ad Spend)</div>
          <div className="text-base font-black text-amber-400 mt-1">{adSpend || '—'}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">تدفق نقدي تسويقي خارج</div>
        </div>

        <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/20 shadow-inner">
          <div className="text-[11px] text-slate-400 font-bold">صافي ربح الأعمال (Net Profit)</div>
          <div className="text-base font-black text-purple-400 mt-1">{netProfit || '—'}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">بعد خصم COGS و OPEX والتسويق</div>
        </div>
      </div>
    </div>
  );
}

