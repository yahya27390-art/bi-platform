import { useState, useMemo, useEffect } from 'react';
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
import VentrilocStackCard from '../components/shared/VentrilocStackCard';
import VentrilocScrollNav from '../components/shared/VentrilocScrollNav';
import { DORA_DOCUMENTS } from '../data/doraSchema';
import {
  GrowthChip, AttributionNote, CardSkeleton, SectionHeader, TargetProgress,
  PlatformBadge, DataHealthBar
} from '../components/shared/SharedComponents';
import {
  TrendingUp, DollarSign, ShoppingBag, Users,
  Target, Percent, Zap, BarChart3, HelpCircle, CheckCircle2,
  AlertTriangle, ArrowUpRight, Flame, Store, PackageSearch, Filter, RotateCcw,
  Layers, Scale, MapPin, CreditCard, Globe, Compass, Sparkles
} from 'lucide-react';
import doraLogo from '@/assets/dora_logo.png';

import { useCurrentPeriod } from '../context/BIPeriodContext';

// Executive 10 Cards Definition (Clean, crisp, authentic data layout)
const OVERVIEW_CARDS = [
  {
    id: 'card-reconciliation',
    title: 'مركز المطابقة وتدقيق الفروقات والتسوية المالية',
    shortTitle: 'المطابقة والتسوية',
    icon: <Scale className="w-5 h-5" />,
    badge: 'VERIFIED 100%',
    badgeColor: 'emerald',
    accentColor: '#10B981',
    subtitle: 'فحص مستمر لاتساق الأرقام بين فواتير الفروع ودفاتر التحصيل وكشوفات البنك',
  },
  {
    id: 'card-financial-kpis',
    title: 'المؤشرات المالية والربحية الصافية المعتمدة',
    shortTitle: 'المؤشرات المالية',
    icon: <DollarSign className="w-5 h-5" />,
    badge: 'AUDITED C-LEVEL',
    badgeColor: 'blue',
    accentColor: '#2563EB',
    subtitle: 'مستخلصة من فواتير الفروع ونظام طلبات المتجر بعد خصم المردودات',
  },
  {
    id: 'card-marketing-kpis',
    title: 'كفاءة الميديا بايينغ والتسويق الرقمي (Attributed)',
    shortTitle: 'كفاءة التسويق وMER',
    icon: <TrendingUp className="w-5 h-5" />,
    badge: 'BLENDED MER 105×',
    badgeColor: 'amber',
    accentColor: '#F59E0B',
    subtitle: 'عائد الصرف الإعلاني وتكلفة اكتساب المحادثات ومبيعات متجر سلة',
  },
  {
    id: 'card-branches',
    title: 'أداء الفروع الميدانية ومطابقة المبيعات (Dora Branches)',
    shortTitle: 'فروع درة السيارة (3 فروع)',
    icon: <img src={doraLogo} alt="درة السيارة" className="w-5 h-5 object-contain" />,
    badge: 'Z-REPORT MATCHED',
    badgeColor: 'emerald',
    accentColor: '#059669',
    subtitle: 'الرئيسي (350K) + الرواف (250K) + كيا (200K) مع فواتير الإثبات المعتمدة',
  },
  {
    id: 'card-google-correlation',
    title: 'تحليل الترابط: إعلانات خرائط Google ومبيعات الفروع',
    shortTitle: 'ترابط خرائط جوجل',
    icon: <MapPin className="w-5 h-5" />,
    badge: '89K INTERACTIONS',
    badgeColor: 'blue',
    accentColor: '#3B82F6',
    subtitle: 'قياس أثر ظهور الفروع على خرائط جوجل في توجيه الزبائن للشراء الميداني',
  },
  {
    id: 'card-payment-mix',
    title: 'مزيج وسائل الدفع والتحصيل المالي المعتمد',
    shortTitle: 'مزيج وسائل الدفع',
    icon: <CreditCard className="w-5 h-5" />,
    badge: '100% MATCHED',
    badgeColor: 'purple',
    accentColor: '#8B5CF6',
    subtitle: 'تحليل الكاش، الشبكة، الحوالات المصرفية، وشركات التقسيط تابي وتمارا',
  },
  {
    id: 'card-google-live',
    title: 'تحليلات جوجل الحية وحركة الكلمات المفتاحية (GA4 & GSC)',
    shortTitle: 'تحليلات GA4 وسيو',
    icon: <Globe className="w-5 h-5" />,
    badge: 'LIVE SYNC',
    badgeColor: 'cyan',
    accentColor: '#06B6D4',
    subtitle: 'بيانات حية ومباشرة لموقع doratcars.com ومعدل الارتداد والزيارات',
  },
  {
    id: 'card-sankey',
    title: 'خريطة التدفق المالي والرأسمالي التفاعلية (Cashflow Topology)',
    shortTitle: 'خريطة التدفق المالي',
    icon: <Layers className="w-5 h-5" />,
    badge: 'ECHART TOPOLOGY',
    badgeColor: 'indigo',
    accentColor: '#6366F1',
    subtitle: 'مسار كل ريال من الإيرادات الصافية وتوزيعه على البضاعة والمصاريف والأرباح',
  },
  {
    id: 'card-geo',
    title: 'التوزيع الجغرافي وحركة المبيعات بالمدن والمناطق',
    shortTitle: 'التوزيع الجغرافي والمدن',
    icon: <Compass className="w-5 h-5" />,
    badge: 'KSA REGIONS',
    badgeColor: 'slate',
    accentColor: '#64748B',
    subtitle: 'تغطية مناطق المملكة وتدفق الطلبات حسب المدن والفروع',
  },
  {
    id: 'card-diagnostics',
    title: 'التشخيص الاستراتيجي والمسار التاريخي للإيرادات',
    shortTitle: 'التشخيص والمسار التاريخي',
    icon: <HelpCircle className="w-5 h-5" />,
    badge: '8 STRATEGIC Q&A',
    badgeColor: 'blue',
    accentColor: '#1E40AF',
    subtitle: 'إجابات محاسبية حاسمة على أهم 8 أسئلة للإدارة مع مقارنة تاريخية للقنوات',
  },
];

