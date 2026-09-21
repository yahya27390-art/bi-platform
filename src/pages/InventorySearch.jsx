import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Package,
  Download,
  Building2,
  Boxes,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  ArrowUpDown,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import {
  getEnrichedInventory,
  STATUS_META,
  exportToCsv
} from '../lib/inventoryIntelligence';
import { REAL_INVENTORY_STATS } from '../data/realInventoryData';
import { formatSAR, formatNum } from '../lib/kpiEngine';

export default function InventorySearch() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all'); // 'all' | '100' | '200' | '300'
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [sortBy, setSortBy] = useState('totalCost'); // 'totalCost' | 'balance' | 'unitCost' | 'sku'
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [copiedSku, setCopiedSku] = useState(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 280);
    return () => clearTimeout(handler);
  }, [search]);

  // Load all enriched inventory
  const allItems = useMemo(() => {
    return getEnrichedInventory();
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    let list = allItems;

    // Search query
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      list = list.filter((p) => p.searchStr.includes(q));
    }

    // Branch availability filter
    if (branchFilter === '100') {
      list = list.filter((p) => p.qtyMain > 0);
    } else if (branchFilter === '200') {
      list = list.filter((p) => p.qtyRawaf > 0);
    } else if (branchFilter === '300') {
      list = list.filter((p) => p.qtySulaim > 0);
    }

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter((p) => p.status === statusFilter);
    }

    // Brand filter
    if (brandFilter !== 'all') {
      list = list.filter((p) => p.brand === brandFilter);
    }

    // Sorting
    return [...list].sort((a, b) => {
      let valA = a[sortBy] ?? 0;
      let valB = b[sortBy] ?? 0;
      if (typeof valA === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [allItems, debouncedSearch, branchFilter, statusFilter, brandFilter, sortBy, sortOrder]);

  // Pagination slice
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  // Handle SKU copy
  const handleCopySku = (sku) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 1800);
  };

  // Toggle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Export to safe CSV
  const handleExport = () => {
    const headers = [
      { label: 'رقم القطعة (SKU)', accessor: 'sku' },
      { label: 'اسم الصنف', accessor: 'name' },
      { label: 'الفئة', accessor: 'category' },
      { label: 'الماركة', accessor: (p) => p.brand === 'hyundai' ? 'هيونداي' : p.brand === 'kia' ? 'كيا' : p.brand === 'mobis' ? 'موبيس' : 'عامة' },
      { label: 'الحالة', accessor: (p) => STATUS_META[p.status]?.label || p.status },
      { label: 'الوحدة', accessor: 'unit' },
      { label: 'سعر التكلفة (ر.س)', accessor: (p) => p.unitCost.toFixed(2) },
      { label: 'كمية المركز الرئيسي (100)', accessor: 'qtyMain' },
      { label: 'كمية فرع الرواف (200)', accessor: 'qtyRawaf' },
      { label: 'كمية السليم 2 / كيا (300)', accessor: 'qtySulaim' },
      { label: 'إجمالي الرصيد', accessor: 'balance' },
      { label: 'إجمالي قيمة التكلفة (ر.س)', accessor: (p) => p.totalCost.toFixed(2) },
    ];

    exportToCsv('dora_inventory_search_export', headers, filteredItems);
  };

  return (
    <div className="space-y-5 pb-10" dir="rtl">
      {/* ── Page Header ── */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-2xl text-cyan-400 shadow-inner">
              🔍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">
                  البحث الذكي وتوفر المخزون بالفروع
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {formatNum(REAL_INVENTORY_STATS.totalSKUs)} صنف مسجل
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                تتبع التوفر الفوري لقطع الغيار، تكاليف الشراء، والأرصدة الدقيقة عبر المستودعات الثلاثة
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>تصدير النتائج ({formatNum(totalItems)})</span>
            </button>

            <a
              href="/evidence/official_warehouse_cost_sep2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold transition-all"
            >
              <span>التقرير الرسمي (PDF)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-75" />
            </a>
          </div>
        </div>

        {/* ── Summary Stats Pills ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-slate-300">إجمالي رأس مال البضاعة</div>
            <div className="text-base sm:text-lg font-black font-mono text-amber-300 mt-0.5">
              {formatSAR(REAL_INVENTORY_STATS.totalValuation)}
            </div>
            <div className="text-[10px] text-slate-400">دفتر جرد سبتمبر 2026</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-slate-300">الرصيد الكلي المتوفر</div>
            <div className="text-base sm:text-lg font-black font-mono text-emerald-300 mt-0.5">
              {formatNum(REAL_INVENTORY_STATS.totalBalance)} <span className="text-xs font-normal">قطعة</span>
            </div>
            <div className="text-[10px] text-slate-400">موزعة بـ 3 مستودعات</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-slate-300">المركز الرئيسي (100)</div>
            <div className="text-base sm:text-lg font-black font-mono text-sky-300 mt-0.5">
              {formatNum(REAL_INVENTORY_STATS.warehouses.main.qty)} <span className="text-xs font-normal">قطعة</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">{formatSAR(REAL_INVENTORY_STATS.warehouses.main.valuation)}</div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-slate-300">الرواف (200) والسليم (300)</div>
            <div className="text-base sm:text-lg font-black font-mono text-indigo-300 mt-0.5">
              {formatNum(REAL_INVENTORY_STATS.warehouses.rawaf.qty + REAL_INVENTORY_STATS.warehouses.sulaim.qty)} <span className="text-xs font-normal">قطعة</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">{formatSAR(REAL_INVENTORY_STATS.warehouses.rawaf.valuation + REAL_INVENTORY_STATS.warehouses.sulaim.valuation)}</div>
          </div>
        </div>
      </div>

      {/* ── Control Bar: Search + Filter Pills ── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Fast Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث برقم القطعة (SKU)، اسم القطعة بالعربي أو الإنجليزي، أو الفئة..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 pr-10 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                مسح ✕
              </button>
            )}
          </div>

          {/* Branch Dropdown Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 whitespace-nowrap">
              المستودع:
            </label>
            <select
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-cyan-500 focus:bg-white"
            >
              <option value="all">كافة المستودعات (الثلاثة)</option>
              <option value="100">مخزن المركز الرئيسي (100)</option>
              <option value="200">مخزن فرع الرواف (200)</option>
              <option value="300">مخزن السليم 2 / كيا (300)</option>
            </select>
          </div>

          {/* Brand Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 whitespace-nowrap">
              الماركة:
            </label>
            <select
              value={brandFilter}
              onChange={(e) => {
                setBrandFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-cyan-500 focus:bg-white"
            >
              <option value="all">كافة الماركات</option>
              <option value="hyundai">هيونداي (Hyundai)</option>
              <option value="kia">كيا (Kia)</option>
              <option value="mobis">موبيس (Mobis)</option>
              <option value="general">قطع عامة وزيوت</option>
            </select>
          </div>
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-3">
          <span className="text-xs font-bold text-slate-500 ml-2 whitespace-nowrap">
            تصنيف حركة الصنف:
          </span>

          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setPage(1);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            الكل ({formatNum(allItems.length)})
          </button>

          {Object.values(STATUS_META).map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => {
                setStatusFilter(s.key);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-1.5 ${
                statusFilter === s.key
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}

          <span className="text-xs text-slate-400 mr-auto font-mono">
            عرض {formatNum(totalItems)} صنف مطابق
          </span>
        </div>
      </div>

      {/* ── Main Inventory Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs font-black">
                <th className="py-3 px-3.5">كود القطعة (OEM SKU)</th>
                <th className="py-3 px-3.5">اسم الصنف والفئة</th>
                <th className="py-3 px-2.5 text-center">الماركة</th>
                <th className="py-3 px-2.5 text-center">الحالة الذكية</th>
                <th className="py-3 px-2.5 text-center bg-sky-50/50">الرئيسي (100)</th>
                <th className="py-3 px-2.5 text-center bg-indigo-50/50">الرواف (200)</th>
                <th className="py-3 px-2.5 text-center bg-emerald-50/50">السليم (300)</th>
                <th
                  className="py-3 px-3 text-center cursor-pointer hover:bg-slate-200/60 transition-colors"
                  onClick={() => handleSort('balance')}
                  title="ترتيب حسب الرصيد"
                >
                  <div className="inline-flex items-center gap-1">
                    <span>إجمالي الرصيد</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 text-left cursor-pointer hover:bg-slate-200/60 transition-colors"
                  onClick={() => handleSort('unitCost')}
                  title="ترتيب حسب سعر التكلفة"
                >
                  <div className="inline-flex items-center gap-1">
                    <span>سعر التكلفة</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 text-left cursor-pointer hover:bg-slate-200/60 transition-colors bg-amber-50/60"
                  onClick={() => handleSort('totalCost')}
                  title="ترتيب حسب القيمة الإجمالية للتكلفة"
                >
                  <div className="inline-flex items-center gap-1">
                    <span>القيمة الإجمالية</span>
                    <ArrowUpDown className="w-3 h-3 text-amber-600" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="text-3xl mb-2">🔍</div>
                    <div className="font-bold text-sm text-slate-600">لا توجد أصناف مطابقة لمعايير البحث</div>
                    <div className="text-xs text-slate-400 mt-1">جرّب تغيير كلمات البحث أو إعادة ضبط فلاتر المستودع والحالة</div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const statusMeta = STATUS_META[item.status] || STATUS_META.slow;
                  return (
                    <tr
                      key={item.sku}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* SKU with copy */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopySku(item.sku)}
                            className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg border border-slate-200 transition-all text-xs"
                            title="نسخ رقم الصنف"
                          >
                            <span>{item.sku}</span>
                            {copiedSku === item.sku ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Name & Category */}
                      <td className="py-3 px-3.5 max-w-[280px]">
                        <div className="font-bold text-slate-900 leading-snug truncate" title={item.name}>
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {item.category || 'قطع غيار عامة'}
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="py-3 px-2.5 text-center whitespace-nowrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {item.brand === 'hyundai'
                            ? 'هيونداي'
                            : item.brand === 'kia'
                            ? 'كيا'
                            : item.brand === 'mobis'
                            ? 'موبيس'
                            : 'عامة'}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-2.5 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusMeta.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                          <span>{statusMeta.label}</span>
                        </span>
                      </td>

                      {/* Main 100 */}
                      <td className="py-3 px-2.5 text-center font-mono font-bold bg-sky-50/30 text-sky-900">
                        {item.qtyMain > 0 ? formatNum(item.qtyMain) : <span className="text-slate-300 font-normal">0</span>}
                      </td>

                      {/* Rawaf 200 */}
                      <td className="py-3 px-2.5 text-center font-mono font-bold bg-indigo-50/30 text-indigo-900">
                        {item.qtyRawaf > 0 ? formatNum(item.qtyRawaf) : <span className="text-slate-300 font-normal">0</span>}
                      </td>

                      {/* Sulaim 300 */}
                      <td className="py-3 px-2.5 text-center font-mono font-bold bg-emerald-50/30 text-emerald-900">
                        {item.qtySulaim > 0 ? formatNum(item.qtySulaim) : <span className="text-slate-300 font-normal">0</span>}
                      </td>

                      {/* Total Balance */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`font-mono font-black text-xs px-2 py-0.5 rounded-lg ${
                          item.balance === 0
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-900'
                        }`}>
                          {formatNum(item.balance)} {item.unit || 'حبه'}
                        </span>
                      </td>

                      {/* Unit Cost */}
                      <td className="py-3 px-3 text-left font-mono text-slate-700 whitespace-nowrap">
                        {item.unitCost > 0 ? `${item.unitCost.toFixed(2)} ر.س` : <span className="text-slate-300">—</span>}
                      </td>

                      {/* Total Cost Valuation */}
                      <td className="py-3 px-3 text-left font-mono font-bold text-slate-900 bg-amber-50/30 whitespace-nowrap">
                        {item.totalCost > 0 ? `${item.totalCost.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س` : <span className="text-slate-300">0.00</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>عدد الصفوف في الصفحة:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-700 outline-none"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="mr-3 font-mono">
              عرض {(page - 1) * pageSize + 1} إلى {Math.min(page * pageSize, totalItems)} من أصل {formatNum(totalItems)} صنف
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(1)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 font-bold transition-all"
            >
              الأولى
            </button>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-all"
              title="الصفحة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded-lg">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-all"
              title="الصفحة التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 font-bold transition-all"
            >
              الأخيرة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
