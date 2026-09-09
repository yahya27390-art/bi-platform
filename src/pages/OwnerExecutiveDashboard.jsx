import React, { useState } from 'react';
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
} from 'lucide-react';
import doraLogo from '@/assets/dora_logo.png';
import OwnerSecurityGate from '../components/owner/OwnerSecurityGate';
import ExecutiveIncomeStatementTab from '../components/owner/ExecutiveIncomeStatementTab';
import OwnerCampaignTab from '../components/owner/OwnerCampaignTab';
import OwnerBranchesTab from '../components/owner/OwnerBranchesTab';
import OwnerStoreTab from '../components/owner/OwnerStoreTab';
import OwnerInventoryTab from '../components/owner/OwnerInventoryTab';

const VAULT_SESSION_KEY = 'dora_owner_vault_unlocked';
const VIEW_MODE_KEY = 'dora_owner_view_mode';

// ── Authentic August 2026 Figures ─────────────────────────────────────────────
const NET_SALES = 989522.16;
const COGS_TOTAL = 712159.10; // تكلفة البضاعة المباعة والمشتريات المعتمدة (71.97%)
const GROSS_PROFIT = 277363.06; // مجمل الربح المحقق قبل المصروفات التشغيلية (28.03%)
const MONTHLY_TARGET = 800000;
const GROSS_MARGIN_PCT = 28.03;
const OPEX_SALARIES = 60000;
const OPEX_FACILITIES = 20000;
const OPEX_CONTINGENCY = 10000;
const TOTAL_MONTHLY_OPEX = 90000; // رواتب 60 ألف + مرافق وإيجارات 20 ألف + احتياطي 10 آلاف
const NET_PROFIT = GROSS_PROFIT - TOTAL_MONTHLY_OPEX; // 187,363.06 SAR (صافي الربح الفعلي بعد خصم OPEX)
const NET_MARGIN_PCT = Number(((NET_PROFIT / NET_SALES) * 100).toFixed(2)); // 18.93%
const OPEX_COVERAGE_RATIO = Math.round((GROSS_PROFIT / TOTAL_MONTHLY_OPEX) * 100); // 308% تغطية مجمل الربح للتشغيل

// Tab configuration (5 core executive pillars)
const TABS = [
  { id: 'summary', label: 'المالية', emoji: '💰', icon: BarChart3 },
  { id: 'inventory', label: 'الأصناف', emoji: '📦', icon: Package },
  { id: 'branches', label: 'الفروع', emoji: '🏪', icon: MapPin },
  { id: 'campaigns', label: 'الحملات', emoji: '📊', icon: TrendingUp },
  { id: 'store', label: 'المتجر', emoji: '🛒', icon: ShoppingCart },
];

