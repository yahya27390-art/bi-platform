import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function WaterfallChart({ height = 320 }) {
  const categories = [
    'إجمالي الإيرادات',
    'تكلفة البضاعة (COGS)',
    'إجمالي الربح (Gross)',
    'مصاريف التشغيل (OPEX)',
    'الإنفاق الإعلاني',
    'صافي ربح الأعمال'
  ];

  // Waterfall placeholder, positive, and negative values
  const baseData = [0, 562400, 0, 257400, 214600, 0];
  const positiveData = [1480000, '-', 562400, '-', '-', 214600];
  const negativeData = ['-', 917600, '-', 305000, 42800, '-'];

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#0D1E36',
      borderColor: 'rgba(255,255,255,0.15)',
      textStyle: { color: '#fff', fontFamily: 'Cairo' },
      formatter: (params) => {
        const item = params[1] && params[1].value !== '-' ? params[1] : params[2];
        const isCost = params[2] && params[2].value !== '-';
        return `<div dir="rtl" style="text-align:right">
          <strong>${params[0].name}</strong><br/>
          <span style="color:${isCost ? '#F87171' : '#34D399'}">
            ${isCost ? '-' : '+'}${Number(item?.value || 0).toLocaleString('ar-SA')} ر.س
          </span>
        </div>`;
      },
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '10%',
      top: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: {
        color: '#94A3B8',
        fontFamily: 'Cairo',
        fontSize: 11,
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
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
          color: '#10B981',
          fontFamily: 'Cairo',
          fontSize: 10,
          formatter: (p) => p.value !== '-' ? `${(p.value / 1000).toFixed(0)}K` : '',
        },
        itemStyle: {
          color: (params) => {
            if (params.dataIndex === 0) return '#10B981';
            if (params.dataIndex === 2) return '#06B6D4';
            return '#8B5CF6';
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
          color: '#EF4444',
          fontFamily: 'Cairo',
          fontSize: 10,
          formatter: (p) => p.value !== '-' ? `-${(p.value / 1000).toFixed(0)}K` : '',
        },
        itemStyle: {
          color: '#F43F5E',
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
