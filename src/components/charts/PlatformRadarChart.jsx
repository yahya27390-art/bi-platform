import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function PlatformRadarChart({ height = 340 }) {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontFamily: 'Cairo', fontSize: 12 },
    },
    legend: {
      bottom: '2%',
      left: 'center',
      textStyle: { color: '#334155', fontFamily: 'Cairo', fontSize: 11, fontWeight: 'bold' },
      itemGap: 16,
      icon: 'circle',
    },
    radar: {
      indicator: [
        { name: 'العائد الإعلاني (ROAS)', max: 5 },
        { name: 'كفاءة CPA (انخفاض التكلفة)', max: 100 },
        { name: 'نسبة النقر (CTR %)', max: 4 },
        { name: 'معدل التحويل (CR %)', max: 5 },
        { name: 'حجم المبيعات (Attributed)', max: 100 },
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: '#1E293B',
        fontFamily: 'Cairo',
        fontSize: 11,
        fontWeight: 700,
      },
      splitLine: {
        lineStyle: { color: '#CBD5E1' },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['#F8FAFC', '#FFFFFF'],
        },
      },
      axisLine: {
        lineStyle: { color: '#CBD5E1' },
      },
    },
    series: [
      {
        name: 'مقارنة قنوات الميديا بايينغ',
        type: 'radar',
        data: [
          {
            value: [4.58, 85, 2.1, 3.4, 83.4],
            name: 'ميتا (Meta Ads)',
            itemStyle: { color: '#2563EB' },
            areaStyle: { color: 'rgba(37, 99, 235, 0.22)' },
          },
          {
            value: [4.09, 80, 3.2, 4.1, 53.2],
            name: 'جوجل (Google Ads)',
            itemStyle: { color: '#059669' },
            areaStyle: { color: 'rgba(5, 150, 105, 0.22)' },
          },
          {
            value: [2.80, 55, 1.4, 1.8, 21.0],
            name: 'تيك توك (TikTok Ads)',
            itemStyle: { color: '#0F172A' },
            areaStyle: { color: 'rgba(15, 23, 42, 0.22)' },
          },
          {
            value: [3.15, 65, 1.8, 2.2, 12.9],
            name: 'سناب شات (Snapchat)',
            itemStyle: { color: '#D97706' },
            areaStyle: { color: 'rgba(217, 119, 6, 0.22)' },
          },
        ],
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
