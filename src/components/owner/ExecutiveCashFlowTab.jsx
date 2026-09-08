import React from 'react';
import ReactECharts from 'echarts-for-react';
import { formatSAR } from '@/lib/kpiEngine';
import { ArrowUpRight, Wallet, TrendingUp, Building } from 'lucide-react';

export default function ExecutiveCashFlowTab({ mask, netProfit, opexTotal }) {
  // Cash Flow Waterfall Chart (Safe Formatter)
  const cashFlowWaterfallOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function (params) {
        const tar = params[1] || params[0];
        const rawVal = tar?.value != null ? (typeof tar.value === 'object' ? tar.value.value : tar.value) : 0;
        return `${tar?.name || ''}: <strong>${Number(rawVal || 0).toLocaleString()} ر.س</strong>`;
      }
    },
    grid: { left: '3%', right: '4%', bottom: 40, top: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['رصيد البداية', 'التدفق التشغيلي', 'الاستثماري', 'التمويلي والالتزامات', 'رصيد الإغلاق'],
      axisLabel: { fontFamily: 'Cairo', fontSize: 11, fontWeight: 'bold', color: '#334155' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v) => `${v / 1000}K`, fontFamily: 'Cairo', color: '#64748B' },
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    series: [
      {
        name: 'Placeholder',
        type: 'bar',
        stack: 'CashFlow',
        itemStyle: { borderColor: 'transparent', color: 'transparent' },
        emphasis: { itemStyle: { borderColor: 'transparent', color: 'transparent' } },
        data: [0, 280000, 480000, 420000, 0]
      },
      {
        name: 'القيمة',
        type: 'bar',
        stack: 'CashFlow',
        label: {
          show: true,
          position: 'top',
          fontFamily: 'Cairo',
          fontWeight: 'bold',
          formatter: (p) => {
            const v = p?.value != null ? (typeof p.value === 'object' ? p.value.value : p.value) : 0;
            return `${(Number(v) / 1000).toFixed(0)}K`;
          }
        },
        data: [
          { value: 280000, itemStyle: { color: '#0F2744' } },       // Opening Balance - Navy
          { value: 277363, itemStyle: { color: '#00A3A6' } },       // Operating CF - Teal
          { value: -77363, itemStyle: { color: '#EF4444' } },       // Investing CF - Coral/Red
          { value: -30000, itemStyle: { color: '#F97316' } },       // Financing CF - Orange
          { value: 450000, itemStyle: { color: '#0F2744' } }        // Closing Balance - Deep Navy
        ]
      }
    ]
  };

  // Cash Flow Trend Multi-line (Safe margins and containment)
  // August 2026 Cash Flow Breakdown Option
  const cashTrendOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      confine: true,
      formatter: (params) => {
        const item = params[0];
        const val = Number(item.value);
        return `<div style="font-family: Cairo; padding: 4px;">
          <div style="font-weight: bold; color: #0F2744; margin-bottom: 4px;">${item.name}</div>
          <div style="color: #334155;">القيمة الفعلية: <b>${mask((val >= 0 ? '+' : '') + val.toLocaleString())} ر.س</b></div>
        </div>`;
      }
    },
    grid: { left: 45, right: 30, bottom: 35, top: 35, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['التدفق التشغيلي', 'التدفق الاستثماري', 'التدفق التمويلي', 'صافي الزيادة النقدية'],
      axisLabel: { fontFamily: 'Cairo', fontSize: 11, color: '#1E293B', fontWeight: 'bold' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v) => `${v / 1000}K`, fontFamily: 'Cairo', color: '#64748B' },
      splitLine: { lineStyle: { color: '#F1F5F9' } }
    },
    series: [
      {
        name: 'أغسطس 2026 (الفعلي)',
        type: 'bar',
        barWidth: 46,
        data: [
          { value: 277363, itemStyle: { color: '#00A3A6', borderRadius: [6, 6, 0, 0] } },
          { value: -77363, itemStyle: { color: '#F97316', borderRadius: [0, 0, 6, 6] } },
          { value: -30000, itemStyle: { color: '#EF4444', borderRadius: [0, 0, 6, 6] } },
          { value: 170000, itemStyle: { color: '#0F2744', borderRadius: [6, 6, 0, 0] } }
        ],
        label: {
          show: true,
          position: 'top',
          fontFamily: 'Cairo',
          fontSize: 11,
          fontWeight: 'bold',
          formatter: (p) => {
            const v = p.value;
            return `${mask((v >= 0 ? '+' : '') + (v / 1000).toFixed(1))}K ر.س`;
          },
          color: '#1E293B'
        }
      }
    ]
  };

  return (
    <div className="space-y-6 animate-fadeIn" dir="rtl">
      {/* Top Banner Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#0F2744]">
            لوحة التدفقات النقدية والسيولة (CASH FLOW DASHBOARD)
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Cash Flow Overview and Working Capital Safety • مسار السيولة الحرة ومعدل تغطية الالتزامات
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5">
            <Wallet className="w-5 h-5 text-blue-900" />
            <div>
              <div className="text-[11px] text-blue-800 font-bold">الرصيد النقدي الحر (Cash Balance)</div>
              <div className="text-base font-black font-mono text-[#0F2744]">{mask('450,000 ر.س')}</div>
            </div>
            <span 
              dir="ltr" 
              style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
              className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg mr-1 flex items-center gap-1"
            >
              <ArrowUpRight className="w-3.5 h-3.5" /> +22.1%
            </span>
          </div>
        </div>
      </div>

      {/* Row 1: Waterfall + Cash Flow Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Waterfall (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#0F2744]">
                مخطط شلال التدفقات النقدية (Cash Flow Waterfall)
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                تدرج السيولة من الرصيد الافتتاحي حتى رصيد الإغلاق النهائي
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">SAR (بالريال السعودي)</span>
          </div>
          <div className="h-[290px]" dir="ltr">
            <ReactECharts option={cashFlowWaterfallOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        {/* Cash Flow Summary Table (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-[#0F2744] border-b border-slate-100 pb-3 mb-3">
              ملخص حركة النقدية (Cash Flow Summary)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600 font-bold">التدفق النقدي التشغيلي:</span>
                <strong className="font-mono text-emerald-700 text-sm">+{mask('277,363 ر.س')}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600 font-bold">التدفق النقدي الاستثماري:</span>
                <strong className="font-mono text-rose-700 text-sm">-{mask('77,363 ر.س')}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-600 font-bold">التدفق النقدي التمويلي:</span>
                <strong className="font-mono text-amber-700 text-sm">-{mask('30,000 ر.س')}</strong>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <span className="text-blue-900 font-bold">صافي الزيادة في النقدية:</span>
                <strong className="font-mono text-blue-950 text-base">+{mask('170,000 ر.س')}</strong>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center border-t border-slate-100 pt-2 font-bold">
            معدل الأمان النقدي: كفاية تشغيلية لمدة 5 أشهر قادمة
          </div>
        </div>
      </div>

      {/* Row 2: Cash Trend Multi-line */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-black text-[#0F2744]">
            تفصيل التدفقات النقدية - أغسطس 2026 المعتمد (Cash Flow Components)
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            حركة السيولة التشغيلية وإعادة استثمار الأرباح في المخزون وسداد الالتزامات
          </p>
        </div>
        <div className="h-[250px]" dir="ltr">
          <ReactECharts option={cashTrendOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
    </div>
  );
}
