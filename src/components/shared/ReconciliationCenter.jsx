import React from 'react';
import { formatSAR } from '../../lib/kpiEngine';
import { ShieldCheck, AlertTriangle, CheckCircle2, ArrowRightLeft, FileText, Calendar } from 'lucide-react';
import { DORA_RECONCILIATION_LOGS, DORA_PERIODS } from '../../data/doraSchema';
import { useCurrentPeriod } from '../../context/BIPeriodContext';

export default function ReconciliationCenter({
  logs = DORA_RECONCILIATION_LOGS,
  periodId: propPeriodId,
  onInspectDocument
}) {
  const { periodId: globalPeriodId, setPeriodId: setGlobalPeriodId } = useCurrentPeriod();
  const activePeriod = propPeriodId || globalPeriodId;

  const currentLogs = logs.filter(l => l.periodId === activePeriod);
  const allMatched = currentLogs.length > 0 && currentLogs.every(l => !l.hasDiscrepancy);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-xs">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-[#0F172A]">مركز المطابقة وتدقيق الفروقات (Multi-Source Reconciliation)</h3>
              {allMatched ? (
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  تطابق تام بنسبة 100%
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  يوجد فروقات تتطلب مراجعة
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              فحص تلقائي مستمر لاتساق الأرقام بين فواتير الفروع، دفاتر التحصيل، وكشوفات الحسابات المصرفية
            </p>
          </div>
        </div>

        {/* Period Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-500 mr-1 ml-1" />
          {DORA_PERIODS.slice(0, 2).map((p) => (
            <button
              key={p.id}
              onClick={() => setGlobalPeriodId(p.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePeriod === p.id
                  ? 'bg-[#0F172A] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-200/60'
              }`}
            >
              {p.labelAr}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentLogs.map((log) => (
          <div
            key={log.id}
            className={`rounded-2xl border p-5 space-y-3.5 transition-all hover:border-blue-300 ${
              log.hasDiscrepancy
                ? 'border-amber-200 bg-amber-50/50'
                : 'border-slate-200 bg-slate-50/60 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-[#0F172A] leading-snug">{log.title}</span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                  log.hasDiscrepancy
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {log.hasDiscrepancy ? '⚠️ فارق قيد المراجعة' : '✓ تطابق قطعي 100%'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <div className="text-[11px] text-slate-600 leading-tight mb-1 font-medium">{log.sourceALabel}</div>
                <div className="text-base font-black text-[#0F172A] mt-1">
                  {formatSAR(log.sourceAAmount, false)}
                </div>
              </div>
              <div className="border-r border-slate-200 pr-3">
                <div className="text-[11px] text-slate-600 leading-tight mb-1 font-medium">{log.sourceBLabel}</div>
                <div className="text-base font-black text-emerald-700 mt-1">
                  {formatSAR(log.sourceBAmount, false)}
                </div>
              </div>
            </div>

            <div className="text-xs flex items-center justify-between pt-1">
              <span className="text-slate-600 font-medium">الفارق المسجل (Discrepancy):</span>
              <span
                className={`font-black px-2.5 py-0.5 rounded-lg text-xs ${
                  log.hasDiscrepancy ? 'text-amber-800 bg-amber-100' : 'text-emerald-800 bg-emerald-100'
                }`}
              >
                {log.discrepancy === 0 ? '0.00 ر.س (مطابق 100%)' : formatSAR(log.discrepancy, false)}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-200 pt-2.5 font-medium">
              {log.notes}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
