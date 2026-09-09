import React from 'react';
import ReactECharts from 'echarts-for-react';
import { formatSAR } from '@/lib/kpiEngine';

export default function ExecutiveIncomeStatementTab({ mask, netSales, netProfit, grossProfit, opexTotal, cogsTotal }) {
  // P&L Waterfall Chart Option (Safe formatter & confined tooltip)
  const waterfallOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      confine: true,
      formatter: function (params) {
        const tar = params[1] || params[0];
        const rawVal = tar?.value != null ? (typeof tar.value === 'object' ? tar.value.value : tar.value) : 0;
        return `${tar?.name || ''}<br/>القيمة: <strong>${formatSAR(Number(rawVal || 0))}</strong>`;
      }
    },
    grid: { left: 10, right: 10, bottom: 45, top: 35, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['الإيرادات', 'تكلفة البضاعة', 'مجمل الربح', 'المصاريف التشغيلية (OPEX)', 'صافي الربح'],
      axisLabel: {
        fontFamily: 'Cairo',
        fontSize: 10,
        fontWeight: 'bold',
        color: '#334155',
        interval: 0,
        rotate: 15,
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (val) => `${(val / 1000).toFixed(0)}K`,
        fontFamily: 'Cairo',
        color: '#64748B',
        fontSize: 10,
      },
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    series: [
      {
        name: 'Placeholder',
        type: 'bar',
        stack: 'Total',
        itemStyle: { borderColor: 'transparent', color: 'transparent' },
        emphasis: { itemStyle: { borderColor: 'transparent', color: 'transparent' } },
        data: [0, netSales - cogsTotal, 0, netProfit, 0]
      },
      {
        name: 'القيمة',
        type: 'bar',
        stack: 'Total',
        label: {
          show: true,
          position: 'top',
          fontFamily: 'Cairo',
          fontWeight: 'bold',
          fontSize: 10,
          formatter: (p) => {
            const v = p?.value != null ? (typeof p.value === 'object' ? p.value.value : p.value) : 0;
            return `${(Number(v) / 1000).toFixed(0)}K`;
          }
        },
        data: [
          { value: netSales, itemStyle: { color: '#0F2744' } },          // Total Revenue - Deep Navy
          { value: cogsTotal, itemStyle: { color: '#EF4444' } },         // COGS - Red/Coral
          { value: grossProfit, itemStyle: { color: '#0284C7' } },       // Gross Profit - Ocean Blue
          { value: opexTotal, itemStyle: { color: '#F97316' } },         // OPEX - Orange
          { value: netProfit, itemStyle: { color: '#10B981' } }          // Net Profit - Emerald
        ]
      }
    ]
  };

  // Revenue Breakdown Donut Chart (Flawless layout - ZERO OVERLAP)
  const donutOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      confine: true,
      formatter: '{b}: <strong>{c} ر.س</strong> ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      itemGap: 8,
      icon: 'circle',
      textStyle: { fontFamily: 'Cairo', fontSize: 10, color: '#334155', fontWeight: 'bold' }
    },
    series: [
      {
        name: 'قنوات الإيرادات',
        type: 'pie',
        radius: ['38%', '58%'],
        center: ['50%', '38%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#ffffff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        data: [
          { value: 428885.49, name: 'الفرع الرئيسي', itemStyle: { color: '#0F2744' } },
          { value: 291371.67, name: 'فرع الرواف هيونداي', itemStyle: { color: '#0284C7' } },
          { value: 269265.00, name: 'فرع كيا المعتمد', itemStyle: { color: '#F97316' } },
          { value: 41783.00, name: 'متجر سلة أونلاين', itemStyle: { color: '#10B981' } }
        ]
      }
    ]
  };

  // Operating Expenses Horizontal Bar Chart (Safe formatter)
  const opexOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      confine: true,
      formatter: function (params) {
        const item = params[0];
        const val = item?.value != null ? Number(item.value).toLocaleString() : '0';
        return `${item?.name || ''}: <strong>${val} ر.س</strong>`;
      }
    },
    grid: { left: 10, right: 20, bottom: 25, top: 15, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: (v) => `${v / 1000}K`, fontFamily: 'Cairo', color: '#64748B', fontSize: 10 },
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    yAxis: {
      type: 'category',
      data: ['طوارئ', 'مرافق وإيجار', 'رواتب وأجور'],
      axisLabel: { fontFamily: 'Cairo', fontSize: 10, fontWeight: 'bold', color: '#334155' }
    },
    series: [
      {
        type: 'bar',
        barWidth: '50%',
        data: [
          { value: 10000, itemStyle: { color: '#F97316' } },
          { value: 20000, itemStyle: { color: '#0284C7' } },
          { value: 60000, itemStyle: { color: '#0F2744' } }
        ],
        label: {
          show: true,
          position: 'right',
          fontFamily: 'Cairo',
          fontWeight: 'bold',
          formatter: (p) => {
            const v = p?.value != null ? Number(p.value).toLocaleString() : '0';
            return `${v} ر.س`;
          }
        }
      }
    ]
  };

  // Profitability Margins Breakdown for August 2026
  const marginTrendOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      confine: true,
      formatter: (params) => {
        const item = params[0];
        return `<div style="font-family: Cairo; padding: 4px;">
          <div style="font-weight: bold; color: #0F2744; margin-bottom: 4px;">${item.name}</div>
          <div style="color: #334155;">النسبة الفعلية: <b>${item.value}%</b></div>
        </div>`;
      }
    },
    grid: { left: 10, right: 10, bottom: 35, top: 35, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['مجمل الربح', 'المصاريف التشغيلية (OPEX)', 'صافي الربح الفعلي'],
      axisLabel: { fontFamily: 'Cairo', fontSize: 10, color: '#1E293B', fontWeight: 'bold' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value}%', fontFamily: 'Cairo', color: '#64748B' },
      splitLine: { lineStyle: { color: '#F1F5F9' } },
      max: 35
    },
    series: [
      {
        name: 'أغسطس 2026 (الفعلي)',
        type: 'bar',
        barWidth: 46,
        data: [
          { value: 28.03, itemStyle: { color: '#0F2744', borderRadius: [6, 6, 0, 0] } },
          { value: 9.10, itemStyle: { color: '#F97316', borderRadius: [6, 6, 0, 0] } },
          { value: 18.93, itemStyle: { color: '#10B981', borderRadius: [6, 6, 0, 0] } }
        ],
        label: {
          show: true,
          position: 'top',
          fontFamily: 'Cairo',
          fontSize: 11,
          fontWeight: 'bold',
          formatter: '{c}%',
          color: '#1E293B'
        }
      }
    ]
  };

  return (
    <div className="space-y-6 animate-fadeIn" dir="rtl">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#0F2744]">
            قائمة الدخل والتحليل المالي التفصيلي (INCOME STATEMENT ANALYSIS)
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Performance Overview and Structural Breakdown • أرقام حقيقية معتمدة لشهر أغسطس 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-mono font-bold">
            مجمل الربح: {mask(formatSAR(grossProfit))} (28.03%)
          </span>
          <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold">
            صافي الربح الفعلي: {mask(formatSAR(netProfit))} (18.93%)
          </span>
        </div>
      </div>

      {/* Row 1: Waterfall + Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Waterfall Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-black text-[#0F2744]">
                مخطط الشلال المالي (P&L Waterfall)
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                تدرج تدفق المبيعات وصولاً إلى صافي الربح الفعلي
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">SAR (بالريال السعودي)</span>
          </div>
          <div className="h-[290px]" dir="ltr">
            <ReactECharts option={waterfallOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Revenue Breakdown Donut (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-[#0F2744] border-b border-slate-100 pb-2 mb-1">
              توزيع الإيرادات حسب الفروع
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mb-2">
              حصة كل منفذ بيع من إجمالي المبيعات
            </p>
          </div>
          <div className="h-[230px]" dir="ltr">
            <ReactECharts option={donutOption} style={{ height: '100%', width: '100%' }} />
          </div>
          <div className="text-[11px] text-slate-600 text-center border-t border-slate-100 pt-2.5 font-bold">
            الفرع الرئيسي يتصدر بنسبة 43.3% من المبيعات
          </div>
        </div>
      </div>

      {/* Row 2: OPEX Breakdown + Margin Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* OPEX Horizontal Bars (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-black text-[#0F2744]">
              تفصيل المصاريف التشغيلية (Operating Expenses Breakdown)
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              الرواتب 60 ألف + الإيجارات والمرافق 20 ألف + الاحتياطي 10 آلاف
            </p>
          </div>
          <div className="h-[240px]" dir="ltr">
            <ReactECharts option={opexOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Margin Trend (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-black text-[#0F2744]">
              تحليل هوامش الربحية - أغسطس 2026 المعتمد (Profitability Margins)
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              مقارنة نسب الأرباح الفعلية المحققة من إجمالي المبيعات
            </p>
          </div>
          <div className="h-[240px]" dir="ltr">
            <ReactECharts option={marginTrendOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
