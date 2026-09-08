import React from 'react';
import { formatSAR } from '../../lib/kpiEngine';
import {
  Store,
  Target,
  TrendingUp,
  FileText,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Sparkles,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { DORA_BRANCH_SALES, DORA_BRANCHES } from '../../data/doraSchema';
import doraLogo from '../../assets/dora_logo.png';

export default function DoraBranchCards({
  branchSales = DORA_BRANCH_SALES,
  periodId = 'p-2026-08',
  onInspectDocument,
}) {
  // Find sales for current period, fallback to p-2026-08 if current empty
  let currentSales = branchSales.filter((s) => s.periodId === periodId);
  if (!currentSales.length) {
    currentSales = branchSales.filter((s) => s.periodId === 'p-2026-08');
  }

  const totalGross = currentSales.reduce((s, b) => s + (b.grossSales || 0), 0);
  const totalReturns = currentSales.reduce((s, b) => s + (b.returnsAmount || 0), 0);
  const totalNet = currentSales.reduce((s, b) => s + (b.netSales || 0), 0);
  const totalTarget = currentSales.reduce((s, b) => s + (b.target || 0), 0);
  const totalAchievement = totalTarget ? (totalNet / totalTarget) * 100 : 0;
  const totalSurplus = totalNet - totalTarget;

  // Branch Address & Metadata Map
  const branchMetaMap = {
    main: {
      code: 'BR-01',
      address: 'طريق الملك عبد العزيز، بريدة',
      type: 'المركز الرئيسي ومعرض السيارات المعتمد',
      badgeColor: '#10B981',
    },
    'al-rawaf': {
      code: 'BR-02',
      address: 'حي الرواف، بريدة',
      type: 'معرض وصالة مبيعات الرواف',
      badgeColor: '#3B82F6',
    },
    kia: {
      code: 'BR-03',
      address: 'طريق الملك فهد، بريدة',
      type: 'معرض ومركز مبيعات كيا المعتمد',
      badgeColor: '#8B5CF6',
    },
  };

  return (
    <div className="space-y-6 font-sans text-right" dir="rtl">
      {/* 1. Header & Consolidated Three Branches Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 flex items-center justify-center shrink-0">
            {/* Pure transparent logo with zero frame or background */}
            <img
              src={doraLogo}
              alt="درة السيارة"
              className="w-12 h-12 object-contain drop-shadow-sm"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                <span>فروع درة السيارة الميدانية (Physical Showroom Branches)</span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  3 فروع نشطة
                </span>
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                فواتير Z-Reports معتمدة 100%
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              أداء المبيعات الميدانية الفعلي ومطابقة الإيرادات المحققة مع مستهدفات الفروع المعتمدة
            </p>
          </div>
        </div>

        {/* Consolidated Total Strip */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/90 px-4 py-3 rounded-2xl shadow-2xs self-start lg:self-center">
          <div>
            <div className="text-[11px] text-slate-500 font-bold">
              إجمالي مبيعات الفروع الميدانية (POS)
            </div>
            <div className="text-base sm:text-lg font-black text-[#0F172A] font-mono flex items-center gap-1.5" dir="ltr">
              <span>{formatSAR(totalNet, false)}</span>
              <span className="text-xs text-slate-500 font-normal">/ المستهدف: {formatSAR(totalTarget, false)}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-black text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-3 py-1 rounded-xl shadow-2xs">
              {totalAchievement.toFixed(1)}% تحقيق
            </span>
            <span className="text-[10px] text-emerald-700 font-bold">
              +{formatSAR(totalSurplus, true)} فائض
            </span>
          </div>
        </div>
      </div>

      {/* 2. Three Storefront Physical Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {currentSales.map((branch) => {
          const meta = branchMetaMap[branch.branchId] || {
            code: 'BR-00',
            address: 'بريدة، القصيم',
            type: 'معرض سيارات',
            badgeColor: '#2563EB',
          };
          const isAboveTarget = branch.variance >= 0;

          return (
            <div
              key={branch.branchId}
              className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group"
            >
              {/* --- TOP: Physical Storefront Signage (يافطة المعرض والفرع) --- */}
              <div className="relative bg-gradient-to-r from-slate-950 via-[#0A1424] to-slate-950 text-white p-4 sm:p-5 border-b border-slate-800 shadow-inner">
                {/* Subtle Ambient Showroom Lighting / LED Glow Line */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 opacity-90" />

                {/* Signage Header Content */}
                <div className="flex items-start justify-between gap-3">
                  {/* Storefront Signboard (اليافطة) with Logo and Brand Name */}
                  <div className="flex items-center gap-3">
                    {/* Official Dora Logo: PURE TRANSPARENT, ZERO FRAME, ZERO BACKGROUND */}
                    <img
                      src={doraLogo}
                      alt="لوجو درة السيارة"
                      className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] shrink-0 transition-transform group-hover:scale-105"
                    />

                    <div>
                      {/* Signage Brand Name */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-base sm:text-lg font-black text-white tracking-wide drop-shadow-sm font-sans">
                          درة السيارة
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono">
                          {meta.code}
                        </span>
                      </div>

                      {/* Branch Name on the Signboard */}
                      <div className="text-sm font-black text-cyan-300 drop-shadow-xs mt-0.5 flex items-center gap-1">
                        <span>{branch.branchNameAr}</span>
                      </div>

                      {/* Storefront Physical Address */}
                      <div className="text-[11px] text-slate-300 flex items-center gap-1 mt-1 font-medium">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{meta.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Showroom Status Tag */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      معرض نشط
                    </span>
                  </div>
                </div>

                {/* Architectural Showroom Light Bar */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Store className="w-3 h-3 text-cyan-400" />
                    <span>{meta.type}</span>
                  </span>
                  <span className="text-emerald-400 font-bold">مبيعات ميدانية موثقة</span>
                </div>
              </div>

              {/* --- MIDDLE: Showroom Performance Interior (بيانات المبيعات الفعلية) --- */}
              <div className="p-4 sm:p-5 space-y-4 flex-1">
                {/* Net Sales Hero Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span>صافي المبيعات الفعلية (Net Sales):</span>
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                      +{branch.growthVsLastMonth}% نمو
                    </span>
                  </div>
                  <div
                    className="text-2xl sm:text-3xl font-black text-[#0F172A] font-mono tracking-tight flex items-baseline gap-1.5"
                    dir="ltr"
                  >
                    <span>{formatSAR(branch.netSales, false)}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-200/70 flex items-center justify-between">
                    <span>المستهدف الشهري:</span>
                    <span className="font-bold text-[#0F172A] font-mono">
                      {formatSAR(branch.target, false)}
                    </span>
                  </div>
                </div>

                {/* Accounting Breakdown: Gross vs Returns */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-medium">إجمالي المبيعات (Gross)</div>
                    <div className="text-xs sm:text-sm font-black text-[#0F172A] mt-1 font-mono" dir="ltr">
                      {formatSAR(branch.grossSales, false)}
                    </div>
                  </div>
                  <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-200">
                    <div className="text-[10px] text-rose-700 font-medium flex items-center justify-between">
                      <span>المرتجعات (Returns)</span>
                      <span className="text-[10px] font-bold font-mono">{branch.returnRate}%</span>
                    </div>
                    <div className="text-xs sm:text-sm font-black text-rose-700 mt-1 font-mono" dir="ltr">
                      -{formatSAR(branch.returnsAmount, false)}
                    </div>
                  </div>
                </div>

                {/* Target Progress & Variance Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 flex items-center gap-1 font-bold text-[11px]">
                      <Target className="w-3.5 h-3.5 text-blue-600" />
                      <span>نسبة تحقيق المستهدف</span>
                    </span>
                    <span
                      className={`font-black text-xs font-mono px-2 py-0.5 rounded-md ${
                        branch.achievementPct >= 100
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {branch.achievementPct.toFixed(1)}% {branch.achievementPct >= 100 ? '✓ تم تحقيقه' : ''}
                    </span>
                  </div>

                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-emerald-500 to-teal-500"
                      style={{ width: `${Math.min(branch.achievementPct, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500 font-medium">الفارق عن التارجت:</span>
                    <span
                      className={`font-black font-mono text-[11px] ${
                        isAboveTarget ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                      dir="ltr"
                    >
                      {branch.variance >= 0
                        ? `+${formatSAR(branch.variance, false)} فائض`
                        : `${formatSAR(branch.variance, false)} عجز`}
                    </span>
                  </div>
                </div>
              </div>

              {/* --- BOTTOM: Verified Z-Report Invoice Proof Button --- */}
              <div className="p-4 pt-0 border-t border-slate-100 bg-white">
                {branch.documentId && (
                  <button
                    type="button"
                    onClick={() => onInspectDocument && onInspectDocument(branch.documentId)}
                    className="w-full mt-3 py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-800 transition-all flex items-center justify-center gap-2 text-xs font-bold shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>معاينة سكرين شوت تقرير المبيعات المعتمد Z-Report</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
