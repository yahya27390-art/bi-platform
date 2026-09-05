import { useState } from 'react';
import { useAdMetrics, useCampaigns, useAdFunnel, usePeriods } from '../hooks/useBIData';
import { formatSAR, formatNum, formatPercent, formatMultiplier, getKPIStatus, STATUS_STYLES } from '../lib/kpiEngine';
import { TrendAreaChart } from '../components/charts/Charts';
import { FunnelViz } from '../components/charts/Charts';
import { PlatformBadge, GrowthChip, AttributionNote, CardSkeleton, SectionHeader } from '../components/shared/SharedComponents';
import { cn } from '@/lib/utils';
import { MOCK_PLATFORM_PERIOD_METRICS } from '../data/mockData';

const PLATFORM_TABS = [
  { slug: 'all',    label: 'الكل' },
  { slug: 'meta',   label: 'ميتا' },
  { slug: 'google', label: 'جوجل' },
  { slug: 'tiktok', label: 'تيك توك' },
];

function KPICell({ label, value, metric, unit = '' }) {
  const status = metric ? getKPIStatus(metric, parseFloat(value)) : 'neutral';
  const style  = STATUS_STYLES[status];
  return (
    <div className={cn('rounded-lg p-3 text-center', style.bg)}>
      <div className={cn('text-lg font-black', style.text)} dir="ltr">{value}{unit}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

export default function MediaBuying() {
  const [periodId, setPeriodId]         = useState('p-2026-09');
  const [activePlatform, setActivePlatform] = useState('all');
  const { data: periods }               = usePeriods();
  const { data: platforms, loading }    = useAdMetrics(periodId);
  const { data: campaigns }             = useCampaigns({ periodId, platform: activePlatform === 'all' ? undefined : activePlatform });
  const { data: funnels }               = useAdFunnel(periodId, activePlatform === 'all' ? 'meta' : activePlatform);

  const shownPlatforms = activePlatform === 'all'
    ? (platforms || []).filter(p => p.spend > 0)
    : (platforms || []).filter(p => p.slug === activePlatform && p.spend > 0);

  const STATUS_LABELS = { active: 'نشط', paused: 'موقوف', ended: 'منتهي', draft: 'مسودة' };
  const STATUS_COLORS_MAP = { active: 'text-emerald-400 bg-emerald-500/10', paused: 'text-amber-400 bg-amber-500/10', ended: 'text-slate-400 bg-slate-500/10' };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">أداء الإعلانات المدفوعة</h1>
          <p className="text-slate-400 text-sm mt-1">Meta · Google · TikTok</p>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {periods?.slice(0, 3).map(p => (
            <button key={p.id} onClick={() => setPeriodId(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${periodId === p.id ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}>
              {p.labelEn}
            </button>
          ))}
        </div>
      </div>

      <AttributionNote model="Last Click" window="7 أيام" />

      {/* Platform Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {PLATFORM_TABS.map(tab => (
          <button key={tab.slug} onClick={() => setActivePlatform(tab.slug)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all',
              activePlatform === tab.slug
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            )}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Platform Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {shownPlatforms.map(p => (
            <div key={p.slug} className="rounded-2xl border border-white/5 bg-[#111827]/80 p-5 space-y-4">
              {/* Platform header */}
              <div className="flex items-center justify-between">
                <PlatformBadge platform={p.slug} size="md" />
                <div className="flex items-center gap-2">
                  <GrowthChip value={p.roasGrowth} />
                  <span className="text-xs text-slate-500">{p.campaigns || 0} حملات</span>
                </div>
              </div>

              {/* ROAS hero */}
              <div className="py-3 border-y border-white/5">
                <div className="text-4xl font-black text-white" dir="ltr">{formatMultiplier(p.roas)}</div>
                <div className="text-xs text-slate-400 mt-1">ROAS — إيراد مُسند ÷ إنفاق</div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-3 gap-2">
                <KPICell label="إنفاق" value={formatSAR(p.spend, true)} />
                <KPICell label="CPA" value={formatSAR(p.cpa)} metric="cpa" />
                <KPICell label="CTR" value={p.ctr?.toFixed(2)} unit="%" metric="ctr" />
                <KPICell label="CPM" value={formatSAR(p.cpm)} metric="cpm" />
                <KPICell label="CPC" value={formatSAR(p.cpc)} metric="cpc" />
                <KPICell label="تحويلات" value={formatNum(p.conversions)} />
              </div>

              {/* More stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/3 rounded-lg p-2">
                  <div className="text-slate-500">المشاهدات</div>
                  <div className="text-white font-bold">{formatCompact(p.impressions)}</div>
                </div>
                <div className="bg-white/3 rounded-lg p-2">
                  <div className="text-slate-500">النقرات</div>
                  <div className="text-white font-bold">{formatCompact(p.clicks)}</div>
                </div>
                {p.reach > 0 && (
                  <div className="bg-white/3 rounded-lg p-2">
                    <div className="text-slate-500">الوصول</div>
                    <div className="text-white font-bold">{formatCompact(p.reach)}</div>
                  </div>
                )}
                <div className="bg-white/3 rounded-lg p-2">
                  <div className="text-slate-500">إيراد مُسند</div>
                  <div className="text-white font-bold">{formatSAR(p.attributedRevenue, true)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Funnel */}
      {funnels && (
        <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-6">
          <SectionHeader
            title={`مسار التحويل — ${activePlatform === 'all' ? 'ميتا' : PLATFORM_TABS.find(t => t.slug === activePlatform)?.label}`}
            subtitle="من الوصول إلى التحويل"
            className="mb-6"
          />
          <FunnelViz
            data={Array.isArray(funnels) ? funnels : funnels[activePlatform === 'all' ? 'meta' : activePlatform] || []}
            height={280}
          />
        </div>
      )}

      {/* Campaigns Table */}
      {campaigns?.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-6">
          <SectionHeader title="الحملات الإعلانية" subtitle={`${campaigns.length} حملة`} className="mb-5" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['الحملة', 'المنصة', 'الحالة', 'الإنفاق', 'ROAS', 'CPA', 'تحويلات', 'الفرع'].map(h => (
                    <th key={h} className="text-right text-xs text-slate-500 font-semibold py-3 px-2 first:pl-0 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                    <td className="py-3 px-2">
                      <div className="font-semibold text-white text-xs max-w-[160px] truncate">{c.name}</div>
                      <div className="text-slate-500 text-xs">{c.objective}</div>
                    </td>
                    <td className="py-3 px-2"><PlatformBadge platform={c.platform} /></td>
                    <td className="py-3 px-2">
                      <span className={cn('text-xs font-bold px-2 py-0.5 rounded-md', STATUS_COLORS_MAP[c.status] || 'text-slate-400')}>
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-white font-mono text-xs" dir="ltr">{formatSAR(c.spend, true)}</td>
                    <td className="py-3 px-2">
                      <span className={cn('font-bold text-xs', c.roas >= 3 ? 'text-emerald-400' : c.roas >= 1.5 ? 'text-amber-400' : 'text-red-400')} dir="ltr">
                        {formatMultiplier(c.roas)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs text-slate-300" dir="ltr">{formatSAR(c.cpa)}</td>
                    <td className="py-3 px-2 text-white text-xs">{formatNum(c.conversions)}</td>
                    <td className="py-3 px-2 text-slate-400 text-xs">{c.branchAttribution === 'ecommerce' ? 'متجر' : c.branchAttribution === 'hyundai-rawaf' ? 'هيونداي' : 'كيا'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// local helper
function formatCompact(value) {
  if (!value) return '0';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)     return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}
