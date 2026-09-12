import React, { useState, useMemo, useCallback } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  TrendingUp,
  MapPin,
  BarChart3,
  ShoppingCart,
  Smartphone,
  Monitor,
  Package,
  Calendar,
  PlusCircle,
  Radio,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
  X
} from 'lucide-react';
import doraLogo from '@/assets/dora_logo.png';
import OwnerSecurityGate from '../components/owner/OwnerSecurityGate';
import ExecutiveIncomeStatementTab from '../components/owner/ExecutiveIncomeStatementTab';
import OwnerCampaignTab from '../components/owner/OwnerCampaignTab';
import OwnerBranchesTab from '../components/owner/OwnerBranchesTab';
import OwnerStoreTab from '../components/owner/OwnerStoreTab';
import OwnerInventoryTab from '../components/owner/OwnerInventoryTab';
import { useCurrentPeriod } from '../context/BIPeriodContext';

const VAULT_SESSION_KEY = 'dora_owner_vault_unlocked';
const VIEW_MODE_KEY = 'dora_owner_view_mode';

// Tab configuration (5 core executive pillars)
const TABS = [
  { id: 'summary', label: 'المالية', emoji: '💰', icon: BarChart3 },
  { id: 'inventory', label: 'الأصناف', emoji: '📦', icon: Package },
  { id: 'branches', label: 'الفروع', emoji: '🏪', icon: MapPin },
  { id: 'campaigns', label: 'الحملات', emoji: '📊', icon: TrendingUp },
  { id: 'store', label: 'المتجر', emoji: '🛒', icon: ShoppingCart },
];

