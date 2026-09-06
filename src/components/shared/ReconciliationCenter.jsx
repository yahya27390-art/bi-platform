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
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0d1628] to-[#0a1120] p-6 space-y-4 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">مركز المطابقة وتدقيق الفروقات (Multi-Source Reconciliation)</h3>
              {allMatched ? (
                <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" />
                  تطابق تام بنسبة 100%
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  يوجد فروقات تتطلب مراجعة
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              فحص تلقائي مستمر لاتساق الأرقام بين فواتير الفروع، دفاتر التحصيل، وكشوفات الحسابات المصرفية
            </p>
          </div>
        </div>

        {/* Period Switcher */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10">
          <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1 ml-1" />
          {DORA_PERIODS.slice(0, 2).map((p) => (
            <button
              key={p.id}
              onClick={() => setGlobalPeriodId(p.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePeriod === p.id
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
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
            className={`rounded-2xl border p-5 space-y-3.5 transition-all hover:border-emerald-500/40 ${
              log.hasDiscrepancy
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-white/5 bg-[#10192d]/80 shadow-lg shadow-black/20'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-white leading-snug">{log.title}</span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                  log.hasDiscrepancy
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {log.hasDiscrepancy ? '⚠️ فارق قيد المراجعة' : '✓ تطابق قطعي 100%'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-black/40 p-3.5 rounded-xl border border-white/5">
              <div>
                <div className="text-[11px] text-slate-400 leading-tight mb-1">{log.sourceALabel}</div>
                <div className="text-base font-black text-white mt-1">
                  {formatSAR(log.sourceAAmount, false)}
                </div>
              </div>
              <div className="border-r border-white/5 pr-3">
                <div className="text-[11px] text-slate-400 leading-tight mb-1">{log.sourceBLabel}</div>
                <div className="text-base font-black text-emerald-400 mt-1">
                  {formatSAR(log.sourceBAmount, false)}
                </div>
              </div>
            </div>

            <div className="text-xs flex items-center justify-between pt-1">
              <span className="text-slate-400 font-medium">الفارق المسجل (Discrepancy):</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-lg text-xs ${
                  log.hasDiscrepancy ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10'
                }`}
              >
                {log.discrepancy === 0 ? '0.00 ر.س (مطابق 100%)' : formatSAR(log.discrepancy, false)}
              </span>
            </div>

            <p className="text-[11px] text-slate-300/85 leading-relaxed border-t border-white/5 pt-2.5">
              {log.notes}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
