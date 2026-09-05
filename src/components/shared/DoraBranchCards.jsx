import React from 'react';
import { formatSAR, formatPercent } from '../../lib/kpiEngine';
import { Store, Target, TrendingUp, AlertTriangle, FileText, CheckCircle2, Shield } from 'lucide-react';
import { DORA_BRANCH_SALES, DORA_BRANCHES } from '../../data/doraSchema';

export default function DoraBranchCards({ branchSales = DORA_BRANCH_SALES, periodId = 'p-2026-09', onInspectDocument }) {
  const currentSales = branchSales.filter(s => s.periodId === periodId);

  const totalGross = currentSales.reduce((s, b) => s + (b.grossSales || 0), 0);
  const totalReturns = currentSales.reduce((s, b) => s + (b.returnsAmount || 0), 0);
  const totalNet = currentSales.reduce((s, b) => s + (b.netSales || 0), 0);
  const totalTarget = currentSales.reduce((s, b) => s + (b.target || 0), 0);
  const totalAchievement = totalTarget ? (totalNet / totalTarget) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-400" />
            أداء الفروع المادية والمستهدفات البيعية (Physical Branch Sales & Targets)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            فصل إجمالي المبيعات عن المرتجعات واحتساب صافي الإيرادات ومطابقتها مع مستهدفات الفروع المعتمدة
          </p>
        </div>

        {/* Consolidated Total Chip */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
          <div>
            <div className="text-[10px] text-slate-400 font-medium">إجمالي صافي مبيعات الفروع الثلاثة</div>
            <div className="text-sm font-black text-white font-mono" dir="ltr">
              {formatSAR(totalNet, true)} / <span className="text-slate-400">{formatSAR(totalTarget, true)}</span>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
            {totalAchievement.toFixed(0)}% تحقيق
          </span>
        </div>
      </div>

      {/* 3 Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {currentSales.map((branch) => {
          const isAboveTarget = branch.variance >= 0;
          return (
            <div
              key={branch.branchId}
              className="rounded-3xl border border-white/10 bg-[#0e172a]/90 backdrop-blur-md p-6 space-y-4 shadow-xl hover:border-emerald-500/30 transition-all group"
            >
              {/* Branch Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{branch.branchNameAr}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">الهدف: {formatSAR(branch.target, true)}</span>
                  </div>
                </div>

                {/* Evidence Screenshot link */}
                {branch.documentId && (
                  <button
                    onClick={() => onInspectDocument && onInspectDocument(branch.documentId)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-300 transition-colors flex items-center gap-1 text-[11px]"
                    title="معاينة سكرين شوت تقرير المبيعات المعتمد"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    المستند المصدر
                  </button>
                )}
              </div>

              {/* Net Sales Hero */}
              <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-1">
                <div className="text-[11px] text-slate-400">صافي المبيعات الفعلية (Net Sales):</div>
                <div className="text-2xl lg:text-3xl font-black text-white font-mono tracking-tight" dir="ltr">
                  {formatSAR(branch.netSales, true)}
                </div>
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5">
                  <span className="text-slate-400">نمو عن الشهر السابق:</span>
                  <span className="text-emerald-400 font-bold font-mono">+{branch.growthVsLastMonth}%</span>
                </div>
              </div>

              {/* Accounting Breakdown: Gross Sales - Returns */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-black/20 p-2.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-400">إجمالي المبيعات (Gross)</div>
                  <div className="text-xs font-black text-slate-200 font-mono mt-0.5" dir="ltr">
                    {formatSAR(branch.grossSales, true)}
                  </div>
                </div>
                <div className="bg-red-500/5 p-2.5 rounded-xl border border-red-500/10">
                  <div className="text-[10px] text-red-400 flex items-center justify-between">
                    <span>المرتجعات (Returns)</span>
                    <span className="font-mono text-[9px]">{branch.returnRate}%</span>
                  </div>
                  <div className="text-xs font-black text-red-400 font-mono mt-0.5" dir="ltr">
                    -{formatSAR(branch.returnsAmount, true)}
                  </div>
                </div>
              </div>

              {/* Target Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-blue-400" />
                    نسبة الإنجاز
                  </span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {branch.achievementPct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${Math.min(branch.achievementPct, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>الانحراف (Variance):</span>
                  <span className={`font-mono font-bold ${isAboveTarget ? 'text-emerald-400' : 'text-red-400'}`} dir="ltr">
                    {branch.variance >= 0 ? `+${formatSAR(branch.variance)}` : formatSAR(branch.variance)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
