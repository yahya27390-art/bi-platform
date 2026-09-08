import React, { useState, useEffect } from 'react';
import {
  Crown,
  ShieldCheck,
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
  Clock,
  Layers,
  CheckCircle2,
  PackageX,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { formatSAR, formatNum } from '../lib/kpiEngine';
import { REAL_INVENTORY_STATS } from '../data/realInventoryData';
import doraLogo from '@/assets/dora_logo.png';
import OwnerSecurityGate from '../components/owner/OwnerSecurityGate';
import ExecutiveReportsModal from '../components/shared/ExecutiveReportsModal';

const VAULT_SESSION_KEY = 'dora_owner_vault_unlocked';

export default function OwnerExecutiveDashboard() {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem(VAULT_SESSION_KEY) === 'true';
  });
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

  // ── Authentic Corporate Baseline Figures (August / September 2026) ──
  const NET_SALES = 989522.16;
  const NET_PROFIT = 277363.06;
  const PROFIT_MARGIN = 28.03;
  const MONTHLY_TARGET = 800000;
  const TARGET_ACHIEVEMENT = 123.7;

  // Monthly Operating Fixed Overhead as specified by user
  const OPEX_SALARIES = 60000;
  const OPEX_FACILITIES = 20000; // Rent, shipping, electricity for all branches
  const OPEX_CONTINGENCY = 10000; // Buffer for increase/decrease
  const TOTAL_MONTHLY_OPEX = OPEX_SALARIES + OPEX_FACILITIES + OPEX_CONTINGENCY; // 90,000 SAR
  const OPEX_COVERAGE_RATIO = ((NET_PROFIT / TOTAL_MONTHLY_OPEX) * 100).toFixed(0); // 308%

  // Branches breakdown
  const BRANCHES = [
    { name: 'الفرع الرئيسي', sales: 428881.08, share: 43.3, color: 'from-blue-600 to-blue-700', badge: 'المتصدر' },
    { name: 'فرع الرواف هيونداي', sales: 291365.50, share: 29.4, color: 'from-indigo-600 to-indigo-700', badge: 'هيونداي' },
    { name: 'فرع كيا المعتمد', sales: 269275.58, share: 27.2, color: 'from-amber-600 to-amber-700', badge: 'كيا' },
    { name: 'المتجر الإلكتروني (سلة)', sales: 41783.00, share: 4.2, color: 'from-emerald-600 to-emerald-700', badge: 'نمو رقمي' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16" dir="rtl">
      {/* ── 1. Executive Titanium Top Command Bar ── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#0A0E1A] via-[#0E1526] to-[#0A0E1A] border border-amber-500/25 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
            <Crown className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                غرفة القيادة التنفيذية للمالك
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                C-SUITE VAULT
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              شركة درة السيارة لقطع الغيار · مؤشرات القرار الاستراتيجي والأرباح المباشرة
            </p>
          </div>
        </div>

        {/* Action Controls: Privacy Mode + Print + Lock Vault */}
        <div className="flex items-center gap-2 self-end md:self-center">
          {/* Privacy Mask Toggle */}
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ${
              privacyMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="إخفاء أو إظهار الأرقام الحساسة بنقرة واحدة"
          >
            {privacyMode ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
            <span>{privacyMode ? 'وضع الخصوصية نشط 👁️' : 'حماية الأرقام'}</span>
          </button>

          {/* 1-Click Executive Print */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700 hover:border-blue-500 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            title="طباعة التقرير التنفيذي المختصر"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>تقرير المالك A4</span>
          </button>

          {/* Instant Security Lock */}
          <button
            onClick={handleLock}
            className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 hover:border-rose-600 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            title="قفل الخزنة التنفيذية فوراً"
          >
            <Lock className="w-4 h-4" />
            <span>قفل فوري</span>
          </button>
        </div>
      </div>

      {/* ── 2. The 4 Big Bottom-Line Executive Cards (مختصرة بدون كلام كتير) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Net Sales */}
        <div className="relative p-5 rounded-3xl bg-[#0B1120] border border-blue-500/20 shadow-xl overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
            <span>صافي المبيعات الفعلي</span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {mask(formatSAR(NET_SALES))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +123.7% من المستهدف
            </span>
            <span className="text-slate-500 font-mono text-[11px]">بعد خصم المردودات</span>
          </div>
        </div>

        {/* Card 2: Net Profit */}
        <div className="relative p-5 rounded-3xl bg-[#0B1120] border border-emerald-500/25 shadow-xl overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
            <span>صافي الربح المكتسب</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
            {mask(formatSAR(NET_PROFIT))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-emerald-300 font-bold font-mono">هامش صافي: {PROFIT_MARGIN}%</span>
            <span className="text-slate-500 font-mono text-[11px]">ربح خالص معتمد</span>
          </div>
        </div>

        {/* Card 3: Monthly Fixed Operating Costs */}
        <div className="relative p-5 rounded-3xl bg-[#0B1120] border border-amber-500/20 shadow-xl overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
            <span>التشغيل والرواتب الشهرية</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-tight">
            {mask(formatSAR(TOTAL_MONTHLY_OPEX))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-bold font-mono">تغطية الأرباح: {OPEX_COVERAGE_RATIO}%</span>
            <span className="text-slate-500 font-mono text-[11px]">رواتب + تشغيل شامل</span>
          </div>
        </div>

        {/* Card 4: Inventory Real Assets */}
        <div className="relative p-5 rounded-3xl bg-[#0B1120] border border-cyan-500/20 shadow-xl overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
            <span>أصول المخزون بالمستودعات</span>
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Boxes className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {formatNum(REAL_INVENTORY_STATS.totalBalance)} <span className="text-sm font-sans font-bold text-slate-400">قطعة</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-cyan-300 font-bold font-mono">{formatNum(REAL_INVENTORY_STATS.totalSKUs)} صنف SKU</span>
            <span className="text-slate-500 font-mono text-[11px]">هيونداي وكيا</span>
          </div>
        </div>
      </div>

      {/* ── 3. Visual Executive Cockpit: Target Gauge & Branches & Inventory Pulse ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauge & Target Achievement (123.7%) */}
        <div className="p-6 rounded-3xl bg-[#0B1120] border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>معدل إنجاز المستهدف البيعي</span>
              </h3>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                متفوق 🚀
              </span>
            </div>

            {/* Visual Speedometer Progress */}
            <div className="relative my-6 flex flex-col items-center justify-center">
              <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {TARGET_ACHIEVEMENT}%
              </div>
              <div className="text-xs text-emerald-400 font-bold mt-1">
                تجاوز التارجت بـ +{mask(formatSAR(NET_SALES - MONTHLY_TARGET))}
              </div>

              <div className="w-full bg-slate-900 rounded-full h-3 mt-5 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-400 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, TARGET_ACHIEVEMENT)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-850 flex items-center justify-between text-xs">
            <span className="text-slate-400">تارجت الشهر المطلوب:</span>
            <span className="font-mono font-black text-slate-200">{mask(formatSAR(MONTHLY_TARGET))}</span>
          </div>
        </div>

        {/* Branches Real Cash Ranking (ترتيب الفروع الحقيقي) */}
        <div className="p-6 rounded-3xl bg-[#0B1120] border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>ترتيب الفروع ومصادر الكاش</span>
            </h3>

            <div className="space-y-3">
              {BRANCHES.map((b, idx) => (
                <div key={b.name} className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-850 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">{b.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{b.share}% من الإجمالي</div>
                    </div>
                  </div>
                  <div className="text-left font-mono font-black text-xs text-emerald-400">
                    {mask(formatSAR(b.sales))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
            <span>إجمالي المبيعات الميدانية:</span>
            <span className="font-mono font-bold text-white">{mask(formatSAR(NET_SALES))}</span>
          </div>
        </div>

        {/* Operating Fixed Overhead Breakdown (تفصيل الـ 90 ألف المعتمدة) */}
        <div className="p-6 rounded-3xl bg-[#0B1120] border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>ميزانية التشغيل الشهرية المعتمدة (90 ألف)</span>
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-850 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">الرواتب والأجور الشهرية</div>
                  <div className="text-[10px] text-slate-400">لكافة موظفي الفروع والمستودع</div>
                </div>
                <div className="font-mono font-black text-xs text-white">
                  {mask(formatSAR(OPEX_SALARIES))}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-850 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">التشغيل، الإيجار، الكهرباء والشحن</div>
                  <div className="text-[10px] text-slate-400">معدل كامل الفروع شامل الخدمات</div>
                </div>
                <div className="font-mono font-black text-xs text-white">
                  {mask(formatSAR(OPEX_FACILITIES))}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-850 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">هامش الأمان والتحوط</div>
                  <div className="text-[10px] text-slate-400">تحسباً لأي طارئ أو زيادة تشغيلية</div>
                </div>
                <div className="font-mono font-black text-xs text-amber-400">
                  {mask(formatSAR(OPEX_CONTINGENCY))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-850 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">صافي الربح بعد خصم كامل التشغيل:</span>
            <span className="font-mono font-black text-emerald-400">
              +{mask(formatSAR(NET_PROFIT - TOTAL_MONTHLY_OPEX))}
            </span>
          </div>
        </div>
      </div>

      {/* ── 4. Strategic One-Tap Directives (أزرار القرار التنفيذي السريع للمالك) ── */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B1120] via-[#0D1527] to-[#0B1120] border border-amber-500/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-white">
              قرارات المالك التنفيذية السريعة (One-Tap Actions)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">توجيهات مباشرة للعمليات وسلاسل الإمداد</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Directive 1: Stagnant Parts */}
          <button
            onClick={() => openReport('stagnant')}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-amber-500/15 border border-slate-800 hover:border-amber-500/40 text-right transition-all group active:scale-98 cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-amber-300">تسييل الأصناف الراكدة</span>
              <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:-translate-x-1" />
            </div>
            <div className="text-xs text-slate-300">
              استعراض الـ <strong className="font-mono text-white">2,082</strong> صنفاً مجمداً بالمستودع لتحرير السيولة عبر عروض خاصة.
            </div>
          </button>

          {/* Directive 2: Out of Stock */}
          <button
            onClick={() => openReport('out_of_stock')}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-rose-500/15 border border-slate-800 hover:border-rose-500/40 text-right transition-all group active:scale-98 cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-rose-300">إصدار أوامر توريد عاجلة</span>
              <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-transform group-hover:-translate-x-1" />
            </div>
            <div className="text-xs text-slate-300">
              متابعة الـ <strong className="font-mono text-white">2,186</strong> صنفاً حرجاً نافداً ولها طلب نشط لوقف الفرص الضائعة.
            </div>
          </button>

          {/* Directive 3: Top Selling & Margins */}
          <button
            onClick={() => openReport('top_selling')}
            className="p-4 rounded-2xl bg-slate-900/80 hover:bg-emerald-500/15 border border-slate-800 hover:border-emerald-500/40 text-right transition-all group active:scale-98 cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-emerald-300">تحصين الأصناف الأكثر طلباً</span>
              <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:-translate-x-1" />
            </div>
            <div className="text-xs text-slate-300">
              تأمين عقود سنوية لـ <strong className="font-mono text-white">توب 50</strong> صنفاً تمثل عصب إيرادات الفروع.
            </div>
          </button>
        </div>
      </div>

      {/* ── Executive Modal Container when opened from Owner Dashboard ── */}
      <ExecutiveReportsModal
        isOpen={reportsModalOpen}
        onClose={() => setReportsModalOpen(false)}
        initialTab={reportsModalTab}
      />
    </div>
  );
}
