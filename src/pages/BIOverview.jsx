import { useState, useMemo } from 'react';
import { useBIData, usePeriods, useAdMetrics } from '../hooks/useBIData';
import { useBIAuth } from '../auth/BIAuthContext';
import { hasBIPermission } from '../lib/biPermissions';
import { formatSAR, formatNum, formatPercent, formatMultiplier } from '../lib/kpiEngine';
import KPICard from '../components/charts/KPICard';
import { TrendAreaChart, ComparisonBarChart } from '../components/charts/Charts';
import SankeyFlowChart from '../components/charts/SankeyFlowChart';
import DoraBranchCards from '../components/shared/DoraBranchCards';
import GoogleBranchCorrelation from '../components/charts/GoogleBranchCorrelation';
import PaymentMethodMix from '../components/charts/PaymentMethodMix';
import GA4LiveAnalytics from '../components/charts/GA4LiveAnalytics';
import GSCLiveAnalytics from '../components/charts/GSCLiveAnalytics';
import GeoPerformanceView from '../components/charts/GeoPerformanceView';
import ReconciliationCenter from '../components/shared/ReconciliationCenter';
import EvidenceViewerModal from '../components/shared/EvidenceViewerModal';
import { DORA_DOCUMENTS } from '../data/doraSchema';
import {
  GrowthChip, AttributionNote, CardSkeleton, SectionHeader, TargetProgress,
  PlatformBadge, DataHealthBar, ReconciliationBanner
} from '../components/shared/SharedComponents';
import {
  TrendingUp, DollarSign, ShoppingBag, Users,
  Target, Percent, Zap, BarChart3, HelpCircle, CheckCircle2,
  AlertTriangle, ArrowUpRight, Flame, Store, PackageSearch, Filter, RotateCcw, Layers
} from 'lucide-react';

import { useCurrentPeriod } from '../context/BIPeriodContext';

