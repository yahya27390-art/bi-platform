import React, { useState } from 'react';
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
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [gaugeHovered, setGaugeHovered] = useState(false);

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
    { id: 'b1', name: 'الفرع الرئيسي', sales: 428881.08, share: 43.3, color: '#2563EB', tag: 'المركز الأول' },
    { id: 'b2', name: 'فرع الرواف هيونداي', sales: 291365.50, share: 29.4, color: '#4F46E5', tag: 'هيونداي' },
    { id: 'b3', name: 'فرع كيا المعتمد', sales: 269275.58, share: 27.2, color: '#D97706', tag: 'كيا' },
    { id: 'b4', name: 'متجر سلة أونلاين', sales: 41783.00, share: 4.2, color: '#059669', tag: 'أونلاين' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16 bg-[#F8FAFC] text-slate-900" dir="rtl">
      
      {/* ── 1. Header: Sharp Sketchbook Architectural Style (No Rounded Edges) ── */}
      <div className="border-2 border-slate-900 bg-white p-4 sm:p-5 shadow-[5px_5px_0px_0px_#0F172A] rounded-none flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 border-2 border-slate-900 bg-amber-300 rounded-none flex items-center justify-center font-mono font-black text-xl shadow-[3px_3px_0px_0px_#0F172A] shrink-0">
            ★
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                لوحة المالك التنفيذية — خلاصة الأعمال
              </h1>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 border-2 border-slate-900 bg-yellow-200 text-slate-900 rounded-none">
                C-SUITE
              </span>
            </div>
            <p className="text-xs text-slate-600 font-bold mt-0.5">
              شركة درة السيارة لقطع غيار هيونداي وكيا · قراءة مالية ومخزنية مباشرة بدون حشو
            </p>
          </div>
        </div>

        {/* Action Buttons: Sharp Rectangular Buttons with Tactile Drop Shadows */}
        <div className="flex items-center gap-2 self-end md:self-center">
          {/* Privacy Toggle */}
          <button
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`px-3 py-2 border-2 border-slate-900 text-xs font-black rounded-none shadow-[3px_3px_0px_0px_#0F172A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer ${
              privacyMode ? 'bg-amber-300 text-slate-950' : 'bg-white text-slate-900 hover:bg-slate-100'
            }`}
            title="إخفاء أو إظهار الأرقام الحساسة"
          >
            {privacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{privacyMode ? 'الأرقام مخفية 👁️' : 'حماية الأرقام'}</span>
          </button>

          {/* 1-Page Print */}
          <button
            onClick={handlePrint}
            className="px-3 py-2 border-2 border-slate-900 bg-white hover:bg-slate-100 text-slate-900 text-xs font-black rounded-none shadow-[3px_3px_0px_0px_#0F172A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة A4</span>
          </button>

          {/* Instant Lock */}
          <button
            onClick={handleLock}
            className="px-3 py-2 border-2 border-slate-900 bg-rose-100 hover:bg-rose-200 text-rose-950 text-xs font-black rounded-none shadow-[3px_3px_0px_0px_#0F172A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>قفل</span>
          </button>
        </div>
      </div>

      {/* ── 2. The 4 Big Bottom-Line Cards: Sharp Brutalist Rectangles (No Rounded Corners) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Net Sales */}
        <div className="relative border-2 border-slate-900 bg-white p-5 shadow-[4px_4px_0px_0px_#0F172A] rounded-none">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1 border-b border-dashed border-slate-300 pb-2">
            <span>[ 01 ] صافي المبيعات الفعلي</span>
            <span className="font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.2 border border-slate-900 text-[11px] font-bold">
              +123.7%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tracking-tight mt-3">
            {mask(formatSAR(NET_SALES))}
          </div>
          {/* Hand-drawn sketch underline */}
          <div className="mt-2 text-[11px] text-slate-600 font-bold flex items-center gap-1">
            <span>تجاوز التارجت بـ</span>
            <span className="font-mono text-emerald-800 bg-yellow-200 px-1 font-black">+{mask(formatSAR(NET_SALES - MONTHLY_TARGET))}</span>
          </div>
        </div>

        {/* Card 2: Net Profit */}
        <div className="relative border-2 border-slate-900 bg-white p-5 shadow-[4px_4px_0px_0px_#0F172A] rounded-none">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1 border-b border-dashed border-slate-300 pb-2">
            <span>[ 02 ] صافي الربح الحقيقي</span>
            <span className="font-mono text-blue-900 bg-blue-100 px-1.5 py-0.2 border border-slate-900 text-[11px] font-bold">
              صافي 28%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono tracking-tight mt-3">
            {mask(formatSAR(NET_PROFIT))}
          </div>
          <div className="mt-2 text-[11px] text-slate-600 font-bold flex items-center gap-1">
            <span>هامش الربح الصافي:</span>
            <span className="font-mono font-black text-slate-900">{PROFIT_MARGIN}%</span>
            <span className="text-[10px] text-slate-500 font-normal mr-1">(محسوب بدقة)</span>
          </div>
        </div>

        {/* Card 3: Monthly Fixed Operating Costs */}
        <div className="relative border-2 border-slate-900 bg-white p-5 shadow-[4px_4px_0px_0px_#0F172A] rounded-none">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1 border-b border-dashed border-slate-300 pb-2">
            <span>[ 03 ] التشغيل والرواتب الثابتة</span>
            <span className="font-mono text-amber-900 bg-amber-100 px-1.5 py-0.2 border border-slate-900 text-[11px] font-bold">
              90K شهرياً
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight mt-3">
            {mask(formatSAR(TOTAL_MONTHLY_OPEX))}
          </div>
          <div className="mt-2 text-[11px] text-slate-600 font-bold flex items-center gap-1">
            <span>تغطية الأرباح للتشغيل:</span>
            <span className="font-mono font-black text-emerald-700 bg-emerald-100 px-1">{OPEX_COVERAGE_RATIO}%</span>
            <span className="text-xs">↗ (3.1 أضعاف)</span>
          </div>
        </div>

        {/* Card 4: Inventory Real Assets */}
        <div className="relative border-2 border-slate-900 bg-white p-5 shadow-[4px_4px_0px_0px_#0F172A] rounded-none">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1 border-b border-dashed border-slate-300 pb-2">
            <span>[ 04 ] أصول المخزون بالمستودع</span>
            <span className="font-mono text-cyan-900 bg-cyan-100 px-1.5 py-0.2 border border-slate-900 text-[11px] font-bold">
              8,693 صنف
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tracking-tight mt-3">
            {formatNum(REAL_INVENTORY_STATS.totalBalance)} <span className="text-sm font-sans font-bold text-slate-600">قطعة</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 font-bold flex items-center justify-between">
            <span>مبيعات منصرفة: {formatNum(REAL_INVENTORY_STATS.totalIssued)}</span>
            <span className="font-mono text-rose-700 font-black">2,082 راكد ⚠️</span>
          </div>
        </div>
      </div>

      {/* ── 3. Interactive Hand-Drawn Sketch Charts & Tactical Visuals ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (5 cols): Hand-drawn SVG Speedometer / Gauge */}
        <div 
          onMouseEnter={() => setGaugeHovered(true)}
          onMouseLeave={() => setGaugeHovered(false)}
          className="lg:col-span-5 border-2 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_#0F172A] rounded-none flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span>✦</span>
                <span>مقياس إنجاز التارجت (Hand-Drawn Gauge)</span>
              </h3>
              <span className="text-xs font-mono font-black bg-yellow-200 border border-slate-900 px-2 py-0.5 rounded-none">
                123.7% من الهدف
              </span>
            </div>

            {/* Hand-Drawn Interactive SVG Speedometer Gauge */}
            <div className="relative flex flex-col items-center justify-center my-3">
              <svg className="w-64 h-36 overflow-visible" viewBox="0 0 200 115">
                {/* Background arc: sketchy dashed gray curve */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="14"
                  strokeLinecap="butt"
                />
                
                {/* Target marker line at 100% (approx at angle 180 * (100/150) = 120 deg) */}
                <line x1="100" y1="20" x2="100" y2="35" stroke="#64748B" strokeWidth="2" strokeDasharray="2 2" />
                <text x="100" y="15" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#64748B" fontFamily="monospace">تارجت 800K</text>

                {/* Progress arc: Hand-drawn sketchy Green/Amber curve */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="14"
                  strokeDasharray="251"
                  strokeDashoffset={251 - (251 * (Math.min(130, TARGET_ACHIEVEMENT) / 150))}
                  strokeLinecap="butt"
                  className="transition-all duration-700"
                />

                {/* Hand-drawn sketch tick marks around perimeter */}
                {[0, 30, 60, 90, 120, 150].map((deg, i) => {
                  const rad = (Math.PI / 180) * (180 + deg);
                  const x1 = 100 + 72 * Math.cos(rad);
                  const y1 = 100 + 72 * Math.sin(rad);
                  const x2 = 100 + 82 * Math.cos(rad);
                  const y2 = 100 + 82 * Math.sin(rad);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0F172A" strokeWidth="2" />;
                })}

                {/* Center Pivot: sharp square */}
                <rect x="94" y="94" width="12" height="12" fill="#0F172A" />

                {/* Hand-drawn Needle: wiggles slightly on hover */}
                <g className={`transition-transform duration-500 origin-[100px_100px] ${gaugeHovered ? 'rotate-[-10deg]' : 'rotate-0'}`}>
                  {/* Needle pointing past 100% at ~123.7% position */}
                  <line x1="100" y1="100" x2="148" y2="46" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
                  <line x1="100" y1="100" x2="148" y2="46" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
                  {/* Hand-drawn arrow tip */}
                  <polygon points="148,46 142,53 149,55" fill="#0F172A" />
                </g>
              </svg>

              {/* Hand-drawn annotation text callout */}
              <div className="border border-slate-900 bg-amber-100 px-3 py-1 mt-1 text-center shadow-[2px_2px_0px_0px_#0F172A]">
                <div className="font-mono text-xl font-black text-slate-950">
                  {TARGET_ACHIEVEMENT}%
                </div>
                <div className="text-[10px] text-slate-700 font-bold">
                  فائض محقق: +{mask(formatSAR(NET_SALES - MONTHLY_TARGET))} فوق المطلوب!
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-dashed border-slate-300 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>تارجت أغسطس المطلوب:</span>
            <span className="font-mono text-slate-900">{mask(formatSAR(MONTHLY_TARGET))}</span>
          </div>
        </div>

        {/* Right Column (7 cols): Hand-drawn Interactive Branch Flow Bars */}
        <div className="lg:col-span-7 border-2 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_#0F172A] rounded-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-3 mb-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <span>✦</span>
                <span>مصادر تدفق الكاش بين الفروع (انقر للتحديد والتفصيل)</span>
              </h3>
              <span className="text-xs text-slate-500 font-bold">4 مصادر معتمدة</span>
            </div>

            {/* Hand-drawn Sketchy Progress Bars with Hatch Patterns */}
            <div className="space-y-3.5 my-2">
              {BRANCHES.map((b, idx) => {
                const isSelected = selectedBranch === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBranch(isSelected ? null : b.id)}
                    className={`p-3 border-2 transition-all cursor-pointer rounded-none ${
                      isSelected
                        ? 'border-slate-900 bg-amber-50 shadow-[3px_3px_0px_0px_#0F172A] translate-x-[-2px]'
                        : 'border-slate-300 bg-slate-50 hover:border-slate-900 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 border border-slate-900 bg-white flex items-center justify-center font-mono text-xs font-black">
                          {idx + 1}
                        </span>
                        <span className="text-slate-900">{b.name}</span>
                        <span className="text-[10px] font-mono bg-slate-200 border border-slate-400 px-1 py-0.2">
                          {b.tag}
                        </span>
                      </div>
                      <div className="font-mono font-black text-sm text-slate-950">
                        {mask(formatSAR(b.sales))}
                        <span className="text-[11px] font-normal text-slate-500 mr-1.5">({b.share}%)</span>
                      </div>
                    </div>

                    {/* Sketched Bar Line */}
                    <div className="w-full bg-slate-200 border border-slate-900 h-3 rounded-none overflow-hidden p-0.5">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${b.share}%`,
                          backgroundColor: b.color,
                          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.4) 3px, rgba(255,255,255,0.4) 6px)'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-dashed border-slate-300 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>إجمالي المبيعات المحققة لجميع المنافذ:</span>
            <span className="font-mono text-slate-950 text-sm font-black">{mask(formatSAR(NET_SALES))}</span>
          </div>
        </div>
      </div>

      {/* ── 4. Tactical Breakdown: Fixed Overhead & Inventory Dead Capital ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Left: Fixed Operational Overhead Breakdown (90,000 SAR) */}
        <div className="border-2 border-slate-900 bg-white p-5 shadow-[4px_4px_0px_0px_#0F172A] rounded-none">
          <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-2 mb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>■</span>
              <span>تفصيل التشغيل الشهري الثابت (90 ألف ر.س)</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-600">معتمد وموثق</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 border border-slate-800 bg-slate-50">
              <div>
                <strong className="text-slate-900">1. رواتب الموظفين الشهرية</strong>
                <div className="text-[10px] text-slate-500">كافة العاملين بالفروع والمستودع</div>
              </div>
              <div className="font-mono font-black text-sm text-slate-900">{mask(formatSAR(OPEX_SALARIES))}</div>
            </div>

            <div className="flex items-center justify-between p-2 border border-slate-800 bg-slate-50">
              <div>
                <strong className="text-slate-900">2. الإيجارات والكهرباء والشحن</strong>
                <div className="text-[10px] text-slate-500">متوسط فروع القصيم كاملة</div>
              </div>
              <div className="font-mono font-black text-sm text-slate-900">{mask(formatSAR(OPEX_FACILITIES))}</div>
            </div>

            <div className="flex items-center justify-between p-2 border border-slate-800 bg-slate-50">
              <div>
                <strong className="text-slate-900">3. هامش الأمان والتحوط</strong>
                <div className="text-[10px] text-slate-500">تحسباً لأي طارئ أو زيادة بنود</div>
              </div>
              <div className="font-mono font-black text-sm text-amber-800">{mask(formatSAR(OPEX_CONTINGENCY))}</div>
            </div>
          </div>

          {/* Bottom hand-drawn highlight note */}
          <div className="mt-3 p-2 border-2 border-dashed border-emerald-600 bg-emerald-50 text-xs font-bold text-emerald-950 flex items-center justify-between">
            <span>صافي الكاش الفائض بعد كامل التشغيل:</span>
            <span className="font-mono font-black text-sm text-emerald-800">+{mask(formatSAR(NET_PROFIT - TOTAL_MONTHLY_OPEX))}</span>
          </div>
        </div>

        {/* Right: Hand-Drawn Inventory Liquidity & Dead Stock Alert */}
        <div className="border-2 border-slate-900 bg-white p-5 shadow-[4px_4px_0px_0px_#0F172A] rounded-none">
          <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-2 mb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>■</span>
              <span>مؤشر سيولة المخزون (8,693 صنف)</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-600">جرد سبتمبر 2026</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center my-2">
            <div className="p-3 border-2 border-slate-900 bg-amber-50">
              <div className="text-[11px] font-bold text-amber-900">أصناف راكدة (تجميد سيولة)</div>
              <div className="text-2xl font-mono font-black text-slate-950 mt-1">2,082</div>
              <div className="text-[10px] text-slate-600">صنف بدون أي مبيعات</div>
            </div>

            <div className="p-3 border-2 border-slate-900 bg-rose-50">
              <div className="text-[11px] font-bold text-rose-900">أصناف نافذة بطلب نشط</div>
              <div className="text-2xl font-mono font-black text-slate-950 mt-1">2,186</div>
              <div className="text-[10px] text-slate-600">صفر رصيد (فرص ضائعة)</div>
            </div>
          </div>

          <div className="p-2 border border-slate-800 bg-slate-50 text-xs flex items-center justify-between mt-3 font-bold text-slate-700">
            <span>نسبة الأصناف النشطة بالمستودع:</span>
            <span className="font-mono text-slate-950 font-black">76.1% (6,611 صنف يدور بنجاح)</span>
          </div>
        </div>
      </div>

      {/* ── 5. Three Fast One-Tap Decision Directives (أزرار القرار التنفيذي السريع) ── */}
      <div className="border-2 border-slate-900 bg-white p-5 shadow-[5px_5px_0px_0px_#0F172A] rounded-none">
        <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-2 mb-3">
          <h3 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
            <span>⚡</span>
            <span>توجيهات المالك بضغطة زر واحدة (Directives)</span>
          </h3>
          <span className="text-xs text-slate-500 font-bold">قرارات تشغيلية مباشرة</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => openReport('stagnant')}
            className="p-3.5 border-2 border-slate-900 bg-amber-50 hover:bg-amber-100 text-right shadow-[3px_3px_0px_0px_#0F172A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-black text-amber-950 mb-1">
              <span>[ 1 ] تسييل الـ 2,082 صنف راكد</span>
              <span>←</span>
            </div>
            <p className="text-[11px] text-slate-700 font-medium">
              فتح قائمة الأصناف الراكدة لتحرير الكاش المجمد عبر حزم عروض صيانة سريعة.
            </p>
          </button>

          <button
            onClick={() => openReport('out_of_stock')}
            className="p-3.5 border-2 border-slate-900 bg-rose-50 hover:bg-rose-100 text-right shadow-[3px_3px_0px_0px_#0F172A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-black text-rose-950 mb-1">
              <span>[ 2 ] إصدار أوامر توريد للنواقص</span>
              <span>←</span>
            </div>
            <p className="text-[11px] text-slate-700 font-medium">
              متابعة الـ 2,186 صنفاً النافذة من المخزون لمنع هروب الزبائن للمنافسين.
            </p>
          </button>

          <button
            onClick={() => openReport('top_selling')}
            className="p-3.5 border-2 border-slate-900 bg-emerald-50 hover:bg-emerald-100 text-right shadow-[3px_3px_0px_0px_#0F172A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-none cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs font-black text-emerald-950 mb-1">
              <span>[ 3 ] تحصين التوب 50 صنفاً</span>
              <span>←</span>
            </div>
            <p className="text-[11px] text-slate-700 font-medium">
              مراجعة الأصناف المتصدرة للمبيعات وتأمين عقود سنوية لضمان استقرار الأرباح.
            </p>
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
