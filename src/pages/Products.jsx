import { useState, useMemo } from 'react';
import { formatNum } from '../lib/kpiEngine';
import { cn } from '@/lib/utils';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Award,
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  Filter,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  ShieldCheck,
  Wrench,
  Boxes,
  Flame,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { REAL_INVENTORY_STATS, REAL_ALL_PARTS } from '../data/realInventoryData';

const PAGE_SIZE = 50;

const BRAND_FILTERS = [
  { key: 'all', label: 'كافة الأصناف', count: REAL_INVENTORY_STATS.totalSKUs },
  { key: 'hyundai', label: 'قطع غيار هيونداي', count: REAL_INVENTORY_STATS.brandStats.hyundai.count },
  { key: 'kia', label: 'قطع غيار كيا', count: REAL_INVENTORY_STATS.brandStats.kia.count },
  { key: 'mobis', label: 'قطع موبيس الأصلية', count: REAL_INVENTORY_STATS.brandStats.mobis.count },
  { key: 'general', label: 'سوائل ومثبتات عامة', count: REAL_INVENTORY_STATS.brandStats.general.count },
];

const CATEGORY_OPTIONS = [
  'الكل',
  'زيوت وسوائل تبريد',
  'فلاتر ومصفيات',
  'مكابح وهوبات',
  'مساعدات ونظام تعليق',
  'كهرباء وإشعال',
  'محرك وسيور',
  'كلبسات ومثبتات',
  'هيكل وإنارة وبودي',
  'قطع غيار عامة واستقرام',
];

const STATUS_FILTERS = [
  { key: 'all', label: 'كافة الحالات' },
  { key: 'in_stock', label: 'متوفر بالمستودع' },
  { key: 'low_stock', label: 'مخزون حرج' },
  { key: 'out_of_stock', label: 'نفد من المخزن' },
];