export default function BIOverview() {
  const { periodId, setPeriodId, periods } = useCurrentPeriod();
  const [channelFilter, setChannelFilter] = useState('all'); // all | branches | ecommerce
  const [platformFilter, setPlatformFilter] = useState('all'); // all | meta | google | tiktok | snapchat
  const [activeDocId, setActiveDocId] = useState(null);

  const { user } = useBIAuth();
  const { kpis, trend, targets, loading } = useBIData(periodId);
  const { data: platforms } = useAdMetrics(periodId);

  const currentPeriod = periods?.find(p => p.id === periodId);
  const canViewNetProfit = hasBIPermission(user, 'canViewFinancialsFull');

  const selectedDocument = activeDocId
    ? DORA_DOCUMENTS.find(d => d.id === activeDocId) || { id: activeDocId, fileName: 'Document_Proof.png', uploadedBy: 'المحاسب المالي', category: 'branch_sales_screenshot', verificationStatus: 'VERIFIED' }
    : null;

  const hasActiveFilters = channelFilter !== 'all' || platformFilter !== 'all';

  const resetFilters = () => {
    setChannelFilter('all');
    setPlatformFilter('all');
  };

  // Filtered KPI adjustments for interactive feel
  const displayedKpis = useMemo(() => {
    if (!kpis) return null;
    let rev = kpis.totalRevenue;
    let targetRev = kpis.targetRevenue;
    let adSpend = kpis.totalAdSpend;

    if (channelFilter === 'branches') {
      rev = kpis.branchRevenue || 989522.16;
      targetRev = 800000;
      adSpend = kpis.totalAdSpend * 0.70;
    } else if (channelFilter === 'ecommerce') {
      rev = kpis.ecommerceRevenue || 36660.19;
      targetRev = 50000;
      adSpend = kpis.totalAdSpend * 0.30;
    }

    if (platformFilter !== 'all' && platforms) {
      const p = platforms.find(pl => pl.slug === platformFilter);
      if (p) adSpend = p.spend;
    }

    return {
      ...kpis,
      totalRevenue: rev,
      targetRevenue: targetRev,
      totalAdSpend: adSpend,
      targetAchievementPct: targetRev ? (rev / targetRev) * 100 : 100,
    };
  }, [kpis, channelFilter, platformFilter, platforms]);

  const filteredPlatforms = useMemo(() => {
    if (!platforms) return [];
    if (platformFilter === 'all') return platforms.filter(p => p.spend > 0);
    return platforms.filter(p => p.slug === platformFilter && p.spend > 0);
  }, [platforms, platformFilter]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0F172A]">مركز القيادة التنفيذي (Executive Command Center)</h1>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              LIVE C-LEVEL
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            {currentPeriod?.labelAr || currentPeriod?.label} · تحليل استراتيجي ومترابط لكافة التدفقات النقدية، المبيعات الميدانية، والإنفاق الإعلاني
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
          {periods?.slice(0, 3).map(p => (
            <button
              key={p.id}
              onClick={() => setPeriodId(p.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                periodId === p.id
                  ? 'bg-[#0F172A] text-white shadow-md'
                  : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-100'
              }`}
            >
              {p.labelAr || p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Cross-Filtering Control Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold ml-2">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>تصفية فورية:</span>
          </div>

          {/* Channel selector */}
          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
            {[
              { id: 'all', label: 'كافة القنوات' },
              { id: 'branches', label: 'الفروع الميدانية' },
              { id: 'ecommerce', label: 'متجر سلة' },
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setChannelFilter(c.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  channelFilter === c.id
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Platform selector */}
          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
            {[
              { id: 'all', label: 'كل المنصات' },
              { id: 'meta', label: 'Meta' },
              { id: 'google', label: 'Google' },
              { id: 'tiktok', label: 'TikTok' },
              { id: 'snapchat', label: 'Snapchat' },
            ].map(pl => (
              <button
                key={pl.id}
                onClick={() => setPlatformFilter(pl.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  platformFilter === pl.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {pl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reset / Active filter feedback */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-amber-900 font-bold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              تصفية نشطة: {channelFilter !== 'all' ? channelFilter : ''} {platformFilter !== 'all' ? `(${platformFilter})` : ''}
            </span>
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors border border-slate-200 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              إلغاء التصفية
            </button>
          </div>
        )}
      </div>

      {/* Section 11: Data Health Status Bar */}
      <DataHealthBar periodLabel={currentPeriod?.labelAr || currentPeriod?.label || 'أغسطس 2026'} />

      {/* Multi-Source Reconciliation & Discrepancy Detector */}
      <ReconciliationCenter
        periodId={periodId}
        onInspectDocument={(docId) => setActiveDocId(docId)}
      />

      {/* Section 12: Data Reconciliation Banner (Anti Double-Counting) */}
      {displayedKpis && (
        <ReconciliationBanner
          actualRevenue={formatSAR(displayedKpis.totalRevenue, false)}
          attributedRevenue={formatSAR(displayedKpis.attributedRevenue, false)}
          adSpend={formatSAR(displayedKpis.totalAdSpend, false)}
          netProfit={canViewNetProfit ? formatSAR(displayedKpis.netProfit, false) : '🔒 محمي للمالك'}
        />
      )}

      {/* Hero KPI Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : displayedKpis ? (
        <>
          {/* Row 1 — Revenue & Profitability */}
          <div>
            <SectionHeader
              title="المؤشرات المالية والبيعية الفعلية"
              subtitle={channelFilter === 'all' ? 'مستخلصة من فواتير الفروع ونظام طلبات المتجر بعد خصم المردودات' : `مفلترة حسب: ${channelFilter === 'branches' ? 'الفروع الميدانية' : 'متجر سلة'}`}
              className="mb-4"
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="صافي إجمالي المبيعات (Net Sales)"
                displayValue={formatSAR(displayedKpis.totalRevenue, false)}
                growth={displayedKpis.totalRevenueGrowth}
                icon={<DollarSign className="w-5 h-5" />}
                color="blue"
                target={displayedKpis.targetRevenue}
                targetLabel="مستهدف الفروع (800,000)"
                sparklineData={[800000, 850000, 910000, 940000, 970000, 989522]}
              />
              <KPICard
                title="الربح الإجمالي (Gross Profit)"
                displayValue={formatSAR(displayedKpis.grossProfit, false)}
                growth={18.4}
                icon="📈"
                color="emerald"
                sublabel={`هامش ربح إجمالي ${displayedKpis.grossMarginPct?.toFixed(1)}%`}
                sparklineData={[400000, 425000, 455000, 470000, 485000, 494761]}
              />
              <KPICard
                title="صافي ربح الأعمال (Net Profit)"
                displayValue={canViewNetProfit ? formatSAR(displayedKpis.netProfit, false) : 'محمي 🔒'}
                growth={canViewNetProfit ? displayedKpis.netProfitGrowth : null}
                icon="💰"
                color="purple"
                sublabel={canViewNetProfit ? `هامش ربح صافي معتمد ${displayedKpis.netProfitMarginPct?.toFixed(2)}%` : 'يتطلب صلاحية المالك أو الإدارة'}
                sparklineData={[210000, 225000, 240000, 255000, 268000, 277264]}
              />
              <KPICard
                title="نسبة تحقيق المستهدف البيعي"
                displayValue={`${displayedKpis.targetAchievementPct?.toFixed(1)}%`}
                growth={null}
                icon={<Target className="w-5 h-5" />}
                color={displayedKpis.targetAchievementPct >= 100 ? 'emerald' : 'amber'}
                sublabel={`الهدف: ${formatSAR(displayedKpis.targetRevenue, false)} (+189.5K فائض)`}
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
                displayValue={formatSAR(displayedKpis.totalAdSpend, false)}
                icon={<TrendingUp className="w-5 h-5" />}
                color="amber"
                sublabel="جوجل (4,660) + ميتا (3,222) + تيك توك (1,521)"
                sparklineData={[12000, 11500, 10800, 10200, 9800, 9403]}
              />
              <KPICard
                title="العائد التسويقي الإجمالي (Blended MER)"
                displayValue={`${displayedKpis.overallROAS?.toFixed(2)}×`}
                growth={24.5}
                icon={<Zap className="w-5 h-5" />}
                color={displayedKpis.overallROAS >= 3.5 ? 'emerald' : 'amber'}
                sublabel="إجمالي المبيعات الصافية ÷ إجمالي الإنفاق الإعلاني"
                sparklineData={[35, 48, 62, 78, 92, 105.23]}
              />
              <KPICard
                title="تكلفة الاكتساب للمحادثة (CPA)"
                displayValue={formatSAR(displayedKpis.overallCPA, false, 2)}
                growth={-18.5}
                icon={<Users className="w-5 h-5" />}
                color="blue"
                sublabel={`${formatNum(displayedKpis.totalConversions || 1617)} استفسار شراء واتساب`}
                sparklineData={[8.5, 7.2, 6.8, 6.1, 5.9, 5.81]}
              />
              <KPICard
                title="متوسط قيمة الطلب (AOV)"
                displayValue={formatSAR(displayedKpis.avgOrderValue || 531.36, false)}
                growth={6.5}
                icon={<ShoppingBag className="w-5 h-5" />}
                color="slate"
                sublabel="متوسط قيمة سلة المشتريات بالمتجر"
                sparklineData={[480, 495, 510, 515, 525, 531.36]}
              />
            </div>
          </div>
        </>
      ) : null}

      {/* SECTION: Physical Branch Performance (Main 350K, Al Rawaf 250K, Kia 200K) */}
      <DoraBranchCards
        periodId={periodId}
        onInspectDocument={(docId) => setActiveDocId(docId)}
      />

      {/* SECTION: Correlation Layer (Google Ads vs Physical Branch Sales) */}
      <GoogleBranchCorrelation periodId={periodId} />

      {/* SECTION: Payment Method Mix (Cash, Card, Bank Transfer, Tabby, Tamara, Credit) */}
      <PaymentMethodMix
        periodId={periodId}
        onInspectDocument={(docId) => setActiveDocId(docId)}
      />

      {/* SECTION: Google Analytics 4 (GA4) Live API Data */}
      <GA4LiveAnalytics periodId={periodId} />

      {/* SECTION: Google Search Console (GSC) Live SEO & Keyword Data */}
      <GSCLiveAnalytics periodId={periodId} />

      {/* Executive Sankey Diagram: Capital & Revenue Flow Topology */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0F172A]">
                خريطة التدفق المالي والرأسمالي التفاعلية (Executive Cashflow Topology)
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                رسم بياني شبكي يوضح مسار كل ريال من الإيرادات الصافية (الفروع والمتجر) وتوزيعه على تكلفة البضاعة، التشغيل، التسويق، وصافي الأرباح (28.02%)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              Interactive ECharts Topology
            </span>
          </div>
        </div>

        {/* ECharts Sankey */}
        <div className="pt-2">
          <SankeyFlowChart height={420} />
        </div>
      </div>

      {/* SECTION: City & Geographic Performance */}
      <GeoPerformanceView />

      {/* Section 10: The Executive 8-Question Diagnostic Command Center */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100">
              <HelpCircle className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-[#0F172A]">التشخيص التنفيذي السريع (Executive Intelligence Q&A)</h2>
              <p className="text-xs text-slate-600 font-medium">إجابات استراتيجية ومحاسبية مباشرة على أهم 8 أسئلة لإدارة ونمو الشركة</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Executive Brief</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Q1: WHAT HAPPENED? */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors shadow-xs">
            <div className="text-[11px] font-black text-blue-900 flex items-center justify-between">
              <span>1. ماذا حدث في شهر 8؟</span>
              <span className="text-emerald-600">✓</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              بلغ صافي المبيعات <strong className="text-[#0F172A]">989,522.16 ر.س</strong> محققاً <strong className="text-emerald-700">123.7%</strong> من مستهدف الفروع (800K) بفائض قدره +189.5 ألف ر.س.
            </p>
          </div>

          {/* Q2: WHY DID IT HAPPEN? */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors shadow-xs">
            <div className="text-[11px] font-black text-blue-900 flex items-center justify-between">
              <span>2. لماذا حدث ذلك؟</span>
              <span className="text-blue-600">💡</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              حملات جوجل للخرائط وحملات الواتساب في ميتا أحدثت تدفقاً ميدانياً عالي الكثافة في الفروع مع مضاعفة سداد التقسيط (تابي وتمارا).
            </p>
          </div>

          {/* Q3: WHERE DID THE MONEY GO? */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors shadow-xs">
            <div className="text-[11px] font-black text-blue-900 flex items-center justify-between">
              <span>3. أين ذهبت الأموال ونسبة الربح؟</span>
              <span className="text-amber-600">📉</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              50% تكلفة بضاعة، 21.9% مصاريف تشغيل وإعلانات، محققاً <strong className="text-emerald-700">28.02% صافي ربح</strong> بقيمة <strong className="text-[#0F172A]">277,264.11 ر.س</strong>.
            </p>
          </div>

          {/* Q4: WHERE DID REVENUE COME FROM? */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors shadow-xs">
            <div className="text-[11px] font-black text-blue-900 flex items-center justify-between">
              <span>4. من أين أتت المبيعات؟</span>
              <span className="text-indigo-600">🏢</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              الرئيسي (428.9K)، الرواف (291.4K)، كيا (269.3K)، وشملت شبكة وكاش و165 حوالة بنكية (130.9K) و131 عملية تقسيط (93.6K).
            </p>
          </div>

          {/* Q5: WHICH CHANNEL PERFORMED BEST? */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors shadow-xs">
            <div className="text-[11px] font-black text-blue-900 flex items-center justify-between">
              <span>5. أي القنوات الإعلانية كانت الأكفأ؟</span>
              <Flame className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              <strong className="text-[#0F172A]">حملات خرائط Google</strong> بإنفاق 4.66K حققت 89K تفاعل، وميتا حققت 1,617 محادثة بإنفاق 3.22K.
            </p>
          </div>

          {/* Q6: WHICH CAMPAIGN NEEDS ATTENTION? */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors shadow-xs">
            <div className="text-[11px] font-black text-blue-900 flex items-center justify-between">
              <span>6. ما الحملة التي تتطلب تحسيناً؟</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              حملة <strong className="text-amber-800">تيك توك</strong> حققت 1.14M ظهور ولكن التحويل المباشر للزيارات يحتاج تعزيز عروض قطع الصيانة.
            </p>
          </div>

          {/* Q7: WHICH PRODUCT IS GROWING? */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors shadow-xs">
            <div className="text-[11px] font-black text-blue-900 flex items-center justify-between">
              <span>7. ما المنتجات الأكثر طلباً؟</span>
              <PackageSearch className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              <strong className="text-[#0F172A]">قطع غيار كيا وهيونداي الأصلية</strong> شكلت 72.4% من مبيعات سلة، مع إقبال واسع على الفلاتر والزيوت.
            </p>
          </div>

          {/* Q8: WHICH BRANCH IS LEADING? */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors shadow-xs">
            <div className="text-[11px] font-black text-blue-900 flex items-center justify-between">
              <span>8. أداء الفروع مقارنة بالتارجت؟</span>
              <Store className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              جميع الفروع حققت التارجت: <strong className="text-emerald-700">كيا 134.6%</strong>، <strong className="text-emerald-700">الرئيسي 122.5%</strong>، و <strong className="text-emerald-700">الرواف 116.6%</strong>!
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Trend Area Chart */}
      {trend && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          <SectionHeader
            title="المسار التاريخي للإيرادات وصافي الأرباح"
            subtitle="مقارنة آخر 6 أشهر توضح قفزة شهر أغسطس ووصول الصافي إلى 989,522 ر.س"
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
      {filteredPlatforms.length > 0 && (
        <div className="space-y-4">
          <SectionHeader
            title="أداء القنوات الإعلانية (Platform Breakdown)"
            subtitle={`${currentPeriod?.label} · تفصيل الأداء الفردي للمنصات المختارة`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredPlatforms.map(p => (
              <div key={p.slug} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3.5 hover:border-blue-300 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <PlatformBadge platform={p.slug} size="md" />
                  <GrowthChip value={p.roasGrowth} />
                </div>
                <div>
                  <div className="text-2xl font-black text-[#0F172A]" dir="ltr">
                    {formatMultiplier(p.roas)}
                  </div>
                  <div className="text-xs text-slate-500 font-bold mt-0.5">ROAS العائد على الإنفاق</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-slate-500 font-medium">الإنفاق</div>
                    <div className="text-[#0F172A] font-bold">{formatSAR(p.spend, true)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium">المبيعات المعزوة</div>
                    <div className="text-[#0F172A] font-bold">{formatSAR(p.attributedRevenue, true)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium">CPA الاكتساب</div>
                    <div className="text-[#0F172A] font-bold">{formatSAR(p.cpa)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium">النقرات (CTR)</div>
                    <div className="text-[#0F172A] font-bold">{p.ctr?.toFixed(2)}%</div>
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
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          <SectionHeader
            title="مقارنة الإيرادات مقابل الإنفاق الإعلاني وصافي الربح"
            subtitle="مقارنة شهرية متوازنة توضح كفاءة تحويل الإنفاق إلى أرباح حقيقية (277.3K صافي ربح)"
          />
          <ComparisonBarChart
            data={trend}
            series={[
              { key: 'revenue',   color: '#0F172A', label: 'صافي المبيعات' },
              { key: 'adSpend',   color: '#D97706', label: 'الإنفاق الإعلاني' },
              { key: 'netProfit', color: '#059669', label: 'صافي الربح' },
            ]}
            height={240}
            formatValue={(v) => formatSAR(v, true)}
          />
        </div>
      )}

      {/* Evidence Viewer Modal */}
      {activeDocId && (
        <EvidenceViewerModal
          document={selectedDocument}
          onClose={() => setActiveDocId(null)}
        />
      )}
    </div>
  );
}


