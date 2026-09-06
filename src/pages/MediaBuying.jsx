import { useState } from 'react';
import { useAdMetrics, useCampaigns, useAdFunnel, usePeriods } from '../hooks/useBIData';
import { formatSAR, formatNum, formatPercent, formatMultiplier, getKPIStatus, STATUS_STYLES } from '../lib/kpiEngine';
import { TrendAreaChart } from '../components/charts/Charts';
import { FunnelViz } from '../components/charts/Charts';
import PlatformRadarChart from '../components/charts/PlatformRadarChart';
import { PlatformBadge, GrowthChip, AttributionNote, CardSkeleton, SectionHeader } from '../components/shared/SharedComponents';
import { cn } from '@/lib/utils';
import { MOCK_PLATFORM_PERIOD_METRICS } from '../data/mockData';
import { Compass, Sparkles, Video, Facebook } from 'lucide-react';
import { useCurrentPeriod } from '../context/BIPeriodContext';
import TikTokIntegrationModal from '../components/shared/TikTokIntegrationModal';
import { loadTikTokConfig } from '../lib/tiktokIntegration';
import MetaIntegrationModal from '../components/shared/MetaIntegrationModal';
import { loadMetaConfig } from '../lib/metaIntegration';

const PLATFORM_TABS = [
  { slug: 'all',    label: 'الكل' },
  { slug: 'meta',   label: 'ميتا' },
  { slug: 'google', label: 'جوجل' },
  { slug: 'tiktok', label: 'تيك توك' },
];

function KPICell({ label, value, metric, unit = '' }) {
  const status = metric ? getKPIStatus(metric, parseFloat(value)) : 'neutral';
  return (
    <div className="rounded-xl p-3 text-center border border-slate-100 bg-slate-50">
      <div className="text-base font-black text-slate-900">{value}{unit}</div>
      <div className="text-xs text-slate-500 mt-0.5 font-medium">{label}</div>
    </div>
  );
}

