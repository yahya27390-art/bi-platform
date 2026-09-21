import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  TrendingUp,
  Clock,
  AlertTriangle,
  Package,
  Layers,
  Download,
  Search,
  Building2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Flame,
  Zap,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import {
  getEnrichedInventory,
  getFastMovingReport,
  getDeadStockReport,
  getOutOfStockReport,
  getSpecialOrdersReport,
  getCategoryPerformanceReport,
  STATUS_META,
  exportToCsv
} from '../lib/inventoryIntelligence';
import { REAL_INVENTORY_STATS } from '../data/realInventoryData';
import { formatSAR, formatNum } from '../lib/kpiEngine';

export default function InventoryReports() {
  const [activeTab, setActiveTab] = useState('fast_moving'); // 'fast_moving' | 'dead_stock' | 'out_of_stock' | 'special_orders' | 'categories'
  const [branchFilter, setBranchFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [copiedSku, setCopiedSku] = useState(null);

  // Load enriched data
  const allItems = useMemo(() => {
    return getEnrichedInventory();
  }, []);

  // Handle SKU copy
  const handleCopySku = (sku) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 1800);
  };

  // 1. Fast Moving Dataset
  const fastMovingData = useMemo(() => {
    let list = getFastMovingReport(allItems, branchFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.searchStr.includes(q));
    }
    return list;
  }, [allItems, branchFilter, search]);

  // 2. Dead Stock Dataset
  const deadStockData = useMemo(() => {
    let list = getDeadStockReport(allItems, branchFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.searchStr.includes(q));
    }
    return list;
  }, [allItems, branchFilter, search]);

  // Calculate total frozen capital
  const totalDeadStockValuation = useMemo(() => {
    return deadStockData.reduce((acc, p) => acc + p.totalCost, 0);
  }, [deadStockData]);

  const totalDeadStockUnits = useMemo(() => {
    return deadStockData.reduce((acc, p) => acc + p.balance, 0);
  }, [deadStockData]);

  // 3. Out of Stock Dataset
  const outOfStockData = useMemo(() => {
    let list = getOutOfStockReport(allItems);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.searchStr.includes(q));
    }
    return list;
  }, [allItems, search]);

  // 4. Special Orders Dataset
  const specialOrdersData = useMemo(() => {
    let list = getSpecialOrdersReport(allItems);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.searchStr.includes(q));
    }
    return list;
  }, [allItems, search]);

  const totalSpecialOrdersValuation = useMemo(() => {
    return specialOrdersData.reduce((acc, p) => acc + p.unitCost, 0);
  }, [specialOrdersData]);

  // 5. Category Performance Dataset
  const categoryPerformanceData = useMemo(() => {
    let list = getCategoryPerformanceReport(allItems);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => c.category.toLowerCase().includes(q));
    }
    return list;
  }, [allItems, search]);

  // Active dataset for current tab
  const currentDataset = useMemo(() => {
    switch (activeTab) {
      case 'fast_moving':
        return fastMovingData;
      case 'dead_stock':
        return deadStockData;
      case 'out_of_stock':
        return outOfStockData;
      case 'special_orders':
        return specialOrdersData;
      case 'categories':
        return categoryPerformanceData;
      default:
        return [];
    }
  }, [activeTab, fastMovingData, deadStockData, outOfStockData, specialOrdersData, categoryPerformanceData]);

  // Pagination
  const totalItems = currentDataset.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return currentDataset.slice(start, start + pageSize);
  }, [currentDataset, page, pageSize]);

  // Reset page when tab or filters change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearch('');
  };

  // Export handlers
  const handleExportCurrentReport = () => {
    if (activeTab === 'fast_moving') {
      const headers = [
        { label: 'رقم القطعة (SKU)', accessor: 'sku' },
        { label: 'اسم الصنف', accessor: 'name' },
        { label: 'الفئة', accessor: 'category' },
        { label: 'إجمالي المبيعات (قطعة)', accessor: 'issued' },
        { label: 'الرصيد المتبقي بالمستودع', accessor: 'balance' },
        { label: 'سعر التكلفة للقطعة (ر.س)', accessor: (p) => p.unitCost.toFixed(2) },
        { label: 'إجمالي قيمة المخزون الحالي', accessor: (p) => p.totalCost.toFixed(2) },
      ];
      exportToCsv('تقرير_الأصناف_الأكثر_مبيعا_وسريعة_الدوران', headers, fastMovingData);
    } else if (activeTab === 'dead_stock') {
      const headers = [
        { label: 'رقم القطعة (SKU)', accessor: 'sku' },
        { label: 'اسم الصنف', accessor: 'name' },
        { label: 'الفئة', accessor: 'category' },
        { label: 'الرصيد الراكد (قطعة)', accessor: 'balance' },
        { label: 'سعر التكلفة (ر.س)', accessor: (p) => p.unitCost.toFixed(2) },
        { label: 'إجمالي السيولة المجمدة (ر.س)', accessor: (p) => p.totalCost.toFixed(2) },
        { label: 'كمية المركز الرئيسي 100', accessor: 'qtyMain' },
        { label: 'كمية فرع الرواف 200', accessor: 'qtyRawaf' },
        { label: 'كمية فرع السليم/كيا 300', accessor: 'qtySulaim' },
      ];
      exportToCsv('تقرير_المخزون_الراكد_والسيولة_المعطلة', headers, deadStockData);
    } else if (activeTab === 'out_of_stock') {
      const headers = [
        { label: 'رقم القطعة (SKU)', accessor: 'sku' },
        { label: 'اسم الصنف', accessor: 'name' },
        { label: 'الفئة', accessor: 'category' },
        { label: 'المبيعات التاريخية (الطلب)', accessor: 'issued' },
        { label: 'الرصيد الحالي', accessor: () => 0 },
        { label: 'آخر سعر تكلفة موثق (ر.س)', accessor: (p) => p.unitCost.toFixed(2) },
      ];
      exportToCsv('تقرير_أصناف_نافذة_عالية_الطلب', headers, outOfStockData);
    } else if (activeTab === 'special_orders') {
      const headers = [
        { label: 'رقم القطعة (SKU)', accessor: 'sku' },
        { label: 'اسم الصنف', accessor: 'name' },
        { label: 'الفئة', accessor: 'category' },
        { label: 'حركة الاستيراد والطلب', accessor: () => 'حركة فردية 1 وارد - 1 منصرف' },
        { label: 'سعر التكلفة للقطعة (ر.س)', accessor: (p) => p.unitCost.toFixed(2) },
      ];
      exportToCsv('تقرير_طلبيات_كوريا_الخاصة', headers, specialOrdersData);
    } else if (activeTab === 'categories') {
      const headers = [
        { label: 'اسم الفئة التصنيفية', accessor: 'category' },
        { label: 'عدد الأصناف المسجلة', accessor: 'totalSKUs' },
        { label: 'الرصيد الكلي المتوفر (قطعة)', accessor: 'totalBalance' },
        { label: 'إجمالي المبيعات (قطعة)', accessor: 'totalIssued' },
        { label: 'إجمالي قيمة التكلفة (ر.س)', accessor: (c) => c.totalValuation.toFixed(2) },
        { label: 'معدل الدوران (%)', accessor: (c) => `${c.turnoverRate.toFixed(1)}%` },
        { label: 'عدد الأصناف الراكدة', accessor: 'deadCount' },
        { label: 'السيولة المجمدة بالفئة (ر.س)', accessor: (c) => c.deadValuation.toFixed(2) },
      ];
      exportToCsv('تقرير_تحليل_أداء_وتدوير_الفئات', headers, categoryPerformanceData);
    }
  };

  return (
    <div className="space-y-5 pb-10" dir="rtl">
      {/* ── Header ── */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-2xl text-indigo-400 shadow-inner">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">
                  تقارير المخزون التخصصية المعتمدة
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  مدقق محاسبياً 100%
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                5 تقارير استراتيجية لتحليل سرعة الدوران، كشف السيولة المجمدة، فرص الطلب الضائعة، وأداء الفئات
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCurrentReport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>تصدير التقرير الحالي إلى Excel / CSV</span>
            </button>

            <a
              href="/evidence/official_warehouse_cost_sep2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold transition-all"
            >
              <span>فتح التقرير الأصلي (277 صفحة PDF)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-75" />
            </a>
          </div>
        </div>

        {/* ── Tabbed Sub-navigation ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-5 scrollbar-none border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => handleTabChange('fast_moving')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
              activeTab === 'fast_moving'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>الأكثر مبيعاً وسريع الدوران ({formatNum(fastMovingData.length)})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('dead_stock')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
              activeTab === 'dead_stock'
                ? 'bg-rose-500 text-white border-rose-400 font-black shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>المخزون الراكد والسيولة المجمدة ({formatNum(deadStockData.length)})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('out_of_stock')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
              activeTab === 'out_of_stock'
                ? 'bg-purple-500 text-white border-purple-400 font-black shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>أصناف نافذة عالية الطلب ({formatNum(outOfStockData.length)})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('special_orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
              activeTab === 'special_orders'
                ? 'bg-blue-500 text-white border-blue-400 font-black shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>طلبيات كوريا الخاصة ({formatNum(specialOrdersData.length)})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
              activeTab === 'categories'
                ? 'bg-indigo-500 text-white border-indigo-400 font-black shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>تحليل أداء الفئات ({categoryPerformanceData.length})</span>
          </button>
        </div>
      </div>

      {/* ── Executive Report Cards Banner ── */}
      {activeTab === 'dead_stock' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-bold text-rose-800">إجمالي السيولة المجمدة بالراكد</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-rose-700 mt-1">
              {formatSAR(totalDeadStockValuation)}
            </div>
            <div className="text-[11px] text-rose-600 mt-0.5">رأس مال معطل على الأرفف بدون مبيعات</div>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-bold text-rose-800">إجمالي القطع الراكدة</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-rose-700 mt-1">
              {formatNum(totalDeadStockUnits)} <span className="text-xs font-normal">قطعة</span>
            </div>
            <div className="text-[11px] text-rose-600 mt-0.5">موزعة عبر المستودعات الثلاثة</div>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-bold text-rose-800">عدد الأصناف الراكدة</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-rose-700 mt-1">
              {formatNum(deadStockData.length)} <span className="text-xs font-normal">صنفاً</span>
            </div>
            <div className="text-[11px] text-rose-600 mt-0.5">توصية: حزم تصفية وعروض ترويجية فورية</div>
          </div>
        </div>
      )}

      {activeTab === 'fast_moving' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-bold text-emerald-800">إجمالي المبيعات المحققة</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-700 mt-1">
              {formatNum(REAL_INVENTORY_STATS.totalIssued)} <span className="text-xs font-normal">قطعة</span>
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5">منصرف بيعي فعلي من المستودعات</div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-bold text-emerald-800">عدد الأصناف النشطة بيعياً</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-700 mt-1">
              {formatNum(fastMovingData.length)} <span className="text-xs font-normal">صنفاً</span>
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5">تحقق معدل دوران أسبوعي وشهري مرتفع</div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-bold text-emerald-800">المخزون المتوفر لهذه الأصناف</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-700 mt-1">
              {formatNum(fastMovingData.reduce((acc, p) => acc + p.balance, 0))} <span className="text-xs font-normal">قطعة</span>
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5">رصيد جاهز لتلبية طلبات الزبائن</div>
          </div>
        </div>
      )}

      {activeTab === 'out_of_stock' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-bold text-purple-800">الأصناف النافذة برصيد صفري</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-purple-700 mt-1">
              {formatNum(outOfStockData.length)} <span className="text-xs font-normal">صنفاً</span>
            </div>
            <div className="text-[11px] text-purple-600 mt-0.5">سجلت مبيعات سابقة لكن رصيدها الحالي 0</div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-bold text-purple-800">إجمالي الطلب التاريخي المفقود</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-purple-700 mt-1">
              {formatNum(outOfStockData.reduce((acc, p) => acc + p.issued, 0))} <span className="text-xs font-normal">قطعة</span>
            </div>
            <div className="text-[11px] text-purple-600 mt-0.5">توصية: إعادة طلب فوري لدى الموردين لتفادي ضياع المبيعات</div>
          </div>
        </div>
      )}

      {activeTab === 'special_orders' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-bold text-blue-800">عدد الطلبيات الخاصة المنفذة</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-blue-700 mt-1">
              {formatNum(specialOrdersData.length)} <span className="text-xs font-normal">طلبية</span>
            </div>
            <div className="text-[11px] text-blue-600 mt-0.5">حركة استيراد فردية (1 وارد = 1 منصرف)</div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-bold text-blue-800">إجمالي قيمة تكلفة الطلبيات الخاصة</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-blue-700 mt-1">
              {formatSAR(totalSpecialOrdersValuation)}
            </div>
            <div className="text-[11px] text-blue-600 mt-0.5">طلبيات تم استيرادها مباشرة لعملاء محددين</div>
          </div>
        </div>
      )}

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="بحث داخل هذا التقرير..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 pr-9 text-xs text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

        {(activeTab === 'fast_moving' || activeTab === 'dead_stock') && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-600 whitespace-nowrap">
              فلترة المستودع:
            </label>
            <select
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
            >
              <option value="all">كافة المستودعات</option>
              <option value="100">مخزن المركز الرئيسي (100)</option>
              <option value="200">مخزن فرع الرواف (200)</option>
              <option value="300">مخزن السليم 2 / كيا (300)</option>
            </select>
          </div>
        )}

        <div className="text-xs text-slate-500 mr-auto font-mono">
          إجمالي النتائج: <strong>{formatNum(totalItems)}</strong> سجل
        </div>
      </div>

      {/* ── Report Data Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {/* TAB 1: Fast Moving Table */}
          {activeTab === 'fast_moving' && (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs font-black">
                  <th className="py-3 px-3.5">الرتبة</th>
                  <th className="py-3 px-3.5">كود الصنف (OEM SKU)</th>
                  <th className="py-3 px-3.5">اسم الصنف والفئة</th>
                  <th className="py-3 px-3 text-center">الماركة</th>
                  <th className="py-3 px-3 text-center bg-emerald-50/60 text-emerald-900 font-black">
                    المبيعات / المنصرف
                  </th>
                  <th className="py-3 px-3 text-center">الرصيد المتبقي</th>
                  <th className="py-3 px-3 text-left">سعر التكلفة</th>
                  <th className="py-3 px-3 text-left">قيمة المخزون المتبقي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedItems.map((item, idx) => (
                  <tr key={item.sku} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-slate-400 font-bold">
                      #{(page - 1) * pageSize + idx + 1}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleCopySku(item.sku)}
                        className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-200 text-xs"
                      >
                        <span>{item.sku}</span>
                        {copiedSku === item.sku ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      </button>
                    </td>
                    <td className="py-3 px-3.5 max-w-[260px]">
                      <div className="font-bold text-slate-900 truncate" title={item.name}>{item.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.category}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.brand === 'hyundai' ? 'هيونداي' : item.brand === 'kia' ? 'كيا' : item.brand === 'mobis' ? 'موبيس' : 'عامة'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-black text-sm text-emerald-700 bg-emerald-50/40">
                      {formatNum(item.issued)} {item.unit || 'حبه'}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                      {formatNum(item.balance)} {item.unit || 'حبه'}
                    </td>
                    <td className="py-3 px-3 text-left font-mono text-slate-700">
                      {item.unitCost > 0 ? `${item.unitCost.toFixed(2)} ر.س` : '—'}
                    </td>
                    <td className="py-3 px-3 text-left font-mono font-bold text-slate-900">
                      {formatSAR(item.totalCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB 2: Dead Stock Table */}
          {activeTab === 'dead_stock' && (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs font-black">
                  <th className="py-3 px-3.5">الرتبة</th>
                  <th className="py-3 px-3.5">كود الصنف (OEM SKU)</th>
                  <th className="py-3 px-3.5">اسم الصنف والفئة</th>
                  <th className="py-3 px-3 text-center">الرصيد الراكد</th>
                  <th className="py-3 px-3 text-left">سعر التكلفة</th>
                  <th className="py-3 px-3 text-left bg-rose-50 text-rose-900 font-black">
                    السيولة المجمدة (ر.س)
                  </th>
                  <th className="py-3 px-3 text-center text-sky-800">الرئيسي (100)</th>
                  <th className="py-3 px-3 text-center text-indigo-800">الرواف (200)</th>
                  <th className="py-3 px-3 text-center text-emerald-800">السليم (300)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedItems.map((item, idx) => (
                  <tr key={item.sku} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-slate-400 font-bold">
                      #{(page - 1) * pageSize + idx + 1}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleCopySku(item.sku)}
                        className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-200 text-xs"
                      >
                        <span>{item.sku}</span>
                        {copiedSku === item.sku ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      </button>
                    </td>
                    <td className="py-3 px-3.5 max-w-[260px]">
                      <div className="font-bold text-slate-900 truncate" title={item.name}>{item.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.category}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-700">
                      {formatNum(item.balance)} {item.unit || 'حبه'}
                    </td>
                    <td className="py-3 px-3 text-left font-mono text-slate-700">
                      {item.unitCost > 0 ? `${item.unitCost.toFixed(2)} ر.س` : '—'}
                    </td>
                    <td className="py-3 px-3 text-left font-mono font-black text-rose-700 bg-rose-50/40">
                      {formatSAR(item.totalCost)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-sky-900">
                      {item.qtyMain || 0}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-indigo-900">
                      {item.qtyRawaf || 0}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-900">
                      {item.qtySulaim || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB 3: Out of Stock Table */}
          {activeTab === 'out_of_stock' && (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs font-black">
                  <th className="py-3 px-3.5">الرتبة</th>
                  <th className="py-3 px-3.5">كود الصنف (OEM SKU)</th>
                  <th className="py-3 px-3.5">اسم الصنف والفئة</th>
                  <th className="py-3 px-3 text-center bg-purple-50 text-purple-900 font-black">
                    المبيعات السابقة (الطلب)
                  </th>
                  <th className="py-3 px-3 text-center text-rose-600 font-bold">الرصيد الحالي</th>
                  <th className="py-3 px-3 text-left">آخر سعر تكلفة</th>
                  <th className="py-3 px-3 text-center">التوصية التشغيلية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedItems.map((item, idx) => (
                  <tr key={item.sku} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-slate-400 font-bold">
                      #{(page - 1) * pageSize + idx + 1}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleCopySku(item.sku)}
                        className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-200 text-xs"
                      >
                        <span>{item.sku}</span>
                        {copiedSku === item.sku ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      </button>
                    </td>
                    <td className="py-3 px-3.5 max-w-[280px]">
                      <div className="font-bold text-slate-900 truncate" title={item.name}>{item.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.category}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-black text-purple-700 bg-purple-50/40">
                      {formatNum(item.issued)} {item.unit || 'حبه'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        0 (نفد تماماً)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-left font-mono text-slate-700">
                      {item.unitCost > 0 ? `${item.unitCost.toFixed(2)} ر.س` : '—'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        إعادة طلب عاجل (مقترح: {Math.max(5, item.issued)})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB 4: Special Orders Table */}
          {activeTab === 'special_orders' && (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs font-black">
                  <th className="py-3 px-3.5">الرقم</th>
                  <th className="py-3 px-3.5">كود الصنف (OEM SKU)</th>
                  <th className="py-3 px-3.5">اسم الصنف والفئة</th>
                  <th className="py-3 px-3 text-center">الماركة</th>
                  <th className="py-3 px-3 text-center">طبيعة الحركة</th>
                  <th className="py-3 px-3 text-left">تكلفة الاستيراد (ر.س)</th>
                  <th className="py-3 px-3 text-center">حالة الطلبية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedItems.map((item, idx) => (
                  <tr key={item.sku} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-slate-400 font-bold">
                      #{(page - 1) * pageSize + idx + 1}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleCopySku(item.sku)}
                        className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-200 text-xs"
                      >
                        <span>{item.sku}</span>
                        {copiedSku === item.sku ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      </button>
                    </td>
                    <td className="py-3 px-3.5 max-w-[280px]">
                      <div className="font-bold text-slate-900 truncate" title={item.name}>{item.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.category}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.brand === 'hyundai' ? 'هيونداي' : item.brand === 'kia' ? 'كيا' : item.brand === 'mobis' ? 'موبيس' : 'عامة'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-600">
                      حركة واحدة (1 وارد ⬅ 1 منصرف)
                    </td>
                    <td className="py-3 px-3 text-left font-mono font-bold text-blue-700">
                      {item.unitCost > 0 ? `${item.unitCost.toFixed(2)} ر.س` : '—'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        طلبية خاصة مسلّمة ✓
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* TAB 5: Categories Performance Table */}
          {activeTab === 'categories' && (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs font-black">
                  <th className="py-3 px-3.5">الفئة التصنيفية</th>
                  <th className="py-3 px-3 text-center">عدد الأصناف</th>
                  <th className="py-3 px-3 text-center">الرصيد الكلي (قطعة)</th>
                  <th className="py-3 px-3 text-center text-emerald-800">المبيعات (قطعة)</th>
                  <th className="py-3 px-3 text-left">قيمة المخزون (التكلفة)</th>
                  <th className="py-3 px-3 text-center">معدل الدوران</th>
                  <th className="py-3 px-3 text-center text-rose-700">الأصناف الراكدة</th>
                  <th className="py-3 px-3 text-left text-rose-700">السيولة المجمدة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedItems.map((cat) => (
                  <tr key={cat.category} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🗂️</span>
                        <span>{cat.category}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">
                      {formatNum(cat.totalSKUs)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">
                      {formatNum(cat.totalBalance)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-black text-emerald-700 bg-emerald-50/30">
                      {formatNum(cat.totalIssued)}
                    </td>
                    <td className="py-3.5 px-3 text-left font-mono font-bold text-slate-900">
                      {formatSAR(cat.totalValuation)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-mono font-bold text-xs">{cat.turnoverRate.toFixed(1)}%</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              cat.turnoverRate >= 50 ? 'bg-emerald-500' : cat.turnoverRate >= 25 ? 'bg-amber-500' : 'bg-slate-400'
                            }`}
                            style={{ width: `${Math.min(cat.turnoverRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-rose-700">
                      {formatNum(cat.deadCount)} <span className="text-[10px] text-slate-400">({cat.deadRate.toFixed(0)}%)</span>
                    </td>
                    <td className="py-3.5 px-3 text-left font-mono font-black text-rose-700 bg-rose-50/30">
                      {formatSAR(cat.deadValuation)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination Footer ── */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>عدد الصفوف:</span>
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
              عرض {(page - 1) * pageSize + 1} إلى {Math.min(page * pageSize, totalItems)} من أصل {formatNum(totalItems)} سجل
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
