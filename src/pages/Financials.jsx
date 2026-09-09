import { useState } from 'react';
import { useFinancials, useFinancialsTrend, useTargets, usePeriods } from '../hooks/useBIData';
import { formatSAR, formatPercent } from '../lib/kpiEngine';
import { TrendAreaChart, ComparisonBarChart } from '../components/charts/Charts';
import { MetricRing } from '../components/charts/Charts';
import WaterfallChart from '../components/charts/WaterfallChart';
import { CardSkeleton, SectionHeader, StatRow } from '../components/shared/SharedComponents';
import { BIRoleGuard } from '../components/shared/BIRoleGuard';
import { GrowthChip } from '../components/shared/SharedComponents';
import { DollarSign, TrendingUp, TrendingDown, PieChart, GitCommit } from 'lucide-react';
import { useCurrentPeriod } from '../context/BIPeriodContext';

export default function Financials() {
  const { periodId, setPeriodId, periods } = useCurrentPeriod();
  const { data: fin, loading }  = useFinancials(periodId);
  const { data: trend }         = useFinancialsTrend();
  const { data: targets }       = useTargets(periodId);
  const currentPeriod           = periods?.find(p => p.id === periodId);

  return (
    <BIRoleGuard permission="canViewFinancialsSummary">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">الأداء المالي وحساب الأرباح والخسائر (P&L Intelligence)</h1>
            <p className="text-slate-500 text-sm mt-1">{currentPeriod?.labelAr || currentPeriod?.label} · تحليل تفصيلي للإيرادات، التكاليف، وهامش الربحية المعتمد</p>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-2xl p-1 shadow-inner">
            {periods?.slice(0, 3).map(p => (
              <button key={p.id} onClick={() => setPeriodId(p.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${periodId === p.id ? 'bg-[#0F172A] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}>
                {p.labelAr || p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({length:8}).map((_,i) => <CardSkeleton key={i} />)}
          </div>
        ) : fin ? (
          <>
            {/* Waterfall P&L Walkthrough */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                    <GitCommit className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      مخطط التدفق التتابعي للشلال المالي (P&L Waterfall Walkthrough)
                    </h2>
                    <p className="text-xs text-slate-500">
                      توضيح خطوة بخطوة لتحول صافي الإيرادات ({formatSAR(fin.totalRevenue)}) إلى صافي ربح قدره {formatSAR(fin.netProfit)} بنسبة هامش {fin.netProfitMarginPct?.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <span className="text-xs text-blue-800 font-mono bg-blue-50 border border-blue-200 px-3 py-1 rounded-full font-bold">
                  هامش الربح الصافي: {fin.netProfitMarginPct?.toFixed(2)}%
                </span>
              </div>
              <WaterfallChart height={330} />
            </div>

            {/* Revenue & Profit Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* P&L Summary card */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionHeader title="ملخص الأرباح والخسائر المعتمد" className="mb-5" />
                <div className="space-y-0 divide-y divide-slate-100">
                  <div className="flex justify-between py-3">
                    <span className="text-slate-700 font-bold">صافي إيرادات الشركة المجمعة</span>
                    <div className="flex items-center gap-2">
                      <GrowthChip value={fin.totalRevenueGrowth} />
                      <span className="text-slate-900 font-black text-base">{formatSAR(fin.totalRevenue)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between py-3 pr-4">
                    <span className="text-slate-500 text-sm">مبيعات الفروع الميدانية (Main + Rawaf + Kia)</span>
                    <span className="text-slate-700 font-bold">{formatSAR(fin.branchRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-3 pr-4">
                    <span className="text-slate-500 text-sm">صافي مبيعات المتجر الإلكتروني (سلة)</span>
                    <span className="text-slate-700 font-bold">{formatSAR(fin.ecommerceRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-slate-700 font-semibold">تكلفة البضاعة المباعة (COGS 71.97%)</span>
                    <span className="text-red-600 font-bold">({formatSAR(fin.cogs)})</span>
                  </div>
                  <div className="flex justify-between py-3 bg-emerald-50/70 px-3 rounded-lg border border-emerald-100">
                    <span className="text-emerald-900 font-bold">الربح الإجمالي (Gross Profit)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 font-bold text-sm">{fin.grossMarginPct?.toFixed(1)}%</span>
                      <span className="text-emerald-800 font-black">{formatSAR(fin.grossProfit)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-slate-700 font-semibold">مصاريف التشغيل (OPEX)</span>
                    <span className="text-red-600 font-bold">({formatSAR(fin.totalOpex)})</span>
                  </div>
                  <div className="flex justify-between py-3 bg-blue-50/70 px-3 rounded-lg border border-blue-100">
                    <span className="text-blue-900 font-bold">EBITDA التشغيلي</span>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-700 font-bold text-sm">{fin.ebitdaMarginPct?.toFixed(1)}%</span>
                      <span className="text-blue-800 font-black">{formatSAR(fin.ebitda)}</span>
                    </div>
                  </div>

                  {/* Net profit */}
                  <BIRoleGuard permission="canViewFinancialsFull"
                    fallback={
                      <div className="flex justify-between py-3 bg-slate-50 px-3 rounded-lg opacity-50">
                        <span className="text-slate-600 font-bold">صافي الربح</span>
                        <span className="text-slate-700 font-black">🔒 مخفي</span>
                      </div>
                    }>
                    <div className="flex justify-between py-3 bg-blue-50/90 px-3 rounded-lg border border-blue-200">
                      <span className="text-blue-950 font-black">صافي الربح النهائي (Net Profit)</span>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-800 font-black text-sm">{fin.netProfitMarginPct?.toFixed(2)}%</span>
                        <span className="text-blue-900 font-black text-lg">{formatSAR(fin.netProfit)}</span>
                      </div>
                    </div>
                  </BIRoleGuard>
                </div>
              </div>

              {/* Target Rings */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                <SectionHeader title="تحقيق المستهدفات المالية" className="mb-5" />
                <div className="grid grid-cols-2 gap-6">
                  <MetricRing value={fin.totalRevenue} target={targets?.revenue || 800000} color="#059669" size={90} label="هدف المبيعات (800K)" />
                  <MetricRing value={fin.grossProfit} target={(targets?.revenue || 800000) * 0.50} color="#2563EB" size={90} label="الربح الإجمالي" />
                  <BIRoleGuard permission="canViewFinancialsFull"
                    fallback={<MetricRing value={0} target={1} color="#94A3B8" size={90} label="🔒 صافي الربح" />}>
                    <MetricRing value={fin.netProfit} target={targets?.netProfit || 277264} color="#1E3A8A" size={90} label="صافي الربح" />
                  </BIRoleGuard>
                  <MetricRing value={fin.cashFlow} target={fin.totalRevenue * 0.20} color="#D97706" size={90} label="التدفق النقدي" />
                </div>
              </div>
            </div>

            {/* OPEX Breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader title="تفاصيل مصاريف التشغيل (OPEX Breakdown)" className="mb-5" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(fin.operatingExpenses || {}).map(([key, val]) => {
                  const OPEX_LABELS = { 
                    salaries: 'الرواتب والأجور (فروع)', 
                    rent: 'الإيجارات (كامل الفروع)', 
                    utilities: 'الكهرباء والمرافق', 
                    marketing: 'التسويق والإعلانات', 
                    logistics: 'الشحن والتوصيل', 
                    other: 'احتياطي نثريات وتقلبات' 
                  };
                  const OPEX_COLORS = { salaries: '#2563EB', rent: '#475569', utilities: '#D97706', marketing: '#059669', logistics: '#EA580C', other: '#64748B' };
                  return (
                    <div key={key} className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                      <div className="text-xs text-slate-600 mb-2 font-medium">{OPEX_LABELS[key] || key}</div>
                      <div className="text-lg font-black" style={{ color: OPEX_COLORS[key] }}>{formatSAR(val, true)}</div>
                      <div className="text-xs text-slate-500 mt-1 font-semibold">{((val / fin.totalOpex) * 100).toFixed(0)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trend Chart */}
            {trend && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionHeader title="المسار المالي التاريخي — 6 أشهر" className="mb-6" />
                <TrendAreaChart
                  data={trend}
                  series={[
                    { key: 'revenue',     color: '#059669', label: 'الإيرادات' },
                    { key: 'grossProfit', color: '#2563EB', label: 'الربح الإجمالي' },
                    { key: 'netProfit',   color: '#0F172A', label: 'صافي الربح الفعلي' },
                  ]}
                  height={240}
                  formatValue={v => formatSAR(v, true)}
                />
              </div>
            )}
          </>
        ) : null}
      </div>
    </BIRoleGuard>
  );
}
