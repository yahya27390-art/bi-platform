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
          <h1 className="text-2xl font-black text-slate-900">ذكاء المنتجات والمخزون (Product Intelligence)</h1>
          <p className="text-slate-500 text-sm mt-1">{products?.length || 0} منتج نشط · تصنيف الربحية وتحليل دوران المخزون</p>
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
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
              ⭐ المنتجات النجمية (Stars)
            </span>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">نمو + هامش مرتفع</span>
          </div>
          <p className="text-xs text-slate-600">أقمشة فرامل هيونداي، فلاتر كيا الأصلية — محركات النمو الأساسية ويجب تكثيف الحملات الإعلانية لها.</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-blue-950 flex items-center gap-1.5">
              💰 مولدات السيولة (Cash Cows)
            </span>
            <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">حجم مبيعات عالي ومستقر</span>
          </div>
          <p className="text-xs text-slate-600">زيوت المحركات وتجهيزات الصيانة الدورية — تولد تدفقاً نقدياً يومياً ثابتاً بتكلفة تسويق منخفضة.</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              🚀 فرص واعدة (High Margin Potential)
            </span>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">هامش ربح فوق 48%</span>
          </div>
          <p className="text-xs text-slate-600">إكسسوارات الفئات الفاخرة وكاميرات المراقبة — هامش ممتاز ولكن تحتاج لتجربة حزم مجمعة (Bundles).</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <input
          type="text" placeholder="بحث عن منتج بالاسم أو الكود..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-72 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 shadow-sm"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">ترتيب بـ:</span>
          {SORT_OPTIONS.map(o => (
            <button key={o.key} onClick={() => setSortBy(o.key)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
                sortBy === o.key
                  ? 'bg-[#0F172A] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
              )}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['المنتج', 'الفئة', 'السعر', 'الوحدات', 'الإيرادات', 'الربح الإجمالي', 'الهامش', 'النمو', 'المخزون', 'التقييم'].map(h => (
                  <th key={h} className="text-right text-xs text-slate-600 font-bold py-3.5 px-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:6}).map((_,i) => (
                  <tr key={i} className="border-b border-slate-100">
                    {Array.from({length:10}).map((_,j) => (
                      <td key={j} className="py-4 px-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : products?.map(p => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 text-xs">{p.name}</div>
                    <div className="text-slate-500 text-xs font-mono">{p.sku}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs text-slate-700 font-medium bg-slate-100 px-2 py-0.5 rounded-lg">{p.category}</span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-700 font-medium" dir="ltr">{formatSAR(p.unitPrice)}</td>
                  <td className="py-3.5 px-4 text-slate-900 font-bold text-xs">{formatNum(p.unitsSold)}</td>
                  <td className="py-3.5 px-4 text-slate-900 font-black text-xs" dir="ltr">{formatSAR(p.revenue, true)}</td>
                  <td className="py-3.5 px-4 text-emerald-700 font-bold text-xs" dir="ltr">{formatSAR(p.grossProfit, true)}</td>
                  <td className="py-3.5 px-4">
                    <span className={cn('text-xs font-black', p.marginPct >= 45 ? 'text-emerald-700' : p.marginPct >= 30 ? 'text-blue-800' : 'text-amber-700')}>
                      {p.marginPct?.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4"><GrowthChip value={p.growth} /></td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      {p.stockQty <= p.reorderPoint
                        ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        : <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                      <span className="text-xs text-slate-700 font-semibold">{formatNum(p.stockQty)}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span className="text-xs text-slate-800 font-bold">{p.rating}</span>
                      <span className="text-[11px] text-slate-500">({p.reviewCount})</span>
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