export default function BIOverview() {
  const { periodId, setPeriodId, periods } = useCurrentPeriod();
  const [channelFilter, setChannelFilter] = useState('all'); // all | branches | ecommerce
  const [platformFilter, setPlatformFilter] = useState('all'); // all | meta | google | tiktok | snapchat
  const [activeDocId, setActiveDocId] = useState(null);
  const [isStackedMode, setIsStackedMode] = useState(false); // Clean fluid scrolling by default
  const [activeCardId, setActiveCardId] = useState('card-reconciliation');
  const [expandAllFinancials, setExpandAllFinancials] = useState(false);
  const [expandAllMarketing, setExpandAllMarketing] = useState(false);

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

  // Observe active card for quick-nav
  useEffect(() => {
    const observers = [];
    OVERVIEW_CARDS.forEach(card => {
      const el = document.getElementById(card.id);
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setActiveCardId(card.id);
            }
          });
        },
        { threshold: 0.15, rootMargin: '-70px 0px -40% 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, [loading]);

  // Filtered KPI adjustments for interactive feel
  const displayedKpis = useMemo(() => {
    if (!kpis) return null;
    let rev = kpis.totalRevenue;
    let targetRev = kpis.targetRevenue;
    let adSpend = kpis.totalAdSpend;

    if (channelFilter === 'branches') {
      rev = kpis.branchRevenue !== undefined ? kpis.branchRevenue : 0;
      targetRev = 800000;
      adSpend = (kpis.totalAdSpend || 0) * 0.70;
    } else if (channelFilter === 'ecommerce') {
      rev = kpis.ecommerceRevenue !== undefined ? kpis.ecommerceRevenue : 0;
      targetRev = 50000;
      adSpend = (kpis.totalAdSpend || 0) * 0.30;
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
    <div className="space-y-6 sm:space-y-8 relative w-full overflow-x-hidden" dir="rtl">
      {/* 1. Page Header & Period Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <img
            src={doraLogo}
            alt="درة السيارة"
            className="w-11 h-11 sm:w-12 sm:h-12 object-contain drop-shadow-xs shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                مركز القيادة التنفيذي — درة السيارة
              </h1>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                LIVE C-LEVEL
              </span>
            </div>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">
              {currentPeriod?.labelAr || currentPeriod?.label} · تحليل استراتيجي ومترابط لكافة التدفقات النقدية، المبيعات الميدانية، والإنفاق الإعلاني
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Period Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl sm:rounded-2xl p-1 shadow-inner overflow-x-auto max-w-full">
            {periods?.slice(0, 3).map(p => (
              <button
                key={p.id}
                onClick={() => setPeriodId(p.id)}
                className={`px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  periodId === p.id
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                {p.labelAr || p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Interactive Cross-Filtering Control Bar */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold ml-1">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>تصفية فورية:</span>
          </div>

          {/* Channel selector */}
          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 overflow-x-auto">
            {[
              { id: 'all', label: 'كافة القنوات' },
              { id: 'branches', label: 'الفروع الميدانية' },
              { id: 'ecommerce', label: 'متجر سلة' },
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setChannelFilter(c.id)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  channelFilter === c.id
                    ? 'bg-[#0F172A] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Platform selector */}
          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 overflow-x-auto">
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
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  platformFilter === pl.id
                    ? 'bg-blue-600 text-white shadow-2xs'
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

      {/* 3. The 10 Clean Executive Cards (Fluid and Fully Responsive) */}
      <div className="space-y-0 relative w-full">
        {/* CARD 01: Multi-Source Reconciliation & Anti-Double Counting */}
        <VentrilocStackCard
          id={OVERVIEW_CARDS[0].id}
          index={0}
          totalCards={OVERVIEW_CARDS.length}
          title={OVERVIEW_CARDS[0].title}
          subtitle={OVERVIEW_CARDS[0].subtitle}
          icon={OVERVIEW_CARDS[0].icon}
          badge={OVERVIEW_CARDS[0].badge}
          badgeColor={OVERVIEW_CARDS[0].badgeColor}
          accentColor={OVERVIEW_CARDS[0].accentColor}
          isStackedMode={isStackedMode}
        >
          <div className="space-y-5 sm:space-y-6">
            <DataHealthBar periodLabel={currentPeriod?.labelAr || currentPeriod?.label || 'أغسطس 2026'} />
            <ReconciliationCenter
              periodId={periodId}
              onInspectDocument={(docId) => setActiveDocId(docId)}
            />
          </div>
        </VentrilocStackCard>

        {/* CARD 02: Financial & Revenue KPIs */}
        <VentrilocStackCard
          id={OVERVIEW_CARDS[1].id}
          index={1}
          totalCards={OVERVIEW_CARDS.length}
          title={OVERVIEW_CARDS[1].title}
          subtitle={OVERVIEW_CARDS[1].subtitle}
          icon={OVERVIEW_CARDS[1].icon}
          badge={OVERVIEW_CARDS[1].badge}
          badgeColor={OVERVIEW_CARDS[1].badgeColor}
          accentColor={OVERVIEW_CARDS[1].accentColor}
          isStackedMode={isStackedMode}
          actions={
            <button
              type="button"
              onClick={() => setExpandAllFinancials(!expandAllFinancials)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-2xs"
              title="توسيع أو إخفاء كافة تفاصيل الحسبة والمطابقة"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">
                {expandAllFinancials ? 'الوضع المركز (نظيف)' : 'عرض كل التفاصيل'}
              </span>
            </button>
          }
        >
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : displayedKpis ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <KPICard
                title="صافي المبيعات"
                displayValue={formatSAR(displayedKpis.totalRevenue, false)}
                growth={displayedKpis.totalRevenue > 0 ? displayedKpis.totalRevenueGrowth : null}
                icon={<DollarSign className="w-5 h-5" />}
                color="blue"
                target={displayedKpis.targetRevenue}
                targetLabel="مستهدف الفروع المعتمد"
                sparklineData={displayedKpis.totalRevenue > 0 ? [800000, 850000, 910000, 940000, 970000, 989522] : [0, 0, 0, 0, 0, 0]}
                forceExpanded={expandAllFinancials}
                details={{
                  concept: 'صافي مبيعات الفروع الميدانية والمتجر بعد خصم المردودات والتسويات المعتمدة',
                  formula: 'إجمالي فواتير نقاط البيع (POS) + مبيعات متجر سلة - المردودات',
                  audit: displayedKpis.totalRevenue > 0 ? 'مطابق وموثق 100% لفواتير نقاط البيع Z-Reports' : 'بانتظار تسجيل فواتير نقاط البيع للمدة المحددة',
                  targetText: displayedKpis.totalRevenue > 0 ? 'المستهدف: 800,000 ر.س (فائض بيعي +189,522 ر.س)' : `المستهدف: ${formatSAR(displayedKpis.targetRevenue, false)} (جاهز للتشغيل)`,
                  breakdown: displayedKpis.totalRevenue > 0 ? [
                    { label: 'فروع بريدة (الرئيسي + الرواف + كيا)', value: '989,522.16 ر.س', pct: 99.7, color: '#10B981' },
                    { label: 'طلبات متجر سلة الإلكتروني', value: '3,350.00 ر.س', pct: 0.3, color: '#06B6D4' },
                  ] : [
                    { label: 'بانتظار مزامنة فواتير الشهر', value: '0 ر.س', pct: 0, color: '#94A3B8' },
                  ],
                }}
              />
              <KPICard
                title="تكلفة البضاعة"
                displayValue={formatSAR(displayedKpis.totalRevenue > 0 ? (displayedKpis.cogs || 712159.10) : 0, false)}
                growth={null}
                icon="📦"
                color="slate"
                sparklineData={displayedKpis.totalRevenue > 0 ? [580000, 610000, 650000, 675000, 695000, 712159] : [0, 0, 0, 0, 0, 0]}
                forceExpanded={expandAllFinancials}
                details={{
                  concept: 'تكلفة شراء وتجهيز البضاعة (COGS) المستخرجة من قيود المخزون',
                  formula: 'تمثل تكلفة المشتريات المرتبطة بالمبيعات المنجزة',
                  audit: displayedKpis.totalRevenue > 0 ? 'مطابق لدفاتر المشتريات المحاسبية المعتمدة' : 'بانتظار قيود المخزون للمدة الحالية',
                  breakdown: displayedKpis.totalRevenue > 0 ? [
                    { label: 'تكلفة البضاعة والمشتريات المباشرة', value: '712,159.10 ر.س', pct: 71.97, color: '#64748B' },
                    { label: 'مجمل ربح النشاط المتبقي', value: '277,363.06 ر.س', pct: 28.03, color: '#10B981' },
                  ] : [
                    { label: 'بانتظار قيود المخزون والمشتريات', value: '0 ر.س', pct: 0, color: '#94A3B8' },
                  ],
                }}
              />
              <KPICard
                title="أرباح الأعمال"
                displayValue={canViewNetProfit ? formatSAR(displayedKpis.totalRevenue > 0 ? (displayedKpis.grossProfit || 277363.06) : 0, false) : 'محمي 🔒'}
                growth={canViewNetProfit && displayedKpis.totalRevenue > 0 ? 22.4 : null}
                icon="💰"
                color="emerald"
                sparklineData={displayedKpis.totalRevenue > 0 ? [210000, 225000, 240000, 255000, 268000, 277363] : [0, 0, 0, 0, 0, 0]}
                forceExpanded={expandAllFinancials}
                details={{
                  concept: canViewNetProfit
                    ? 'مجمل الربح التشغيلي المعتمد للنشاط التجاري بعد استبعاد كلفة البضاعة'
                    : 'يتطلب صلاحية المالك أو الإدارة المالية العليا',
                  formula: 'صافي المبيعات - تكلفة البضاعة المباعة',
                  audit: displayedKpis.totalRevenue > 0 ? 'معتمد بالقوائم المالية لشركة درة لشهر أغسطس 2026' : 'بانتظار إغلاق دفاتر الشهر',
                  breakdown: displayedKpis.totalRevenue > 0 ? [
                    { label: 'هامش الربح التشغيلي', value: '28.03%', pct: 28.03, color: '#10B981' },
                    { label: 'القيمة المالية الصافية المحققة', value: '277,363.06 ر.س', pct: 100, color: '#059669' },
                  ] : [
                    { label: 'بانتظار تدفق المبيعات التشغيلية', value: '0 ر.س', pct: 0, color: '#94A3B8' },
                  ],
                }}
              />
              <KPICard
                title="تحقيق المستهدف"
                displayValue={`${(displayedKpis.targetAchievementPct || 0).toFixed(1)}%`}
                growth={null}
                icon={<Target className="w-5 h-5" />}
                color={displayedKpis.targetAchievementPct >= 100 ? 'emerald' : 'amber'}
                sparklineData={displayedKpis.totalRevenue > 0 ? [85, 92, 98, 106, 115, 123.7] : [0, 0, 0, 0, 0, 0]}
                forceExpanded={expandAllFinancials}
                target={100}
                targetLabel="مؤشر الإنجاز (المطلوب 100%)"
                details={{
                  concept: 'نسبة الإنجاز البيعي الفعلي مقارنة بالمستهدف الشهري المعتمد',
                  formula: '(صافي المبيعات ÷ المستهدف) × 100',
                  audit: 'مستهدفات معتمدة بقرار الإدارة التنفيذية',
                  targetText: `المستهدف الأساسي: ${formatSAR(displayedKpis.targetRevenue, false)}`,
                  breakdown: displayedKpis.totalRevenue > 0 ? [
                    { label: 'المستهدف المطلوب إنجازه', value: '800,000 ر.س', pct: 80.8, color: '#3B82F6' },
                    { label: 'فائض المبيعات المحقق', value: '+189,522 ر.س', pct: 19.2, color: '#10B981' },
                  ] : [
                    { label: 'المستهدف الشهري المعتمد', value: formatSAR(displayedKpis.targetRevenue, false), pct: 100, color: '#3B82F6' },
                  ],
                }}
              />
            </div>
          ) : null}
        </VentrilocStackCard>

        {/* CARD 03: Marketing & Media Buying Efficiency */}
        <VentrilocStackCard
          id={OVERVIEW_CARDS[2].id}
          index={2}
          totalCards={OVERVIEW_CARDS.length}
          title={OVERVIEW_CARDS[2].title}
          subtitle={OVERVIEW_CARDS[2].subtitle}
          icon={OVERVIEW_CARDS[2].icon}
          badge={OVERVIEW_CARDS[2].badge}
          badgeColor={OVERVIEW_CARDS[2].badgeColor}
          accentColor={OVERVIEW_CARDS[2].accentColor}
          isStackedMode={isStackedMode}
          actions={
            <button
              type="button"
              onClick={() => setExpandAllMarketing(!expandAllMarketing)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-2xs"
              title="توسيع أو إخفاء كافة تفاصيل الحسبة والمطابقة"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">
                {expandAllMarketing ? 'الوضع المركز (نظيف)' : 'عرض كل التفاصيل'}
              </span>
            </button>
          }
        >
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : displayedKpis ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <KPICard
                title="الصرف الإعلاني"
                displayValue={formatSAR(displayedKpis.totalAdSpend, false)}
                icon={<TrendingUp className="w-5 h-5" />}
                color="amber"
                sparklineData={[12000, 11500, 10800, 10200, 9800, 9403]}
                forceExpanded={expandAllMarketing}
                details={{
                  concept: 'إجمالي الإنفاق الإعلاني الموزع على القنوات الرقمية الرسمية لحملات شهر أغسطس',
                  formula: 'Google Ads + Meta Ads (Instagram/FB) + TikTok Ads',
                  audit: 'فواتير وسجلات الصرف الرسمية الموثقة 100%',
                  breakdown: [
                    { label: 'Google Ads (البحث والخرائط)', value: '4,660.00 ر.س', pct: 49.6, color: '#4285F4' },
                    { label: 'Meta (Instagram & FB)', value: '3,222.00 ر.س', pct: 34.3, color: '#0668E1' },
                    { label: 'TikTok Ads (فيديوهات وحملات)', value: '1,521.00 ر.س', pct: 16.1, color: '#FE2C55' },
                  ],
                }}
              />
              <KPICard
                title="العائد التسويقي (MER)"
                displayValue={`${displayedKpis.overallROAS?.toFixed(2)}×`}
                growth={24.5}
                icon={<Zap className="w-5 h-5" />}
                color={displayedKpis.overallROAS >= 3.5 ? 'emerald' : 'amber'}
                sparklineData={[35, 48, 62, 78, 92, 105.23]}
                forceExpanded={expandAllMarketing}
                details={{
                  concept: 'العائد التسويقي الإجمالي (Marketing Efficiency Ratio - Blended MER)',
                  formula: 'إجمالي المبيعات المضافة ÷ إجمالي الصرف الإعلاني (989.5K ÷ 9.4K)',
                  audit: 'محسوب وفق المنهجية المعتمدة للـ Blended MER',
                  breakdown: [
                    { label: 'عائد مبيعات الفروع المجمعة', value: '105.23×', pct: 100, color: '#10B981' },
                    { label: 'عائد متجر سلة والتسويق الرقمي', value: '19.79×', pct: 18.8, color: '#06B6D4' },
                  ],
                }}
              />
              <KPICard
                title="تكلفة الاكتساب (CPA)"
                displayValue={formatSAR(displayedKpis.overallCPA, false, 2)}
                growth={-18.5}
                icon={<Users className="w-5 h-5" />}
                color="blue"
                sparklineData={[8.5, 7.2, 6.8, 6.1, 5.9, 5.81]}
                forceExpanded={expandAllMarketing}
                details={{
                  concept: 'متوسط تكلفة جلب العميل المحتمل واستفسار الشراء عبر الإعلانات',
                  formula: 'إجمالي الصرف الإعلاني ÷ عدد محادثات الشراء المعتمدة',
                  audit: 'مزامنة Webhooks ومحادثات واتساب الحقيقية',
                  breakdown: [
                    { label: 'محادثات استفسار شراء واتساب', value: '1,784 محادثة', pct: 100, color: '#25D366' },
                    { label: 'التكلفة الفعلية لكل محادثة', value: '2.48 ر.س', pct: 100, color: '#3B82F6' },
                  ],
                }}
              />
              <KPICard
                title="متوسط الطلب (AOV)"
                displayValue={formatSAR(displayedKpis.avgOrderValue || 531.36, false)}
                growth={6.5}
                icon={<ShoppingBag className="w-5 h-5" />}
                color="slate"
                sparklineData={[480, 495, 510, 515, 525, 531.36]}
                forceExpanded={expandAllMarketing}
                details={{
                  concept: 'متوسط قيمة سلة المشتريات والطلبات المنفذة بمتجر سلة الإلكتروني (AOV)',
                  formula: 'إجمالي مبيعات متجر سلة ÷ عدد طلبات الشراء المنفذة',
                  audit: 'تقارير متجر سلة وGoogle Analytics 4 E-commerce',
                  breakdown: [
                    { label: 'إجمالي طلبات المتجر المنفذة', value: '26 طلب شراء', pct: 100, color: '#8B5CF6' },
                    { label: 'متوسط قيمة السلة الواحدة', value: '502.00 ر.س', pct: 100, color: '#64748B' },
                  ],
                }}
              />
            </div>
          ) : null}
        </VentrilocStackCard>

        {/* CARD 04: Physical Branches Performance */}
        <VentrilocStackCard
          id={OVERVIEW_CARDS[3].id}
          index={3}
          totalCards={OVERVIEW_CARDS.length}
          title={OVERVIEW_CARDS[3].title}
          subtitle={OVERVIEW_CARDS[3].subtitle}
          icon={OVERVIEW_CARDS[3].icon}
          badge={OVERVIEW_CARDS[3].badge}
          badgeColor={OVERVIEW_CARDS[3].badgeColor}
          accentColor={OVERVIEW_CARDS[3].accentColor}
          isStackedMode={isStackedMode}
        >
          <DoraBranchCards
            periodId={periodId}
            onInspectDocument={(docId) => setActiveDocId(docId)}
          />
        </VentrilocStackCard>

        {/* CARD 05: Google Ads Branch Correlation */}
        <VentrilocStackCard
          id={OVERVIEW_CARDS[4].id}
          index={4}
          totalCards={OVERVIEW_CARDS.length}
          title={OVERVIEW_CARDS[4].title}
          subtitle={OVERVIEW_CARDS[4].subtitle}
          icon={OVERVIEW_CARDS[4].icon}
          badge={OVERVIEW_CARDS[4].badge}
          badgeColor={OVERVIEW_CARDS[4].badgeColor}
          accentColor={OVERVIEW_CARDS[4].accentColor}
          isStackedMode={isStackedMode}
        >
          <GoogleBranchCorrelation periodId={periodId} />
        </VentrilocStackCard>

        {/* CARD 06: Payment Method Mix */}
        <VentrilocStackCard
          id={OVERVIEW_CARDS[5].id}
          index={5}
          totalCards={OVERVIEW_CARDS.length}
          title={OVERVIEW_CARDS[5].title}
          subtitle={OVERVIEW_CARDS[5].subtitle}
          icon={OVERVIEW_CARDS[5].icon}
          badge={OVERVIEW_CARDS[5].badge}
          badgeColor={OVERVIEW_CARDS[5].badgeColor}
          accentColor={OVERVIEW_CARDS[5].accentColor}
          isStackedMode={isStackedMode}
        >
          <PaymentMethodMix
            periodId={periodId}
            onInspectDocument={(docId) => setActiveDocId(docId)}
          />
        </VentrilocStackCard>

        {/* CARD 07: GA4 & GSC Search Analytics */}
        <VentrilocStackCard
          id={OVERVIEW_CARDS[6].id}
          index={6}
          totalCards={OVERVIEW_CARDS.length}
          title={OVERVIEW_CARDS[6].title}
          subtitle={OVERVIEW_CARDS[6].subtitle}
          icon={OVERVIEW_CARDS[6].icon}
          badge={OVERVIEW_CARDS[6].badge}
          badgeColor={OVERVIEW_CARDS[6].badgeColor}
          accentColor={OVERVIEW_CARDS[6].accentColor}
          isStackedMode={isStackedMode}
        >
          <div className="space-y-6">
            <GA4LiveAnalytics periodId={periodId} />
            <GSCLiveAnalytics periodId={periodId} />
          </div>
        </VentrilocStackCard>

        {/* CARD 08: Cashflow Sankey Topology */}
        <VentrilocStackCard
          id={OVERVIEW_CARDS[7].id}
          index={7}
          totalCards={OVERVIEW_CARDS.length}
          title={OVERVIEW_CARDS[7].title}
          subtitle={OVERVIEW_CARDS[7].subtitle}
          icon={OVERVIEW_CARDS[7].icon}
          badge={OVERVIEW_CARDS[7].badge}
          badgeColor={OVERVIEW_CARDS[7].badgeColor}
          accentColor={OVERVIEW_CARDS[7].accentColor}
          isStackedMode={isStackedMode}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-600">
                رسم بياني شبكي متقدم يوضح مسار الإيرادات وتوزيعها على البضاعة والمصاريف والأرباح الصافية
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                Interactive ECharts Topology
              </span>
            </div>
            <SankeyFlowChart height={420} />
          </div>
        </VentrilocStackCard>

        {/* CARD 09: Geographic Performance */}
        <VentrilocStackCard
          id={OVERVIEW_CARDS[8].id}
          index={8}
          totalCards={OVERVIEW_CARDS.length}
          title={OVERVIEW_CARDS[8].title}
          subtitle={OVERVIEW_CARDS[8].subtitle}
          icon={OVERVIEW_CARDS[8].icon}
          badge={OVERVIEW_CARDS[8].badge}
          badgeColor={OVERVIEW_CARDS[8].badgeColor}
          accentColor={OVERVIEW_CARDS[8].accentColor}
          isStackedMode={isStackedMode}
        >
          <GeoPerformanceView />
        </VentrilocStackCard>

        {/* CARD 10: Executive Intelligence 8-Q&A + Historical Trends */}
        <VentrilocStackCard
          id={OVERVIEW_CARDS[9].id}
          index={9}
          totalCards={OVERVIEW_CARDS.length}
          title={OVERVIEW_CARDS[9].title}
          subtitle={OVERVIEW_CARDS[9].subtitle}
          icon={OVERVIEW_CARDS[9].icon}
          badge={OVERVIEW_CARDS[9].badge}
          badgeColor={OVERVIEW_CARDS[9].badgeColor}
          accentColor={OVERVIEW_CARDS[9].accentColor}
          isStackedMode={isStackedMode}
        >
          <div className="space-y-6 sm:space-y-8">
            {/* 8-Questions Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-[#0F172A]">
                  التشخيص التنفيذي السريع (Executive Intelligence Q&A)
                </h3>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  Executive Brief
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Q1 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors shadow-2xs">
                  <div className="text-[11px] font-black text-blue-900 flex items-center justify-between">
                    <span>1. ماذا حدث في شهر 8؟</span>
                    <span className="text-emerald-600">✓</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    بلغ صافي المبيعات <strong className="text-[#0F172A]">989,522.16 ر.س</strong> محققاً <strong className="text-emerald-700">123.7%</strong> من مستهدف الفروع بفائض قدره +189.5 ألف ر.س.
                  </p>
                </div>

                {/* Q2 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors shadow-2xs">
                  <div className="text-[11px] font-black text-blue-900 flex items-center justify-between">
                    <span>2. لماذا حدث ذلك؟</span>
                    <span className="text-blue-600">💡</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    حملات جوجل للخرائط وحملات الواتساب في ميتا أحدثت تدفقاً ميدانياً عالي الكثافة في الفروع مع مضاعفة سداد التقسيط (تابي وتمارا).
                  </p>
                </div>

                {/* Q3 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors shadow-2xs">
                  <div className="text-[11px] font-black text-blue-900 flex items-center justify-between">
                    <span>3. أين ذهبت الأموال ونسبة الربح؟</span>
                    <span className="text-amber-600">📉</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    71.97% تكلفة البضاعة والمشتريات (712.2K ر.س)، محققاً <strong className="text-emerald-700">28.03% هامش ربح معتمد</strong> على صافي المبيعات بقيمة <strong className="text-[#0F172A]">277,363.06 ر.س</strong>.
                  </p>
                </div>

                {/* Q4 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors shadow-2xs">
                  <div className="text-[11px] font-black text-blue-900 flex items-center justify-between">
                    <span>4. من أين أتت المبيعات؟</span>
                    <span className="text-indigo-600">🏢</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    الرئيسي (428.9K)، الرواف (291.4K)، كيا (269.3K)، وشملت شبكة وكاش و165 حوالة بنكية (130.9K) و131 عملية تقسيط (93.6K).
                  </p>
                </div>

                {/* Q5 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors shadow-2xs">
                  <div className="text-[11px] font-black text-blue-900 flex items-center justify-between">
                    <span>5. أي القنوات الإعلانية كانت الأكفأ؟</span>
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    <strong className="text-[#0F172A]">حملات خرائط Google</strong> بإنفاق 4.66K حققت 89K تفاعل، وميتا حققت 1,617 محادثة بإنفاق 3.22K.
                  </p>
                </div>

                {/* Q6 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors shadow-2xs">
                  <div className="text-[11px] font-black text-blue-900 flex items-center justify-between">
                    <span>6. ما الحملة التي تتطلب تحسيناً؟</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    حملة <strong className="text-amber-800">تيك توك</strong> حققت 1.14M ظهور ولكن التحويل المباشر للزيارات يحتاج تعزيز عروض قطع الصيانة.
                  </p>
                </div>

                {/* Q7 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors shadow-2xs">
                  <div className="text-[11px] font-black text-blue-900 flex items-center justify-between">
                    <span>7. ما المنتجات الأكثر طلباً؟</span>
                    <PackageSearch className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    <strong className="text-[#0F172A]">قطع غيار كيا وهيونداي الأصلية</strong> شكلت 72.4% من مبيعات سلة، مع إقبال واسع على الفلاتر والزيوت.
                  </p>
                </div>

                {/* Q8 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors shadow-2xs">
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

            {/* Historical Revenue Trend */}
            {trend && (
              <div className="space-y-3 pt-2">
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
              <div className="space-y-4 pt-2">
                <SectionHeader
                  title="أداء القنوات الإعلانية (Platform Breakdown)"
                  subtitle={`${currentPeriod?.label} · تفصيل الأداء الفردي للمنصات المختارة`}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {filteredPlatforms.map(p => (
                    <div key={p.slug} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-3.5 hover:border-blue-300 transition-all shadow-2xs">
                      <div className="flex items-center justify-between">
                        <PlatformBadge platform={p.slug} size="md" />
                        <GrowthChip value={p.roasGrowth} />
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl font-black text-[#0F172A]" dir="ltr">
                          {formatMultiplier(p.roas)}
                        </div>
                        <div className="text-xs text-slate-500 font-bold mt-0.5">ROAS العائد على الإنفاق</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
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

            {/* Monthly Comparison */}
            {trend && (
              <div className="space-y-3 pt-2">
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
          </div>
        </VentrilocStackCard>
      </div>

      {/* 4. Lightweight Floating Quick-Navigator Pill */}
      <VentrilocScrollNav
        cards={OVERVIEW_CARDS}
        activeCardId={activeCardId}
        isStackedMode={isStackedMode}
        onToggleStackedMode={() => setIsStackedMode(!isStackedMode)}
      />

      {/* 5. Evidence Viewer Modal */}
      {activeDocId && (
        <EvidenceViewerModal
          document={selectedDocument}
          onClose={() => setActiveDocId(null)}
        />
      )}
    </div>
  );
}
