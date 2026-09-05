import { useState, useMemo } from 'react';
import { useBIData, usePeriods, useAdMetrics } from '../hooks/useBIData';
import { useBIAuth } from '../auth/BIAuthContext';
import { hasBIPermission } from '../lib/biPermissions';
import { formatSAR, formatNum, formatPercent, formatMultiplier } from '../lib/kpiEngine';
import KPICard from '../components/charts/KPICard';
import { TrendAreaChart, ComparisonBarChart } from '../components/charts/Charts';
import SankeyFlowChart from '../components/charts/SankeyFlowChart';
import {
  GrowthChip, AttributionNote, CardSkeleton, SectionHeader, TargetProgress,
  PlatformBadge, DataHealthBar, ReconciliationBanner
} from '../components/shared/SharedComponents';
import {
  TrendingUp, DollarSign, ShoppingBag, Users,
  Target, Percent, Zap, BarChart3, HelpCircle, CheckCircle2,
  AlertTriangle, ArrowUpRight, Flame, Store, PackageSearch, Filter, RotateCcw, Layers
} from 'lucide-react';

export default function BIOverview() {
  const [periodId, setPeriodId] = useState('p-2026-09');
  const [channelFilter, setChannelFilter] = useState('all'); // all | branches | ecommerce
  const [platformFilter, setPlatformFilter] = useState('all'); // all | meta | google | tiktok | snapchat

  const { user } = useBIAuth();
  const { data: periods } = usePeriods();
  const { kpis, trend, targets, loading } = useBIData(periodId);
  const { data: platforms } = useAdMetrics(periodId);

  const currentPeriod = periods?.find(p => p.id === periodId);
  const canViewNetProfit = hasBIPermission(user, 'canViewFinancialsFull');

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
      rev = 1200000;
      targetRev = 1180000;
      adSpend = kpis.totalAdSpend * 0.45;
    } else if (channelFilter === 'ecommerce') {
      rev = 280000;
      targetRev = 320000;
      adSpend = kpis.totalAdSpend * 0.55;
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
      targetAchievementPct: (rev / targetRev) * 100,
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
            <h1 className="text-2xl font-black text-white">مركز القيادة التنفيذي (Executive Command Center)</h1>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              LIVE C-LEVEL
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            {currentPeriod?.label} · تحليل استراتيجي ومترابط لكافة التدفقات النقدية، المبيعات، والإنفاق الإعلاني
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 shadow-inner">
          {periods?.slice(0, 3).map(p => (
            <button
              key={p.id}
              onClick={() => setPeriodId(p.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                periodId === p.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Cross-Filtering Control Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#0c1629]/90 backdrop-blur-md p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold ml-2">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>تصفية فورية:</span>
          </div>

          {/* Channel selector */}
          <div className="inline-flex rounded-xl bg-white/5 p-0.5 border border-white/5">
            {[
              { id: 'all', label: 'كافة القنوات' },
              { id: 'branches', label: 'الفروع الميدانية' },
              { id: 'ecommerce', label: 'متجر سلة' },
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setChannelFilter(c.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  channelFilter === c.id
                    ? 'bg-emerald-500 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Platform selector */}
          <div className="inline-flex rounded-xl bg-white/5 p-0.5 border border-white/5">
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
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  platformFilter === pl.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
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
            <span className="text-[11px] text-amber-300 font-medium bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
              تصفية نشطة: {channelFilter !== 'all' ? channelFilter : ''} {platformFilter !== 'all' ? `(${platformFilter})` : ''}
            </span>
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-colors border border-white/10"
            >
              <RotateCcw className="w-3 h-3" />
              إلغاء التصفية
            </button>
          </div>
        )}
      </div>

      {/* Section 11: Data Health Status Bar */}
      <DataHealthBar periodLabel={currentPeriod?.label || 'سبتمبر 2026'} />

      {/* Section 12: Data Reconciliation Banner (Anti Double-Counting) */}
      {displayedKpis && (
        <ReconciliationBanner
          actualRevenue={formatSAR(displayedKpis.totalRevenue, true)}
          attributedRevenue={formatSAR(displayedKpis.attributedRevenue, true)}
          adSpend={formatSAR(displayedKpis.totalAdSpend, true)}
          netProfit={canViewNetProfit ? formatSAR(displayedKpis.netProfit, true) : '🔒 محمي للمالك'}
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
              subtitle={channelFilter === 'all' ? 'مستخلصة من فواتير الفروع ونظام طلبات المتجر' : `مفلترة حسب: ${channelFilter === 'branches' ? 'الفروع الميدانية' : 'متجر سلة'}`}
              className="mb-4"
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="إجمالي الإيرادات الفعلية"
                displayValue={formatSAR(displayedKpis.totalRevenue, true)}
                growth={displayedKpis.totalRevenueGrowth}
                icon={<DollarSign className="w-5 h-5" />}
                color="emerald"
                target={displayedKpis.targetRevenue}
                targetLabel="الهدف الشهري"
                sparklineData={[1120000, 1180000, 1250000, 1310000, 1390000, 1480000]}
              />
              <KPICard
                title="الربح الإجمالي (Gross Profit)"
                displayValue={formatSAR(displayedKpis.grossProfit, true)}
                growth={12.4}
                icon="📈"
                color="blue"
                sublabel={`هامش ربح ${displayedKpis.grossMarginPct?.toFixed(1)}%`}
                sparklineData={[420000, 450000, 470000, 505000, 530000, 562400]}
              />
              <KPICard
                title="صافي الربح (Net Profit)"
                displayValue={canViewNetProfit ? formatSAR(displayedKpis.netProfit, true) : 'محمي 🔒'}
                growth={canViewNetProfit ? displayedKpis.netProfitGrowth : null}
                icon="💰"
                color="purple"
                sublabel={canViewNetProfit ? `هامش صافي ${displayedKpis.netProfitMarginPct?.toFixed(1)}%` : 'يتطلب صلاحية المالك أو الإدارة'}
                sparklineData={[160000, 175000, 185000, 198000, 205000, 214600]}
              />
              <KPICard
                title="تحقيق مستهدف الإيرادات"
                displayValue={`${displayedKpis.targetAchievementPct?.toFixed(1)}%`}
                growth={null}
                icon={<Target className="w-5 h-5" />}
                color={displayedKpis.targetAchievementPct >= 95 ? 'emerald' : displayedKpis.targetAchievementPct >= 80 ? 'amber' : 'red'}
                sublabel={`${formatSAR(displayedKpis.targetRevenue, true)} الهدف`}
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
                displayValue={formatSAR(displayedKpis.totalAdSpend, true)}
                icon={<TrendingUp className="w-5 h-5" />}
                color="amber"
                sublabel="ميتا + جوجل + تيك توك + سناب"
                sparklineData={[38000, 41000, 39500, 44000, 41500, 42800]}
              />
              <KPICard
                title="العائد الإجمالي (Blended ROAS)"
                displayValue={formatMultiplier(displayedKpis.overallROAS)}
                growth={18.2}
                icon={<Zap className="w-5 h-5" />}
                color={displayedKpis.overallROAS >= 3.5 ? 'emerald' : 'amber'}
                sublabel="الهدف: 3.50×"
                sparklineData={[3.2, 3.5, 3.8, 4.1, 4.3, 4.59]}
              />
              <KPICard
                title="تكلفة الاكتساب (Blended CPA)"
                displayValue={formatSAR(displayedKpis.overallCPA)}
                growth={-8.5}
                icon={<Users className="w-5 h-5" />}
                color="blue"
                sublabel={`${formatNum(displayedKpis.totalConversions)} عملية شراء/طلب`}
                sparklineData={[42, 39, 36, 34, 31, 29.5]}
              />
              <KPICard
                title="متوسط قيمة الطلب (AOV)"
                displayValue={formatSAR(displayedKpis.avgOrderValue)}
                growth={5.4}
                icon={<ShoppingBag className="w-5 h-5" />}
                color="cyan"
                sublabel={`من إجمالي ${formatNum(displayedKpis.totalOrders)} طلب متجر`}
                sparklineData={[420, 435, 440, 460, 475, 495]}
              />
            </div>
          </div>
        </>
      ) : null}

      {/* Executive Sankey Diagram: Capital & Revenue Flow Topology */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0c162a] to-[#080d18] p-6 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                خريطة التدفق المالي والرأسمالي التفاعلية (Executive Cashflow Topology)
              </h2>
              <p className="text-xs text-slate-400">
                رسم بياني شبكي يوضح مسار كل ريال من الإيرادات (الفروع والمتجر) وتوزيعه على تكلفة البضاعة، التشغيل، التسويق، وصافي الأرباح
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Interactive Apache ECharts
            </span>
          </div>
        </div>

        {/* ECharts Sankey */}
        <div className="pt-2">
          <SankeyFlowChart height={420} />
        </div>
      </div>

      {/* Section 10: The Executive 8-Question Diagnostic Command Center */}
      <div className="bg-[#0D1F38] border border-white/10 rounded-3xl p-6 space-y-6 shadow-xl">
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
          <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-2 hover:border-emerald-500/30 transition-colors">
            <div className="text-[11px] font-bold text-emerald-400 flex items-center justify-between">
              <span>1. ماذا حدث؟ (WHAT HAPPENED?)</span>
              <span className="text-emerald-400">✓</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-semibold">
              نمو قوي في الإيرادات بنسبة <strong className="text-emerald-400">+14.2%</strong> لتصل إلى 1.48 مليون ر.س، بتحقيق 98.7% من مستهدف الشهر.
            </p>
          </div>

          {/* Q2: WHY DID IT HAPPEN? */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-2 hover:border-sky-500/30 transition-colors">
            <div className="text-[11px] font-bold text-sky-400 flex items-center justify-between">
              <span>2. لماذا حدث ذلك؟ (WHY DID IT HAPPEN?)</span>
              <span className="text-sky-400">💡</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              تحسّن أداء حملات اليوم الوطني على ميتا وجوجل ورفع الـ ROAS العام إلى 4.59×، مع زيادة إقبال الصيانة في الفروع.
            </p>
          </div>

          {/* Q3: WHERE DID THE MONEY GO? */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-2 hover:border-amber-500/30 transition-colors">
            <div className="text-[11px] font-bold text-amber-400 flex items-center justify-between">
              <span>3. أين ذهبت الأموال؟ (WHERE DID MONEY GO?)</span>
              <span className="text-amber-400">📉</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              62% تكلفة البضاعة (COGS)، 23% مصاريف تشغيل ورواتب، و <strong className="text-amber-300">2.9% فقط</strong> إنفاق إعلاني مدروس (42.8 ألف ر.س).
            </p>
          </div>

          {/* Q4: WHERE DID REVENUE COME FROM? */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-2 hover:border-purple-500/30 transition-colors">
            <div className="text-[11px] font-bold text-purple-400 flex items-center justify-between">
              <span>4. من أين أتت الإيرادات؟ (REVENUE SOURCE)</span>
              <span className="text-purple-400">🏢</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              81% من الفروع الميدانية (1.20 مليون ر.س)، و 19% من مبيعات المتجر الإلكتروني سلة (280 ألف ر.س).
            </p>
          </div>

          {/* Q5: WHICH CHANNEL PERFORMED BEST? */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-2 hover:border-emerald-500/30 transition-colors">
            <div className="text-[11px] font-bold text-emerald-400 flex items-center justify-between">
              <span>5. أي القنوات حققت أفضل أداء؟</span>
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              <strong className="text-white">ميتا (Meta Ads)</strong> تصدرت بعائد <strong className="text-emerald-400">4.58× ROAS</strong> وصرف 18.2 ألف، تليها جوجل بعائد 4.09×.
            </p>
          </div>

          {/* Q6: WHICH CAMPAIGN NEEDS ATTENTION? */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-2 hover:border-red-500/30 transition-colors">
            <div className="text-[11px] font-bold text-red-400 flex items-center justify-between">
              <span>6. ما الحملة التي تتطلب تدخلاً؟</span>
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              حملة <strong className="text-amber-300">تيك توك عروض الصيانة</strong> CPA مرتفع (60 ر.س) وتم إيقافها مؤقتاً لمراجعة الكرييتف.
            </p>
          </div>

          {/* Q7: WHICH PRODUCT IS GROWING? */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-2 hover:border-cyan-500/30 transition-colors">
            <div className="text-[11px] font-bold text-cyan-400 flex items-center justify-between">
              <span>7. ما المنتجات الأكثر نمواً؟</span>
              <PackageSearch className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              <strong className="text-white">أقمشة فرامل هيونداي أصلية</strong> نمو مبيعات +28% بهامش ربح إجمالي ممتاز 46%.
            </p>
          </div>

          {/* Q8: WHICH BRANCH IS LEADING? */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-2 hover:border-emerald-500/30 transition-colors">
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
        <div className="rounded-3xl border border-white/5 bg-[#0D1E36] p-6 space-y-4 shadow-xl">
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
      {filteredPlatforms.length > 0 && (
        <div className="space-y-4">
          <SectionHeader
            title="أداء القنوات الإعلانية (Platform Breakdown)"
            subtitle={`${currentPeriod?.label} · تفصيل الأداء الفردي للمنصات المختارة`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredPlatforms.map(p => (
              <div key={p.slug} className="rounded-2xl border border-white/5 bg-[#0D1F38] p-5 space-y-3.5 hover:border-emerald-500/30 transition-all shadow-lg">
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
        <div className="rounded-3xl border border-white/5 bg-[#0D1E36] p-6 space-y-4 shadow-xl">
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

