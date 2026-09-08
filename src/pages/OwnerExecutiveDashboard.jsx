import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  Printer,
  TrendingUp,
  DollarSign,
  Boxes,
  MapPin,
  Flame,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Award,
  Layers,
  CheckCircle2,
  PackageX,
  ExternalLink,
  ChevronLeft,
  Upload,
  BarChart3,
  FileSpreadsheet,
  PieChart,
  Wallet,
  Activity,
  ShieldCheck,
  Compass
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { formatSAR, formatNum } from '../lib/kpiEngine';
import { REAL_INVENTORY_STATS } from '../data/realInventoryData';
import doraLogo from '@/assets/dora_logo.png';
import OwnerSecurityGate from '../components/owner/OwnerSecurityGate';
import ExecutiveReportsModal from '../components/shared/ExecutiveReportsModal';
import ExecutiveIncomeStatementTab from '../components/owner/ExecutiveIncomeStatementTab';
import ExecutiveBalanceSheetTab from '../components/owner/ExecutiveBalanceSheetTab';
import ExecutiveCashFlowTab from '../components/owner/ExecutiveCashFlowTab';
import ExecutiveRatiosRadarTab from '../components/owner/ExecutiveRatiosRadarTab';
import ExecutiveProfitabilityGauges from '../components/owner/ExecutiveProfitabilityGauges';

const VAULT_SESSION_KEY = 'dora_owner_vault_unlocked';

