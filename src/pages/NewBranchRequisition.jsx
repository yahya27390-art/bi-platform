import React, { useState, useMemo } from 'react';
import {
  Store,
  Printer,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  ArrowRightLeft,
  Building2,
  Copy,
  Check,
  Filter,
  Save,
  RotateCcw
} from 'lucide-react';
import requisitionData from '../data/newBranchRequisitionData.json';

export default function NewBranchRequisition() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'consumables' | 'oils' | 'fastMoving' | 'transfers'
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [transferBranchFilter, setTransferBranchFilter] = useState('all');
  const [copiedSku, setCopiedSku] = useState(null);
  const [printOrientation, setPrintOrientation] = useState('landscape'); // 'landscape' | 'portrait'

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

  // Filter items helper
  const filterList = (items) => {
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
  };

  const filteredConsumables = useMemo(() => filterList(sections.consumables), [sections.consumables, search, brandFilter, transferBranchFilter]);
  const filteredOils = useMemo(() => filterList(sections.oils), [sections.oils, search, brandFilter, transferBranchFilter]);
  const filteredFastMoving = useMemo(() => filterList(sections.fastMoving), [sections.fastMoving, search, brandFilter, transferBranchFilter]);
  const filteredTransfers = useMemo(() => filterList(sections.transfers), [sections.transfers, search, brandFilter, transferBranchFilter]);

  const totalVisibleCount = useMemo(() => {
    if (activeTab === 'all') return filteredConsumables.length + filteredOils.length + filteredFastMoving.length + filteredTransfers.length;
    if (activeTab === 'consumables') return filteredConsumables.length;
    if (activeTab === 'oils') return filteredOils.length;
    if (activeTab === 'fastMoving') return filteredFastMoving.length;
    if (activeTab === 'transfers') return filteredTransfers.length;
    return 0;
  }, [activeTab, filteredConsumables, filteredOils, filteredFastMoving, filteredTransfers]);

  const totalActualFilledCount = useMemo(() => {
    return Object.values(actualQuantities).filter(v => v !== '' && !isNaN(v) && Number(v) > 0).length;
  }, [actualQuantities]);

  // Section Table Component (Used both on screen and print)
  const renderSectionTable = (title, items, isTransfer = false, sectionNumber = '') => {
    if (items.length === 0) return null;

    const totalSectionSuggestedQty = items.reduce((s, i) => s + (i.suggestedQty || 0), 0);
    const totalSectionCost = items.reduce((s, i) => s + (i.estCost || 0), 0);

    return (
      <div className="section-block mb-8 print:mb-6 print:break-inside-avoid">
        {/* Section Header */}
        <div className="bg-slate-100 dark:bg-slate-800/80 print:bg-slate-100 border-y border-slate-300 dark:border-slate-700 px-4 py-2.5 flex items-center justify-between mb-3 rounded-xl print:rounded-none">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-mono print:border print:border-black">
              {sectionNumber}
            </span>
            <h2 className="font-black text-sm lg:text-base text-slate-900 dark:text-white print:text-black">
              {title}
            </h2>
            <span className="text-xs text-slate-500 font-bold">
              ({items.length} صنف)
            </span>
          </div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 print:text-black flex items-center gap-4">
            <span>إجمالي الكميات: <strong className="font-mono text-indigo-700 dark:text-indigo-400 print:text-black">{totalSectionSuggestedQty.toLocaleString('ar-SA')}</strong></span>
            <span>{isTransfer ? 'إجمالي الوفر: ' : 'الميزانية التقديرية: '}<strong className="font-mono text-emerald-700 dark:text-emerald-400 print:text-black">{totalSectionCost.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س</strong></span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-right border-collapse print-table">
            <thead>
              <tr className="bg-slate-200/80 dark:bg-slate-800 print:bg-slate-200 text-[10.5px] print:text-[8.5pt] font-black text-slate-800 dark:text-slate-200 print:text-black border border-slate-300 dark:border-slate-700">
                <th className="py-2 px-1.5 w-[3%] text-center border-l border-slate-300">م</th>
                <th className="py-2 px-2 w-[14%] border-l border-slate-300">رقم الصنف (SKU)</th>
                <th className="py-2 px-2.5 w-[25%] border-l border-slate-300">اسم وتوصيف الصنف</th>
                <th className="py-2 px-1.5 w-[8%] border-l border-slate-300">الماركة</th>
                <th className="py-2 px-2 w-[9%] text-center border-l border-slate-300 bg-amber-50/60 print:bg-slate-100">
                  آخر سعر (ر.س)
                </th>
                <th className="py-2 px-2 w-[8%] text-center border-l border-slate-300">
                  {isTransfer ? 'رصيد المصدر' : 'رصيد الفروع'}
                </th>
                <th className="py-2 px-2 w-[9%] text-center border-l border-slate-300 bg-indigo-50/60 print:bg-slate-100">
                  الكمية المقترحة
                </th>
                <th className="py-2 px-2 w-[11%] text-center border-l border-slate-300 bg-emerald-50/80 print:bg-white text-emerald-950 font-black">
                  الكمية الفعلية المطلوبة
                </th>
                <th className="py-2 px-2 w-[13%] text-center">
                  {isTransfer ? 'الفرع المحول منه' : 'مصدر التوفير'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-slate-300 text-[11px] print:text-[8pt]">
              {items.map((item, idx) => {
                const currentActual = actualQuantities[item.sku] !== undefined ? actualQuantities[item.sku] : '';
                return (
                  <tr
                    key={item.sku}
                    className={`border border-slate-200 dark:border-slate-800 print:border-slate-300 ${
                      idx % 2 === 1 ? 'bg-slate-50/60 dark:bg-slate-900/40 print:bg-slate-50' : 'bg-white dark:bg-slate-900'
                    }`}
                  >
                    <td className="py-1.5 px-1 text-center font-mono text-slate-500 print:text-black border-l border-slate-200">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 px-2 font-mono font-bold text-slate-900 dark:text-slate-100 print:text-black border-l border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="truncate max-w-[130px] print:max-w-none">{item.sku}</span>
                        <button
                          onClick={() => handleCopySku(item.sku)}
                          className="p-0.5 text-slate-400 hover:text-indigo-600 rounded transition-colors print:hidden"
                          title="نسخ رقم الصنف"
                        >
                          {copiedSku === item.sku ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-1.5 px-2.5 font-bold text-slate-800 dark:text-slate-100 print:text-black border-l border-slate-200 leading-snug">
                      <div>{item.name}</div>
                      <div className="text-[9.5px] print:text-[7pt] text-slate-400 print:text-slate-600 font-normal">{item.subType}</div>
                    </td>
                    <td className="py-1.5 px-1.5 text-slate-600 dark:text-slate-300 print:text-black border-l border-slate-200 text-center">
                      {item.brand}
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono font-bold text-amber-700 dark:text-amber-400 print:text-black border-l border-slate-200">
                      {item.unitCost.toFixed(2)}
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-700 dark:text-slate-300 print:text-black border-l border-slate-200">
                      {isTransfer ? item.sourceQty : item.totalStock}
                    </td>
                    <td className="py-1.5 px-2 text-center border-l border-slate-200">
                      <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 print:bg-transparent text-indigo-900 dark:text-indigo-200 print:text-black font-mono font-black text-xs print:text-[8.5pt]">
                        {item.suggestedQty}
                      </span>
                    </td>
                    <td className="py-1 px-1.5 text-center border-l border-slate-200 bg-emerald-50/40 dark:bg-emerald-950/20 print:bg-white">
                      {/* Screen input */}
                      <div className="print:hidden">
                        <input
                          type="number"
                          min="0"
                          value={currentActual}
                          onChange={(e) => handleQtyChange(item.sku, e.target.value)}
                          placeholder="___"
                          className="w-16 text-center font-mono font-black text-xs py-1 px-1 bg-white dark:bg-slate-800 border-2 border-emerald-400 rounded focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      {/* Print clean writing box */}
                      <div className="hidden print:block font-mono font-bold text-[9pt] h-6 leading-6 border border-slate-400 rounded bg-white text-center">
                        {currentActual !== '' ? currentActual : ''}
                      </div>
                    </td>
                    <td className="py-1.5 px-2 text-center text-xs print:text-[7.5pt]">
                      {isTransfer ? (
                        <span className="font-bold text-purple-700 dark:text-purple-300 print:text-black">
                          {item.sourceBranch}
                        </span>
                      ) : (
                        <span className="text-slate-600 dark:text-slate-400 print:text-black">
                          {item.supplySource}
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
    );
  };

  return (
    <div className="space-y-6 print:space-y-3 print:p-0 text-slate-800 dark:text-slate-100" dir="rtl">
      {/* Dynamic Print CSS for Landscape A4 Perfect Alignment */}
      <style>{`
        @media print {
          @page {
            size: A4 ${printOrientation};
            margin: 8mm 6mm 10mm 6mm;
          }
          body {
            background: white !important;
            color: black !important;
            font-size: 8.5pt !important;
          }
          .no-print, header, nav, aside, .bi-main-content > header, button, .tabs-bar, .filters-bar {
            display: none !important;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
          }
          .print-table th, .print-table td {
            border: 1px solid #94a3b8 !important;
            padding: 3.5px 5px !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            word-break: break-word !important;
          }
          .print-table th {
            background-color: #f1f5f9 !important;
            color: #000000 !important;
            font-weight: 900 !important;
          }
          .print-break-inside {
            page-break-inside: avoid !important;
          }
          .print-break-before {
            page-break-before: always !important;
          }
        }
      `}</style>

      {/* Corporate Header */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden print:bg-white print:text-black print:p-0 print:border-none print:shadow-none print:rounded-none">
        {/* Glow effects (screen only) */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />

        {/* Formal Clean Print Header (Visible ONLY on print) */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h1 className="text-lg font-black text-slate-900">شركة درة السيارة للتجارة</h1>
              <p className="text-xs font-bold text-slate-700">كشف طلبية وافتتاح الفرع الجديد (خطة التوريد والتحويلات الداخلية المعتمدة)</p>
            </div>
            <div className="text-left text-[9pt] font-mono text-slate-700 space-y-0.5">
              <div>تاريخ الكشف: <strong>{new Date().toLocaleDateString('ar-SA')}</strong></div>
              <div>إعداد: إدارة ذكاء الأعمال والمخزون</div>
            </div>
          </div>
          {/* 1-Line Compact Summary Strip for Print */}
          <div className="mt-2 pt-2 border-t border-slate-300 flex items-center justify-between text-[8pt] font-bold text-slate-800 bg-slate-50 px-2.5 py-1">
            <span>الاستهلاكية: {summary.consumablesCount} صنف ({summary.consumablesEstCost.toLocaleString('ar-SA')} ر.س)</span>
            <span>الزيوت والسوائل: {summary.oilsCount} صنف ({summary.oilsEstCost.toLocaleString('ar-SA')} ر.س)</span>
            <span>سريعة الدوران: {summary.fastMovingCount} صنف ({summary.fastMovingEstCost.toLocaleString('ar-SA')} ر.س)</span>
            <span className="text-emerald-800">وفر التحويلات: {summary.transfersCount} صنف ({summary.transfersEstSavings.toLocaleString('ar-SA')} ر.س)</span>
          </div>
        </div>

        {/* Screen Header Content */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>نظام ذكاء الأعمال والمخزون المتقدم (BI Intelligence)</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-3">
              <Store className="w-8 h-8 text-amber-400" />
              <span>كشف طلبية وافتتاح الفرع الجديد</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              خطة توريد شاملة مبنية على معدلات السحب الحقيقية وسرعة الدوران وأرصدة الفروع. تتضمن المستهلكات، الزيوت، سريعة الحركة، وتحويلات الفائض من الفروع لتوفير رأس المال.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Print Orientation Selector */}
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 px-2 py-1 rounded-xl text-xs font-bold text-slate-300">
              <span>تنسيق الطباعة:</span>
              <button
                onClick={() => setPrintOrientation('landscape')}
                className={`px-2 py-1 rounded-lg transition-all ${printOrientation === 'landscape' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                أفقي (موصى به)
              </button>
              <button
                onClick={() => setPrintOrientation('portrait')}
                className={`px-2 py-1 rounded-lg transition-all ${printOrientation === 'portrait' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
              >
                طولي
              </button>
            </div>

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
              title="تحميل ملف الإكسل الكامل المزود بالمعادلات المحاسبية الحية"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تحميل إكسل بالمعادلات (.xlsx)</span>
            </a>

            <button
              onClick={handleSaveDraft}
              className={`px-4 py-2.5 ${savedSuccess ? 'bg-emerald-700' : 'bg-slate-800 hover:bg-slate-700'} border border-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2`}
              title="حفظ الكميات الفعلية المدخلة في المتصفح"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{savedSuccess ? 'تم الحفظ بنجاح ✓' : 'حفظ الكميات'}</span>
            </button>
          </div>
        </div>

        {/* Screen KPI Cards Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800/80 text-right print:hidden">
          {/* 1. Consumables */}
          <div className="bg-slate-800/60 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/50">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
              <span>الأصناف الاستهلاكية</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                {summary.consumablesCount} صنف
              </span>
            </div>
            <div className="text-lg lg:text-xl font-black text-white font-mono">
              {summary.consumablesEstCost.toLocaleString('ar-SA')} <span className="text-xs font-normal">ر.س</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-bold mt-1">
              {summary.consumablesSuggestedQty.toLocaleString('ar-SA')} قطعة مقترحة للطلب
            </div>
          </div>

          {/* 2. Oils & Fluids */}
          <div className="bg-slate-800/60 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/50">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
              <span>الزيوت والسوائل</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                {summary.oilsCount} صنف
              </span>
            </div>
            <div className="text-lg lg:text-xl font-black text-white font-mono">
              {summary.oilsEstCost.toLocaleString('ar-SA')} <span className="text-xs font-normal">ر.س</span>
            </div>
            <div className="text-[11px] text-blue-400 font-bold mt-1">
              {summary.oilsSuggestedQty.toLocaleString('ar-SA')} لتر/عبوة توريد جديد
            </div>
          </div>

          {/* 3. Fast Moving */}
          <div className="bg-slate-800/60 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/50">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1">
              <span>سريعة الدوران</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {summary.fastMovingCount} صنف
              </span>
            </div>
            <div className="text-lg lg:text-xl font-black text-white font-mono">
              {summary.fastMovingEstCost.toLocaleString('ar-SA')} <span className="text-xs font-normal">ر.س</span>
            </div>
            <div className="text-[11px] text-amber-400 font-bold mt-1">
              {summary.fastMovingSuggestedQty.toLocaleString('ar-SA')} قطعة طلب شراء
            </div>
          </div>

          {/* 4. Internal Transfers Savings */}
          <div className="bg-indigo-950/80 p-3.5 rounded-2xl border border-indigo-700/60">
            <div className="flex items-center justify-between text-xs text-indigo-300 font-bold mb-1">
              <span className="flex items-center gap-1">
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
                <span>وفر التحويلات الداخلية</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-mono">
                {summary.transfersCount} صنف
              </span>
            </div>
            <div className="text-lg lg:text-xl font-black text-emerald-400 font-mono">
              {summary.transfersEstSavings.toLocaleString('ar-SA')} <span className="text-xs font-normal">ر.س</span>
            </div>
            <div className="text-[11px] text-emerald-300/90 font-bold mt-1">
              {summary.transfersSuggestedQty.toLocaleString('ar-SA')} قطعة منقولة دون دفع سيولة!
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
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
            <span>تم تعبئة الكمية الفعلية لـ {totalActualFilledCount} صنف</span>
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

      {/* Screen Filters Bar */}
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

          {/* Transfer Source Branch Filter */}
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
            المعروض: <span className="font-mono text-indigo-600 dark:text-indigo-400">{totalVisibleCount}</span> صنف
          </div>
        </div>
      </div>

      {/* Content Display: Render by Sections Sequentially */}
      <div className="space-y-6">
        {/* Section 1: Consumables */}
        {(activeTab === 'all' || activeTab === 'consumables') && (
          <div>
            {renderSectionTable('القسم الأول: الأصناف الاستهلاكية (فلاتر، بواجي، مساحات، كلبسات)', filteredConsumables, false, '1')}
          </div>
        )}

        {/* Section 2: Oils & Fluids */}
        {(activeTab === 'all' || activeTab === 'oils') && (
          <div className={activeTab === 'all' ? 'print-break-before' : ''}>
            {renderSectionTable('القسم الثاني: الزيوت والسوائل (محركات، قير، سوائل تبريد، فرامل، يوريا)', filteredOils, false, '2')}
          </div>
        )}

        {/* Section 3: Fast Moving Items */}
        {(activeTab === 'all' || activeTab === 'fastMoving') && (
          <div className={activeTab === 'all' ? 'print-break-before' : ''}>
            {renderSectionTable('القسم الثالث: الأصناف سريعة الدوران (القطع الميكانيكية والكهربائية ونظام التعليق)', filteredFastMoving, false, '3')}
          </div>
        )}

        {/* Section 4: Internal Transfers */}
        {(activeTab === 'all' || activeTab === 'transfers') && (
          <div className={activeTab === 'all' ? 'print-break-before' : ''}>
            {renderSectionTable('القسم الرابع: التحويلات المقترحة للأصناف الراكدة والفائضة من الفروع', filteredTransfers, true, '4')}
          </div>
        )}
      </div>

      {/* Formal Signatures and Approvals Block (Always at the end of print) */}
      <div className="hidden print:block pt-6 mt-6 border-t-2 border-slate-900 print-break-inside">
        <div className="text-[8pt] font-bold text-slate-700 mb-3 text-center">
          * ملحوظة: يُعتمد هذا الكشف كأمر تجهيز وتوريد مبدئي للفرع الجديد، ويتم تعبئة خانة "الكمية الفعلية المطلوبة" قبل إصدار أوامر الشراء وسندات التحويل الداخلي.
        </div>
        <div className="grid grid-cols-3 gap-6 text-center text-[9pt] font-bold pt-2">
          <div className="border border-slate-400 p-3 rounded-lg space-y-6">
            <p>إعداد ومطابقة البيانات</p>
            <p className="text-slate-500 text-[8pt]">إدارة ذكاء الأعمال (BI)</p>
            <div className="border-t border-slate-300 pt-1 text-[8pt]">التوقيع: ___________________</div>
          </div>
          <div className="border border-slate-400 p-3 rounded-lg space-y-6">
            <p>مراجعة وتحديد الكميات</p>
            <p className="text-slate-500 text-[8pt]">مسئول إدارة المشتريات</p>
            <div className="border-t border-slate-300 pt-1 text-[8pt]">التوقيع: ___________________</div>
          </div>
          <div className="border border-slate-400 p-3 rounded-lg space-y-6">
            <p>الموافقة النهائية والتعميد</p>
            <p className="text-slate-500 text-[8pt]">المدير العام / المالك</p>
            <div className="border-t border-slate-300 pt-1 text-[8pt]">التوقيع: ___________________</div>
          </div>
        </div>
      </div>
    </div>
  );
}
