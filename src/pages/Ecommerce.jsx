import { useState } from 'react';
import { useEcommerceStats } from '../hooks/useBIData';
import { useCurrentPeriod } from '../context/BIPeriodContext';
import { formatSAR, formatNum, formatPercent } from '../lib/kpiEngine';
import { TrendAreaChart, ComparisonBarChart } from '../components/charts/Charts';
import { GrowthChip, CardSkeleton, SectionHeader, StatRow } from '../components/shared/SharedComponents';
import KPICard from '../components/charts/KPICard';
import { ShoppingBag, TrendingUp, Users, Percent, ShoppingCart, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import SallaIntegrationModal from '../components/shared/SallaIntegrationModal';
import { loadSallaConfig } from '../lib/sallaIntegration';

export default function Ecommerce() {
  const { periodId, setPeriodId, periods } = useCurrentPeriod();
  const { data: ecm, loading } = useEcommerceStats(periodId);
  const [showSallaModal, setShowSallaModal] = useState(false);
  const [sallaConfig, setSallaConfig] = useState(loadSallaConfig);

  const totalRevenue = ecm?.topCategories?.reduce((s, c) => s + c.revenue, 0) || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">متجر سلة الإلكتروني (Salla E-Commerce)</h1>
          <p className="text-slate-500 text-sm mt-1">doracars.com · تقارير المبيعات والزيارات الرسمية المعتمدة (مشمولة ضمن الإجمالي الكلي للفروع)</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowSallaModal(true)}
            className="px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all shadow-sm bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white border-purple-600/50"
            title="إدارة ربط متجر سلة بالـ API واستخراج الرمز"
          >
            <span className={`w-2 h-2 rounded-full ${sallaConfig.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{sallaConfig.isConnected ? 'متصل حياً بـ سلة (doracars.com)' : 'ربط متجر سلة (Salla API)'}</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-2xl p-1 shadow-inner">
            {periods?.slice(0, 3).map(p => (
              <button key={p.id} onClick={() => setPeriodId(p.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${periodId === p.id ? 'bg-[#0F172A] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}>
                {p.labelAr || p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : ecm ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="إجمالي الطلبات المكتملة"
              displayValue={formatNum(ecm.totalOrders)}
              growth={ecm.totalRevenue > 0 ? ecm.totalOrdersGrowth : null}
              icon={<ShoppingBag className="w-5 h-5" />}
              color="emerald"
              sparklineData={ecm.totalRevenue > 0 ? [45, 52, 58, 64, 69, ecm.totalOrders] : [0, 0, 0, 0, 0, 0]}
            />
            <KPICard
              title="صافي مبيعات المتجر الإلكتروني"
              displayValue={formatSAR(ecm.totalRevenue, false)}
              growth={ecm.totalRevenue > 0 ? ecm.totalRevenueGrowth : null}
              icon={<TrendingUp className="w-5 h-5" />}
              color="blue"
              sparklineData={ecm.totalRevenue > 0 ? [24000, 26500, 28000, 31000, 34500, ecm.totalRevenue] : [0, 0, 0, 0, 0, 0]}
            />
            <KPICard
              title="متوسط قيمة السلة (AOV)"
              displayValue={formatSAR(ecm.avgOrderValue, false)}
              growth={ecm.totalRevenue > 0 ? ecm.avgOrderValueGrowth : null}
              icon={<ShoppingCart className="w-5 h-5" />}
              color="purple"
              sparklineData={ecm.totalRevenue > 0 ? [480, 495, 510, 520, 528, ecm.avgOrderValue] : [0, 0, 0, 0, 0, 0]}
            />
            <KPICard
              title="معدل التحويل (CR)"
              displayValue={`${(ecm.conversionRate || 0).toFixed(1)}%`}
              growth={ecm.totalRevenue > 0 ? ecm.conversionRateGrowth : null}
              icon={<Percent className="w-5 h-5" />}
              color="amber"
              sparklineData={ecm.totalRevenue > 0 ? [2.4, 2.7, 2.9, 3.1, 3.2, ecm.conversionRate] : [0, 0, 0, 0, 0, 0]}
            />
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="الزيارات المباشرة للمتجر"
              displayValue={formatNum(ecm.sessions)}
              growth={ecm.sessions > 0 ? ecm.sessionsGrowth : null}
              icon={<Users className="w-5 h-5" />}
              color="slate"
              sparklineData={ecm.sessions > 0 ? [14000, 15500, 16200, 17800, 18900, ecm.sessions] : [0, 0, 0, 0, 0, 0]}
            />
            <KPICard
              title="معدل التخلي عن السلة"
              displayValue={`${(ecm.cartAbandonmentRate || 0).toFixed(1)}%`}
              growth={ecm.sessions > 0 ? ecm.cartAbandonmentChange : null}
              icon="🛒"
              color="red"
              sparklineData={ecm.sessions > 0 ? [68, 66, 65, 63, 62, ecm.cartAbandonmentRate] : [0, 0, 0, 0, 0, 0]}
            />
            <KPICard
              title="العملاء المتكررون"
              displayValue={`${(ecm.returningCustomerRate || 0).toFixed(1)}%`}
              growth={ecm.sessions > 0 ? 4.5 : null}
              icon={<Users className="w-5 h-5" />}
              color="purple"
              sparklineData={ecm.sessions > 0 ? [18, 19, 21, 22, 23, ecm.returningCustomerRate] : [0, 0, 0, 0, 0, 0]}
            />
            <KPICard
              title="الإيراد لكل زيارة (RPV)"
              displayValue={formatSAR(ecm.sessions > 0 ? (ecm.totalRevenue / ecm.sessions) : 0)}
              growth={ecm.sessions > 0 ? 8.2 : null}
              icon={<TrendingUp className="w-5 h-5" />}
              color="blue"
              sparklineData={ecm.sessions > 0 ? [1.8, 1.9, 2.0, 2.04] : [0, 0, 0, 0]}
            />
          </div>

          {/* Daily orders timeline */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SectionHeader title="حركة الطلبات اليومية للمتجر" subtitle={`${periods?.find(p=>p.id===periodId)?.label}`} className="mb-6" />
            <TrendAreaChart
              data={ecm.ordersTimeline}
              series={[{ key: 'orders', color: '#059669', label: 'الطلبات المكتملة' }]}
              height={200}
              formatValue={(v) => `${v} طلب`}
            />
          </div>

          {/* Category breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader title="أداء فئات المنتجات في المتجر" className="mb-5" />
              <div className="space-y-4">
                {ecm.topCategories?.map((cat, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-800 font-bold">{cat.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-medium">{formatNum(cat.orders)} طلب</span>
                        <span className="text-slate-900 font-black">{formatSAR(cat.revenue, true)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${cat.share}%`, background: `hsl(${210 + i * 25}, 80%, 45%)` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 font-semibold">{cat.share}% من إجمالي مبيعات المتجر</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader title="ملخص الأداء والمقاييس التشغيلية" className="mb-5" />
              <div className="divide-y divide-slate-100">
                <StatRow label="إجمالي الطلبات المكتملة" value={formatNum(ecm.totalOrders)} />
                <StatRow label="صافي مبيعات المتجر" value={formatSAR(ecm.totalRevenue)} valueClass="text-emerald-700 font-bold" />
                <StatRow label="متوسط قيمة السلة (AOV)" value={formatSAR(ecm.avgOrderValue)} />
                <StatRow label="جلسات الزوار النشطة" value={formatNum(ecm.sessions)} />
                <StatRow label="معدل التحويل النهائي" value={`${ecm.conversionRate?.toFixed(1)}%`} />
                <StatRow label="معدل التخلي عن السلة" value={`${ecm.cartAbandonmentRate?.toFixed(1)}%`} valueClass="text-red-600 font-bold" />
                <StatRow label="نسبة عودة العملاء المتكررين" value={`${ecm.returningCustomerRate?.toFixed(1)}%`} valueClass="text-blue-800 font-bold" />
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Salla Integration Modal */}
      <SallaIntegrationModal
        isOpen={showSallaModal}
        onClose={() => setShowSallaModal(false)}
        onSyncComplete={(updatedCfg) => setSallaConfig(updatedCfg)}
      />
    </div>
  );
}
