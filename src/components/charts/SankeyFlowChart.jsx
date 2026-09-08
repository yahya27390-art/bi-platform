import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { formatSAR } from '../../lib/kpiEngine';
import {
  Layers,
  TrendingUp,
  Store,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Zap,
  BarChart3,
  Info,
  Coins,
  Cpu,
  Flame,
  Activity,
  ArrowDownLeft,
  ChevronDown,
  RotateCcw,
  Sun,
  Moon,
  Users,
  Building,
  ShieldAlert,
} from 'lucide-react';
import doraLogo from '../../assets/dora_logo.png';

// Authentic Audited Financial Flow Nodes & Links (August 2026 Audit)
const SANKEY_DATA = {
  nodes: [
    // Level 0: Inflow Sources (Branches)
    { id: 'branch_main', name: 'الفرع الرئيسي', value: 428885.49, pct: '43.3%', color: '#3B82F6', type: 'inflow', desc: 'مبيعات المعرض الرئيسي المعتمدة بنظام Z-Report' },
    { id: 'branch_rawaf', name: 'فرع الرواف', value: 291371.67, pct: '29.5%', color: '#06B6D4', type: 'inflow', desc: 'مبيعات فرع الرواف الموثقة عبر الشبكة ونقاط البيع' },
    { id: 'branch_kia', name: 'فرع كيا', value: 269265.00, pct: '27.2%', color: '#6366F1', type: 'inflow', desc: 'مبيعات فرع كيا المعتمدة في تقارير الصندوق' },

    // Level 1: Central Consolidated Revenue Hub
    { id: 'hub_central', name: 'إجمالي صافي المبيعات', value: 989522.16, pct: '100%', color: '#0F172A', type: 'hub', desc: 'إجمالي المبيعات الصافية المجمعة لكامل فروع الشركة' },

    // Level 2: Primary Capital Allocation
    { id: 'cogs', name: 'تكلفة البضاعة (COGS)', value: 712159.10, pct: '71.97%', color: '#94A3B8', type: 'cost', desc: 'تكلفة استيراد وشراء مخزون قطع غيار سيارات هيونداي وكيا وتجهيز المستودعات' },
    { id: 'gross_profit', name: 'مجمل أرباح الأعمال', value: 277363.06, pct: '28.03%', color: '#10B981', type: 'profit', desc: 'هامش الربح الإجمالي المحقق قبل خصم المصاريف التشغيلية' },

    // Level 3: Reinvestment & Utilization of Gross Profit
    { id: 'ads', name: 'الإنفاق الإعلاني والتسويق', value: 9403.00, pct: '0.95%', color: '#F59E0B', type: 'ads', desc: 'إعلانات جوجل وميتا وتيك توك بعائد استثنائي 105.2× MER' },
    { id: 'opex', name: 'المصاريف التشغيلية للفروع', value: 90000.00, pct: '9.10%', color: '#64748B', type: 'opex', desc: 'رواتب (60K) + إيجار وشحن وكهرباء (20K) + احتياطي تحوط (10K)' },
    { id: 'net_profit', name: 'صافي الفائض والربح النقدي', value: 177960.06, pct: '17.98%', color: '#059669', type: 'surplus', desc: 'صافي الأرباح النقدية الخالصة غير المقيدة في خزينة الشركة' },

    // Level 4: Granular Sub-Channels
    { id: 'ads_google', name: 'إعلانات Google Ads', value: 4660.27, pct: '49.6%', color: '#3B82F6', type: 'sub_ads', desc: 'زيارات Google Maps ومبيعات متجر سلة الإلكتروني' },
    { id: 'ads_meta', name: 'إعلانات Meta Ads', value: 3221.60, pct: '34.3%', color: '#0668E1', type: 'sub_ads', desc: 'محادثات واتساب ومبيعات التحويلات البنكية وتمارا وتابي' },
    { id: 'ads_tiktok', name: 'إعلانات TikTok Ads', value: 1521.13, pct: '16.1%', color: '#FE2C55', type: 'sub_ads', desc: 'فيديوهات تفاعلية وطلبات استفسارات العملاء الميدانية' },
    { id: 'opex_salaries', name: 'رواتب وكوادر الفروع', value: 60000.00, pct: '6.06%', color: '#64748B', type: 'sub_opex', desc: 'رواتب الموظفين والكوادر لكامل فروع الشركة شهرياً' },
    { id: 'opex_utilities', name: 'إيجار وشحن وكهرباء', value: 20000.00, pct: '2.02%', color: '#475569', type: 'sub_opex', desc: 'إيجار المعارض والكهرباء والخدمات ونقليات الشحن' },
    { id: 'opex_buffer', name: 'احتياطي تحوط ونثريات', value: 10000.00, pct: '1.01%', color: '#94A3B8', type: 'sub_opex', desc: 'مخصص أمان لتغطية أي زيادة أو نقصان وتذبذب الأسعار' },
  ],
  links: [
    // Inflows into Central Hub
    { source: 'الفرع الرئيسي', target: 'إجمالي صافي المبيعات', value: 428885.49 },
    { source: 'فرع الرواف', target: 'إجمالي صافي المبيعات', value: 291371.67 },
    { source: 'فرع كيا', target: 'إجمالي صافي المبيعات', value: 269265.00 },

    // Central Hub into Capital Allocation
    { source: 'إجمالي صافي المبيعات', target: 'تكلفة البضاعة (COGS)', value: 712159.10 },
    { source: 'إجمالي صافي المبيعات', target: 'مجمل أرباح الأعمال', value: 277363.06 },

    // Gross Profit Allocation
    { source: 'مجمل أرباح الأعمال', target: 'الإنفاق الإعلاني والتسويق', value: 9403.00 },
    { source: 'مجمل أرباح الأعمال', target: 'المصاريف التشغيلية للفروع', value: 90000.00 },
    { source: 'مجمل أرباح الأعمال', target: 'صافي الفائض والربح النقدي', value: 177960.06 },

    // Ad Spend Breakdown
    { source: 'الإنفاق الإعلاني والتسويق', target: 'إعلانات Google Ads', value: 4660.27 },
    { source: 'الإنفاق الإعلاني والتسويق', target: 'إعلانات Meta Ads', value: 3221.60 },
    { source: 'الإنفاق الإعلاني والتسويق', target: 'إعلانات TikTok Ads', value: 1521.13 },

    // OPEX Breakdown (60K Salaries + 20K Rent/Utilities/Shipping + 10K Buffer = 90K)
    { source: 'المصاريف التشغيلية للفروع', target: 'رواتب وكوادر الفروع (60K)', value: 60000.00 },
    { source: 'المصاريف التشغيلية للفروع', target: 'إيجار وشحن وكهرباء (20K)', value: 20000.00 },
    { source: 'المصاريف التشغيلية للفروع', target: 'احتياطي تذبذب ونثريات (10K)', value: 10000.00 },
  ],
};

