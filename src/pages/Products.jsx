import { useState } from 'react';
import { useProducts, usePeriods } from '../hooks/useBIData';
import { formatSAR, formatNum } from '../lib/kpiEngine';
import { GrowthChip, CardSkeleton, SectionHeader } from '../components/shared/SharedComponents';
import KPICard from '../components/charts/KPICard';
import { cn } from '@/lib/utils';
import { Package, TrendingUp, TrendingDown, Star, AlertTriangle, Sparkles, DollarSign, Award, Layers } from 'lucide-react';

const SORT_OPTIONS = [
  { key: 'revenue', label: 'الإيرادات', desc: true },
  { key: 'unitsSold', label: 'المبيعات', desc: true },
  { key: 'marginPct', label: 'الهامش', desc: true },
  { key: 'growth', label: 'النمو', desc: true },
];

export default function Products() {
  const [sortBy, setSortBy] = useState('revenue');
  const [search, setSearch] = useState('');
  const { data: products, loading } = useProducts({ sortBy, sortDesc: true, search });

  const totalRev = products?.reduce((s, p) => s + (p.revenue || 0), 0) || 0;
  const totalUnits = products?.reduce((s, p) => s + (p.unitsSold || 0), 0) || 0;
  const avgMargin = products?.length ? (products.reduce((s, p) => s + (p.marginPct || 0), 0) / products.length) : 0;
  const lowStockCount = products?.filter(p => p.stockQty <= p.reorderPoint).length || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">ذكاء المنتجات والمخزون (Product Intelligence)</h1>
          <p className="text-slate-400 text-sm mt-1">{products?.length || 0} منتج نشط · تصنيف الربحية وتحليل دوران المخزون</p>
        </div>
      </div>

      {/* Summary KPI Cards with Sparklines */}
      {!loading && products && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="إجمالي إيرادات المنتجات"
            displayValue={formatSAR(totalRev, true)}
            growth={15.8}
            icon={<DollarSign className="w-5 h-5" />}
            color="emerald"
            sparklineData={[180000, 210000, 230000, 245000, 270000, totalRev]}
          />
          <KPICard
            title="إجمالي الوحدات المباعة"
            displayValue={formatNum(totalUnits)}
            growth={12.1}
            icon={<Package className="w-5 h-5" />}
            color="blue"
            sparklineData={[1200, 1350, 1420, 1510, 1600, totalUnits]}
          />
          <KPICard
            title="متوسط هامش الربح"
            displayValue={`${avgMargin.toFixed(1)}%`}
            growth={3.2}
            icon={<Award className="w-5 h-5" />}
            color="purple"
            sparklineData={[38, 39, 41, 40, 42, avgMargin]}
          />
          <KPICard
            title="تنبيهات المخزون الحرج"
            displayValue={formatNum(lowStockCount)}
            growth={lowStockCount > 2 ? -10 : 0}
            icon={<AlertTriangle className="w-5 h-5" />}
            color={lowStockCount > 0 ? 'amber' : 'emerald'}
            sublabel="منتجات وصلت لنقطة إعادة الطلب"
          />
        </div>
      )}

      {/* Product Profitability & Growth Quadrants (Portfolio Matrix) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
              ⭐ المنتجات النجمية (Stars)
            </span>
            <span className="text-[11px] font-mono text-emerald-300/80 bg-emerald-500/15 px-2 py-0.5 rounded">نمو + هامش مرتفع</span>
          </div>
          <p className="text-xs text-slate-300">أقمشة فرامل هيونداي، فلاتر كيا الأصلية — محركات النمو الأساسية ويجب تكثيف الحملات الإعلانية لها.</p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-blue-400 flex items-center gap-1.5">
              💰 مولدات السيولة (Cash Cows)
            </span>
            <span className="text-[11px] font-mono text-blue-300/80 bg-blue-500/15 px-2 py-0.5 rounded">حجم مبيعات عالي ومستقر</span>
          </div>
          <p className="text-xs text-slate-300">زيوت المحركات وتجهيزات الصيانة الدورية — تولد تدفقاً نقدياً يومياً ثابتاً بتكلفة تسويق منخفضة.</p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
              🚀 فرص واعدة (High Margin Potential)
            </span>
            <span className="text-[11px] font-mono text-amber-300/80 bg-amber-500/15 px-2 py-0.5 rounded">هامش ربح فوق 48%</span>
          </div>
          <p className="text-xs text-slate-300">إكسسوارات الفئات الفاخرة وكاميرات المراقبة — هامش ممتاز ولكن تحتاج لتجربة حزم مجمعة (Bundles).</p>
        </div>
      </div>


      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <input
          type="text" placeholder="بحث عن منتج..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-64 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500/50"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">ترتيب بـ:</span>
          {SORT_OPTIONS.map(o => (
            <button key={o.key} onClick={() => setSortBy(o.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                sortBy === o.key
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white border border-white/5'
              )}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-white/5 bg-[#111827]/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/2">
                {['المنتج', 'الفئة', 'السعر', 'الوحدات', 'الإيرادات', 'الربح الإجمالي', 'الهامش', 'النمو', 'المخزون', 'التقييم'].map(h => (
                  <th key={h} className="text-right text-xs text-slate-500 font-semibold py-3 px-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:6}).map((_,i) => (
                  <tr key={i} className="border-b border-white/3">
                    {Array.from({length:10}).map((_,j) => (
                      <td key={j} className="py-4 px-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : products?.map(p => (
                <tr key={p.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white text-xs">{p.name}</div>
                    <div className="text-slate-500 text-xs">{p.sku}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg">{p.category}</span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-300" dir="ltr">{formatSAR(p.unitPrice)}</td>
                  <td className="py-3.5 px-4 text-white font-bold text-xs">{formatNum(p.unitsSold)}</td>
                  <td className="py-3.5 px-4 text-white font-bold text-xs" dir="ltr">{formatSAR(p.revenue, true)}</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold text-xs" dir="ltr">{formatSAR(p.grossProfit, true)}</td>
                  <td className="py-3.5 px-4">
                    <span className={cn('text-xs font-bold', p.marginPct >= 45 ? 'text-emerald-400' : p.marginPct >= 30 ? 'text-amber-400' : 'text-red-400')}>
                      {p.marginPct?.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4"><GrowthChip value={p.growth} /></td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      {p.stockQty <= p.reorderPoint
                        ? <AlertTriangle className="w-3 h-3 text-amber-400" />
                        : <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                      <span className="text-xs text-slate-300">{formatNum(p.stockQty)}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-slate-300">{p.rating}</span>
                      <span className="text-xs text-slate-500">({p.reviewCount})</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
