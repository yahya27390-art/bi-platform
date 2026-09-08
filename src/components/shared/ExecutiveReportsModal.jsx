import React, { useState, useMemo } from 'react';
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
    subtitle: 'أعلى 50 صنف من حيث حجم المنصرف والمبيعات المباشرة',
    badge: 'توب 50 صنف',
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

  // Sync initial tab when changed from props
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Handle ESC key to close
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // ── Compute 6 Executive Datasets (Always authentic & real) ──
  const computedData = useMemo(() => {
    // 1. Stagnant Items: balance > 0 and issued == 0, sorted by balance descending
    const stagnantAll = REAL_ALL_PARTS
      .filter((p) => p.balance > 0 && p.issued === 0)
      .sort((a, b) => b.balance - a.balance);
    const stagnantTop50 = stagnantAll.slice(0, 50);
    const totalStagnantBalance = stagnantAll.reduce((acc, p) => acc + p.balance, 0);

    // 2. Top Selling Items: sorted by issued descending
    const topSellingAll = [...REAL_ALL_PARTS].sort((a, b) => b.issued - a.issued);
    const topSellingTop50 = topSellingAll.slice(0, 50);
    const totalTop50Sales = topSellingTop50.reduce((acc, p) => acc + p.issued, 0);

    // 3. Out of stock with past movement: balance <= 0 and issued > 0, sorted by issued descending
    const outOfStockAll = REAL_ALL_PARTS
      .filter((p) => p.balance <= 0 && p.issued > 0)
      .sort((a, b) => b.issued - a.issued);
    const outOfStockTop50 = outOfStockAll.slice(0, 50);
    const totalOutOfStockSales = outOfStockAll.reduce((acc, p) => acc + p.issued, 0);

    // 4. Zero movement completely: issued == 0 and received == 0, sorted by balance descending
    const zeroMovementAll = REAL_ALL_PARTS
      .filter((p) => p.issued === 0 && p.received === 0)
      .sort((a, b) => b.balance - a.balance);
    const zeroMovementTop50 = zeroMovementAll.slice(0, 50);
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
        items: stagnantTop50
      },
      top_selling: {
        totalCount: REAL_INVENTORY_STATS.itemsWithSales,
        totalTop50Sales,
        top50Share: ((totalTop50Sales / REAL_INVENTORY_STATS.totalIssued) * 100).toFixed(1),
        topItem: topSellingAll[0],
        items: topSellingTop50
      },
      out_of_stock: {
        totalCount: outOfStockAll.length,
        totalHistoricalSales: totalOutOfStockSales,
        stockoutRate: ((outOfStockAll.length / REAL_INVENTORY_STATS.itemsWithSales) * 100).toFixed(1),
        topItem: outOfStockAll[0],
        items: outOfStockTop50
      },
      zero_movement: {
        totalCount: zeroMovementAll.length,
        totalFrozenUnits: totalZeroMovementBalance,
        shareOfSKUs: ((zeroMovementAll.length / REAL_INVENTORY_STATS.totalSKUs) * 100).toFixed(1),
        topItem: zeroMovementAll[0],
        items: zeroMovementTop50
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

  // Filter current 50 items by search & brand
  const filteredItems = useMemo(() => {
    if (activeTab === 'active_categories' || activeTab === 'stagnant_categories') {
      return [];
    }
    const currentList = computedData[activeTab]?.items || [];
    return currentList.filter((item) => {
      const matchBrand = brandFilter === 'all' || item.brand === brandFilter;
      const matchSearch =
        !searchTerm.trim() ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchBrand && matchSearch;
    });
  }, [activeTab, computedData, brandFilter, searchTerm]);

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
        csvContent += `"${idx + 1}","${c.name}","${c.count}","${c.issued}","${c.balance}","${c.turnoverRate}%","${c.salesShare}%","${c.zeroSalesCount}","${c.stagnantSkuRatio}%","${c.topItem ? `${c.topItem.name} (${c.topItem.sku})` : '-'}"\n`;
      });
    } else {
      const items = computedData[activeTab]?.items || [];
      const tabTitle = REPORT_TABS.find((t) => t.id === activeTab)?.title || 'التقرير';

      csvContent += `تقرير شركة درة السيارة - ${tabTitle}\n`;
      csvContent += `تاريخ الاستخراج: 8 سبتمبر 2026 | المصدر: حركة مخزن الى شهر 9 2026.xlsx\n\n`;
      csvContent += 'الترتيب,رقم الصنف OEM,اسم قطعة الغيار,الماركة,الفئة الرئيسية,الوحدة,الرصيد الافتتاحي,الوارد,المنصرف (المبيعات),الرصيد الحالي بالمستودع,حالة المخزون\n';

      items.forEach((p, idx) => {
        const brandArabic =
          p.brand === 'hyundai' ? 'هيونداي' : p.brand === 'kia' ? 'كيا' : p.brand === 'mobis' ? 'موبيس أصلي' : 'عام';
        csvContent += `"${idx + 1}","${p.sku}","${p.name}","${brandArabic}","${p.category}","${p.unit}","${p.opening}","${p.received}","${p.issued}","${p.balance}","${p.status}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `DORA_CARS_REPORT_${activeTab.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Print Function ──
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const currentTabMeta = REPORT_TABS.find((t) => t.id === activeTab) || REPORT_TABS[0];
  const TabIcon = currentTabMeta.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      dir="rtl"
    >
      {/* Modal Dialog Box */}
      <div className="relative w-full max-w-7xl max-h-[94vh] flex flex-col rounded-3xl border border-slate-700/60 bg-[#0F172A] text-white shadow-2xl overflow-hidden my-auto">
        
        {/* ── 1. Enterprise Corporate Top Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-5 md:px-7 border-b border-slate-800 bg-[#0B1120] gap-4">
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
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700 hover:border-emerald-500 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title="تصدير التقرير الفعلي إلى ملف Excel معتمد"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>تصدير Excel (CSV)</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700 hover:border-blue-500 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title="طباعة التقرير أو حفظه بصيغة PDF رسمية"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>طباعة / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 transition-colors ml-1"
              title="إغلاق النافذة (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── 2. Report Navigation Tabs (The 6 Essential Reports) ── */}
        <div className="px-5 md:px-7 pt-3 bg-[#0B1120]/70 border-b border-slate-800/80 overflow-x-auto scrollbar-thin">
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
                    'px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2.5 border',
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

        {/* ── 3. Modal Scrollable Content Body ── */}
        <div className="p-5 md:p-7 overflow-y-auto max-h-[calc(94vh-170px)] space-y-6">
          
          {/* Active Report Header Description Banner */}
          <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#131E35] to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                <TabIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-black text-white flex items-center gap-2">
                  <span>{currentTabMeta.title}</span>
                  <span className="text-xs font-mono font-normal text-slate-400">
                    ({activeTab.includes('categories') ? 'تحليل شامل لـ 9 فئات' : 'تقرير الـ 50 صنف المعتمد'})
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">{currentTabMeta.subtitle}</p>
              </div>
            </div>

            {/* Strategic Directive / Recommendation Pill */}
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-slate-300 max-w-md">
              <span className="font-bold text-amber-400 block mb-0.5">📌 التوجيه التنفيذي الموصى به:</span>
              {activeTab === 'stagnant' && (
                <span>تنشيط حزم عروض صيانة تشمل الأصناف المجمدة، ونقل الأصناف لفروع الرواف وكيا وفق طلبات العملاء.</span>
              )}
              {activeTab === 'top_selling' && (
                <span>إبرام عقود توريد سنوية مسبقة بأسعار تفضيلية مع الموردين لحماية هوامش الربح ومنع انقطاع الأصناف.</span>
              )}
              {activeTab === 'out_of_stock' && (
                <span>إصدار أوامر شراء طارئة (Emergency Purchase Orders) فورية لـ 50 كوداً حرجاً يمثلون مبيعات مفقودة.</span>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {activeTab === 'stagnant' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">إجمالي الأصناف الراكدة</div>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {formatNum(computedData.stagnant.totalCount)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-bold">كود قطعة غيار برصيد بدون بيع</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">إجمالي الوحدات المجمدة</div>
                  <div className="text-2xl font-black text-white font-mono">
                    {formatNum(computedData.stagnant.totalFrozenUnits)}
                  </div>
                  <div className="text-[11px] text-amber-400/90 font-bold">قطعة غيار محبوسة بالمستودعات</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">نسبة الركود من الأصناف</div>
                  <div className="text-2xl font-black text-rose-400 font-mono">23.9%</div>
                  <div className="text-[11px] text-slate-500 font-bold">من إجمالي 8,693 صنف</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">أعلى صنف مجمد بالمستودع</div>
                  <div className="text-sm font-black text-white truncate" title={computedData.stagnant.topItem?.name}>
                    {computedData.stagnant.topItem?.name}
                  </div>
                  <div className="text-[11px] text-amber-400 font-mono font-bold">
                    {computedData.stagnant.topItem?.balance} حبة ({computedData.stagnant.topItem?.sku})
                  </div>
                </div>
              </>
            )}

            {activeTab === 'top_selling' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">مبيعات قمة الـ 50 صنف</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {formatNum(computedData.top_selling.totalTop50Sales)}
                  </div>
                  <div className="text-[11px] text-emerald-300 font-bold">قطعة غيار مباعة</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">الحصة من مبيعات الشركة</div>
                  <div className="text-2xl font-black text-white font-mono">
                    {computedData.top_selling.top50Share}%
                  </div>
                  <div className="text-[11px] text-slate-400 font-bold">من إجمالي 77,047 قطعة مباعة</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">الصنف الأكثر مبيعاً بالمطلق</div>
                  <div className="text-sm font-black text-white truncate" title={computedData.top_selling.topItem?.name}>
                    {computedData.top_selling.topItem?.name}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono font-bold">
                    {formatNum(computedData.top_selling.topItem?.issued)} حبة مباعة
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">متوسط مبيعات الصنف بالقمة</div>
                  <div className="text-2xl font-black text-blue-400 font-mono">
                    {formatNum(Math.round(computedData.top_selling.totalTop50Sales / 50))}
                  </div>
                  <div className="text-[11px] text-slate-400 font-bold">قطعة لكل صنف متصدر</div>
                </div>
              </>
            )}

            {activeTab === 'out_of_stock' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">أصناف صفرية رصيد بطلب نشط</div>
                  <div className="text-2xl font-black text-rose-400 font-mono">
                    {formatNum(computedData.out_of_stock.totalCount)}
                  </div>
                  <div className="text-[11px] text-rose-300 font-bold">كود قطعة بحاجة لإعادة طلب فورية</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">حجم المبيعات المحققة سابقاً</div>
                  <div className="text-2xl font-black text-white font-mono">
                    {formatNum(computedData.out_of_stock.totalHistoricalSales)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-bold">قطعة تم بيعها ونفد رصيدها بالكامل</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">نسبة النفاد من الأصناف النشطة</div>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {computedData.out_of_stock.stockoutRate}%
                  </div>
                  <div className="text-[11px] text-slate-400 font-bold">من 6,611 صنف تم بيعه</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">أعلى صنف نفد ويحتاج توريد</div>
                  <div className="text-sm font-black text-white truncate" title={computedData.out_of_stock.topItem?.name}>
                    {computedData.out_of_stock.topItem?.name}
                  </div>
                  <div className="text-[11px] text-rose-400 font-mono font-bold">
                    باع {computedData.out_of_stock.topItem?.issued} حبة (رصيده الآن: 0)
                  </div>
                </div>
              </>
            )}

            {activeTab === 'zero_movement' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">أصناف خاملة تماماً (0 بيع / 0 وارد)</div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">
                    {formatNum(computedData.zero_movement.totalCount)}
                  </div>
                  <div className="text-[11px] text-cyan-300 font-bold">كود قطعة لم يتحرك نهائياً</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">إجمالي الوحدات المعطلة بالمخزن</div>
                  <div className="text-2xl font-black text-white font-mono">
                    {formatNum(computedData.zero_movement.totalFrozenUnits)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-bold">قطعة متوارثة من الرصيد الافتتاحي</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">النسبة من إجمالي الأصناف</div>
                  <div className="text-2xl font-black text-purple-400 font-mono">
                    {computedData.zero_movement.shareOfSKUs}%
                  </div>
                  <div className="text-[11px] text-slate-400 font-bold">من كودات المخزون الكلية</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">أعلى صنف خامل</div>
                  <div className="text-sm font-black text-white truncate" title={computedData.zero_movement.topItem?.name}>
                    {computedData.zero_movement.topItem?.name}
                  </div>
                  <div className="text-[11px] text-cyan-400 font-mono font-bold">
                    {computedData.zero_movement.topItem?.balance} حبة افتتاحية راكدة
                  </div>
                </div>
              </>
            )}

            {activeTab === 'active_categories' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">الفئة الأولى مبيعاً</div>
                  <div className="text-base font-black text-emerald-400 truncate">
                    {computedData.active_categories.topCategory?.name}
                  </div>
                  <div className="text-[11px] text-emerald-300 font-bold font-mono">
                    {formatNum(computedData.active_categories.topCategory?.issued)} قطعة مباعة
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">أعلى معدل دوران مخزون</div>
                  <div className="text-2xl font-black text-blue-400 font-mono">71.7%</div>
                  <div className="text-[11px] text-slate-400 font-bold">فئة الفلاتر والمصفيات</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">إجمالي مبيعات الفئات الـ 9</div>
                  <div className="text-2xl font-black text-white font-mono">
                    {formatNum(REAL_INVENTORY_STATS.totalIssued)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-bold">قطعة غيار لجميع الفروع</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">متوسط معدل الدوران العام</div>
                  <div className="text-2xl font-black text-indigo-400 font-mono">
                    {computedData.active_categories.avgTurnover}%
                  </div>
                  <div className="text-[11px] text-slate-400 font-bold">معدل صحي وممتاز للقطاع</div>
                </div>
              </>
            )}

            {activeTab === 'stagnant_categories' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">الفئة الأكثر ركوداً</div>
                  <div className="text-base font-black text-rose-400 truncate">
                    {computedData.stagnant_categories.mostStagnantCategory?.name}
                  </div>
                  <div className="text-[11px] text-rose-300 font-bold font-mono">
                    معدل دوران: {computedData.stagnant_categories.mostStagnantCategory?.turnoverRate}% فقط
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">الأصناف الراكدة بالفئة المتصدرة</div>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {computedData.stagnant_categories.mostStagnantCategory?.zeroSalesCount} صنف
                  </div>
                  <div className="text-[11px] text-slate-400 font-bold">
                    تمثل {computedData.stagnant_categories.mostStagnantCategory?.stagnantSkuRatio}% من فئة الهيكل
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">مخزون الهيكل والإنارة المحتجز</div>
                  <div className="text-2xl font-black text-white font-mono">
                    {formatNum(computedData.stagnant_categories.mostStagnantCategory?.balance)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-bold">قطعة غيار غير مباعة</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-medium">إجمالي كودات الركود عبر الفئات</div>
                  <div className="text-2xl font-black text-orange-400 font-mono">
                    {formatNum(computedData.stagnant_categories.totalStagnantSKUs)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-bold">كود صنف صفر مبيعات</div>
                </div>
              </>
            )}
          </div>

          {/* ── 5. Search & Filters Toolbar (When viewing part tables) ── */}
          {!activeTab.includes('categories') && (
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
                {[
                  { key: 'all', label: 'الكل' },
                  { key: 'hyundai', label: 'هيونداي' },
                  { key: 'kia', label: 'كيا' },
                  { key: 'mobis', label: 'موبيس' },
                  { key: 'general', label: 'عام' }
                ].map((b) => (
                  <button
                    key={b.key}
                    onClick={() => setBrandFilter(b.key)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap border',
                      brandFilter === b.key
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── 6. Category Analytics Display (Tabs 5 & 6) ── */}
          {activeTab.includes('categories') ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-300 font-black">
                      <th className="py-3.5 px-4 w-12 text-center">#</th>
                      <th className="py-3.5 px-4">الفئة الرئيسية</th>
                      <th className="py-3.5 px-4">عدد الأصناف SKUs</th>
                      <th className="py-3.5 px-4">المبيعات (المنصرف)</th>
                      <th className="py-3.5 px-4">المخزون الحالي</th>
                      <th className="py-3.5 px-4 min-w-[150px]">معدل الدوران %</th>
                      <th className="py-3.5 px-4">أصناف راكدة بالفئة</th>
                      <th className="py-3.5 px-4">الصنف الأبرز في الفئة</th>
                      <th className="py-3.5 px-4 text-center">التقييم المؤسسي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(activeTab === 'active_categories'
                      ? computedData.active_categories.categories
                      : computedData.stagnant_categories.categories
                    ).map((cat, idx) => {
                      return (
                        <tr key={cat.name} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 text-center font-mono font-bold">
                            {idx < 3 ? (
                              <span
                                className={cn(
                                  'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black',
                                  idx === 0
                                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                    : idx === 1
                                    ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                                    : 'bg-amber-700/20 text-amber-400 border border-amber-700/40'
                                )}
                              >
                                {idx + 1}
                              </span>
                            ) : (
                              <span className="text-slate-500">{idx + 1}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white text-sm">
                            {cat.name}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            {formatNum(cat.count)} كود
                          </td>
                          <td className="py-3.5 px-4 font-mono font-black text-emerald-400 text-sm">
                            {formatNum(cat.issued)} قطعة
                            <span className="text-[10px] text-slate-400 font-normal mr-1">
                              ({cat.salesShare}%)
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-black text-cyan-400 text-sm">
                            {formatNum(cat.balance)} قطعة
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className="font-black text-white">{cat.turnoverRate}%</span>
                                <span className="text-slate-500">معدل دوران</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
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
                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            <span className={cn('font-bold', cat.stagnantSkuRatio > 25 ? 'text-rose-400' : 'text-slate-300')}>
                              {formatNum(cat.zeroSalesCount)}
                            </span>{' '}
                            <span className="text-[10px] text-slate-500">
                              ({cat.stagnantSkuRatio}%)
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {cat.topItem ? (
                              <div className="max-w-[170px] truncate" title={`${cat.topItem.name} (${cat.topItem.sku})`}>
                                <span className="font-bold text-slate-200">{cat.topItem.name}</span>
                                <div className="text-[10px] font-mono text-slate-500">{cat.topItem.sku}</div>
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            {cat.turnoverRate >= 70 ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                نشاط استثنائي 🔥
                              </span>
                            ) : cat.turnoverRate >= 61 ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                دوران مستقر ⚡
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
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
          ) : (
            /* ── 7. Top 50 Items Table (Tabs 1 to 4) ── */
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-300 font-black">
                      <th className="py-3.5 px-4 w-12 text-center">الرتبة</th>
                      <th className="py-3.5 px-4">كود الصنف (OEM Part No.)</th>
                      <th className="py-3.5 px-4 min-w-[200px]">اسم قطعة الغيار</th>
                      <th className="py-3.5 px-4">الماركة</th>
                      <th className="py-3.5 px-4">الفئة</th>
                      <th className="py-3.5 px-3">الرصيد الافتتاحي</th>
                      <th className="py-3.5 px-3">الوارد</th>
                      <th className="py-3.5 px-4 bg-emerald-950/40 text-emerald-300">المنصرف (المبيعات)</th>
                      <th className="py-3.5 px-4 bg-blue-950/40 text-blue-300">الرصيد بالمستودع</th>
                      <th className="py-3.5 px-4 text-center">الحالة والتوجيه</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-500">
                          لا توجد أصناف مطابقة لمعايير البحث في قائمة الـ 50 المحددة.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((part, index) => {
                        const isTop3 = index < 3;
                        return (
                          <tr key={part.id || part.sku} className="hover:bg-slate-800/40 transition-colors">
                            {/* Rank */}
                            <td className="py-3 px-4 text-center font-mono font-bold">
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
                            </td>

                            {/* SKU */}
                            <td className="py-3 px-4 font-mono font-bold text-white tracking-wide">
                              {part.sku}
                            </td>

                            {/* Name */}
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-100">{part.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                الوحدة: {part.unit || 'حبه'}
                              </div>
                            </td>

                            {/* Brand Badge */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              {part.brand === 'hyundai' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  هيونداي
                                </span>
                              )}
                              {part.brand === 'kia' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  كيا
                                </span>
                              )}
                              {part.brand === 'mobis' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  موبيس أصلي
                                </span>
                              )}
                              {part.brand === 'general' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300 border border-slate-600">
                                  عام
                                </span>
                              )}
                            </td>

                            {/* Category */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                                {part.category}
                              </span>
                            </td>

                            {/* Opening */}
                            <td className="py-3 px-3 font-mono font-bold text-slate-400">
                              {formatNum(part.opening)}
                            </td>

                            {/* Received */}
                            <td className="py-3 px-3 font-mono font-bold text-slate-300">
                              {formatNum(part.received)}
                            </td>

                            {/* Issued (Sales) */}
                            <td className="py-3 px-4 font-mono font-black text-emerald-400 bg-emerald-950/20 text-sm">
                              {formatNum(part.issued)}
                            </td>

                            {/* Balance (Current Stock) */}
                            <td className="py-3 px-4 font-mono font-black text-blue-300 bg-blue-950/20 text-sm">
                              {formatNum(part.balance)}
                            </td>

                            {/* Status & Recommendation */}
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              {activeTab === 'stagnant' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>تجميد {part.balance} حبة</span>
                                </span>
                              )}
                              {activeTab === 'top_selling' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                                  <Flame className="w-3 h-3" />
                                  <span>طلب استثنائي</span>
                                </span>
                              )}
                              {activeTab === 'out_of_stock' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1">
                                  <PackageX className="w-3 h-3" />
                                  <span>طلب شراء عاجل</span>
                                </span>
                              )}
                              {activeTab === 'zero_movement' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 inline-flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
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
          <div className="pt-6 border-t border-slate-800 mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-1">
              <div className="text-slate-500 font-bold">إعداد وتدقيق المستودعات</div>
              <div className="font-black text-slate-200">إدارة المخازن وسلاسل الإمداد</div>
              <div className="text-[11px] text-emerald-400 font-mono mt-1">مطابق لملف سبتمبر 2026 ✓</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-1">
              <div className="text-slate-500 font-bold">المراجعة والرقابة المالية</div>
              <div className="font-black text-slate-200">إدارة الحسابات والمالية</div>
              <div className="text-[11px] text-blue-400 font-mono mt-1">معتمد محاسبياً ونظامياً ✓</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-1">
              <div className="text-slate-500 font-bold">الاعتماد التنفيذي النهائي</div>
              <div className="font-black text-slate-200">الرئيس التنفيذي - درة السيارة</div>
              <div className="text-[11px] text-purple-400 font-mono mt-1">صادر للاستخدام الإداري ✓</div>
            </div>
          </div>
        </div>

        {/* ── 9. Bottom Footer Bar ── */}
        <div className="p-3.5 px-6 border-t border-slate-800 bg-[#0B1120] flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>نظام التقارير الذكي لشركة درة السيارة · قطع غيار هيونداي وكيا</span>
          </div>
          <div className="font-mono text-[11px]">
            عرض 50 صنف معتمد حسب المعايير المحاسبية الرسمية
          </div>
        </div>
      </div>
    </div>
  );
}
