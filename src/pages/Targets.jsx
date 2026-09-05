import { useState } from 'react';
import { useTargets, useExecutiveKPIs, useAdMetrics, usePeriods, useBranches } from '../hooks/useBIData';
import { formatSAR, formatNum, formatMultiplier, formatPercent, calcTargetAchievement } from '../lib/kpiEngine';
import { MetricRing } from '../components/charts/Charts';
import { CardSkeleton, SectionHeader, GrowthChip } from '../components/shared/SharedComponents';
import { PlatformBadge } from '../components/shared/SharedComponents';
import { BIRoleGuard } from '../components/shared/BIRoleGuard';
import { cn } from '@/lib/utils';
import { Target, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

function TargetRow({ label, actual, target, format = 'sar', color = '#10B981' }) {
  const pct = calcTargetAchievement(actual, target);
  const status = pct >= 95 ? 'good' : pct >= 75 ? 'warning' : 'critical';
  const StatusIcon = pct >= 95 ? CheckCircle : pct >= 75 ? AlertCircle : XCircle;
  const statusColor = pct >= 95 ? 'text-emerald-400' : pct >= 75 ? 'text-amber-400' : 'text-red-400';

  const displayActual = format === 'sar' ? formatSAR(actual, true)
    : format === 'multiplier' ? formatMultiplier(actual)
    : format === 'percent' ? `${actual?.toFixed(1)}%`
    : formatNum(actual);

  const displayTarget = format === 'sar' ? formatSAR(target, true)
    : format === 'multiplier' ? formatMultiplier(target)
    : format === 'percent' ? `${target?.toFixed(1)}%`
    : formatNum(target);

  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
      <StatusIcon className={cn('w-4 h-4 shrink-0', statusColor)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-slate-300 font-medium">{label}</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500" dir="ltr">{displayActual} / {displayTarget}</span>
            <span className={cn('text-sm font-black', statusColor)} dir="ltr">{pct.toFixed(0)}%</span>
          </div>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}

export default function Targets() {
  const [periodId, setPeriodId] = useState('p-2026-09');
  const { data: periods }       = usePeriods();
  const { data: targets }       = useTargets(periodId);
  const { data: kpis, loading } = useExecutiveKPIs(periodId);
  const { data: adMetrics }     = useAdMetrics(periodId);
  const { data: branches }      = useBranches();
  const currentPeriod           = periods?.find(p => p.id === periodId);

  const metaMetrics   = adMetrics?.find(p => p.slug === 'meta');
  const googleMetrics = adMetrics?.find(p => p.slug === 'google');
  const tiktokMetrics = adMetrics?.find(p => p.slug === 'tiktok');

  return (
    <BIRoleGuard permission="canViewTargets">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">الأهداف والإنجاز</h1>
            <p className="text-slate-400 text-sm mt-1">{currentPeriod?.label}</p>
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

        {loading || !kpis ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({length:8}).map((_,i)=><CardSkeleton key={i}/>)}
          </div>
        ) : (
          <>
            {/* Rings Overview */}
            <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-6">
              <SectionHeader title="نظرة سريعة على الأهداف الرئيسية" className="mb-8" />
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center">
                <MetricRing value={kpis.totalRevenue} target={targets?.revenue||500000} color="#10B981" size={100} label="الإيراد" />
                <MetricRing value={kpis.totalOrders}  target={targets?.orders||2000}    color="#3B82F6" size={100} label="الطلبات" />
                <MetricRing value={kpis.newCustomers} target={targets?.newCustomers||450} color="#8B5CF6" size={100} label="عملاء جدد" />
                <MetricRing value={kpis.overallROAS}  target={targets?.roas||4}          color="#F59E0B" size={100} label="ROAS" />
                <MetricRing value={kpis.totalAdSpend} target={targets?.adSpend||40000}   color="#F97316" size={100} label="الإنفاق" />
                <MetricRing value={kpis.overallCPA}   target={targets?.cpa||55}          color="#EF4444" size={100} label="CPA" />
              </div>
            </div>

            {/* Detailed Targets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Business targets */}
              <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-6">
                <SectionHeader title="أهداف الأعمال" className="mb-4" />
                <div>
                  <TargetRow label="إجمالي الإيرادات" actual={kpis.totalRevenue} target={targets?.revenue||500000} format="sar" color="#10B981" />
                  <TargetRow label="إجمالي الطلبات"   actual={kpis.totalOrders}  target={targets?.orders||2000}    format="number" color="#3B82F6" />
                  <TargetRow label="العملاء الجدد"    actual={kpis.newCustomers} target={targets?.newCustomers||450} format="number" color="#8B5CF6" />
                  <BIRoleGuard permission="canViewFinancialsFull" fallback={null}>
                    <TargetRow label="صافي الربح"     actual={kpis.netProfit||57494} target={targets?.netProfit||65000} format="sar" color="#A855F7" />
                  </BIRoleGuard>
                </div>
              </div>

              {/* Ad targets */}
              <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-6">
                <SectionHeader title="أهداف الإعلانات" className="mb-4" />
                <div>
                  <TargetRow label="إجمالي ROAS" actual={kpis.overallROAS} target={targets?.roas||4} format="multiplier" color="#F59E0B" />
                  <TargetRow label="ميزانية الإنفاق" actual={kpis.totalAdSpend} target={targets?.adSpend||40000} format="sar" color="#F97316" />
                  <TargetRow label="ROAS ميتا"   actual={metaMetrics?.roas||0}   target={targets?.metaROAS||4.5}   format="multiplier" color="#3B82F6" />
                  <TargetRow label="ROAS جوجل"  actual={googleMetrics?.roas||0} target={targets?.googleROAS||4.2} format="multiplier" color="#10B981" />
                  <TargetRow label="ROAS تيك توك" actual={tiktokMetrics?.roas||0} target={targets?.tiktokROAS||3.5} format="multiplier" color="#8B5CF6" />
                </div>
              </div>

              {/* Branch targets */}
              <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-6">
                <SectionHeader title="أهداف الفروع" className="mb-4" />
                <div>
                  <TargetRow label="فرع هيونداي – الرواف" actual={112400} target={targets?.hyundaiRevenue||120000} format="sar" color="#3B82F6" />
                  <TargetRow label="فرع كيا – السليم"      actual={87400}  target={targets?.kiaRevenue||95000}     format="sar" color="#10B981" />
                </div>
              </div>

              {/* Ecommerce target */}
              <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-6">
                <SectionHeader title="أهداف المتجر الإلكتروني" className="mb-4" />
                <div>
                  <TargetRow label="إيرادات المتجر" actual={287400} target={targets?.ecommerceRevenue||300000} format="sar" color="#8B5CF6" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </BIRoleGuard>
  );
}
