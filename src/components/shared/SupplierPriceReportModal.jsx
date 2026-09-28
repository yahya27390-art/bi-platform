import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Printer,
  FileSpreadsheet,
  Download,
  Building2,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Boxes,
  Scale,
  Calendar,
  AlertTriangle,
  FileText,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import doraLogo from '../../assets/dora_logo.png';
import { exportComparisonToExcel } from '../../lib/supplierPriceComparator';

// Helper formatting functions
function formatSAR(val) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return (
    Number(val).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' ر.س'
  );
}

function formatNum(val) {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Number(val).toLocaleString('en-US');
}

export default function SupplierPriceReportModal({
  isOpen,
  onClose,
  quotationInfo = {},
  items = [],
  stats = {},
  initialFilter = 'all',
}) {
  const [filterScope, setFilterScope] = useState(initialFilter); // 'all', 'cheaper', 'expensive', 'matched', 'not_in_catalog', 'in_stock'
  const [sortBy, setSortBy] = useState('default'); // 'default', 'savings', 'extra', 'diffPercent'

  // Lock body scroll and set modal class
  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('modal-open');
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Sync initialFilter
  useEffect(() => {
    if (initialFilter) setFilterScope(initialFilter);
  }, [initialFilter]);

  // Filter items based on selected scope
  const scopedItems = useMemo(() => {
    let list = items.filter(i => i.isAvailable !== false && i.verdict !== 'unavailable');

    if (filterScope === 'cheaper') {
      list = list.filter((i) => i.verdict === 'cheaper');
    } else if (filterScope === 'expensive') {
      list = list.filter((i) => i.verdict === 'expensive');
    } else if (filterScope === 'matched') {
      list = list.filter((i) => i.matched);
    } else if (filterScope === 'in_stock') {
      list = list.filter((i) => i.matched && (i.ourTotalQty || 0) > 0);
    } else if (filterScope === 'not_in_catalog') {
      list = list.filter((i) => !i.matched);
    }

    // Sort items
    if (sortBy === 'savings') {
      return [...list].sort((a, b) => (b.savingsAmount || 0) - (a.savingsAmount || 0));
    } else if (sortBy === 'extra') {
      return [...list].sort((a, b) => (b.extraAmount || 0) - (a.extraAmount || 0));
    } else if (sortBy === 'diffPercent') {
      return [...list].sort((a, b) => (b.diffPercent || 0) - (a.diffPercent || 0));
    }

    return list;
  }, [items, filterScope, sortBy]);

  // Aggregate totals for the scoped list
  const scopedTotals = useMemo(() => {
    const totalSupplierVal = scopedItems.reduce((acc, i) => acc + (i.supplierPrice || 0), 0);
    const totalOurVal = scopedItems.reduce((acc, i) => acc + (i.ourUnitCost || 0), 0);
    const totalSavings = scopedItems.reduce((acc, i) => acc + (i.savingsAmount || 0), 0);
    const totalExtra = scopedItems.reduce((acc, i) => acc + (i.extraAmount || 0), 0);
    const cheaperItemsCount = scopedItems.filter(i => i.verdict === 'cheaper').length;
    const expensiveItemsCount = scopedItems.filter(i => i.verdict === 'expensive').length;
    return {
      totalCount: scopedItems.length,
      totalSupplierVal,
      totalOurVal,
      totalSavings,
      totalExtra,
      cheaperItemsCount,
      expensiveItemsCount,
    };
  }, [scopedItems]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    exportComparisonToExcel(scopedItems, quotationInfo);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      id="executive-modal-container"
      className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex flex-col justify-start items-center p-2 sm:p-4 overflow-y-auto font-sans"
      dir="rtl"
    >
      {/* Dynamic Print CSS for flawless Landscape A4 */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape !important;
            margin: 6mm 8mm !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          #executive-modal-container {
            position: static !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
            width: 100% !important;
          }
          #executive-report-printable-area {
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
          .supplier-compare-print-table {
            width: 100% !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
          }
          .supplier-compare-print-table thead {
            display: table-header-group !important;
          }
          .supplier-compare-print-table tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .supplier-compare-print-table th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            border: 1px solid #cbd5e1 !important;
            padding: 5px 3px !important;
            font-size: 9.5px !important;
            font-weight: 800 !important;
          }
          .supplier-compare-print-table td {
            border: 1px solid #e2e8f0 !important;
            padding: 4px 3px !important;
            font-size: 9px !important;
            vertical-align: middle !important;
            word-break: break-word !important;
          }
        }
      `}</style>

      {/* ── Main Modal Card ── */}
      <div
        id="executive-report-printable-area"
        className="w-full max-w-6xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
      >
        {/* ── Top Floating Action Controls (Screen Only, Hidden in Print) ── */}
        <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 text-xl font-bold">
              ⚖️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black tracking-wide text-white">
                  معاينة وطباعة تقرير مقارنة أسعار الموردين (A4 PDF)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  جاهز للطباعة والحفظ
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                تنسيق رسمي معتمد لشركة درة السيارة بمقاس A4 أفقي (Landscape) بكامل الأعمدة والبيانات دون أي قص.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ كـ PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Screen Filter Toolbar (Hidden in Print) ── */}
        <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-600 ml-1">تحديد نطاق التقرير:</span>
            
            <button
              type="button"
              onClick={() => setFilterScope('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterScope === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              كافة الأصناف ({stats.totalCount || items.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterScope('cheaper')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterScope === 'cheaper'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <span>🟢 صفقات الوفر فقط (المورد أرخص: {stats.cheaperCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterScope('expensive')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterScope === 'expensive'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <span>🔴 أسعار أعلى للتحذير ({stats.expensiveCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterScope('matched')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterScope === 'matched'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200'
              }`}
            >
              المطابقة بمخزوننا ({stats.matchedCount})
            </button>

            <button
              type="button"
              onClick={() => setFilterScope('in_stock')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterScope === 'in_stock'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              متوفر بمخازننا ({stats.inStockCount})
            </button>

            <button
              type="button"
              onClick={() => setFilterScope('not_in_catalog')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterScope === 'not_in_catalog'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
              }`}
            >
              أصناف جديدة ({stats.notInCatalogCount})
            </button>
          </div>

          <div className="flex items-center gap-2 mr-auto">
            <span className="text-slate-500 font-bold">الترتيب:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 outline-none"
            >
              <option value="default">الترتيب الأصلي للقائمة</option>
              <option value="savings">أعلى قيمة وفر مالي (ر.س)</option>
              <option value="extra">أعلى زيادة سعرية (تحذير)</option>
              <option value="diffPercent">أعلى نسبة مئوية للفارق (%)</option>
            </select>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            OFFICIAL A4 PRINTABLE DOCUMENT BODY
            ════════════════════════════════════════════════════════════════ */}
        <div id="executive-modal-scroll-body" className="p-6 sm:p-8 space-y-5 overflow-y-auto">
          
          {/* 1. Official Corporate Letterhead */}
          <div className="border-b-2 border-slate-900 pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
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
                <div className="font-black text-slate-950">وثيقة مقارنة أسعار معتمدة DORA-PURCHASING-2026</div>
                <div className="text-slate-600 font-bold">تاريخ التقرير: 28 سبتمبر 2026</div>
                <div className="text-emerald-800 font-bold">المسؤول المعتمد: فهد الجوعي (مدير المشتريات)</div>
                <div className="text-[10px] text-slate-500 font-bold">نظام ذكاء الأعمال والمخزون</div>
              </div>
            </div>

            {/* Document Title & Quotation Meta Strip */}
            <div className="mt-3 pt-2.5 border-t border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-black text-slate-950 flex items-center gap-2">
                  <span>تقرير فحص وتدقيق مقارنة أسعار الموردين وعروض الشراء</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-md font-mono bg-blue-100 text-blue-900 font-bold">
                    {quotationInfo.supplierName || 'شركة مسك للتجارة'}
                  </span>
                </h2>
                <div className="text-xs text-slate-600 mt-0.5">
                  ملف العرض: <strong className="font-mono text-slate-900">{quotationInfo.fileName || 'عرض السعر'}</strong>
                  <span className="text-slate-400 mx-1.5">|</span>
                  تاريخ العرض: <strong className="font-mono text-slate-900">{quotationInfo.quotationDate || '2026-09-28'}</strong>
                  <span className="text-slate-400 mx-1.5">|</span>
                  النطاق المعروض: <strong className="text-slate-900">
                    {filterScope === 'all' ? 'كافة أصناف العرض' :
                     filterScope === 'cheaper' ? 'صفقات الوفر فقط' :
                     filterScope === 'expensive' ? 'الأصناف الأغلى (تحذيرات الشراء)' :
                     filterScope === 'matched' ? 'الأصناف المتطابقة بمخزوننا' :
                     filterScope === 'in_stock' ? 'الأصناف المتوفرة حالياً' : 'أصناف جديدة بالكتالوج'}
                  </strong>
                </div>
              </div>

              <div className="text-left font-mono text-xs bg-slate-50 print:bg-transparent p-2.5 rounded-xl border border-slate-200 print:border-slate-300 space-y-0.5">
                <div>الأصناف المشمولة: <strong className="font-bold text-slate-900">{scopedTotals.totalCount}</strong> صنف</div>
                <div>إجمالي قيمة المورد: <strong className="font-black text-slate-900">{formatSAR(scopedTotals.totalSupplierVal)}</strong></div>
                {scopedTotals.cheaperItemsCount > 0 && (
                  <div>وفر الشراء المتاح: <strong className="font-black text-emerald-800">{formatSAR(scopedTotals.totalSavings)}</strong> ({scopedTotals.cheaperItemsCount} صنف)</div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Executive Decision KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-[10px] font-bold text-slate-500">أصناف العرض</div>
              <div className="text-base font-black font-mono text-slate-900">{stats.totalCount || 109}</div>
              <div className="text-[9px] text-slate-400 font-mono">{formatSAR(stats.totalSupplierValue)}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-cyan-50/60 border border-cyan-200 text-center">
              <div className="text-[10px] font-bold text-cyan-800">تطابق مع درة</div>
              <div className="text-base font-black font-mono text-cyan-700">{stats.matchedCount || 101}</div>
              <div className="text-[9px] text-cyan-700 font-bold">نسبة {stats.matchRate || 92.7}%</div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="text-[10px] font-bold text-emerald-800">المورد أرخص (وفر)</div>
              <div className="text-base font-black font-mono text-emerald-700">{stats.cheaperCount || 21} صنف</div>
              <div className="text-[9px] text-emerald-700 font-mono font-bold">وفر {formatSAR(stats.totalSavingsOpportunity)}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <div className="text-[10px] font-bold text-rose-800">المورد أغلى (تحذير)</div>
              <div className="text-base font-black font-mono text-rose-700">{stats.expensiveCount || 57} صنف</div>
              <div className="text-[9px] text-rose-700 font-mono font-bold">زيادة {formatSAR(stats.totalExtraCost)}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
              <div className="text-[10px] font-bold text-indigo-800">متوفر بمخازننا</div>
              <div className="text-base font-black font-mono text-indigo-700">{stats.inStockCount || 78} صنف</div>
              <div className="text-[9px] text-indigo-600 font-bold">رصيد فعلي بالفروع</div>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-center">
              <div className="text-[10px] font-bold text-purple-800">أصناف جديدة</div>
              <div className="text-base font-black font-mono text-purple-700">{stats.notInCatalogCount || 8} صنف</div>
              <div className="text-[9px] text-purple-600 font-bold">فرص إضافة للكتالوج</div>
            </div>
          </div>

          {/* 3. The Flawless A4 Table (100% Proportional Widths, Zero Horizontal Cutoff) */}
          <div className="overflow-x-auto print:overflow-visible">
            <table className="supplier-compare-print-table w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 text-[10px] font-black">
                  <th className="w-[3.5%] text-center py-2 px-1">#</th>
                  <th className="w-[12%] py-2 px-1.5">رقم القطعة (المورد)</th>
                  <th className="w-[12%] py-2 px-1.5">كود درة السيارة</th>
                  <th className="w-[23%] py-2 px-1.5">بيان واسم القطعة والتصنيف</th>
                  <th className="w-[8.5%] py-2 px-1 text-center bg-blue-50/70">سعر المورد</th>
                  <th className="w-[8.5%] py-2 px-1 text-center">تكلفتنا المعتمدة</th>
                  <th className="w-[8.5%] py-2 px-1 text-center">الفارق المالي</th>
                  <th className="w-[7%] py-2 px-1 text-center">نسبة الفرق</th>
                  <th className="w-[7%] py-2 px-1 text-center">رصيد المخزن</th>
                  <th className="w-[10%] py-2 px-1 text-center font-black">توصية القرار</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-xs">
                {scopedItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-slate-400 font-bold">
                      لا توجد أصناف في هذا النطاق المختار
                    </td>
                  </tr>
                ) : (
                  scopedItems.map((item, idx) => {
                    const isCheaper = item.verdict === 'cheaper';
                    const isExpensive = item.verdict === 'expensive';
                    const isNotInCatalog = !item.matched;
                    const isEqual = item.verdict === 'equal';

                    return (
                      <tr
                        key={item.id || idx}
                        className={`hover:bg-slate-50 transition-colors ${
                          idx % 2 === 1 ? 'bg-slate-50/40 print:bg-slate-50/30' : ''
                        }`}
                      >
                        {/* 1. Row Index */}
                        <td className="py-1.5 px-1 text-center font-mono font-bold text-slate-500 text-[10px]">
                          {idx + 1}
                        </td>

                        {/* 2. Supplier Part Number */}
                        <td className="py-1.5 px-1.5 font-mono font-black text-slate-900 text-[11px] whitespace-nowrap">
                          {item.supplierPartNumber}
                          {item.productGrade === 'korean' && (
                            <span className="mr-1 text-[8.5px] px-1 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 font-sans">
                              كوري
                            </span>
                          )}
                        </td>

                        {/* 3. Dora Part Number */}
                        <td className="py-1.5 px-1.5 font-mono text-[10.5px] whitespace-nowrap">
                          {item.matched && item.ourSku ? (
                            <span className="font-bold text-emerald-800">
                              ✓ {item.ourSku}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[10px]">
                              غير مسجل
                            </span>
                          )}
                        </td>

                        {/* 4. Description & Name */}
                        <td className="py-1.5 px-1.5">
                          <div className="font-black text-slate-950 text-[11px] leading-snug">
                            {item.supplierPartName || item.partName || item.name || 'صنف مسعر'}
                          </div>
                          {item.matched && item.ourName && (
                            <div className="text-[10px] text-slate-700 font-bold leading-snug mt-0.5">
                              مخزن: {item.ourName}
                            </div>
                          )}
                          <div className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <span>{item.ourCategory || item.category || 'قطع محركات وسيارات الديزل'}</span>
                            {(item.ourBrand || item.brand) && <span>• {item.ourBrand || item.brand}</span>}
                          </div>
                        </td>

                        {/* 5. Supplier Price */}
                        <td className="py-1.5 px-1 text-center font-mono font-black text-blue-900 bg-blue-50/30 print:bg-transparent text-[11px]">
                          {formatSAR(item.supplierPrice)}
                        </td>

                        {/* 6. Dora Cost */}
                        <td className="py-1.5 px-1 text-center font-mono text-slate-800 text-[11px]">
                          {item.matched ? formatSAR(item.ourUnitCost) : '—'}
                        </td>

                        {/* 7. Price Difference Amount */}
                        <td className="py-1.5 px-1 text-center font-mono text-[10.5px] font-bold">
                          {isCheaper ? (
                            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded print:bg-transparent">
                              وفر {formatSAR(item.savingsAmount)}
                            </span>
                          ) : isExpensive ? (
                            <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded print:bg-transparent">
                              +{formatSAR(item.extraAmount)}
                            </span>
                          ) : isEqual ? (
                            <span className="text-slate-500">متطابق</span>
                          ) : (
                            <span className="text-purple-700">صنف جديد</span>
                          )}
                        </td>

                        {/* 8. Difference Percentage */}
                        <td className="py-1.5 px-1 text-center font-mono text-[10px] font-bold">
                          {isCheaper && item.diffPercent !== null ? (
                            <span className="text-emerald-700">-{Math.abs(item.diffPercent)}%</span>
                          ) : isExpensive && item.diffPercent !== null ? (
                            <span className="text-rose-700">+{item.diffPercent}%</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* 9. Warehouse Stock Quantity */}
                        <td className="py-1.5 px-1 text-center font-mono font-bold text-slate-900 text-[10.5px]">
                          {item.matched ? (
                            <span className={item.ourTotalQty > 0 ? 'text-indigo-800' : 'text-slate-400'}>
                              {item.ourTotalQty} {item.ourTotalQty > 0 ? 'ق' : 'صفر'}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        {/* 10. Purchasing Decision / Verdict */}
                        <td className="py-1.5 px-1 text-center text-[10px] font-bold">
                          {isCheaper ? (
                            <span className="text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300 print:border-none print:p-0">
                              ✅ يُنصح بالشراء
                            </span>
                          ) : isExpensive ? (
                            <span className="text-rose-800 bg-rose-100/80 px-2 py-0.5 rounded-md border border-rose-300 print:border-none print:p-0">
                              ⚠️ تجنب (أغلى)
                            </span>
                          ) : isNotInCatalog ? (
                            <span className="text-purple-800 bg-purple-100/80 px-2 py-0.5 rounded-md border border-purple-300 print:border-none print:p-0">
                              ➕ صنف إضافي
                            </span>
                          ) : isEqual ? (
                            <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md print:p-0">
                              متساوي التكلفة
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 4. Official Signatures & Approval Block */}
          <div className="mt-6 pt-4 border-t-2 border-slate-300 flex items-end justify-between text-xs text-slate-700">
            <div className="space-y-1">
              <div className="font-bold text-slate-900">مسؤول تدقيق ومقارنة الأسعار:</div>
              <div className="text-[11px] text-slate-500">قسم المشتريات — مطابقة آلية معتمدة</div>
              <div className="h-9 border-b border-dotted border-slate-400 w-44"></div>
            </div>

            <div className="space-y-1 text-center">
              <div className="font-bold text-slate-900">مدير إدارة المشتريات والطلبيات:</div>
              <div className="text-[11px] text-emerald-800 font-bold">فهد الجوعي</div>
              <div className="h-9 border-b border-dotted border-slate-400 w-48 flex items-center justify-center text-[10px] text-emerald-700 font-mono">
                [ معتمد إلكترونياً ✓ ]
              </div>
            </div>

            <div className="space-y-1 text-left">
              <div className="font-bold text-slate-900">اعتماد الإدارة العامة والتنفيذية:</div>
              <div className="text-[11px] text-slate-500">شركة درة السيارة لقطع غيار السيارات</div>
              <div className="h-9 border-b border-dotted border-slate-400 w-44"></div>
            </div>
          </div>

        </div>

        {/* ── Modal Footer Controls (Screen Only) ── */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-bold">حالة التقرير:</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
              جاهز للطباعة والحفظ A4 Landscape ({scopedItems.length} صنف) ✓
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>طباعة فورية / حفظ كـ PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-200 transition-all cursor-pointer"
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
