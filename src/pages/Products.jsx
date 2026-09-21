import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Boxes,
  Flame,
  Clock,
  AlertTriangle,
  Package,
  Layers,
  FileSpreadsheet,
  Download,
  ExternalLink,
  ArrowRight,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Building2,
  TrendingUp,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  FileText,
  Printer
} from 'lucide-react';
import CustomPdfReportModal from '../components/shared/CustomPdfReportModal';
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

export default function Products() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine initial active window based on URL or default to 'hub'
  const getInitialWindow = () => {
    if (location.pathname === '/inventory/search') return 'search';
    if (location.pathname === '/inventory/reports') return 'reports_fast';
    return 'hub';
  };

  const [activeWindow, setActiveWindow] = useState(getInitialWindow);

  // PDF Generator Modal state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfReportType, setPdfReportType] = useState('all_inventory');

  const openPdfModal = (type = 'all_inventory') => {
    setPdfReportType(type);
    setIsPdfModalOpen(true);
  };

  // Quick search query on the Hub
  const [quickSearch, setQuickSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Detail window states
  const [windowSearch, setWindowSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all'); // 'all' | '100' | '200' | '300'
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [sortBy, setSortBy] = useState('totalCost');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [copiedSku, setCopiedSku] = useState(null);

  // All pre-enriched items
  const allItems = useMemo(() => {
    return getEnrichedInventory();
  }, []);

  // Sync window when route changes
  useEffect(() => {
    if (location.pathname === '/inventory/search') {
      setActiveWindow('search');
    } else if (location.pathname === '/inventory/reports') {
      setActiveWindow((prev) => (prev.startsWith('reports_') ? prev : 'reports_fast'));
    } else if (location.pathname === '/inventory' || location.pathname === '/products') {
      // Stay on current or go to hub
    }
  }, [location.pathname]);

  // Click outside listener for suggestions
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Top 6 Quick suggestions for search autocomplete
  const quickSuggestions = useMemo(() => {
    if (!quickSearch.trim() || quickSearch.trim().length < 2) return [];
    const q = quickSearch.trim().toLowerCase();
    return allItems
      .filter((p) => p.searchStr.includes(q))
      .slice(0, 6);
  }, [allItems, quickSearch]);

  // Handle SKU copy
  const handleCopySku = (sku) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 1800);
  };

  // Launch search window with given term
  const launchSearchWithQuery = (query = '') => {
    setWindowSearch(query);
    setQuickSearch('');
    setShowSuggestions(false);
    setPage(1);
    setActiveWindow('search');
  };

  // ── Datasets for Each Specialized Window ──

  // 1. Search Window Dataset
  const searchDataset = useMemo(() => {
    let list = allItems;
    if (windowSearch.trim()) {
      const q = windowSearch.trim().toLowerCase();
      list = list.filter((p) => p.searchStr.includes(q));
    }
    if (branchFilter === '100') list = list.filter((p) => p.qtyMain > 0);
    else if (branchFilter === '200') list = list.filter((p) => p.qtyRawaf > 0);
    else if (branchFilter === '300') list = list.filter((p) => p.qtySulaim > 0);

    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter);
    if (brandFilter !== 'all') list = list.filter((p) => p.brand === brandFilter);

    return [...list].sort((a, b) => {
      let valA = a[sortBy] ?? 0;
      let valB = b[sortBy] ?? 0;
      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [allItems, windowSearch, branchFilter, statusFilter, brandFilter, sortBy, sortOrder]);

  // 2. Fast Moving Dataset
  const fastMovingDataset = useMemo(() => {
    let list = getFastMovingReport(allItems, branchFilter);
    if (windowSearch.trim()) {
      const q = windowSearch.trim().toLowerCase();
      list = list.filter((p) => p.searchStr.includes(q));
    }
    return list;
  }, [allItems, branchFilter, windowSearch]);

  // 3. Dead Stock Dataset
  const deadStockDataset = useMemo(() => {
    let list = getDeadStockReport(allItems, branchFilter);
    if (windowSearch.trim()) {
      const q = windowSearch.trim().toLowerCase();
      list = list.filter((p) => p.searchStr.includes(q));
    }
    return list;
  }, [allItems, branchFilter, windowSearch]);

  const deadStockTotalFrozen = useMemo(() => {
    return deadStockDataset.reduce((acc, p) => acc + p.totalCost, 0);
  }, [deadStockDataset]);

  const deadStockTotalUnits = useMemo(() => {
    return deadStockDataset.reduce((acc, p) => acc + p.balance, 0);
  }, [deadStockDataset]);

  // 4. Out of Stock Dataset
  const outOfStockDataset = useMemo(() => {
    let list = getOutOfStockReport(allItems);
    if (windowSearch.trim()) {
      const q = windowSearch.trim().toLowerCase();
      list = list.filter((p) => p.searchStr.includes(q));
    }
    return list;
  }, [allItems, windowSearch]);

  // 5. Special Orders Dataset
  const specialOrdersDataset = useMemo(() => {
    let list = getSpecialOrdersReport(allItems);
    if (windowSearch.trim()) {
      const q = windowSearch.trim().toLowerCase();
      list = list.filter((p) => p.searchStr.includes(q));
    }
    return list;
  }, [allItems, windowSearch]);

  const specialOrdersTotalValuation = useMemo(() => {
    return specialOrdersDataset.reduce((acc, p) => acc + p.unitCost, 0);
  }, [specialOrdersDataset]);

  // 6. Categories Dataset
  const categoriesDataset = useMemo(() => {
    let list = getCategoryPerformanceReport(allItems);
    if (windowSearch.trim()) {
      const q = windowSearch.trim().toLowerCase();
      list = list.filter((c) => c.category.toLowerCase().includes(q));
    }
    return list;
  }, [allItems, windowSearch]);

  // Current active dataset depending on active window
  const activeDataset = useMemo(() => {
    switch (activeWindow) {
      case 'search':
        return searchDataset;
      case 'reports_fast':
        return fastMovingDataset;
      case 'reports_dead':
        return deadStockDataset;
      case 'reports_out':
        return outOfStockDataset;
      case 'reports_special':
        return specialOrdersDataset;
      case 'reports_categories':
        return categoriesDataset;
      default:
        return searchDataset;
    }
  }, [activeWindow, searchDataset, fastMovingDataset, deadStockDataset, outOfStockDataset, specialOrdersDataset, categoriesDataset]);

  // Pagination calculations
  const totalItems = activeDataset.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return activeDataset.slice(start, start + pageSize);
  }, [activeDataset, page, pageSize]);

  // Switch window with reset
  const openWindow = (windowId) => {
    setActiveWindow(windowId);
    setWindowSearch('');
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to Hub
  const backToHub = () => {
    setActiveWindow('hub');
    setWindowSearch('');
    setQuickSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sorting handler
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Export current window dataset
  const handleExportCurrent = () => {
    if (activeWindow === 'search') {
      const headers = [
        { label: 'رقم القطعة (SKU)', accessor: 'sku' },
        { label: 'اسم الصنف', accessor: 'name' },
        { label: 'الفئة', accessor: 'category' },
        { label: 'الماركة', accessor: (p) => p.brand === 'hyundai' ? 'هيونداي' : p.brand === 'kia' ? 'كيا' : p.brand === 'mobis' ? 'موبيس' : 'عامة' },
        { label: 'الحالة', accessor: (p) => STATUS_META[p.status]?.label || p.status },
        { label: 'سعر التكلفة (ر.س)', accessor: (p) => p.unitCost.toFixed(2) },
        { label: 'مخزن 100 الرئيسي', accessor: 'qtyMain' },
        { label: 'مخزن 200 الرواف', accessor: 'qtyRawaf' },
        { label: 'مخزن 300 السليم 2 / كيا', accessor: 'qtySulaim' },
        { label: 'إجمالي الرصيد', accessor: 'balance' },
        { label: 'إجمالي قيمة التكلفة (ر.س)', accessor: (p) => p.totalCost.toFixed(2) },
      ];
      exportToCsv('جرد_وبحث_قطع_الغيار_المعتمد', headers, searchDataset);
    } else if (activeWindow === 'reports_fast') {
      const headers = [
        { label: 'رقم القطعة (SKU)', accessor: 'sku' },
        { label: 'اسم الصنف', accessor: 'name' },
        { label: 'الفئة', accessor: 'category' },
        { label: 'المبيعات والمنصرف', accessor: 'issued' },
        { label: 'الرصيد المتوفر', accessor: 'balance' },
        { label: 'سعر التكلفة (ر.س)', accessor: (p) => p.unitCost.toFixed(2) },
        { label: 'إجمالي القيمة الحالية', accessor: (p) => p.totalCost.toFixed(2) },
      ];
      exportToCsv('تقرير_الأصناف_الأكثر_مبيعا_وسريعة_الدوران', headers, fastMovingDataset);
    } else if (activeWindow === 'reports_dead') {
      const headers = [
        { label: 'رقم القطعة (SKU)', accessor: 'sku' },
        { label: 'اسم الصنف', accessor: 'name' },
        { label: 'الفئة', accessor: 'category' },
        { label: 'الرصيد الراكد (قطعة)', accessor: 'balance' },
        { label: 'سعر التكلفة (ر.س)', accessor: (p) => p.unitCost.toFixed(2) },
        { label: 'السيولة المجمدة (ر.س)', accessor: (p) => p.totalCost.toFixed(2) },
        { label: 'الرئيسي 100', accessor: 'qtyMain' },
        { label: 'الرواف 200', accessor: 'qtyRawaf' },
        { label: 'السليم 300', accessor: 'qtySulaim' },
      ];
      exportToCsv('تقرير_المخزون_الراكد_والسيولة_المعطلة', headers, deadStockDataset);
    } else if (activeWindow === 'reports_out') {
      const headers = [
        { label: 'رقم القطعة (SKU)', accessor: 'sku' },
        { label: 'اسم الصنف', accessor: 'name' },
        { label: 'الفئة', accessor: 'category' },
        { label: 'المبيعات التاريخية (الطلب)', accessor: 'issued' },
        { label: 'الرصيد الحالي', accessor: () => 0 },
        { label: 'سعر التكلفة (ر.س)', accessor: (p) => p.unitCost.toFixed(2) },
      ];
      exportToCsv('تقرير_الأصناف_النافذة_عالية_الطلب', headers, outOfStockDataset);
    } else if (activeWindow === 'reports_special') {
      const headers = [
        { label: 'رقم القطعة (SKU)', accessor: 'sku' },
        { label: 'اسم الصنف', accessor: 'name' },
        { label: 'الفئة', accessor: 'category' },
        { label: 'سعر التكلفة للقطعة (ر.س)', accessor: (p) => p.unitCost.toFixed(2) },
      ];
      exportToCsv('تقرير_طلبيات_كوريا_الخاصة', headers, specialOrdersDataset);
    } else if (activeWindow === 'reports_categories') {
      const headers = [
        { label: 'الفئة', accessor: 'category' },
        { label: 'عدد الأصناف', accessor: 'totalSKUs' },
        { label: 'الرصيد الكلي (قطعة)', accessor: 'totalBalance' },
        { label: 'المبيعات (قطعة)', accessor: 'totalIssued' },
        { label: 'قيمة التكلفة (ر.س)', accessor: (c) => c.totalValuation.toFixed(2) },
        { label: 'معدل الدوران (%)', accessor: (c) => `${c.turnoverRate.toFixed(1)}%` },
        { label: 'الأصناف الراكدة', accessor: 'deadCount' },
        { label: 'السيولة المجمدة (ر.س)', accessor: (c) => c.deadValuation.toFixed(2) },
      ];
      exportToCsv('تقرير_تحليل_أداء_وتدوير_الفئات', headers, categoriesDataset);
    }
  };

  // ============================================================
  // RENDER: 1. MAIN HUB VIEW (الصفحة الرئيسية التفاعلية)
  // ============================================================
  if (activeWindow === 'hub') {
    return (
      <div className="space-y-6 pb-12" dir="rtl">
        {/* ── Main Hero & Brand Header ── */}
        <div className="relative overflow-hidden bg-gradient-to-l from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
          <div className="absolute top-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/10 shrink-0">
                📦
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    مركز ذكاء قطع الغيار والمخزون
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    مُطابق 100% محاسبياً
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  نظام الإدارة والتحليل الذكي لمخزون الفروع الثلاثة وتكاليف الشراء حتى 21/09/2026
                </p>
              </div>
            </div>

            {/* Direct PDF and Quick Export */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => openPdfModal('all_inventory')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-950" />
                <span>إنشاء تقرير PDF مخصص (تحديد النطاق)</span>
              </button>

              <a
                href="/evidence/official_warehouse_cost_sep2026.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all shadow-xs"
              >
                <span>التقرير الأصلي (277 صفحة PDF)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* ── Prominent Quick Search Bar (نظام البحث السريع) ── */}
          <div ref={searchContainerRef} className="relative z-20 max-w-3xl">
            <div className="relative">
              <input
                type="text"
                value={quickSearch}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setQuickSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && quickSearch.trim()) {
                    launchSearchWithQuery(quickSearch);
                  }
                }}
                placeholder="ابحث فوراً برقم القطعة (SKU)، اسم الصنف (عربي/إنجليزي)، أو الفئة..."
                className="w-full bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl py-4 pr-12 pl-36 text-sm font-semibold shadow-2xl border-2 border-transparent focus:border-cyan-400 outline-none transition-all"
              />
              <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />

              {/* Submit Search Button */}
              <button
                type="button"
                onClick={() => launchSearchWithQuery(quickSearch)}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <span>بحث بالفروع</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>

            {/* Quick Autocomplete Suggestions Dropdown */}
            {showSuggestions && quickSuggestions.length > 0 && (
              <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 text-slate-800">
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 flex justify-between items-center">
                  <span>أقرب النتائج المطابقة:</span>
                  <button
                    type="button"
                    onClick={() => launchSearchWithQuery(quickSearch)}
                    className="text-cyan-700 hover:underline font-black"
                  >
                    عرض كل النتائج في نافذة البحث ⬅
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {quickSuggestions.map((item) => (
                    <div
                      key={item.sku}
                      onClick={() => launchSearchWithQuery(item.sku)}
                      className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {item.sku}
                          </span>
                          <span className="font-bold text-slate-800 truncate">{item.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.category}</div>
                      </div>
                      <div className="text-left shrink-0">
                        <div className="font-mono font-bold text-emerald-700">{item.balance} قطعة</div>
                        <div className="font-mono text-[10px] text-slate-500">{item.unitCost.toFixed(2)} ر.س</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── 3 Warehouses Live Capital Ribbon ── */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] text-slate-300">إجمالي رأس المال (التكلفة)</div>
              <div className="text-lg sm:text-xl font-black font-mono text-amber-300 mt-0.5">
                {formatSAR(REAL_INVENTORY_STATS.totalValuation)}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {formatNum(REAL_INVENTORY_STATS.totalBalance)} قطعة متوفرة
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] text-sky-300 font-bold">المركز الرئيسي (100)</div>
              <div className="text-lg font-black font-mono text-white mt-0.5">
                {formatSAR(REAL_INVENTORY_STATS.warehouses.main.valuation)}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {formatNum(REAL_INVENTORY_STATS.warehouses.main.qty)} قطعة (35.7%)
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] text-indigo-300 font-bold">فرع الرواف (200)</div>
              <div className="text-lg font-black font-mono text-white mt-0.5">
                {formatSAR(REAL_INVENTORY_STATS.warehouses.rawaf.valuation)}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {formatNum(REAL_INVENTORY_STATS.warehouses.rawaf.qty)} قطعة (31.8%)
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
              <div className="text-[11px] text-emerald-300 font-bold">مخزن السليم 2 / كيا (300)</div>
              <div className="text-lg font-black font-mono text-white mt-0.5">
                {formatSAR(REAL_INVENTORY_STATS.warehouses.sulaim.valuation)}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {formatNum(REAL_INVENTORY_STATS.warehouses.sulaim.qty)} قطعة (32.4%)
              </div>
            </div>
          </div>
        </div>

        {/* ── The Windows & Modules Launcher Grid (نظام الأزرار والأقسام) ── */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-indigo-600" />
              <span>نوافذ وتقارير المخزون التخصصية (انقر للدخول للنافذة)</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">8 نوافذ وأدوات معتمدة</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* BUTTON 1: Search Window */}
            <button
              type="button"
              onClick={() => openWindow('search')}
              className="bg-white rounded-3xl p-5 border-2 border-slate-200 hover:border-cyan-500 text-right shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-xs">
                    🔍
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-100 text-cyan-800">
                    {formatNum(REAL_INVENTORY_STATS.totalSKUs)} صنف
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 group-hover:text-cyan-700 transition-colors">
                    جدول البحث الشامل وتوفر الفروع
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    فحص أرصدة القطع وتوفرها في المخازن الثلاثة (الرئيسي 100، الرواف 200، السليم 300) مع أسعار التكلفة والشارات الذكية.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-700">
                <span>فتح نافذة البحث والتوفر</span>
                <span className="group-hover:-translate-x-1 transition-transform">⬅</span>
              </div>
            </button>

            {/* BUTTON 2: Fast Moving Report */}
            <button
              type="button"
              onClick={() => openWindow('reports_fast')}
              className="bg-white rounded-3xl p-5 border-2 border-slate-200 hover:border-emerald-500 text-right shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-xs">
                    🚀
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800">
                    {formatNum(fastMovingDataset.length)} صنف نشط
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                    الأصناف الأكثر مبيعاً وسريعة الدوران
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    ترتيب الأصناف تنازلياً حسب إجمالي المبيعات، ومعدلات الدوران، وتغطية الرصيد المتوفر بالمستودعات.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                <span>فتح تقرير الأكثر مبيعاً</span>
                <span className="group-hover:-translate-x-1 transition-transform">⬅</span>
              </div>
            </button>

            {/* BUTTON 3: Dead Stock Report */}
            <button
              type="button"
              onClick={() => openWindow('reports_dead')}
              className="bg-white rounded-3xl p-5 border-2 border-slate-200 hover:border-rose-500 text-right shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-xs">
                    🛑
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-100 text-rose-800">
                    {formatNum(deadStockDataset.length)} صنف راكد
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 group-hover:text-rose-700 transition-colors">
                    المخزون الراكد والسيولة المجمدة
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    حصر دقيق للقطع ذات الرصيد المتوفر مع انعدام المبيعات، واحتساب إجمالي رأس المال المعطل لكل صنف وفرع.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-700">
                <span>فتح تقرير السيولة المجمدة</span>
                <span className="group-hover:-translate-x-1 transition-transform">⬅</span>
              </div>
            </button>

            {/* BUTTON 4: Out of Stock High Demand */}
            <button
              type="button"
              onClick={() => openWindow('reports_out')}
              className="bg-white rounded-3xl p-5 border-2 border-slate-200 hover:border-purple-500 text-right shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-xs">
                    ⚠️
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-800">
                    {formatNum(outOfStockDataset.length)} صنف نافد
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 group-hover:text-purple-700 transition-colors">
                    أصناف نافذة عالية الطلب (فرص ضائعة)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    أصناف رصيدها الحالي صفري (0) ولكن سجلت مبيعات تاريخية سابقة، مما يحدد فرص الشراء الفوري لتفادي ضياع المبيعات.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
                <span>فتح تقرير النواقص والفرص</span>
                <span className="group-hover:-translate-x-1 transition-transform">⬅</span>
              </div>
            </button>

            {/* BUTTON 5: Special Orders */}
            <button
              type="button"
              onClick={() => openWindow('reports_special')}
              className="bg-white rounded-3xl p-5 border-2 border-slate-200 hover:border-blue-500 text-right shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-xs">
                    📦
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-800">
                    {formatNum(specialOrdersDataset.length)} طلبية
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 group-hover:text-blue-700 transition-colors">
                    طلبيات كوريا الخاصة والحركة الفردية
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    رصد القطع المستوردة الخاصة التي دخلت وخرجت بحركة واحدة (1 وارد ⬅ 1 منصرف) لعملاء محددين.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
                <span>فتح تقرير الطلبيات الخاصة</span>
                <span className="group-hover:-translate-x-1 transition-transform">⬅</span>
              </div>
            </button>

            {/* BUTTON 6: Categories Performance */}
            <button
              type="button"
              onClick={() => openWindow('reports_categories')}
              className="bg-white rounded-3xl p-5 border-2 border-slate-200 hover:border-indigo-500 text-right shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-xs">
                    🗂️
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-100 text-indigo-800">
                    {categoriesDataset.length} فئات
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 group-hover:text-indigo-700 transition-colors">
                    تحليلات أداء وتدوير الفئات
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    مقارنة الفئات الأكثر نشاطاً في التدوير مقابل الفئات الراكدة، ونسبة المبيعات إلى رأس مال المخزون.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
                <span>فتح تحليل الفئات</span>
                <span className="group-hover:-translate-x-1 transition-transform">⬅</span>
              </div>
            </button>

            {/* BUTTON 7: Custom PDF Generator with Range Control */}
            <button
              type="button"
              onClick={() => openPdfModal('all_inventory')}
              className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5 border-2 border-indigo-700 hover:border-cyan-400 text-right shadow-md hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-all shadow-xs">
                    📑
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-cyan-400 text-slate-950">
                    PDF Generator
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-base text-white group-hover:text-cyan-300 transition-colors">
                    إنشاء تقرير PDF مخصص ومعتمد
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    نظام تحكم في عدد ونطاق القطع (مثلاً من صنف 1 إلى 35)، معاينة حية باللوجو والترويسة، وحفظ فوري بصيغة PDF.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-cyan-300">
                <span>تحديد النطاق والمعاينة</span>
                <span className="group-hover:-translate-x-1 transition-transform">⬅</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: 2. DEDICATED WINDOW / REPORT VIEW (النافذة الخاصة)
  // ============================================================
  const windowTitles = {
    search: { title: 'نافذة البحث الشامل وتوفر الفروع الثلاثة', icon: '🔍', color: 'cyan' },
    reports_fast: { title: 'تقرير الأصناف الأكثر مبيعاً وسريعة الدوران', icon: '🚀', color: 'emerald' },
    reports_dead: { title: 'تقرير المخزون الراكد والسيولة النقدية المجمدة', icon: '🛑', color: 'rose' },
    reports_out: { title: 'تقرير الأصناف النافذة عالية الطلب (الفرص المفقودة)', icon: '⚠️', color: 'purple' },
    reports_special: { title: 'تقرير طلبيات كوريا الخاصة (حركة فردية 1-in-1-out)', icon: '📦', color: 'blue' },
    reports_categories: { title: 'تقرير تحليلات أداء وتدوير الفئات والمجموعات', icon: '🗂️', color: 'indigo' },
  };

  const currentWindowMeta = windowTitles[activeWindow] || windowTitles.search;

  return (
    <div className="space-y-5 pb-10" dir="rtl">
      {/* ── Top Window Bar: Back Button + Window Header + Export ── */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Back to Hub Button */}
          <button
            type="button"
            onClick={backToHub}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
            title="العودة للصفحة الرئيسية للمخزون"
          >
            <span>⬅ العودة للرئيسية</span>
          </button>

          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentWindowMeta.icon}</span>
              <h1 className="text-base sm:text-lg font-black text-slate-900">
                {currentWindowMeta.title}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              إجمالي النتائج الحالية: <strong className="font-mono text-slate-800">{formatNum(totalItems)}</strong> سجل
            </p>
          </div>
        </div>

        {/* Window Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openPdfModal(activeWindow.startsWith('reports_') ? activeWindow.replace('reports_', '') : activeWindow)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-950 border border-cyan-300 text-xs font-black transition-all shadow-xs active:scale-95"
          >
            <Printer className="w-4 h-4 text-cyan-700" />
            <span>طباعة PDF محدد (من 1 إلى X)</span>
          </button>

          <button
            type="button"
            onClick={handleExportCurrent}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>تصدير إلى Excel / CSV</span>
          </button>

          <a
            href="/evidence/official_warehouse_cost_sep2026.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
          >
            <span>دفتر الجرد (PDF)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* ── KPI Banner for Dead Stock ── */}
      {activeWindow === 'reports_dead' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-bold text-rose-800">إجمالي السيولة النقدية المجمدة</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-rose-700 mt-1">
              {formatSAR(deadStockTotalFrozen)}
            </div>
            <div className="text-[11px] text-rose-600 mt-0.5">رأس مال معطل على الأرفف بدون مبيعات</div>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-bold text-rose-800">إجمالي القطع الراكدة</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-rose-700 mt-1">
              {formatNum(deadStockTotalUnits)} <span className="text-xs font-normal">قطعة</span>
            </div>
            <div className="text-[11px] text-rose-600 mt-0.5">موزعة عبر المستودعات الثلاثة</div>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-bold text-rose-800">عدد الأصناف الراكدة</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-rose-700 mt-1">
              {formatNum(deadStockDataset.length)} <span className="text-xs font-normal">صنفاً</span>
            </div>
            <div className="text-[11px] text-rose-600 mt-0.5">توصية: حزم تصفية وعروض ترويجية فورية</div>
          </div>
        </div>
      )}

      {/* ── Search & Filter Controls Bar ── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={windowSearch}
              onChange={(e) => {
                setWindowSearch(e.target.value);
                setPage(1);
              }}
              placeholder="ابحث برقم القطعة (SKU)، اسم القطعة، أو الفئة داخل هذه النافذة..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 pr-10 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-indigo-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            {windowSearch && (
              <button
                type="button"
                onClick={() => setWindowSearch('')}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                مسح ✕
              </button>
            )}
          </div>

          {/* Branch Selector (For windows with branches) */}
          {(activeWindow === 'search' || activeWindow === 'reports_fast' || activeWindow === 'reports_dead') && (
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
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
              >
                <option value="all">كافة المستودعات (الثلاثة)</option>
                <option value="100">مخزن المركز الرئيسي (100)</option>
                <option value="200">مخزن فرع الرواف (200)</option>
                <option value="300">مخزن السليم 2 / كيا (300)</option>
              </select>
            </div>
          )}

          {/* Status Filter (Search Window only) */}
          {activeWindow === 'search' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 whitespace-nowrap">
                الحالة:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
              >
                <option value="all">كافة الحالات</option>
                <option value="fast">سريع الدوران</option>
                <option value="slow">بطيء الدوران</option>
                <option value="dead">راكد / سيولة مجمدة</option>
                <option value="special">طلبية خاصة</option>
                <option value="out_of_stock">نافد</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {/* VIEW: Search Window */}
          {activeWindow === 'search' && (
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
                    className="py-3 px-3 text-center cursor-pointer hover:bg-slate-200/60"
                    onClick={() => handleSort('balance')}
                  >
                    <div className="inline-flex items-center gap-1">
                      <span>إجمالي الرصيد</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-left cursor-pointer hover:bg-slate-200/60"
                    onClick={() => handleSort('unitCost')}
                  >
                    <div className="inline-flex items-center gap-1">
                      <span>سعر التكلفة</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-left cursor-pointer hover:bg-slate-200/60 bg-amber-50/60"
                    onClick={() => handleSort('totalCost')}
                  >
                    <div className="inline-flex items-center gap-1">
                      <span>القيمة الإجمالية</span>
                      <ArrowUpDown className="w-3 h-3 text-amber-600" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedItems.map((item) => {
                  const statusMeta = STATUS_META[item.status] || STATUS_META.slow;
                  return (
                    <tr key={item.sku} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleCopySku(item.sku)}
                          className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg border border-slate-200 transition-all text-xs"
                        >
                          <span>{item.sku}</span>
                          {copiedSku === item.sku ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                        </button>
                      </td>
                      <td className="py-3 px-3.5 max-w-[280px]">
                        <div className="font-bold text-slate-900 truncate" title={item.name}>{item.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{item.category}</div>
                      </td>
                      <td className="py-3 px-2.5 text-center whitespace-nowrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {item.brand === 'hyundai' ? 'هيونداي' : item.brand === 'kia' ? 'كيا' : item.brand === 'mobis' ? 'موبيس' : 'عامة'}
                        </span>
                      </td>
                      <td className="py-3 px-2.5 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusMeta.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                          <span>{statusMeta.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-2.5 text-center font-mono font-bold bg-sky-50/30 text-sky-900">
                        {item.qtyMain > 0 ? formatNum(item.qtyMain) : <span className="text-slate-300 font-normal">0</span>}
                      </td>
                      <td className="py-3 px-2.5 text-center font-mono font-bold bg-indigo-50/30 text-indigo-900">
                        {item.qtyRawaf > 0 ? formatNum(item.qtyRawaf) : <span className="text-slate-300 font-normal">0</span>}
                      </td>
                      <td className="py-3 px-2.5 text-center font-mono font-bold bg-emerald-50/30 text-emerald-900">
                        {item.qtySulaim > 0 ? formatNum(item.qtySulaim) : <span className="text-slate-300 font-normal">0</span>}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`font-mono font-black text-xs px-2 py-0.5 rounded-lg ${
                          item.balance === 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-900'
                        }`}>
                          {formatNum(item.balance)} {item.unit || 'حبه'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-left font-mono text-slate-700 whitespace-nowrap">
                        {item.unitCost > 0 ? `${item.unitCost.toFixed(2)} ر.س` : '—'}
                      </td>
                      <td className="py-3 px-3 text-left font-mono font-bold text-slate-900 bg-amber-50/30 whitespace-nowrap">
                        {item.totalCost > 0 ? `${item.totalCost.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س` : '0.00'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* VIEW: Fast Moving Window */}
          {activeWindow === 'reports_fast' && (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs font-black">
                  <th className="py-3 px-3.5">الرتبة</th>
                  <th className="py-3 px-3.5">كود الصنف (OEM SKU)</th>
                  <th className="py-3 px-3.5">اسم الصنف والفئة</th>
                  <th className="py-3 px-3 text-center bg-emerald-50 text-emerald-900 font-black">المبيعات / المنصرف</th>
                  <th className="py-3 px-3 text-center">الرصيد المتبقي</th>
                  <th className="py-3 px-3 text-left">سعر التكلفة</th>
                  <th className="py-3 px-3 text-left">قيمة المخزون الحالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedItems.map((item, idx) => (
                  <tr key={item.sku} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-slate-400 font-bold">#{(page - 1) * pageSize + idx + 1}</td>
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

          {/* VIEW: Dead Stock Window */}
          {activeWindow === 'reports_dead' && (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs font-black">
                  <th className="py-3 px-3.5">الرتبة</th>
                  <th className="py-3 px-3.5">كود الصنف (OEM SKU)</th>
                  <th className="py-3 px-3.5">اسم الصنف والفئة</th>
                  <th className="py-3 px-3 text-center">الرصيد الراكد</th>
                  <th className="py-3 px-3 text-left">سعر التكلفة</th>
                  <th className="py-3 px-3 text-left bg-rose-50 text-rose-900 font-black">السيولة المجمدة (ر.س)</th>
                  <th className="py-3 px-3 text-center text-sky-800">الرئيسي 100</th>
                  <th className="py-3 px-3 text-center text-indigo-800">الرواف 200</th>
                  <th className="py-3 px-3 text-center text-emerald-800">السليم 300</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedItems.map((item, idx) => (
                  <tr key={item.sku} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-slate-400 font-bold">#{(page - 1) * pageSize + idx + 1}</td>
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
                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-700">
                      {formatNum(item.balance)} {item.unit || 'حبه'}
                    </td>
                    <td className="py-3 px-3 text-left font-mono text-slate-700">
                      {item.unitCost > 0 ? `${item.unitCost.toFixed(2)} ر.س` : '—'}
                    </td>
                    <td className="py-3 px-3 text-left font-mono font-black text-rose-700 bg-rose-50/40">
                      {formatSAR(item.totalCost)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-sky-900">{item.qtyMain || 0}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-indigo-900">{item.qtyRawaf || 0}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-900">{item.qtySulaim || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* VIEW: Out of Stock Window */}
          {activeWindow === 'reports_out' && (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs font-black">
                  <th className="py-3 px-3.5">الرتبة</th>
                  <th className="py-3 px-3.5">كود الصنف (OEM SKU)</th>
                  <th className="py-3 px-3.5">اسم الصنف والفئة</th>
                  <th className="py-3 px-3 text-center bg-purple-50 text-purple-900 font-black">الطلب السابق</th>
                  <th className="py-3 px-3 text-center text-rose-600 font-bold">الرصيد الحالي</th>
                  <th className="py-3 px-3 text-left">آخر سعر تكلفة</th>
                  <th className="py-3 px-3 text-center">التوصية التشغيلية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedItems.map((item, idx) => (
                  <tr key={item.sku} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-slate-400 font-bold">#{(page - 1) * pageSize + idx + 1}</td>
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
                    <td className="py-3 px-3 text-center font-mono font-black text-sm text-purple-700 bg-purple-50/40">
                      {formatNum(item.issued)} {item.unit || 'حبه'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">0 (نفد)</span>
                    </td>
                    <td className="py-3 px-3 text-left font-mono text-slate-700">
                      {item.unitCost > 0 ? `${item.unitCost.toFixed(2)} ر.س` : '—'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        إعادة طلب (مقترح: {Math.max(5, item.issued)})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* VIEW: Special Orders Window */}
          {activeWindow === 'reports_special' && (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs font-black">
                  <th className="py-3 px-3.5">الرقم</th>
                  <th className="py-3 px-3.5">كود الصنف (OEM SKU)</th>
                  <th className="py-3 px-3.5">اسم الصنف والفئة</th>
                  <th className="py-3 px-3 text-center">طبيعة الحركة</th>
                  <th className="py-3 px-3 text-left">تكلفة الاستيراد (ر.س)</th>
                  <th className="py-3 px-3 text-center">حالة الطلبية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedItems.map((item, idx) => (
                  <tr key={item.sku} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-slate-400 font-bold">#{(page - 1) * pageSize + idx + 1}</td>
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
                    <td className="py-3 px-3 text-center font-mono text-slate-600">
                      حركة فردية (1 وارد ⬅ 1 منصرف)
                    </td>
                    <td className="py-3 px-3 text-left font-mono font-bold text-blue-700">
                      {item.unitCost > 0 ? `${item.unitCost.toFixed(2)} ر.س` : '—'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        طلبية خاصة مسلّمة ✓
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* VIEW: Categories Window */}
          {activeWindow === 'reports_categories' && (
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
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">{formatNum(cat.totalSKUs)}</td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">{formatNum(cat.totalBalance)}</td>
                    <td className="py-3.5 px-3 text-center font-mono font-black text-emerald-700 bg-emerald-50/30">
                      {formatNum(cat.totalIssued)}
                    </td>
                    <td className="py-3.5 px-3 text-left font-mono font-bold text-slate-900">{formatSAR(cat.totalValuation)}</td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold">{cat.turnoverRate.toFixed(1)}%</td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-rose-700">{formatNum(cat.deadCount)}</td>
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
            <span>صفوف لكل صفحة:</span>
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
              عرض {(page - 1) * pageSize + 1} إلى {Math.min(page * pageSize, totalItems)} من أصل {formatNum(totalItems)}
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

      {/* ── Custom PDF Report Generator & Live Preview Modal ── */}
      <CustomPdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        initialReportType={pdfReportType}
        initialBranch={branchFilter}
        initialFrom={1}
        initialTo={35}
      />
    </div>
  );
}
