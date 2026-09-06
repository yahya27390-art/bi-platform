import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useBranchesWithPerformance, usePeriods, useBranchDailySales } from '../hooks/useBIData';
import { formatSAR, formatNum, calcGrossMargin } from '../lib/kpiEngine';
import { TrendAreaChart } from '../components/charts/Charts';
import { GrowthChip, CardSkeleton, SectionHeader, TargetProgress, StatRow } from '../components/shared/SharedComponents';
import KPICard from '../components/charts/KPICard';
import { MapPin, TrendingUp, Users, ShoppingBag, CheckCircle, Target, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataProvider } from '../lib/dataProvider';
import { useCurrentPeriod } from '../context/BIPeriodContext';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MAP_METRICS = [
  { key: 'revenue', label: 'صافي الإيرادات' },
  { key: 'orders', label: 'الطلبات والعمليات' },
  { key: 'targetAchievement', label: 'نسبة تحقيق التارجت' },
  { key: 'newCustomers', label: 'العملاء الجدد' },
];

export default function BranchesBI() {
  const { periodId, setPeriodId, periods } = useCurrentPeriod();
  const [selectedBranch, setSelected] = useState(null);
  const [mapMetric, setMapMetric]   = useState('revenue');

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
          <h1 className="text-2xl font-black text-slate-900">الفروع المادية والمبيعات الميدانية (Branch Performance)</h1>
          <p className="text-slate-500 text-sm mt-1">بريدة، منطقة القصيم — {currentPeriod?.labelAr || currentPeriod?.label} · متابعة تفصيلية لمبيعات ومستهدفات كل فرع</p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-2xl p-1 shadow-inner">
          {periods?.slice(0, 3).map(p => (
            <button key={p.id} onClick={() => setPeriodId(p.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${periodId === p.id ? 'bg-[#0F172A] text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}>
              {p.labelAr || p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Target Achievement Summary Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-emerald-950 font-black text-base flex items-center gap-2">
              جميع الفروع تجاوزت مستهدفاتها لشهر 8 بنجاح!
              <span className="bg-emerald-200/80 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">123.7% إنجاز إجمالي</span>
            </div>
            <div className="text-emerald-800 text-xs mt-0.5 font-medium">
              المستهدف الإجمالي للفروع: 800,000 ر.س · المحقق الصافي: 989,522.16 ر.س (فائض +189,522.16 ر.س)
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
            الرئيسي: <span className="text-emerald-700">122.5%</span>
          </span>
          <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
            الرواف: <span className="text-emerald-700">116.6%</span>
          </span>
          <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
            كيا: <span className="text-emerald-700">134.6%</span>
          </span>
        </div>
      </div>

      {/* Map Metric selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-600">عرض مؤشرات الخريطة بـ:</span>
        {MAP_METRICS.map(m => (
          <button key={m.key} onClick={() => setMapMetric(m.key)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
              mapMetric === m.key
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            )}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Map + Branch Cards side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map */}
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden" style={{ height: 460 }}>
          <MapContainer
            center={[26.345, 43.963]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="bg-slate-100"
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com">CARTO</a>'
            />
            {branches?.map(b => {
              const value  = b[mapMetric] || 0;
              const radius = Math.max(20, (value / maxMetricValue) * 45);
              return (
                <CircleMarker
                  key={b.id}
                  center={[b.latitude, b.longitude]}
                  radius={radius}
                  pathOptions={{ color: b.color, fillColor: b.color, fillOpacity: 0.45, weight: 3 }}
                  eventHandlers={{ click: () => setSelected(b) }}
                >
                  <Popup className="bi-popup">
                    <div className="p-2 min-w-[180px] text-right font-sans" dir="rtl">
                      <div className="font-bold text-slate-900 text-sm">{b.name}</div>
                      <div className="text-slate-600 text-xs mt-1">
                        صافي الإيراد: <strong className="text-slate-900">{formatSAR(b.revenue, true)}</strong>
                      </div>
                      <div className="text-slate-600 text-xs mt-0.5">
                        التارجت: <strong>{formatSAR(b.targetRevenue, true)}</strong> ({b.targetAchievement?.toFixed(1)}%)
                      </div>
                      <div className="text-emerald-700 text-xs font-bold mt-1">
                        ✓ حقق الهدف بفائض +{formatSAR(b.revenue - b.targetRevenue, true)}
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
              <CardSkeleton />
            </>
          ) : branches?.map(b => {
            const isMet = b.revenue >= b.targetRevenue;
            const diff = b.revenue - b.targetRevenue;
            return (
              <button
                key={b.id}
                onClick={() => setSelected(sel => sel?.id === b.id ? null : b)}
                className={cn(
                  'w-full text-right rounded-2xl border p-4 space-y-3 transition-all shadow-sm',
                  selectedBranch?.id === b.id
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full shadow-xs" style={{ background: b.color }} />
                    <span className="text-sm font-black text-slate-900">{b.name}</span>
                  </div>
                  <span className={cn(
                    'text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1',
                    isMet ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  )}>
                    <CheckCircle className="w-3 h-3" />
                    {b.targetAchievement?.toFixed(1)}% تارجت
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                  <div>
                    <div className="text-slate-500 font-medium">صافي المبيعات</div>
                    <div className="text-slate-900 font-black text-sm">{formatSAR(b.revenue, false)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium">المستهدف (Target)</div>
                    <div className="text-slate-700 font-bold">{formatSAR(b.targetRevenue, false)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium">العمليات والطلبات</div>
                    <div className="text-slate-800 font-bold">{formatNum(b.orders)} عملية</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-medium">الفائض عن التارجت</div>
                    <div className="text-emerald-700 font-bold">+{formatSAR(diff, false)}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-500">نسبة تحقيق الهدف</span>
                    <span className="text-emerald-700 font-black">{b.targetAchievement?.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(b.targetAchievement, 100)}%`,
                        background: b.color
                      }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Branch Detail — Daily Sales Chart */}
      {selectedBranch && dailySales?.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader
            title={`المبيعات اليومية التفصيلية: ${selectedBranch.name}`}
            subtitle={`${currentPeriod?.label} · إجمالي المبيعات المحققة: ${formatSAR(selectedBranch.revenue)}`}
            className="mb-6"
          />
          <TrendAreaChart
            data={dailySales.map(d => ({ month: d.day, revenue: d.revenue, orders: d.orders }))}
            series={[
              { key: 'revenue', color: selectedBranch.color, label: 'الإيراد اليومي (ر.س)' },
            ]}
            height={220}
            formatValue={(v) => formatSAR(v, true)}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
              <div className="text-xs text-slate-500 mb-1 font-medium">إجمالي صافي الإيراد</div>
              <div className="text-slate-900 font-black text-lg">{formatSAR(selectedBranch.revenue, true)}</div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
              <div className="text-xs text-slate-500 mb-1 font-medium">مستهدف الفرع</div>
              <div className="text-blue-900 font-black text-lg">{formatSAR(selectedBranch.targetRevenue, true)}</div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
              <div className="text-xs text-slate-500 mb-1 font-medium">نسبة تحقيق التارجت</div>
              <div className="text-emerald-700 font-black text-lg">{selectedBranch.targetAchievement?.toFixed(1)}%</div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
              <div className="text-xs text-slate-500 mb-1 font-medium">رضا العملاء</div>
              <div className="text-amber-600 font-black text-lg">⭐ {selectedBranch.satisfaction}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
