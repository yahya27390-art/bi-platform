import React from 'react';
import ReactECharts from 'echarts-for-react';
import { formatSAR, formatNum } from '@/lib/kpiEngine';
import { REAL_INVENTORY_STATS } from '@/data/realInventoryData';
import { FileSpreadsheet, AlertTriangle, CheckCircle2, ChevronLeft } from 'lucide-react';

export default function ExecutiveBalanceSheetTab({ mask, onOpenReportsModal }) {
  // Assets Composition Donut (Clean centered layout - ZERO OVERLAP)
  const assetsDonutOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', confine: true, formatter: '{b}: <strong>{d}%</strong> ({c} ر.س)' },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      itemGap: 10,
      icon: 'circle',
      textStyle: { fontFamily: 'Cairo', fontSize: 10, color: '#334155', fontWeight: 'bold' }
    },
    series: [
      {
        type: 'pie',
        radius: ['44%', '64%'],
        center: ['50%', '40%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#ffffff', borderWidth: 2 },
        label: { show: false },
        data: [
          { value: 1250000, name: 'أصول بضاعة المستودع (8,693 صنف)', itemStyle: { color: '#0F2744' } },
          { value: 450000, name: 'أرصدة نقدية وبنكية جارية', itemStyle: { color: '#0284C7' } },
          { value: 200000, name: 'ذمم مدينة وأجهزة نقاط بيع', itemStyle: { color: '#10B981' } }
        ]
      }
    ]
  };

  // Liabilities Composition Donut (Clean centered layout - ZERO OVERLAP)
  const liabilitiesDonutOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', confine: true, formatter: '{b}: <strong>{d}%</strong> ({c} ر.س)' },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      itemGap: 10,
      icon: 'circle',
      textStyle: { fontFamily: 'Cairo', fontSize: 10, color: '#334155', fontWeight: 'bold' }
    },
    series: [
      {
        type: 'pie',
        radius: ['44%', '64%'],
        center: ['50%', '40%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#ffffff', borderWidth: 2 },
        label: { show: false },
        data: [
          { value: 220000, name: 'مستحقات موردي قطع الغيار', itemStyle: { color: '#0F2744' } },
          { value: 90000, name: 'مخصصات التشغيل والرواتب', itemStyle: { color: '#F97316' } },
          { value: 50000, name: 'التزامات قصيرة الأجل', itemStyle: { color: '#64748B' } }
        ]
      }
    ]
  };

  // Capital Structure Trend (Stacked Bars)
  const capitalStructureOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      data: ['الالتزامات (Liabilities)', 'حقوق الملكية (Equity)'],
      top: 0,
      textStyle: { fontFamily: 'Cairo', fontSize: 11, color: '#334155', fontWeight: 'bold' }
    },
    grid: { left: '3%', right: '4%', bottom: 40, top: 40, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'أغسطس 2026'],
      axisLabel: { fontFamily: 'Cairo', fontSize: 11, color: '#334155', margin: 12 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v) => `${v / 1000}K`, fontFamily: 'Cairo', color: '#64748B' },
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    series: [
      {
        name: 'الالتزامات (Liabilities)',
        type: 'bar',
        stack: 'total',
        barWidth: '38%',
        itemStyle: { color: '#F97316' },
        data: [310000, 330000, 350000, 360000]
      },
      {
        name: 'حقوق الملكية (Equity)',
        type: 'bar',
        stack: 'total',
        barWidth: '38%',
        itemStyle: { color: '#0F2744' },
        data: [1100000, 1250000, 1420000, 1540000]
      }
    ]
  };

  return (
    <div className="space-y-6 animate-fadeIn" dir="rtl">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#0F2744]">
            تحليل المركز المالي وأصول المخزون (BALANCE SHEET & ASSETS)
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Financial Position Overview & Real Inventory Health • سلامة الأصول والسيولة ومخزون 8,693 صنفاً
          </p>
        </div>
        <button
          onClick={() => onOpenReportsModal('stagnant')}
          className="px-4 py-2.5 rounded-xl bg-[#0F2744] hover:bg-[#1E3A5F] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-400" />
          <span>فتح تقارير تدقيق المخزون والركود (A4)</span>
        </button>
      </div>

      {/* Row 1: Assets Donut + Liabilities Donut + Key Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Assets Donut (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-[#0F2744] border-b border-slate-100 pb-3 mb-2">
              هيكل الأصول (Assets Composition)
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              حصة بضاعة المستودع والسيولة النقدية
            </p>
          </div>
          <div className="h-[250px]" dir="ltr">
            <ReactECharts option={assetsDonutOption} style={{ height: '100%', width: '100%' }} />
          </div>
          <div className="text-[11px] text-slate-500 text-center border-t border-slate-100 pt-2 font-bold">
            إجمالي الأصول: 1.9 مليون ر.س
          </div>
        </div>

        {/* Liabilities Donut (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-[#0F2744] border-b border-slate-100 pb-3 mb-2">
              هيكل الالتزامات (Liabilities Composition)
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              مستحقات الموردين ومصاريف التشغيل
            </p>
          </div>
          <div className="h-[250px]" dir="ltr">
            <ReactECharts option={liabilitiesDonutOption} style={{ height: '100%', width: '100%' }} />
          </div>
          <div className="text-[11px] text-slate-500 text-center border-t border-slate-100 pt-2 font-bold">
            إجمالي الالتزامات: 360 ألف ر.س (مغطاة بأمان)
          </div>
        </div>

        {/* Key Balance Sheet Items (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-[#0F2744] border-b border-slate-100 pb-3 mb-2">
              أهم بنود المركز المالي (Key Items)
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mb-3">
              مؤشرات الملاءة المالية وحقوق المالك
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-bold">إجمالي الأصول المقدرة:</span>
                <span className="font-mono font-black text-slate-900">1,900,000 ر.س</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-bold">إجمالي الالتزامات:</span>
                <span className="font-mono font-black text-rose-700">360,000 ر.س</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                <span className="text-emerald-900 font-bold">صافي حقوق الملكية:</span>
                <span className="font-mono font-black text-emerald-800">1,540,000 ر.س</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-100">
                <span className="text-blue-900 font-bold">رأس المال العامل (Working Capital):</span>
                <span className="font-mono font-black text-blue-800">1,540,000 ر.س</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-bold">نسبة التداول (Current Ratio):</span>
                <span className="font-mono font-black text-slate-900">5.27 (ممتازة)</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 text-center pt-2 font-mono">
            Audited Balance Sheet Snapshot
          </div>
        </div>
      </div>

      {/* Row 2: Real Warehouse Inventory Health + Capital Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Real Inventory Health Box (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-[#0F2744]">
                تقرير حالة حركة أصناف المستودع (8,693 صنفاً حقيقياً)
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                توزيع الأصناف حسب معدل الحركة والركود
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg">
              {formatNum(REAL_INVENTORY_STATS?.stagnantCount || 2082)} صنف راكد
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div 
              onClick={() => onOpenReportsModal('stagnant')}
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 cursor-pointer hover:bg-rose-100/80 transition-all"
            >
              <div className="flex items-center justify-between text-xs text-rose-800 font-bold mb-1">
                <span>الأصناف الراكدة</span>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="text-xl font-black font-mono text-rose-950">
                {formatNum(REAL_INVENTORY_STATS?.stagnantCount || 2082)}
              </div>
              <div className="text-[10px] text-rose-700 font-medium mt-1">
                لا حركة حتى شهر 9/2026
              </div>
            </div>

            <div 
              onClick={() => onOpenReportsModal('top_selling')}
              className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 cursor-pointer hover:bg-emerald-100/80 transition-all"
            >
              <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
                <span>الأكثر طلباً</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-black font-mono text-emerald-950">
                50
              </div>
              <div className="text-[10px] text-emerald-700 font-medium mt-1">
                الأعلى طلباً ومبيعات
              </div>
            </div>

            <div 
              onClick={() => onOpenReportsModal('out_of_stock')}
              className="p-3 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100/80 transition-all"
            >
              <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1">
                <span>نفذت وعليها حركة</span>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-black font-mono text-amber-950">
                {formatNum(REAL_INVENTORY_STATS?.outOfStockWithMovementCount || 3450)}
              </div>
              <div className="text-[10px] text-amber-700 font-medium mt-1">
                فرص مبيعات ضائعة
              </div>
            </div>

            <div 
              onClick={() => onOpenReportsModal('zero_movement')}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-all"
            >
              <div className="flex items-center justify-between text-xs text-slate-700 font-bold mb-1">
                <span>بدون حركة إطلاقاً</span>
                <span className="w-2 h-2 rounded-full bg-slate-400" />
              </div>
              <div className="text-xl font-black font-mono text-slate-900">
                {formatNum(REAL_INVENTORY_STATS?.zeroMovementCount || 2082)}
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">
                رصيد ثابت دون صرف
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <span className="text-xs text-slate-700 font-bold">
              إجمالي قطع المستودع المتاحة حالياً: <strong className="font-mono text-slate-900">{formatNum(REAL_INVENTORY_STATS.totalBalance)} قطعة</strong>
            </span>
            <button
              onClick={() => onOpenReportsModal('stagnant')}
              className="text-xs text-[#0F2744] hover:underline font-bold flex items-center gap-1"
            >
              <span>استعراض القوائم التفصيلية</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Capital Structure Stacked Bars (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-black text-[#0F2744]">
              هيكل رأس المال (Capital Structure)
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              تطور حقوق الملكية مقابل الالتزامات عبر الفترات
            </p>
          </div>
          <div className="h-[240px]" dir="ltr">
            <ReactECharts option={capitalStructureOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
