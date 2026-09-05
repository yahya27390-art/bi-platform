import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useBranchesWithPerformance, usePeriods, useBranchDailySales } from '../hooks/useBIData';
import { formatSAR, formatNum, calcGrossMargin } from '../lib/kpiEngine';
import { TrendAreaChart } from '../components/charts/Charts';
import { GrowthChip, CardSkeleton, SectionHeader, TargetProgress, StatRow } from '../components/shared/SharedComponents';
import KPICard from '../components/charts/KPICard';
import { MapPin, TrendingUp, Users, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataProvider } from '../lib/dataProvider';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MAP_METRICS = [
  { key: 'revenue', label: 'الإيرادات' },
  { key: 'orders', label: 'الطلبات' },
  { key: 'newCustomers', label: 'العملاء الجدد' },
  { key: 'targetAchievementPct', label: 'تحقيق الهدف' },
];

export default function BranchesBI() {
  const [periodId, setPeriodId]     = useState('p-2026-09');
  const [selectedBranch, setSelected] = useState(null);
  const [mapMetric, setMapMetric]   = useState('revenue');
  const { data: periods }           = usePeriods();

  // Manually construct branches with performance since hook needed direct provider call
  const [branches, setBranches]     = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    setLoading(true);
    DataProvider.getBranchesWithPerformance(periodId).then(data => {
      setBranches(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [periodId]);

  const { data: dailySales } = useBranchDailySales(selectedBranch?.id, periodId);
  const currentPeriod = periods?.find(p => p.id === periodId);

  const maxMetricValue = branches?.length
    ? Math.max(...branches.map(b => b[mapMetric] || 0))
    : 1;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">الفروع الجغرافية</h1>
          <p className="text-slate-400 text-sm mt-1">بريدة، القصيم — {currentPeriod?.label}</p>
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

      {/* Map Metric selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">عرض الخريطة بـ:</span>
        {MAP_METRICS.map(m => (
          <button key={m.key} onClick={() => setMapMetric(m.key)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
              mapMetric === m.key
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white border border-white/5'
            )}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Map + Branch Cards side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map */}
        <div className="xl:col-span-2 rounded-2xl border border-white/5 overflow-hidden" style={{ height: 420 }}>
          <MapContainer
            center={[26.345, 43.963]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="bg-[#0d1f35]"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com">CARTO</a>'
            />
            {branches?.map(b => {
              const value  = b[mapMetric] || 0;
              const radius = Math.max(20, (value / maxMetricValue) * 60);
              return (
                <CircleMarker
                  key={b.id}
                  center={[b.latitude, b.longitude]}
                  radius={radius}
                  pathOptions={{ color: b.color, fillColor: b.color, fillOpacity: 0.35, weight: 2 }}
                  eventHandlers={{ click: () => setSelected(b) }}
                >
                  <Popup className="bi-popup">
                    <div className="p-2 min-w-[160px]">
                      <div className="font-bold text-slate-800 text-sm">{b.name}</div>
                      <div className="text-slate-600 text-xs mt-1">
                        إيرادات: {formatSAR(b.revenue, true)} · طلبات: {formatNum(b.orders)}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* Branch Cards */}
        <div className="space-y-4">
          {loading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : branches?.map(b => (
            <button
              key={b.id}
              onClick={() => setSelected(sel => sel?.id === b.id ? null : b)}
              className={cn(
                'w-full text-right rounded-2xl border p-4 space-y-3 transition-all',
                selectedBranch?.id === b.id
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : 'border-white/5 bg-[#111827]/80 hover:bg-white/3'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: b.color }} />
                  <span className="text-sm font-bold text-white">{b.name}</span>
                </div>
                <GrowthChip value={b.revenueGrowth} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-slate-500">الإيرادات</div>
                  <div className="text-white font-bold">{formatSAR(b.revenue, true)}</div>
                </div>
                <div>
                  <div className="text-slate-500">الطلبات</div>
                  <div className="text-white font-bold">{formatNum(b.orders)}</div>
                </div>
                <div>
                  <div className="text-slate-500">العملاء الجدد</div>
                  <div className="text-white font-bold">{formatNum(b.newCustomers)}</div>
                </div>
                <div>
                  <div className="text-slate-500">الهامش</div>
                  <div className="text-emerald-400 font-bold">{b.grossMarginPct?.toFixed(1)}%</div>
                </div>
              </div>
              <TargetProgress
                actual={b.revenue}
                target={b.targetRevenue}
                color={b.color}
                label={`${b.targetAchievement?.toFixed(0)}% من الهدف`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Branch Detail — Daily Sales Chart */}
      {selectedBranch && dailySales?.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-[#111827]/80 p-6">
          <SectionHeader
            title={`مبيعات ${selectedBranch.name} — يومياً`}
            subtitle={currentPeriod?.label}
            className="mb-6"
          />
          <TrendAreaChart
            data={dailySales.map(d => ({ month: d.day, revenue: d.revenue, orders: d.orders }))}
            series={[
              { key: 'revenue', color: selectedBranch.color, label: 'الإيرادات' },
            ]}
            height={200}
            formatValue={(v) => formatSAR(v, true)}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="rounded-xl bg-white/3 p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">إجمالي الإيرادات</div>
              <div className="text-white font-black">{formatSAR(selectedBranch.revenue, true)}</div>
            </div>
            <div className="rounded-xl bg-white/3 p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">إجمالي الطلبات</div>
              <div className="text-white font-black">{formatNum(selectedBranch.orders)}</div>
            </div>
            <div className="rounded-xl bg-white/3 p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">العملاء الجدد</div>
              <div className="text-white font-black">{formatNum(selectedBranch.newCustomers)}</div>
            </div>
            <div className="rounded-xl bg-white/3 p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">رضا العملاء</div>
              <div className="text-amber-400 font-black">⭐ {selectedBranch.satisfaction}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
