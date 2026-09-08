import React from 'react';
import ReactECharts from 'echarts-for-react';
import { formatNum } from '@/lib/kpiEngine';
import { REAL_INVENTORY_STATS } from '@/data/realInventoryData';
import { FileSpreadsheet, AlertTriangle, CheckCircle2, ChevronLeft, ShieldAlert } from 'lucide-react';

export default function ExecutiveBalanceSheetTab({ mask, onOpenReportsModal }) {
  // Real 8,693 Warehouse SKUs Movement Status Donut
  const inventoryMovementDonutOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', confine: true, formatter: '{b}: <strong>{c} صنف</strong> ({d}%)' },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      itemGap: 14,
      icon: 'circle',
      textStyle: { fontFamily: 'Cairo', fontSize: 11, color: '#334155', fontWeight: 'bold' }
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
          { value: 3161, name: 'أصناف نشطة وذات حركة مستمرة', itemStyle: { color: '#0F2744' } },
          { value: 3450, name: 'أصناف نفذت وعليها طلب (Out of Stock)', itemStyle: { color: '#0284C7' } },
          { value: 2082, name: 'أصناف راكدة بدون حركة (Stagnant)', itemStyle: { color: '#F97316' } }
        ]
      }
    ]
  };

  // Warehouse Pieces Volume Bar Chart (Actual Stock Units)
  const warehouseVolumeOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      confine: true,
      formatter: (params) => {
        const item = params[0];
        return `<div style="font-family: Cairo; padding: 4px;">
          <div style="font-weight: bold; color: #0F2744; margin-bottom: 4px;">${item.name}</div>
          <div style="color: #334155;">الكمية الفعلية: <b>${formatNum(Number(item.value))} قطعة</b></div>
        </div>`;
      }
    },
    grid: { left: 45, right: 25, bottom: 35, top: 35, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['رصيد القطع المتاحة', 'القطع المنصرفة', 'إجمالي حركة القطع'],
      axisLabel: { fontFamily: 'Cairo', fontSize: 11, color: '#1E293B', fontWeight: 'bold' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v) => `${(v / 1000).toFixed(0)}K`, fontFamily: 'Cairo', color: '#64748B' },
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    series: [
      {
        name: 'مخزون القطع الفعلي',
        type: 'bar',
        barWidth: 46,
        data: [
          { value: REAL_INVENTORY_STATS?.totalBalance || 28683, itemStyle: { color: '#0F2744', borderRadius: [6, 6, 0, 0] } },
          { value: REAL_INVENTORY_STATS?.totalIssued || 14210, itemStyle: { color: '#0284C7', borderRadius: [6, 6, 0, 0] } },
          { value: (REAL_INVENTORY_STATS?.totalBalance || 28683) + (REAL_INVENTORY_STATS?.totalIssued || 14210), itemStyle: { color: '#10B981', borderRadius: [6, 6, 0, 0] } }
        ],
        label: {
          show: true,
          position: 'top',
          fontFamily: 'Cairo',
          fontSize: 11,
          fontWeight: 'bold',
          formatter: (p) => `${formatNum(p.value)} قطعة`,
          color: '#1E293B'
        }
      }
    ]
  };

  return (
    <div className="space-y-6 animate-fadeIn" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#0F2744]">
            تدقيق أصناف ومخزون المستودع الفعلي (WAREHOUSE INVENTORY & STOCK AUDIT)
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Real Inventory Health • تدقيق 8,693 صنفاً مسجلاً بالمستودع من واقع الجرد والملفات المرفوعة
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

      {/* Official Data Integrity Notice */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 leading-relaxed">
          <strong className="font-black">تنويه التدقيق المالي والمحاسبي:</strong> تم حجب عرض أي أصول أو التزامات تقديرية التزاماً بالقاعدة الصارمة للمنصة (100% بيانات فعلية فقط). سيتم تفعيل قائمة المركز المالي بمجرد استيراد كشف الميزانية العمومية والالتزامات المحاسبي الرسمي.
        </div>
      </div>

      {/* Row 1: Real Inventory Movement Donut + Stock Volume Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Real SKUs Movement Donut (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-[#0F2744] border-b border-slate-100 pb-3 mb-2">
              توزيع حركة 8,693 صنفاً مسجلاً (SKU Movement Distribution)
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              حصة الأصناف النشطة مقابل الأصناف التي نفذت والراكدة
            </p>
          </div>
          <div className="h-[250px]" dir="ltr">
            <ReactECharts option={inventoryMovementDonutOption} style={{ height: '100%', width: '100%' }} />
          </div>
          <div className="text-[11px] text-slate-500 text-center border-t border-slate-100 pt-2.5 font-bold">
            إجمالي الأصناف المدققة في المستودع: 8,693 صنفاً
          </div>
        </div>

        {/* Real Warehouse Pieces Bar Chart (6 Cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-[#0F2744] border-b border-slate-100 pb-3 mb-2">
              حجم قطع المستودع الفعلي (Warehouse Units Volume)
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              القطع المتاحة حالياً مقابل المنصرف الفعلي من المستودع
            </p>
          </div>
          <div className="h-[250px]" dir="ltr">
            <ReactECharts option={warehouseVolumeOption} style={{ height: '100%', width: '100%' }} />
          </div>
          <div className="text-[11px] text-slate-500 text-center border-t border-slate-100 pt-2.5 font-bold">
            رصيد القطع المتاحة حالياً: {formatNum(REAL_INVENTORY_STATS?.totalBalance || 28683)} قطعة
          </div>
        </div>
      </div>

      {/* Row 2: The 4 Authentic Inventory Breakdown Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-[#0F2744]">
              كشوفات وتصنيفات المستودع التفصيلية (Inventory Audit Breakdown)
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              اضغط على أي تصنيف لفتح تقرير الفحص والتصدير الفوري
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
            بيانات جرد معتمدة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => onOpenReportsModal('stagnant')}
            className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 cursor-pointer hover:bg-rose-100 transition-all group"
          >
            <div className="flex items-center justify-between text-xs text-rose-800 font-bold mb-1.5">
              <span>الأصناف الراكدة</span>
              <AlertTriangle className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black font-mono text-rose-950">
              {formatNum(REAL_INVENTORY_STATS?.stagnantCount || 2082)}
            </div>
            <div className="text-[11px] text-rose-700 font-medium mt-1">
              أصناف لم تتحرك خلال الفترة
            </div>
          </div>

          <div 
            onClick={() => onOpenReportsModal('top_selling')}
            className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-all group"
          >
            <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1.5">
              <span>الأعلى طلباً ومبيعاً</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black font-mono text-emerald-950">
              50
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">
              القطع الأكثر مبيعاً والأسرع دوراناً
            </div>
          </div>

          <div 
            onClick={() => onOpenReportsModal('out_of_stock')}
            className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-all group"
          >
            <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1.5">
              <span>نفذت وعليها طلب</span>
              <AlertTriangle className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black font-mono text-amber-950">
              {formatNum(REAL_INVENTORY_STATS?.outOfStockWithMovementCount || 3450)}
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-1">
              فرص مبيعات بحاجة لإعادة طلب
            </div>
          </div>

          <div 
            onClick={() => onOpenReportsModal('zero_movement')}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-all group"
          >
            <div className="flex items-center justify-between text-xs text-slate-700 font-bold mb-1.5">
              <span>أصناف بدون أي حركة</span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 group-hover:scale-125 transition-transform" />
            </div>
            <div className="text-2xl font-black font-mono text-slate-900">
              {formatNum(REAL_INVENTORY_STATS?.zeroMovementCount || 2082)}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              رصيد ثابت دون أي منصرف
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
          <span className="text-slate-700 font-bold">
            إجمالي حركة المستودع المقيدة: <strong className="font-mono text-slate-900">42,893 حركة صرف ووارد</strong>
          </span>
          <button
            onClick={() => onOpenReportsModal('stagnant')}
            className="text-[#0F2744] hover:underline font-bold flex items-center gap-1"
          >
            <span>استعراض تقارير التدقيق الرسمية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