export default function OwnerExecutiveDashboard() {
  const navigate = useNavigate();
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem(VAULT_SESSION_KEY) === 'true';
  });
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'income' | 'balance' | 'cash' | 'ratios'
  const [privacyMode, setPrivacyMode] = useState(false);
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const [reportsModalTab, setReportsModalTab] = useState('stagnant');

  const handleLock = () => {
    sessionStorage.removeItem(VAULT_SESSION_KEY);
    setIsUnlocked(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const openReport = (tab) => {
    setReportsModalTab(tab);
    setReportsModalOpen(true);
  };

  // Masking helper for privacy mode
  const mask = (val) => {
    if (privacyMode) return '••••••';
    return val;
  };

  if (!isUnlocked) {
    return <OwnerSecurityGate onUnlock={() => setIsUnlocked(true)} isUnlocked={isUnlocked} />;
  }

  // ── Authentic Corporate Figures (August 2026 Mapped Data) ──
  const NET_SALES = 989522.16;
  const NET_PROFIT = 277363.06;
  const GROSS_PROFIT = 367363.06;
  const COGS_TOTAL = NET_SALES - GROSS_PROFIT; // 622,159.10 SAR
  const MONTHLY_TARGET = 800000;
  const PROFIT_MARGIN = 28.03;

  // Monthly Operating Fixed Overhead
  const OPEX_SALARIES = 60000;
  const OPEX_FACILITIES = 20000;
  const OPEX_CONTINGENCY = 10000;
  const TOTAL_MONTHLY_OPEX = OPEX_SALARIES + OPEX_FACILITIES + OPEX_CONTINGENCY; // 90,000 SAR
  const OPEX_COVERAGE_RATIO = ((NET_PROFIT / TOTAL_MONTHLY_OPEX) * 100).toFixed(0); // 308%

  // Branches breakdown
  const BRANCHES = [
    { id: 'b1', name: 'الفرع الرئيسي', sales: 428881.08, share: 43.3, color: '#0F2744', tag: 'المركز الأول' },
    { id: 'b2', name: 'فرع الرواف هيونداي', sales: 291365.50, share: 29.4, color: '#0284C7', tag: 'هيونداي' },
    { id: 'b3', name: 'فرع كيا المعتمد', sales: 269275.58, share: 27.2, color: '#F97316', tag: 'كيا' },
    { id: 'b4', name: 'متجر سلة أونلاين', sales: 41783.00, share: 4.2, color: '#10B981', tag: 'أونلاين' }
  ];

  // Performance Trend Line Option for Executive Summary Tab
  const performanceTrendOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['صافي المبيعات (Revenue)', 'مجمل الربح (Gross Profit)', 'الأرباح التشغيلية (EBITDA)', 'صافي الربح (Net Profit)'],
      top: 0,
      textStyle: { fontFamily: 'Cairo', fontSize: 11, color: '#334155', fontWeight: 'bold' }
    },
    grid: { left: '3%', right: '4%', bottom: '5%', top: '16%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['مايو 2026', 'يونيو 2026', 'يوليو 2026', 'أغسطس 2026'],
      axisLabel: { fontFamily: 'Cairo', fontSize: 11, color: '#334155' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v) => `${v / 1000}K`, fontFamily: 'Cairo', color: '#64748B' },
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    series: [
      {
        name: 'صافي المبيعات (Revenue)',
        type: 'line',
        smooth: true,
        data: [720000, 810000, 890000, 989522],
        itemStyle: { color: '#0F2744' },
        lineStyle: { width: 3.5 }
      },
      {
        name: 'مجمل الربح (Gross Profit)',
        type: 'line',
        smooth: true,
        data: [265000, 298000, 328000, 367363],
        itemStyle: { color: '#0284C7' },
        lineStyle: { width: 3 }
      },
      {
        name: 'الأرباح التشغيلية (EBITDA)',
        type: 'line',
        smooth: true,
        data: [195000, 222000, 245000, 277363],
        itemStyle: { color: '#F97316' },
        lineStyle: { width: 2.5 }
      },
      {
        name: 'صافي الربح (Net Profit)',
        type: 'line',
        smooth: true,
        data: [178000, 205000, 235000, 277363],
        itemStyle: { color: '#10B981' },
        lineStyle: { width: 3 }
      }
    ]
  };

  const TABS = [
    { id: 'summary', label: 'Executive Summary', arLabel: 'ملخص الأداء التنفيذي', icon: BarChart3 },
    { id: 'income', label: 'Income Statement', arLabel: 'قائمة الدخل ومخطط الشلال', icon: TrendingUp },
    { id: 'balance', label: 'Balance Sheet', arLabel: 'المركز المالي وأصول المخزون', icon: PieChart },
    { id: 'cash', label: 'Cash Flow', arLabel: 'التدفقات النقدية والسيولة', icon: Wallet },
    { id: 'ratios', label: 'Financial Ratios', arLabel: 'النسب المالية ومصفوفة الكفاءة', icon: Compass },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16 bg-[#F4F7FB] min-h-screen text-slate-900" dir="rtl">
      
      {/* ── 1. Top Executive Bar ── */}
      <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0A192F] text-amber-400 flex items-center justify-center font-black text-xl shadow-md shrink-0">
            ★
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#0A192F] tracking-tight">
                لوحة المالك التنفيذية — الإدارة العليا (C-Suite Cockpit)
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                فهد ناصر الجوعي
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              شركة درة السيارة لقطع غيار هيونداي وكيا · قراءة مالية ومخزنية تفاعلية بأسلوب إنفوجرافيك مؤسسي
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
          {/* Direct Button to Data Import Center */}
          <button
            onClick={() => navigate('/import')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            title="الذهاب لمركز استيراد وتدقيق البيانات"
          >
            <Upload className="w-4 h-4 text-white" />
            <span>مركز استيراد البيانات</span>
          </button>

          {/* Privacy Toggle */}
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              privacyMode
                ? 'bg-amber-100 border-amber-300 text-amber-950'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="إخفاء أو إظهار الأرقام الحساسة"
          >
            {privacyMode ? <EyeOff className="w-4 h-4 text-amber-700" /> : <Eye className="w-4 h-4 text-slate-500" />}
            <span>{privacyMode ? 'الأرقام مخفية 👁️' : 'حماية الأرقام'}</span>
          </button>

          {/* 1-Page Print */}
          <button
            onClick={handlePrint}
            className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>طباعة A4</span>
          </button>

          {/* Instant Lock */}
          <button
            onClick={handleLock}
            className="px-3 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-4 h-4 text-rose-600" />
            <span>قفل</span>
          </button>
        </div>
      </div>

      {/* ── 2. Data Import Alert / Quick Action Callout for Owner ── */}
      <div className="bg-gradient-to-r from-[#0A192F] to-[#1E3A5F] rounded-2xl p-4 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              مركز استيراد وتدقيق البيانات والحوكمة (Data Import & Governance)
            </h4>
            <p className="text-xs text-blue-200/80 mt-0.5">
              يتيح لك كمالك رفع واعتماد كشوف فواتير الفروع (Z-Report)، الحوالات البنكية، شيتات إعلانات ميتا وتيك توك، وتحديث الأرصدة المخزنية فورياً.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/import')}
          className="px-4 py-2 rounded-xl bg-white hover:bg-blue-50 text-[#0A192F] text-xs font-black transition-all shadow-sm shrink-0 flex items-center gap-2"
        >
          <span>دخول مركز الاستيراد والرفع</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* ── 3. Exact Layout of Image 3: Infographic Side-Bar / Top-Bar Tab Switcher ── */}
      <div className="bg-[#0A192F] p-2 rounded-2xl shadow-md">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FF5B00] text-white shadow-lg shadow-[#FF5B00]/30 ring-2 ring-[#FF5B00]/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] hidden lg:inline font-normal ${isActive ? 'text-white/90' : 'text-slate-400'}`}>
                  ({tab.arLabel})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. TAB CONTENTS ── */}

      {/* TAB 1: EXECUTIVE SUMMARY */}
      {activeTab === 'summary' && (
        <div className="space-y-6 animate-fadeIn">
          {/* The 8 Key Executive Financial Metrics (Exact Grid from Image 3) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* 1. Total Revenue */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 mb-1">
                صافي المبيعات (Total Revenue)
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#0A192F] font-mono mt-2">
                {mask(formatSAR(NET_SALES))}
              </div>
              <div className="mt-2 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+123.7% تجاوز التارجت</span>
              </div>
            </div>

            {/* 2. Gross Profit */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 mb-1">
                مجمل الربح (Gross Profit)
              </div>
              <div className="text-xl sm:text-2xl font-black text-blue-900 font-mono mt-2">
                {mask(formatSAR(GROSS_PROFIT))}
              </div>
              <div className="mt-2 text-[10px] text-blue-700 font-bold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>هامش 37.1% مجمل</span>
              </div>
            </div>

            {/* 3. Monthly Fixed OPEX */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 mb-1">
                التشغيل الثابت (Monthly OPEX)
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-900 font-mono mt-2">
                {mask(formatSAR(TOTAL_MONTHLY_OPEX))}
              </div>
              <div className="mt-2 text-[10px] text-slate-500 font-bold flex items-center gap-1">
                <span>تغطية الأرباح: {OPEX_COVERAGE_RATIO}%</span>
              </div>
            </div>

            {/* 4. Net Profit */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 mb-1">
                صافي الربح الحقيقي (Net Profit)
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-2">
                {mask(formatSAR(NET_PROFIT))}
              </div>
              <div className="mt-2 text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>صافي 28.03% (محسوب بدقة)</span>
              </div>
            </div>

            {/* 5. Inventory Items */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 mb-1">
                أصناف المستودع (Total SKUs)
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#0A192F] font-mono mt-2">
                8,693 <span className="text-xs font-sans text-slate-500 font-normal">صنف</span>
              </div>
              <div className="mt-2 text-[10px] text-rose-700 font-bold flex items-center justify-between">
                <span>2,082 صنف راكد</span>
                <button onClick={() => openReport('stagnant')} className="text-blue-600 hover:underline">
                  فحص ↗
                </button>
              </div>
            </div>

            {/* 6. Total Balance Pieces */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 mb-1">
                رصيد القطع (Warehouse Units)
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-2">
                {formatNum(REAL_INVENTORY_STATS.totalBalance)} <span className="text-xs font-sans text-slate-500 font-normal">قطعة</span>
              </div>
              <div className="mt-2 text-[10px] text-slate-500 font-bold">
                منصرف: {formatNum(REAL_INVENTORY_STATS.totalIssued)} قطعة
              </div>
            </div>

            {/* 7. Working Capital */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 mb-1">
                حقوق الملكية التقديرية (Equity)
              </div>
              <div className="text-xl sm:text-2xl font-black text-blue-900 font-mono mt-2">
                {mask('1.54M ر.س')}
              </div>
              <div className="mt-2 text-[10px] text-emerald-700 font-bold">
                ▲ التزامات الموردين مغطاة بالكامل
              </div>
            </div>

            {/* 8. Free Cash Balance */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 mb-1">
                السيولة الحرة (Cash Balance)
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#0A192F] font-mono mt-2">
                {mask('450,000 ر.س')}
              </div>
              <div className="mt-2 text-[10px] text-emerald-700 font-bold">
                ▲ أمان نقدي لتشغيل 5 أشهر
              </div>
            </div>
          </div>

          {/* Row: Financial Performance Trend + Profitability Gauges (Exact layout from Image 3) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Multi-Line Performance Trend (7 Cols) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-black text-[#0A192F]">
                  مسار الأداء المالي الرباعي (Financial Performance Trend)
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  مقارنة المبيعات مع مجمل الربح والتشغيل وصافي الأرباح
                </p>
              </div>
              <div className="h-[250px]" dir="ltr">
                <ReactECharts option={performanceTrendOption} style={{ height: '100%', width: '100%' }} />
              </div>
            </div>

            {/* Profitability Gauges (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <ExecutiveProfitabilityGauges />
              
              {/* Quick Branch Summary Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs mt-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2 border-b border-slate-100 pb-2">
                  <span>أعلى الفروع مساهمة في أرباح الشركة</span>
                  <span className="text-slate-400 font-mono">August 2026</span>
                </div>
                <div className="space-y-2">
                  {BRANCHES.slice(0, 3).map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                        {b.name}
                      </span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-slate-900 font-bold">{mask(formatSAR(b.sales))}</span>
                        <span className="text-slate-400 text-[10px]">({b.share}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row: Quick Audit Reports Callout Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#0A192F]">
                  تقارير تدقيق أصناف المستودع والحركة (Executive Inventory Audit)
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  استعراض فوري لأكثر 50 صنفاً طلباً، الأصناف الراكدة (2,082 صنفاً)، والأصناف التي نفذت مع بقاء الطلب عليها بصيغة رسمية جاهزة للطباعة والتصدير.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openReport('stagnant')}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-all"
              >
                الأصناف الراكدة (2,082)
              </button>
              <button
                onClick={() => openReport('top_selling')}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all"
              >
                الأكثر طلباً (50)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INCOME STATEMENT */}
      {activeTab === 'income' && (
        <ExecutiveIncomeStatementTab
          mask={mask}
          netSales={NET_SALES}
          netProfit={NET_PROFIT}
          grossProfit={GROSS_PROFIT}
          opexTotal={TOTAL_MONTHLY_OPEX}
          cogsTotal={COGS_TOTAL}
        />
      )}

      {/* TAB 3: BALANCE SHEET */}
      {activeTab === 'balance' && (
        <ExecutiveBalanceSheetTab
          mask={mask}
          onOpenReportsModal={openReport}
        />
      )}

      {/* TAB 4: CASH FLOW */}
      {activeTab === 'cash' && (
        <ExecutiveCashFlowTab
          mask={mask}
          netProfit={NET_PROFIT}
          opexTotal={TOTAL_MONTHLY_OPEX}
        />
      )}

      {/* TAB 5: FINANCIAL RATIOS & 5-AXIS RADAR */}
      {activeTab === 'ratios' && (
        <ExecutiveRatiosRadarTab />
      )}

      {/* Corporate Executive Audit Reports Modal (A4 Print Ready) */}
      <ExecutiveReportsModal
        isOpen={reportsModalOpen}
        onClose={() => setReportsModalOpen(false)}
        initialTab={reportsModalTab}
      />
    </div>
  );
}
