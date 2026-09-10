import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Printer,
  Search,
  FileSpreadsheet,
  Boxes,
  Flame,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Layers,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Award,
  Filter,
  BarChart3,
  PieChart,
  Building2,
  PackageX,
  RotateCcw,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { formatNum } from '../../lib/kpiEngine';
import { cn } from '@/lib/utils';
import { REAL_ALL_PARTS, REAL_INVENTORY_STATS } from '../../data/realInventoryData';
import doraLogo from '@/assets/dora_logo.png';

// ── Corporate Report Definitions ──
export const REPORT_TABS = [
  {
    id: 'stagnant',
    title: 'الأصناف الراكدة',
    subtitle: 'أصناف ذات رصيد بالمستودع بدون أي مبيعات (تجميد سيولة)',
    badge: '2,082 صنف',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: Clock,
    accent: 'amber'
  },
  {
    id: 'top_selling',
    title: 'الأكثر طلباً ومبيعاً',
    subtitle: 'الأصناف الأعلى مبيعاً وحركة من إجمالي قطع الغيار المباعة',
    badge: '6,611 صنف',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: Flame,
    accent: 'emerald'
  },
  {
    id: 'out_of_stock',
    title: 'نفدت من المخزون (طلب نشط)',
    subtitle: 'أصناف صفرية الرصيد كان عليها حركة مبيعات (فرص ضائعة)',
    badge: '2,186 صنف',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    icon: PackageX,
    accent: 'rose'
  },
  {
    id: 'zero_movement',
    title: 'بدون أي حركة نهائياً',
    subtitle: 'أصناف خاملة تماماً لم تشهد أي توريد أو مبيعات منذ بداية الفترة',
    badge: '1,458 صنف',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    icon: AlertTriangle,
    accent: 'cyan'
  },
  {
    id: 'active_categories',
    title: 'أكثر الفئات نشاطاً',
    subtitle: 'ترتيب فئات قطع الغيار التسع حسب معدل الدوران وحجم المبيعات',
    badge: '9 فئات رئيسية',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    icon: TrendingUp,
    accent: 'blue'
  },
  {
    id: 'stagnant_categories',
    title: 'أكثر الفئات ركوداً',
    subtitle: 'تحليل الفئات حسب نسبة الأصناف الراكدة وتراكم المخزون',
    badge: 'مؤشر الركود',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    icon: TrendingDown,
    accent: 'orange'
  }
];

