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
  RotateCcw,
  MapPin,
  Calendar,
  ShieldCheck,
  FileText,
  BadgeCheck,
  UserCheck
} from 'lucide-react';
import requisitionData from '../data/newBranchRequisitionData.json';
import doraLogo from '../assets/dora_logo.png';

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

  // Section Table Component
  const renderSectionTable = (title, items, isTransfer = false, sectionNumber = '') => {
    if (items.length === 0) return null;

    const totalSectionSuggestedQty = items.reduce((s, i) => s + (i.suggestedQty || 0), 0);
    const totalSectionCost = items.reduce((s, i) => s + (i.estCost || 0), 0);

    return (
      <div className="section-block mb-6 print:mb-4 print:break-inside-avoid">
        {/* Section Header */}
        <div className="bg-slate-100 dark:bg-slate-800/80 print:bg-[#f1f5f9] border border-slate-300 dark:border-slate-700 print:border-[#94a3b8] px-4 py-2 flex items-center justify-between mb-2 rounded-xl print:rounded-none">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#1e293b] text-white flex items-center justify-center text-[10px] font-bold font-mono">
              {sectionNumber}
            </span>
            <h2 className="font-black text-sm lg:text-base text-slate-900 dark:text-white print:text-[#0f172a]">
              {title}
            </h2>
            <span className="text-xs text-slate-500 font-bold">
              ({items.length} صنف)
            </span>
          </div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 print:text-[#0f172a] flex items-center gap-4">
            <span>إجمالي الكميات: <strong className="font-mono text-[#0f172a]">{totalSectionSuggestedQty.toLocaleString('ar-SA')}</strong></span>
            <span>{isTransfer ? 'إجمالي الوفر: ' : 'الميزانية التقديرية: '}<strong className="font-mono text-[#047857]">{totalSectionCost.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س</strong></span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-right border-collapse print-table">
            <thead>
              <tr className="bg-[#f8fafc] dark:bg-slate-800 print:bg-[#f1f5f9] text-[10.5px] print:text-[8pt] font-black text-slate-800 dark:text-slate-200 print:text-[#0f172a] border border-[#94a3b8]">
                <th className="py-2 px-1 w-[3%] text-center border-l border-[#94a3b8]">م</th>
                <th className="py-2 px-2 w-[14%] border-l border-[#94a3b8]">رقم الصنف (SKU)</th>
                <th className="py-2 px-2.5 w-[25%] border-l border-[#94a3b8]">اسم وتوصيف الصنف</th>
                <th className="py-2 px-1.5 w-[8%] border-l border-[#94a3b8] text-center">الماركة</th>
                <th className="py-2 px-2 w-[9%] text-center border-l border-[#94a3b8] bg-amber-50/60 print:bg-slate-50">
                  آخر سعر (ر.س)
                </th>
                <th className="py-2 px-2 w-[8%] text-center border-l border-[#94a3b8]">
                  {isTransfer ? 'رصيد المصدر' : 'رصيد الفروع'}
                </th>
                <th className="py-2 px-2 w-[9%] text-center border-l border-[#94a3b8] bg-indigo-50/60 print:bg-slate-50">
                  الكمية المقترحة
                </th>
                <th className="py-2 px-2 w-[11%] text-center border-l border-[#94a3b8] bg-emerald-50/80 print:bg-white text-emerald-950 font-black">
                  الكمية الفعلية المطلوبة
                </th>
                <th className="py-2 px-2 w-[13%] text-center">
                  {isTransfer ? 'الفرع المحول منه' : 'مصدر التوفير'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-[#cbd5e1] text-[11px] print:text-[7.5pt]">
              {items.map((item, idx) => {
                const currentActual = actualQuantities[item.sku] !== undefined ? actualQuantities[item.sku] : '';
                return (
                  <tr
                    key={item.sku}
                    className={`border border-[#cbd5e1] ${
                      idx % 2 === 1 ? 'bg-slate-50/60 dark:bg-slate-900/40 print:bg-[#f8fafc]' : 'bg-white dark:bg-slate-900 print:bg-white'
                    }`}
                  >
                    <td className="py-1.5 px-1 text-center font-mono text-slate-500 print:text-[#334155] border-l border-[#cbd5e1]">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 px-2 font-mono font-bold text-slate-900 dark:text-slate-100 print:text-[#0f172a] border-l border-[#cbd5e1]">
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
                    <td className="py-1.5 px-2.5 font-bold text-slate-800 dark:text-slate-100 print:text-[#0f172a] border-l border-[#cbd5e1] leading-snug">
                      <div>{item.name}</div>
                      <div className="text-[9.5px] print:text-[6.5pt] text-slate-400 print:text-[#64748b] font-normal">{item.subType}</div>
                    </td>
                    <td className="py-1.5 px-1.5 text-slate-600 dark:text-slate-300 print:text-[#334155] border-l border-[#cbd5e1] text-center">
                      {item.brand}
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono font-bold text-amber-700 dark:text-amber-400 print:text-[#0f172a] border-l border-[#cbd5e1]">
                      {item.unitCost.toFixed(2)}
                    </td>
                    <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-700 dark:text-slate-300 print:text-[#334155] border-l border-[#cbd5e1]">
                      {isTransfer ? item.sourceQty : item.totalStock}
                    </td>
                    <td className="py-1.5 px-2 text-center border-l border-[#cbd5e1]">
                      <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 print:bg-transparent text-indigo-900 dark:text-indigo-200 print:text-[#0f172a] font-mono font-black text-xs print:text-[8pt]">
                        {item.suggestedQty}
                      </span>
                    </td>
                    <td className="py-1 px-1.5 text-center border-l border-[#cbd5e1] bg-emerald-50/40 dark:bg-emerald-950/20 print:bg-white">
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
                      <div className="hidden print:block font-mono font-bold text-[8.5pt] h-5 leading-5 border border-[#94a3b8] rounded bg-white text-center">
                        {currentActual !== '' ? currentActual : ''}
                      </div>
                    </td>
                    <td className="py-1.5 px-2 text-center text-xs print:text-[7pt] print:text-[#334155]">
                      {isTransfer ? (
                        <span className="font-bold text-purple-700 dark:text-purple-300 print:text-[#475569]">
                          {item.sourceBranch}
                        </span>
                      ) : (
                        <span className="text-slate-600 dark:text-slate-400 print:text-[#475569]">
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
    <div className="space-y-6 print:space-y-0 print:p-0 text-slate-800 dark:text-slate-100" dir="rtl">
      {/* Strict Corporate Print CSS */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 6mm 10mm 6mm;
          }
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background: #ffffff !important;
            color: #0f172a !important;
            font-size: 8pt !important;
            font-family: 'Cairo', system-ui, -apple-system, sans-serif !important;
          }
          .no-print, header, nav, aside, .bi-main-content > header, button, .tabs-bar, .filters-bar {
            display: none !important;
          }
          .cover-card-print {
            background-color: #ffffff !important;
            border: 2px solid #0f172a !important;
            color: #0f172a !important;
            box-shadow: none !important;
            page-break-after: always !important;
            height: 94vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            padding: 24px !important;
            margin: 0 !important;
            box-sizing: border-box !important;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
          }
          .print-table th, .print-table td {
            border: 1px solid #94a3b8 !important;
            padding: 3px 4px !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            word-break: break-word !important;
          }
          .print-table th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
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

      {/* ============================================================== */}
      {/* 🌟 1. LUXURY EXECUTIVE COVER PAGE (صفحة الغلاف والمقدمة)        */}
      {/* ============================================================== */}
      <div className="cover-card-print bg-gradient-to-bl from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 lg:p-10 shadow-2xl border border-indigo-900/50 relative overflow-hidden">
        {/* Glow ambient effects (screen only) */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />

        {/* Top Header Block: Official Logo & Identity */}
        <div>
          <div className="flex items-center justify-between border-b-2 border-indigo-500/30 print:border-[#0f172a] pb-4 mb-5">
            {/* Right: Company Name & Brand */}
            <div className="flex items-center gap-3.5">
              <img
                src={doraLogo}
                alt="شعار شركة درة السيارة"
                className="w-14 h-14 object-contain print:w-16 print:h-16"
              />
              <div>
                <h1 className="text-xl lg:text-2xl font-black tracking-tight text-white print:text-[#0f172a]">
                  شركة درة السيارة للتجارة
                </h1>
                <p className="text-xs font-bold text-indigo-300 print:text-[#475569]">
                  قطاع قطع غيار السيارات الكورية والأصلية (هيونداي / كيا / موبيس / ديزل)
                </p>
              </div>
            </div>

            {/* Left: Document Metadata & Branch Badge */}
            <div className="text-left space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 print:bg-[#ecfdf5] print:text-[#065f46] print:border print:border-[#a7f3d0] font-bold text-xs">
                <BadgeCheck className="w-4 h-4 text-emerald-400 print:text-[#059669]" />
                <span>وثيقة تعميد وتجهيز رسمية معتمدة</span>
              </div>
              <div className="text-[11px] font-mono text-slate-300 print:text-[#475569]">
                رقم المرجع: <span className="font-bold print:text-[#0f172a]">DORA-REQ-ONAIZAH-2026</span>
              </div>
              <div className="text-[11px] font-mono text-slate-300 print:text-[#475569]">
                تاريخ الإصدار: <span className="font-bold print:text-[#0f172a]">{new Date().toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          </div>

          {/* Grand Title & Branch Hero Banner */}
          <div className="bg-indigo-900/40 print:bg-[#f8fafc] border border-indigo-500/40 print:border-[#94a3b8] rounded-2xl p-5 mb-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 text-amber-400 print:text-[#b45309] text-xs font-black">
                  <Store className="w-4 h-4" />
                  <span>مشروع التوسع وافتتاح الفروع الجديدة لعام 2026</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-white print:text-[#0f172a] flex items-center gap-3">
                  <span>كشف طلبيات وافتتاح:</span>
                  <span className="text-amber-400 print:text-[#1e3a8a] underline decoration-indigo-400 underline-offset-4">
                    فرع محافظة عنيزة
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-lg bg-indigo-600 print:bg-[#0f172a] text-white font-normal">
                    (مستودع 400 - فرع عنيزة الجديد)
                  </span>
                </h2>
                <p className="text-xs lg:text-sm text-slate-200 print:text-[#334155] leading-relaxed max-w-4xl">
                  خطة متكاملة لتجهيز الفرع الجديد بمخزون افتتاحي شامل يضم <strong>950 صنفاً استراتيجياً</strong>، تم احتساب كمياتها بدقة لتتناسب مع معدلات السحب الحقيقية وحصص الفروع القائمة، مع تفعيل <strong>التحويلات الداخلية من الفروع الفائضة</strong> لخفض ميزانية التأسيس وتسييل الركود.
                </p>
              </div>

              {/* Branch Quick Highlights */}
              <div className="shrink-0 space-y-1 text-right md:text-left text-xs text-slate-300 print:text-[#0f172a] font-bold bg-slate-900/60 print:bg-[#ffffff] p-3 rounded-xl border border-slate-700/60 print:border-[#cbd5e1]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 print:text-[#e11d48]" />
                  <span>الموقع: منطقة القصيم — محافظة عنيزة</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400 print:text-[#4f46e5]" />
                  <span>التبعية: شبكة فروع شركة درة السيارة</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 print:text-[#059669]" />
                  <span>نطاق التغطية: تشكيلة 100% مطابقة للموديلات</span>
                </div>
              </div>
            </div>
          </div>

          {/* Executive Strategy Matrix (الأقسام الأربعة التنفيذية) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-right mb-5">
            {/* 1. Consumables */}
            <div className="bg-slate-800/80 print:bg-[#ffffff] p-3.5 rounded-2xl border border-slate-700/80 print:border-[#94a3b8]">
              <div className="flex items-center justify-between text-xs text-slate-400 print:text-[#475569] font-black mb-1">
                <span>1. الأصناف الاستهلاكية</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 print:bg-[#f1f5f9] print:text-[#0f172a] font-mono font-bold">
                  {summary.consumablesCount} صنف
                </span>
              </div>
              <div className="text-xl font-black text-white print:text-[#0f172a] font-mono">
                {summary.consumablesEstCost.toLocaleString('ar-SA')} <span className="text-xs font-normal">ر.س</span>
              </div>
              <div className="text-[11px] text-emerald-400 print:text-[#047857] font-bold mt-1">
                {summary.consumablesSuggestedQty.toLocaleString('ar-SA')} قطعة متناسبة
              </div>
              <p className="text-[9.5px] print:text-[7pt] text-slate-400 print:text-[#64748b] mt-1">
                فلاتر، فحمات، بواجي، مساحات، كلبسات تغطي كافة الموديلات.
              </p>
            </div>

            {/* 2. Oils & Fluids */}
            <div className="bg-slate-800/80 print:bg-[#ffffff] p-3.5 rounded-2xl border border-slate-700/80 print:border-[#94a3b8]">
              <div className="flex items-center justify-between text-xs text-slate-400 print:text-[#475569] font-black mb-1">
                <span>2. الزيوت والسوائل</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 print:bg-[#f1f5f9] print:text-[#0f172a] font-mono font-bold">
                  {summary.oilsCount} صنف
                </span>
              </div>
              <div className="text-xl font-black text-white print:text-[#0f172a] font-mono">
                {summary.oilsEstCost.toLocaleString('ar-SA')} <span className="text-xs font-normal">ر.س</span>
              </div>
              <div className="text-[11px] text-blue-400 print:text-[#1d4ed8] font-bold mt-1">
                {summary.oilsSuggestedQty.toLocaleString('ar-SA')} لتر/عبوة توريد جديد
              </div>
              <p className="text-[9.5px] print:text-[7pt] text-slate-400 print:text-[#64748b] mt-1">
                زيوت محركات 5W30، 10W40 ديزل، قير ATF، كولانت، يوريا.
              </p>
            </div>

            {/* 3. Fast Moving */}
            <div className="bg-slate-800/80 print:bg-[#ffffff] p-3.5 rounded-2xl border border-slate-700/80 print:border-[#94a3b8]">
              <div className="flex items-center justify-between text-xs text-slate-400 print:text-[#475569] font-black mb-1">
                <span>3. سريعة الدوران</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 print:bg-[#f1f5f9] print:text-[#0f172a] font-mono font-bold">
                  {summary.fastMovingCount} صنف
                </span>
              </div>
              <div className="text-xl font-black text-white print:text-[#0f172a] font-mono">
                {summary.fastMovingEstCost.toLocaleString('ar-SA')} <span className="text-xs font-normal">ر.س</span>
              </div>
              <div className="text-[11px] text-amber-400 print:text-[#b45309] font-bold mt-1">
                {summary.fastMovingSuggestedQty.toLocaleString('ar-SA')} قطعة طلب شراء
              </div>
              <p className="text-[9.5px] print:text-[7pt] text-slate-400 print:text-[#64748b] mt-1">
                جلب مقصات، كراسي، كويلات، سيور، أذرعة، طلمبات ماء.
              </p>
            </div>

            {/* 4. Internal Transfers Savings */}
            <div className="bg-indigo-950 print:bg-[#ffffff] p-3.5 rounded-2xl border-2 border-emerald-500/60 print:border-[#047857]">
              <div className="flex items-center justify-between text-xs text-indigo-300 print:text-[#0f172a] font-black mb-1">
                <span className="flex items-center gap-1">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400 print:text-[#047857]" />
                  <span>4. التحويلات الداخلية</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 print:bg-[#ecfdf5] print:text-[#065f46] print:border print:border-[#a7f3d0] font-mono font-bold">
                  {summary.transfersCount} صنف
                </span>
              </div>
              <div className="text-xl font-black text-emerald-400 print:text-[#047857] font-mono">
                {summary.transfersEstSavings.toLocaleString('ar-SA')} <span className="text-xs font-normal">ر.س</span>
              </div>
              <div className="text-[11px] text-emerald-300 print:text-[#047857] font-bold mt-1">
                وفر نقدي مباشر 100% دون دفع سيولة!
              </div>
              <p className="text-[9.5px] print:text-[7pt] text-slate-300 print:text-[#64748b] mt-1">
                تحويل 556 قطعة راكدة من الرئيسي، الرواف، والسليم لفرع عنيزة.
              </p>
            </div>
          </div>

          {/* Opening Requisition Financial Totals Banner */}
          <div className="bg-slate-900/90 print:bg-[#f8fafc] border border-slate-700/80 print:border-[#94a3b8] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-bold text-slate-300 print:text-[#0f172a]">
            <div>
              <span className="text-slate-400 print:text-[#475569]">إجمالي الأصناف المعتمدة للكشف: </span>
              <strong className="text-base text-white print:text-[#0f172a] font-mono font-black">{summary.totalItems} صنفاً</strong>
              <span className="mx-2">|</span>
              <span className="text-slate-400 print:text-[#475569]">إجمالي القطع المقترحة: </span>
              <strong className="text-base text-white print:text-[#0f172a] font-mono font-black">{summary.totalCombinedQty.toLocaleString('ar-SA')} قطعة</strong>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 print:text-[#475569]">صافي الميزانية الجديدة المطلوبة للموردين:</div>
                <div className="text-lg font-black text-amber-400 print:text-[#0f172a] font-mono">
                  {summary.totalNewPurchaseCost.toLocaleString('ar-SA')} ر.س
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Screen Action Bar (Buttons) */}
        <div className="pt-6 mt-6 border-t border-indigo-900/40 flex flex-wrap items-center justify-end gap-3 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
            title="طباعة تقرير الكشف الرسمي كـ PDF أو ورقي"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة كشف فرع عنيزة (PDF)</span>
          </button>

          <a
            href="/downloads/كشف_طلبية_وافتتاح_الفرع_الجديد_درة_السيارات.xlsx"
            download="كشف_طلبية_وافتتاح_الفرع_الجديد_درة_السيارات.xlsx"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2"
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
            <span>{savedSuccess ? 'تم الحفظ ✓' : 'حفظ الكميات'}</span>
          </button>
        </div>

        {/* Cover Page Bottom Approval Signatures (Print Only) */}
        <div className="hidden print:block pt-5 border-t-2 border-[#0f172a] mt-4">
          <div className="grid grid-cols-3 gap-6 text-center text-[9pt] font-bold text-[#0f172a]">
            <div className="border border-[#94a3b8] p-3 rounded-xl space-y-5 bg-white">
              <p className="font-black">إعداد ومطابقة البيانات</p>
              <p className="text-[#475569] text-[8pt]">إدارة ذكاء الأعمال والتحليل المالي (BI)</p>
              <div className="border-t border-[#cbd5e1] pt-1 text-[8pt]">التوقيع: ___________________</div>
            </div>
            <div className="border border-[#94a3b8] p-3 rounded-xl space-y-5 bg-white">
              <p className="font-black">مراجعة وتحديد كميات المشتريات</p>
              <p className="text-[#475569] text-[8pt]">مسئول إدارة المشتريات والتوريد</p>
              <div className="border-t border-[#cbd5e1] pt-1 text-[8pt]">التوقيع: ___________________</div>
            </div>
            <div className="border border-[#94a3b8] p-3 rounded-xl space-y-5 bg-white">
              <p className="font-black">الموافقة النهائية والتعميد</p>
              <p className="text-[#475569] text-[8pt]">المدير العام / مالك الشركة</p>
              <div className="border-t border-[#cbd5e1] pt-1 text-[8pt]">التوقيع: ___________________</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Screen Only) */}
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
            <span>📑 كشف فرع عنيزة الشامل ({summary.totalItems})</span>
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

      {/* Screen Filters Bar (Screen Only) */}
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

      {/* ============================================================== */}
      {/* 📋 2. TABLES CONTENT BY SECTIONS (جداول الكشف للأقسام الأربعة) */}
      {/* ============================================================== */}
      <div className="space-y-6">
        {/* Section 1: Consumables */}
        {(activeTab === 'all' || activeTab === 'consumables') && (
          <div className={activeTab === 'all' ? 'print-break-before' : ''}>
            {renderSectionTable('القسم الأول: الأصناف الاستهلاكية لفرع عنيزة (فلاتر، فحمات، بواجي، مساحات، كلبسات)', filteredConsumables, false, '1')}
          </div>
        )}

        {/* Section 2: Oils & Fluids */}
        {(activeTab === 'all' || activeTab === 'oils') && (
          <div className={activeTab === 'all' ? 'print-break-before' : ''}>
            {renderSectionTable('القسم الثاني: الزيوت والسوائل المعتمدة (محركات، قير، سوائل تبريد، فرامل، يوريا)', filteredOils, false, '2')}
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
            {renderSectionTable('القسم الرابع: التحويلات الداخلية المقترحة من الفروع إلى فرع عنيزة (فائض المخزون الراكد)', filteredTransfers, true, '4')}
          </div>
        )}
      </div>
    </div>
  );
}
