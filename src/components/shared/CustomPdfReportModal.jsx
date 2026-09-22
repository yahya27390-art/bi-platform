import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Printer,
  FileText,
  Search,
  Eye,
  Settings2,
  Download,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Layers,
  Clock,
  Flame,
  AlertTriangle,
  Package,
  Boxes,
  ExternalLink,
  Calculator,
  Percent,
  Coins,
  SlidersHorizontal
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
} from '../../lib/inventoryIntelligence';
import { REAL_INVENTORY_STATS } from '../../data/realInventoryData';
import { formatSAR, formatNum } from '../../lib/kpiEngine';
import doraLogo from '../../assets/dora_logo.png';

export const REPORT_TYPES = [
  {
    id: 'all_inventory',
    label: 'تقرير جرد وتوفر الفروع وتكلفة المخزون (شامل)',
    shortLabel: 'جرد الفروع الشامل',
    icon: Boxes,
    color: 'sky',
    description: 'كافة الأصناف مع توفرها في المخازن الثلاثة (100 الرئيسي، 200 الرواف، 300 السليم 2) وأسعار التكلفة والقيمة الإجمالية.',
  },
  {
    id: 'dead_stock',
    label: 'تقرير المخزون الراكد والسيولة المجمدة (Dead Stock)',
    shortLabel: 'الراكد والسيولة المجمدة',
    icon: Clock,
    color: 'rose',
    description: 'حصر الأصناف ذات الرصيد المتوفر التي لم تسجل أي مبيعات، مع احتساب رأس المال المعطل بدقة لكل صنف وفرع.',
  },
  {
    id: 'fast_moving',
    label: 'تقرير الأصناف الأكثر مبيعاً وسريعة الدوران (Best Sellers)',
    shortLabel: 'الأكثر مبيعاً وسريع الدوران',
    icon: Flame,
    color: 'emerald',
    description: 'ترتيب الأصناف تنازلياً حسب أعلى كمية مبيعات ومنصرف فعلي ومعدل الدوران.',
  },
  {
    id: 'out_of_stock',
    label: 'تقرير الأصناف النافذة عالية الطلب (فرص الشراء الضائعة)',
    shortLabel: 'النافد عالي الطلب',
    icon: AlertTriangle,
    color: 'purple',
    description: 'أصناف رصيدها الحالي 0 ولها طلب ومبيعات سابقة لتجهيز أوامر الشراء الطارئة.',
  },
  {
    id: 'special_orders',
    label: 'تقرير طلبيات كوريا الخاصة والحركة الفردية (Special Orders)',
    shortLabel: 'طلبيات كوريا الخاصة',
    icon: Package,
    color: 'blue',
    description: 'القطع المستوردة استثنائياً لعملاء محددين بحركة فردية (1 وارد = 1 منصرف).',
  },
  {
    id: 'categories',
    label: 'تقرير تحليلات أداء وتدوير الفئات التسع (Category Analytics)',
    shortLabel: 'تحليل أداء الفئات',
    icon: Layers,
    color: 'indigo',
    description: 'مقارنة الفئات التسع حسب معدل الدوران، إجمالي رأس مال كل فئة، ونسبة الركود.',
  },
];

export const AVAILABLE_COLUMNS = [
  { id: 'index', label: 'رقم السطر (#)', category: 'basic', defaultChecked: true },
  { id: 'sku', label: 'كود القطعة (OEM SKU)', category: 'basic', defaultChecked: true },
  { id: 'name', label: 'اسم الصنف والتصنيف', category: 'basic', defaultChecked: true },
  { id: 'brand', label: 'الماركة (هيونداي/كيا)', category: 'basic', defaultChecked: true },
  { id: 'qtyMain', label: 'المركز الرئيسي (100)', category: 'branches', defaultChecked: true },
  { id: 'qtyRawaf', label: 'فرع الرواف (200)', category: 'branches', defaultChecked: true },
  { id: 'qtySulaim', label: 'فرع السليم 2 (300)', category: 'branches', defaultChecked: true },
  { id: 'balance', label: 'إجمالي الرصيد المتوفر', category: 'branches', defaultChecked: true },
  { id: 'unitCost', label: 'سعر التكلفة (ر.س)', category: 'cost', defaultChecked: true },
  { id: 'totalCost', label: 'إجمالي التكلفة (رأس المال)', category: 'cost', defaultChecked: true },
  { id: 'suggestedPrice', label: 'السعر المقترح للبيع', category: 'pricing', defaultChecked: true },
  { id: 'totalSuggested', label: 'إجمالي البيع المقترح', category: 'pricing', defaultChecked: true },
];

export const DEFAULT_COLUMNS = {
  index: true,
  sku: true,
  name: true,
  brand: true,
  qtyMain: true,
  qtyRawaf: true,
  qtySulaim: true,
  balance: true,
  unitCost: true,
  totalCost: true,
  suggestedPrice: true,
  totalSuggested: true,
};

/**
 * Calculate dynamic suggested retail price based on cost tiers, VAT, and rigid rounding.
 * Business Rules:
 * - Cost < 200 SAR: +45% margin
 * - Cost 200 - 499 SAR: +30% margin
 * - Cost 500 - 999 SAR: +28% margin
 * - Cost >= 1000 SAR: +20% margin
 * - VAT: +15% applied after margin
 * - Rounding: round to nearest rigid integer / multiple of 5 (e.g., 233 -> 235, 952 -> 950, 1022 -> 1020)
 */
