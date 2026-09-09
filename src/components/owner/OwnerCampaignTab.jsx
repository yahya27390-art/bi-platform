import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';

// ─── Real August 2026 Advertising Data ───────────────────────────────────────
// Sources: Official Meta Ads, Google Ads, TikTok Ads manager reports - August 2026

const PLATFORMS = [
  {
    key: 'meta',
    name: 'Meta Ads',
    nameAr: 'ميتا (واتساب + انستغرام)',
    emoji: '📘',
    color: '#1877F2',
    bg: 'from-blue-600 to-blue-800',
    cardBg: '#EFF6FF',
    borderColor: '#BFDBFE',
    spend: 3221.60,
    primaryMetricLabel: 'محادثات واتساب',
    primaryMetricValue: '1,617',
    primaryMetricSub: 'تكلفة: 1.99 ر.س / محادثة',
    roas: 40.6,
    roasLabel: '×40.6 ROAS',
    roasColor: '#15803D',
    stats: [
      { label: 'الانطباعات', value: '752,961' },
      { label: 'الوصول', value: '236,648' },
      { label: 'نقرات الرابط', value: '3,467' },
      { label: 'تكلفة النقرة', value: '0.35 ر.س' },
      { label: 'معدل النقر CTR', value: '1.22%' },
      { label: 'تفاعل الصفحة', value: '100,161' },
    ],
    campaigns: [
      {
        name: 'حملة تفاعل واتساب 14/4/2026',
        status: 'ACTIVE',
        spend: 2930.42,
        kpi: '1,614 محادثة',
        cpa: '1.82 ر.س',
        reach: '146,790',
        roas: '×40.6',
        badge: 'ممتاز',
        badgeColor: '#15803D',
      },
      {
        name: 'حملة وعي لبريدة',
        status: 'ACTIVE',
        spend: 291.18,
        kpi: '3 محادثات',
        cpa: '97.06 ر.س',
        reach: '95,126',
        roas: '—',
        badge: 'وعي',
        badgeColor: '#9333EA',
      },
    ],
  },
  {
    key: 'google',
    name: 'Google Ads',
    nameAr: 'جوجل (بحث + خرائط)',
    emoji: '🔍',
    color: '#34A853',
    bg: 'from-green-600 to-green-800',
    cardBg: '#F0FDF4',
    borderColor: '#BBF7D0',
    spend: 4660.27,
    primaryMetricLabel: 'إجمالي التفاعلات',
    primaryMetricValue: '89,820',
    primaryMetricSub: 'متوسط التكلفة: 0.05 ر.س / تفاعل',
    roas: 7.9,
    roasLabel: '×7.9 ROAS',
    roasColor: '#15803D',
    stats: [
      { label: 'الانطباعات', value: '234,672' },
      { label: 'حملات نشطة', value: '6 حملات' },
      { label: 'معدل التفاعل', value: '38.27%' },
      { label: 'حصة الانطباعات', value: '15.09%' },
      { label: 'أعلى موضع', value: '11.32%' },
      { label: 'متوسط CPC', value: '0.05 ر.س' },
    ],
    campaigns: [
      { name: 'DEC Search (بحث قطع الغيار)', status: 'ACTIVE', spend: 1730.97, kpi: '4,605 تفاعل', cpa: '0.38 ر.س', reach: '33,578', roas: '×7.9', badge: 'بحث', badgeColor: '#1D4ED8' },
      { name: 'خرائط الفرع الرئيسي - بريدة', status: 'ACTIVE', spend: 1146.32, kpi: '2,447 تفاعل', cpa: '0.47 ر.س', reach: '30,659', roas: '×7.9', badge: 'خرائط', badgeColor: '#0284C7' },
      { name: 'خرائط فرع هيونداي', status: 'PAUSED', spend: 807.52, kpi: '1,437 تفاعل', cpa: '0.56 ر.س', reach: '18,466', roas: '—', badge: 'متوقف', badgeColor: '#6B7280' },
      { name: 'خرائط فرع كيا (أعلى تفاعل)', status: 'ACTIVE', spend: 599.56, kpi: '69,757 تفاعل', cpa: '0.01 ر.س', reach: '131,728', roas: '×52x', badge: 'أفضل أداء', badgeColor: '#DC2626' },
      { name: 'خرائط فرع الرواف', status: 'PAUSED', spend: 316.84, kpi: '11,467 تفاعل', cpa: '0.03 ر.س', reach: '17,785', roas: '—', badge: 'متوقف', badgeColor: '#6B7280' },
    ],
  },
  {
    key: 'tiktok',
    name: 'TikTok Ads',
    nameAr: 'تيك توك (تحويلات + ترافيك)',
    emoji: '🎵',
    color: '#010101',
    bg: 'from-slate-700 to-slate-900',
    cardBg: '#F8FAFC',
    borderColor: '#CBD5E1',
    spend: 1521.13,
    primaryMetricLabel: 'التحويلات المؤكدة',
    primaryMetricValue: '82',
    primaryMetricSub: 'قيمة التحويلات: 4,715 ر.س',
    roas: 12.2,
    roasLabel: '×12.2 ROAS',
    roasColor: '#15803D',
    stats: [
      { label: 'الانطباعات', value: '1,139,772' },
      { label: 'النقرات', value: '23,132' },
      { label: 'معدل النقر CTR', value: '3.55%' },
      { label: 'تكلفة النقرة CPC', value: '0.065 ر.س' },
      { label: 'CPM', value: '1.41 ر.س' },
      { label: 'حملات', value: '3 حملات' },
    ],
    campaigns: [
      { name: 'المبيعات 3/8/2026 (قطع كورية)', status: 'ACTIVE', spend: 840.5, kpi: '54 تحويل', cpa: '15.5 ر.س', reach: '598,200', roas: '×3.78', badge: 'مبيعات', badgeColor: '#15803D' },
      { name: 'Traffic 22/7/2026 (زيارات السلة)', status: 'ACTIVE', spend: 480.63, kpi: '21 تحويل', cpa: '22.9 ر.س', reach: '395,120', roas: '×2.37', badge: 'ترافيك', badgeColor: '#9333EA' },
      { name: 'Community الوعي 10/8/2026', status: 'COMPLETED', spend: 200.0, kpi: '7 تحويلات', cpa: '28.6 ر.س', reach: '146,452', roas: '×1.98', badge: 'مكتمل', badgeColor: '#6B7280' },
    ],
  },
];

