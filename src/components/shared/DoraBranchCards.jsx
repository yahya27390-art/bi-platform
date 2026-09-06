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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[#0F172A] flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            أداء الفروع المادية والمستهدفات البيعية (Physical Branch Sales & Targets)
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            فصل إجمالي المبيعات عن المردودات ومطابقة صافي المبيعات لكل فرع مع المستهدف الشهري المعتمد
          </p>
        </div>

        {/* Consolidated Total Chip */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm">
          <div>
            <div className="text-[10px] text-slate-500 font-bold">إجمالي صافي مبيعات الفروع الثلاثة</div>
            <div className="text-sm font-black text-[#0F172A]">
              {formatSAR(totalNet, false)} <span className="text-slate-500 font-normal">/ الهدف: {formatSAR(totalTarget, false)}</span>
            </div>
          </div>
          <span className="text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
            {totalAchievement.toFixed(1)}% تحقيق
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
              className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
            >
              {/* Branch Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-xs">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#0F172A]">{branch.branchNameAr}</h3>
                    <span className="text-xs text-slate-600 font-semibold">المستهدف: {formatSAR(branch.target, false)}</span>
                  </div>
                </div>

                {/* Evidence Screenshot link */}
                {branch.documentId && (
                  <button
                    onClick={() => onInspectDocument && onInspectDocument(branch.documentId)}
                    className="p-1.5 px-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-800 transition-colors flex items-center gap-1.5 text-[11px] font-bold"
                    title="معاينة سكرين شوت تقرير المبيعات المعتمد"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    المستند المعتمد
                  </button>
                )}
              </div>

              {/* Net Sales Hero */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[11px] text-slate-600 font-bold">صافي المبيعات الفعلية (Net Sales):</div>
                <div className="text-2xl lg:text-3xl font-black text-[#0F172A] tracking-tight">
                  {formatSAR(branch.netSales, false)}
                </div>
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200">
                  <span className="text-slate-600 font-medium">النمو عن الشهر السابق:</span>
                  <span className="text-emerald-700 font-bold">+{branch.growthVsLastMonth}%</span>
                </div>
              </div>

              {/* Accounting Breakdown: Gross Sales - Returns */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-600 font-medium">إجمالي المبيعات (Gross)</div>
                  <div className="text-xs font-black text-slate-900 mt-1">
                    {formatSAR(branch.grossSales, false)}
                  </div>
                </div>
                <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-200">
                  <div className="text-[10px] text-rose-700 font-semibold flex items-center justify-between">
                    <span>المرتجعات (Returns)</span>
                    <span className="text-[10px] font-bold">{branch.returnRate}%</span>
                  </div>
                  <div className="text-xs font-black text-rose-700 mt-1">
                    -{formatSAR(branch.returnsAmount, false)}
                  </div>
                </div>
              </div>

              {/* Target Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-1 font-bold">
                    <Target className="w-3.5 h-3.5 text-blue-600" />
                    نسبة تحقيق الهدف
                  </span>
                  <span className={`font-black text-sm ${branch.achievementPct >= 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {branch.achievementPct.toFixed(1)}% {branch.achievementPct >= 100 ? '✓ تم تحقيقه' : ''}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-emerald-500 to-teal-500"
                    style={{ width: `${Math.min(branch.achievementPct, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5">
                  <span className="font-medium">الفارق عن التارجت (Variance):</span>
                  <span className={`font-black ${isAboveTarget ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {branch.variance >= 0 ? `+${formatSAR(branch.variance, false)} فائض` : `${formatSAR(branch.variance, false)} عجز`}
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