export default function MediaBuying() {
  const { periodId, setPeriodId, periods } = useCurrentPeriod();
  const [activePlatform, setActivePlatform] = useState('all');
  const [showTikTokModal, setShowTikTokModal] = useState(false);
  const [tiktokConfig, setTikTokConfig] = useState(loadTikTokConfig);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [metaConfig, setMetaConfig] = useState(loadMetaConfig);
  const { data: platforms, loading }    = useAdMetrics(periodId);
  const { data: campaigns }             = useCampaigns({ periodId, platform: activePlatform === 'all' ? undefined : activePlatform });
  const { data: funnels }               = useAdFunnel(periodId, activePlatform === 'all' ? 'meta' : activePlatform);

  const shownPlatforms = activePlatform === 'all'
    ? (platforms || []).filter(p => p.spend > 0)
    : (platforms || []).filter(p => p.slug === activePlatform && p.spend > 0);

  const STATUS_LABELS = { active: 'نشط', paused: 'موقوف', ended: 'منتهي', draft: 'مسودة' };
  const STATUS_COLORS_MAP = { active: 'text-emerald-800 bg-emerald-100', paused: 'text-amber-800 bg-amber-100', ended: 'text-slate-600 bg-slate-100' };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">أداء الإعلانات المدفوعة (Media Buying Intelligence)</h1>
          <p className="text-slate-500 text-sm mt-1">تحليل معمق عبر القنوات: Meta · Google · TikTok مع توزيع الإنفاق والعائد</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Meta Integration Button */}
          <button
            onClick={() => setShowMetaModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-bold text-xs transition-all shadow-sm"
            title="ربط حساب Meta Ads Manager & CAPI"
          >
            <Facebook className="w-4 h-4 text-[#1877f2]" />
            <span>{metaConfig.isConnected ? 'ميتا: متصل حياً' : 'ربط إعلانات ميتا'}</span>
            <span className={`w-2 h-2 rounded-full ${metaConfig.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-blue-400'}`} />
          </button>

          {/* TikTok Integration Button */}
          <button
            onClick={() => setShowTikTokModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition-all shadow-sm"
            title="ربط حساب TikTok Ads Manager"
          >
            <Video className="w-4 h-4 text-[#ff0050]" />
            <span>{tiktokConfig.isConnected ? 'تيك توك: متصل حياً' : 'ربط إعلانات تيك توك'}</span>
            <span className={`w-2 h-2 rounded-full ${tiktokConfig.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
          </button>

          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-2xl p-1 shadow-inner">
            {periods?.slice(0, 3).map(p => (
              <button key={p.id} onClick={() => setPeriodId(p.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${periodId === p.id ? 'bg-[#0F172A] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}>
                {p.labelAr || p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AttributionNote model="Last Click" window="7 أيام" />

      {/* Multi-Axis Channel Radar Matrix Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-800">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                مصفوفة الكفاءة المتعددة الأبعاد (5-Axis Channel Efficiency Radar)
              </h2>
              <p className="text-xs text-slate-500">
                مقارنة شاملة متوازنة بين المنصات على 5 محاور: العائد (ROAS)، كفاءة الاكتساب (CPA)، النقر (CTR)، التحويل (CR)، وحجم المبيعات
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            ECharts Radar
          </span>
        </div>
        <PlatformRadarChart height={340} />
      </div>

      {/* Platform Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {PLATFORM_TABS.map(tab => (
          <button key={tab.slug} onClick={() => setActivePlatform(tab.slug)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all',
              activePlatform === tab.slug
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
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
            <div key={p.slug} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
              {/* Platform header */}
              <div className="flex items-center justify-between">
                <PlatformBadge platform={p.slug} size="md" />
                <div className="flex items-center gap-2">
                  <GrowthChip value={p.roasGrowth} />
                  <span className="text-xs text-slate-500 font-semibold">{p.campaigns || 0} حملات</span>
                </div>
              </div>

              {/* ROAS hero */}
              <div className="py-3 border-y border-slate-100">
                <div className="text-3xl font-black text-slate-900">{formatMultiplier(p.roas)}</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">ROAS المباشر — الإيراد المسند ÷ الإنفاق</div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-3 gap-2">
                <KPICell label="الإنفاق" value={formatSAR(p.spend, false)} />
                <KPICell label="CPA" value={formatSAR(p.cpa)} metric="cpa" />
                <KPICell label="CTR" value={p.ctr?.toFixed(2)} unit="%" metric="ctr" />
                <KPICell label="CPM" value={formatSAR(p.cpm)} metric="cpm" />
                <KPICell label="CPC" value={formatSAR(p.cpc)} metric="cpc" />
                <KPICell label="تحويلات" value={formatNum(p.conversions)} />
              </div>

              {/* More stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                  <div className="text-slate-500 font-medium">المشاهدات</div>
                  <div className="text-slate-900 font-bold">{formatCompact(p.impressions)}</div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                  <div className="text-slate-500 font-medium">النقرات</div>
                  <div className="text-slate-900 font-bold">{formatCompact(p.clicks)}</div>
                </div>
                {p.reach > 0 && (
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                    <div className="text-slate-500 font-medium">الوصول</div>
                    <div className="text-slate-900 font-bold">{formatCompact(p.reach)}</div>
                  </div>
                )}
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                  <div className="text-slate-500 font-medium">إيراد مسند</div>
                  <div className="text-emerald-700 font-bold">{formatSAR(p.attributedRevenue, true)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Funnel */}
      {funnels && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            title={`مسار التحويل — ${activePlatform === 'all' ? 'ميتا' : PLATFORM_TABS.find(t => t.slug === activePlatform)?.label}`}
            subtitle="من الوصول الأولي إلى إتمام الطلب"
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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader title="الحملات الإعلانية المعتمدة" subtitle={`${campaigns.length} حملة`} className="mb-5" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {['الحملة', 'المنصة', 'الحالة', 'الإنفاق', 'ROAS', 'CPA', 'التحويلات', 'الفرع المستفيد'].map(h => (
                    <th key={h} className="text-right text-xs text-slate-600 font-bold py-3 px-2 first:pl-0 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-2">
                      <div className="font-bold text-slate-900 text-xs max-w-[180px] truncate">{c.name}</div>
                      <div className="text-slate-500 text-[11px]">{c.objective}</div>
                    </td>
                    <td className="py-3 px-2"><PlatformBadge platform={c.platform} /></td>
                    <td className="py-3 px-2">
                      <span className={cn('text-xs font-bold px-2 py-0.5 rounded-md', STATUS_COLORS_MAP[c.status] || 'text-slate-600 bg-slate-100')}>
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-900 font-mono text-xs font-bold" dir="ltr">{formatSAR(c.spend, true)}</td>
                    <td className="py-3 px-2">
                      <span className={cn('font-black text-xs', c.roas >= 3 ? 'text-emerald-700' : c.roas >= 1.5 ? 'text-amber-700' : 'text-red-700')} dir="ltr">
                        {formatMultiplier(c.roas)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs text-slate-700 font-bold" dir="ltr">{formatSAR(c.cpa)}</td>
                    <td className="py-3 px-2 text-slate-900 text-xs font-bold">{formatNum(c.conversions)}</td>
                    <td className="py-3 px-2 text-slate-600 text-xs font-medium">{c.branchAttribution === 'ecommerce' ? 'المتجر الإلكتروني' : c.branchAttribution === 'hyundai-rawaf' ? 'فرع الرواف' : 'فرع كيا'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TikTok Integration Modal */}
      <TikTokIntegrationModal
        isOpen={showTikTokModal}
        onClose={() => setShowTikTokModal(false)}
        onSyncComplete={(updated) => setTikTokConfig(updated)}
      />

      {/* Meta Integration Modal */}
      <MetaIntegrationModal
        isOpen={showMetaModal}
        onClose={() => setShowMetaModal(false)}
        onSyncComplete={(updated) => setMetaConfig(updated)}
      />
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