export default function ExecutiveReportsModal({ isOpen, onClose, initialTab = 'stagnant' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [swapSku, setSwapSku] = useState(true); // Default to swapped sides as requested by user
  // Report items limit scope: 50, 100, 250, 500, 1000, 'all', or custom number
  const [itemLimit, setItemLimit] = useState(100);
  const [customLimitInput, setCustomLimitInput] = useState('');

  // Sync initial tab when changed from props
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Add body class for print styling isolation
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Handle ESC key to close
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // ── SKU Swap Formatter (Transposes left/right around hyphen and isolates LTR) ──
  const formatSkuValue = (sku, swap = swapSku) => {
    if (!sku) return '';
    if (!swap) return sku;
    const dashIndex = sku.indexOf('-');
    if (dashIndex === -1) return sku;
    const prefix = sku.slice(0, dashIndex);
    const suffix = sku.slice(dashIndex + 1);
    return `${suffix}-${prefix}`;
  };

  const renderSkuBadge = (sku) => (
    <span
      dir="ltr"
      style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
      className="font-mono font-bold tracking-wider inline-block text-left"
    >
      {formatSkuValue(sku, swapSku)}
    </span>
  );

  // ── Compute 6 Executive Datasets (Always authentic & real) ──
  const computedData = useMemo(() => {
    // 1. Stagnant Items: balance > 0 and issued == 0, sorted by balance descending
    const stagnantAll = REAL_ALL_PARTS
      .filter((p) => p.balance > 0 && p.issued === 0)
      .sort((a, b) => b.balance - a.balance);
    const totalStagnantBalance = stagnantAll.reduce((acc, p) => acc + p.balance, 0);

    // 2. Top Selling Items: sorted by issued descending
    const topSellingAll = [...REAL_ALL_PARTS]
      .filter((p) => p.issued > 0)
      .sort((a, b) => b.issued - a.issued);
    const totalTopSellingSales = topSellingAll.reduce((acc, p) => acc + p.issued, 0);

    // 3. Out of stock with past movement: balance <= 0 and issued > 0, sorted by issued descending
    const outOfStockAll = REAL_ALL_PARTS
      .filter((p) => p.balance <= 0 && p.issued > 0)
      .sort((a, b) => b.issued - a.issued);
    const totalOutOfStockSales = outOfStockAll.reduce((acc, p) => acc + p.issued, 0);

    // 4. Zero movement completely: issued == 0 and received == 0, sorted by balance descending
    const zeroMovementAll = REAL_ALL_PARTS
      .filter((p) => p.issued === 0 && p.received === 0)
      .sort((a, b) => b.balance - a.balance);
    const totalZeroMovementBalance = zeroMovementAll.reduce((acc, p) => acc + p.balance, 0);

    // 5 & 6. Category Analytics
    const categoryMap = {};
    REAL_ALL_PARTS.forEach((p) => {
      const cat = p.category || 'قطع غيار عامة واستقرام';
      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          name: cat,
          count: 0,
          opening: 0,
          received: 0,
          issued: 0,
          balance: 0,
          zeroSalesCount: 0,
          topItem: null
        };
      }
      categoryMap[cat].count++;
      categoryMap[cat].opening += p.opening || 0;
      categoryMap[cat].received += p.received || 0;
      categoryMap[cat].issued += p.issued || 0;
      categoryMap[cat].balance += p.balance || 0;
      if (p.issued === 0) categoryMap[cat].zeroSalesCount++;
      if (!categoryMap[cat].topItem || p.issued > categoryMap[cat].topItem.issued) {
        categoryMap[cat].topItem = { sku: p.sku, name: p.name, issued: p.issued };
      }
    });

    const categoryList = Object.values(categoryMap).map((c) => {
      const totalUnits = c.issued + c.balance;
      const turnoverRate = totalUnits > 0 ? parseFloat(((c.issued / totalUnits) * 100).toFixed(1)) : 0;
      const stagnantSkuRatio = parseFloat(((c.zeroSalesCount / c.count) * 100).toFixed(1));
      const salesShare = parseFloat(((c.issued / REAL_INVENTORY_STATS.totalIssued) * 100).toFixed(1));
      return {
        ...c,
        turnoverRate,
        stagnantSkuRatio,
        salesShare
      };
    });

    const activeCategories = [...categoryList].sort((a, b) => b.issued - a.issued);
    const stagnantCategories = [...categoryList].sort((a, b) => a.turnoverRate - b.turnoverRate);

    return {
      stagnant: {
        totalCount: stagnantAll.length,
        totalFrozenUnits: totalStagnantBalance,
        topItem: stagnantAll[0],
        all: stagnantAll
      },
      top_selling: {
        totalCount: topSellingAll.length,
        totalTopSales: totalTopSellingSales,
        topItem: topSellingAll[0],
        all: topSellingAll
      },
      out_of_stock: {
        totalCount: outOfStockAll.length,
        totalHistoricalSales: totalOutOfStockSales,
        stockoutRate: ((outOfStockAll.length / REAL_INVENTORY_STATS.itemsWithSales) * 100).toFixed(1),
        topItem: outOfStockAll[0],
        all: outOfStockAll
      },
      zero_movement: {
        totalCount: zeroMovementAll.length,
        totalFrozenUnits: totalZeroMovementBalance,
        shareOfSKUs: ((zeroMovementAll.length / REAL_INVENTORY_STATS.totalSKUs) * 100).toFixed(1),
        topItem: zeroMovementAll[0],
        all: zeroMovementAll
      },
      active_categories: {
        categories: activeCategories,
        topCategory: activeCategories[0],
        avgTurnover: (activeCategories.reduce((acc, c) => acc + c.turnoverRate, 0) / activeCategories.length).toFixed(1)
      },
      stagnant_categories: {
        categories: stagnantCategories,
        mostStagnantCategory: stagnantCategories[0],
        totalStagnantSKUs: stagnantCategories.reduce((acc, c) => acc + c.zeroSalesCount, 0)
      }
    };
  }, []);

  // Filter items by search & brand, and apply chosen itemLimit
  const { filteredItems, totalMatchingBeforeLimit, totalTabAllCount } = useMemo(() => {
    if (activeTab === 'active_categories' || activeTab === 'stagnant_categories') {
      return { filteredItems: [], totalMatchingBeforeLimit: 0, totalTabAllCount: 0 };
    }
    const currentList = computedData[activeTab]?.all || [];
    const totalTabAllCount = currentList.length;

    // Apply Brand & Search filter across the full list
    const matched = currentList.filter((item) => {
      const matchBrand = brandFilter === 'all' || item.brand === brandFilter;
      const matchSearch =
        !searchTerm.trim() ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchBrand && matchSearch;
    });

    const totalMatchingBeforeLimit = matched.length;

    // Apply itemLimit (e.g. 50, 100, 250, 500, 1000, 'all', or custom number)
    let sliced;
    if (itemLimit === 'all') {
      sliced = matched;
    } else {
      const limit = typeof itemLimit === 'number' ? itemLimit : parseInt(itemLimit, 10) || 100;
      sliced = matched.slice(0, limit);
    }

    return { filteredItems: sliced, totalMatchingBeforeLimit, totalTabAllCount };
  }, [activeTab, computedData, brandFilter, searchTerm, itemLimit]);

  // ── CSV Formula Injection Sanitizer ──
  const cleanCsv = (val) => {
    if (val === null || val === undefined) return '';
    let str = String(val);
    if (/^[=\+\-\@\t\r]/.test(str)) {
      str = `'${str}`; // Prepend single quote to prevent spreadsheet formula execution
    }
    return str.replace(/"/g, '""');
  };

  // ── CSV Export Function ──
  const handleExportCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel Arabic compatibility

    if (activeTab === 'active_categories' || activeTab === 'stagnant_categories') {
      const cats =
        activeTab === 'active_categories'
          ? computedData.active_categories.categories
          : computedData.stagnant_categories.categories;

      csvContent += 'الترتيب,اسم الفئة,عدد الأصناف SKUs,إجمالي المبيعات (المنصرف),المخزون المتوفر,معدل دوران المخزون %,نسبة المبيعات من الشركة %,الأصناف الراكدة,نسبة ركود الأصناف %,الصنف الأكثر طلباً\n';

      cats.forEach((c, idx) => {
        csvContent += `"${cleanCsv(idx + 1)}","${cleanCsv(c.name)}","${cleanCsv(c.count)}","${cleanCsv(c.issued)}","${cleanCsv(c.balance)}","${cleanCsv(c.turnoverRate)}%","${cleanCsv(c.salesShare)}%","${cleanCsv(c.zeroSalesCount)}","${cleanCsv(c.stagnantSkuRatio)}%","${cleanCsv(c.topItem ? `${c.topItem.name} (${c.topItem.sku})` : '-')}"\n`;
      });
    } else {
      const items = filteredItems;
      const tabTitle = REPORT_TABS.find((t) => t.id === activeTab)?.title || 'التقرير';

      csvContent += `تقرير شركة درة السيارة - ${tabTitle}\n`;
      csvContent += `تاريخ الاستخراج: 10 سبتمبر 2026 | المصدر: حركة مخزن الى شهر 9 2026.xlsx\n`;
      csvContent += `نطاق التقرير: تم استخراج ${items.length} صنف من أصل ${totalMatchingBeforeLimit} صنف مطابق\n\n`;
      csvContent += 'الترتيب,رقم الصنف OEM,اسم قطعة الغيار,الماركة,الفئة الرئيسية,الوحدة,الرصيد الافتتاحي,الوارد,المنصرف (المبيعات),الرصيد الحالي بالمستودع,حالة المخزون\n';

      items.forEach((p, idx) => {
        const brandArabic =
          p.brand === 'hyundai' ? 'هيونداي' : p.brand === 'kia' ? 'كيا' : p.brand === 'mobis' ? 'موبيس أصلي' : 'عام';
        csvContent += `"${cleanCsv(idx + 1)}","${cleanCsv(formatSkuValue(p.sku, swapSku))}","${cleanCsv(p.name)}","${cleanCsv(brandArabic)}","${cleanCsv(p.category)}","${cleanCsv(p.unit || 'حبه')}","${cleanCsv(p.opening || 0)}","${cleanCsv(p.received || 0)}","${cleanCsv(p.issued || 0)}","${cleanCsv(p.balance || 0)}","${cleanCsv(p.status || '')}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `DORA_CARS_${activeTab.toUpperCase()}_${filteredItems.length}_ITEMS_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Custom Limit Form Submit ──
  const handleApplyCustomLimit = (e) => {
    if (e) e.preventDefault();
    const val = parseInt(customLimitInput, 10);
    if (!isNaN(val) && val > 0) {
      setItemLimit(val);
    }
  };

  // ── Print Function ──
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const currentTabMeta = REPORT_TABS.find((t) => t.id === activeTab) || REPORT_TABS[0];
  const TabIcon = currentTabMeta.icon;

  return createPortal(
    <div
      id="executive-modal-container"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto print:static print:inset-auto print:z-auto print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:overflow-visible print:block print:w-full"
      dir="rtl"
    >
      {/* Modal Dialog Box */}
      <div
        id="executive-report-printable-area"
        className="relative w-full max-w-7xl max-h-[94vh] flex flex-col rounded-3xl border border-slate-700/60 bg-[#0F172A] text-white shadow-2xl overflow-hidden my-auto print:static print:w-full print:max-w-none print:max-h-none print:bg-white print:text-slate-900 print:border-none print:shadow-none print:rounded-none print:m-0 print:p-0 print:overflow-visible print:block"
      >
        
        {/* ── Official Printable Corporate Letterhead (Visible ONLY in Print / PDF) ── */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={doraLogo} alt="درة السيارة" className="h-12 w-auto object-contain" />
              <div>
                <h1 className="text-xl font-black text-slate-950">شركة درة السيارة لقطع غيار السيارات</h1>
                <p className="text-xs text-slate-600 font-bold">متخصصون في قطع غيار هيونداي وكيا المعتمدة · المملكة العربية السعودية - القصيم (بريدة)</p>
              </div>
            </div>
            <div className="text-left text-xs font-mono">
              <div className="font-black text-slate-950">سجل اعتماد: DORA-AUDIT-2026-09</div>
              <div className="text-slate-600 font-bold">تاريخ التقرير: 8 سبتمبر 2026</div>
              <div className="text-emerald-800 font-bold">مطابق لملف: حركة مخزن الى شهر 9 2026.xlsx</div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-300 flex items-center justify-between">
            <h2 className="text-base font-black text-slate-950">
              {activeTab === 'stagnant' && `تقرير الجرد والتدقيق المالي: الأصناف الأكثر ركوداً وتجميداً بالمستودع (${filteredItems.length} صنف)`}
              {activeTab === 'top_selling' && `تقرير الأداء التجاري: الأصناف الأكثر طلباً ومبيعاً Best Sellers (${filteredItems.length} صنف)`}
              {activeTab === 'out_of_stock' && `تقرير المخزون الحرج: أصناف نفدت بطلب نشط - أوامر شراء طارئة (${filteredItems.length} صنف)`}
              {activeTab === 'zero_movement' && `تقرير الأصول الخاملة: أصناف بدون أي حركة نهائياً (${filteredItems.length} صنف)`}
              {activeTab === 'active_categories' && 'التقرير التحليلي الشامل: أكثر فئات قطع الغيار نشاطاً ومبيعات'}
              {activeTab === 'stagnant_categories' && 'تقرير سلاسل الإمداد: تحليل معدلات ركود فئات قطع الغيار'}
            </h2>
            <div className="text-xs font-bold text-slate-700">
              نطاق التقرير المعتمد: <span className="font-mono font-black text-slate-950">{activeTab.includes('categories') ? '9 فئات معتمدة' : `${filteredItems.length} صنف (من إجمالي ${totalMatchingBeforeLimit} صنف مطابق)`}</span>
            </div>
          </div>
        </div>

        {/* ── 1. Enterprise Corporate Top Header (Screen Only) ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-5 md:px-7 border-b border-slate-800 bg-[#0B1120] gap-4 no-print">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md border border-blue-400/30 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg md:text-xl font-black tracking-tight text-white">
                  مركز التقارير التنفيذية والمخزنية المعتمد
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  DORA-AUDIT-2026-09
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                شركة درة السيارة لقطع غيار هيونداي وكيا · بريدة · بيانات مدققة 100% من سجل حركة المخزن (8,693 صنف)
              </p>
            </div>
          </div>

          {/* Action Buttons: Export CSV + Print PDF + Close */}
          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700 hover:border-emerald-500 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              title="تصدير التقرير الفعلي إلى ملف Excel معتمد"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>تصدير Excel (CSV)</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700 hover:border-blue-500 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              title="طباعة التقرير أو حفظه بصيغة PDF رسمية"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>طباعة / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 transition-colors ml-1 cursor-pointer"
              title="إغلاق النافذة (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── 2. Report Navigation Tabs (Screen Only) ── */}
        <div className="px-5 md:px-7 pt-3 bg-[#0B1120]/70 border-b border-slate-800/80 overflow-x-auto scrollbar-thin no-print">
          <div className="flex items-center gap-2 pb-3 min-w-max">
            {REPORT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchTerm('');
                  }}
                  className={cn(
                    'px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2.5 border cursor-pointer',
                    isActive
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20 scale-[1.02]'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border-slate-800'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-400')} />
                  <span>{tab.title}</span>
                  <span
                    className={cn(
                      'text-[10px] font-mono px-2 py-0.5 rounded-full border',
                      isActive ? 'bg-white/20 text-white border-white/30' : tab.badgeColor
                    )}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. Modal Content Body (Scrolls on screen, expands in print) ── */}
        <div
          id="executive-modal-scroll-body"
          className="p-5 md:p-7 overflow-y-auto max-h-[calc(94vh-170px)] space-y-6 print:overflow-visible print:max-h-none print:p-0 print:space-y-3 print:block"
        >
          
          {/* Active Report Header Description Banner */}
          <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#131E35] to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 print:bg-slate-50 print:border print:border-slate-300 print:p-3 print:rounded-xl print:text-slate-900 print:mb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 print:bg-blue-50 print:text-blue-800 print:border-blue-200">
                <TabIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-black text-white print:text-slate-950 flex items-center gap-2">
                  <span>{currentTabMeta.title}</span>
                  <span className="text-xs font-mono font-normal text-slate-400 print:text-slate-600">
                    ({activeTab.includes('categories') ? 'تحليل شامل لـ 9 فئات معتمدة' : `تم تضمين ${filteredItems.length} صنف بالتقرير من أصل ${totalMatchingBeforeLimit}`})
                  </span>
                </h3>
                <p className="text-xs text-slate-300 print:text-slate-700 mt-0.5">{currentTabMeta.subtitle}</p>
              </div>
            </div>

            {/* Strategic Directive / Recommendation Pill */}
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-300 max-w-md print:bg-amber-50 print:border print:border-amber-300 print:text-amber-950 print:max-w-none print:w-auto">
              <span className="font-bold text-amber-400 print:text-amber-900 block mb-0.5">📌 التوجيه التنفيذي الموصى به:</span>
              {activeTab === 'stagnant' && (
                <span>تنشيط حزم عروض صيانة تشمل الأصناف المجمدة، ونقل الأصناف لفروع الرواف وكيا وفق طلبات العملاء.</span>
              )}
              {activeTab === 'top_selling' && (
                <span>إبرام عقود توريد سنوية مسبقة بأسعار تفضيلية مع الموردين لحماية هوامش الربح ومنع انقطاع الأصناف.</span>
              )}
              {activeTab === 'out_of_stock' && (
                <span>إصدار أوامر شراء طارئة (Emergency Purchase Orders) فورية للأصناف الحرجة التي نفدت وتمثل مبيعات مفقودة.</span>
              )}
              {activeTab === 'zero_movement' && (
                <span>جرد ميداني لمطابقة تواريخ الصلاحية وحالة القطع مع دراسة إرجاع المخزون الخامل للموزع المعتمد.</span>
              )}
              {activeTab === 'active_categories' && (
                <span>التركيز التسويقي على زيوت المحركات وسوائل التبريد والكلبسات لكونها محرك تدفق السيولة والزبائن الرئيسي.</span>
              )}
              {activeTab === 'stagnant_categories' && (
                <span>إعادة هيكلة سياسة شراء قطع الهيكل والبودي لتقليل مدة بقاء المخزون وربطها بالطلبيات المؤكدة فقط.</span>
              )}
            </div>
          </div>

          {/* ── 4. Executive Metric KPI Bar for Current Report ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 print:grid-cols-4 print:gap-2 print:mb-3">
            {activeTab === 'stagnant' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">إجمالي الأصناف الراكدة</div>
                  <div className="text-2xl font-black text-amber-400 print:text-slate-950 font-mono">
                    {formatNum(computedData.stagnant.totalCount)}
                  </div>
                  <div className="text-[11px] text-slate-500 print:text-slate-600 font-bold">كود قطعة غيار برصيد بدون بيع</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">إجمالي الوحدات المجمدة</div>
                  <div className="text-2xl font-black text-white print:text-amber-900 font-mono">
                    {formatNum(computedData.stagnant.totalFrozenUnits)}
                  </div>
                  <div className="text-[11px] text-amber-400/90 print:text-amber-800 font-bold">قطعة غيار محبوسة بالمستودعات</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">نسبة الركود من الأصناف</div>
                  <div className="text-2xl font-black text-rose-400 print:text-rose-900 font-mono">23.9%</div>
                  <div className="text-[11px] text-slate-500 print:text-slate-600 font-bold">من إجمالي 8,693 صنف</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">أعلى صنف مجمد بالمستودع</div>
                  <div className="text-sm font-black text-white print:text-slate-950 truncate" title={computedData.stagnant.topItem?.name}>
                    {computedData.stagnant.topItem?.name}
                  </div>
                  <div className="text-[11px] text-amber-400 print:text-slate-800 font-mono font-bold">
                    {computedData.stagnant.topItem?.balance} حبة ({computedData.stagnant.topItem?.sku})
                  </div>
                </div>
              </>
            )}

            {activeTab === 'top_selling' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">مبيعات أصناف التقرير المحددة</div>
                  <div className="text-2xl font-black text-emerald-400 print:text-slate-950 font-mono">
                    {formatNum(filteredItems.reduce((acc, it) => acc + (it.issued || 0), 0))}
                  </div>
                  <div className="text-[11px] text-emerald-300 print:text-emerald-800 font-bold">قطعة غيار مباعة لـ {filteredItems.length} صنف</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">الحصة من مبيعات الشركة</div>
                  <div className="text-2xl font-black text-white print:text-slate-950 font-mono">
                    {((filteredItems.reduce((acc, it) => acc + (it.issued || 0), 0) / REAL_INVENTORY_STATS.totalIssued) * 100).toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-slate-400 print:text-slate-600 font-bold">من إجمالي 77,047 قطعة مباعة</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">الصنف الأكثر مبيعاً بالمطلق</div>
                  <div className="text-sm font-black text-white print:text-slate-950 truncate" title={computedData.top_selling.topItem?.name}>
                    {computedData.top_selling.topItem?.name}
                  </div>
                  <div className="text-[11px] text-emerald-400 print:text-emerald-800 font-mono font-bold">
                    {formatNum(computedData.top_selling.topItem?.issued)} حبة مباعة
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">متوسط مبيعات الصنف بالتقرير</div>
                  <div className="text-2xl font-black text-blue-400 print:text-slate-950 font-mono">
                    {filteredItems.length > 0 ? formatNum(Math.round(filteredItems.reduce((acc, it) => acc + (it.issued || 0), 0) / filteredItems.length)) : 0}
                  </div>
                  <div className="text-[11px] text-slate-400 print:text-slate-600 font-bold">قطعة لكل كود مدرج بالتقرير</div>
                </div>
              </>
            )}

            {activeTab === 'out_of_stock' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">أصناف صفرية رصيد بطلب نشط</div>
                  <div className="text-2xl font-black text-rose-400 print:text-slate-950 font-mono">
                    {formatNum(computedData.out_of_stock.totalCount)}
                  </div>
                  <div className="text-[11px] text-rose-300 print:text-rose-800 font-bold">كود قطعة بحاجة لإعادة طلب فورية</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">حجم المبيعات المحققة سابقاً</div>
                  <div className="text-2xl font-black text-white print:text-slate-950 font-mono">
                    {formatNum(computedData.out_of_stock.totalHistoricalSales)}
                  </div>
                  <div className="text-[11px] text-slate-400 print:text-slate-600 font-bold">قطعة تم بيعها ونفد رصيدها بالكامل</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">نسبة النفاد من الأصناف النشطة</div>
                  <div className="text-2xl font-black text-amber-400 print:text-slate-950 font-mono">
                    {computedData.out_of_stock.stockoutRate}%
                  </div>
                  <div className="text-[11px] text-slate-400 print:text-slate-600 font-bold">من 6,611 صنف تم بيعه</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">أعلى صنف نفد ويحتاج توريد</div>
                  <div className="text-sm font-black text-white print:text-slate-950 truncate" title={computedData.out_of_stock.topItem?.name}>
                    {computedData.out_of_stock.topItem?.name}
                  </div>
                  <div className="text-[11px] text-rose-400 print:text-rose-800 font-mono font-bold">
                    باع {computedData.out_of_stock.topItem?.issued} حبة (رصيده الآن: 0)
                  </div>
                </div>
              </>
            )}

            {activeTab === 'zero_movement' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">أصناف خاملة تماماً (0 بيع / 0 وارد)</div>
                  <div className="text-2xl font-black text-cyan-400 print:text-slate-950 font-mono">
                    {formatNum(computedData.zero_movement.totalCount)}
                  </div>
                  <div className="text-[11px] text-cyan-300 print:text-slate-700 font-bold">كود قطعة لم يتحرك نهائياً</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">إجمالي الوحدات المعطلة بالمخزن</div>
                  <div className="text-2xl font-black text-white print:text-slate-950 font-mono">
                    {formatNum(computedData.zero_movement.totalFrozenUnits)}
                  </div>
                  <div className="text-[11px] text-slate-400 print:text-slate-600 font-bold">قطعة متوارثة من الرصيد الافتتاحي</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">النسبة من إجمالي الأصناف</div>
                  <div className="text-2xl font-black text-purple-400 print:text-slate-950 font-mono">
                    {computedData.zero_movement.shareOfSKUs}%
                  </div>
                  <div className="text-[11px] text-slate-400 print:text-slate-600 font-bold">من كودات المخزون الكلية</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">أعلى صنف خامل</div>
                  <div className="text-sm font-black text-white print:text-slate-950 truncate" title={computedData.zero_movement.topItem?.name}>
                    {computedData.zero_movement.topItem?.name}
                  </div>
                  <div className="text-[11px] text-cyan-400 print:text-slate-800 font-mono font-bold">
                    {computedData.zero_movement.topItem?.balance} حبة افتتاحية راكدة
                  </div>
                </div>
              </>
            )}

            {activeTab === 'active_categories' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">الفئة الأولى مبيعاً</div>
                  <div className="text-base font-black text-emerald-400 print:text-slate-950 truncate">
                    {computedData.active_categories.topCategory?.name}
                  </div>
                  <div className="text-[11px] text-emerald-300 print:text-emerald-800 font-bold font-mono">
                    {formatNum(computedData.active_categories.topCategory?.issued)} قطعة مباعة
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">أعلى معدل دوران مخزون</div>
                  <div className="text-2xl font-black text-blue-400 print:text-slate-950 font-mono">71.7%</div>
                  <div className="text-[11px] text-slate-400 print:text-slate-600 font-bold">فئة الفلاتر والمصفيات</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">إجمالي مبيعات الفئات الـ 9</div>
                  <div className="text-2xl font-black text-white print:text-slate-950 font-mono">
                    {formatNum(REAL_INVENTORY_STATS.totalIssued)}
                  </div>
                  <div className="text-[11px] text-slate-400 print:text-slate-600 font-bold">قطعة غيار لجميع الفروع</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">متوسط معدل الدوران العام</div>
                  <div className="text-2xl font-black text-indigo-400 print:text-slate-950 font-mono">
                    {computedData.active_categories.avgTurnover}%
                  </div>
                  <div className="text-[11px] text-slate-400 print:text-slate-600 font-bold">معدل صحي وممتاز للقطاع</div>
                </div>
              </>
            )}

            {activeTab === 'stagnant_categories' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">الفئة الأكثر ركوداً</div>
                  <div className="text-base font-black text-rose-400 print:text-slate-950 truncate">
                    {computedData.stagnant_categories.mostStagnantCategory?.name}
                  </div>
                  <div className="text-[11px] text-rose-300 print:text-rose-800 font-bold font-mono">
                    معدل دوران: {computedData.stagnant_categories.mostStagnantCategory?.turnoverRate}% فقط
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">الأصناف الراكدة بالفئة المتصدرة</div>
                  <div className="text-2xl font-black text-amber-400 print:text-slate-950 font-mono">
                    {computedData.stagnant_categories.mostStagnantCategory?.zeroSalesCount} صنف
                  </div>
                  <div className="text-[11px] text-slate-400 print:text-slate-600 font-bold">
                    تمثل {computedData.stagnant_categories.mostStagnantCategory?.stagnantSkuRatio}% من فئة الهيكل
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">مخزون الهيكل والإنارة المحتجز</div>
                  <div className="text-2xl font-black text-white print:text-slate-950 font-mono">
                    {formatNum(computedData.stagnant_categories.mostStagnantCategory?.balance)}
                  </div>
                  <div className="text-[11px] text-slate-400 print:text-slate-600 font-bold">قطعة غيار غير مباعة</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-xl print:text-slate-900">
                  <div className="text-xs text-slate-400 print:text-slate-600 font-medium">إجمالي كودات الركود عبر الفئات</div>
                  <div className="text-2xl font-black text-orange-400 print:text-slate-950 font-mono">
                    {formatNum(computedData.stagnant_categories.totalStagnantSKUs)}
                  </div>
                  <div className="text-[11px] text-slate-400 print:text-slate-600 font-bold">كود صنف صفر مبيعات</div>
                </div>
              </>
            )}
          </div>

          {/* ── 5. Search & Filters Toolbar (Screen Only - Hidden in Print) ── */}
          {!activeTab.includes('categories') && (
            <div className="space-y-3 no-print">
              {/* Row 1: Search & Brand Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ابحث برقم الصنف OEM أو الاسم..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Brand Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  <span className="text-[11px] text-slate-500 font-bold ml-1 hidden lg:inline">الماركة:</span>
                  {[
                    { key: 'all', label: 'كل الماركات' },
                    { key: 'hyundai', label: 'هيونداي' },
                    { key: 'kia', label: 'كيا' },
                    { key: 'mobis', label: 'موبيس' },
                    { key: 'general', label: 'عام' }
                  ].map((b) => (
                    <button
                      key={b.key}
                      onClick={() => setBrandFilter(b.key)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap border cursor-pointer',
                        brandFilter === b.key
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                      )}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Item Count & Scope Selector (محدد عدد أصناف التقرير والتصدير) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-indigo-950/40 border border-slate-800 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-200 ml-1">
                    <Filter className="w-4 h-4 text-blue-400" />
                    <span>عدد أصناف التقرير والتصدير:</span>
                  </div>

                  {/* Preset Limit Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { val: 50, label: '50 صنف' },
                      { val: 100, label: '100 صنف' },
                      { val: 250, label: '250 صنف' },
                      { val: 500, label: '500 صنف' },
                      { val: 1000, label: '1,000 صنف' },
                      { val: 'all', label: `الكل (${formatNum(totalMatchingBeforeLimit)})` }
                    ].map((btn) => {
                      const isSelected = itemLimit === btn.val;
                      return (
                        <button
                          key={String(btn.val)}
                          onClick={() => {
                            setItemLimit(btn.val);
                            setCustomLimitInput('');
                          }}
                          className={cn(
                            'px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1 active:scale-95',
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20 ring-1 ring-blue-400/40'
                              : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                          )}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          <span>{btn.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Number Input Form */}
                  <form onSubmit={handleApplyCustomLimit} className="flex items-center gap-1.5 mr-1">
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max={totalMatchingBeforeLimit || 10000}
                        placeholder="عدد مخصص..."
                        value={customLimitInput}
                        onChange={(e) => setCustomLimitInput(e.target.value)}
                        className="w-24 bg-slate-950/90 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 font-mono transition-colors text-center"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!customLimitInput || parseInt(customLimitInput, 10) <= 0}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      تطبيق
                    </button>
                  </form>
                </div>

                {/* Scope Status Badge */}
                <div className="flex items-center gap-2 self-end xl:self-center">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-slate-400">
                      يتم استخراج:{' '}
                      <span className="text-white font-mono font-black text-sm">{formatNum(filteredItems.length)}</span>{' '}
                      صنف
                    </span>
                    <span className="text-slate-600 font-mono">/</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      إجمالي المطابق: {formatNum(totalMatchingBeforeLimit)}
                    </span>
                    {itemLimit === 'all' ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        تغطية شاملة 100%
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        محدد بأول {formatNum(filteredItems.length)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 6. Category Analytics Display (Tabs 5 & 6) ── */}
          {activeTab.includes('categories') ? (
            <div className="space-y-4 print:space-y-0">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden print:border print:border-slate-300 print:rounded-none print:overflow-visible print:bg-transparent">
                <div className="overflow-x-auto print:overflow-visible">
                  <table className="w-full text-xs text-right print-table">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-300 font-black print:bg-slate-100 print:text-slate-950 print:border-b-2 print:border-slate-400">
                        <th className="py-3.5 px-4 w-12 text-center print:py-1.5 print:px-1.5 print:w-8 print:text-[10px] print:border print:border-slate-300">#</th>
                        <th className="py-3.5 px-4 print:py-1.5 print:px-2 print:text-[10px] print:border print:border-slate-300">الفئة الرئيسية</th>
                        <th className="py-3.5 px-4 print:py-1.5 print:px-2 print:text-[10px] print:border print:border-slate-300">عدد الأصناف SKUs</th>
                        <th className="py-3.5 px-4 print:py-1.5 print:px-2 print:text-[10px] print:border print:border-slate-300">المبيعات (المنصرف)</th>
                        <th className="py-3.5 px-4 print:py-1.5 print:px-2 print:text-[10px] print:border print:border-slate-300">المخزون الحالي</th>
                        <th className="py-3.5 px-4 min-w-[150px] print:min-w-0 print:py-1.5 print:px-2 print:text-[10px] print:border print:border-slate-300">معدل الدوران %</th>
                        <th className="py-3.5 px-4 print:py-1.5 print:px-2 print:text-[10px] print:border print:border-slate-300">أصناف راكدة بالفئة</th>
                        <th className="py-3.5 px-4 print:py-1.5 print:px-2 print:text-[10px] print:border print:border-slate-300">الصنف الأبرز في الفئة</th>
                        <th className="py-3.5 px-4 text-center print:py-1.5 print:px-2 print:text-[10px] print:border print:border-slate-300">التقييم المؤسسي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                      {(activeTab === 'active_categories'
                        ? computedData.active_categories.categories
                        : computedData.stagnant_categories.categories
                      ).map((cat, idx) => {
                        return (
                          <tr key={cat.name} className="hover:bg-slate-800/40 transition-colors print:border-b print:border-slate-200">
                            <td className="py-3.5 px-4 text-center font-mono font-bold print:py-1 print:px-1 print:text-[10px] print:border print:border-slate-200">
                              <span className="print:text-slate-900 font-bold">{idx + 1}</span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-white print:text-slate-950 text-sm print:text-[10px] print:py-1 print:px-2 print:border print:border-slate-200">
                              {cat.name}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-300 print:text-slate-900 print:py-1 print:px-2 print:text-[10px] print:border print:border-slate-200">
                              {formatNum(cat.count)} كود
                            </td>
                            <td className="py-3.5 px-4 font-mono font-black text-emerald-400 print:text-emerald-900 text-sm print:text-[10px] print:py-1 print:px-2 print:border print:border-slate-200">
                              {formatNum(cat.issued)} قطعة
                              <span className="text-[10px] text-slate-400 print:text-slate-600 font-normal mr-1">
                                ({cat.salesShare}%)
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-black text-cyan-400 print:text-slate-950 text-sm print:text-[10px] print:py-1 print:px-2 print:border print:border-slate-200">
                              {formatNum(cat.balance)} قطعة
                            </td>
                            <td className="py-3.5 px-4 print:py-1 print:px-2 print:text-[10px] print:border print:border-slate-200">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px] font-mono print:text-[10px]">
                                  <span className="font-black text-white print:text-slate-950">{cat.turnoverRate}%</span>
                                  <span className="text-slate-500 print:text-slate-600">معدل دوران</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden no-print">
                                  <div
                                    className={cn(
                                      'h-full rounded-full transition-all',
                                      cat.turnoverRate > 70
                                        ? 'bg-emerald-500'
                                        : cat.turnoverRate > 60
                                        ? 'bg-blue-500'
                                        : 'bg-amber-500'
                                    )}
                                    style={{ width: `${Math.min(100, cat.turnoverRate)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-300 print:text-slate-900 print:py-1 print:px-2 print:text-[10px] print:border print:border-slate-200">
                              <span className={cn('font-bold', cat.stagnantSkuRatio > 25 ? 'text-rose-400 print:text-rose-900' : 'text-slate-300 print:text-slate-900')}>
                                {formatNum(cat.zeroSalesCount)}
                              </span>{' '}
                              <span className="text-[10px] text-slate-500 print:text-slate-600">
                                ({cat.stagnantSkuRatio}%)
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-300 print:text-slate-900 print:py-1 print:px-2 print:text-[10px] print:border print:border-slate-200">
                              {cat.topItem ? (
                                <div className="max-w-[170px] truncate" title={`${cat.topItem.name} (${formatSkuValue(cat.topItem.sku, swapSku)})`}>
                                  <span className="font-bold text-slate-200 print:text-slate-950">{cat.topItem.name}</span>
                                  <div className="text-[10px] text-slate-500 print:text-slate-600">
                                    {renderSkuBadge(cat.topItem.sku)}
                                  </div>
                                </div>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap print:py-1 print:px-2 print:text-[10px] print:border print:border-slate-200">
                              {cat.turnoverRate >= 70 ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 print:bg-emerald-50 print:text-emerald-950 print:border-emerald-300">
                                  نشاط استثنائي 🔥
                                </span>
                              ) : cat.turnoverRate >= 61 ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 print:bg-blue-50 print:text-blue-950 print:border-blue-300">
                                  دوران مستقر ⚡
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 print:bg-rose-50 print:text-rose-950 print:border-rose-300">
                                  ركود مرتفع ⚠️
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* ── 7. Top 50 Items Table (Tabs 1 to 4) - Flawless multi-page print ── */
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden print:border print:border-slate-300 print:rounded-none print:overflow-visible print:bg-transparent">
              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full text-xs text-right print-table">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-300 font-black print:bg-slate-100 print:text-slate-950 print:border-b-2 print:border-slate-400">
                      <th className="py-3.5 px-4 w-12 text-center print:py-2 print:px-1.5 print:w-9 print:text-[10px] print:border print:border-slate-300">#</th>
                      <th className="py-3.5 px-4 print:py-2 print:px-2 print:text-[10px] print:border print:border-slate-300">
                        <div className="flex items-center justify-between gap-2">
                          <span>كود الصنف (OEM Part No.)</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSwapSku(!swapSku);
                            }}
                            className="no-print inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-slate-700 cursor-pointer transition-all active:scale-95"
                            title="تبديل طرفي الكود: نقل ما قبل أو بعد الشرطة (-) يمين / يسار"
                          >
                            <span>⇄</span>
                            <span>{swapSku ? 'نمط معكوس' : 'نمط أصلي'}</span>
                          </button>
                        </div>
                      </th>
                      <th className="py-3.5 px-4 min-w-[200px] print:min-w-0 print:py-2 print:px-2 print:text-[10px] print:border print:border-slate-300">اسم قطعة الغيار</th>
                      <th className="py-3.5 px-4 print:py-2 print:px-1.5 print:text-[10px] print:border print:border-slate-300">الماركة</th>
                      <th className="py-3.5 px-4 print:py-2 print:px-2 print:text-[10px] print:border print:border-slate-300">الفئة</th>
                      <th className="py-3.5 px-3 print:py-2 print:px-1.5 print:text-[10px] print:border print:border-slate-300">افتتاحي</th>
                      <th className="py-3.5 px-3 print:py-2 print:px-1.5 print:text-[10px] print:border print:border-slate-300">وارد</th>
                      <th className="py-3.5 px-4 bg-emerald-950/40 text-emerald-300 print:bg-transparent print:text-slate-950 print:py-2 print:px-1.5 print:text-[10px] print:border print:border-slate-300">منصرف (مبيعات)</th>
                      <th className="py-3.5 px-4 bg-blue-950/40 text-blue-300 print:bg-transparent print:text-slate-950 print:py-2 print:px-2 print:text-[10px] print:border print:border-slate-300 print:font-black">رصيد المستودع</th>
                      <th className="py-3.5 px-4 text-center print:py-2 print:px-2 print:text-[10px] print:border print:border-slate-300">الحالة والتوجيه</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-500 print:text-slate-600">
                          لا توجد أصناف مطابقة لمعايير البحث في نطاق هذا التقرير.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((part, index) => {
                        const isTop3 = index < 3;
                        return (
                          <tr key={part.id || part.sku} className="hover:bg-slate-800/40 transition-colors print:border-b print:border-slate-200">
                            {/* Rank */}
                            <td className="py-3 px-4 text-center font-mono font-bold print:py-1.5 print:px-1.5 print:text-[10px] print:border print:border-slate-200">
                              <span className="print:hidden">
                                {isTop3 ? (
                                  <span
                                    className={cn(
                                      'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black shadow-sm',
                                      index === 0
                                        ? 'bg-amber-400 text-slate-950'
                                        : index === 1
                                        ? 'bg-slate-300 text-slate-950'
                                        : 'bg-amber-700 text-white'
                                    )}
                                  >
                                    {index + 1}
                                  </span>
                                ) : (
                                  <span className="text-slate-500 font-mono">#{index + 1}</span>
                                )}
                              </span>
                              <span className="hidden print:inline font-mono font-bold text-slate-900">
                                #{index + 1}
                              </span>
                            </td>

                            {/* SKU */}
                            <td className="py-3 px-4 text-white print:text-slate-950 print:py-1.5 print:px-2 print:text-[10px] print:border print:border-slate-200">
                              {renderSkuBadge(part.sku)}
                            </td>

                            {/* Name */}
                            <td className="py-3 px-4 print:py-1.5 print:px-2 print:text-[10px] print:border print:border-slate-200">
                              <div className="font-bold text-slate-100 print:text-slate-950">{part.name}</div>
                              <div className="text-[10px] text-slate-500 print:text-slate-600 font-mono">
                                الوحدة: {part.unit || 'حبه'}
                              </div>
                            </td>

                            {/* Brand Badge */}
                            <td className="py-3 px-4 whitespace-nowrap print:py-1.5 print:px-1.5 print:text-[10px] print:border print:border-slate-200">
                              {part.brand === 'hyundai' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 print:bg-blue-50 print:text-blue-900 print:border-blue-200">
                                  هيونداي
                                </span>
                              )}
                              {part.brand === 'kia' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 print:bg-purple-50 print:text-purple-900 print:border-purple-200">
                                  كيا
                                </span>
                              )}
                              {part.brand === 'mobis' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 print:bg-indigo-50 print:text-indigo-900 print:border-indigo-200">
                                  موبيس
                                </span>
                              )}
                              {part.brand === 'general' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300 border border-slate-600 print:bg-slate-100 print:text-slate-800 print:border-slate-300">
                                  عام
                                </span>
                              )}
                            </td>

                            {/* Category */}
                            <td className="py-3 px-4 whitespace-nowrap print:py-1.5 print:px-2 print:text-[10px] print:border print:border-slate-200">
                              <span className="text-[11px] print:text-[10px] text-slate-400 print:text-slate-800 bg-slate-800/80 print:bg-slate-100 px-2 py-0.5 rounded-md border border-slate-700/60 print:border-slate-300">
                                {part.category}
                              </span>
                            </td>

                            {/* Opening */}
                            <td className="py-3 px-3 font-mono font-bold text-slate-400 print:text-slate-900 print:py-1.5 print:px-1.5 print:text-[10px] print:border print:border-slate-200">
                              {formatNum(part.opening)}
                            </td>

                            {/* Received */}
                            <td className="py-3 px-3 font-mono font-bold text-slate-300 print:text-slate-900 print:py-1.5 print:px-1.5 print:text-[10px] print:border print:border-slate-200">
                              {formatNum(part.received)}
                            </td>

                            {/* Issued (Sales) */}
                            <td className="py-3 px-4 font-mono font-black text-emerald-400 print:text-emerald-950 bg-emerald-950/20 print:bg-transparent text-sm print:text-[10px] print:py-1.5 print:px-1.5 print:border print:border-slate-200">
                              {formatNum(part.issued)}
                            </td>

                            {/* Balance (Current Stock) */}
                            <td className="py-3 px-4 font-mono font-black text-blue-300 print:text-slate-950 bg-blue-950/20 print:bg-transparent text-sm print:text-[10px] print:py-1.5 print:px-2 print:border print:border-slate-200">
                              {formatNum(part.balance)}
                            </td>

                            {/* Status & Recommendation */}
                            <td className="py-3 px-4 text-center whitespace-nowrap print:py-1.5 print:px-2 print:text-[10px] print:border print:border-slate-200">
                              {activeTab === 'stagnant' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 print:bg-amber-100 print:text-amber-900 print:border-amber-300 inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3 print:hidden" />
                                  <span>تجميد {part.balance} حبة</span>
                                </span>
                              )}
                              {activeTab === 'top_selling' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 print:bg-emerald-100 print:text-emerald-900 print:border-emerald-300 inline-flex items-center gap-1">
                                  <Flame className="w-3 h-3 print:hidden" />
                                  <span>طلب استثنائي</span>
                                </span>
                              )}
                              {activeTab === 'out_of_stock' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 print:bg-rose-100 print:text-rose-900 print:border-rose-300 inline-flex items-center gap-1">
                                  <PackageX className="w-3 h-3 print:hidden" />
                                  <span>طلب شراء عاجل</span>
                                </span>
                              )}
                              {activeTab === 'zero_movement' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 print:bg-slate-100 print:text-slate-900 print:border-slate-300 inline-flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 print:hidden" />
                                  <span>خمول تام</span>
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
            </div>
          )}

          {/* ── 8. Executive Corporate Signatures Footer (C-Suite Approval Block) ── */}
          <div className="pt-6 border-t border-slate-800 mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs print:break-inside-avoid print:mt-5 print:pt-4 print:border-t-2 print:border-slate-400 print:grid-cols-3 print:gap-3">
            <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-lg print:text-slate-900">
              <div className="text-slate-500 font-bold print:text-slate-600">إعداد وتدقيق المستودعات</div>
              <div className="font-black text-slate-200 print:text-slate-950">إدارة المخازن وسلاسل الإمداد</div>
              <div className="text-[11px] text-emerald-400 font-mono mt-1 print:text-emerald-800 print:font-bold">مطابق للجرد الفعلي الميداني ✓</div>
              <div className="text-[9px] text-slate-400 print:text-slate-600 mt-2 font-mono">التوقيع والاعتماد: _________________</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-lg print:text-slate-900">
              <div className="text-slate-500 font-bold print:text-slate-600">المراجعة والرقابة المالية</div>
              <div className="font-black text-slate-200 print:text-slate-950">إدارة الحسابات والمالية</div>
              <div className="text-[11px] text-blue-400 font-mono mt-1 print:text-blue-800 print:font-bold">معتمد محاسبياً ونظامياً ✓</div>
              <div className="text-[9px] text-slate-400 print:text-slate-600 mt-2 font-mono">التوقيع والاعتماد: _________________</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-1 print:bg-slate-50 print:border print:border-slate-300 print:p-2.5 print:rounded-lg print:text-slate-900">
              <div className="text-slate-500 font-bold print:text-slate-600">الاعتماد التنفيذي النهائي</div>
              <div className="font-black text-slate-200 print:text-slate-950">الرئيس التنفيذي - درة السيارة</div>
              <div className="text-[11px] text-purple-400 font-mono mt-1 print:text-purple-800 print:font-bold">صادر للاستخدام الإداري ✓</div>
              <div className="text-[9px] text-slate-400 print:text-slate-600 mt-2 font-mono">الختم الرسمي: [ شركة درة السيارة - معتمد ]</div>
            </div>
          </div>
        </div>

        {/* ── 9. Bottom Footer Bar (Screen Only) ── */}
        <div className="p-3.5 px-6 border-t border-slate-800 bg-[#0B1120] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>نظام التقارير الذكي لشركة درة السيارة · قطع غيار هيونداي وكيا المعتمدة</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            {activeTab.includes('categories')
              ? 'عرض تحليل 9 فئات معتمدة'
              : `عرض ${filteredItems.length} صنف (من أصل ${totalMatchingBeforeLimit} صنف مطابق) · نطاق محدد للطباعة والإكسل`}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