export default function Products() {
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('issued'); // 'issued' | 'balance' | 'received' | 'opening' | 'sku'
  const [sortDesc, setSortDesc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & Sort Pipeline
  const filteredParts = useMemo(() => {
    let result = REAL_ALL_PARTS;

    // 1. Search Query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }

    // 2. Brand Filter
    if (selectedBrand !== 'all') {
      result = result.filter((p) => p.brand === selectedBrand);
    }

    // 3. Category Filter
    if (selectedCategory !== 'الكل') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // 4. Status Filter
    if (selectedStatus !== 'all') {
      result = result.filter((p) => p.status === selectedStatus);
    }

    // 5. Sorting
    result = [...result].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string') {
        return sortDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
      }
      return sortDesc ? (valB || 0) - (valA || 0) : (valA || 0) - (valB || 0);
    });

    return result;
  }, [search, selectedBrand, selectedCategory, selectedStatus, sortBy, sortDesc]);

  // Pagination Math
  const totalPages = Math.ceil(filteredParts.length / PAGE_SIZE) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedParts = filteredParts.slice(startIndex, startIndex + PAGE_SIZE);

  const resetFilters = () => {
    setSearch('');
    setSelectedBrand('all');
    setSelectedCategory('الكل');
    setSelectedStatus('all');
    setSortBy('issued');
    setSortDesc(true);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      {/* ── 1. Top Header & Official Ledger Verification Badge ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Boxes className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              ذكاء قطع الغيار والمخزون الميداني (Spare Parts Intelligence)
            </h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium mr-9">
            سجل حركة المخزن والمبيعات حتى شهر سبتمبر 2026 · بيانات حقيقية 100% مدققة لـ 8,693 كود قطعة غيار
          </p>
        </div>

        {/* Live File Verification Badge */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2 rounded-2xl text-xs font-bold shadow-2xs shrink-0 self-start lg:self-center">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>مطابقة لسجل حركة المخزن: «حركة مخزن الى شهر 9 2026.xlsx»</span>
        </div>
      </div>

      {/* ── 2. Four Authentic KPI Metrics Tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>إجمالي الأصناف المسجلة</span>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono" dir="ltr">
            {formatNum(REAL_INVENTORY_STATS.totalSKUs)}
          </div>
          <div className="text-[11px] text-blue-700 font-bold">
            كود قطعة غيار (SKU)
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>إجمالي المنصرف / المباع</span>
            <Flame className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono text-emerald-700" dir="ltr">
            {formatNum(REAL_INVENTORY_STATS.totalIssued)}
          </div>
          <div className="text-[11px] text-emerald-700 font-bold">
            قطعة غيار مباعة ({formatNum(REAL_INVENTORY_STATS.itemsWithSales)} صنف نشط)
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>الرصيد الفعلي المتوفر</span>
            <Package className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono text-cyan-700" dir="ltr">
            {formatNum(REAL_INVENTORY_STATS.totalBalance)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            قطعة جاهزة بمستودعات بريدة
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>إجمالي الوارد الإضافي</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono" dir="ltr">
            {formatNum(REAL_INVENTORY_STATS.totalReceived)}
          </div>
          <div className="text-[11px] text-indigo-700 font-bold">
            قطعة موردة للمخازن
          </div>
        </div>
      </div>

      {/* ── 3. High-Performance Instant Filter & Search Toolbar ── */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        {/* Row 1: Search Box + Category Dropdown + Status Dropdown */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث برقم الصنف (مثل: 04500, 26320, 54551) أو اسم القطعة (سنتافي, زيت, مقص, كيا)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                مسح
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">الفئة:</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">حالة المخزون:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              {STATUS_FILTERS.map((st) => (
                <option key={st.key} value={st.key}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(search || selectedBrand !== 'all' || selectedCategory !== 'الكل' || selectedStatus !== 'all') && (
            <button
              type="button"
              onClick={resetFilters}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 shrink-0 transition-all"
              title="إعادة تعيين الفلاتر"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إلغاء التصفية</span>
            </button>
          )}
        </div>

        {/* Row 2: Brand Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 ml-1">تصفية حسب التخصص:</span>
          {BRAND_FILTERS.map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() => {
                setSelectedBrand(b.key);
                setCurrentPage(1);
              }}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs',
                selectedBrand === b.key
                  ? 'bg-[#0F172A] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
              )}
            >
              <span>{b.label}</span>
              <span className={cn('text-[10px] font-mono px-1.5 py-0.2 rounded-md', selectedBrand === b.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700')}>
                {formatNum(b.count)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. Filter Results Summary & Sort Status ── */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          تم العثور على <strong className="text-slate-900 font-mono font-black">{formatNum(filteredParts.length)}</strong> صنف مطابق
          {filteredParts.length !== REAL_INVENTORY_STATS.totalSKUs && ` (من أصل ${formatNum(REAL_INVENTORY_STATS.totalSKUs)} صنف)`}
        </div>
        <div className="flex items-center gap-3">
          <span>
            الصفحة <strong className="font-mono text-slate-900">{safePage}</strong> من <strong className="font-mono text-slate-900">{totalPages}</strong>
          </span>
        </div>
      </div>

      {/* ── 5. The Comprehensive Authentic Spare Parts Table ── */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-black">
                <th className="py-3.5 px-4">رقم الصنف (OEM Part No)</th>
                <th className="py-3.5 px-4 min-w-[220px]">اسم قطعة الغيار</th>
                <th className="py-3.5 px-4">الفئة</th>
                <th className="py-3.5 px-4">الوحدة</th>
                <th
                  onClick={() => {
                    if (sortBy === 'opening') setSortDesc(!sortDesc);
                    else { setSortBy('opening'); setSortDesc(true); }
                  }}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>الرصيد الافتتاحي</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortBy === 'received') setSortDesc(!sortDesc);
                    else { setSortBy('received'); setSortDesc(true); }
                  }}
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>الوارد</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortBy === 'issued') setSortDesc(!sortDesc);
                    else { setSortBy('issued'); setSortDesc(true); }
                  }}
                  className="py-3.5 px-4 cursor-pointer bg-emerald-50/70 text-emerald-950 hover:bg-emerald-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>المنصرف (المبيعات)</span>
                    <ArrowUpDown className="w-3 h-3 text-emerald-700" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortBy === 'balance') setSortDesc(!sortDesc);
                    else { setSortBy('balance'); setSortDesc(true); }
                  }}
                  className="py-3.5 px-4 cursor-pointer bg-blue-50/70 text-blue-950 hover:bg-blue-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>الرصيد بالمستودع</span>
                    <ArrowUpDown className="w-3 h-3 text-blue-700" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">حالة المخزون</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedParts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                    لا توجد أصناف تطابق معايير البحث والتصفية المحددة.
                  </td>
                </tr>
              ) : (
                paginatedParts.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* SKU */}
                      <td className="py-3 px-4 font-mono font-black text-slate-900">
                        {p.sku}
                      </td>

                      {/* Name + Brand Badge */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {p.brand === 'hyundai' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-100">
                              هيونداي
                            </span>
                          )}
                          {p.brand === 'kia' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-100">
                              كيا
                            </span>
                          )}
                          {p.brand === 'mobis' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                              موبيس أصلي
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg whitespace-nowrap">
                          {p.category}
                        </span>
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-4 text-slate-500 font-medium">
                        {p.unit}
                      </td>

                      {/* Opening */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-600">
                        {formatNum(p.opening)}
                      </td>

                      {/* Received */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        {formatNum(p.received)}
                      </td>

                      {/* Issued (Sold) */}
                      <td className="py-3 px-4 font-mono font-black text-emerald-700 bg-emerald-50/40 text-sm">
                        {formatNum(p.issued)}
                      </td>

                      {/* Balance (In Stock) */}
                      <td className="py-3 px-4 font-mono font-black text-blue-800 bg-blue-50/40 text-sm">
                        {formatNum(p.balance)}
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {p.status === 'in_stock' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>متوفر</span>
                          </span>
                        )}
                        {p.status === 'low_stock' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>مخزون حرج</span>
                          </span>
                        )}
                        {p.status === 'out_of_stock' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>نافد</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── 6. Pagination Navigation Bar ── */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            عرض <strong className="text-slate-900 font-mono">{startIndex + 1}</strong> -{' '}
            <strong className="text-slate-900 font-mono">
              {Math.min(startIndex + PAGE_SIZE, filteredParts.length)}
            </strong>{' '}
            من إجمالي <strong className="text-slate-900 font-mono font-black">{formatNum(filteredParts.length)}</strong> صنف
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-all"
              title="الصفحة الأولى"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-all"
              title="الصفحة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="px-3 py-1 font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-lg">
              {safePage} / {totalPages}
            </div>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-all"
              title="الصفحة التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-all"
              title="الصفحة الأخيرة"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
