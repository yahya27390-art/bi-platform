import { useState } from 'react';
import { useProducts, usePeriods } from '../hooks/useBIData';
import { formatSAR, formatNum } from '../lib/kpiEngine';
import { GrowthChip, CardSkeleton, SectionHeader } from '../components/shared/SharedComponents';
import { cn } from '@/lib/utils';
import { Package, TrendingUp, TrendingDown, Star, AlertTriangle } from 'lucide-react';

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

  const categories = [...new Set(products?.map(p => p.category) || [])];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">أداء المنتجات</h1>
          <p className="text-slate-400 text-sm mt-1">{products?.length || 0} منتج · سبتمبر 2026</p>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && products && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-4">
            <div className="text-xs text-slate-500 mb-1">إجمالي الإيرادات</div>
            <div className="text-xl font-black text-white">{formatSAR(products.reduce((s,p)=>s+(p.revenue||0),0), true)}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-4">
            <div className="text-xs text-slate-500 mb-1">إجمالي الوحدات المباعة</div>
            <div className="text-xl font-black text-white">{formatNum(products.reduce((s,p)=>s+(p.unitsSold||0),0))}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-4">
            <div className="text-xs text-slate-500 mb-1">متوسط الهامش</div>
            <div className="text-xl font-black text-emerald-400">
              {(products.reduce((s,p)=>s+(p.marginPct||0),0)/products.length).toFixed(1)}%
            </div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-4">
            <div className="text-xs text-slate-500 mb-1">مخزون منخفض</div>
            <div className="text-xl font-black text-amber-400">
              {products.filter(p => p.stockQty <= p.reorderPoint).length}
            </div>
          </div>
        </div>
      )}

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
