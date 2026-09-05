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

export default function Financials() {
  const [periodId, setPeriodId] = useState('p-2026-09');
  const { data: periods }       = usePeriods();
  const { data: fin, loading }  = useFinancials(periodId);
  const { data: trend }         = useFinancialsTrend();
  const { data: targets }       = useTargets(periodId);
  const currentPeriod           = periods?.find(p => p.id === periodId);

  return (
    <BIRoleGuard permission="canViewFinancialsSummary">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">الأداء المالي وحساب الأرباح والخسائر (P&L Intelligence)</h1>
            <p className="text-slate-400 text-sm mt-1">{currentPeriod?.label} · تحليل تفصيلي للإيرادات، التكاليف، وهامش الربحية</p>
          </div>
          <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
            {periods?.slice(0, 3).map(p => (
              <button key={p.id} onClick={() => setPeriodId(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${periodId === p.id ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                {p.labelEn}
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
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0c162a] to-[#080d18] p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <GitCommit className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">
                      مخطط التدفق التتابعي للشلال المالي (P&L Waterfall Walkthrough)
                    </h2>
                    <p className="text-xs text-slate-400">
                      توضيح خطوة بخطوة لكيفية تحول إجمالي الإيرادات إلى صافي ربح نهائي بعد خصم تكلفة البضاعة (COGS) والمصاريف التشغيلية والإعلانية
                    </p>
                  </div>
                </div>
                <span className="text-xs text-purple-400 font-mono bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                  ECharts Waterfall
                </span>
              </div>
              <WaterfallChart height={330} />
            </div>

            {/* Revenue Summary */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* P&L Summary card */}
              <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#111827]/80 p-6">
                <SectionHeader title="ملخص الأرباح والخسائر" className="mb-5" />
                <div className="space-y-0 divide-y divide-white/5">
                  <div className="flex justify-between py-3">
                    <span className="text-slate-300 font-semibold">إجمالي الإيرادات</span>
                    <div className="flex items-center gap-2">
                      <GrowthChip value={fin.totalRevenueGrowth} />
                      <span className="text-white font-black">{formatSAR(fin.totalRevenue)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between py-3 pr-4">
                    <span className="text-slate-400 text-sm">إيرادات المتجر الإلكتروني</span>
                    <span className="text-slate-300">{formatSAR(fin.ecommerceRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-3 pr-4">
                    <span className="text-slate-400 text-sm">إيرادات الفروع</span>
                    <span className="text-slate-300">{formatSAR(fin.branchRevenue)}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-slate-300 font-semibold">تكلفة البضاعة المباعة (COGS)</span>
                    <span className="text-red-400 font-bold">({formatSAR(fin.cogs)})</span>
                  </div>
                  <div className="flex justify-between py-3 bg-emerald-500/5 px-3 rounded-lg">
                    <span className="text-emerald-300 font-bold">الربح الإجمالي</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 text-sm">{fin.grossMarginPct?.toFixed(1)}%</span>
                      <span className="text-emerald-400 font-black">{formatSAR(fin.grossProfit)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-slate-300 font-semibold">مصاريف التشغيل</span>
                    <span className="text-red-400 font-bold">({formatSAR(fin.totalOpex)})</span>
                  </div>
                  <div className="flex justify-between py-3 bg-blue-500/5 px-3 rounded-lg">
                    <span className="text-blue-300 font-bold">EBITDA</span>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 text-sm">{fin.ebitdaMarginPct?.toFixed(1)}%</span>
                      <span className="text-blue-400 font-black">{formatSAR(fin.ebitda)}</span>
                    </div>
                  </div>

                  {/* Net profit — guarded */}
                  <BIRoleGuard permission="canViewFinancialsFull"
                    fallback={
                      <div className="flex justify-between py-3 bg-purple-500/5 px-3 rounded-lg opacity-40">
                        <span className="text-purple-300 font-bold">صافي الربح</span>
                        <span className="text-purple-400 font-black">🔒 مخفي</span>
                      </div>
                    }>
                    <div className="flex justify-between py-3 bg-purple-500/5 px-3 rounded-lg">
                      <span className="text-purple-300 font-bold">صافي الربح</span>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400 text-sm">{fin.netProfitMarginPct?.toFixed(1)}%</span>
                        <span className="text-purple-400 font-black">{formatSAR(fin.netProfit)}</span>
                      </div>
                    </div>
                  </BIRoleGuard>
                </div>
              </div>

              {/* Target Rings */}
              <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-6 flex flex-col justify-between">
                <SectionHeader title="تحقيق الأهداف" className="mb-5" />
                <div className="grid grid-cols-2 gap-6">
                  <MetricRing value={fin.totalRevenue} target={targets?.revenue || 500000} color="#10B981" size={90} label="هدف الإيراد" />
                  <MetricRing value={fin.grossProfit} target={(targets?.revenue || 500000) * 0.45} color="#3B82F6" size={90} label="الربح الإجمالي" />
                  <BIRoleGuard permission="canViewFinancialsFull"
                    fallback={<MetricRing value={0} target={1} color="#8B5CF640" size={90} label="🔒 صافي الربح" />}>
                    <MetricRing value={fin.netProfit} target={targets?.netProfit || 65000} color="#8B5CF6" size={90} label="صافي الربح" />
                  </BIRoleGuard>
                  <MetricRing value={fin.cashFlow} target={fin.totalRevenue * 0.16} color="#F59E0B" size={90} label="التدفق النقدي" />
                </div>
              </div>
            </div>

            {/* OPEX Breakdown */}
            <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-6">
              <SectionHeader title="تفاصيل مصاريف التشغيل" className="mb-5" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(fin.operatingExpenses || {}).map(([key, val]) => {
                  const OPEX_LABELS = { salaries: 'الرواتب', rent: 'الإيجارات', utilities: 'المرافق', marketing: 'التسويق', logistics: 'الشحن والتوصيل', other: 'أخرى' };
                  const OPEX_COLORS = { salaries: '#3B82F6', rent: '#8B5CF6', utilities: '#F59E0B', marketing: '#10B981', logistics: '#F97316', other: '#6B7280' };
                  return (
                    <div key={key} className="rounded-xl bg-white/3 p-3 text-center">
                      <div className="text-xs text-slate-500 mb-2">{OPEX_LABELS[key] || key}</div>
                      <div className="text-lg font-black" style={{ color: OPEX_COLORS[key] }}>{formatSAR(val, true)}</div>
                      <div className="text-xs text-slate-500 mt-1">{((val / fin.totalOpex) * 100).toFixed(0)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trend Chart */}
            {trend && (
              <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-6">
                <SectionHeader title="المسار المالي — 6 أشهر" className="mb-6" />
                <TrendAreaChart
                  data={trend}
                  series={[
                    { key: 'revenue',     color: '#10B981', label: 'الإيرادات' },
                    { key: 'grossProfit', color: '#3B82F6', label: 'الربح الإجمالي' },
                    { key: 'netProfit',   color: '#8B5CF6', label: 'صافي الربح' },
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
