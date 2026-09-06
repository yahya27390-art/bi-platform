import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function WaterfallChart({ height = 330 }) {
  const categories = [
    'صافي المبيعات (Net)',
    'تكلفة البضاعة (71.97%)',
    'ربح الأعمال المعتمد (28.03%)'
  ];

  // Waterfall calculation based on August 2026 Dora Cars audited data:
  // Net Revenue: 989,522.16 SAR
  // COGS: -712,159.10 SAR (71.97%)
  // Profit: 277,363.06 SAR (28.03% of net sales)
  const baseData = [0, 277363, 0];
  const positiveData = [989522, '-', 277363];
  const negativeData = ['-', 712159, '-'];

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontFamily: 'Cairo', fontSize: 12 },
      formatter: (params) => {
        const item = params[1] && params[1].value !== '-' ? params[1] : params[2];
        const isCost = params[2] && params[2].value !== '-';
        return `<div dir="rtl" style="text-align:right">
          <strong style="color:#94A3B8">${params[0].name}</strong><br/>
          <span style="font-weight:bold; color:${isCost ? '#EF4444' : '#10B981'}; font-size:13px">
            ${isCost ? '-' : '+'}${Number(item?.value || 0).toLocaleString('ar-SA')} ر.س
          </span>
        </div>`;
      },
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '12%',
      top: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#CBD5E1' } },
      axisLabel: {
        color: '#475569',
        fontFamily: 'Cairo',
        fontSize: 11,
        fontWeight: 600,
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#E2E8F0', type: 'dashed' } },
      axisLabel: {
        color: '#64748B',
        fontFamily: 'Cairo',
        formatter: (val) => `${(val / 1000).toFixed(0)}K`,
      },
    },
    series: [
      {
        name: 'Placeholder',
        type: 'bar',
        stack: 'Total',
        itemStyle: { borderColor: 'transparent', color: 'transparent' },
        emphasis: { itemStyle: { borderColor: 'transparent', color: 'transparent' } },
        data: baseData,
      },
      {
        name: 'إيراد / أرباح',
        type: 'bar',
        stack: 'Total',
        label: {
          show: true,
          position: 'top',
          color: '#0F172A',
          fontFamily: 'Cairo',
          fontSize: 11,
          fontWeight: 'bold',
          formatter: (p) => p.value !== '-' ? `${(p.value / 1000).toFixed(1)}K` : '',
        },
        itemStyle: {
          color: (params) => {
            if (params.dataIndex === 0) return '#1E3A8A'; // Deep Navy Blue for Net Revenue
            if (params.dataIndex === 2) return '#0284C7'; // Ocean Blue for Gross Profit
            return '#059669'; // Emerald Green for Net Profit
          },
          borderRadius: [6, 6, 0, 0],
        },
        data: positiveData,
      },
      {
        name: 'خصومات وتكاليف',
        type: 'bar',
        stack: 'Total',
        label: {
          show: true,
          position: 'bottom',
          color: '#DC2626',
          fontFamily: 'Cairo',
          fontSize: 11,
          fontWeight: 'bold',
          formatter: (p) => p.value !== '-' ? `-${(p.value / 1000).toFixed(1)}K` : '',
        },
        itemStyle: {
          color: '#E11D48',
          borderRadius: [0, 0, 6, 6],
        },
        data: negativeData,
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
