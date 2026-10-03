import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useCurrentPeriod } from '../../context/BIPeriodContext';

export default function WaterfallChart({ height = 330, periodId: propPeriodId }) {
  const { periodId: ctxPeriodId } = useCurrentPeriod();
  const currentPeriodId = propPeriodId || ctxPeriodId || 'p-2026-09';
  const isSep = currentPeriodId === 'p-2026-09';

  const categories = isSep ? [
    'صافي المبيعات (Net)',
    'تكلفة البضاعة (69.50%)',
    'مجمل الربح (30.50%)',
    'المصاريف التشغيلية (OPEX)',
    'صافي الربح الفعلي (20.39%)'
  ] : [
    'صافي المبيعات (Net)',
    'تكلفة البضاعة (71.97%)',
    'مجمل الربح (28.03%)',
    'المصاريف التشغيلية (OPEX)',
    'صافي الربح الفعلي (18.93%)'
  ];

  // Waterfall calculation based on audited Dora Cars data:
  // September 2026 (Margin 30.50% from official profit margin report):
  // Net Revenue: 889,726.72 SAR | COGS: 618,338.14 SAR | Gross: 271,388.58 SAR | OPEX: 90,000 SAR | Net: 181,388.58 SAR
  // August 2026 (Margin 28.03%):
  // Net Revenue: 989,522.16 SAR | COGS: 712,159.10 SAR | Gross: 277,363.06 SAR | OPEX: 90,000 SAR | Net: 187,363.06 SAR
  const baseData = isSep ? [0, 271389, 0, 181389, 0] : [0, 277363, 0, 187363, 0];
  const positiveData = isSep ? [889727, '-', 271389, '-', 181389] : [989522, '-', 277363, '-', 187363];
  const negativeData = isSep ? ['-', 618338, '-', 90000, '-'] : ['-', 712159, '-', 90000, '-'];

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
            if (params.dataIndex === 0) return '#0F2744'; // Deep Navy Blue for Net Revenue
            if (params.dataIndex === 2) return '#0284C7'; // Ocean Blue for Gross Profit
            return '#10B981'; // Emerald Green for Net Profit
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
          color: (params) => {
            if (params.dataIndex === 1) return '#EF4444'; // Red for COGS
            return '#F97316'; // Orange for OPEX
          },
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
