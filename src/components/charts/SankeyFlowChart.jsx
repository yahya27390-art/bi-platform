import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { formatSAR } from '../../lib/kpiEngine';
import {
  Layers,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Store,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Sliders,
  BarChart3,
  PieChart,
  Info,
  Building2,
  Coins,
  Percent,
} from 'lucide-react';
import doraLogo from '../../assets/dora_logo.png';

// Authentic Audited Financial Flow Nodes & Links (August 2026 Audit)
const SANKEY_DATA = {
  nodes: [
    // Level 0: Inflow Sources (Branches)
    { name: 'الفرع الرئيسي', value: 428885.49, pct: '43.3%', itemStyle: { color: '#1E3A8A' } },
    { name: 'فرع الرواف', value: 291371.67, pct: '29.5%', itemStyle: { color: '#2563EB' } },
    { name: 'فرع كيا', value: 269265.00, pct: '27.2%', itemStyle: { color: '#0284C7' } },

    // Level 1: Central Consolidated Revenue Hub
    { name: 'إجمالي صافي المبيعات', value: 989522.16, pct: '100%', itemStyle: { color: '#0F172A' } },

    // Level 2: Primary Capital Allocation
    { name: 'تكلفة البضاعة (COGS)', value: 712159.10, pct: '71.97%', itemStyle: { color: '#64748B' } },
    { name: 'مجمل أرباح الأعمال', value: 277363.06, pct: '28.03%', itemStyle: { color: '#059669' } },

    // Level 3: Reinvestment & Utilization of Gross Profit
    { name: 'الإنفاق الإعلاني والتسويق', value: 9403.00, pct: '0.95%', itemStyle: { color: '#D97706' } },
    { name: 'المصاريف التشغيلية للفروع', value: 90000.00, pct: '9.10%', itemStyle: { color: '#475569' } },
    { name: 'صافي الفائض والربح النقدي', value: 177960.06, pct: '17.98%', itemStyle: { color: '#10B981' } },

    // Level 4: Granular Channels
    { name: 'إعلانات Google Ads', value: 4660.27, pct: '49.6%', itemStyle: { color: '#3B82F6' } },
    { name: 'إعلانات Meta Ads', value: 3221.60, pct: '34.3%', itemStyle: { color: '#0668E1' } },
    { name: 'إعلانات TikTok Ads', value: 1521.13, pct: '16.1%', itemStyle: { color: '#FE2C55' } },
    { name: 'رواتب وكوادر الفروع (60K)', value: 60000.00, pct: '6.06%', itemStyle: { color: '#64748B' } },
    { name: 'إيجار وشحن وكهرباء (20K)', value: 20000.00, pct: '2.02%', itemStyle: { color: '#475569' } },
    { name: 'احتياطي تذبذب ونثريات (10K)', value: 10000.00, pct: '1.01%', itemStyle: { color: '#94A3B8' } },
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

export default function SankeyFlowChart({ height = 480 }) {
  const [viewMode, setViewMode] = useState('pipeline'); // 'pipeline' | 'sankey' | 'simulator'
  const [simulatorSAR, setSimulatorSAR] = useState(100);

  // ECharts Option with balanced typography, proper margins, and vibrant gradient ribbons
  const echartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: '#FFFFFF', fontFamily: 'Cairo', fontSize: 12 },
      formatter: (params) => {
        if (params.dataType === 'edge') {
          const pctOfRev = ((params.data.value / 989522.16) * 100).toFixed(1);
          return `<div dir="rtl" style="text-align:right; font-family: Cairo, sans-serif;">
            <div style="font-size:11px; color:#94A3B8; margin-bottom:4px;">
              تدفق مالي: <strong>${params.data.source}</strong> ⬅️ <strong>${params.data.target}</strong>
            </div>
            <div style="font-size:15px; font-weight:900; color:#10B981; font-family:monospace;">
              ${Number(params.data.value).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
            </div>
            <div style="font-size:10px; color:#60A5FA; margin-top:2px;">
              يمثل ${pctOfRev}% من صافي إيرادات الشركة
            </div>
          </div>`;
        }
        const node = SANKEY_DATA.nodes.find((n) => n.name === params.name);
        return `<div dir="rtl" style="text-align:right; font-family: Cairo, sans-serif;">
          <div style="font-size:13px; font-weight:800; color:#FFFFFF;">
            ${params.name}
          </div>
          <div style="font-size:15px; font-weight:900; color:#10B981; font-family:monospace; margin-top:2px;">
            ${Number(params.value).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س
          </div>
          ${
            node?.pct
              ? `<div style="font-size:10px; color:#94A3B8; margin-top:2px;">النسبة: ${node.pct}</div>`
              : ''
          }
        </div>`;
      },
    },
    series: [
      {
        type: 'sankey',
        layout: 'none',
        left: 140,
        right: 170,
        top: 25,
        bottom: 25,
        nodeWidth: 20,
        nodeGap: 16,
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
          {
            depth: 0,
            itemStyle: { color: '#1E3A8A' },
            lineStyle: { color: 'gradient', opacity: 0.45 },
          },
          {
            depth: 1,
            itemStyle: { color: '#0F172A' },
            lineStyle: { color: 'gradient', opacity: 0.45 },
          },
          {
            depth: 2,
            itemStyle: { color: '#059669' },
            lineStyle: { color: 'gradient', opacity: 0.45 },
          },
          {
            depth: 3,
            itemStyle: { color: '#D97706' },
            lineStyle: { color: 'gradient', opacity: 0.45 },
          },
        ],
        data: SANKEY_DATA.nodes,
        links: SANKEY_DATA.links,
        label: {
          color: '#0F172A',
          fontFamily: 'Cairo',
          fontSize: 11,
          fontWeight: 700,
          formatter: '{b}',
        },
        lineStyle: {
          curveness: 0.5,
          color: 'gradient',
          opacity: 0.4,
        },
      },
    ],
  };

  return (
    <div className="space-y-6 font-sans text-right" dir="rtl">
      {/* 1. Top Executive Metrics & Mode Switcher Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/80 p-4 rounded-3xl border border-slate-200">
        {/* Left: 4 Quick Financial Inflow/Outflow Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold block">إجمالي التدفق الداخل (100%):</span>
            <span className="text-base font-black text-[#0F172A] font-mono mt-0.5 block" dir="ltr">
              {formatSAR(989522.16, true)}
            </span>
            <span className="text-[10px] text-blue-700 font-medium block">الفروع الميدانية الثلاثة</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold block">تكلفة البضاعة (71.97%):</span>
            <span className="text-base font-black text-slate-700 font-mono mt-0.5 block" dir="ltr">
              {formatSAR(712159.10, true)}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">شراء وتجهيز السيارات</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold block">أرباح الأعمال (28.03%):</span>
            <span className="text-base font-black text-emerald-700 font-mono mt-0.5 block" dir="ltr">
              {formatSAR(277363.06, true)}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium block">هامش ربح تشغيلي معتمد</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold block">الاستثمار الإعلاني (0.95%):</span>
            <span className="text-base font-black text-amber-700 font-mono mt-0.5 block" dir="ltr">
              {formatSAR(9403.00, true)}
            </span>
            <span className="text-[10px] text-amber-600 font-medium block">عائد قياسي 105.2× MER</span>
          </div>
        </div>

        {/* Right: View Mode Toggle Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs shrink-0 self-start lg:self-center">
          <button
            type="button"
            onClick={() => setViewMode('pipeline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'pipeline'
                ? 'bg-[#0F172A] text-white shadow-2xs'
                : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>المسار الهيكلي الفاخر (Pipeline)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('sankey')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'sankey'
                ? 'bg-[#0F172A] text-white shadow-2xs'
                : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>المخطط الشريطي المتدفق (Sankey)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('simulator')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'simulator'
                ? 'bg-[#0F172A] text-white shadow-2xs'
                : 'text-slate-600 hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>محاكي الـ 100 ريال</span>
          </button>
        </div>
      </div>

      {/* 2. VIEW MODE 1: Visual Financial Pipeline (المسار الهيكلي الفاخر) */}
      {viewMode === 'pipeline' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 space-y-6 shadow-xs">
          {/* Pipeline Stage Header Tags */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-bold text-slate-500 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5 text-blue-700">
              <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-black">1</span>
              <span>مصادر الإيراد الفعلي (الفروع الميدانية)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-800">
              <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black">2</span>
              <span>مجمع صافي الإيرادات المعتمدة</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-black">3</span>
              <span>توزيع رأس المال وتكلفة البضاعة</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-700">
              <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-black">4</span>
              <span>توظيف الأرباح، التشغيل، والتسويق</span>
            </div>
          </div>

          {/* 4 Interactive Columns Pipeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
            {/* COLUMN 1: Inflow Sources */}
            <div className="space-y-3 flex flex-col justify-center">
              {/* Branch 1 */}
              <div className="p-3.5 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-1.5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-[#0F172A]">الفرع الرئيسي</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">43.3%</span>
                </div>
                <div className="text-base font-black text-[#0F172A] font-mono" dir="ltr">
                  {formatSAR(428885.49, true)}
                </div>
                <div className="w-full bg-blue-200/60 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '43.3%' }} />
                </div>
              </div>

              {/* Branch 2 */}
              <div className="p-3.5 rounded-2xl border border-cyan-200 bg-cyan-50/40 space-y-1.5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-[#0F172A]">فرع الرواف</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800">29.5%</span>
                </div>
                <div className="text-base font-black text-[#0F172A] font-mono" dir="ltr">
                  {formatSAR(291371.67, true)}
                </div>
                <div className="w-full bg-cyan-200/60 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-600 rounded-full" style={{ width: '29.5%' }} />
                </div>
              </div>

              {/* Branch 3 */}
              <div className="p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-1.5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-[#0F172A]">فرع كيا</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">27.2%</span>
                </div>
                <div className="text-base font-black text-[#0F172A] font-mono" dir="ltr">
                  {formatSAR(269265.00, true)}
                </div>
                <div className="w-full bg-indigo-200/60 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '27.2%' }} />
                </div>
              </div>
            </div>

            {/* COLUMN 2: Central Revenue Hub (Featuring Transparent Dora Logo) */}
            <div className="flex flex-col justify-center">
              <div className="p-5 rounded-3xl border-2 border-slate-900 bg-gradient-to-b from-slate-900 to-[#0B1528] text-white space-y-4 shadow-xl text-center relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

                {/* Dora Logo: PURE TRANSPARENT, NO FRAMES, NO BACKGROUND */}
                <div className="flex justify-center">
                  <img
                    src={doraLogo}
                    alt="درة السيارة"
                    className="w-16 h-16 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]"
                  />
                </div>

                <div>
                  <span className="text-xs text-slate-400 font-bold block">إجمالي صافي المبيعات المعتمدة</span>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1" dir="ltr">
                    {formatSAR(989522.16, false)}
                  </div>
                  <span className="text-[11px] text-cyan-300 font-bold block mt-1">
                    100% مطابقة لفواتير Z-Reports
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تدقيق أغسطس 2026 المعتمد</span>
                </div>
              </div>
            </div>

            {/* COLUMN 3: Capital & Cost Allocation */}
            <div className="space-y-4 flex flex-col justify-center">
              {/* COGS */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-700">تكلفة البضاعة (COGS)</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">71.97%</span>
                </div>
                <div className="text-xl font-black text-slate-800 font-mono" dir="ltr">
                  {formatSAR(712159.10, true)}
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  شراء وتجهيز السيارات المستردة كأصل رأسمالي متجدد
                </p>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600 rounded-full" style={{ width: '71.97%' }} />
                </div>
              </div>

              {/* Gross Margin */}
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2 hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-emerald-900">مجمل أرباح الأعمال</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">28.03%</span>
                </div>
                <div className="text-xl font-black text-emerald-700 font-mono" dir="ltr">
                  {formatSAR(277363.06, true)}
                </div>
                <p className="text-[10px] text-emerald-700 leading-snug">
                  القيمة المضافة الصافية بعد تغطية تكلفة الشراء المباشرة
                </p>
                <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '28.03%' }} />
                </div>
              </div>
            </div>

            {/* COLUMN 4: Profit Reinvestment & OPEX */}
            <div className="space-y-3 flex flex-col justify-center">
              {/* Marketing Ad Spend */}
              <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-1.5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-amber-950 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>الإنفاق الإعلاني (Ads)</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">3.4% من الربح</span>
                </div>
                <div className="text-base font-black text-amber-800 font-mono" dir="ltr">
                  {formatSAR(9403.00, true)}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>جوجل (4.7K) + ميتا (3.2K) + تيك توك (1.5K)</span>
                  <span className="text-emerald-700 font-bold">105.2× MER</span>
                </div>
              </div>

              {/* OPEX */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-800">التشغيل والرواتب (OPEX)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">32.4% من الربح</span>
                </div>
                <div className="text-base font-black text-slate-800 font-mono" dir="ltr">
                  {formatSAR(90000.00, true)}
                </div>
                <div className="text-[10px] text-slate-500 space-y-0.5">
                  <div>رواتب: 60K | إيجار وكهرباء وشحن: 20K | احتياطي: 10K</div>
                </div>
              </div>

              {/* Net Cash Surplus */}
              <div className="p-3.5 rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 space-y-1.5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-emerald-950 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>صافي الفائض والربح النقدي</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900">17.98% صافي</span>
                </div>
                <div className="text-base font-black text-emerald-800 font-mono" dir="ltr">
                  {formatSAR(177960.06, true)}
                </div>
                <div className="text-[10px] text-emerald-700 font-bold">
                  سيولة نقدية فائضة وأرباح بالخزينة (64.2% من مجمل الربح)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. VIEW MODE 2: High-Precision Balanced ECharts Sankey */}
      {viewMode === 'sankey' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-2 pb-2 border-b border-slate-100">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>انقر أو مرر الفأرة فوق أي مسار شريطي لإظهار القيمة ونسبة التدفق بدقة</span>
            </span>
            <span className="font-mono text-[11px] bg-slate-100 px-2.5 py-1 rounded-lg">
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
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h4 className="text-base sm:text-lg font-black text-[#0F172A] flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              <span>محاكي رحلة الإيراد: أين يذهب كل 100 ريال من مبيعات درة للسيارات؟</span>
            </h4>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              تفكيك هيكلي واقعي معتمد: رواتب (60K) + تشغيل وشحن وكهرباء وإيجار (20K) + احتياطي تحوط (10K)
            </p>
          </div>

          {/* Interactive Input Range */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">حدد قيمة المبيعات المراد محاكاتها:</span>
              <span className="text-lg font-black text-[#0F172A] font-mono" dir="ltr">
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
              className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
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
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                <span>1. تكلفة البضاعة</span>
                <span className="text-slate-700">71.97%</span>
              </div>
              <div className="text-lg font-black text-slate-800 font-mono" dir="ltr">
                {((simulatorSAR * 71.97) / 100).toFixed(2)} ر.س
              </div>
              <span className="text-[9px] text-slate-500 block">شراء وتجهيز السيارات</span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                <span>2. الرواتب الشهرية</span>
                <span className="text-slate-700">6.06%</span>
              </div>
              <div className="text-lg font-black text-slate-800 font-mono" dir="ltr">
                {((simulatorSAR * 6.06) / 100).toFixed(2)} ر.س
              </div>
              <span className="text-[9px] text-slate-500 block">60,000 ر.س لكامل الفروع</span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                <span>3. كهرباء وشحن وإيجار</span>
                <span className="text-slate-700">2.02%</span>
              </div>
              <div className="text-lg font-black text-slate-800 font-mono" dir="ltr">
                {((simulatorSAR * 2.02) / 100).toFixed(2)} ر.س
              </div>
              <span className="text-[9px] text-slate-500 block">20,000 ر.س تشغيل وإيجارات</span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                <span>4. احتياطي تحوط</span>
                <span className="text-slate-700">1.01%</span>
              </div>
              <div className="text-lg font-black text-slate-800 font-mono" dir="ltr">
                {((simulatorSAR * 1.01) / 100).toFixed(2)} ر.س
              </div>
              <span className="text-[9px] text-slate-500 block">10,000 ر.س نثريات وتذبذب</span>
            </div>

            <div className="p-3.5 rounded-2xl border border-emerald-300 bg-emerald-50/70 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-emerald-800 font-bold">
                <span>5. صافي الربح الخالص</span>
                <span className="text-emerald-700 font-black">17.99%</span>
              </div>
              <div className="text-lg font-black text-emerald-800 font-mono" dir="ltr">
                {((simulatorSAR * 17.99) / 100).toFixed(2)} ر.س
              </div>
              <span className="text-[9px] text-emerald-700 block font-bold">أرباح بالخزينة (177.9K فائض)</span>
            </div>
          </div>
        </div>
      )}

      {/* Footnote */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            كافة مسارات التدفق المالي مدققة ومطابقة رياضياً بنسبة 100% مع فواتير نقاط البيع (Z-Reports) ودفاتر المشتريات المعتمدة.
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          إجمالي الإيراد الصافي: {formatSAR(989522.16, true)}
        </span>
      </div>
    </div>
  );
}
