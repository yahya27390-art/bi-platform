import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';

const CHANNELS_DATA = [
  {
    key: 'meta',
    name: 'ميتا (Meta Ads)',
    color: '#2563EB',
    fillColor: 'rgba(37, 99, 235, 0.28)',
    value: [4.58, 88, 2.45, 3.8, 86.5],
    roas: '×40.64',
    spend: '3,222 ر.س',
    ctr: '1.22%',
    cpa: '2 ر.س'
  },
  {
    key: 'google',
    name: 'جوجل (Google Ads)',
    color: '#059669',
    fillColor: 'rgba(5, 150, 105, 0.28)',
    value: [4.09, 82, 3.40, 4.2, 58.0],
    roas: '×7.87',
    spend: '4,660 ر.س',
    ctr: '5.11%',
    cpa: '2 ر.س'
  },
  {
    key: 'tiktok',
    name: 'تيك توك (TikTok Ads)',
    color: '#0F172A',
    fillColor: 'rgba(15, 23, 42, 0.28)',
    value: [3.20, 62, 2.03, 2.4, 38.0],
    roas: '×12.16',
    spend: '1,521 ر.س',
    ctr: '2.03%',
    cpa: '217 ر.س'
  }
];

export default function PlatformRadarChart({ height = 440, showChannelPills = true, interactiveFilter = true }) {
  const [selectedChannel, setSelectedChannel] = useState('all');

  const filteredData = selectedChannel === 'all'
    ? CHANNELS_DATA
    : CHANNELS_DATA.filter(c => c.key === selectedChannel);

  const seriesData = filteredData.map(c => ({
    value: c.value,
    name: c.name,
    itemStyle: { color: c.color },
    lineStyle: { width: selectedChannel === c.key ? 3.5 : 2.5 },
    areaStyle: {
      color: selectedChannel === 'all'
        ? c.fillColor
        : {
            type: 'radial',
            x: 0.5,
            y: 0.5,
            r: 0.5,
            colorStops: [
              { offset: 0, color: c.color + '40' },
              { offset: 1, color: c.color + '15' }
            ]
          }
    },
    symbol: 'circle',
    symbolSize: 6
  }));

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: '#F8FAFC', fontFamily: 'Cairo', fontSize: 12 },
      formatter: (params) => {
        const item = CHANNELS_DATA.find(c => c.name === params.name);
        return `
          <div style="font-family: Cairo; direction: rtl; text-align: right;">
            <div style="font-weight: 800; font-size: 13px; color: #38BDF8; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${params.color};"></span>
              ${params.name}
            </div>
            <div style="display:grid; grid-template-columns: 1fr auto; gap: 6px 14px; font-size: 11px;">
              <span style="color:#94A3B8;">العائد الإعلاني:</span>
              <strong style="color:#34D399; font-family: monospace;">${item?.roas || 'N/A'}</strong>
              <span style="color:#94A3B8;">إجمالي الإنفاق:</span>
              <strong style="color:#F1F5F9; font-family: monospace;">${item?.spend || 'N/A'}</strong>
              <span style="color:#94A3B8;">نسبة النقر (CTR):</span>
              <strong style="color:#FCD34D; font-family: monospace;">${item?.ctr || 'N/A'}</strong>
              <span style="color:#94A3B8;">كفاءة الاكتساب (CPA):</span>
              <strong style="color:#F87171; font-family: monospace;">${item?.cpa || 'N/A'}</strong>
            </div>
          </div>
        `;
      }
    },
    legend: {
      show: true,
      bottom: 4,
      left: 'center',
      textStyle: { color: '#334155', fontFamily: 'Cairo', fontSize: 11, fontWeight: '700' },
      itemGap: 18,
      icon: 'roundRect',
      itemWidth: 14,
      itemHeight: 10
    },
    radar: {
      indicator: [
        { name: 'العائد الإعلاني (ROAS)', max: 5 },
        { name: 'كفاءة CPA (انخفاض التكلفة)', max: 100 },
        { name: 'نسبة النقر (CTR %)', max: 4 },
        { name: 'معدل التحويل (CR %)', max: 5 },
        { name: 'حجم المبيعات (Attributed)', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 5,
      radius: '68%',
      center: ['50%', '48%'],
      axisName: {
        color: '#0F172A',
        fontFamily: 'Cairo',
        fontSize: 11,
        fontWeight: 800,
        backgroundColor: '#F1F5F9',
        borderRadius: 6,
        padding: [4, 8],
        borderColor: '#CBD5E1',
        borderWidth: 1
      },
      splitLine: {
        lineStyle: { color: '#E2E8F0', width: 1.2 }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['#F8FAFC', '#FFFFFF']
        }
      },
      axisLine: {
        lineStyle: { color: '#CBD5E1', width: 1.2 }
      }
    },
    series: [
      {
        name: 'مقارنة قنوات الميديا بايينغ',
        type: 'radar',
        data: seriesData
      }
    ]
  };

  return (
    <div className="w-full space-y-3" dir="rtl">
      {/* Interactive Channel Filters */}
      {interactiveFilter && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedChannel('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedChannel === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              جميع المنصات (مقارنة شاملة)
            </button>
            {CHANNELS_DATA.map(c => (
              <button
                key={c.key}
                onClick={() => setSelectedChannel(c.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedChannel === c.key
                    ? 'text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                style={{
                  backgroundColor: selectedChannel === c.key ? c.color : undefined
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: selectedChannel === c.key ? '#FFFFFF' : c.color }}
                />
                <span>{c.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono font-bold text-slate-400">
            5-Axis Radar • Real Spend vs Yield
          </span>
        </div>
      )}

      {/* Main ECharts Radar Container */}
      <div className="w-full overflow-hidden" dir="ltr">
        <ReactECharts
          option={option}
          style={{ height, width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>

      {/* Bottom KPI Highlights for the active selection */}
      {showChannelPills && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          {CHANNELS_DATA.map(c => (
            <div
              key={c.key}
              onClick={() => setSelectedChannel(c.key === selectedChannel ? 'all' : c.key)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer text-right ${
                selectedChannel === c.key
                  ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-400/20'
                  : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name.split(' ')[0]}
                </span>
                <span className="font-mono font-black text-emerald-700 text-[11px]">{c.roas}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>الإنفاق: {c.spend}</span>
                <span>CPA: {c.cpa}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
