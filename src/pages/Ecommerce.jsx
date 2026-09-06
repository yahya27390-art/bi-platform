import { useEcommerceStats } from '../hooks/useBIData';
import { useCurrentPeriod } from '../context/BIPeriodContext';
import { formatSAR, formatNum, formatPercent } from '../lib/kpiEngine';
import { TrendAreaChart, ComparisonBarChart } from '../components/charts/Charts';
import { GrowthChip, CardSkeleton, SectionHeader, StatRow } from '../components/shared/SharedComponents';
import KPICard from '../components/charts/KPICard';
import { ShoppingBag, TrendingUp, Users, Percent, ShoppingCart, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Ecommerce() {
  const { periodId, setPeriodId, periods } = useCurrentPeriod();
  const { data: ecm, loading } = useEcommerceStats(periodId);

  const totalRevenue = ecm?.topCategories?.reduce((s, c) => s + c.revenue, 0) || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">متجر سلة الإلكتروني (Salla E-Commerce)</h1>
          <p className="text-slate-400 text-sm mt-1">doracars.com · تقارير المبيعات والزيارات الرسمية المعتمدة</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-2xl p-1 shadow-inner">
          {periods?.slice(0, 3).map(p => (
            <button key={p.id} onClick={() => setPeriodId(p.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${periodId === p.id ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-white'}`}>
              {p.labelAr || p.label}
            </button>
          ))}
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
              growth={ecm.totalOrdersGrowth}
              icon={<ShoppingBag className="w-5 h-5" />}
              color="emerald"
              sparklineData={[45, 52, 58, 64, 69, ecm.totalOrders]}
            />
            <KPICard
              title="صافي إيرادات المتجر"
              displayValue={formatSAR(ecm.totalRevenue, false)}
              growth={ecm.totalRevenueGrowth}
              icon={<TrendingUp className="w-5 h-5" />}
              color="blue"
              sparklineData={[24000, 26500, 28000, 31000, 34500, ecm.totalRevenue]}
            />
            <KPICard
              title="متوسط قيمة الطلب (AOV)"
              displayValue={formatSAR(ecm.avgOrderValue, false)}
              growth={ecm.avgOrderValueGrowth}
              icon={<ShoppingCart className="w-5 h-5" />}
              color="purple"
              sparklineData={[480, 495, 510, 520, 528, ecm.avgOrderValue]}
            />
            <KPICard
              title="معدل التحويل (CR)"
              displayValue={`${ecm.conversionRate?.toFixed(1)}%`}
              growth={ecm.conversionRateGrowth}
              icon={<Percent className="w-5 h-5" />}
              color="amber"
              sparklineData={[2.4, 2.7, 2.9, 3.1, 3.2, ecm.conversionRate]}
            />
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="الزيارات المباشرة"
              displayValue={formatNum(ecm.sessions)}
              growth={ecm.sessionsGrowth}
              icon={<Users className="w-5 h-5" />}
              color="slate"
              sparklineData={[14000, 15500, 16200, 17800, 18900, ecm.sessions]}
            />
            <KPICard
              title="معدل التخلي عن السلة"
              displayValue={`${ecm.cartAbandonmentRate?.toFixed(1)}%`}
              growth={ecm.cartAbandonmentChange}
              icon="🛒"
              color="red"
              sparklineData={[68, 66, 65, 63, 62, ecm.cartAbandonmentRate]}
            />
            <KPICard
              title="العملاء المتكررون"
              displayValue={`${ecm.returningCustomerRate?.toFixed(1)}%`}
              growth={4.5}
              icon={<Users className="w-5 h-5" />}
              color="purple"
              sparklineData={[18, 19, 21, 22, 23, ecm.returningCustomerRate]}
            />
            <KPICard
              title="الإيراد لكل زيارة (RPV)"
              displayValue={formatSAR(ecm.totalRevenue / ecm.sessions)}
              growth={8.2}
              icon={<TrendingUp className="w-5 h-5" />}
              color="blue"
              sparklineData={[11.5, 12.2, 13.0, 13.8, 14.5, (ecm.totalRevenue / ecm.sessions)]}
            />
          </div>

          {/* Daily orders timeline */}
          <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-6">
            <SectionHeader title="الطلبات اليومية" subtitle={`${periods?.find(p=>p.id===periodId)?.label}`} className="mb-6" />
            <TrendAreaChart
              data={ecm.ordersTimeline}
              series={[{ key: 'orders', color: '#10B981', label: 'الطلبات' }]}
              height={200}
              formatValue={(v) => `${v} طلب`}
            />
          </div>

          {/* Category breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-6">
              <SectionHeader title="أداء الفئات" className="mb-5" />
              <div className="space-y-3">
                {ecm.topCategories?.map((cat, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300 font-medium">{cat.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">{formatNum(cat.orders)} طلب</span>
                        <span className="text-white font-bold">{formatSAR(cat.revenue, true)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${cat.share}%`, background: `hsl(${140 + i * 30}, 60%, 50%)` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500">{cat.share}% من الإيرادات</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats summary */}
            <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-6">
              <SectionHeader title="ملخص الأداء" className="mb-5" />
              <div className="divide-y divide-white/5">
                <StatRow label="إجمالي الطلبات" value={formatNum(ecm.totalOrders)} />
                <StatRow label="إجمالي الإيرادات" value={formatSAR(ecm.totalRevenue)} valueClass="text-emerald-400" />
                <StatRow label="متوسط قيمة الطلب" value={formatSAR(ecm.avgOrderValue)} />
                <StatRow label="الزيارات" value={formatNum(ecm.sessions)} />
                <StatRow label="معدل التحويل" value={`${ecm.conversionRate?.toFixed(1)}%`} />
                <StatRow label="معدل التخلي عن السلة" value={`${ecm.cartAbandonmentRate?.toFixed(1)}%`} valueClass="text-red-400" />
                <StatRow label="العملاء المتكررون" value={`${ecm.returningCustomerRate?.toFixed(1)}%`} valueClass="text-purple-400" />
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
