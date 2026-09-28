import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  Search,
  Upload,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowUpDown,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Building2,
  Boxes,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  ExternalLink,
  ShieldCheck,
  SlidersHorizontal,
  Info,
  X,
  FileText,
  BadgePercent,
  PlusCircle,
  PackageCheck,
  PackageX,
  Trash2,
  ClipboardList
} from 'lucide-react';
import {
  getHusounQuotationAnalysis,
  getBadrAlWadiQuotationAnalysis,
  getMiskQuotationAnalysis,
  parseUploadedQuotationFile,
  exportComparisonToExcel,
  normalizePartNumber
} from '../lib/supplierPriceComparator';
import { formatSAR, formatNum } from '../lib/kpiEngine';

const STORAGE_KEY = 'dora_saved_quotations_v1';

function getStoredCustomQuotations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading saved quotations from localStorage:', e);
    return [];
  }
}

function saveCustomQuotationsToStorage(quotations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotations));
  } catch (e) {
    console.warn('Storage quota issue, trimming to 5 newest quotations:', e);
    try {
      const trimmed = quotations.slice(0, 5);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e2) {
      console.error('Failed to save quotations to localStorage:', e2);
    }
  }
}

export default function SupplierPriceComparison() {
  // Persistent list of custom uploaded quotations
  const [savedCustomQuotations, setSavedCustomQuotations] = useState(() => getStoredCustomQuotations());
  // Active Preset: 'badr' | 'husoun' | or custom ID
  const [activePreset, setActivePreset] = useState('badr');
  const [quotationResult, setQuotationResult] = useState(() => getBadrAlWadiQuotationAnalysis());
  const [isQuotationDropdownOpen, setIsQuotationDropdownOpen] = useState(false);
  const quotationDropdownRef = useRef(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerdict, setFilterVerdict] = useState('all'); // 'all' | 'cheaper' | 'expensive' | 'equal' | 'not_in_catalog' | 'in_stock'
  const [filterGrade, setFilterGrade] = useState('all'); // 'all' | 'korean' | 'oem'
  const [sortBy, setSortBy] = useState('savingsAmount'); // 'savingsAmount' | 'diffPercent' | 'extraAmount' | 'supplierPrice' | 'ourCost' | 'stock'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Upload & UI States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [copiedSku, setCopiedSku] = useState(null);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const fileInputRef = useRef(null);

  const { items, stats, quotationInfo } = quotationResult;

  // Available Quotations Registry with Exact Dates
  const availableQuotations = useMemo(() => {
    const builtInList = [
      {
        id: 'misk',
        supplierName: 'شركة مسك للتجارة',
        title: 'أرقام الديزل — عرض سعر 28.09.2026 — شركة مسك',
        shortName: 'شركة مسك (أرقام الديزل)',
        date: '2026-09-28',
        dateFormatted: '28 سبتمبر 2026',
        itemsCount: 154,
        badge: 'ديزل (P/N & قبل الضريبة)',
        icon: '⚙️',
        isBuiltIn: true
      },
      {
        id: 'badr',
        supplierName: 'شركة بدر الوادي للتجارة',
        title: 'عرض فحمات مخفض (961) — شركة بدر الوادي',
        shortName: 'بدر الوادي (فحمات 961)',
        date: '2026-09-27',
        dateFormatted: '27 سبتمبر 2026',
        itemsCount: 102,
        badge: 'فحمات كوري وأصلي',
        icon: '🚗',
        isBuiltIn: true
      },
      {
        id: 'husoun',
        supplierName: 'شركة حصون لقطع غيار السيارات',
        title: 'عرض عام شهر 9-2026 محمود — شركة حصون',
        shortName: 'شركة حصون (قطع ديزل)',
        date: '2026-09-01',
        dateFormatted: '01 سبتمبر 2026',
        itemsCount: 223,
        badge: 'ديزل هيونداي وكيا',
        icon: '🚚',
        isBuiltIn: true
      }
    ];

    // Saved custom quotations appear first
    return [...savedCustomQuotations, ...builtInList];
  }, [savedCustomQuotations]);

  // Current active quotation metadata
  const currentQuotationMeta = useMemo(() => {
    return availableQuotations.find((q) => q.id === activePreset) || availableQuotations[0];
  }, [availableQuotations, activePreset]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (quotationDropdownRef.current && !quotationDropdownRef.current.contains(event.target)) {
        setIsQuotationDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Copy SKU to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSku(text);
    setTimeout(() => setCopiedSku(null), 1800);
  };

  // Switch between quotations
  const handleSelectQuotation = (id) => {
    setActivePreset(id);
    if (id === 'badr') {
      setQuotationResult(getBadrAlWadiQuotationAnalysis());
    } else if (id === 'husoun') {
      setQuotationResult(getHusounQuotationAnalysis());
    } else if (id === 'misk') {
      setQuotationResult(getMiskQuotationAnalysis());
    } else {
      const custom = savedCustomQuotations.find((q) => q.id === id);
      if (custom && custom.analysisData) {
        setQuotationResult(custom.analysisData);
      }
    }
    setSearchQuery('');
    setFilterVerdict('all');
    setFilterGrade('all');
    setPage(1);
    setUploadError(null);
    setIsQuotationDropdownOpen(false);
  };

  // Switch to Badr Al-Wadi
  const handleSelectBadr = () => handleSelectQuotation('badr');

  // Switch to Husoun
  const handleSelectHusoun = () => handleSelectQuotation('husoun');

  // Delete custom quotation permanently
  const handleDeleteCustomQuotation = (e, id) => {
    e.stopPropagation();
    const updated = savedCustomQuotations.filter((q) => q.id !== id);
    setSavedCustomQuotations(updated);
    saveCustomQuotationsToStorage(updated);

    if (activePreset === id) {
      handleSelectQuotation('badr');
    }
  };

  // Handle uploaded file (PDF or Excel)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);
      const parsed = await parseUploadedQuotationFile(file);
      
      const isPdf = /\.pdf$/i.test(file.name) || file.type === 'application/pdf';
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '').trim();
      const todayIso = new Date().toISOString().split('T')[0];
      const todayFormatted = new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

      const newCustomItem = {
        id: `custom_${Date.now()}`,
        supplierName: parsed.quotationInfo?.supplierName || cleanFileName,
        title: parsed.quotationInfo?.quotationTitle || `تحليل عرض: ${cleanFileName}`,
        shortName: parsed.quotationInfo?.supplierName || cleanFileName,
        date: parsed.quotationInfo?.quotationDate || todayIso,
        dateFormatted: todayFormatted,
        itemsCount: parsed.items?.length || 0,
        badge: isPdf ? 'ملف PDF محفوظ' : 'ملف Excel محفوظ',
        icon: isPdf ? '📄' : '📊',
        isBuiltIn: false,
        analysisData: parsed
      };

      const updatedList = [newCustomItem, ...savedCustomQuotations.filter((q) => q.title !== newCustomItem.title)];
      setSavedCustomQuotations(updatedList);
      saveCustomQuotationsToStorage(updatedList);

      setActivePreset(newCustomItem.id);
      setQuotationResult(parsed);
      setIsUploadModalOpen(false);
      setPage(1);
      setSearchQuery('');
      setFilterVerdict('all');
      setFilterGrade('all');
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'حدث خطأ أثناء قراءة ملف عرض السعر.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Filtering and Sorting Items
  const filteredItems = useMemo(() => {
    let list = items;

    // Search query: supplier part, our sku, supplier name, our name
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const normQ = normalizePartNumber(q);

      list = list.filter((item) => {
        const sPart = (item.supplierPartNumber || '').toLowerCase();
        const oSku = (item.ourSku || '').toLowerCase();
        const sNorm = item.normalizedPartNumber || '';
        const sName = (item.supplierPartName || '').toLowerCase();
        const oName = (item.ourName || '').toLowerCase();

        return (
          sPart.includes(q) ||
          oSku.includes(q) ||
          sNorm.includes(normQ) ||
          sName.includes(q) ||
          oName.includes(q)
        );
      });
    }

    // Product Grade Filter (Korean vs OEM)
    if (filterGrade === 'korean') {
      list = list.filter((i) => i.productGrade === 'korean');
    } else if (filterGrade === 'oem') {
      list = list.filter((i) => i.productGrade === 'oem');
    }

    // Verdict Filter
    if (filterVerdict === 'cheaper') {
      list = list.filter((i) => i.verdict === 'cheaper');
    } else if (filterVerdict === 'expensive') {
      list = list.filter((i) => i.verdict === 'expensive');
    } else if (filterVerdict === 'equal') {
      list = list.filter((i) => i.verdict === 'equal');
    } else if (filterVerdict === 'not_in_catalog') {
      list = list.filter((i) => !i.matched);
    } else if (filterVerdict === 'in_stock') {
      list = list.filter((i) => i.matched && i.ourTotalQty > 0);
    }

    // Sorting
    return [...list].sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortBy === 'savingsAmount') {
        valA = a.savingsAmount || 0;
        valB = b.savingsAmount || 0;
      } else if (sortBy === 'extraAmount') {
        valA = a.extraAmount || 0;
        valB = b.extraAmount || 0;
      } else if (sortBy === 'diffPercent') {
        valA = a.diffPercent !== null ? a.diffPercent : -9999;
        valB = b.diffPercent !== null ? b.diffPercent : -9999;
      } else if (sortBy === 'supplierPrice') {
        valA = a.supplierPrice || 0;
        valB = b.supplierPrice || 0;
      } else if (sortBy === 'ourCost') {
        valA = a.ourUnitCost || 0;
        valB = b.ourUnitCost || 0;
      } else if (sortBy === 'stock') {
        valA = a.ourTotalQty || 0;
        valB = b.ourTotalQty || 0;
      }

      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [items, searchQuery, filterGrade, filterVerdict, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    if (pageSize === -1) return filteredItems;
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  return (
    <div className="space-y-6 pb-14 font-sans select-none" dir="rtl">
      
      {/* ─── 1. TOP NAVIGATION MODULE TABS (البحث • التقارير • مقارنة الموردين) ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200 dark:border-slate-800">
        <Link
          to="/inventory/search"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all shrink-0"
        >
          <Search className="w-4 h-4 text-slate-500" />
          <span>البحث وتوفر الفروع</span>
        </Link>

        <Link
          to="/inventory/reports"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-slate-500" />
          <span>تقارير المخزون التخصصية</span>
        </Link>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-400/30 shrink-0">
          <Scale className="w-4 h-4 text-white" />
          <span>مقارنة أسعار الموردين</span>
        </div>

        <Link
          to="/inventory/branch-shortages"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all shrink-0"
        >
          <ClipboardList className="w-4 h-4 text-slate-500" />
          <span>نواقص الفروع والطلبات</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 font-mono font-bold">
            جديد
          </span>
        </Link>
      </div>

      {/* ─── 2. MAIN HEADER & CONTROL BAR ─── */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-3xl text-blue-400 shadow-inner shrink-0">
              ⚖️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {quotationInfo.quotationTitle || 'تحليل عرض سعر المورد'}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {quotationInfo.supplierName}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {quotationInfo.fileName}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <span>المطابقة الذكية لأرقام القطع مع مخزون درة السيارة المعتمد (8,901 صنف) بإزالة الفواصل والشرطات (-) تلقائياً</span>
              </p>
            </div>
          </div>

          {/* Preset Quotation Selector & Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quotations Dropdown Menu with Date */}
            <div className="relative" ref={quotationDropdownRef}>
              <button
                type="button"
                onClick={() => setIsQuotationDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-800/95 hover:bg-slate-750 text-white text-xs font-bold border border-slate-700/80 shadow-md transition-all cursor-pointer group"
                title="اختر عرض السعر ومقارنته"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{currentQuotationMeta?.icon || '📄'}</span>
                  <span className="font-black text-slate-100">{currentQuotationMeta?.shortName || quotationInfo.supplierName}</span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/20 text-cyan-300 font-mono text-[11px] font-bold border border-blue-400/30">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{currentQuotationMeta?.date || quotationInfo.quotationDate}</span>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform duration-200 ${
                    isQuotationDropdownOpen ? 'rotate-180 text-blue-400' : ''
                  }`}
                />
              </button>

              {/* Dropdown Popover */}
              {isQuotationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900/98 backdrop-blur-md border border-slate-700 rounded-3xl shadow-2xl z-50 overflow-hidden animate-fade-in p-2 space-y-1.5">
                  <div className="px-3.5 py-2.5 text-[11px] font-bold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span>عروض الأسعار المتاحة للمقارنة:</span>
                    </span>
                    <span className="font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/40">
                      {availableQuotations.length} عروض
                    </span>
                  </div>

                  <div className="space-y-1 max-h-72 overflow-y-auto custom-scrollbar">
                    {availableQuotations.map((q) => {
                      const isSelected = activePreset === q.id;
                      return (
                        <div
                          key={q.id}
                          className={`w-full text-right p-3 rounded-2xl transition-all flex items-start justify-between gap-3 ${
                            isSelected
                              ? 'bg-gradient-to-l from-blue-900/40 to-slate-800 border border-blue-500/60 text-white shadow-sm ring-1 ring-blue-500/30'
                              : 'hover:bg-slate-800/80 text-slate-300 hover:text-white border border-transparent'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectQuotation(q.id)}
                            className="space-y-1.5 flex-1 min-w-0 text-right cursor-pointer bg-transparent border-0 p-0"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base shrink-0">{q.icon}</span>
                              <span className="font-black text-xs text-white truncate">{q.title}</span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] flex-wrap">
                              {/* Date Tag */}
                              <span className="inline-flex items-center gap-1 font-mono font-bold text-cyan-300 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                                <Calendar className="w-3 h-3 text-cyan-400" />
                                <span>{q.date}</span>
                                <span className="text-slate-400 text-[10px]">({q.dateFormatted})</span>
                              </span>

                              {/* Items Count */}
                              <span className="px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 text-[10px] font-mono border border-slate-700/60">
                                {q.itemsCount} صنف
                              </span>

                              {/* Category Badge */}
                              <span className="px-2 py-0.5 rounded-md bg-blue-950/70 text-blue-300 border border-blue-800/50 text-[10px] font-bold">
                                {q.badge}
                              </span>
                            </div>
                          </button>

                          <div className="flex items-center gap-1.5 shrink-0 mt-1">
                            {!q.isBuiltIn && (
                              <button
                                type="button"
                                title="حذف هذا العرض من القائمة المحفوظة"
                                onClick={(e) => handleDeleteCustomQuotation(e, q.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 border border-transparent hover:border-rose-800/50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs shadow-md shadow-blue-500/30">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>رفع عرض سعر جديد</span>
            </button>

            <button
              onClick={() => exportComparisonToExcel(filteredItems, quotationInfo)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير إكسل</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>طباعة</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 3. EXECUTIVE KPI METRICS (6 STAT CARDS) ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Total Items in Quotation */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
            <span>أصناف عرض السعر</span>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
            {formatNum(stats.totalCount)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {formatSAR(stats.totalSupplierValue)}
          </div>
        </div>

        {/* 2. Matched with Our Inventory */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
            <span>مطابقة بمخزوننا</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xl font-black font-mono text-cyan-600 dark:text-cyan-400">
            {formatNum(stats.matchedCount)}
          </div>
          <div className="text-[10px] text-cyan-700 dark:text-cyan-300 font-bold">
            نسبة التطابق {stats.matchRate}%
          </div>
        </div>

        {/* 3. Supplier is Cheaper (Savings Opportunity) */}
        <div className="p-4 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
            <span>المورد أرخص (وفر)</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {formatNum(stats.cheaperCount)} صنف
          </div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono font-bold">
            وفر {formatSAR(stats.totalSavingsOpportunity)}
          </div>
        </div>

        {/* 4. Supplier is More Expensive (Cost Warning) */}
        <div className="p-4 rounded-3xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-rose-800 dark:text-rose-300 text-[11px] font-bold">
            <span>المورد أغلى (تحذير)</span>
            <TrendingUp className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-black font-mono text-rose-600 dark:text-rose-400">
            {formatNum(stats.expensiveCount)} صنف
          </div>
          <div className="text-[10px] text-rose-700 dark:text-rose-300 font-mono font-bold">
            زيادة {formatSAR(stats.totalExtraRisk)}
          </div>
        </div>

        {/* 5. In-Stock in Our Warehouses */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
            <span>متوفر بمستودعاتنا</span>
            <PackageCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">
            {formatNum(stats.inStockCount)} صنف
          </div>
          <div className="text-[10px] text-slate-400">
            رصيد فعلي بالفروع
          </div>
        </div>

        {/* 6. Not in Catalog (New SKUs to Consider) */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
            <span>أصناف جديدة بالكتالوج</span>
            <PlusCircle className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black font-mono text-purple-600 dark:text-purple-400">
            {formatNum(stats.notInCatalogCount)} صنف
          </div>
          <div className="text-[10px] text-purple-700 dark:text-purple-300 font-bold">
            فرص توسع بالكتالوج
          </div>
        </div>
      </div>

      {/* ─── 4. FILTERING & SEARCH CONTROLS BAR ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث برقم القطعة (مع أو بدون -) أو بالاسم..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Sorting Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 shrink-0">الترتيب:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <option value="savingsAmount">أعلى قيمة وفر مالي (ر.س)</option>
              <option value="extraAmount">أعلى فرق سعر ضدنا (الأغلى)</option>
              <option value="diffPercent">نسبة فرق السعر %</option>
              <option value="supplierPrice">سعر المورد</option>
              <option value="ourCost">تكلفتنا الحالية</option>
              <option value="stock">الرصيد المتوفر بمخازننا</option>
            </select>

            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs"
              title={sortOrder === 'desc' ? 'تنازلي' : 'تصاعدي'}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Product Grade Filter Chips (Korean vs OEM) */}
        {(stats.koreanTotalCount > 0 || stats.oemTotalCount > 0) && (
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar text-xs">
            <span className="text-slate-400 font-bold shrink-0">تصنيف الجودة:</span>
            
            <button
              onClick={() => { setFilterGrade('all'); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                filterGrade === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              كافة الفئات ({stats.totalCount})
            </button>

            <button
              onClick={() => { setFilterGrade('korean'); setPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black transition-all shrink-0 cursor-pointer ${
                filterGrade === 'korean'
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60'
              }`}
            >
              <span>🇰🇷 فحمات كوري بديل</span>
              <span className="font-mono text-[10px] bg-black/10 dark:bg-white/15 px-1.5 py-0.5 rounded-full">
                {stats.koreanTotalCount} صنف ({stats.koreanMatchedCount} مطابق بالكوري)
              </span>
            </button>

            <button
              onClick={() => { setFilterGrade('oem'); setPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black transition-all shrink-0 cursor-pointer ${
                filterGrade === 'oem'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-300/60 dark:border-blue-700/60'
              }`}
            >
              <span>🛡️ أصلي وكالة (موبيس)</span>
              <span className="font-mono text-[10px] bg-black/10 dark:bg-white/15 px-1.5 py-0.5 rounded-full">
                {stats.oemTotalCount} صنف ({stats.oemMatchedCount} مطابق بالأصلي)
              </span>
            </button>
          </div>
        )}

        {/* Verdict Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => { setFilterVerdict('all'); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              filterVerdict === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            الكل ({stats.totalCount})
          </button>

          <button
            onClick={() => { setFilterVerdict('cheaper'); setPage(1); }}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              filterVerdict === 'cheaper'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
          >
            <span>🟢 صفقات وفر (المورد أرخص)</span>
            <span className="font-mono text-[10px]">({stats.cheaperCount})</span>
          </button>

          <button
            onClick={() => { setFilterVerdict('expensive'); setPage(1); }}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              filterVerdict === 'expensive'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
            }`}
          >
            <span>🔴 أسعار أعلى (المورد أغلى)</span>
            <span className="font-mono text-[10px]">({stats.expensiveCount})</span>
          </button>

          <button
            onClick={() => { setFilterVerdict('equal'); setPage(1); }}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              filterVerdict === 'equal'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <span>⚪ أسعار متطابقة</span>
            <span className="font-mono text-[10px]">({stats.equalCount})</span>
          </button>

          <button
            onClick={() => { setFilterVerdict('in_stock'); setPage(1); }}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              filterVerdict === 'in_stock'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300'
            }`}
          >
            <span>📦 متوفر بمخازننا حالياً</span>
            <span className="font-mono text-[10px]">({stats.inStockCount})</span>
          </button>

          <button
            onClick={() => { setFilterVerdict('not_in_catalog'); setPage(1); }}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              filterVerdict === 'not_in_catalog'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300'
            }`}
          >
            <span>➕ أصناف جديدة غير مسجلة</span>
            <span className="font-mono text-[10px]">({stats.notInCatalogCount})</span>
          </button>
        </div>
      </div>

      {/* ─── 5. THE MASTER COMPARISON DATA TABLE ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Table Top Status Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>النتائج المستعرضة:</span>
            <span className="font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-lg">
              {filteredItems.length} من {items.length} صنف
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">عدد الصفوف بالصفحة:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>عرض الكل ({filteredItems.length})</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200/80 dark:border-slate-800 select-none">
              <tr>
                <th className="py-3.5 px-3 w-12 text-center">#</th>
                <th className="py-3.5 px-3 min-w-[190px]">رقم القطعة (المورد vs درة السيارة)</th>
                <th className="py-3.5 px-3 min-w-[220px]">اسم القطعة والبيان المعتمد</th>
                <th className="py-3.5 px-3 text-center min-w-[110px]">سعر المورد</th>
                <th className="py-3.5 px-3 text-center min-w-[110px]">تكلفتنا المعتمدة</th>
                <th className="py-3.5 px-3 text-center min-w-[130px]">فرق السعر والنسبة</th>
                <th className="py-3.5 px-3 text-center min-w-[130px]">تقييم الشراء</th>
                <th className="py-3.5 px-3 text-center min-w-[140px]">أرصدة الفروع بالمخزن</th>
                <th className="py-3.5 px-3 w-16 text-center">تفاصيل</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 font-bold">
                    لا توجد أصناف مطابقة لمعايير البحث والفلترة المحددة
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => {
                  const isCheaper = item.verdict === 'cheaper';
                  const isExpensive = item.verdict === 'expensive';
                  const isNotInCatalog = !item.matched;
                  const isZeroCost = item.verdict === 'zero_cost';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Row Index */}
                      <td className="py-3 px-3 text-center font-mono text-slate-400">
                        {item.itemNo}
                      </td>

                      {/* Part Number Comparison */}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-black text-slate-900 dark:text-white text-xs">
                              {item.supplierPartNumber}
                            </span>
                            {item.productGrade === 'korean' ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                🇰🇷 كوري
                              </span>
                            ) : item.productGrade === 'oem' ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                                🛡️ أصلي
                              </span>
                            ) : null}
                            <button
                              onClick={() => handleCopy(item.supplierPartNumber)}
                              className="text-slate-400 hover:text-blue-600 transition-colors"
                              title="نسخ رقم المورد"
                            >
                              {copiedSku === item.supplierPartNumber ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {item.matched ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                <span>✓ رقمنا:</span>
                                <span className="underline decoration-dotted">{item.ourSku}</span>
                              </div>
                              {item.matchType === 'korean-to-korean' && (
                                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                                  (مطابقة كوري مع كوري ✓)
                                </div>
                              )}
                              {item.matchType === 'oem-to-oem' && (
                                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                                  (مطابقة أصلي مع أصلي وكالة)
                                </div>
                              )}
                              {item.matchType === 'base-variant' && (
                                <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
                                  (تطابق مع كود الوكالة الأصلي)
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className={`text-[10px] font-bold ${
                              item.productGrade === 'korean'
                                ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-300/50 inline-block'
                                : 'text-purple-600 dark:text-purple-400'
                            }`}>
                              {item.productGrade === 'korean'
                                ? '⚠️ غير متوفر كوري بمخزوننا (صنف جديد)'
                                : 'غير مسجل بالكتالوج'}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Part Name */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {item.supplierPartName}
                          </div>
                          {item.matched && item.ourName && (
                            <div className="text-[11px] text-slate-500 truncate max-w-xs">
                              مخزن: {item.ourName}
                            </div>
                          )}
                          {item.ourCategory && (
                            <div className="text-[10px] text-slate-400">
                              {item.ourCategory} • {item.ourBrand}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Supplier Price */}
                      <td className="py-3 px-3 text-center font-mono font-black text-xs text-blue-600 dark:text-blue-400">
                        {formatSAR(item.supplierPrice)}
                      </td>

                      {/* Our Cost */}
                      <td className="py-3 px-3 text-center font-mono text-xs">
                        {item.matched ? (
                          item.ourUnitCost > 0 ? (
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {formatSAR(item.ourUnitCost)}
                            </span>
                          ) : (
                            <span className="text-amber-600 font-bold text-[11px]">
                              0.00 (رصيد 0)
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>

                      {/* Diff & Percentage */}
                      <td className="py-3 px-3 text-center font-mono text-xs">
                        {item.diff !== null && item.ourUnitCost > 0 ? (
                          <div className="space-y-0.5">
                            <div
                              className={`font-black flex items-center justify-center gap-0.5 ${
                                isCheaper
                                  ? 'text-emerald-600'
                                  : isExpensive
                                  ? 'text-rose-600'
                                  : 'text-slate-600'
                              }`}
                            >
                              {isCheaper && <TrendingDown className="w-3.5 h-3.5" />}
                              {isExpensive && <TrendingUp className="w-3.5 h-3.5" />}
                              <span>
                                {item.diff > 0 ? `+${item.diff.toFixed(2)}` : item.diff.toFixed(2)} ر.س
                              </span>
                            </div>
                            <div
                              className={`text-[10px] font-bold ${
                                isCheaper
                                  ? 'text-emerald-600'
                                  : isExpensive
                                  ? 'text-rose-600'
                                  : 'text-slate-500'
                              }`}
                            >
                              {item.diffPercent > 0
                                ? `+${item.diffPercent.toFixed(1)}%`
                                : `${item.diffPercent.toFixed(1)}%`}
                            </div>
                          </div>
                        ) : isZeroCost ? (
                          <span className="text-amber-600 text-[10px] font-bold">تكلفتنا 0</span>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>

                      {/* Decision Verdict Badge */}
                      <td className="py-3 px-3 text-center">
                        {isCheaper && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300">
                            🟢 وفر {Math.abs(item.diff).toFixed(0)} ر.س
                          </span>
                        )}
                        {isExpensive && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300">
                            🔴 أغلى بنسبة {item.diffPercent?.toFixed(0)}%
                          </span>
                        )}
                        {item.verdict === 'equal' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            ⚪ متطابق تماماً
                          </span>
                        )}
                        {isZeroCost && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            ⚠️ يحتاج تسعيرة
                          </span>
                        )}
                        {isNotInCatalog && (
                          item.productGrade === 'korean' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-xl text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                              🇰🇷 كوري غير متوفر
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300">
                              ➕ صنف جديد
                            </span>
                          )
                        )}
                      </td>

                      {/* Stock in Branches */}
                      <td className="py-3 px-3 text-center">
                        {item.matched ? (
                          <div className="space-y-0.5 font-mono">
                            <div className="font-black text-xs text-slate-900 dark:text-white">
                              إجمالي: {item.ourTotalQty} حبة
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5 flex-wrap">
                              <span title="المركز الرئيسي (100)">ر: {item.ourQtyMain}</span>
                              <span>•</span>
                              <span title="فرع الرواف (200)">ف: {item.ourQtyRawaf}</span>
                              <span>•</span>
                              <span title="فرع السليم كيا (300)">س: {item.ourQtySulaim}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">0</span>
                        )}
                      </td>

                      {/* Action Details Modal Button */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedItemForModal(item)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 transition-colors"
                          title="عرض تفاصيل الصنف والمقارنة"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Pagination Bar */}
        {pageSize !== -1 && totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-bold">
              صفحة <span className="font-mono text-slate-900 dark:text-white">{page}</span> من{' '}
              <span className="font-mono text-slate-900 dark:text-white">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 text-xs font-bold"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── 6. DYNAMIC UPLOAD MODAL (DRAG & DROP PDF / EXCEL) ─── */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  رفع وتحليل عرض سعر مورد (PDF أو Excel)
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                يمكنك رفع مستند <span className="font-mono font-bold text-red-500">PDF</span> رسمي من أي مورد أو ملف إكسل (<span className="font-mono font-bold text-emerald-600">.xlsx / .xls</span> أو <span className="font-mono font-bold">.csv</span>)، وسيقوم النظام فوراً باستخراج أرقام القطع والأسعار وتطبيق المطابقة الرقمية التلقائية ومقارنتها بتكلفتنا بالمخزن وعزل الكوري والأصلي ذاتياً.
              </p>

              {/* Upload Drop Zone */}
              <label className="border-2 border-dashed border-blue-300 dark:border-blue-900/60 hover:border-blue-500 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 bg-blue-50/40 dark:bg-blue-950/20 cursor-pointer transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  📄
                </div>
                <div className="text-center space-y-1">
                  <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                    اضغط هنا لاختيار ملف عرض السعر (PDF أو Excel) أو اسحبه إلى هنا
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    يدعم: PDF • XLSX • XLS • CSV
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf, .xlsx, .xls, .csv, application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>

              {isUploading && (
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري قراءة الملف واستخراج أرقام القطع والأسعار ومطابقتها فورياً...</span>
                </div>
              )}

              {uploadError && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. ITEM DETAIL BREAKDOWN MODAL ─── */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  بطاقة مقارنة الصنف
                </h3>
              </div>
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Part Names & Codes */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">تصنيف جودة الصنف:</span>
                  <div>
                    {selectedItemForModal.productGrade === 'korean' ? (
                      <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        🇰🇷 كوري (بديل) — مقارنة مع كوري فقط
                      </span>
                    ) : selectedItemForModal.productGrade === 'oem' ? (
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                        🛡️ أصلي وكالة (موبيس)
                      </span>
                    ) : (
                      <span className="text-slate-500">عام</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">رقم القطعة عند المورد:</span>
                  <span className="font-mono font-black text-blue-600 text-sm">{selectedItemForModal.supplierPartNumber}</span>
                </div>
                {selectedItemForModal.matched && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">رقم الصنف المعتمد بمخزوننا:</span>
                    <span className="font-mono font-black text-emerald-600 text-sm">{selectedItemForModal.ourSku}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {selectedItemForModal.supplierPartName}
                  </div>
                  {selectedItemForModal.ourName && (
                    <div className="text-slate-500 mt-0.5">
                      الاسم بالمخزن: {selectedItemForModal.ourName}
                    </div>
                  )}
                </div>

                {!selectedItemForModal.matched && selectedItemForModal.productGrade === 'korean' && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                    💡 <strong>تنبيه تدقيق معتمد:</strong> لم يتم العثور على بديل كوري لهذا الصنف بمخزوننا الحالي، وتم استبعاد مقارنته بالأصلي وكالة تجنباً لأي فروق وهمية في التوفير.
                  </div>
                )}
              </div>

              {/* Price Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 space-y-1">
                  <div className="text-blue-600 text-[11px] font-bold">سعر المورد (ر.س)</div>
                  <div className="text-lg font-black font-mono text-blue-900 dark:text-blue-300">
                    {formatSAR(selectedItemForModal.supplierPrice)}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="text-slate-600 dark:text-slate-400 text-[11px] font-bold">تكلفتنا المعتمدة (ر.س)</div>
                  <div className="text-lg font-black font-mono text-slate-900 dark:text-white">
                    {selectedItemForModal.ourUnitCost !== null ? formatSAR(selectedItemForModal.ourUnitCost) : '--'}
                  </div>
                </div>
              </div>

              {/* Difference & Recommendation */}
              {selectedItemForModal.diff !== null && (
                <div className={`p-4 rounded-2xl border ${
                  selectedItemForModal.verdict === 'cheaper'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                    : selectedItemForModal.verdict === 'expensive'
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 text-rose-900 dark:text-rose-200'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-300'
                }`}>
                  <div className="font-black text-sm flex items-center justify-between">
                    <span>
                      {selectedItemForModal.verdict === 'cheaper' ? '🟢 فرصة توفير ممتازة:' : '🔴 تكلفة أعلى من الشراء المعتمد:'}
                    </span>
                    <span className="font-mono">
                      {selectedItemForModal.diff > 0 ? `+${selectedItemForModal.diff.toFixed(2)}` : selectedItemForModal.diff.toFixed(2)} ر.س ({selectedItemForModal.diffPercent?.toFixed(1)}%)
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed opacity-90">
                    {selectedItemForModal.verdict === 'cheaper'
                      ? 'سعر المورد يتيح للشركة تحقيق وفر مالي مباشر. يوصى بإصدار أمر شراء بعد مراجعة حد الطلب والرصيد الحالي.'
                      : 'سعر المورد أعلى من التكلفة المعتمدة في سجلاتنا المحاسبية. لا ينصح بالشراء بهذا السعر والتفاوض لتخفيضه.'}
                  </p>
                </div>
              )}

              {/* Branch Inventory Stock Breakdown */}
              {selectedItemForModal.matched && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
                  <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>رصيد المخزون المتوفر بالفروع:</span>
                    <span className="font-mono text-sm font-black text-blue-600">
                      {selectedItemForModal.ourTotalQty} حبة
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-400">الرئيسي (100)</div>
                      <div className="font-bold text-xs">{selectedItemForModal.ourQtyMain}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-400">الرواف (200)</div>
                      <div className="font-bold text-xs">{selectedItemForModal.ourQtyRawaf}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-400">السليم كيا (300)</div>
                      <div className="font-bold text-xs">{selectedItemForModal.ourQtySulaim}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
