import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function SankeyFlowChart({ height = 400 }) {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      backgroundColor: '#0D1E36',
      borderColor: 'rgba(255, 255, 255, 0.15)',
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
            shadowColor: 'rgba(16, 185, 129, 0.5)',
          },
        },
        levels: [
          {
            depth: 0,
            itemStyle: { color: '#0EA5E9' },
            lineStyle: { color: 'source', opacity: 0.35 },
          },
          {
            depth: 1,
            itemStyle: { color: '#10B981' },
            lineStyle: { color: 'source', opacity: 0.35 },
          },
          {
            depth: 2,
            itemStyle: { color: '#F59E0B' },
            lineStyle: { color: 'source', opacity: 0.35 },
          },
          {
            depth: 3,
            itemStyle: { color: '#8B5CF6' },
            lineStyle: { color: 'source', opacity: 0.35 },
          },
        ],
        data: [
          // Inflow sources (Left)
          { name: 'فرع الروابي (هيونداي)', value: 720000, itemStyle: { color: '#3B82F6' } },
          { name: 'فرع السليمانية (كيا)', value: 480000, itemStyle: { color: '#06B6D4' } },
          { name: 'متجر سلة الإلكتروني', value: 280000, itemStyle: { color: '#10B981' } },

          // Consolidated Total
          { name: 'إجمالي الإيرادات (1.48M)', value: 1480000, itemStyle: { color: '#10B981' } },

          // Allocation buckets
          { name: 'تكلفة البضاعة (COGS)', value: 917600, itemStyle: { color: '#64748B' } },
          { name: 'المصاريف التشغيلية (OPEX)', value: 305000, itemStyle: { color: '#F59E0B' } },
          { name: 'الإنفاق الإعلاني (Ad Spend)', value: 42800, itemStyle: { color: '#EC4899' } },
          { name: 'صافي أرباح الأعمال (Net Profit)', value: 214600, itemStyle: { color: '#A855F7' } },

          // Detailed marketing breakdown
          { name: 'حملات ميتا (Meta Ads)', value: 18200, itemStyle: { color: '#3B82F6' } },
          { name: 'حملات جوجل (Google Ads)', value: 13000, itemStyle: { color: '#10B981' } },
          { name: 'حملات تيك توك (TikTok Ads)', value: 7500, itemStyle: { color: '#8B5CF6' } },
          { name: 'حملات سناب شات (Snapchat)', value: 4100, itemStyle: { color: '#FBBF24' } },

          // Detailed OPEX breakdown
          { name: 'رواتب وأجور الموظفين', value: 175000, itemStyle: { color: '#CBD5E1' } },
          { name: 'إيجارات الفروع والمستودعات', value: 85000, itemStyle: { color: '#94A3B8' } },
          { name: 'لوجستيات ومرافق تقنية', value: 45000, itemStyle: { color: '#64748B' } },
        ],
        links: [
          // Inflow into Total Revenue
          { source: 'فرع الروابي (هيونداي)', target: 'إجمالي الإيرادات (1.48M)', value: 720000 },
          { source: 'فرع السليمانية (كيا)', target: 'إجمالي الإيرادات (1.48M)', value: 480000 },
          { source: 'متجر سلة الإلكتروني', target: 'إجمالي الإيرادات (1.48M)', value: 280000 },

          // Revenue Allocation
          { source: 'إجمالي الإيرادات (1.48M)', target: 'تكلفة البضاعة (COGS)', value: 917600 },
          { source: 'إجمالي الإيرادات (1.48M)', target: 'المصاريف التشغيلية (OPEX)', value: 305000 },
          { source: 'إجمالي الإيرادات (1.48M)', target: 'الإنفاق الإعلاني (Ad Spend)', value: 42800 },
          { source: 'إجمالي الإيرادات (1.48M)', target: 'صافي أرباح الأعمال (Net Profit)', value: 214600 },

          // Ad Spend Breakdown
          { source: 'الإنفاق الإعلاني (Ad Spend)', target: 'حملات ميتا (Meta Ads)', value: 18200 },
          { source: 'الإنفاق الإعلاني (Ad Spend)', target: 'حملات جوجل (Google Ads)', value: 13000 },
          { source: 'الإنفاق الإعلاني (Ad Spend)', target: 'حملات تيك توك (TikTok Ads)', value: 7500 },
          { source: 'الإنفاق الإعلاني (Ad Spend)', target: 'حملات سناب شات (Snapchat)', value: 4100 },

          // OPEX Breakdown
          { source: 'المصاريف التشغيلية (OPEX)', target: 'رواتب وأجور الموظفين', value: 175000 },
          { source: 'المصاريف التشغيلية (OPEX)', target: 'إيجارات الفروع والمستودعات', value: 85000 },
          { source: 'المصاريف التشغيلية (OPEX)', target: 'لوجستيات ومرافق تقنية', value: 45000 },
        ],
        label: {
          color: '#E2E8F0',
          fontFamily: 'Cairo',
          fontSize: 11,
          fontWeight: 600,
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
