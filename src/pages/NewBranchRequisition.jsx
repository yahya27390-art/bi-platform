import React, { useState, useMemo, useEffect } from 'react';
import {
  Store,
  Printer,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Package,
  Layers,
  Sparkles,
  ArrowRightLeft,
  Building2,
  DollarSign,
  Copy,
  Check,
  Filter,
  Save,
  RotateCcw,
  FileSpreadsheet
} from 'lucide-react';
import requisitionData from '../data/newBranchRequisitionData.json';

export default function NewBranchRequisition() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'consumables' | 'oils' | 'fastMoving' | 'transfers'
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [transferBranchFilter, setTransferBranchFilter] = useState('all');
  const [copiedSku, setCopiedSku] = useState(null);

  // Editable actual quantities stored in local storage
  const [actualQuantities, setActualQuantities] = useState(() => {
    try {
      const saved = localStorage.getItem('dora_new_branch_actual_quantities');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleQtyChange = (sku, val) => {
    setActualQuantities(prev => ({
      ...prev,
      [sku]: val
    }));
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem('dora_new_branch_actual_quantities', JSON.stringify(actualQuantities));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetQuantities = () => {
    if (window.confirm('هل تريد مسح جميع الكميات الفعلية المدخلة والبدء من جديد؟')) {
      setActualQuantities({});
      localStorage.removeItem('dora_new_branch_actual_quantities');
    }
  };

  const handleCopySku = (sku) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 1800);
  };

  const { metadata, sections } = requisitionData;
  const { summary } = metadata;

  // Prepare combined list with section labels
  const allItems = useMemo(() => {
    return [
      ...sections.consumables.map(x => ({ ...x, sectionKey: 'consumables', sectionName: '1. الأصناف الاستهلاكية' })),
      ...sections.oils.map(x => ({ ...x, sectionKey: 'oils', sectionName: '2. الزيوت والسوائل' })),
      ...sections.fastMoving.map(x => ({ ...x, sectionKey: 'fastMoving', sectionName: '3. الأصناف سريعة الدوران' })),
      ...sections.transfers.map(x => ({ ...x, sectionKey: 'transfers', sectionName: '4. التحويلات المقترحة للأصناف الراكدة' }))
    ];
  }, [sections]);

  // Filter items
  const filteredItems = useMemo(() => {
    let items = [];
    if (activeTab === 'all') items = allItems;
    else if (activeTab === 'consumables') items = sections.consumables;
    else if (activeTab === 'oils') items = sections.oils;
    else if (activeTab === 'fastMoving') items = sections.fastMoving;
    else if (activeTab === 'transfers') items = sections.transfers;

    return items.filter(item => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || 
        item.sku.toLowerCase().includes(q) || 
        item.name.toLowerCase().includes(q) ||
        (item.subType && item.subType.toLowerCase().includes(q));

      const matchesBrand = brandFilter === 'all' || item.brand === brandFilter;

      const matchesTransferBranch = transferBranchFilter === 'all' || 
        (item.sourceBranch && item.sourceBranch.includes(transferBranchFilter));

      return matchesSearch && matchesBrand && matchesTransferBranch;
    });
  }, [activeTab, allItems, sections, search, brandFilter, transferBranchFilter]);

  // Dynamic calculations based on user input
  const totalActualFilledCount = useMemo(() => {
    return Object.values(actualQuantities).filter(v => v !== '' && !isNaN(v) && Number(v) > 0).length;
  }, [actualQuantities]);

  return (
    <div className="space-y-6 print:space-y-4 print:p-0 text-slate-800 dark:text-slate-100" dir="rtl">
      {/* Print-Only CSS Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 10mm 15mm 10mm;
          }
          body {
            background: white !important;
            color: black !important;
            font-size: 10pt !important;
          }
          .no-print, header, nav, aside, .bi-main-content > header, button, .tabs-bar, .filters-bar {
            display: none !important;
          }
          .print-break-inside {
            page-break-inside: avoid;
          }
          .print-break-before {
            page-break-before: always;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .print-table th, .print-table td {
            border: 1px solid #94a3b8 !important;
            padding: 4px 6px !important;
            font-size: 8.5pt !important;
          }
          .print-table th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            font-weight: bold !important;
          }
        }
      `}</style>

      {/* Official Header (Visible on Screen and Print) */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden print:bg-white print:text-black print:p-0 print:border-none print:shadow-none print:rounded-none">
        {/* Glow ambient effect (screen only) */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold print:hidden">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>نظام ذكاء الأعمال والمخزون المتقدم (BI Intelligence)</span>
            </div>
            
            {/* Print Header */}
            <div className="hidden print:block border-b-2 border-slate-800 pb-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-black text-slate-900">شركة درة السيارة للتجارة</h1>
                  <p className="text-xs text-slate-600 font-bold">كشف طلبية وافتتاح الفرع الجديد (خطة التوريد والتحويلات الداخلية)</p>
                </div>
                <div className="text-left text-[10px] text-slate-500">
                  <p>تاريخ الكشف: {new Date().toLocaleDateString('ar-SA')}</p>
                  <p>نسخة معتمدة لمسئول المشتريات والمستودعات</p>
                </div>
              </div>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-3 print:hidden">
              <Store className="w-8 h-8 text-amber-400" />
              <span>كشف طلبية وافتتاح الفرع الجديد</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl print:hidden">
              كشف توريد رسمي متكامل مبني على بيانات سرعة الدوران والمبيعات ومخزون الفروع الحالية. يشمل المستهلكات الجديدة، الزيوت والسوائل، القطع سريعة الحركة، والتحويلات الداخلية من الفروع الفائضة والراكدة لتوفير السيولة.
            </p>
          </div>

          {/* Action Buttons (Print, Excel Download, Save) */}
          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
              title="طباعة تقرير الكشف الرسمي كـ PDF أو ورقي"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الكشف الرسمي (PDF)</span>
            </button>

            <a
              href="/downloads/كشف_طلبية_وافتتاح_الفرع_الجديد_درة_السيارات.xlsx"
              download="كشف_طلبية_وافتتاح_الفرع_الجديد_درة_السيارات.xlsx"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2"
              title="تحميل ملف الإكسل الكامل متعدد الأوراق"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تحميل إكسل (.xlsx)</span>
            </a>

            <button
              onClick={handleSaveDraft}
              className={`px-4 py-2.5 ${savedSuccess ? 'bg-emerald-700' : 'bg-slate-800 hover:bg-slate-700'} border border-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2`}
              title="حفظ الكميات الفعلية المدخلة في المتصفح"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{savedSuccess ? 'تم الحفظ بنجاح ✓' : 'حفظ الكميات المدخلة'}</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Cards Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800/80 text-right print:grid-cols-4 print:pt-2 print:mt-2 print:border-slate-300">
          {/* 1. Consumables */}
          <div className="bg-slate-800/60 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/50 print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center justify-between text-xs text-slate-400 print:text-slate-600 font-bold mb-1">
              <span>الأصناف الاستهلاكية</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 print:text-slate-800 font-mono">
                {summary.consumablesCount} صنف
              </span>
            </div>
            <div className="text-lg lg:text-xl font-black text-white print:text-slate-900 font-mono">
              {summary.consumablesEstCost.toLocaleString('ar-SA')} <span className="text-xs font-normal">ر.س</span>
            </div>
            <div className="text-[11px] text-emerald-400 print:text-emerald-700 font-bold mt-1">
              {summary.consumablesSuggestedQty.toLocaleString('ar-SA')} قطعة مقترحة للطلب
            </div>
          </div>

          {/* 2. Oils & Fluids */}
          <div className="bg-slate-800/60 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/50 print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center justify-between text-xs text-slate-400 print:text-slate-600 font-bold mb-1">
              <span>الزيوت والسوائل</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 print:text-slate-800 font-mono">
                {summary.oilsCount} صنف
              </span>
            </div>
            <div className="text-lg lg:text-xl font-black text-white print:text-slate-900 font-mono">
              {summary.oilsEstCost.toLocaleString('ar-SA')} <span className="text-xs font-normal">ر.س</span>
            </div>
            <div className="text-[11px] text-blue-400 print:text-blue-700 font-bold mt-1">
              {summary.oilsSuggestedQty.toLocaleString('ar-SA')} لتر/عبوة توريد جديد
            </div>
          </div>

          {/* 3. Fast Moving */}
          <div className="bg-slate-800/60 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/50 print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center justify-between text-xs text-slate-400 print:text-slate-600 font-bold mb-1">
              <span>سريعة الدوران</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 print:text-slate-800 font-mono">
                {summary.fastMovingCount} صنف
              </span>
            </div>
            <div className="text-lg lg:text-xl font-black text-white print:text-slate-900 font-mono">
              {summary.fastMovingEstCost.toLocaleString('ar-SA')} <span className="text-xs font-normal">ر.س</span>
            </div>
            <div className="text-[11px] text-amber-400 print:text-amber-700 font-bold mt-1">
              {summary.fastMovingSuggestedQty.toLocaleString('ar-SA')} قطعة طلب شراء
            </div>
          </div>

          {/* 4. Internal Transfers Savings */}
          <div className="bg-indigo-950/80 p-3.5 rounded-2xl border border-indigo-700/60 print:bg-indigo-50 print:border-indigo-300">
            <div className="flex items-center justify-between text-xs text-indigo-300 print:text-indigo-900 font-bold mb-1">
              <span className="flex items-center gap-1">
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
                <span>وفر التحويلات الداخلية</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 print:text-indigo-900 font-mono">
                {summary.transfersCount} صنف
              </span>
            </div>
            <div className="text-lg lg:text-xl font-black text-emerald-400 print:text-emerald-800 font-mono">
              {summary.transfersEstSavings.toLocaleString('ar-SA')} <span className="text-xs font-normal">ر.س</span>
            </div>
            <div className="text-[11px] text-emerald-300/90 print:text-emerald-700 font-bold mt-1">
              {summary.transfersSuggestedQty.toLocaleString('ar-SA')} قطعة منقولة دون دفع سيولة!
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar (Interactive Sequential Navigation) */}
      <div className="tabs-bar flex items-center justify-between flex-wrap gap-2 print:hidden">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>📑 الكشف الشامل المجمع ({summary.totalItems})</span>
          </button>

          <button
            onClick={() => setActiveTab('consumables')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'consumables'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <span>🧰 1. الأصناف الاستهلاكية ({summary.consumablesCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('oils')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'oils'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <span>🛢️ 2. الزيوت والسوائل ({summary.oilsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('fastMoving')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'fastMoving'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <span>⚡ 3. سريعة الدوران ({summary.fastMovingCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('transfers')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'transfers'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <span>🔄 4. التحويلات الداخلية الراكدة ({summary.transfersCount})</span>
          </button>
        </div>

        {totalActualFilledCount > 0 && (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 px-3 py-1.5 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>تم تعبئة الكمية المطلوبة الفعلية لـ {totalActualFilledCount} صنف</span>
            <button
              onClick={handleResetQuantities}
              className="text-red-600 hover:text-red-700 mr-2 flex items-center gap-1 hover:underline text-[11px]"
              title="إعادة ضبط ومسح المدخلات"
            >
              <RotateCcw className="w-3 h-3" />
              <span>مسح</span>
            </button>
          </div>
        )}
      </div>

      {/* Filters Bar (Search & Selects) */}
      <div className="filters-bar bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 print:hidden">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم الصنف، الاسم، أو الفئة..."
            className="w-full pl-3 pr-9 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto">
          {/* Brand Filter */}
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>الماركة:</span>
          </div>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">جميع الماركات</option>
            <option value="هيونداي">هيونداي</option>
            <option value="كيا">كيا</option>
            <option value="موبيس أصلي">موبيس أصلي</option>
            <option value="عام">قطع عامة / تجاري</option>
          </select>

          {/* Transfer Source Branch Filter (When in transfers or all) */}
          {(activeTab === 'transfers' || activeTab === 'all') && (
            <>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-500 mr-2">
                <Building2 className="w-3.5 h-3.5" />
                <span>الفرع المحول منه:</span>
              </div>
              <select
                value={transferBranchFilter}
                onChange={(e) => setTransferBranchFilter(e.target.value)}
                className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">كل الفروع</option>
                <option value="الفرع الرئيسي">الفرع الرئيسي (100)</option>
                <option value="الرواف">فرع الرواف (200)</option>
                <option value="السليم">فرع السليم (300)</option>
              </select>
            </>
          )}

          <div className="text-xs font-bold text-slate-500 mr-auto md:mr-4">
            المعروض: <span className="font-mono text-indigo-600 dark:text-indigo-400">{filteredItems.length}</span> صنف
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden print:border-none print:shadow-none print:rounded-none">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse print-table">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <th className="py-3 px-3 w-10 text-center">م</th>
                {activeTab === 'all' && <th className="py-3 px-3 w-36">القسم</th>}
                <th className="py-3 px-3 w-40">رقم الصنف (SKU)</th>
                <th className="py-3 px-3 min-w-[200px]">اسم وتوصيف الصنف</th>
                <th className="py-3 px-2 w-24">الماركة</th>
                <th className="py-3 px-3 w-28 text-center bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300">
                  آخر سعر شراء
                </th>
                <th className="py-3 px-3 w-28 text-center">رصيد الفروع</th>
                <th className="py-3 px-3 w-28 text-center bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-300">
                  الكمية المقترحة
                </th>
                <th className="py-3 px-3 w-32 text-center bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-x border-emerald-200 dark:border-emerald-800">
                  الكمية الفعلية المطلوبة
                </th>
                <th className="py-3 px-3 w-44">طريقة التوفير / فرع التحويل</th>
                <th className="py-3 px-3 w-28 text-left font-mono">القيمة التقديرية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'all' ? 11 : 10} className="py-12 text-center text-slate-400">
                    لا توجد أصناف تطابق معايير البحث والتصفية المحددة
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => {
                  const isTransfer = !!item.sourceBranch;
                  const currentActual = actualQuantities[item.sku] !== undefined ? actualQuantities[item.sku] : '';

                  return (
                    <tr
                      key={item.sku}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isTransfer ? 'bg-purple-50/20 dark:bg-purple-950/10' : ''
                      }`}
                    >
                      {/* Index */}
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400 text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Section (Only shown in 'all' view) */}
                      {activeTab === 'all' && (
                        <td className="py-2.5 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.sectionKey === 'consumables' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                            item.sectionKey === 'oils' ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' :
                            item.sectionKey === 'fastMoving' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' :
                            'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                          }`}>
                            {item.sectionName}
                          </span>
                        </td>
                      )}

                      {/* SKU */}
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[140px]" title={item.sku}>{item.sku}</span>
                          <button
                            onClick={() => handleCopySku(item.sku)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors print:hidden"
                            title="نسخ رقم الصنف"
                          >
                            {copiedSku === item.sku ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Part Name & Subtype */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-800 dark:text-slate-100 leading-snug">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {item.subType}
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="py-2.5 px-2">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          {item.brand}
                        </span>
                      </td>

                      {/* Last Purchase Price */}
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/10">
                        {item.unitCost.toFixed(2)} <span className="text-[10px] font-normal">ر.س</span>
                      </td>

                      {/* Branch Stock */}
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-600 dark:text-slate-300">
                        {isTransfer ? (
                          <div title={`الرصيد في ${item.sourceBranch}`}>
                            <span>{item.sourceQty}</span>
                            <span className="block text-[9px] text-purple-600 dark:text-purple-400 font-sans font-normal">
                              في فرع المصدر
                            </span>
                          </div>
                        ) : (
                          <span>{item.totalStock}</span>
                        )}
                      </td>

                      {/* Suggested Qty */}
                      <td className="py-2.5 px-3 text-center bg-indigo-50/40 dark:bg-indigo-950/20">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 font-mono font-bold text-xs">
                          {item.suggestedQty}
                        </span>
                      </td>

                      {/* Actual Ordered Quantity (Blank for Purchasing Manager, with screen input) */}
                      <td className="py-2.5 px-3 text-center bg-emerald-50/40 dark:bg-emerald-950/20 border-x border-emerald-200 dark:border-emerald-800/60">
                        {/* Screen View: Input Box */}
                        <div className="print:hidden">
                          <input
                            type="number"
                            min="0"
                            value={currentActual}
                            onChange={(e) => handleQtyChange(item.sku, e.target.value)}
                            placeholder="حدد..."
                            className="w-20 text-center font-mono font-bold text-xs py-1 px-1.5 bg-white dark:bg-slate-800 border-2 border-emerald-400 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                          />
                        </div>

                        {/* Print View: Clean writing box or filled value */}
                        <div className="hidden print:block font-mono font-bold text-xs h-6 leading-6 border border-slate-400 rounded bg-white text-center">
                          {currentActual !== '' ? currentActual : ''}
                        </div>
                      </td>

                      {/* Supply Source / Transfer Branch */}
                      <td className="py-2.5 px-3 text-xs">
                        {isTransfer ? (
                          <span className="inline-flex items-center gap-1 font-bold text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/60 px-2 py-0.5 rounded-md text-[11px]">
                            <ArrowRightLeft className="w-3 h-3 shrink-0" />
                            <span>{item.sourceBranch}</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                            {item.supplySource}
                          </span>
                        )}
                      </td>

                      {/* Estimated Cost / Savings */}
                      <td className="py-2.5 px-3 text-left font-mono font-bold text-slate-800 dark:text-slate-200">
                        {item.estCost.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Signatures & Approval Footer (Print Only) */}
      <div className="hidden print:block pt-8 mt-6 border-t-2 border-slate-800">
        <div className="text-xs font-bold text-slate-700 mb-4">
          * ملاحظة لمسئول المشتريات: يرجى كتابة الكميات الفعلية المعتمدة في خانة "الكمية الفعلية المطلوبة" قبل إصدار أوامر الشراء وسندات التحويل الداخلي.
        </div>
        <div className="grid grid-cols-3 gap-6 text-center text-xs font-bold pt-4">
          <div className="space-y-10 border border-slate-300 p-4 rounded-lg">
            <p>إعداد ومطابقة البيانات</p>
            <p className="text-slate-500">إدارة ذكاء الأعمال (BI Intelligence)</p>
            <div className="border-t border-slate-300 pt-2 text-[10px]">التوقيع: ___________________</div>
          </div>
          <div className="space-y-10 border border-slate-300 p-4 rounded-lg">
            <p>مراجعة واعتماد الطلبيات</p>
            <p className="text-slate-500">مسئول إدارة المشتريات والتوريد</p>
            <div className="border-t border-slate-300 pt-2 text-[10px]">التوقيع: ___________________</div>
          </div>
          <div className="space-y-10 border border-slate-300 p-4 rounded-lg">
            <p>الموافقة النهائية والتعميد</p>
            <p className="text-slate-500">الإدارة العامة / المالك</p>
            <div className="border-t border-slate-300 pt-2 text-[10px]">التوقيع: ___________________</div>
          </div>
        </div>
      </div>
    </div>
  );
}