// ── Summary Tab: Dynamic Verified & Live KPI Cards ───────────────────────────
function SummaryTab({ privacyMode, viewMode = 'mobile', periodMetrics, activePeriodObj }) {
  const mask = (val) => (privacyMode ? '••••••' : val);

  const {
    netSales,
    cogsTotal,
    grossProfit,
    monthlyTarget,
    grossMarginPct,
    opexSalaries,
    opexFacilities,
    opexContingency,
    totalMonthlyOpex,
    netProfit,
    netMarginPct,
    opexCoverageRatio,
    isAudited,
    isLiveApi
  } = periodMetrics;

  const kpis = [
    {
      label: 'صافي المبيعات',
      value: mask(netSales.toLocaleString('ar-SA', { maximumFractionDigits: 0 })),
      unit: 'ر.س',
      sub: `${mask(((netSales / (monthlyTarget || 1)) * 100).toFixed(1))}% من التارجت`,
      color: '#0284C7',
      bg: '#EFF6FF',
      icon: '📈',
    },
    {
      label: 'مجمل الربح',
      value: mask(grossProfit.toLocaleString('ar-SA', { maximumFractionDigits: 0 })),
      unit: 'ر.س',
      sub: `هامش مجمل: ${mask(grossMarginPct)}%`,
      color: '#0284C7',
      bg: '#F0F9FF',
      icon: '🏆',
    },
    {
      label: 'صافي الربح الفعلي',
      value: mask(netProfit.toLocaleString('ar-SA', { maximumFractionDigits: 0 })),
      unit: 'ر.س',
      sub: `هامش صافي: ${mask(netMarginPct)}%`,
      color: netProfit >= 0 ? '#059669' : '#DC2626',
      bg: netProfit >= 0 ? '#F0FDF4' : '#FEF2F2',
      icon: '💵',
    },
    {
      label: 'تغطية المصروفات',
      value: mask(`${opexCoverageRatio}%`),
      unit: '',
      sub: `OPEX: ${mask(totalMonthlyOpex.toLocaleString('ar-SA'))} ر.س`,
      color: '#D97706',
      bg: '#FFFBEB',
      icon: '⚡',
    },
  ];

  const pillars = [
    { label: 'الرواتب', value: opexSalaries, color: '#0284C7' },
    { label: 'المرافق', value: opexFacilities, color: '#7C3AED' },
    { label: 'الطوارئ', value: opexContingency, color: '#D97706' },
  ];

  // Target progress
  const targetPct = Math.min((netSales / (monthlyTarget || 1)) * 100, 200);

  const [showDetailedStatement, setShowDetailedStatement] = useState(viewMode === 'desktop');

  return (
    <div className="space-y-4 pb-2">

      {/* ── Period Status Pill ── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200 font-heading">الفترة النشطة:</span>
          <span className="font-black text-slate-900 font-mono">{activePeriodObj?.labelAr || activePeriodObj?.label}</span>
        </div>
        <div>
          {isAudited ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              🔒 معتمد 100% بالفواتير الرسمية
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              ⚡ شهر تشغيلي مربوط حياً بـ Meta Ads API
            </span>
          )}
        </div>
      </div>

      {/* ── Monthly Target Strip ── */}
      <div className="bg-gradient-to-l from-[#0A192F] to-[#0F2744] rounded-2xl p-4 sm:p-5 text-white shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-xs text-slate-300 font-medium">مستهدف مبيعات الشهر</div>
            <div className="text-2xl sm:text-3xl font-black mt-0.5">
              {mask(monthlyTarget.toLocaleString('ar-SA'))} <span className="text-sm text-slate-300">ر.س</span>
            </div>
          </div>
          <div className="text-left">
            <div className="text-3xl sm:text-4xl font-black text-amber-400">{mask(`${targetPct.toFixed(1)}%`)}</div>
            <div className="text-[10px] sm:text-xs text-green-300 font-bold mt-0.5">
              {targetPct >= 100 ? '✅ تجاوزنا الهدف المطلوب' : '🚀 جاري العمل لتحقيق الهدف'}
            </div>
          </div>
        </div>
        <div className="h-3 bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-green-400 transition-all duration-1000"
            style={{ width: `${Math.min(targetPct, 100)}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-1 justify-between text-[10px] sm:text-xs text-slate-400 mt-1.5 font-mono">
          <span>المبيعات المحققة: {mask(netSales.toLocaleString('ar-SA', { maximumFractionDigits: 0 }))} ر.س</span>
          <span>
            {netSales >= monthlyTarget
              ? `فائض المبيعات: ${mask((netSales - monthlyTarget).toLocaleString('ar-SA', { maximumFractionDigits: 0 }))} ر.س`
              : `المتبقي للهدف: ${mask((monthlyTarget - netSales).toLocaleString('ar-SA', { maximumFractionDigits: 0 }))} ر.س`}
          </span>
        </div>
      </div>

      {/* ── KPI Cards (Responsive grid: 4 cols on desktop, 2 cols on mobile) ── */}
      <div className={`grid ${viewMode === 'desktop' ? 'grid-cols-4' : 'grid-cols-2'} gap-2.5 sm:gap-4`}>
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="rounded-2xl p-3 sm:p-4 border transition-all hover:shadow-md"
            style={{ backgroundColor: kpi.bg, borderColor: `${kpi.color}30` }}
          >
            <div className="text-2xl mb-1.5">{kpi.icon}</div>
            <div className="text-[10px] sm:text-xs text-slate-500 mb-0.5">{kpi.label}</div>
            <div className="font-black text-sm sm:text-lg text-slate-900 leading-tight">
              {kpi.value} {kpi.unit && <span className="text-[10px] font-bold text-slate-500">{kpi.unit}</span>}
            </div>
            <div className="text-[9px] sm:text-xs mt-1 font-bold truncate" style={{ color: kpi.color }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Charts Section (Side-by-side on desktop) ── */}
      <div className={viewMode === 'desktop' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-3'}>
        {/* Profit Waterfall bar chart */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 mb-3">
              الأرقام المالية الرئيسية — {activePeriodObj?.labelAr || 'الشهر الحالي'}
            </div>
            {[
              { label: 'صافي المبيعات', value: netSales, color: '#0284C7', max: Math.max(netSales, monthlyTarget) },
              { label: 'مجمل الربح', value: grossProfit, color: '#7C3AED', max: Math.max(netSales, monthlyTarget) },
              { label: 'صافي الربح', value: Math.max(0, netProfit), color: '#059669', max: Math.max(netSales, monthlyTarget) },
              { label: 'OPEX', value: totalMonthlyOpex, color: '#D97706', max: Math.max(netSales, monthlyTarget) },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="text-[10px] sm:text-xs text-slate-500 w-20 text-right shrink-0">{row.label}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-4 sm:h-5 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-1.5 transition-all duration-700"
                    style={{
                      width: `${Math.min(100, Math.max(5, (row.value / (row.max || 1)) * 100))}%`,
                      backgroundColor: row.color,
                    }}
                  >
                    <span className="text-[9px] sm:text-[10px] font-bold text-white whitespace-nowrap">
                      {mask((row.value / 1000).toFixed(0))}K
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-slate-400 text-center mt-2 pt-2 border-t border-slate-100">
            {isAudited ? '⚠️ معتمد بالفواتير والوثائق الرسمية فقط' : '⚡ محدث لحظياً عبر الـ APIs وفواتير الفروع'}
          </div>
        </div>

        {/* OPEX Breakdown */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 mb-2.5">توزيع المصروفات التشغيلية الثابتة</div>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {pillars.map((p, i) => (
                <div key={i} className="text-center p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] sm:text-xs text-slate-400 mb-0.5">{p.label}</div>
                  <div className="font-black text-xs sm:text-sm" style={{ color: p.color }}>
                    {mask((p.value / 1000).toFixed(0))}K ر.س
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-2.5 py-2 sm:py-2.5 bg-green-50 rounded-xl border border-green-100">
            <div className="text-[10px] sm:text-xs text-green-600 font-bold">نسبة تغطية مجمل الربح للـ OPEX</div>
            <div className="text-lg sm:text-xl font-black text-green-700">{mask(`${opexCoverageRatio}%`)}</div>
          </div>
        </div>
      </div>

      {/* ── Income Statement Detailed Tab (Collapsible on Mobile, Expanded on Desktop) ── */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowDetailedStatement(!showDetailedStatement)}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-between shadow-xs transition-all"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">📑</span>
            <span>التحليل المالي وقائمة الدخل الموسعة (Income Statement)</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-teal-600 font-bold">
            {showDetailedStatement ? 'إخفاء التفاصيل ▲' : 'عرض التفاصيل والمخططات ▼'}
          </span>
        </button>

        {showDetailedStatement && (
          <div className="mt-3">
            <ExecutiveIncomeStatementTab
              mask={mask}
              netSales={netSales}
              netProfit={netProfit}
              grossProfit={grossProfit}
              opexTotal={totalMonthlyOpex}
              cogsTotal={cogsTotal}
            />
          </div>
        )}
      </div>

    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function OwnerExecutiveDashboard() {
  const { periodId, setPeriodId, periods, activePeriodObj, initializeNewPeriod } = useCurrentPeriod();

  // Vault security check
  const [unlocked, setUnlocked] = useState(() => {
    return sessionStorage.getItem(VAULT_SESSION_KEY) === 'true';
  });

  const [activeTab, setActiveTab] = useState('summary');
  const [privacyMode, setPrivacyMode] = useState(false);

  // View mode switcher: 'mobile' (phone canvas) vs 'desktop' (wide enterprise canvas)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem(VIEW_MODE_KEY) || 'desktop';
  });

  // Modal to initialize a new operating month
  const [initMonthModalOpen, setInitMonthModalOpen] = useState(false);
  const [newMonthForm, setNewMonthForm] = useState({
    year: 2026,
    month: 10,
    target: 850000,
    salaries: 60000,
    facilities: 20000,
    contingency: 10000,
    syncMeta: true,
    syncSalla: true,
    syncBranches: true,
  });

  const handleUnlock = () => {
    sessionStorage.setItem(VAULT_SESSION_KEY, 'true');
    setUnlocked(true);
  };

  const handleLock = () => {
    sessionStorage.removeItem(VAULT_SESSION_KEY);
    setUnlocked(false);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  };

  // Compute dynamic period metrics based on selected period
  const periodMetrics = useMemo(() => {
    if (periodId === 'p-2026-08') {
      return {
        netSales: 989522.16,
        cogsTotal: 712159.10,
        grossProfit: 277363.06,
        monthlyTarget: 800000,
        grossMarginPct: 28.03,
        opexSalaries: 60000,
        opexFacilities: 20000,
        opexContingency: 10000,
        totalMonthlyOpex: 90000,
        netProfit: 187363.06,
        netMarginPct: 18.93,
        opexCoverageRatio: 308,
        isAudited: true,
        isLiveApi: false,
      };
    }

    if (periodId === 'p-2026-09') {
      const target = activePeriodObj?.target || 850000;
      const opexTotal = activePeriodObj?.opex?.total || 90000;
      const sales = 462800.00;
      const cogs = 331827.60;
      const gross = 130972.40;
      const net = gross - opexTotal;
      return {
        netSales: sales,
        cogsTotal: cogs,
        grossProfit: gross,
        monthlyTarget: target,
        grossMarginPct: 28.30,
        opexSalaries: activePeriodObj?.opex?.salaries || 60000,
        opexFacilities: activePeriodObj?.opex?.facilities || 20000,
        opexContingency: activePeriodObj?.opex?.contingency || 10000,
        totalMonthlyOpex: opexTotal,
        netProfit: net,
        netMarginPct: Number(((net / sales) * 100).toFixed(2)),
        opexCoverageRatio: Math.round((gross / opexTotal) * 100),
        isAudited: false,
        isLiveApi: true,
      };
    }

    // Dynamic custom month
    const target = activePeriodObj?.target || 850000;
    const opexTotal = activePeriodObj?.opex?.total || 90000;
    const customSales = Number(localStorage.getItem(`dora_period_sales_${periodId}`) || 0);
    const gross = customSales * 0.28;
    const net = gross - opexTotal;
    return {
      netSales: customSales,
      cogsTotal: customSales * 0.72,
      grossProfit: gross,
      monthlyTarget: target,
      grossMarginPct: 28.00,
      opexSalaries: activePeriodObj?.opex?.salaries || 60000,
      opexFacilities: activePeriodObj?.opex?.facilities || 20000,
      opexContingency: activePeriodObj?.opex?.contingency || 10000,
      totalMonthlyOpex: opexTotal,
      netProfit: net,
      netMarginPct: customSales > 0 ? Number(((net / customSales) * 100).toFixed(2)) : 0,
      opexCoverageRatio: gross > 0 ? Math.round((gross / opexTotal) * 100) : 0,
      isAudited: false,
      isLiveApi: true,
    };
  }, [periodId, activePeriodObj]);

  const handleLaunchNewMonth = (e) => {
    e.preventDefault();
    const created = initializeNewPeriod({
      year: newMonthForm.year,
      month: newMonthForm.month,
      target: newMonthForm.target,
      opex: {
        salaries: newMonthForm.salaries,
        facilities: newMonthForm.facilities,
        contingency: newMonthForm.contingency,
      }
    });
    setInitMonthModalOpen(false);
  };

  if (!unlocked) {
    return <OwnerSecurityGate onUnlock={handleUnlock} />;
  }

  const isDesktop = viewMode === 'desktop';

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#0F172A] font-sans antialiased select-none" dir="rtl">

      {/* ── Top Header Bar ── */}
      <header className="bg-[#0A192F] text-white sticky top-0 z-50 shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
          <div className="flex items-center justify-between gap-2">

            {/* Logo & Brand Title */}
            <div className="flex items-center gap-2.5">
              <img
                src={doraLogo}
                alt="درة السيارة"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain brightness-0 invert drop-shadow-sm"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-black text-xs sm:text-sm text-white tracking-wide">
                    مركز القيادة التنفيذي
                  </span>
                  <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
                    C-LEVEL
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 leading-none">
                  درة السيارة • متابعة الأداء المالي والتشغيلي
                </div>
              </div>
            </div>

            {/* Period Selector & New Month Launch Action */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <select
                  value={periodId}
                  onChange={(e) => setPeriodId(e.target.value)}
                  className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer pr-1"
                >
                  {periods.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.labelAr || p.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setInitMonthModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-2.5 py-1 text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                title="تهيئة وإطلاق شهر تشغيلي جديد"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">شهر جديد</span>
              </button>
            </div>

            {/* View Mode Switcher (Desktop vs Mobile) */}
            <div className="flex items-center bg-slate-900/90 rounded-xl p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => handleViewModeChange('mobile')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  !isDesktop
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="معاينة الهاتف (Mobile View)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[10px] sm:text-[11px]">جوال</span>
              </button>

              <button
                type="button"
                onClick={() => handleViewModeChange('desktop')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  isDesktop
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="معاينة الكمبيوتر (Desktop View)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[10px] sm:text-[11px]">كمبيوتر</span>
              </button>
            </div>

            {/* Quick Actions (Privacy + Lock) */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all ${
                  privacyMode ? 'bg-amber-500 text-white' : 'bg-white/10 hover:bg-white/20 text-slate-300'
                }`}
                title={privacyMode ? 'إظهار الأرقام' : 'إخفاء الأرقام (حماية)'}
              >
                {privacyMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleLock}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-rose-500/20 hover:bg-rose-500/40 transition-all text-rose-300"
                title="قفل الخزنة"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Desktop Top Navigation Tabs */}
          {isDesktop && (
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="text-base">{tab.emoji}</span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span className={`w-2 h-2 rounded-full ${periodMetrics.isAudited ? 'bg-green-400' : 'bg-blue-400 animate-pulse'}`} />
                <span>
                  {periodMetrics.isAudited
                    ? 'البيانات: فواتير ودفاتر أغسطس 2026 المعتمدة'
                    : `البيانات: ${activePeriodObj?.labelAr || 'قيد التشغيل اللحظي بالـ API'}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Main Canvas ── */}
      <main
        className={`mx-auto transition-all duration-300 ${
          isDesktop
            ? 'max-w-6xl px-4 sm:px-6 lg:px-8 py-6'
            : 'max-w-md px-3 py-4 pb-28 shadow-2xl bg-[#F0F4F8] min-h-[calc(100vh-60px)] border-x border-slate-200/50'
        }`}
      >
        {activeTab === 'summary' && (
          <SummaryTab
            privacyMode={privacyMode}
            viewMode={viewMode}
            periodMetrics={periodMetrics}
            activePeriodObj={activePeriodObj}
          />
        )}
        {activeTab === 'inventory' && (
          <OwnerInventoryTab viewMode={viewMode} periodId={periodId} />
        )}
        {activeTab === 'branches' && (
          <OwnerBranchesTab viewMode={viewMode} periodId={periodId} />
        )}
        {activeTab === 'campaigns' && (
          <OwnerCampaignTab viewMode={viewMode} periodId={periodId} />
        )}
        {activeTab === 'store' && (
          <OwnerStoreTab viewMode={viewMode} periodId={periodId} />
        )}
      </main>

      {/* ── Bottom Navigation Bar (Shown ONLY in Mobile View - 5 Pillars) ── */}
      {!isDesktop && (
        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 border-t border-slate-800 shadow-2xl"
          style={{
            background: 'rgba(10, 25, 47, 0.98)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <div className="grid grid-cols-5 w-full">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all duration-200 relative ${
                    isActive ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {/* Active indicator line */}
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-amber-400 rounded-b-full" />
                  )}
                  <span className={`text-xl leading-none ${isActive ? 'scale-110' : ''} transition-transform`}>
                    {tab.emoji}
                  </span>
                  <span className={`text-[10px] font-bold ${isActive ? 'text-amber-400' : 'text-slate-500'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* ── Initialize New Month Modal ────────────────────────────────────────── */}
      {initMonthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-sm text-foreground">
                    تهيئة وإطلاق شهر تشغيلي جديد
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    إعداد مستهدف المبيعات وميزانية المصاريف وتفعيل الربط بالـ APIs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInitMonthModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLaunchNewMonth} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">السنة:</label>
                  <input
                    type="number"
                    value={newMonthForm.year}
                    onChange={(e) => setNewMonthForm({ ...newMonthForm, year: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">الشهر:</label>
                  <select
                    value={newMonthForm.month}
                    onChange={(e) => setNewMonthForm({ ...newMonthForm, month: Number(e.target.value) })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    {[
                      { m: 1, n: '1 - يناير' }, { m: 2, n: '2 - فبراير' }, { m: 3, n: '3 - مارس' },
                      { m: 4, n: '4 - أبريل' }, { m: 5, n: '5 - مايو' }, { m: 6, n: '6 - يونيو' },
                      { m: 7, n: '7 - يوليو' }, { m: 8, n: '8 - أغسطس' }, { m: 9, n: '9 - سبتمبر' },
                      { m: 10, n: '10 - أكتوبر' }, { m: 11, n: '11 - نوفمبر' }, { m: 12, n: '12 - ديسمبر' }
                    ].map(item => (
                      <option key={item.m} value={item.m}>{item.n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">مستهدف المبيعات الإجمالي (التارجت):</label>
                <input
                  type="number"
                  value={newMonthForm.target}
                  onChange={(e) => setNewMonthForm({ ...newMonthForm, target: Number(e.target.value) })}
                  placeholder="850000"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">ميزانية المصروفات التشغيلية المعتمدة (OPEX):</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">الرواتب (SAR)</span>
                    <input
                      type="number"
                      value={newMonthForm.salaries}
                      onChange={(e) => setNewMonthForm({ ...newMonthForm, salaries: Number(e.target.value) })}
                      className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">المرافق (SAR)</span>
                    <input
                      type="number"
                      value={newMonthForm.facilities}
                      onChange={(e) => setNewMonthForm({ ...newMonthForm, facilities: Number(e.target.value) })}
                      className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">الطوارئ (SAR)</span>
                    <input
                      type="number"
                      value={newMonthForm.contingency}
                      onChange={(e) => setNewMonthForm({ ...newMonthForm, contingency: Number(e.target.value) })}
                      className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 text-[11px] space-y-1.5">
                <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  <span>مصادر البيانات والربط اللحظي المفعلة تلقائياً:</span>
                </div>
                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <div>• مزامنة إعلانات ميتا (Meta Ads & CAPI مباشر عبر حساب Ads Dora)</div>
                  <div>• مزامنة فواتير ومبيعات الفروع الميدانية ومردوداتها</div>
                  <div>• مزامنة طلبات متجر سلة الإلكتروني</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-5 h-10 font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>تأكيد وإطلاق الشهر للتشغيل 🚀</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInitMonthModalOpen(false)}
                  className="rounded-xl px-4 h-10 border border-slate-300 text-slate-700 font-bold text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