export default function SankeyFlowChart({ height = 520 }) {
  const [viewMode, setViewMode] = useState('kinetic'); // 'kinetic' | 'sankey' | 'simulator'
  const [colorTheme, setColorTheme] = useState('dark'); // 'dark' | 'light'
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showOpexDetails, setShowOpexDetails] = useState(false);
  const [simulatorSAR, setSimulatorSAR] = useState(100);

  const activeFocus = hoveredNode || selectedNode;

  // Find active node details if selected
  const activeNodeData = activeFocus
    ? SANKEY_DATA.nodes.find((n) => n.id === activeFocus)
    : null;

  // ECharts Option for Sankey View
  const echartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      backgroundColor: '#0A1628',
      borderColor: '#1E293B',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { color: '#FFFFFF', fontFamily: 'Cairo', fontSize: 12 },
      formatter: (params) => {
        if (params.dataType === 'edge') {
          const pctOfRev = ((params.data.value / 989522.16) * 100).toFixed(1);
          return `<div dir="rtl" style="text-align:right; font-family: Cairo, sans-serif;">
            <div style="font-size:11px; color:#94A3B8; margin-bottom:4px;">
              تدفق مالي: <strong>${params.data.source}</strong> ⬅️ <strong>${params.data.target}</strong>
            </div>
            <div style="font-size:16px; font-weight:900; color:#10B981; font-family:monospace;">
              ${Number(params.data.value).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
            </div>
            <div style="font-size:11px; color:#60A5FA; margin-top:3px;">
              يمثل ${pctOfRev}% من صافي إيرادات الشركة
            </div>
          </div>`;
        }
        const node = SANKEY_DATA.nodes.find((n) => n.name === params.name);
        return `<div dir="rtl" style="text-align:right; font-family: Cairo, sans-serif;">
          <div style="font-size:13px; font-weight:800; color:#FFFFFF;">
            ${params.name}
          </div>
          <div style="font-size:16px; font-weight:900; color:#10B981; font-family:monospace; margin-top:3px;">
            ${Number(params.value).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
          </div>
          ${node?.pct ? `<div style="font-size:11px; color:#94A3B8; margin-top:3px;">النسبة: ${node.pct}</div>` : ''}
        </div>`;
      },
    },
    series: [
      {
        type: 'sankey',
        layout: 'none',
        left: 120,
        right: 150,
        top: 25,
        bottom: 25,
        nodeWidth: 24,
        nodeGap: 18,
        layoutIterations: 32,
        draggable: true,
        emphasis: {
          focus: 'adjacency',
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(37, 99, 235, 0.4)',
          },
        },
        levels: [
          { depth: 0, itemStyle: { color: '#1E3A8A' }, lineStyle: { color: 'gradient', opacity: 0.5 } },
          { depth: 1, itemStyle: { color: '#0F172A' }, lineStyle: { color: 'gradient', opacity: 0.5 } },
          { depth: 2, itemStyle: { color: '#059669' }, lineStyle: { color: 'gradient', opacity: 0.5 } },
          { depth: 3, itemStyle: { color: '#D97706' }, lineStyle: { color: 'gradient', opacity: 0.5 } },
        ],
        data: SANKEY_DATA.nodes,
        links: SANKEY_DATA.links,
        label: {
          color: colorTheme === 'dark' ? '#F8FAFC' : '#0F172A',
          fontFamily: 'Cairo',
          fontSize: 11,
          fontWeight: 700,
          formatter: '{b}',
        },
        lineStyle: {
          curveness: 0.5,
          color: 'gradient',
          opacity: 0.45,
        },
      },
    ],
  };

  const isDark = colorTheme === 'dark';

  return (
    <div className="space-y-5 font-sans text-right" dir="rtl">
      {/* 1. Header Toolbar with Studio Modes & Luxury Controls */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-sm ${
          isDark
            ? 'bg-gradient-to-r from-[#070D1B] via-[#0A1628] to-[#0E1E38] border-white/10 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Left: Engine Identity & Telemetry Status */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden shrink-0 ${
              isDark
                ? 'bg-gradient-to-br from-blue-600 to-indigo-900 shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                : 'bg-blue-50 text-blue-600 border border-blue-200'
            }`}
          >
            <Cpu className="w-6 h-6 text-white animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                مصفوفة التدفق المالي الذكي (Dora Kinetic Cash Stream)
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>تدفق حي 100% Z-Reports</span>
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              محاكاة وتتبع أنابيب السيولة الحركية من منافذ البيع حتى صافي الأرباح بالخزينة
            </p>
          </div>
        </div>

        {/* Right: Controls & View Switcher */}
        <div className="flex flex-wrap items-center gap-2 self-start xl:self-center">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setColorTheme(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isDark
                ? 'bg-white/5 border-white/10 text-amber-300 hover:bg-white/10'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="تبديل النمط البصري"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-800" />}
            <span className="hidden sm:inline">{isDark ? 'النمط المضيء' : 'النمط السيبراني'}</span>
          </button>

          {/* View Mode Buttons */}
          <div
            className={`flex items-center p-1 rounded-2xl border shadow-2xs ${
              isDark ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode('kinetic')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'kinetic'
                  ? 'bg-blue-600 text-white shadow-md'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>أنابيب السيولة الحية (Kinetic)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('sankey')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'sankey'
                  ? 'bg-blue-600 text-white shadow-md'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>المخطط الشريطي (Sankey)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('simulator')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'simulator'
                  ? 'bg-blue-600 text-white shadow-md'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>محاكي الـ 100 ريال</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY VIEW: The Kinetic Connected Pipeline Studio */}
      {viewMode === 'kinetic' && (
        <div
          className={`rounded-3xl border transition-all duration-300 relative overflow-hidden shadow-2xl ${
            isDark
              ? 'bg-gradient-to-br from-[#050C18] via-[#0A1628] to-[#0D1E36] border-white/10 text-white'
              : 'bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border-slate-200 text-slate-900'
          }`}
        >
          {/* Subtle Ambient Glows in Dark Mode */}
          {isDark && (
            <>
              <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            </>
          )}

          {/* Canvas Top Status Bar */}
          <div
            className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
              isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="font-bold">
                حالة المسار: كافة الأنابيب متصلة وتتدفق بالنبضات اللحظية المعتمدة
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-bold">
              {selectedNode && (
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 flex items-center gap-1 transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>إلغاء التحديد</span>
                </button>
              )}
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                مرر الفأرة أو انقر على أي عقدة لتركيز ومتابعة مسار تدفقها المالي
              </span>
            </div>
          </div>

          {/* Connected Network Stage Flow (Desktop Wide Canvas with SVG Conduit Bridges) */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="hidden lg:grid lg:grid-cols-[1fr_50px_1.25fr_50px_1fr_50px_1.15fr] items-center gap-0">
              {/* ── STAGE 1: FIELD INFLOW TRIBUTARIES (Right) ── */}
              <div className="space-y-3 flex flex-col justify-center">
                <div className="text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5 mb-1 text-blue-400">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>روافد الدخل الميداني</span>
                </div>

                {/* Branch 1: Main Branch */}
                <div
                  onMouseEnter={() => setHoveredNode('branch_main')}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(selectedNode === 'branch_main' ? null : 'branch_main')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                    activeFocus === 'branch_main'
                      ? 'border-blue-400 bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-[1.02]'
                      : isDark
                      ? 'border-white/10 bg-white/[0.04] hover:border-blue-400/50 hover:bg-white/[0.08]'
                      : 'border-blue-200 bg-white hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      <span>الفرع الرئيسي</span>
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono">
                      43.3%
                    </span>
                  </div>
                  <div className="text-lg font-black font-mono mt-1 text-blue-400" dir="ltr">
                    {formatSAR(428885.49, true)}
                  </div>
                  <div className="w-full bg-blue-950/60 h-1 rounded-full overflow-hidden mt-1.5">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '43.3%' }} />
                  </div>
                </div>

                {/* Branch 2: Rawaf Branch */}
                <div
                  onMouseEnter={() => setHoveredNode('branch_rawaf')}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(selectedNode === 'branch_rawaf' ? null : 'branch_rawaf')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                    activeFocus === 'branch_rawaf'
                      ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.3)] scale-[1.02]'
                      : isDark
                      ? 'border-white/10 bg-white/[0.04] hover:border-cyan-400/50 hover:bg-white/[0.08]'
                      : 'border-cyan-200 bg-white hover:border-cyan-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>فرع الرواف</span>
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono">
                      29.5%
                    </span>
                  </div>
                  <div className="text-lg font-black font-mono mt-1 text-cyan-400" dir="ltr">
                    {formatSAR(291371.67, true)}
                  </div>
                  <div className="w-full bg-cyan-950/60 h-1 rounded-full overflow-hidden mt-1.5">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: '29.5%' }} />
                  </div>
                </div>

                {/* Branch 3: Kia Branch */}
                <div
                  onMouseEnter={() => setHoveredNode('branch_kia')}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(selectedNode === 'branch_kia' ? null : 'branch_kia')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                    activeFocus === 'branch_kia'
                      ? 'border-indigo-400 bg-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-[1.02]'
                      : isDark
                      ? 'border-white/10 bg-white/[0.04] hover:border-indigo-400/50 hover:bg-white/[0.08]'
                      : 'border-indigo-200 bg-white hover:border-indigo-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span>فرع كيا</span>
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono">
                      27.2%
                    </span>
                  </div>
                  <div className="text-lg font-black font-mono mt-1 text-indigo-400" dir="ltr">
                    {formatSAR(269265.00, true)}
                  </div>
                  <div className="w-full bg-indigo-950/60 h-1 rounded-full overflow-hidden mt-1.5">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '27.2%' }} />
                  </div>
                </div>
              </div>

              {/* ── CONDUIT BRIDGE 1: 3 Inflow Curves Converging into Center ── */}
              <div className="h-72 w-full flex items-center justify-center relative pointer-events-none">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 50 300" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradInflow1" x1="100%" y1="0%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="gradInflow2" x1="100%" y1="0%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="gradInflow3" x1="100%" y1="0%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#818CF8" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  {/* Wire 1: Branch Main (y=50) -> Hub (y=135) */}
                  <path
                    d="M 50,50 C 25,50 25,135 0,135"
                    fill="none"
                    stroke="url(#gradInflow1)"
                    strokeWidth={activeFocus === 'branch_main' ? '4' : '2.5'}
                    className="animate-flow-dash"
                  />
                  {/* Wire 2: Branch Rawaf (y=150) -> Hub (y=150) */}
                  <path
                    d="M 50,150 C 25,150 25,150 0,150"
                    fill="none"
                    stroke="url(#gradInflow2)"
                    strokeWidth={activeFocus === 'branch_rawaf' ? '4' : '2.5'}
                    className="animate-flow-dash"
                  />
                  {/* Wire 3: Branch Kia (y=250) -> Hub (y=165) */}
                  <path
                    d="M 50,250 C 25,250 25,165 0,165"
                    fill="none"
                    stroke="url(#gradInflow3)"
                    strokeWidth={activeFocus === 'branch_kia' ? '4' : '2.5'}
                    className="animate-flow-dash"
                  />
                </svg>
              </div>

              {/* ── STAGE 2: DORA CENTRAL TREASURY REACTOR (The Centerpiece) ── */}
              <div className="flex flex-col justify-center px-1">
                <div className="text-[11px] font-black tracking-wider uppercase flex items-center justify-center gap-1.5 mb-1 text-cyan-400">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>مفاعل الخزينة المركزية لدرة</span>
                </div>

                <div
                  onMouseEnter={() => setHoveredNode('hub_central')}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(selectedNode === 'hub_central' ? null : 'hub_central')}
                  className={`p-6 rounded-3xl border-2 transition-all relative text-center overflow-hidden cursor-pointer group ${
                    activeFocus === 'hub_central'
                      ? 'border-cyan-400 bg-gradient-to-b from-[#0B1528] via-[#0D1D38] to-[#081224] shadow-[0_0_35px_rgba(6,182,212,0.4)] scale-[1.02]'
                      : isDark
                      ? 'border-cyan-500/30 bg-gradient-to-b from-[#091326] via-[#0B1A34] to-[#070F1E] shadow-xl hover:border-cyan-400/60'
                      : 'border-slate-800 bg-slate-900 text-white shadow-xl hover:border-cyan-500'
                  }`}
                >
                  {/* Animated Rotating Radar Rings around the Vault */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-48 h-48 rounded-full border border-cyan-400/40 animate-radar-spin border-dashed" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
                    <div className="w-36 h-36 rounded-full border border-blue-400/50 animate-glow-breathe" />
                  </div>

                  {/* Pure Transparent Dora Logo */}
                  <div className="flex justify-center relative mb-2">
                    <img
                      src={doraLogo}
                      alt="درة السيارة"
                      className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.35)] group-hover:scale-110 transition-transform"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">
                      إجمالي صافي المبيعات المعتمدة
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-0.5" dir="ltr">
                      {formatSAR(989522.16, false)}
                    </div>
                    <div className="text-[10px] text-cyan-300 font-bold mt-1 inline-flex items-center gap-1 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                      <ShieldCheck className="w-3 h-3 text-cyan-400" />
                      <span>100% مطابقة محاسبية لدفاتر Z-Reports</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-center text-[10px]">
                    <div className="p-1.5 rounded-xl bg-white/[0.04]">
                      <span className="text-slate-400 block">تدفق وارد (فروع)</span>
                      <span className="font-bold text-blue-400 font-mono">+989.5K ر.س</span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-white/[0.04]">
                      <span className="text-slate-400 block">فائض الأرباح الخالص</span>
                      <span className="font-bold text-emerald-400 font-mono">+177.9K ر.س</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── CONDUIT BRIDGE 2: Diverging into COGS & Gross Profit ── */}
              <div className="h-72 w-full flex items-center justify-center relative pointer-events-none">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 50 300" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradCogs" x1="100%" y1="0%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="gradGross" x1="100%" y1="0%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  {/* Wire to COGS (y=135 -> y=80) */}
                  <path
                    d="M 50,135 C 25,135 25,80 0,80"
                    fill="none"
                    stroke="url(#gradCogs)"
                    strokeWidth={activeFocus === 'cogs' ? '4' : '3'}
                    className="animate-flow-dash"
                  />
                  {/* Wire to Gross Profit (y=165 -> y=220) */}
                  <path
                    d="M 50,165 C 25,165 25,220 0,220"
                    fill="none"
                    stroke="url(#gradGross)"
                    strokeWidth={activeFocus === 'gross_profit' ? '5' : '3.5'}
                    className="animate-flow-dash"
                  />
                </svg>
              </div>

              {/* ── STAGE 3: CAPITAL ALLOCATION (COGS vs Gross Margin) ── */}
              <div className="space-y-4 flex flex-col justify-center">
                <div className="text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5 mb-1 text-emerald-400">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>توزيع رأس المال وتكلفة البضاعة</span>
                </div>

                {/* COGS Card */}
                <div
                  onMouseEnter={() => setHoveredNode('cogs')}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(selectedNode === 'cogs' ? null : 'cogs')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    activeFocus === 'cogs'
                      ? 'border-slate-400 bg-slate-500/20 shadow-[0_0_20px_rgba(148,163,184,0.3)] scale-[1.02]'
                      : isDark
                      ? 'border-white/10 bg-white/[0.04] hover:border-slate-400/50 hover:bg-white/[0.08]'
                      : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-300">تكلفة البضاعة (COGS)</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-200 font-mono">
                      71.97%
                    </span>
                  </div>
                  <div className="text-xl font-black font-mono mt-1 text-slate-200" dir="ltr">
                    {formatSAR(712159.10, true)}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug mt-1">
                    أصل رأسمالي متجدد لتوريد وشراء مخزون قطع غيار هيونداي وكيا
                  </p>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: '71.97%' }} />
                  </div>
                </div>

                {/* Gross Profit Card */}
                <div
                  onMouseEnter={() => setHoveredNode('gross_profit')}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(selectedNode === 'gross_profit' ? null : 'gross_profit')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    activeFocus === 'gross_profit'
                      ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.4)] scale-[1.02]'
                      : isDark
                      ? 'border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-400 hover:bg-emerald-950/30'
                      : 'border-emerald-300 bg-emerald-50/60 hover:border-emerald-500 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-emerald-400">مجمل أرباح الأعمال</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 font-mono">
                      28.03%
                    </span>
                  </div>
                  <div className="text-xl font-black font-mono mt-1 text-emerald-400" dir="ltr">
                    {formatSAR(277363.06, true)}
                  </div>
                  <p className="text-[10px] text-emerald-300/80 leading-snug mt-1">
                    القيمة المضافة الصافية بعد تغطية تكلفة الشراء المباشرة
                  </p>
                  <div className="w-full bg-emerald-950/80 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '28.03%' }} />
                  </div>
                </div>
              </div>

              {/* ── CONDUIT BRIDGE 3: Gross Profit branching into Ads, OPEX & Surplus ── */}
              <div className="h-72 w-full flex items-center justify-center relative pointer-events-none">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 50 300" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradAds" x1="100%" y1="0%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="gradOpex" x1="100%" y1="0%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#64748B" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="gradNet" x1="100%" y1="0%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#34D399" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                  {/* To Marketing Ads (y=210 -> y=45) */}
                  <path
                    d="M 50,210 C 25,210 25,45 0,45"
                    fill="none"
                    stroke="url(#gradAds)"
                    strokeWidth={activeFocus === 'ads' ? '4' : '2.5'}
                    className="animate-flow-dash"
                  />
                  {/* To OPEX (y=220 -> y=150) */}
                  <path
                    d="M 50,220 C 25,220 25,150 0,150"
                    fill="none"
                    stroke="url(#gradOpex)"
                    strokeWidth={activeFocus === 'opex' ? '4' : '3'}
                    className="animate-flow-dash"
                  />
                  {/* To Net Profit (y=235 -> y=255) */}
                  <path
                    d="M 50,235 C 25,235 25,255 0,255"
                    fill="none"
                    stroke="url(#gradNet)"
                    strokeWidth={activeFocus === 'net_profit' ? '5' : '3.5'}
                    className="animate-flow-dash"
                  />
                </svg>
              </div>

              {/* ── STAGE 4: ALLOCATION, OPEX & NET SURPLUS (Left) ── */}
              <div className="space-y-3 flex flex-col justify-center">
                <div className="text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5 mb-1 text-purple-400">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-[10px]">
                    4
                  </span>
                  <span>التوظيف، التشغيل، وصافي الخزينة</span>
                </div>

                {/* 1. Marketing Ad Spend */}
                <div
                  onMouseEnter={() => setHoveredNode('ads')}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(selectedNode === 'ads' ? null : 'ads')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                    activeFocus === 'ads'
                      ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.02]'
                      : isDark
                      ? 'border-white/10 bg-white/[0.04] hover:border-amber-400/50 hover:bg-white/[0.08]'
                      : 'border-amber-200 bg-white hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black flex items-center gap-1 text-amber-400">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>الإنفاق الإعلاني (Ads)</span>
                    </span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                      3.4% من الربح
                    </span>
                  </div>
                  <div className="text-base font-black font-mono mt-0.5 text-amber-400" dir="ltr">
                    {formatSAR(9403.00, true)}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                    <span>جوجل (4.7K) • ميتا (3.2K) • تيك توك (1.5K)</span>
                    <span className="text-emerald-400 font-bold font-mono">105.2× MER</span>
                  </div>
                </div>

                {/* 2. Operations & Salaries (OPEX: 90K) */}
                <div
                  onMouseEnter={() => setHoveredNode('opex')}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(selectedNode === 'opex' ? null : 'opex')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                    activeFocus === 'opex'
                      ? 'border-slate-300 bg-slate-500/20 shadow-[0_0_20px_rgba(148,163,184,0.3)] scale-[1.02]'
                      : isDark
                      ? 'border-white/10 bg-white/[0.04] hover:border-slate-300/50 hover:bg-white/[0.08]'
                      : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-300">التشغيل والرواتب (OPEX)</span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-200 font-mono">
                      32.4% من الربح
                    </span>
                  </div>
                  <div className="text-base font-black font-mono mt-0.5 text-slate-200" dir="ltr">
                    {formatSAR(90000.00, true)}
                  </div>
                  <div className="text-[10px] text-slate-400 space-y-0.5 mt-1 border-t border-white/5 pt-1">
                    <div className="flex items-center justify-between">
                      <span>• رواتب كامل الفروع:</span>
                      <span className="font-bold text-slate-200 font-mono">60,000 ر.س</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>• إيجار وكهرباء وشحن:</span>
                      <span className="font-bold text-slate-200 font-mono">20,000 ر.س</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>• احتياطي تحوط وتذبذب:</span>
                      <span className="font-bold text-slate-200 font-mono">10,000 ر.س</span>
                    </div>
                  </div>
                </div>

                {/* 3. Net Cash Profit / FCF (177,960.06 SAR) */}
                <div
                  onMouseEnter={() => setHoveredNode('net_profit')}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(selectedNode === 'net_profit' ? null : 'net_profit')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                    activeFocus === 'net_profit'
                      ? 'border-emerald-400 bg-gradient-to-r from-emerald-500/30 to-teal-500/20 shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-[1.03]'
                      : isDark
                      ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 to-teal-950/30 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                      : 'border-emerald-400 bg-emerald-50 hover:border-emerald-500 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black flex items-center gap-1.5 text-emerald-400">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-spin" />
                      <span>صافي الفائض والربح النقدي</span>
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-mono">
                      17.98% صافي
                    </span>
                  </div>
                  <div className="text-xl font-black font-mono mt-1 text-emerald-300" dir="ltr">
                    {formatSAR(177960.06, true)}
                  </div>
                  <div className="text-[10px] text-emerald-200/90 font-bold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>أرباح نقدية خالصة بالخزينة (64.2% من مجمل الربح)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile / Tablet Responsive Fallback View (Vertical Connected Stream) */}
            <div className="lg:hidden space-y-4">
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.04] text-center space-y-2">
                <img src={doraLogo} alt="درة" className="w-12 h-12 object-contain mx-auto" />
                <span className="text-xs text-slate-400 font-bold block">إجمالي مبيعات درة للسيارات المعتمدة</span>
                <div className="text-2xl font-black text-white font-mono" dir="ltr">
                  {formatSAR(989522.16, false)}
                </div>
                <div className="text-[11px] text-cyan-300 font-bold">100% مطابقة لمحاضر Z-Reports</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl border border-white/10 bg-white/[0.04]">
                  <span className="text-xs font-black text-slate-300 block">تكلفة البضاعة (COGS):</span>
                  <span className="text-base font-black text-slate-200 font-mono" dir="ltr">{formatSAR(712159.10, true)}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">71.97% من المبيعات</span>
                </div>

                <div className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
                  <span className="text-xs font-black text-emerald-400 block">مجمل أرباح الأعمال:</span>
                  <span className="text-base font-black text-emerald-300 font-mono" dir="ltr">{formatSAR(277363.06, true)}</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">28.03% هامش إجمالي</span>
                </div>

                <div className="p-3 rounded-2xl border border-white/10 bg-white/[0.04]">
                  <span className="text-xs font-black text-slate-300 block">التشغيل والرواتب (OPEX):</span>
                  <span className="text-base font-black text-slate-200 font-mono" dir="ltr">{formatSAR(90000.00, true)}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">رواتب (60K) + تشغيل (20K) + تحوط (10K)</span>
                </div>

                <div className="p-3 rounded-2xl border border-emerald-400/40 bg-emerald-950/40">
                  <span className="text-xs font-black text-emerald-300 block">صافي الفائض والربح الخالص:</span>
                  <span className="text-lg font-black text-emerald-300 font-mono" dir="ltr">{formatSAR(177960.06, true)}</span>
                  <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">17.98% صافي أرباح بالخزينة</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Interactive Telemetry HUD Inspector Drawer (Appears when any node is hovered or clicked) */}
          {activeNodeData && (
            <div
              className={`mx-4 sm:mx-8 mb-6 p-4 rounded-2xl border transition-all animate-in fade-in slide-in-from-bottom-2 ${
                isDark
                  ? 'bg-black/60 border-cyan-500/30 text-white shadow-xl'
                  : 'bg-blue-50/80 border-blue-200 text-slate-900 shadow-md'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shrink-0"
                    style={{ backgroundColor: activeNodeData.color }}
                  >
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black">{activeNodeData.name}</span>
                      <span
                        className="text-[10px] font-black px-2 py-0.5 rounded-full font-mono"
                        style={{
                          backgroundColor: `${activeNodeData.color}25`,
                          color: activeNodeData.color,
                        }}
                      >
                        {activeNodeData.pct}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {activeNodeData.desc}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10">
                  <span className="text-[10px] text-slate-400 font-bold block">القيمة المحاسبية الصافية:</span>
                  <span className="text-xl font-black font-mono text-emerald-400" dir="ltr">
                    {formatSAR(activeNodeData.value, true)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Canvas Bottom Ledger Verification Ribbon */}
          <div
            className={`px-6 py-3 border-t flex flex-wrap items-center justify-between gap-3 text-[11px] ${
              isDark ? 'border-white/10 bg-black/40 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                كافة مسارات التدفق المالي مدققة ومطابقة رياضياً بنسبة 100% مع فواتير نقاط البيع (Z-Reports) ودفاتر المشتريات
                المعتمدة
              </span>
            </div>
            <div className="font-mono text-[10px]">
              <span>صافي الإيراد: 989,522.16 ر.س = تكلفة البضاعة (712.2K) + أرباح الأعمال (277.4K)</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. VIEW MODE 2: High-Precision Balanced ECharts Sankey */}
      {viewMode === 'sankey' && (
        <div
          className={`rounded-3xl border p-4 sm:p-6 shadow-xs space-y-3 transition-all ${
            isDark ? 'bg-[#0A1628] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs px-2 pb-2 border-b border-white/10">
            <span className="flex items-center gap-1.5 font-bold">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>انقر أو مرر الفأرة فوق أي مسار شريطي لإظهار القيمة ونسبة التدفق بدقة</span>
            </span>
            <span className="font-mono text-[11px] bg-white/5 px-2.5 py-1 rounded-lg">
              Dynamic Gradient Flow Engine
            </span>
          </div>

          <div className="w-full overflow-hidden" dir="ltr">
            <ReactECharts
              option={echartsOption}
              style={{ height: `${height}px`, width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </div>
      )}

      {/* 4. VIEW MODE 3: Every 100 SAR Journey Simulator (محاكي الـ 100 ريال) */}
      {viewMode === 'simulator' && (
        <div
          className={`rounded-3xl border p-6 sm:p-8 space-y-6 shadow-xs transition-all ${
            isDark ? 'bg-[#0A1628] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div>
            <h4 className="text-base sm:text-lg font-black flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <span>محاكي رحلة الإيراد: أين يذهب كل 100 ريال من مبيعات درة للسيارات؟</span>
            </h4>
            <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              تفكيك هيكلي واقعي معتمد: رواتب (60K) + تشغيل وشحن وكهرباء وإيجار (20K) + احتياطي تحوط (10K)
            </p>
          </div>

          {/* Interactive Input Range */}
          <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-black/30 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">حدد قيمة المبيعات المراد محاكاتها:</span>
              <span className="text-lg font-black font-mono text-emerald-400" dir="ltr">
                {Number(simulatorSAR).toLocaleString('ar-SA')} ر.س
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={simulatorSAR}
              onChange={(e) => setSimulatorSAR(Number(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>100 ر.س</span>
              <span>2,500 ر.س</span>
              <span>5,000 ر.س</span>
              <span>7,500 ر.س</span>
              <span>10,000 ر.س</span>
            </div>
          </div>

          {/* Simulated Distribution Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className={`p-3.5 rounded-2xl border space-y-1 ${isDark ? 'bg-white/[0.04] border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                <span>1. تكلفة البضاعة</span>
                <span className="text-slate-200">71.97%</span>
              </div>
              <div className="text-lg font-black font-mono text-slate-200" dir="ltr">
                {((simulatorSAR * 71.97) / 100).toFixed(2)} ر.س
              </div>
              <span className="text-[9px] text-slate-400 block">توريد وشراء قطع الغيار</span>
            </div>

            <div className={`p-3.5 rounded-2xl border space-y-1 ${isDark ? 'bg-white/[0.04] border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                <span>2. الرواتب الشهرية</span>
                <span className="text-slate-200">6.06%</span>
              </div>
              <div className="text-lg font-black font-mono text-slate-200" dir="ltr">
                {((simulatorSAR * 6.06) / 100).toFixed(2)} ر.س
              </div>
              <span className="text-[9px] text-slate-400 block">60,000 ر.س لكامل الفروع</span>
            </div>

            <div className={`p-3.5 rounded-2xl border space-y-1 ${isDark ? 'bg-white/[0.04] border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                <span>3. كهرباء وشحن وإيجار</span>
                <span className="text-slate-200">2.02%</span>
              </div>
              <div className="text-lg font-black font-mono text-slate-200" dir="ltr">
                {((simulatorSAR * 2.02) / 100).toFixed(2)} ر.س
              </div>
              <span className="text-[9px] text-slate-400 block">20,000 ر.س تشغيل وإيجارات</span>
            </div>

            <div className={`p-3.5 rounded-2xl border space-y-1 ${isDark ? 'bg-white/[0.04] border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                <span>4. احتياطي تحوط</span>
                <span className="text-slate-200">1.01%</span>
              </div>
              <div className="text-lg font-black font-mono text-slate-200" dir="ltr">
                {((simulatorSAR * 1.01) / 100).toFixed(2)} ر.س
              </div>
              <span className="text-[9px] text-slate-400 block">10,000 ر.س نثريات وتذبذب</span>
            </div>

            <div className="p-3.5 rounded-2xl border border-emerald-400/50 bg-emerald-950/40 space-y-1 shadow-lg">
              <div className="flex items-center justify-between text-[11px] text-emerald-300 font-bold">
                <span>5. صافي الربح الخالص</span>
                <span className="text-emerald-400 font-black">17.99%</span>
              </div>
              <div className="text-lg font-black font-mono text-emerald-300" dir="ltr">
                {((simulatorSAR * 17.99) / 100).toFixed(2)} ر.س
              </div>
              <span className="text-[9px] text-emerald-300 block font-bold">أرباح بالخزينة (177.9K فائض)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