export function calculateSuggestedPrice(unitCost, { includeVat = true, roundToNearestFive = true } = {}) {
  const cost = Number(unitCost) || 0;
  if (cost <= 0) return { price: 0, rawPrice: 0, marginPct: 0, vatAmount: 0, priceBeforeVat: 0 };

  let marginPct = 0.20;
  if (cost < 200) {
    marginPct = 0.45;
  } else if (cost < 500) {
    marginPct = 0.30;
  } else if (cost < 1000) {
    marginPct = 0.28;
  } else {
    marginPct = 0.20;
  }

  const priceBeforeVat = cost * (1 + marginPct);
  let finalPrice = priceBeforeVat;
  let vatAmount = 0;

  if (includeVat) {
    vatAmount = priceBeforeVat * 0.15;
    finalPrice = priceBeforeVat + vatAmount;
  }

  const rawPrice = finalPrice;

  // Round to nearest 5 (أقرب عدد جامد: 233 -> 235, 952 -> 950, 1022 -> 1020)
  let roundedPrice = finalPrice;
  if (roundToNearestFive) {
    roundedPrice = Math.max(5, Math.round(finalPrice / 5) * 5);
  } else {
    roundedPrice = Math.round(finalPrice * 100) / 100;
  }

  return {
    price: roundedPrice,
    rawPrice,
    marginPct: Math.round(marginPct * 100),
    vatAmount: Math.round(vatAmount * 100) / 100,
    priceBeforeVat: Math.round(priceBeforeVat * 100) / 100,
  };
}

