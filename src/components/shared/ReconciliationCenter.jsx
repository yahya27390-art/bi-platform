import React from 'react';
import { formatSAR } from '../../lib/kpiEngine';
import { ShieldCheck, AlertTriangle, CheckCircle2, ArrowRightLeft } from 'lucide-react';
import { DORA_RECONCILIATION_LOGS } from '../../data/doraSchema';

export default function ReconciliationCenter({ logs = DORA_RECONCILIATION_LOGS }) {
  const currentLogs = logs.filter(l => l.periodId === 'p-2026-09');
  const allMatched = currentLogs.every(l => !l.hasDiscrepancy);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0c1527] p-6 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">مركز المطابقة وتدقيق الفروقات (Multi-Source Reconciliation)</h3>
              {allMatched ? (
                <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  تطابق تام بنسبة 100%
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
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
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentLogs.map((log) => (
          <div
            key={log.id}
            className={`rounded-2xl border p-4 space-y-3 transition-colors ${
              log.hasDiscrepancy
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-emerald-500/20 bg-emerald-500/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{log.title}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  log.hasDiscrepancy
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {log.hasDiscrepancy ? '⚠️ فارق قيد المراجعة' : '✓ متطابق'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-black/30 p-3 rounded-xl">
              <div>
                <div className="text-[11px] text-slate-400">{log.sourceALabel}</div>
                <div className="text-sm font-black text-white font-mono mt-0.5" dir="ltr">
                  {formatSAR(log.sourceAAmount, true)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400">{log.sourceBLabel}</div>
                <div className="text-sm font-black text-white font-mono mt-0.5" dir="ltr">
                  {formatSAR(log.sourceBAmount, true)}
                </div>
              </div>
            </div>

            <div className="text-xs flex items-center justify-between pt-1">
              <span className="text-slate-400">الفارق المسجل (Discrepancy):</span>
              <span
                className={`font-mono font-bold ${
                  log.hasDiscrepancy ? 'text-amber-400' : 'text-emerald-400'
                }`}
                dir="ltr"
              >
                {formatSAR(log.discrepancy, true)}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-white/5 pt-2">
              {log.notes}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
