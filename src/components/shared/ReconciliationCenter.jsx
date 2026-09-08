import React, { useState } from 'react';
import { formatSAR } from '../../lib/kpiEngine';
import {
  ShieldCheck, AlertTriangle, CheckCircle2, ArrowRightLeft,
  FileText, Calendar, Store, RotateCcw, Building2, CreditCard, ChevronDown
} from 'lucide-react';
import { DORA_RECONCILIATION_LOGS, DORA_PERIODS } from '../../data/doraSchema';
import { useCurrentPeriod } from '../../context/BIPeriodContext';

function getLogMeta(log) {
  switch (log.id) {
    case 'rec-aug-01':
      return {
        shortTitle: 'مبيعات الفروع الإجمالية (Gross)',
        heroAmount: 1104900.66,
        icon: <Store className="w-4 h-4 text-blue-600" />,
        documentId: 'doc-aug-07',
      };
    case 'rec-aug-02':
      return {
        shortTitle: 'مردودات مبيعات الفروع (Returns)',
        heroAmount: 115378.50,
        icon: <RotateCcw className="w-4 h-4 text-rose-600" />,
        documentId: 'doc-aug-08',
      };
    case 'rec-aug-03':
      return {
        shortTitle: 'التحويلات البنكية المباشرة',
        heroAmount: 130931.08,
        icon: <Building2 className="w-4 h-4 text-indigo-600" />,
        documentId: 'doc-aug-09',
      };
    case 'rec-aug-04':
      return {
        shortTitle: 'أقساط تابي وتمارا',
        heroAmount: 93627.00,
        icon: <CreditCard className="w-4 h-4 text-amber-600" />,
        documentId: 'doc-aug-10',
      };
    case 'rec-aug-05':
      return {
        shortTitle: 'صافي مبيعات الشركة والربح',
        heroAmount: 989522.16,
        icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
        documentId: 'doc-aug-07',
      };
    case 'rec-sep-01':
      return {
        shortTitle: 'صافي مبيعات الفروع ووسائل الدفع',
        heroAmount: 800000.00,
        icon: <Store className="w-4 h-4 text-blue-600" />,
        documentId: 'doc-sep-01',
      };
    case 'rec-sep-02':
      return {
        shortTitle: 'التحويلات وكشف الحساب البنكي',
        heroAmount: 120000.00,
        icon: <Building2 className="w-4 h-4 text-indigo-600" />,
        documentId: 'doc-sep-04',
      };
    default:
      return {
        shortTitle: log.title,
        heroAmount: log.sourceAAmount,
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
        documentId: null,
      };
  }
}

export default function ReconciliationCenter({
  logs = DORA_RECONCILIATION_LOGS,
  periodId: propPeriodId,
  onInspectDocument,
}) {
  const { periodId: globalPeriodId, setPeriodId: setGlobalPeriodId } = useCurrentPeriod();
  const activePeriod = propPeriodId || globalPeriodId;

  const currentLogs = logs.filter((l) => l.periodId === activePeriod);
  const allMatched = currentLogs.length > 0 && currentLogs.every((l) => !l.hasDiscrepancy);

  // Hover and click expansion states
  const [hoveredId, setHoveredId] = useState(null);
  const [lockedId, setLockedId] = useState(null);

  const toggleLock = (id) => {
    setLockedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4 shadow-xs" dir="rtl">
      {/* Clean Executive Header — No unnecessary explanations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-2xs">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-[#0F172A]">
                مركز المطابقة وتدقيق الفروقات
              </h3>
              {allMatched ? (
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  تطابق تام بنسبة 100%
                </span>
              ) : (
                <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  يوجد فروقات تتطلب مراجعة
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              مرر الماوس فوق أي بطاقة لعرض تفاصيل ومصادر التطابق
            </span>
          </div>
        </div>

        {/* Period Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-slate-500 mr-1 ml-1" />
          {DORA_PERIODS.slice(0, 2).map((p) => (
            <button
              key={p.id}
              onClick={() => setGlobalPeriodId(p.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activePeriod === p.id
                  ? 'bg-[#0F172A] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-200/60'
              }`}
            >
              {p.labelAr}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Cards Grid: Title & Big Number Only by Default */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4 items-start">
        {currentLogs.map((log) => {
          const meta = getLogMeta(log);
          const isExpanded = hoveredId === log.id || lockedId === log.id;

          return (
            <div
              key={log.id}
              onMouseEnter={() => setHoveredId(log.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => toggleLock(log.id)}
              className={`group relative rounded-2xl sm:rounded-3xl border transition-all duration-300 p-4 sm:p-4.5 cursor-pointer select-none ${
                isExpanded
                  ? 'bg-white border-blue-400 shadow-xl ring-2 ring-blue-100 z-20'
                  : 'bg-slate-50/50 hover:bg-white border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300'
              }`}
            >
              {/* Card Top: Icon & Match Tag */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs shrink-0">
                    {meta.icon}
                  </div>
                  <h4 className="text-xs font-black text-[#0F172A] truncate" title={meta.shortTitle}>
                    {meta.shortTitle}
                  </h4>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                  {log.hasDiscrepancy ? '⚠️ قيد المراجعة' : '✓ 100%'}
                </span>
              </div>

              {/* Big Hero Number Only */}
              <div className="mt-1 flex items-baseline justify-between gap-2">
                <div className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                  {formatSAR(meta.heroAmount, false)}
                </div>

                {/* Subtle Expand Indicator */}
                <div
                  className={`flex items-center gap-0.5 text-[11px] font-bold transition-all duration-300 ${
                    isExpanded ? 'text-blue-600 rotate-180' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {/* Smooth Dropdown Details Reveal (تظهر بصورة منسدلة عند الوقف) */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isExpanded ? 'grid-rows-[1fr] opacity-100 mt-3 pt-3 border-t border-slate-100' : 'grid-rows-[0fr] opacity-0 mt-0 pt-0 border-t-0'
                }`}
              >
                <div className="overflow-hidden space-y-2.5 text-xs text-right">
                  {/* Full Title */}
                  <div className="text-[11px] font-bold text-slate-700 leading-snug">
                    {log.title}
                  </div>

                  {/* Match Degree & Discrepancy */}
                  <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200/80 rounded-xl px-2.5 py-1.5 text-[11px]">
                    <span className="text-emerald-900 font-bold">مدى التطابق:</span>
                    <span className="font-black text-emerald-800">
                      {log.discrepancy === 0 ? 'تطابق قطعي (فارق 0.00 ر.س)' : formatSAR(log.discrepancy, false)}
                    </span>
                  </div>

                  {/* Source Breakdown Comparison */}
                  <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-600">
                      <span className="truncate ml-1 font-medium">{log.sourceALabel}:</span>
                      <span className="font-black text-[#0F172A] shrink-0">
                        {formatSAR(log.sourceAAmount, false)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-600 border-t border-slate-100 pt-1">
                      <span className="truncate ml-1 font-medium">{log.sourceBLabel}:</span>
                      <span className="font-black text-emerald-700 shrink-0">
                        {formatSAR(log.sourceBAmount, false)}
                      </span>
                    </div>
                  </div>

                  {/* Description / Notes */}
                  <div className="text-[11px] text-slate-600 leading-relaxed font-medium bg-slate-50 p-2 rounded-xl border border-slate-100">
                    {log.notes}
                  </div>

                  {/* Evidence Viewer Link if document exists */}
                  {meta.documentId && onInspectDocument && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspectDocument(meta.documentId);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold transition-all shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>معاينة المستند المعتمد</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
