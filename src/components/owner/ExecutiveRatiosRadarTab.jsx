import React from 'react';
import ReactECharts from 'echarts-for-react';
import PlatformRadarChart from '@/components/charts/PlatformRadarChart';
import { Compass, Sparkles, TrendingUp, DollarSign, Target, MessageSquare } from 'lucide-react';
import { formatSAR, formatNum } from '@/lib/kpiEngine';

export default function ExecutiveRatiosRadarTab() {
  // Real August 2026 Marketing Channels ROAS Comparison
  const channelRoasOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      confine: true,
      formatter: (params) => {
        const item = params[0];
        return `<div style="font-family: Cairo; padding: 4px;">
          <div style="font-weight: bold; color: #0F2744; margin-bottom: 4px;">${item.name}</div>
          <div style="color: #334155;">عائد الإنفاق (ROAS): <b>${item.value}x</b></div>
        </div>`;
      }
    },
    grid: { left: 45, right: 25, bottom: 35, top: 35, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['حملات ميتا (واتساب/مسنجر)', 'إعلانات تيك توك', 'إعلانات متجر سلة (جوجل)'],
      axisLabel: { fontFamily: 'Cairo', fontSize: 11, color: '#1E293B', fontWeight: 'bold' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value}x', fontFamily: 'Cairo', color: '#64748B' },
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    series: [
      {
        name: 'معدل العائد الفعلي (ROAS)',
        type: 'bar',
        barWidth: 46,
        data: [
          { value: 40.6, itemStyle: { color: '#0F2744', borderRadius: [6, 6, 0, 0] } },
          { value: 12.2, itemStyle: { color: '#0284C7', borderRadius: [6, 6, 0, 0] } },
          { value: 7.9, itemStyle: { color: '#10B981', borderRadius: [6, 6, 0, 0] } }
        ],
        label: {
          show: true,
          position: 'top',
          fontFamily: 'Cairo',
          fontSize: 11,
          fontWeight: 'bold',
          formatter: '{c}x',
          color: '#1E293B'
        }
      }
    ]
  };

  return (
    <div className="space-y-6 animate-fadeIn" dir="rtl">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#0F2744]">
            مصفوفة الكفاءة المتعددة الأبعاد والنسب التشغيلية (5-AXIS RADAR & EFFICIENCY)
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Omnichannel Marketing Efficiency & Operational Margins • تحليل متوازن من واقع تقارير أغسطس 2026 المعتمدة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>كفاءة الإنفاق المدمج (MER): 105.2x</span>
          </span>
        </div>
      </div>

      {/* Row 1: Authentic Operational & Marketing Ratios (Zero Assumed Ratios) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Gross Profit Margin */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">
            هامش مجمل الربح (Gross Margin)
          </div>
          <div className="text-2xl font-black font-mono text-[#0F2744] mt-2">
            37.12%
          </div>
          <div className="text-[10px] text-slate-500 font-bold mt-1">
            مجمل الربح 367.4K ر.س
          </div>
        </div>

        {/* 2. Operating Margin */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">
            هامش التشغيل (Operating Margin)
          </div>
          <div className="text-2xl font-black font-mono text-[#0284C7] mt-2">
            29.42%
          </div>
          <div className="text-[10px] text-slate-500 font-bold mt-1">
            الأرباح قبل الفوائد والضرائب (EBITDA)
          </div>
        </div>

        {/* 3. Meta CPA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">
            تكلفة المحادثة (Meta CPA)
          </div>
          <div className="text-2xl font-black font-mono text-[#F97316] mt-2">
            1.99 <span className="text-xs font-sans text-slate-500 font-normal">ر.س / عميل</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-bold mt-1">
            1,617 محادثة من إنفاق 3,221 ر.س
          </div>
        </div>

        {/* 4. Net Profit Margin */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 mb-1">
            هامش صافي الربح (Net Margin)
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700 mt-2">
            28.03%
          </div>
          <div className="text-[10px] text-emerald-800 font-bold mt-1">
            صافي الربح المعتمد: 277.4K ر.س
          </div>
        </div>
      </div>

      {/* Row 2: The Upgraded 5-Axis Channel Efficiency Radar (Full Interactive Infographic) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0F2744] text-white flex items-center justify-center shadow-md">
              <Compass className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0F2744]">
                مصفوفة الكفاءة الإعلانية المتعددة الأبعاد (5-Axis Channel Efficiency Radar)
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                تحليل متوازن للكفاءة وعائد كل قناة على محاور: العائد (ROAS)، تكلفة الاستحواذ (CPA)، النقر (CTR)، التحويل (CR)، وحجم المبيعات
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-blue-900 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl font-bold">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Interactive Infographic Radar</span>
          </span>
        </div>

        {/* Enhanced Radar Chart */}
        <PlatformRadarChart height={450} showChannelPills={true} interactiveFilter={true} />
      </div>

      {/* Row 3: Marketing ROAS Channels Comparison */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-black text-[#0F2744]">
            عائد القنوات الإعلانية لشهر أغسطس 2026 (Channel ROAS Comparison)
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            مقارنة العائد المالي الفعلي لكل قناة إعلانية مقابل الإنفاق
          </p>
        </div>
        <div className="h-[250px]" dir="ltr">
          <ReactECharts option={channelRoasOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
    </div>
  );
}
