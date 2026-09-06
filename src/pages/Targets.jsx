import { useState } from 'react';
import { useTargets, useExecutiveKPIs, useAdMetrics, usePeriods, useBranches } from '../hooks/useBIData';
import { formatSAR, formatNum, formatMultiplier, formatPercent, calcTargetAchievement } from '../lib/kpiEngine';
import { MetricRing } from '../components/charts/Charts';
import { CardSkeleton, SectionHeader, GrowthChip } from '../components/shared/SharedComponents';
import { PlatformBadge } from '../components/shared/SharedComponents';
import { BIRoleGuard } from '../components/shared/BIRoleGuard';
import { cn } from '@/lib/utils';
import { Target, CheckCircle, AlertCircle, XCircle, Award } from 'lucide-react';
import { useCurrentPeriod } from '../context/BIPeriodContext';

function TargetRow({ label, actual, target, format = 'sar', color = '#059669' }) {
  const pct = calcTargetAchievement(actual, target);
  const status = pct >= 95 ? 'good' : pct >= 75 ? 'warning' : 'critical';
  const StatusIcon = pct >= 95 ? CheckCircle : pct >= 75 ? AlertCircle : XCircle;
  const statusColor = pct >= 95 ? 'text-emerald-700' : pct >= 75 ? 'text-amber-700' : 'text-red-700';

  const displayActual = format === 'sar' ? formatSAR(actual, false)
    : format === 'multiplier' ? formatMultiplier(actual)
    : format === 'percent' ? `${actual?.toFixed(2)}%`
    : formatNum(actual);

  const displayTarget = format === 'sar' ? formatSAR(target, false)
    : format === 'multiplier' ? formatMultiplier(target)
    : format === 'percent' ? `${target?.toFixed(2)}%`
    : formatNum(target);

  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-slate-100 last:border-0">
      <StatusIcon className={cn('w-4 h-4 shrink-0', statusColor)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-slate-800 font-bold">{label}</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">{displayActual} / {displayTarget}</span>
            <span className={cn('text-sm font-black', statusColor)}>{pct.toFixed(1)}%</span>
          </div>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}

export default function Targets() {
  const { periodId, setPeriodId, periods } = useCurrentPeriod();
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
            <h1 className="text-2xl font-black text-slate-900">المستهدفات البيعية ونسب الإنجاز (Targets & Performance)</h1>
            <p className="text-slate-500 text-sm mt-1">{currentPeriod?.labelAr || currentPeriod?.label} · متابعة دقيقة لمستهدفات الفروع والمبيعات والتسويق</p>
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

        {/* Executive Banner */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-emerald-950 font-black text-base">
                تحقيق استثنائي للمستهدفات: 123.7% من تارجت الفروع لشهر أغسطس
              </div>
              <div className="text-emerald-800 text-xs mt-0.5 font-medium">
                تم تحقيق صافي مبيعات 989,522.16 ر.س مقابل مستهدف 800,000 ر.س بهامش ربح صافي قدره 28.02%
              </div>
            </div>
          </div>
        </div>

        {loading || !kpis ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({length:8}).map((_,i)=><CardSkeleton key={i}/>)}
          </div>
        ) : (
          <>
            {/* Rings Overview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader title="نظرة سريعة على المستهدفات الكلية للشركة" className="mb-8" />
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center">
                <MetricRing value={kpis.totalRevenue} target={targets?.revenue || 800000} color="#059669" size={100} label="صافي المبيعات" />
                <MetricRing value={kpis.totalOrders}  target={targets?.orders || 2000}    color="#2563EB" size={100} label="إجمالي العمليات" />
                <MetricRing value={kpis.newCustomers} target={targets?.newCustomers || 450} color="#0F172A" size={100} label="عملاء جدد" />
                <MetricRing value={kpis.overallROAS}  target={targets?.roas || 4}          color="#D97706" size={100} label="ROAS المجمّع" />
                <MetricRing value={kpis.totalAdSpend} target={targets?.adSpend || 15000}   color="#EA580C" size={100} label="الإنفاق الإعلاني" />
                <MetricRing value={kpis.overallCPA}   target={targets?.cpa || 55}          color="#DC2626" size={100} label="تكلفة الاكتساب" />
              </div>
            </div>

            {/* Detailed Targets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Branch targets */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionHeader title="مستهدفات الفروع الميدانية (Branch Targets)" className="mb-4" />
                <div>
                  <TargetRow label="إجمالي مبيعات الفروع المجمعة" actual={989522.16} target={800000} format="sar" color="#059669" />
                  <TargetRow label="الفرع الرئيسي (Main Branch)" actual={428885.49} target={350000} format="sar" color="#2563EB" />
                  <TargetRow label="فرع الرواف (Al Rawaf Branch)" actual={291371.67} target={250000} format="sar" color="#059669" />
                  <TargetRow label="فرع كيا (Kia Branch)" actual={269265.00} target={200000} format="sar" color="#0F172A" />
                </div>
              </div>

              {/* Financial & Business targets */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionHeader title="مستهدفات الربحية والأعمال (Financial OKRs)" className="mb-4" />
                <div>
                  <TargetRow label="صافي مبيعات الشركة" actual={kpis.totalRevenue} target={targets?.revenue || 800000} format="sar" color="#059669" />
                  <BIRoleGuard permission="canViewFinancialsFull" fallback={null}>
                    <TargetRow label="صافي الربح المعتمد (28.02% هامش)" actual={kpis.netProfit || 277264.11} target={targets?.netProfit || 277264.11} format="sar" color="#1E3A8A" />
                  </BIRoleGuard>
                  <TargetRow label="إجمالي العمليات المكتملة" actual={kpis.totalOrders} target={targets?.orders || 2000} format="number" color="#2563EB" />
                  <TargetRow label="العملاء الجدد المستقطبون" actual={kpis.newCustomers} target={targets?.newCustomers || 450} format="number" color="#0F172A" />
                </div>
              </div>

              {/* Ad targets */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionHeader title="مستهدفات الحملات الإعلانية" className="mb-4" />
                <div>
                  <TargetRow label="العائد على الإنفاق (ROAS المباشر)" actual={kpis.overallROAS} target={targets?.roas || 4} format="multiplier" color="#D97706" />
                  <TargetRow label="ميزانية الإنفاق الإعلاني" actual={kpis.totalAdSpend} target={targets?.adSpend || 15000} format="sar" color="#EA580C" />
                  <TargetRow label="ROAS إعلانات ميتا" actual={metaMetrics?.roas || 4.58} target={targets?.metaROAS || 4.5} format="multiplier" color="#2563EB" />
                  <TargetRow label="ROAS إعلانات جوجل" actual={googleMetrics?.roas || 4.09} target={targets?.googleROAS || 4.2} format="multiplier" color="#059669" />
                  <TargetRow label="ROAS إعلانات تيك توك" actual={tiktokMetrics?.roas || 2.80} target={targets?.tiktokROAS || 3.5} format="multiplier" color="#0F172A" />
                </div>
              </div>

              {/* Ecommerce target */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionHeader title="مستهدفات متجر سلة الإلكتروني" className="mb-4" />
                <div>
                  <TargetRow label="صافي مبيعات المتجر الإلكتروني" actual={36660.19} target={targets?.ecommerceRevenue || 35000} format="sar" color="#2563EB" />
                  <TargetRow label="عدد الطلبات المكتملة" actual={69} target={60} format="number" color="#059669" />
                  <TargetRow label="معدل التحويل (Conversion Rate)" actual={3.2} target={3.0} format="percent" color="#0F172A" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </BIRoleGuard>
  );
}