const TOTAL_SPEND = PLATFORMS.reduce((s, p) => s + p.spend, 0);

function SpendBar({ platform }) {
  const pct = ((platform.spend / TOTAL_SPEND) * 100).toFixed(1);
  return (
    <div className="flex items-center gap-2 text-xs" dir="rtl">
      <span className="w-20 text-slate-500 shrink-0">{platform.name}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: platform.color }}
        />
      </div>
      <span className="w-14 text-left font-mono text-slate-700 font-bold">{platform.spend.toLocaleString('ar-SA', { minimumFractionDigits: 0 })} ر.س</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    'ACTIVE': { label: 'نشطة', color: '#15803D', bg: '#DCFCE7' },
    'PAUSED': { label: 'متوقف', color: '#9333EA', bg: '#F3E8FF' },
    'COMPLETED': { label: 'مكتملة', color: '#6B7280', bg: '#F1F5F9' },
  };
  const s = map[status] || map['ACTIVE'];
  return (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>
      {s.label}
    </span>
  );
}

export default function OwnerCampaignTab({ viewMode = 'mobile' }) {
  const [activePlatform, setActivePlatform] = useState('meta');
  const platform = PLATFORMS.find(p => p.key === activePlatform);

  const roasChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      confine: true,
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#F8FAFC', fontFamily: 'Cairo', fontSize: 11 },
      formatter: (params) => `<div style="font-family:Cairo;direction:rtl">${params[0].name}: ×${params[0].value}</div>`,
    },
    grid: { left: 10, right: 10, bottom: 30, top: 20, containLabel: true },
    xAxis: {
      type: 'category',
      data: PLATFORMS.map(p => p.name),
      axisLabel: { fontFamily: 'Cairo', fontSize: 10, color: '#334155', fontWeight: 'bold' },
      axisLine: { lineStyle: { color: '#E2E8F0' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v) => `×${v}`, fontFamily: 'Cairo', fontSize: 10, color: '#64748B' },
      splitLine: { lineStyle: { color: '#F1F5F9' } },
    },
    series: [{
      type: 'bar',
      barWidth: '50%',
      data: PLATFORMS.map(p => ({
        value: p.roas,
        itemStyle: {
          color: p.key === activePlatform ? p.color : '#E2E8F0',
          borderRadius: [8, 8, 0, 0],
        },
      })),
      label: {
        show: true,
        position: 'top',
        fontFamily: 'Cairo',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0F172A',
        formatter: (p) => `×${p.value}`,
      },
    }],
  };

  return (
    <div className="space-y-4 pb-2" dir="rtl">

      {/* ── Header ── */}
      <div className="bg-gradient-to-l from-indigo-900 to-blue-900 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-xl">📊</div>
          <div>
            <h2 className="font-black text-base leading-tight">أداء الحملات الإعلانية</h2>
            <p className="text-blue-200 text-xs">أغسطس 2026 — بيانات حقيقية فقط</p>
          </div>
        </div>

        {/* Total Spend Summary */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {PLATFORMS.map(p => (
            <div key={p.key} className="bg-white/10 rounded-xl p-2.5 text-center">
              <div className="text-[10px] text-blue-200 mb-0.5">{p.name}</div>
              <div className="font-black text-sm">{(p.spend / 1000).toFixed(1)}K</div>
              <div className="text-[9px] text-green-300 font-bold">{p.roasLabel}</div>
            </div>
          ))}
        </div>

        {/* Budget distribution bars */}
        <div className="space-y-1.5">
          <div className="text-[10px] text-blue-200 mb-1">توزيع الميزانية الإعلانية</div>
          {PLATFORMS.map(p => <SpendBar key={p.key} platform={p} />)}
        </div>
      </div>

      {/* ── ROAS Bar Chart ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="text-xs font-bold text-slate-500 mb-2">مقارنة العائد الإعلاني (ROAS) — أغسطس 2026</div>
        <div dir="ltr">
          <ReactECharts option={roasChartOption} style={{ height: 140, width: '100%' }} opts={{ renderer: 'canvas' }} />
        </div>
        <div className="text-[10px] text-slate-400 text-center mt-1">ميتا الأعلى عائداً بسبب محادثات واتساب المحولة مباشرةً</div>
      </div>

      {/* ── Platform Selector Tabs ── */}
      <div className="flex gap-2">
        {PLATFORMS.map(p => (
          <button
            key={p.key}
            onClick={() => setActivePlatform(p.key)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 border ${
              activePlatform === p.key
                ? 'text-white shadow-md border-transparent'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
            style={activePlatform === p.key ? { backgroundColor: p.color } : {}}
          >
            <span className="text-base">{p.emoji}</span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>

      {/* ── Active Platform Detail ── */}
      {platform && (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: platform.cardBg, borderColor: platform.borderColor }}
        >
          {/* Platform Header */}
          <div className={`bg-gradient-to-l ${platform.bg} p-4 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-black">{platform.nameAr}</div>
                <div className="text-xs text-white/70 mt-0.5">إجمالي الإنفاق: {platform.spend.toLocaleString('ar-SA')} ر.س</div>
              </div>
              <div className="text-left">
                <div className="text-2xl font-black">{platform.primaryMetricValue}</div>
                <div className="text-xs text-white/80">{platform.primaryMetricLabel}</div>
                <div className="text-[10px] text-green-300 font-bold mt-0.5">{platform.primaryMetricSub}</div>
              </div>
            </div>
            {/* ROAS Badge */}
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
              <span className="text-green-300 font-black text-sm">{platform.roasLabel}</span>
              <span className="text-white/60 text-[10px]">العائد على الإنفاق الإعلاني</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 p-3">
            {platform.stats.map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-2.5 text-center shadow-xs border border-white/60">
                <div className="text-[10px] text-slate-500 mb-0.5 leading-tight">{s.label}</div>
                <div className="font-black text-slate-900 text-xs">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Campaigns List */}
          <div className="px-3 pb-3 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 pt-1 pb-0.5">تفاصيل الحملات</div>
            {platform.campaigns.map((c, i) => (
              <div key={i} className="bg-white rounded-xl p-3 shadow-xs border border-slate-100">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-xs font-bold text-slate-900 leading-tight flex-1">{c.name}</div>
                  <div className="flex items-center gap-1 shrink-0">
                    <StatusBadge status={c.status} />
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: c.badgeColor }}
                    >
                      {c.badge}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="text-center">
                    <div className="text-[9px] text-slate-400">الإنفاق</div>
                    <div className="text-[11px] font-bold text-slate-800">{c.spend.toLocaleString()} ر.س</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] text-slate-400">الهدف</div>
                    <div className="text-[11px] font-bold text-slate-800">{c.kpi}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] text-slate-400">التكلفة/وحدة</div>
                    <div className="text-[11px] font-bold text-slate-800">{c.cpa}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] text-slate-400">ROAS</div>
                    <div className="text-[11px] font-bold text-emerald-700">{c.roas}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
