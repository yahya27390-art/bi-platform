import { useState } from 'react';
import { useBIData, usePeriods, useAdMetrics } from '../hooks/useBIData';
import { useBIAuth } from '../auth/BIAuthContext';
import { hasBIPermission } from '../lib/biPermissions';
import { formatSAR, formatNum, formatPercent, formatMultiplier } from '../lib/kpiEngine';
import KPICard from '../components/charts/KPICard';
import { TrendAreaChart, ComparisonBarChart } from '../components/charts/Charts';
import {
  GrowthChip, AttributionNote, CardSkeleton, SectionHeader, TargetProgress,
  PlatformBadge, DataHealthBar, ReconciliationBanner
} from '../components/shared/SharedComponents';
import {
  TrendingUp, DollarSign, ShoppingBag, Users,
  Target, Percent, Zap, BarChart3, HelpCircle, CheckCircle2,
  AlertTriangle, ArrowUpRight, Flame, Store, PackageSearch
} from 'lucide-react';

export default function BIOverview() {
  const [periodId, setPeriodId] = useState('p-2026-09');
  const { user } = useBIAuth();
  const { data: periods } = usePeriods();
  const { kpis, trend, targets, loading } = useBIData(periodId);
  const { data: platforms } = useAdMetrics(periodId);

  const currentPeriod = periods?.find(p => p.id === periodId);
  const canViewNetProfit = hasBIPermission(user, 'canViewFinancialsFull');

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">مركز القيادة التنفيذي (Executive Command Center)</h1>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              LIVE C-LEVEL
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            {currentPeriod?.label} · تحليل شامل لأداء الأعمال، المبيعات الفعلية، والحملات الإعلانية
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {periods?.slice(0, 3).map(p => (
            <button
              key={p.id}
              onClick={() => setPeriodId(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                periodId === p.id
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Section 11: Data Health Status Bar */}
      <DataHealthBar periodLabel={currentPeriod?.label || 'سبتمبر 2026'} />

      {/* Section 12: Data Reconciliation Banner (Anti Double-Counting) */}
      {kpis && (
        <ReconciliationBanner
          actualRevenue={formatSAR(kpis.totalRevenue, true)}
          attributedRevenue={formatSAR(kpis.attributedRevenue, true)}
          adSpend={formatSAR(kpis.totalAdSpend, true)}
          netProfit={canViewNetProfit ? formatSAR(kpis.netProfit, true) : '🔒 محمي للمالك'}
        />
      )}

      {/* Hero KPI Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : kpis ? (
        <>
          {/* Row 1 — Revenue & Profitability */}
          <div>
            <SectionHeader title="المؤشرات المالية والبيعية الفعلية" subtitle="مستخلصة من فواتير الفروع ونظام طلبات المتجر" className="mb-4" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="إجمالي الإيرادات الفعلية"
                displayValue={formatSAR(kpis.totalRevenue, true)}
                growth={kpis.totalRevenueGrowth}
                icon={<DollarSign className="w-5 h-5" />}
                color="emerald"
                target={kpis.targetRevenue}
                targetLabel="الهدف الشهري"
              />
              <KPICard
                title="الربح الإجمالي (Gross Profit)"
                displayValue={formatSAR(kpis.grossProfit, true)}
                growth={null}
                icon="📈"
                color="blue"
                sublabel={`هامش ربح ${kpis.grossMarginPct?.toFixed(1)}%`}
              />
              <KPICard
                title="صافي الربح (Net Profit)"
                displayValue={canViewNetProfit ? formatSAR(kpis.netProfit, true) : 'محمي 🔒'}
                growth={canViewNetProfit ? kpis.netProfitGrowth : null}
                icon="💰"
                color="purple"
                sublabel={canViewNetProfit ? `هامش صافي ${kpis.netProfitMarginPct?.toFixed(1)}%` : 'يتطلب صلاحية المالك أو الإدارة'}
              />
              <KPICard
                title="تحقيق مستهدف الإيرادات"
                displayValue={`${kpis.targetAchievementPct?.toFixed(1)}%`}
                growth={null}
                icon={<Target className="w-5 h-5" />}
                color={kpis.targetAchievementPct >= 95 ? 'emerald' : kpis.targetAchievementPct >= 80 ? 'amber' : 'red'}
                sublabel={`${formatSAR(kpis.targetRevenue, true)} الهدف`}
              />
            </div>
          </div>

          {/* Row 2 — Advertising Efficiency */}
          <div>
            <SectionHeader
              title="كفاءة الميديا بايينغ والتسويق (Attributed)"
              subtitle="عائد الصرف الإعلاني المحسوب على الإيرادات المعزوة للمنصات"
              className="mb-4"
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="إجمالي الصرف الإعلاني"
                displayValue={formatSAR(kpis.totalAdSpend, true)}
                icon={<TrendingUp className="w-5 h-5" />}
                color="amber"
                sublabel="ميتا + جوجل + تيك توك + سناب"
              />
              <KPICard
                title="العائد الإجمالي (Blended ROAS)"
                displayValue={formatMultiplier(kpis.overallROAS)}
                icon={<Zap className="w-5 h-5" />}
                color={kpis.overallROAS >= 3.5 ? 'emerald' : 'amber'}
                sublabel="الهدف: 3.50×"
              />
              <KPICard
                title="تكلفة الاكتساب (Blended CPA)"
                displayValue={formatSAR(kpis.overallCPA)}
                icon={<Users className="w-5 h-5" />}
                color="blue"
                sublabel={`${formatNum(kpis.totalConversions)} عملية شراء/طلب`}
              />
              <KPICard
                title="متوسط قيمة الطلب (AOV)"
                displayValue={formatSAR(kpis.avgOrderValue)}
                icon={<ShoppingBag className="w-5 h-5" />}
                color="cyan"
                sublabel={`من إجمالي ${formatNum(kpis.totalOrders)} طلب متجر`}
              />
            </div>
          </div>
        </>
      ) : null}

      {/* Section 10: The Executive 8-Question Diagnostic Command Center */}
      <div className="bg-[#0D1F38] border border-white/10 rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <HelpCircle className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-white">التشخيص التنفيذي السريع (Executive Intelligence Q&A)</h2>
              <p className="text-xs text-slate-400">إجابات استراتيجية مباشرة على أهم 8 أسئلة لإدارة ونمو الشركة</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500">Auto-Generated Insights</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Q1: WHAT HAPPENED? */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-2">
            <div className="text-[11px] font-bold text-emerald-400 flex items-center justify-between">
              <span>1. ماذا حدث؟ (WHAT HAPPENED?)</span>
              <span className="text-emerald-400">✓</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-semibold">
              نمو قوي في الإيرادات بنسبة <strong className="text-emerald-400">+14.2%</strong> لتصل إلى 1.48 مليون ر.س، بتحقيق 98.7% من مستهدف الشهر.
            </p>
          </div>

          {/* Q2: WHY DID IT HAPPEN? */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-2">
            <div className="text-[11px] font-bold text-sky-400 flex items-center justify-between">
              <span>2. لماذا حدث ذلك؟ (WHY DID IT HAPPEN?)</span>
              <span className="text-sky-400">💡</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              تحسّن أداء حملات اليوم الوطني على ميتا وجوجل ورفع الـ ROAS العام إلى 4.59×، مع زيادة إقبال الصيانة في الفروع.
            </p>
          </div>

          {/* Q3: WHERE DID THE MONEY GO? */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-2">
            <div className="text-[11px] font-bold text-amber-400 flex items-center justify-between">
              <span>3. أين ذهبت الأموال؟ (WHERE DID MONEY GO?)</span>
              <span className="text-amber-400">📉</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              62% تكلفة البضاعة (COGS)، 23% مصاريف تشغيل ورواتب، و <strong className="text-amber-300">2.9% فقط</strong> إنفاق إعلاني مدروس (42.8 ألف ر.س).
            </p>
          </div>

          {/* Q4: WHERE DID REVENUE COME FROM? */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-2">
            <div className="text-[11px] font-bold text-purple-400 flex items-center justify-between">
              <span>4. من أين أتت الإيرادات؟ (REVENUE SOURCE)</span>
              <span className="text-purple-400">🏢</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              81% من الفروع الميدانية (1.20 مليون ر.س)، و 19% من مبيعات المتجر الإلكتروني سلة (280 ألف ر.س).
            </p>
          </div>

          {/* Q5: WHICH CHANNEL PERFORMED BEST? */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-2">
            <div className="text-[11px] font-bold text-emerald-400 flex items-center justify-between">
              <span>5. أي القنوات حققت أفضل أداء؟</span>
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              <strong className="text-white">ميتا (Meta Ads)</strong> تصدرت بعائد <strong className="text-emerald-400">4.58× ROAS</strong> وصرف 18.2 ألف، تليها جوجل بعائد 4.09×.
            </p>
          </div>

          {/* Q6: WHICH CAMPAIGN NEEDS ATTENTION? */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-2">
            <div className="text-[11px] font-bold text-red-400 flex items-center justify-between">
              <span>6. ما الحملة التي تتطلب تدخلاً؟</span>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              حملة <strong className="text-amber-300">تيك توك عروض الصيانة</strong> CPA مرتفع (60 ر.س) وتم إيقافها مؤقتاً لمراجعة الكرييتف.
            </p>
          </div>

          {/* Q7: WHICH PRODUCT IS GROWING? */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-2">
            <div className="text-[11px] font-bold text-cyan-400 flex items-center justify-between">
              <span>7. ما المنتجات الأكثر نمواً؟</span>
              <PackageSearch className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              <strong className="text-white">أقمشة فرامل هيونداي أصلية</strong> نمو مبيعات +28% بهامش ربح إجمالي ممتاز 46%.
            </p>
          </div>

          {/* Q8: WHICH BRANCH IS LEADING? */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-2">
            <div className="text-[11px] font-bold text-emerald-400 flex items-center justify-between">
              <span>8. أداء الفروع الجغرافية؟</span>
              <Store className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              <strong className="text-white">فرع الروابي (هيونداي)</strong> حقق 104% من الهدف، وفرع السليمانية (كيا) عند 92%.
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Trend Area Chart */}
      {trend && (
        <div className="rounded-3xl border border-white/5 bg-[#0D1E36] p-6 space-y-4">
          <SectionHeader
            title="المسار التاريخي للإيرادات وصافي الأرباح"
            subtitle="مقارنة آخر 6 أشهر (تأكيد الاستقرار والنمو المستمر)"
          />
          <TrendAreaChart
            data={trend}
            dataKey="revenue"
            height={260}
            formatValue={(v) => formatSAR(v, true)}
          />
        </div>
      )}

      {/* Platform Breakdown Cards */}
      {platforms?.length > 0 && (
        <div className="space-y-4">
          <SectionHeader
            title="أداء القنوات الإعلانية (Platform Breakdown)"
            subtitle={`${currentPeriod?.label} · تفصيل الأداء الفردي لكل منصة`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {platforms.filter(p => p.spend > 0).map(p => (
              <div key={p.slug} className="rounded-2xl border border-white/5 bg-[#0D1F38] p-5 space-y-3.5 hover:border-emerald-500/20 transition-all">
                <div className="flex items-center justify-between">
                  <PlatformBadge platform={p.slug} size="md" />
                  <GrowthChip value={p.roasGrowth} />
                </div>
                <div>
                  <div className="text-2xl font-black text-white" dir="ltr">
                    {formatMultiplier(p.roas)}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">ROAS العائد على الإنفاق</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/5">
                  <div>
                    <div className="text-slate-500">الإنفاق</div>
                    <div className="text-white font-bold">{formatSAR(p.spend, true)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">المبيعات المعزوة</div>
                    <div className="text-white font-bold">{formatSAR(p.attributedRevenue, true)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">CPA الاكتساب</div>
                    <div className="text-white font-bold">{formatSAR(p.cpa)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">النقرات (CTR)</div>
                    <div className="text-white font-bold">{p.ctr?.toFixed(2)}%</div>
                  </div>
                </div>
                <TargetProgress
                  actual={p.roas}
                  target={targets?.[`${p.slug}ROAS`] || 4}
                  color={p.color}
                  label="مقارنة بمستهدف الـ ROAS"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue vs Ad Spend Monthly Comparison */}
      {trend && (
        <div className="rounded-3xl border border-white/5 bg-[#0D1E36] p-6 space-y-4">
          <SectionHeader
            title="مقارنة الإيرادات مقابل الإنفاق الإعلاني وصافي الربح"
            subtitle="مقارنة شهرية متوازنة توضح كفاءة تحويل الإنفاق إلى أرباح حقيقية"
          />
          <ComparisonBarChart
            data={trend}
            series={[
              { key: 'revenue',   color: '#10B981', label: 'إجمالي الإيرادات' },
              { key: 'adSpend',   color: '#F59E0B', label: 'الإنفاق الإعلاني' },
              { key: 'netProfit', color: '#8B5CF6', label: 'صافي الربح' },
            ]}
            height={240}
            formatValue={(v) => formatSAR(v, true)}
          />
        </div>
      )}
    </div>
  );
}