export default function CustomPdfReportModal({
  isOpen,
  onClose,
  initialReportType = 'all_inventory',
  initialBranch = 'all',
  initialFrom = 1,
  initialTo = 35,
}) {
  // Mode: 'configure' or 'preview'
  const [mode, setMode] = useState('preview'); // default to preview or configure
  const [reportType, setReportType] = useState(initialReportType);
  const [branchFilter, setBranchFilter] = useState(initialBranch);
  const [fromIndex, setFromIndex] = useState(initialFrom);
  const [toIndex, setToIndex] = useState(initialTo);
  const [sortBy, setSortBy] = useState('totalCost'); // 'totalCost' | 'suggestedPrice' | 'balance' | 'issued' | 'unitCost'
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');

  // Pricing & Valuation options
  const [showCostPrices, setShowCostPrices] = useState(true);
  const [showSuggestedPrice, setShowSuggestedPrice] = useState(true);
  const [includeVat, setIncludeVat] = useState(true);
  const [roundToNearestFive, setRoundToNearestFive] = useState(true);

  // Columns Visibility State
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // Active columns count
  const activeColCount = useMemo(() => {
    return Object.values(visibleColumns).filter(Boolean).length;
  }, [visibleColumns]);

  const toggleColumn = (colId) => {
    setVisibleColumns((prev) => {
      const next = { ...prev, [colId]: !prev[colId] };
      // Sync cost & suggested price flags
      setShowCostPrices(Boolean(next.unitCost || next.totalCost));
      setShowSuggestedPrice(Boolean(next.suggestedPrice || next.totalSuggested));
      return next;
    });
  };

  const setAllColumns = (val) => {
    const next = {};
    AVAILABLE_COLUMNS.forEach((c) => (next[c.id] = val));
    if (val) {
      setShowCostPrices(true);
      setShowSuggestedPrice(true);
    } else {
      next.sku = true;
      next.name = true;
      setShowCostPrices(false);
      setShowSuggestedPrice(false);
    }
    setVisibleColumns(next);
  };

  const applyColumnPreset = (presetKey) => {
    if (presetKey === 'all') {
      setAllColumns(true);
    } else if (presetKey === 'branches_only') {
      setVisibleColumns({
        index: true,
        sku: true,
        name: true,
        brand: true,
        qtyMain: true,
        qtyRawaf: true,
        qtySulaim: true,
        balance: true,
        unitCost: false,
        totalCost: false,
        suggestedPrice: false,
        totalSuggested: false,
      });
      setShowCostPrices(false);
      setShowSuggestedPrice(false);
    } else if (presetKey === 'sales_catalog') {
      setVisibleColumns({
        index: true,
        sku: true,
        name: true,
        brand: true,
        qtyMain: false,
        qtyRawaf: false,
        qtySulaim: false,
        balance: true,
        unitCost: false,
        totalCost: false,
        suggestedPrice: true,
        totalSuggested: true,
      });
      setShowCostPrices(false);
      setShowSuggestedPrice(true);
    } else if (presetKey === 'financial_audit') {
      setVisibleColumns({
        index: true,
        sku: true,
        name: true,
        brand: true,
        qtyMain: false,
        qtyRawaf: false,
        qtySulaim: false,
        balance: true,
        unitCost: true,
        totalCost: true,
        suggestedPrice: true,
        totalSuggested: true,
      });
      setShowCostPrices(true);
      setShowSuggestedPrice(true);
    }
  };

  // Sync props when opened
  useEffect(() => {
    if (isOpen) {
      if (initialReportType) setReportType(initialReportType);
      if (initialBranch) setBranchFilter(initialBranch);
      if (initialFrom) setFromIndex(initialFrom);
      if (initialTo) setToIndex(initialTo);
      setMode('configure'); // start on configure so user can adjust from:to easily
    }
  }, [isOpen, initialReportType, initialBranch, initialFrom, initialTo]);

  // Isolate print on body
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // All enriched parts
  const allItems = useMemo(() => {
    return getEnrichedInventory();
  }, []);

  // Filter and sort items based on chosen report type & criteria
  const baseReportItems = useMemo(() => {
    let list = [];

    switch (reportType) {
      case 'all_inventory':
        list = allItems;
        if (branchFilter === '100') list = list.filter((p) => p.qtyMain > 0);
        else if (branchFilter === '200') list = list.filter((p) => p.qtyRawaf > 0);
        else if (branchFilter === '300') list = list.filter((p) => p.qtySulaim > 0);
        break;
      case 'dead_stock':
        list = getDeadStockReport(allItems, branchFilter);
        break;
      case 'fast_moving':
        list = getFastMovingReport(allItems, branchFilter);
        break;
      case 'out_of_stock':
        list = getOutOfStockReport(allItems, branchFilter);
        break;
      case 'special_orders':
        list = getSpecialOrdersReport(allItems);
        break;
      case 'categories':
        list = getCategoryPerformanceReport(allItems);
        break;
      default:
        list = allItems;
    }

    if (reportType !== 'categories') {
      if (filterBrand !== 'all') {
        list = list.filter((p) => p.brand === filterBrand);
      }
      if (filterSearch.trim()) {
        const q = filterSearch.trim().toLowerCase();
        list = list.filter((p) => p.searchStr.includes(q));
      }

      // Sort
      list = [...list].sort((a, b) => {
        if (sortBy === 'suggestedPrice') {
          const priceA = calculateSuggestedPrice(a.unitCost, { includeVat, roundToNearestFive }).price;
          const priceB = calculateSuggestedPrice(b.unitCost, { includeVat, roundToNearestFive }).price;
          return priceB - priceA;
        }
        let valA = a[sortBy] ?? 0;
        let valB = b[sortBy] ?? 0;
        return valB - valA;
      });
    }

    return list;
  }, [allItems, reportType, branchFilter, filterBrand, filterSearch, sortBy, includeVat, roundToNearestFive]);

  // Sliced items according to user range (e.g., from 1 to 35)
  const slicedReportItems = useMemo(() => {
    const start = Math.max(0, fromIndex - 1);
    const end = Math.min(baseReportItems.length, toIndex);
    return baseReportItems.slice(start, end);
  }, [baseReportItems, fromIndex, toIndex]);

  // Calculated totals of the sliced items
  const slicedTotals = useMemo(() => {
    if (reportType === 'categories') {
      return {
        totalUnits: slicedReportItems.reduce((acc, c) => acc + c.totalBalance, 0),
        totalValuation: slicedReportItems.reduce((acc, c) => acc + c.totalValuation, 0),
        totalSuggestedValuation: 0,
        totalIssued: slicedReportItems.reduce((acc, c) => acc + c.totalIssued, 0),
        qtyMain: 0,
        qtyRawaf: 0,
        qtySulaim: 0,
      };
    }

    let totalUnits = 0;
    let totalValuation = 0;
    let totalSuggestedValuation = 0;
    let totalIssued = 0;
    let qtyMain = 0;
    let qtyRawaf = 0;
    let qtySulaim = 0;

    slicedReportItems.forEach((p) => {
      const bal = p.balance || 0;
      totalUnits += bal;
      totalValuation += p.totalCost || 0;
      totalIssued += p.issued || 0;
      qtyMain += p.qtyMain || 0;
      qtyRawaf += p.qtyRawaf || 0;
      qtySulaim += p.qtySulaim || 0;

      if (showSuggestedPrice) {
        const { price } = calculateSuggestedPrice(p.unitCost, { includeVat, roundToNearestFive });
        totalSuggestedValuation += bal * price;
      }
    });

    return {
      totalUnits,
      totalValuation,
      totalSuggestedValuation,
      totalIssued,
      qtyMain,
      qtyRawaf,
      qtySulaim,
    };
  }, [slicedReportItems, reportType, showSuggestedPrice, includeVat, roundToNearestFive]);

  // Quick range helpers
  const applyQuickRange = (from, to) => {
    setFromIndex(from);
    setToIndex(to);
  };

  // Trigger print-to-pdf
  const handlePrint = () => {
    if (mode !== 'preview') {
      setMode('preview');
      setTimeout(() => {
        window.print();
      }, 150);
    } else {
      window.print();
    }
  };

  if (!isOpen) return null;

  const currentReportMeta = REPORT_TYPES.find((r) => r.id === reportType) || REPORT_TYPES[0];
  const ReportIcon = currentReportMeta.icon;

  return createPortal(
    <div
      id="executive-modal-container"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto print:static print:inset-auto print:z-auto print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:overflow-visible print:block print:w-full"
      dir="rtl"
    >
      <div
        id="executive-report-printable-area"
        className="relative w-full max-w-6xl max-h-[94vh] flex flex-col rounded-3xl border border-slate-700/60 bg-white text-slate-900 shadow-2xl overflow-hidden my-auto print:static print:w-full print:max-w-none print:max-h-none print:bg-white print:border-none print:shadow-none print:rounded-none print:m-0 print:p-0 print:overflow-visible print:block"
      >
        {/* ── Screen Header Bar (Hidden in Print) ── */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-xl text-cyan-300 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white">
                  منظومة تصدير تقارير PDF الرسمية مع نظام التحكم في القطع
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-mono">
                  Dora PDF Engine
                </span>
              </div>
              <p className="text-xs text-slate-300">
                حدد نوع التقرير ونطاق القطع (مثلاً من 1 إلى 35)، عاين النتائج فورياً، ثم احفظها بصيغة PDF رسمية.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {mode === 'preview' ? (
              <>
                <button
                  type="button"
                  onClick={() => setMode('configure')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>تعديل النطاق والخيارات</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>حفظ كـ PDF / طباعة التقرير</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setMode('preview')}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>معاينة التقرير فورياً ({slicedReportItems.length} صنف)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Modal Body Content ── */}
        <div id="executive-modal-scroll-body" className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* ══════════════════════════════════════════════════════
              VIEW 1: CONFIGURATION & RANGE CONTROLLER (التهيئة والتحكم)
             ══════════════════════════════════════════════════════ */}
          {mode === 'configure' && (
            <div className="space-y-6 no-print">
              {/* Step 1: Select Report Type */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">1</span>
                  <span>حدد نوع التقرير المطلوب:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {REPORT_TYPES.map((rt) => {
                    const Icon = rt.icon;
                    const isSelected = reportType === rt.id;
                    return (
                      <div
                        key={rt.id}
                        onClick={() => setReportType(rt.id)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'border-cyan-600 bg-cyan-50/50 shadow-md ring-2 ring-cyan-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1 text-right">
                          <div className={`font-black text-xs ${isSelected ? 'text-cyan-950' : 'text-slate-900'}`}>
                            {rt.label}
                          </div>
                          <div className="text-[10px] text-slate-500 line-clamp-2 mt-1">
                            {rt.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Range Selection (من رقم : إلى رقم) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">2</span>
                    <span>نظام التحكم في عدد ونطاق القطع (تحديد عدد الصفوف في الـ PDF):</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-800 bg-cyan-100/70 px-2.5 py-1 rounded-lg border border-cyan-200">
                    إجمالي الأصناف المطابقة: {formatNum(baseReportItems.length)} صنف
                  </span>
                </div>

                {/* Range Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      من صنف رقم (بداية النطاق):
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={baseReportItems.length}
                      value={fromIndex}
                      onChange={(e) => setFromIndex(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-2.5 font-mono font-black text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    />
                    <div className="text-[10px] text-slate-400">مثال: 1 (أول صنف في القائمة)</div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      إلى صنف رقم (نهاية النطاق):
                    </label>
                    <input
                      type="number"
                      min={fromIndex}
                      max={baseReportItems.length}
                      value={toIndex}
                      onChange={(e) => setToIndex(Math.min(baseReportItems.length, parseInt(e.target.value, 10) || 1))}
                      className="w-full bg-white border-2 border-slate-300 rounded-xl px-4 py-2.5 font-mono font-black text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    />
                    <div className="text-[10px] text-slate-400">مثال: 35 (لإخراج أول 35 قطعة فقط)</div>
                  </div>
                </div>

                {/* Quick Selection Preset Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-500">خيارات سريعة لنطاق القطع:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyQuickRange(1, 25)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition-all"
                    >
                      أول 25 قطعة (1 إلى 25)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickRange(1, 35)}
                      className="px-3 py-1.5 rounded-lg text-xs font-black bg-cyan-100 hover:bg-cyan-200 border border-cyan-300 text-cyan-900 transition-all shadow-xs"
                    >
                      أول 35 قطعة (1 إلى 35) ⭐
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickRange(1, 50)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition-all"
                    >
                      أول 50 قطعة (1 إلى 50)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickRange(1, 100)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition-all"
                    >
                      أول 100 قطعة (1 إلى 100)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickRange(1, 250)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition-all"
                    >
                      أول 250 قطعة (1 إلى 250)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickRange(1, baseReportItems.length)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all mr-auto"
                    >
                      كافة الأصناف المطابقة ({formatNum(baseReportItems.length)})
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3: Warehouse & Sorting Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white border border-slate-200">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">المستودع / الفرع:</label>
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-cyan-500"
                  >
                    <option value="all">كافة الفروع الثلاثة</option>
                    <option value="100">100 - المركز الرئيسي</option>
                    <option value="200">200 - فرع الرواف</option>
                    <option value="300">300 - السليم 2 / كيا</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">الماركة:</label>
                  <select
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-cyan-500"
                  >
                    <option value="all">كافة الماركات</option>
                    <option value="hyundai">هيونداي (Hyundai)</option>
                    <option value="kia">كيا (Kia)</option>
                    <option value="mobis">موبيس (Mobis)</option>
                    <option value="general">قطع عامة وزيوت</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ترتيب التقرير حسب:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-cyan-500"
                  >
                    <option value="totalCost">الأعلى قيمة تكلفة إجمالية</option>
                    <option value="suggestedPrice">الأعلى سعراً مقترحاً للبيع</option>
                    <option value="balance">الأعلى رصيداً متوفراً</option>
                    <option value="unitCost">الأعلى سعر تكلفة للقطعة</option>
                    <option value="issued">الأعلى مبيعاً وحركة</option>
                  </select>
                </div>
              </div>

              {/* Step 4: Pricing & Profit Margin Engine (خيارات التسعير وهوامش الربح والضريبة) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/40 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">4</span>
                    <span className="flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-cyan-700" />
                      <span>نظام خيارات التسعير، هوامش الربح، والضريبة:</span>
                    </span>
                  </label>
                  <span className="text-[11px] font-bold text-cyan-900 bg-cyan-100/80 px-2.5 py-1 rounded-lg border border-cyan-200 font-mono">
                    Saudi Retail Pricing Engine (15% VAT & Margin Tiers)
                  </span>
                </div>

                {/* Toggles Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Option 1: Show Purchase Cost Prices */}
                  <div
                    onClick={() => setShowCostPrices(!showCostPrices)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                      showCostPrices ? 'border-sky-500 bg-sky-50/60 shadow-xs' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={showCostPrices}
                      onChange={() => {}}
                      className="w-4 h-4 mt-0.5 rounded text-sky-600 focus:ring-sky-500 pointer-events-none"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                        <span>إظهار أسعار التكلفة والشراء (Cost Prices)</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${showCostPrices ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-500'}`}>
                          {showCostPrices ? 'معروض في التقرير ✓' : 'مخفي'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        عرض عمود سعر التكلفة الفعلي وإجمالي رأس المال. إلغاء التحديد يخفي أسعار الشراء لحماية السرية عند تسليم التقرير للمبيعات أو العملاء.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Show Suggested Selling Price */}
                  <div
                    onClick={() => setShowSuggestedPrice(!showSuggestedPrice)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                      showSuggestedPrice ? 'border-emerald-500 bg-emerald-50/60 shadow-xs' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={showSuggestedPrice}
                      onChange={() => {}}
                      className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 pointer-events-none"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                        <span>إظهار السعر المقترح للبيع (Suggested Price)</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${showSuggestedPrice ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                          {showSuggestedPrice ? 'مفعّل بنظام الشرائح ✓' : 'معطل'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        احتساب سعر البيع تلقائياً بإضافة هوامش ربح متدرجة حسب سعر الشراء (20% إلى 45%)، مع إمكانية إضافة الضريبة والتقريب.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub-options when Suggested Price is Enabled */}
                {showSuggestedPrice && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-3.5 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Sub-option A: Include 15% VAT */}
                      <label className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/60 flex items-start gap-2.5 cursor-pointer select-none transition-all">
                        <input
                          type="checkbox"
                          checked={includeVat}
                          onChange={(e) => setIncludeVat(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-black text-slate-900 flex items-center justify-between">
                            <span>شامل ضريبة القيمة المضافة 15% (VAT)</span>
                            <span className="text-[10px] font-mono text-emerald-700 font-bold">{includeVat ? '+15%' : 'بدون'}</span>
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                            تُحسب الضريبة 15% بعد احتساب هامش الربح وفق النظام الضريبي السعودي.
                          </p>
                        </div>
                      </label>

                      {/* Sub-option B: Round to rigid number (أقرب 5 ريالات) */}
                      <label className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/60 flex items-start gap-2.5 cursor-pointer select-none transition-all">
                        <input
                          type="checkbox"
                          checked={roundToNearestFive}
                          onChange={(e) => setRoundToNearestFive(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-black text-slate-900 flex items-center justify-between">
                            <span>التقريب لأقرب عدد جامد (5 ريالات)</span>
                            <span className="text-[10px] font-mono text-cyan-800 font-bold">{roundToNearestFive ? '233 ← 235' : 'بالكسور'}</span>
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                            تلقائياً: 233 ← 235 | 952 ← 950 | 1022 ← 1020 لتسهيل الكاش ونقاط البيع.
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Active Margin Tiers Breakdown Badges */}
                    <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="font-bold text-slate-600 flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5 text-slate-400" />
                        <span>شرائح هوامش الربح الذكية المعتمدة:</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold">
                        أقل من 200 ر.س: <strong className="font-mono font-black text-emerald-700">+45%</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 font-bold">
                        من 200 إلى 500 ر.س: <strong className="font-mono font-black text-teal-700">+30%</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-900 font-bold">
                        من 500 إلى 1,000 ر.س: <strong className="font-mono font-black text-cyan-700">+28%</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 font-bold">
                        فوق 1,000 ر.س: <strong className="font-mono font-black text-sky-700">+20%</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 5: Columns Customizer (تحديد وتخصيص أعمدة الجدول) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <label className="text-xs font-black text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">5</span>
                    <span className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-cyan-700" />
                      <span>تخصيص أعمدة التقرير (اختر كل عامود تريده في الـ PDF بعلامة صح):</span>
                    </span>
                  </label>
                  <span className="text-xs font-mono font-bold text-cyan-900 bg-cyan-100/80 px-2.5 py-1 rounded-lg border border-cyan-200">
                    الأعمدة المحددة: {activeColCount} من 12
                  </span>
                </div>

                {/* Quick Presets for Columns */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] font-bold text-slate-500">خيارات سريعة للأعمدة:</span>
                  <button
                    type="button"
                    onClick={() => applyColumnPreset('all')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold border border-slate-300 transition-all shadow-2xs"
                  >
                    تحديد الكل (12 عامود)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyColumnPreset('branches_only')}
                    className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 text-[11px] font-bold border border-sky-200 transition-all shadow-2xs"
                  >
                    جرد كمي ومستودعات (بدون أسعار)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyColumnPreset('sales_catalog')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold border border-emerald-200 transition-all shadow-2xs"
                  >
                    كتالوج أسعار المبيعات والعملاء (بدون تكلفة)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyColumnPreset('financial_audit')}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-200 transition-all shadow-2xs"
                  >
                    تقرير مالي ورقابي (تكلفة + بيع)
                  </button>
                </div>

                {/* Checkbox Grid with all 12 columns */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
                  {AVAILABLE_COLUMNS.map((col) => {
                    const isChecked = Boolean(visibleColumns[col.id]);
                    return (
                      <label
                        key={col.id}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2.5 select-none ${
                          isChecked
                            ? 'border-cyan-600 bg-cyan-50/50 shadow-2xs'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleColumn(col.id)}
                          className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1 text-right">
                          <div className={`font-bold text-xs truncate ${isChecked ? 'text-slate-900' : 'text-slate-500'}`}>
                            {col.label}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {col.category === 'basic' ? 'بيانات أساسية' : col.category === 'branches' ? 'أرصدة فروع' : col.category === 'cost' ? 'أسعار تكلفة' : 'تسعير وهوامش'}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Button: Go to Preview */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => setMode('preview')}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all shadow-md flex items-center gap-2 active:scale-95"
                >
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>معاينة التقرير والتأكد من القطع ({slicedReportItems.length} قطعة)</span>
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              VIEW 2: LIVE PRINT PREVIEW SHEET (المعاينة الحية النظيفة للـ PDF)
             ══════════════════════════════════════════════════════ */}
          {mode === 'preview' && (
            <div className="space-y-4">
              {/* Preview Banner info on screen */}
              <div className="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-950 flex flex-col md:flex-row md:items-center justify-between gap-2.5 no-print">
                <div className="flex flex-wrap items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-700 shrink-0" />
                  <span>
                    المعاينة جاهزة: استعراض الأصناف من رقم <strong>{fromIndex}</strong> إلى رقم <strong>{Math.min(toIndex, baseReportItems.length)}</strong> (<strong>{slicedReportItems.length}</strong> قطعة).
                  </span>
                  <span className="hidden sm:inline text-slate-300">|</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${showCostPrices ? 'bg-sky-100 text-sky-900' : 'bg-slate-200 text-slate-600'}`}>
                    {showCostPrices ? 'التكلفة: معروضة' : 'التكلفة: مخفية'}
                  </span>
                  {showSuggestedPrice && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900">
                      السعر المقترح: مفعّل ({includeVat ? 'شامل الضريبة 15%' : 'قبل الضريبة'}{roundToNearestFive ? ' · مقرب لأقرب 5 ر.س' : ''})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-cyan-300 text-cyan-950 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-700" />
                    <span>تخصيص الأعمدة ({activeColCount}/12)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('configure')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-cyan-300 text-cyan-950 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <Settings2 className="w-3.5 h-3.5 text-cyan-700" />
                    <span>خيارات التسعير والنطاق</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all shadow-xs flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة / حفظ PDF</span>
                  </button>
                </div>
              </div>

              {/* Quick inline Column Checkboxes in Preview Mode */}
              {showColumnDropdown && (
                <div className="p-3.5 bg-white rounded-2xl border-2 border-cyan-300 shadow-md space-y-2.5 no-print animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-1.5 border-b border-slate-200">
                    <span className="flex items-center gap-1.5 text-slate-900">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600" />
                      <span>تحكم فوري في أعمدة الجدول (ضع أو أزل علامة الصح لمعاينة النتيجة فورياً):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowColumnDropdown(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1"
                    >
                      <span>إخفاء</span>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_COLUMNS.map((col) => {
                      const isChecked = Boolean(visibleColumns[col.id]);
                      return (
                        <label
                          key={col.id}
                          className={`px-2.5 py-1 rounded-lg border text-xs cursor-pointer flex items-center gap-1.5 transition-all select-none ${
                            isChecked
                              ? 'bg-cyan-50 border-cyan-400 text-cyan-950 font-bold shadow-2xs'
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleColumn(col.id)}
                            className="w-3.5 h-3.5 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                          />
                          <span>{col.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Official A4 Document Presentation Sheet ── */}
              <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5 print:border-none print:shadow-none print:rounded-none print:p-0 print:space-y-3">
                
                {/* Official Letterhead (Header with Logo) */}
                <div className="border-b-2 border-slate-900 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img src={doraLogo} alt="درة السيارة" className="h-14 w-auto object-contain print:h-12" />
                      <div>
                        <h1 className="text-lg sm:text-xl font-black text-slate-950">
                          شركة درة السيارة لقطع غيار السيارات
                        </h1>
                        <p className="text-[11px] text-slate-600 font-bold">
                          المملكة العربية السعودية · القصيم - بريدة · هاتف: 0541697999 | 0530051360
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          سجل تجاري: 7016475555 · الرقم الضريبي: 311861381500003
                        </p>
                      </div>
                    </div>

                    <div className="text-left text-xs font-mono space-y-0.5">
                      <div className="font-black text-slate-950">وثيقة تدقيق معتمدة DORA-AUDIT-2026</div>
                      <div className="text-slate-600 font-bold">تاريخ الاعتماد: 21 سبتمبر 2026</div>
                      <div className="text-emerald-800 font-bold">مطابق لتقرير جرد المستودعات (277 صفحة)</div>
                      <div className="text-[10px] text-slate-500 font-bold">طباعة: فهد (مدير النظام)</div>
                    </div>
                  </div>

                  {/* Report Title Bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-base font-black text-slate-950 flex items-center gap-2">
                        <span>{currentReportMeta.label}</span>
                      </h2>
                      <div className="text-xs text-slate-600 mt-0.5">
                        نطاق التقرير: من الصنف رقم <strong className="font-mono">{fromIndex}</strong> إلى الصنف رقم <strong className="font-mono">{Math.min(toIndex, baseReportItems.length)}</strong> ({slicedReportItems.length} صنف معتمد)
                        {branchFilter !== 'all' && ` · المستودع: ${branchFilter === '100' ? 'المركز الرئيسي 100' : branchFilter === '200' ? 'فرع الرواف 200' : 'السليم 2 / كيا 300'}`}
                        <span className="text-slate-500 mr-1.5 font-bold">
                          · ({activeColCount} أعمدة مفعلة)
                          {visibleColumns.suggestedPrice && ` · السعر المقترح (${includeVat ? 'شامل 15% ضريبة' : 'قبل الضريبة'}${roundToNearestFive ? ' - مقرب لأقرب 5 ر.س' : ''})`}
                        </span>
                      </div>
                    </div>

                    <div className="text-left font-mono text-xs bg-slate-50 print:bg-transparent p-2.5 rounded-xl border border-slate-200 print:border-slate-300 space-y-0.5">
                      <div>عدد الأصناف المشمولة: <strong className="font-bold text-slate-900">{slicedReportItems.length}</strong> صنف</div>
                      {visibleColumns.balance && (
                        <div>إجمالي الرصيد المتوفر: <strong className="font-bold text-slate-900">{formatNum(slicedTotals.totalUnits)}</strong> قطعة</div>
                      )}
                      {visibleColumns.totalCost && (
                        <div>إجمالي التكلفة (رأس المال): <strong className="font-black text-slate-900">{formatSAR(slicedTotals.totalValuation)}</strong></div>
                      )}
                      {visibleColumns.totalSuggested && (
                        <div>
                          إجمالي البيع المقترح: <strong className="font-black text-emerald-800">{formatSAR(slicedTotals.totalSuggestedValuation)}</strong>
                          <span className="text-[9px] text-slate-500 mr-1 font-sans font-normal">
                            ({includeVat ? 'شامل الضريبة 15%' : 'قبل الضريبة'}{roundToNearestFive ? ' · مقرب 5 ر.س' : ''})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sliced Items Table */}
                <div className="overflow-x-auto">
                  <table className="print-table w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 text-[11px] font-black">
                        {visibleColumns.index && <th className="py-2.5 px-2 text-center w-10">#</th>}
                        {visibleColumns.sku && <th className="py-2.5 px-3">كود القطعة (OEM SKU)</th>}
                        {visibleColumns.name && <th className="py-2.5 px-3">اسم الصنف والتصنيف</th>}
                        {visibleColumns.brand && <th className="py-2.5 px-2 text-center">الماركة</th>}
                        {visibleColumns.qtyMain && <th className="py-2.5 px-2 text-center bg-sky-50">الرئيسي 100</th>}
                        {visibleColumns.qtyRawaf && <th className="py-2.5 px-2 text-center bg-indigo-50">الرواف 200</th>}
                        {visibleColumns.qtySulaim && <th className="py-2.5 px-2 text-center bg-emerald-50">السليم 300</th>}
                        {visibleColumns.balance && <th className="py-2.5 px-2 text-center font-black">إجمالي الرصيد</th>}
                        {visibleColumns.unitCost && <th className="py-2.5 px-2.5 text-left">التكلفة (ر.س)</th>}
                        {visibleColumns.totalCost && <th className="py-2.5 px-3 text-left font-black bg-amber-50">إجمالي التكلفة</th>}
                        {visibleColumns.suggestedPrice && (
                          <th className="py-2.5 px-2.5 text-left bg-emerald-50 text-emerald-950 font-black">
                            السعر المقترح {includeVat ? '(شامل 15% ضريبة)' : '(قبل الضريبة)'}
                          </th>
                        )}
                        {visibleColumns.totalSuggested && (
                          <th className="py-2.5 px-3 text-left font-black bg-emerald-100/70 text-emerald-950">
                            إجمالي البيع المقترح
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {slicedReportItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={Math.max(1, activeColCount)}
                            className="py-8 text-center text-slate-400"
                          >
                            لا توجد أصناف في هذا النطاق المحدد
                          </td>
                        </tr>
                      ) : (
                        slicedReportItems.map((item, idx) => {
                          const itemNumber = fromIndex + idx;
                          const sugg = calculateSuggestedPrice(item.unitCost, { includeVat, roundToNearestFive });
                          const suggTotal = (item.balance || 0) * sugg.price;

                          return (
                            <tr key={item.sku} className="hover:bg-slate-50 transition-colors">
                              {visibleColumns.index && (
                                <td className="py-2 px-2 text-center font-mono font-bold text-slate-500">
                                  {itemNumber}
                                </td>
                              )}
                              {visibleColumns.sku && (
                                <td className="py-2 px-3 whitespace-nowrap font-mono font-black text-slate-900">
                                  {item.sku}
                                </td>
                              )}
                              {visibleColumns.name && (
                                <td className="py-2 px-3">
                                  <div className="font-bold text-slate-950 text-xs">{item.name}</div>
                                  <div className="text-[10px] text-slate-500">{item.category}</div>
                                </td>
                              )}
                              {visibleColumns.brand && (
                                <td className="py-2 px-2 text-center whitespace-nowrap text-[11px] font-bold">
                                  {item.brand === 'hyundai' ? 'هيونداي' : item.brand === 'kia' ? 'كيا' : item.brand === 'mobis' ? 'موبيس' : 'عامة'}
                                </td>
                              )}
                              {visibleColumns.qtyMain && (
                                <td className="py-2 px-2 text-center font-mono font-bold bg-sky-50/40 text-sky-900">
                                  {item.qtyMain || 0}
                                </td>
                              )}
                              {visibleColumns.qtyRawaf && (
                                <td className="py-2 px-2 text-center font-mono font-bold bg-indigo-50/40 text-indigo-900">
                                  {item.qtyRawaf || 0}
                                </td>
                              )}
                              {visibleColumns.qtySulaim && (
                                <td className="py-2 px-2 text-center font-mono font-bold bg-emerald-50/40 text-emerald-900">
                                  {item.qtySulaim || 0}
                                </td>
                              )}
                              {visibleColumns.balance && (
                                <td className="py-2 px-2 text-center font-mono font-black bg-slate-100">
                                  {formatNum(item.balance)} {item.unit || 'حبه'}
                                </td>
                              )}
                              {visibleColumns.unitCost && (
                                <td className="py-2 px-2.5 text-left font-mono text-slate-700">
                                  {item.unitCost > 0 ? item.unitCost.toFixed(2) : '—'}
                                </td>
                              )}
                              {visibleColumns.totalCost && (
                                <td className="py-2 px-3 text-left font-mono font-black text-slate-950 bg-amber-50/50">
                                  {item.totalCost > 0 ? item.totalCost.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                </td>
                              )}
                              {visibleColumns.suggestedPrice && (
                                <td className="py-2 px-2.5 text-left font-mono font-black text-emerald-900 bg-emerald-50/30">
                                  {sugg.price > 0 ? (
                                    <div className="flex flex-col items-start">
                                      <span className="font-mono font-black text-xs text-emerald-950">{formatSAR(sugg.price)}</span>
                                      <span className="text-[9px] text-emerald-700 font-sans font-bold">
                                        +{sugg.marginPct}% {includeVat ? '+ضريبة' : ''}
                                      </span>
                                    </div>
                                  ) : (
                                    '—'
                                  )}
                                </td>
                              )}
                              {visibleColumns.totalSuggested && (
                                <td className="py-2 px-3 text-left font-mono font-black text-emerald-950 bg-emerald-100/40">
                                  {suggTotal > 0 ? formatSAR(suggTotal) : '0.00'}
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-200/80 font-black text-slate-900 border-t-2 border-slate-400 text-xs">
                        {(() => {
                          const leadingSpan = [visibleColumns.index, visibleColumns.sku, visibleColumns.name, visibleColumns.brand].filter(Boolean).length;
                          return leadingSpan > 0 ? (
                            <td colSpan={leadingSpan} className="py-2.5 px-3 text-right">
                              إجمالي النطاق المحدد (من #{fromIndex} إلى #{Math.min(toIndex, baseReportItems.length)}):
                            </td>
                          ) : null;
                        })()}
                        {visibleColumns.qtyMain && <td className="py-2.5 px-2 text-center font-mono text-sky-950">{formatNum(slicedTotals.qtyMain)}</td>}
                        {visibleColumns.qtyRawaf && <td className="py-2.5 px-2 text-center font-mono text-indigo-950">{formatNum(slicedTotals.qtyRawaf)}</td>}
                        {visibleColumns.qtySulaim && <td className="py-2.5 px-2 text-center font-mono text-emerald-950">{formatNum(slicedTotals.qtySulaim)}</td>}
                        {visibleColumns.balance && <td className="py-2.5 px-2 text-center font-mono font-black">{formatNum(slicedTotals.totalUnits)}</td>}
                        {visibleColumns.unitCost && <td className="py-2.5 px-2.5 text-left font-mono">—</td>}
                        {visibleColumns.totalCost && (
                          <td className="py-2.5 px-3 text-left font-mono text-amber-900 font-black">
                            {formatSAR(slicedTotals.totalValuation)}
                          </td>
                        )}
                        {visibleColumns.suggestedPrice && <td className="py-2.5 px-2.5 text-left font-mono">—</td>}
                        {visibleColumns.totalSuggested && (
                          <td className="py-2.5 px-3 text-left font-mono text-emerald-900 font-black">
                            {formatSAR(slicedTotals.totalSuggestedValuation)}
                          </td>
                        )}
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Official Signatures and Stamp Footer (Visible in Print / PDF) */}
                <div className="pt-6 border-t-2 border-slate-400 mt-6 grid grid-cols-3 gap-6 text-center text-xs print-avoid-break">
                  <div className="space-y-6">
                    <div className="font-bold text-slate-800">أمين ومسؤول المستودعات</div>
                    <div className="text-[11px] text-slate-400 border-b border-dashed border-slate-400 pb-1 w-32 mx-auto">
                      التوقيع: .....................
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="font-bold text-slate-800">إدارة الحسابات والمطابقة</div>
                    <div className="text-[11px] text-slate-400 border-b border-dashed border-slate-400 pb-1 w-32 mx-auto">
                      التوقيع: .....................
                    </div>
                  </div>

                  <div className="space-y-2 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-2 border-slate-400 border-dashed flex items-center justify-center text-[10px] text-slate-400 font-bold">
                      ختم الشركة الرسمي
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">DORA CARS CO. AUDIT</div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* ── Modal Footer Controls (Screen Only) ── */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-bold">حالة التقرير:</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
              جاهز للطباعة والتصدير ✓
            </span>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'preview' ? (
              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>حفظ كـ PDF / طباعة فورية</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode('preview')}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <Eye className="w-4 h-4" />
                <span>معاينة التقرير</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-200 transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
