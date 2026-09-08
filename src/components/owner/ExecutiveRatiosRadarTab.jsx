import React from 'react';
import ReactECharts from 'echarts-for-react';
import PlatformRadarChart from '@/components/charts/PlatformRadarChart';
import { Compass, Sparkles, Activity, ShieldCheck } from 'lucide-react';

export default function ExecutiveRatiosRadarTab() {
  // Ratios Trend Multi-line Chart
  const ratiosTrendOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['العائد على الأصول (ROA)', 'العائد على حقوق الملكية (ROE)', 'هامش صافي الربح'],
      top: 0,
      textStyle: { fontFamily: 'Cairo', fontSize: 11, color: '#334155', fontWeight: 'bold' }
    },
    grid: { left: '3%', right: '4%', bottom: '5%', top: '16%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['2023', '2024', '2025', '2026'],
      axisLabel: { fontFamily: 'Cairo', fontSize: 11, color: '#334155' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value}%', fontFamily: 'Cairo', color: '#64748B' },
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    series: [
      {
        name: 'العائد على الأصول (ROA)',
        type: 'line',
        smooth: true,
        data: [11.2, 12.8, 13.5, 14.6],
        itemStyle: { color: '#0F2744' },
        lineStyle: { width: 3 }
      },
      {
        name: 'العائد على حقوق الملكية (ROE)',
        type: 'line',
        smooth: true,
        data: [15.4, 16.9, 17.5, 18.0],
        itemStyle: { color: '#00A3A6' },
        lineStyle: { width: 3 }
      },
      {
        name: 'هامش صافي الربح',
        type: 'line',
        smooth: true,
        data: [22.1, 24.5, 26.2, 28.03],
        itemStyle: { color: '#F97316' },
        lineStyle: { width: 3 }
      }
    ]
  };

  return (
    <div className="space-y-6 animate-fadeIn" dir="rtl">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#0F2744]">
            لوحة النسب المالية ومصفوفة الكفاءة المتعددة (FINANCIAL RATIOS & 5-AXIS RADAR)
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Key Financial Ratios, Operational Efficiency, & Marketing Yields • تقييم الكفاءة المتوازنة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-mono font-bold">
            مؤشر كفاءة التشغيل: 94.2%
          </span>
        </div>
      </div>

      {/* Row 1: The 3 Ratios Categories Cards (Exact format from Image 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Liquidity Ratios */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            نسب السيولة (Liquidity Ratios)
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-[11px] text-slate-500 font-bold">نسبة التداول (Current)</div>
              <div className="text-2xl font-black font-mono text-[#0F2744] mt-1">5.27</div>
              <div className="text-[10px] text-emerald-700 font-bold mt-0.5">▲ تغطية فائقة</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-[11px] text-slate-500 font-bold">النسبة السريعة (Quick)</div>
              <div className="text-2xl font-black font-mono text-[#0F2744] mt-1">1.80</div>
              <div className="text-[10px] text-emerald-700 font-bold mt-0.5">▲ أمان نقدي</div>
            </div>
          </div>
        </div>

        {/* 2. Profitability Ratios */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            نسب الربحية (Profitability Ratios)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-[10px] text-slate-500 font-bold">مجمل الربح</div>
              <div className="text-lg font-black font-mono text-blue-900 mt-1">37.1%</div>
              <div className="text-[9px] text-emerald-700 font-bold">▲ 0.9%</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-[10px] text-slate-500 font-bold">هامش التشغيل</div>
              <div className="text-lg font-black font-mono text-teal-800 mt-1">29.4%</div>
              <div className="text-[9px] text-emerald-700 font-bold">▲ 1.4%</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-[10px] text-slate-500 font-bold">صافي الربح</div>
              <div className="text-lg font-black font-mono text-emerald-700 mt-1">28.0%</div>
              <div className="text-[9px] text-emerald-700 font-bold">▲ 0.8%</div>
            </div>
          </div>
        </div>

        {/* 3. Efficiency Ratios */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
            نسب الكفاءة والعائد (Efficiency & Returns)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-[10px] text-slate-500 font-bold">دوران الأصول</div>
              <div className="text-lg font-black font-mono text-[#0F2744] mt-1">0.52</div>
              <div className="text-[9px] text-emerald-700 font-bold">معدل نشط</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-[10px] text-slate-500 font-bold">ROA</div>
              <div className="text-lg font-black font-mono text-blue-900 mt-1">14.6%</div>
              <div className="text-[9px] text-emerald-700 font-bold">▲ ممتاز</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-[10px] text-slate-500 font-bold">ROE</div>
              <div className="text-lg font-black font-mono text-orange-800 mt-1">18.0%</div>
              <div className="text-[9px] text-emerald-700 font-bold">▲ نمو قوي</div>
            </div>
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
                تحليل متوازن للكفاءة التشغيلية وعائد كل قناة إعلانية على محاور: (ROAS) العائد، (CPA) تكلفة الاكتساب، (CTR) النقر، (CR) التحويل، وحجم المبيعات
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

      {/* Row 3: Multi-line Ratios Trend */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-black text-[#0F2744]">
            مسار تطور النسب المالية الاستراتيجية (Ratios Trend)
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            تطور العائد على الأصول وحقوق الملكية وهوامش الأرباح عبر السنوات
          </p>
        </div>
        <div className="h-[230px]" dir="ltr">
          <ReactECharts option={ratiosTrendOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
    </div>
  );
}
