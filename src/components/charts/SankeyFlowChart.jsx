import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function SankeyFlowChart({ height = 400 }) {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#fff', fontFamily: 'Cairo', fontSize: 12 },
      formatter: (params) => {
        if (params.dataType === 'edge') {
          return `<div dir="rtl" style="text-align:right">
            <span style="color:#94a3b8">${params.data.source} ⬅️ ${params.data.target}</span><br/>
            <strong style="color:#10B981;font-size:14px">${Number(params.data.value).toLocaleString('ar-SA')} ر.س</strong>
          </div>`;
        }
        return `<div dir="rtl" style="text-align:right">
          <strong>${params.name}</strong><br/>
          <span style="color:#10B981">${Number(params.value).toLocaleString('ar-SA')} ر.س</span>
        </div>`;
      },
    },
    series: [
      {
        type: 'sankey',
        layout: 'none',
        left: '2%',
        right: '2%',
        top: '8%',
        bottom: '8%',
        nodeWidth: 18,
        nodeGap: 14,
        draggable: true,
        emphasis: {
          focus: 'adjacency',
          itemStyle: {
            shadowBlur: 15,
            shadowColor: 'rgba(37, 99, 235, 0.4)',
          },
        },
        levels: [
          {
            depth: 0,
            itemStyle: { color: '#2563EB' },
            lineStyle: { color: 'source', opacity: 0.35 },
          },
          {
            depth: 1,
            itemStyle: { color: '#0F172A' },
            lineStyle: { color: 'source', opacity: 0.35 },
          },
          {
            depth: 2,
            itemStyle: { color: '#059669' },
            lineStyle: { color: 'source', opacity: 0.35 },
          },
          {
            depth: 3,
            itemStyle: { color: '#6366F1' },
            lineStyle: { color: 'source', opacity: 0.35 },
          },
        ],
        data: [
          // Inflow sources (Left)
          { name: 'الفرع الرئيسي (428.9K)', value: 428885.49, itemStyle: { color: '#1E3A8A' } },
          { name: 'فرع الرواف (291.4K)', value: 291371.67, itemStyle: { color: '#2563EB' } },
          { name: 'فرع كيا (269.3K)', value: 269265.00, itemStyle: { color: '#0284C7' } },

          // Consolidated Total
          { name: 'إجمالي صافي المبيعات (989.5K)', value: 989522.16, itemStyle: { color: '#0F172A' } },

          // Allocation buckets
          { name: 'تكلفة البضاعة (COGS)', value: 494761.08, itemStyle: { color: '#64748B' } },
          { name: 'المصاريف التشغيلية (OPEX)', value: 208093.97, itemStyle: { color: '#D97706' } },
          { name: 'الإنفاق الإعلاني (Ad Spend)', value: 9403.00, itemStyle: { color: '#E11D48' } },
          { name: 'صافي أرباح الأعمال (28.02%)', value: 277264.11, itemStyle: { color: '#059669' } },

          // Detailed marketing breakdown
          { name: 'حملات جوجل (Google Ads)', value: 4660.27, itemStyle: { color: '#2563EB' } },
          { name: 'حملات ميتا (Meta Ads)', value: 3221.60, itemStyle: { color: '#0284C7' } },
          { name: 'حملات تيك توك (TikTok)', value: 1521.13, itemStyle: { color: '#8B5CF6' } },

          // Detailed OPEX breakdown
          { name: 'رواتب وأجور الفروع', value: 112000, itemStyle: { color: '#94A3B8' } },
          { name: 'إيجارات الفروع', value: 42000, itemStyle: { color: '#64748B' } },
          { name: 'مرافق ولوجستيات وأخرى', value: 54093.97, itemStyle: { color: '#475569' } },
        ],
        links: [
          // Inflow into Total Revenue
          { source: 'الفرع الرئيسي (428.9K)', target: 'إجمالي صافي المبيعات (989.5K)', value: 428885.49 },
          { source: 'فرع الرواف (291.4K)', target: 'إجمالي صافي المبيعات (989.5K)', value: 291371.67 },
          { source: 'فرع كيا (269.3K)', target: 'إجمالي صافي المبيعات (989.5K)', value: 269265.00 },

          // Revenue Allocation
          { source: 'إجمالي صافي المبيعات (989.5K)', target: 'تكلفة البضاعة (COGS)', value: 494761.08 },
          { source: 'إجمالي صافي المبيعات (989.5K)', target: 'المصاريف التشغيلية (OPEX)', value: 208093.97 },
          { source: 'إجمالي صافي المبيعات (989.5K)', target: 'الإنفاق الإعلاني (Ad Spend)', value: 9403.00 },
          { source: 'إجمالي صافي المبيعات (989.5K)', target: 'صافي أرباح الأعمال (28.02%)', value: 277264.11 },

          // Ad Spend Breakdown
          { source: 'الإنفاق الإعلاني (Ad Spend)', target: 'حملات جوجل (Google Ads)', value: 4660.27 },
          { source: 'الإنفاق الإعلاني (Ad Spend)', target: 'حملات ميتا (Meta Ads)', value: 3221.60 },
          { source: 'الإنفاق الإعلاني (Ad Spend)', target: 'حملات تيك توك (TikTok)', value: 1521.13 },

          // OPEX Breakdown
          { source: 'المصاريف التشغيلية (OPEX)', target: 'رواتب وأجور الفروع', value: 112000 },
          { source: 'المصاريف التشغيلية (OPEX)', target: 'إيجارات الفروع', value: 42000 },
          { source: 'المصاريف التشغيلية (OPEX)', target: 'مرافق ولوجستيات وأخرى', value: 54093.97 },
        ],
        label: {
          color: '#0F172A',
          fontFamily: 'Cairo',
          fontSize: 11,
          fontWeight: 700,
        },
        lineStyle: {
          curveness: 0.55,
        },
      },
    ],
  };

  return (
    <div className="w-full overflow-hidden" dir="ltr">
      <ReactECharts
        option={option}
        style={{ height, width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}
