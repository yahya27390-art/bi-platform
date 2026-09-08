import React from 'react';
import ReactECharts from 'echarts-for-react';
import { formatSAR } from '@/lib/kpiEngine';

export default function ExecutiveIncomeStatementTab({ mask, netSales, netProfit, grossProfit, opexTotal, cogsTotal }) {
  // P&L Waterfall Chart Option (Safe formatter)
  const waterfallOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (params) {
        const tar = params[1] || params[0];
        const rawVal = tar?.value != null ? (typeof tar.value === 'object' ? tar.value.value : tar.value) : 0;
        return `${tar?.name || ''}<br/>القيمة: <strong>${formatSAR(Number(rawVal || 0))}</strong>`;
      }
    },
    grid: { left: '3%', right: '4%', bottom: 40, top: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['الإيراد الإجمالي', 'تكلفة البضاعة (COGS)', 'مجمل الربح', 'المصاريف التشغيلية (OPEX)', 'صافي الربح الفعلي'],
      axisLabel: { fontFamily: 'Cairo', fontSize: 11, fontWeight: 'bold', color: '#334155' }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (val) => `${(val / 1000).toFixed(0)}K`,
        fontFamily: 'Cairo',
        color: '#64748B'
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
          fontSize: 11,
          formatter: (p) => {
            const v = p?.value != null ? (typeof p.value === 'object' ? p.value.value : p.value) : 0;
            return `${(Number(v) / 1000).toFixed(1)}K`;
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

  // Revenue Breakdown Donut Chart
  const donutOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: <strong>{c} ر.س</strong> ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '2%',
      top: 'center',
      textStyle: { fontFamily: 'Cairo', fontSize: 11, color: '#334155', fontWeight: 'bold' }
    },
    series: [
      {
        name: 'قنوات الإيرادات',
        type: 'pie',
        radius: ['52%', '75%'],
        center: ['36%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#ffffff',
          borderWidth: 2
        },
        label: { show: false },
        data: [
          { value: 428881.08, name: 'الفرع الرئيسي', itemStyle: { color: '#0F2744' } },
          { value: 291365.50, name: 'فرع الرواف هيونداي', itemStyle: { color: '#0284C7' } },
          { value: 269275.58, name: 'فرع كيا المعتمد', itemStyle: { color: '#F97316' } },
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
      formatter: function (params) {
        const item = params[0];
        const val = item?.value != null ? Number(item.value).toLocaleString() : '0';
        return `${item?.name || ''}: <strong>${val} ر.س</strong>`;
      }
    },
    grid: { left: '3%', right: '5%', bottom: 25, top: '8%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: (v) => `${v / 1000}K`, fontFamily: 'Cairo', color: '#64748B' },
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    yAxis: {
      type: 'category',
      data: ['الاحتياطي والطوارئ', 'الإيجارات والمرافق والشحن', 'الرواتب والأجور الشهرية'],
      axisLabel: { fontFamily: 'Cairo', fontSize: 11, fontWeight: 'bold', color: '#334155' }
    },
    series: [
      {
        type: 'bar',
        barWidth: '55%',
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

  // Margin Trend Multi-line chart (Generous bottom padding so dates never clip)
  const marginTrendOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['هامش مجمل الربح', 'هامش الأرباح التشغيلية', 'هامش صافي الربح'],
      top: 0,
      textStyle: { fontFamily: 'Cairo', fontSize: 11, color: '#334155', fontWeight: 'bold' }
    },
    grid: { left: '3%', right: '4%', bottom: 45, top: 40, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['مايو 2026', 'يونيو 2026', 'يوليو 2026', 'أغسطس 2026'],
      axisLabel: { fontFamily: 'Cairo', fontSize: 11, color: '#334155', margin: 12 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value}%', fontFamily: 'Cairo', color: '#64748B' },
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    series: [
      {
        name: 'هامش مجمل الربح',
        type: 'line',
        smooth: true,
        data: [35.2, 36.8, 36.1, 37.1],
        itemStyle: { color: '#0F2744' },
        lineStyle: { width: 3 }
      },
      {
        name: 'هامش الأرباح التشغيلية',
        type: 'line',
        smooth: true,
        data: [26.0, 27.2, 28.5, 29.4],
        itemStyle: { color: '#0284C7' },
        lineStyle: { width: 3 }
      },
      {
        name: 'هامش صافي الربح',
        type: 'line',
        smooth: true,
        data: [25.4, 26.5, 27.1, 28.03],
        itemStyle: { color: '#F97316' },
        lineStyle: { width: 3 }
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
          <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold">
            صافي الأرباح: {mask(formatSAR(netProfit))}
          </span>
          <span className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-mono font-bold">
            هامش الصافي: 28.03%
          </span>
        </div>
      </div>

      {/* Row 1: Waterfall + Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Waterfall Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
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

        {/* Revenue Breakdown Donut (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-[#0F2744] border-b border-slate-100 pb-3 mb-2">
              توزيع الإيرادات حسب الفروع
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              حصة كل منفذ بيع من إجمالي المبيعات
            </p>
          </div>
          <div className="h-[250px]" dir="ltr">
            <ReactECharts option={donutOption} style={{ height: '100%', width: '100%' }} />
          </div>
          <div className="text-[11px] text-slate-500 text-center border-t border-slate-100 pt-2 font-bold">
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
              مسار هوامش الربحية (Margin Trend Over Time)
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              ثبات ونمو هامش الربح الصافي فوق 28%
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