// ── Summary Tab: Verified KPI Cards Only ──────────────────────────────────────
function SummaryTab({ privacyMode, viewMode = 'mobile' }) {
  const mask = (val) => (privacyMode ? '••••••' : val);

  const kpis = [
    {
      label: 'صافي المبيعات',
      value: mask(NET_SALES.toLocaleString('ar-SA', { maximumFractionDigits: 0 })),
      unit: 'ر.س',
      sub: `${mask(((NET_SALES / MONTHLY_TARGET) * 100).toFixed(1))}% من التارجت`,
      color: '#0284C7',
      bg: '#EFF6FF',
      icon: '📈',
    },
    {
      label: 'مجمل الربح',
      value: mask(GROSS_PROFIT.toLocaleString('ar-SA', { maximumFractionDigits: 0 })),
      unit: 'ر.س',
      sub: `هامش مجمل: ${mask(GROSS_MARGIN_PCT)}%`,
      color: '#0284C7',
      bg: '#F0F9FF',
      icon: '🏆',
    },
    {
      label: 'صافي الربح الفعلي',
      value: mask(NET_PROFIT.toLocaleString('ar-SA', { maximumFractionDigits: 0 })),
      unit: 'ر.س',
      sub: `هامش صافي: ${mask(NET_MARGIN_PCT)}%`,
      color: '#059669',
      bg: '#F0FDF4',
      icon: '💵',
    },
    {
      label: 'تغطية المصروفات',
      value: mask(`${OPEX_COVERAGE_RATIO}%`),
      unit: '',
      sub: `OPEX: ${mask(TOTAL_MONTHLY_OPEX.toLocaleString('ar-SA'))} ر.س`,
      color: '#D97706',
      bg: '#FFFBEB',
      icon: '⚡',
    },
  ];

  const pillars = [
    { label: 'الرواتب', value: OPEX_SALARIES, color: '#0284C7' },
    { label: 'المرافق', value: OPEX_FACILITIES, color: '#7C3AED' },
    { label: 'الطوارئ', value: OPEX_CONTINGENCY, color: '#D97706' },
  ];

  // Target progress
  const targetPct = Math.min((NET_SALES / MONTHLY_TARGET) * 100, 200);

  const [showDetailedStatement, setShowDetailedStatement] = useState(viewMode === 'desktop');

  return (
    <div className="space-y-4 pb-2">

      {/* ── Monthly Target Strip ── */}
      <div className="bg-gradient-to-l from-[#0A192F] to-[#0F2744] rounded-2xl p-4 sm:p-5 text-white shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-xs text-slate-300 font-medium">تارجت أغسطس 2026</div>
            <div className="text-2xl sm:text-3xl font-black mt-0.5">
              {mask(MONTHLY_TARGET.toLocaleString('ar-SA'))} <span className="text-sm text-slate-300">ر.س</span>
            </div>
          </div>
          <div className="text-left">
            <div className="text-3xl sm:text-4xl font-black text-amber-400">{mask(`${targetPct.toFixed(1)}%`)}</div>
            <div className="text-[10px] sm:text-xs text-green-300 font-bold mt-0.5">✅ تجاوزنا الهدف المطلوب</div>
          </div>
        </div>
        <div className="h-3 bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-green-400 transition-all duration-1000"
            style={{ width: `${Math.min(targetPct, 100)}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-1 justify-between text-[10px] sm:text-xs text-slate-400 mt-1.5 font-mono">
          <span>المبيعات الفعلية: {mask(NET_SALES.toLocaleString('ar-SA', { maximumFractionDigits: 0 }))} ر.س</span>
          <span>فائض المبيعات: {mask(((NET_SALES - MONTHLY_TARGET)).toLocaleString('ar-SA', { maximumFractionDigits: 0 }))} ر.س</span>
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
            <div className="text-xs font-bold text-slate-500 mb-3">الأرقام المالية الرئيسية — أغسطس 2026 فقط</div>
            {[
              { label: 'صافي المبيعات', value: NET_SALES, color: '#0284C7', max: NET_SALES },
              { label: 'مجمل الربح', value: GROSS_PROFIT, color: '#7C3AED', max: NET_SALES },
              { label: 'صافي الربح', value: NET_PROFIT, color: '#059669', max: NET_SALES },
              { label: 'OPEX', value: TOTAL_MONTHLY_OPEX, color: '#D97706', max: NET_SALES },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="text-[10px] sm:text-xs text-slate-500 w-20 text-right shrink-0">{row.label}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-4 sm:h-5 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-1.5 transition-all duration-700"
                    style={{
                      width: `${(row.value / row.max) * 100}%`,
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
            ⚠️ أغسطس 2026 فقط — لا توجد أي بيانات تقديرية
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
            <div className="text-lg sm:text-xl font-black text-green-700">{mask(`${OPEX_COVERAGE_RATIO}%`)}</div>
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
              netSales={NET_SALES}
              netProfit={NET_PROFIT}
              grossProfit={GROSS_PROFIT}
              opexTotal={TOTAL_MONTHLY_OPEX}
              cogsTotal={COGS_TOTAL}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────────
export default function OwnerExecutiveDashboard() {
  const [isUnlocked, setIsUnlocked] = useState(() =>
    sessionStorage.getItem(VAULT_SESSION_KEY) === 'true'
  );
  const [activeTab, setActiveTab] = useState('summary');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [viewMode, setViewMode] = useState(() =>
    localStorage.getItem(VIEW_MODE_KEY) || 'mobile'
  );

  const handleLock = () => {
    sessionStorage.removeItem(VAULT_SESSION_KEY);
    setIsUnlocked(false);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  };

  if (!isUnlocked) {
    return <OwnerSecurityGate onUnlock={() => setIsUnlocked(true)} isUnlocked={isUnlocked} />;
  }

  const isDesktop = viewMode === 'desktop';

  return (
    <div
      className="min-h-screen font-sans text-slate-900"
      style={{ backgroundColor: '#F0F4F8', direction: 'rtl' }}
    >
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-30 border-b border-slate-800"
        style={{
          background: 'rgba(15, 23, 42, 0.98)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className={`mx-auto px-3 sm:px-4 py-2 sm:py-3 ${isDesktop ? 'max-w-6xl' : 'max-w-md'}`}>
          <div className="flex items-center justify-between gap-2">
            {/* Logo + Brand */}
            <div className="flex items-center gap-2 min-w-0">
              <img src={doraLogo} alt="درة" className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0" />
              <div className="min-w-0">
                <div className="text-white font-black text-xs sm:text-sm leading-tight flex items-center gap-1.5">
                  <span className="truncate">درة السيارة ( owner )</span>
                </div>
                {isDesktop && (
                  <div className="text-amber-400/90 text-[9px] font-bold truncate">
                    C-Suite Cockpit • أغسطس 2026
                  </div>
                )}
              </div>
            </div>

            {/* View Switcher (جوال ↔ كمبيوتر) */}
            <div className="flex items-center bg-slate-800/90 p-0.5 sm:p-1 rounded-xl border border-slate-700/60 shadow-inner shrink-0">
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
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>البيانات الفعلية: أغسطس 2026 فقط</span>
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
          <SummaryTab privacyMode={privacyMode} viewMode={viewMode} />
        )}
        {activeTab === 'inventory' && (
          <OwnerInventoryTab viewMode={viewMode} />
        )}
        {activeTab === 'branches' && (
          <OwnerBranchesTab viewMode={viewMode} />
        )}
        {activeTab === 'campaigns' && (
          <OwnerCampaignTab viewMode={viewMode} />
        )}
        {activeTab === 'store' && (
          <OwnerStoreTab viewMode={viewMode} />
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
    </div>
  );
}
