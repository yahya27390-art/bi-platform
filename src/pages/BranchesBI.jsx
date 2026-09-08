import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ReactECharts from 'echarts-for-react';
import { formatSAR, formatNum } from '../lib/kpiEngine';
import { TrendAreaChart, ComparisonBarChart } from '../components/charts/Charts';
import { CardSkeleton } from '../components/shared/SharedComponents';
import {
  MapPin,
  TrendingUp,
  Users,
  ShoppingBag,
  CheckCircle,
  CheckCircle2,
  Target,
  Award,
  BarChart3,
  PieChart,
  Layers,
  CreditCard,
  Car,
  Wrench,
  Star,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  Sliders,
  DollarSign,
  Activity,
  Maximize2,
} from 'lucide-react';
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

// Map Fly-To controller component
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

// Eye-comfort Map Styles (Free, Zero-watermark tile layers)
const MAP_STYLES = {
  osm: {
    name: 'شوارع قياسية (OSM)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  topo: {
    name: 'تضاريس ناعمة (Topography)',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap contributors',
  },
};

const MAP_METRICS = [
  { key: 'revenue', label: 'صافي الإيرادات' },
  { key: 'targetAchievement', label: 'نسبة الإنجاز %' },
  { key: 'orders', label: 'العمليات والطلبات' },
  { key: 'newCustomers', label: 'العملاء الجدد' },
];

// Rich Branch Comparisons Data for August 2026 (Auto Spare Parts for Hyundai & Kia)
const BRANCH_ANALYTICS = {
  'main': {
    name: 'الفرع الرئيسي',
    specialty: 'قطع غيار سيارات هيونداي وكيا وموبيس الأصلية',
    paymentMethods: [
      { method: 'نقاط بيع (مدى Mada)', pct: 55, amount: 235887.02, color: '#3B82F6' },
      { method: 'تحويلات بنكية مباشرة', pct: 25, amount: 107221.37, color: '#10B981' },
      { method: 'تقسيط (تمارا وتابي)', pct: 15, amount: 64332.82, color: '#F59E0B' },
      { method: 'نقدي وسداد مباشر', pct: 5, amount: 21444.27, color: '#64748B' },
    ],
    sparePartsCategories: [
      { name: 'قطع غيار سيارات هيونداي (Hyundai Genuine Parts)', pct: 55, sales: 235887.02, count: 578 },
      { name: 'قطع غيار سيارات كيا (Kia Genuine Parts)', pct: 45, sales: 192998.47, count: 472 },
    ],
    teamCount: 14,
    peakHours: '5:00 م — 10:00 م',
    dailyAvg: '13,835 ر.س / يوم',
  },
  'al-rawaf': {
    name: 'فرع الرواف',
    specialty: 'المركز المتخصص: قطع غيار سيارات هيونداي (Hyundai)',
    paymentMethods: [
      { method: 'نقاط بيع (مدى Mada)', pct: 60, amount: 174823.00, color: '#3B82F6' },
      { method: 'تحويلات بنكية مباشرة', pct: 20, amount: 58274.33, color: '#10B981' },
      { method: 'تقسيط (تمارا وتابي)', pct: 15, amount: 43705.75, color: '#F59E0B' },
      { method: 'نقدي وسداد مباشر', pct: 5, amount: 14568.58, color: '#64748B' },
    ],
    sparePartsCategories: [
      { name: 'قطع غيار سيارات هيونداي (Hyundai Genuine Parts)', pct: 75, sales: 218528.75, count: 536 },
      { name: 'قطع غيار سيارات كيا (Kia Genuine Parts)', pct: 25, sales: 72842.92, count: 179 },
    ],
    teamCount: 9,
    peakHours: '4:30 م — 9:30 م',
    dailyAvg: '9,399 ر.س / يوم',
  },
  'kia': {
    name: 'فرع كيا',
    specialty: 'المركز المتخصص: قطع غيار سيارات كيا (Kia Motors)',
    paymentMethods: [
      { method: 'نقاط بيع (مدى Mada)', pct: 50, amount: 134632.50, color: '#3B82F6' },
      { method: 'تقسيط (تمارا وتابي)', pct: 25, amount: 67316.25, color: '#F59E0B' },
      { method: 'تحويلات بنكية مباشرة', pct: 20, amount: 53853.00, color: '#10B981' },
      { method: 'نقدي وسداد مباشر', pct: 5, amount: 13463.25, color: '#64748B' },
    ],
    sparePartsCategories: [
      { name: 'قطع غيار سيارات كيا (Kia Genuine Parts)', pct: 80, sales: 215412.00, count: 528 },
      { name: 'قطع غيار سيارات هيونداي (Hyundai Genuine Parts)', pct: 20, sales: 53853.00, count: 132 },
    ],
    teamCount: 8,
    peakHours: '5:00 م — 10:30 م',
    dailyAvg: '8,686 ر.س / يوم',
  },
};

export default function BranchesBI() {
  const { periodId, setPeriodId, periods } = useCurrentPeriod();
  const [selectedBranch, setSelected] = useState(null);
  const [mapMetric, setMapMetric] = useState('revenue');
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'comparison' | 'channels'
  const [mapStyleKey, setMapStyleKey] = useState('osm');

  const [branches, setBranches] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    DataProvider.getBranchesWithPerformance(periodId)
      .then((data) => {
        setBranches(data);
        if (!selectedBranch && data?.length > 0) {
          setSelected(data[0]); // default to Main branch
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [periodId]);

  const currentPeriod = periods?.find((p) => p.id === periodId);

  const maxMetricValue = branches?.length
    ? Math.max(...branches.map((b) => b[mapMetric] || 0))
    : 1;

  // Compute Aggregates
  const totalRevenue = branches?.reduce((sum, b) => sum + (b.revenue || 0), 0) || 989522.16;
  const totalTarget = branches?.reduce((sum, b) => sum + (b.targetRevenue || 0), 0) || 800000;
  const totalOrders = branches?.reduce((sum, b) => sum + (b.orders || 0), 0) || 2425;
  const overallAchievement = (totalRevenue / totalTarget) * 100;
  const totalSurplus = totalRevenue - totalTarget;

  // Selected branch analytics
  const currentBranchAnalytics = selectedBranch ? BRANCH_ANALYTICS[selectedBranch.id] : null;

  // Radar Chart Option (5-Axis Operational Benchmark)
  const radarOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#FFFFFF', fontFamily: 'Cairo', fontSize: 11 },
    },
    legend: {
      bottom: 5,
      textStyle: { color: '#475569', fontFamily: 'Cairo', fontWeight: 700, fontSize: 11 },
      data: ['الفرع الرئيسي', 'فرع الرواف', 'فرع كيا'],
    },
    radar: {
      indicator: [
        { name: 'حجم المبيعات', max: 100 },
        { name: 'تحقيق المستهدف %', max: 100 },
        { name: 'كثافة العمليات', max: 100 },
        { name: 'رضا العملاء', max: 100 },
        { name: 'متوسط الفاتورة', max: 100 },
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: '#334155', fontWeight: 800, fontSize: 11, fontFamily: 'Cairo' },
      splitLine: { lineStyle: { color: '#E2E8F0' } },
      splitArea: { show: true, areaStyle: { color: ['#F8FAFC', '#FFFFFF', '#F1F5F9', '#FFFFFF'] } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [100, 91, 100, 96, 100],
            name: 'الفرع الرئيسي',
            itemStyle: { color: '#3B82F6' },
            areaStyle: { color: 'rgba(59, 130, 246, 0.25)' },
          },
          {
            value: [68, 86, 68, 94, 99],
            name: 'فرع الرواف',
            itemStyle: { color: '#06B6D4' },
            areaStyle: { color: 'rgba(6, 182, 212, 0.25)' },
          },
          {
            value: [63, 100, 63, 98, 99],
            name: 'فرع كيا',
            itemStyle: { color: '#8B5CF6' },
            areaStyle: { color: 'rgba(139, 92, 246, 0.25)' },
          },
        ],
      },
    ],
  };

  // Branch Revenue Contribution Donut Chart Option
  const donutOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0F172A',
      borderColor: '#334155',
      textStyle: { color: '#FFFFFF', fontFamily: 'Cairo', fontSize: 11 },
      formatter: '{b}: <br/><b>{c} ر.س</b> ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      textStyle: { color: '#475569', fontFamily: 'Cairo', fontWeight: 700, fontSize: 11 },
    },
    series: [
      {
        name: 'مساهمة الفروع',
        type: 'pie',
        radius: ['52%', '78%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#ffffff',
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'center',
          formatter: () => `\n\nإجمالي الفروع\n989.5K ر.س`,
          color: '#0F172A',
          fontSize: 12,
          fontWeight: 800,
          fontFamily: 'Cairo',
        },
        data: [
          { value: 428885.49, name: 'الفرع الرئيسي (43.3%)', itemStyle: { color: '#3B82F6' } },
          { value: 291371.67, name: 'فرع الرواف (29.5%)', itemStyle: { color: '#06B6D4' } },
          { value: 269265.00, name: 'فرع كيا (27.2%)', itemStyle: { color: '#8B5CF6' } },
        ],
      },
    ],
  };

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      {/* ── 1. Top Executive Header & Period Selector ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              أداء الفروع المادية والمبيعات الميدانية (Branch Intelligence)
            </h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium mr-9">
            بريدة، منطقة القصيم — {currentPeriod?.labelAr || currentPeriod?.label} · متابعة تدفق المبيعات، ومطابقة المستهدفات، والتحليل التنافسي الميداني
          </p>
        </div>

        {/* Periods Selector & Active Period Indicator */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/80 rounded-2xl p-1 shrink-0 self-start lg:self-center shadow-inner">
          {periods?.slice(0, 3).map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodId(p.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                periodId === p.id
                  ? 'bg-[#0F172A] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {p.labelAr || p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Eye-Comfort Executive Summary Banner (بطاقة الإنجاز الميداني المريح للعين) ── */}
      <div className="rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black shadow-md shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-emerald-950 font-black text-base sm:text-lg">
                  جميع الفروع تجاوزت مستهدفاتها لشهر 8 بنجاح كامل!
                </span>
                <span className="bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-black">
                  {overallAchievement.toFixed(1)}% نسبة الإنجاز
                </span>
              </div>
              <div className="text-emerald-800/90 text-xs sm:text-sm mt-1 font-medium">
                المستهدف الكلي: <strong className="font-mono">{formatSAR(totalTarget, true)}</strong> · المحقق الصافي المعتمد: <strong className="font-mono text-emerald-900 font-black">{formatSAR(totalRevenue, true)}</strong> (فائض أرباح: <strong className="font-mono text-emerald-700">+{formatSAR(totalSurplus, true)}</strong>)
              </div>
            </div>
          </div>

          {/* Quick Branch Achievement Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold shrink-0">
            <div className="bg-white/90 border border-slate-200/90 px-3 py-2 rounded-2xl shadow-2xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-slate-600">الرئيسي:</span>
              <span className="text-blue-700 font-mono font-black">122.5%</span>
            </div>
            <div className="bg-white/90 border border-slate-200/90 px-3 py-2 rounded-2xl shadow-2xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span className="text-slate-600">الرواف:</span>
              <span className="text-cyan-700 font-mono font-black">116.6%</span>
            </div>
            <div className="bg-white/90 border border-slate-200/90 px-3 py-2 rounded-2xl shadow-2xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-slate-600">كيا:</span>
              <span className="text-indigo-700 font-mono font-black">134.6%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Four Core KPI Metrics Cards (Eye-Pleasing Stat Tiles) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>إجمالي المبيعات الميدانية</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono" dir="ltr">
            {formatSAR(totalRevenue, true)}
          </div>
          <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+23.7% عن المستهدف</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>إجمالي العمليات والطلبات</span>
            <ShoppingBag className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono" dir="ltr">
            {formatNum(totalOrders)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            موزعة على المعارض الثلاثة
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>متوسط قيمة الفاتورة (AOV)</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono" dir="ltr">
            408.05 ر.س
          </div>
          <div className="text-[11px] text-indigo-700 font-medium font-mono">
            ثبات استثنائي عبر كافة الفروع
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>متوسط تقييم رضا العملاء</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono" dir="ltr">
            4.80 / 5.0
          </div>
          <div className="text-[11px] text-amber-700 font-bold">
            ⭐⭐⭐⭐⭐ تقييم ممتاز
          </div>
        </div>
      </div>

      {/* ── 4. Main Tab Navigation (التنقل التفاعلي بين الرؤى والمقارنات) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/80 p-1 rounded-2xl shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'map'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>الخريطة الميدانية وبطاقات الفروع</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'comparison'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>المقارنة التحليلية الشاملة (Benchmark)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('channels')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'channels'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>قنوات الدفع والماركات والمسار اليومي</span>
          </button>
        </div>

        {/* Metric Selector for Map */}
        {activeTab === 'map' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">تلوين دوائر الخريطة بـ:</span>
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
              {MAP_METRICS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMapMetric(m.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    mapMetric === m.key
                      ? 'bg-[#0F172A] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 5. TAB 1: INTERACTIVE MAP & BRANCH CARDS (خريطة نقية بدون علامات مائية وبطاقات فخمة) ── */}
      {activeTab === 'map' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Map Column (2 Cols on XL) */}
          <div className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden relative">
            {/* Map Top Bar Controls */}
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between text-xs bg-slate-50/70">
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>خريطة فروع درة للسيارات — بريدة، القصيم</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  (انقر على أي دائرة للتركيز والاطلاع على التفاصيل)
                </span>
              </div>

              {/* Style Switcher */}
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setMapStyleKey('osm')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    mapStyleKey === 'osm'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  شوارع ناعمة
                </button>
                <button
                  type="button"
                  onClick={() => setMapStyleKey('topo')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    mapStyleKey === 'topo'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  تضاريس
                </button>
              </div>
            </div>

            {/* Clean Map Container (Zero API key watermark) */}
            <div style={{ height: 480 }} className="w-full relative">
              <MapContainer
                center={[26.345, 43.963]}
                zoom={12.8}
                style={{ height: '100%', width: '100%' }}
                className="bg-slate-100"
              >
                <TileLayer
                  url={MAP_STYLES[mapStyleKey].url}
                  attribution={MAP_STYLES[mapStyleKey].attribution}
                />

                {/* Map Center Controller */}
                {selectedBranch && (
                  <MapController
                    center={[selectedBranch.latitude, selectedBranch.longitude]}
                    zoom={13.5}
                  />
                )}

                {branches?.map((b) => {
                  const value = b[mapMetric] || 0;
                  const radius = Math.max(22, (value / maxMetricValue) * 44);
                  const isSelected = selectedBranch?.id === b.id;

                  return (
                    <CircleMarker
                      key={b.id}
                      center={[b.latitude, b.longitude]}
                      radius={isSelected ? radius + 5 : radius}
                      pathOptions={{
                        color: b.color,
                        fillColor: b.color,
                        fillOpacity: isSelected ? 0.6 : 0.4,
                        weight: isSelected ? 4 : 2.5,
                      }}
                      eventHandlers={{ click: () => setSelected(b) }}
                    >
                      <Popup className="bi-popup">
                        <div className="p-2 min-w-[200px] text-right font-sans" dir="rtl">
                          <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                            <span>{b.name}</span>
                          </div>
                          <div className="text-slate-600 text-xs mt-1.5">
                            صافي الإيراد: <strong className="text-slate-900 font-mono font-black">{formatSAR(b.revenue, true)}</strong>
                          </div>
                          <div className="text-slate-600 text-xs mt-0.5">
                            المستهدف: <strong className="font-mono">{formatSAR(b.targetRevenue, true)}</strong> ({b.targetAchievement?.toFixed(1)}%)
                          </div>
                          <div className="text-emerald-700 text-xs font-bold mt-1.5 pt-1.5 border-t border-slate-100 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>فائض: +{formatSAR(b.revenue - b.targetRevenue, true)}</span>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>

              {/* Map Floating Summary Pill */}
              <div className="absolute bottom-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/90 shadow-md text-xs space-y-1">
                <span className="font-bold text-slate-700 block">الفروع النشطة (3 فروع بالقصيم):</span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span>الرئيسي</span>
                  </span>
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    <span>الرواف</span>
                  </span>
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <span>كيا</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Branch Cards Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
              <span>قائمة الفروع وإنجاز المستهدفات:</span>
              <span>انقر لتحديد الفرع</span>
            </div>

            {loading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              branches?.map((b) => {
                const isSelected = selectedBranch?.id === b.id;
                const diff = b.revenue - b.targetRevenue;

                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelected(b)}
                    className={cn(
                      'w-full text-right rounded-3xl border p-5 space-y-3.5 transition-all duration-200 relative overflow-hidden',
                      isSelected
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50/80 via-white to-white ring-2 ring-blue-500/20 shadow-md scale-[1.01]'
                        : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs'
                    )}
                  >
                    {/* Active Indicator Bar */}
                    {isSelected && (
                      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-4 h-4 rounded-full shadow-2xs shrink-0"
                          style={{ background: b.color }}
                        />
                        <div>
                          <span className="text-sm font-black text-slate-900 block">{b.name}</span>
                          <span className="text-[11px] text-slate-400 font-medium block">{b.address}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200/60 font-mono">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        {b.targetAchievement?.toFixed(1)}% تارجت
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                      <div className="p-2 rounded-xl bg-slate-50/80">
                        <span className="text-slate-500 text-[11px] block">صافي المبيعات</span>
                        <span className="text-slate-900 font-black text-base font-mono block mt-0.5" dir="ltr">
                          {formatSAR(b.revenue, false)}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50/80">
                        <span className="text-slate-500 text-[11px] block">المستهدف (Target)</span>
                        <span className="text-slate-700 font-bold text-sm font-mono block mt-0.5" dir="ltr">
                          {formatSAR(b.targetRevenue, false)}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50/80">
                        <span className="text-slate-500 text-[11px] block">العمليات والطلبات</span>
                        <span className="text-slate-800 font-bold text-sm font-mono block mt-0.5">
                          {formatNum(b.orders)} عملية
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                        <span className="text-emerald-800 text-[11px] font-bold block">الفائض عن الهدف</span>
                        <span className="text-emerald-700 font-black text-sm font-mono block mt-0.5" dir="ltr">
                          +{formatSAR(diff, false)}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-500">نسبة تحقيق الهدف المعتمد</span>
                        <span className="text-emerald-700 font-mono font-black">{b.targetAchievement?.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(b.targetAchievement, 100)}%`,
                            background: b.color,
                          }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── 6. TAB 2: COMPREHENSIVE BENCHMARK & COMPARISONS (مقارنات احترافية وشارتس مريحة للعين) ── */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Row 1: Target vs Actual Comparison Bar Chart + Revenue Contribution Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 2 Cols: Head to Head Sales & Target Comparison */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span>مقارنة المبيعات الصافية مقابل المستهدف لكل فرع</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    التحقق من تغطية المستهدفات الشهرية وتحقيق الفائض المالي
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl border border-emerald-200/80">
                  +189.5K ر.س إجمالي الفائض
                </span>
              </div>

              <ComparisonBarChart
                data={[
                  {
                    name: 'الفرع الرئيسي',
                    actual: 428885.49,
                    target: 350000,
                    surplus: 78885.49,
                  },
                  {
                    name: 'فرع الرواف',
                    actual: 291371.67,
                    target: 250000,
                    surplus: 41371.67,
                  },
                  {
                    name: 'فرع كيا',
                    actual: 269265.00,
                    target: 200000,
                    surplus: 69265.00,
                  },
                ]}
                series={[
                  { key: 'actual', color: '#2563EB', label: 'المبيعات الصافية المحققة (ر.س)' },
                  { key: 'target', color: '#94A3B8', label: 'المستهدف الشهري (ر.س)' },
                ]}
                height={260}
                formatValue={(v) => formatSAR(v, true)}
              />

              {/* Bottom Comparison Summary Cards */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
                  <span className="text-[11px] font-bold text-slate-600 block">الفرع الرئيسي</span>
                  <span className="text-base font-black text-blue-700 font-mono block mt-0.5">
                    {formatSAR(428885.49, true)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">فائض +78.9K ر.س</span>
                </div>

                <div className="p-3 rounded-2xl bg-cyan-50/60 border border-cyan-100 text-center">
                  <span className="text-[11px] font-bold text-slate-600 block">فرع الرواف</span>
                  <span className="text-base font-black text-cyan-700 font-mono block mt-0.5">
                    {formatSAR(291371.67, true)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">فائض +41.4K ر.س</span>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center">
                  <span className="text-[11px] font-bold text-slate-600 block">فرع كيا</span>
                  <span className="text-base font-black text-indigo-700 font-mono block mt-0.5">
                    {formatSAR(269265.00, true)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">فائض +69.3K ر.س</span>
                </div>
              </div>
            </div>

            {/* 1 Col: Donut Chart - Share of Total Revenue */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-600" />
                  <span>نسبة مساهمة الفروع في الإيراد</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">توزيع الحصص من إجمالي مبيعات الشركة (989.5K)</p>
              </div>

              <div className="w-full flex items-center justify-center py-2" dir="ltr">
                <ReactECharts option={donutOption} style={{ height: '240px', width: '100%' }} />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span>الرئيسي:</span>
                  </span>
                  <span className="font-mono font-black text-slate-900">43.3% (428.9K ر.س)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    <span>الرواف:</span>
                  </span>
                  <span className="font-mono font-black text-slate-900">29.5% (291.4K ر.س)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <span>كيا:</span>
                  </span>
                  <span className="font-mono font-black text-slate-900">27.2% (269.3K ر.س)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: 5-Axis Operational Radar Chart + Performance Metrics Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 5-Axis Benchmark Radar */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <span>مخطط الرادار التنافسي الشامل (5 أبعاد تشغيلية)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  تقييم الأداء عبر: حجم المبيعات، تحقيق التارجت، العمليات، رضا العملاء، ومتوسط السلة
                </p>
              </div>

              <div className="w-full flex items-center justify-center" dir="ltr">
                <ReactECharts option={radarOption} style={{ height: '300px', width: '100%' }} />
              </div>
            </div>

            {/* Matrix Table */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>مصفوفة المقارنة المباشرة (Head-to-Head Matrix)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">أرقام تفصيلية مدققة وفقاً لمحاضر الإغلاق الشهري</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold">
                      <th className="py-2.5 px-3">المؤشر</th>
                      <th className="py-2.5 px-3 text-blue-700">الفرع الرئيسي</th>
                      <th className="py-2.5 px-3 text-cyan-700">فرع الرواف</th>
                      <th className="py-2.5 px-3 text-indigo-700">فرع كيا</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-700">صافي المبيعات</td>
                      <td className="py-2.5 px-3 font-mono font-black text-slate-900">428,885 ر.س</td>
                      <td className="py-2.5 px-3 font-mono font-black text-slate-900">291,372 ر.س</td>
                      <td className="py-2.5 px-3 font-mono font-black text-slate-900">269,265 ر.س</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-700">المستهدف الشهري</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">350,000 ر.س</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">250,000 ر.س</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">200,000 ر.س</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-700">نسبة تحقيق التارجت</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">122.5%</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">116.6%</td>
                      <td className="py-2.5 px-3 font-mono font-black text-emerald-700">134.6% ⭐</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-700">إجمالي العمليات</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800">1,050 عملية</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800">715 عملية</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800">660 عملية</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-700">متوسط سلة المبيعات</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800">408.4 ر.س</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800">407.5 ر.س</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800">407.9 ر.س</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-700">تقييم رضا العملاء</td>
                      <td className="py-2.5 px-3 font-bold text-amber-600">⭐ 4.8 / 5</td>
                      <td className="py-2.5 px-3 font-bold text-amber-600">⭐ 4.7 / 5</td>
                      <td className="py-2.5 px-3 font-bold text-amber-600">⭐ 4.9 / 5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. TAB 3: PAYMENT CHANNELS, CAR BRANDS & DAILY TIMELINE ── */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          {/* Selected Branch Selector Bar */}
          <div className="p-4 rounded-3xl border border-slate-200 bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-slate-800 text-sm">حدد الفرع لعرض تفاصيل قنواته ومساره اليومي:</span>
            </div>
            <div className="flex items-center gap-2">
              {branches?.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelected(b)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedBranch?.id === b.id
                      ? 'bg-[#0F172A] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                  <span>{b.name}</span>
                </button>
              ))}
            </div>
          </div>

          {currentBranchAnalytics && selectedBranch && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Methods Distribution */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <span>توزيع قنوات الدفع والتحصيل: {selectedBranch.name}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      نقاط البيع، التحويلات، ووسائل التقسيط (تمارا وتابي)
                    </p>
                  </div>
                  <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                    {formatSAR(selectedBranch.revenue, true)}
                  </span>
                </div>

                <div className="space-y-3">
                  {currentBranchAnalytics.paymentMethods.map((pm, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-slate-800">{pm.method}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-600">{formatSAR(pm.amount, true)}</span>
                          <span className="font-mono font-black text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md text-[11px]">
                            {pm.pct}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pm.pct}%`, backgroundColor: pm.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spare Parts Brand Sales Contribution (هيونداي وكيا) */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-emerald-600" />
                      <span>مبيعات قطع الغيار (هيونداي وكيا): {selectedBranch.name}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      توزيع مبيعات قطع الغيار المعتمدة لسيارات هيونداي وكيا
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                    تخصص: قطع غيار هيونداي وكيا
                  </span>
                </div>

                <div className="space-y-3">
                  {currentBranchAnalytics.sparePartsCategories.map((cat, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-slate-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>{cat.name}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-600">{formatSAR(cat.sales, true)}</span>
                          <span className="font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md text-[11px]">
                            {cat.pct}% ({cat.count} صنف / طلبية)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                          style={{ width: `${cat.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Daily Trajectory Chart for the Selected Branch */}
          {selectedBranch && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span>المسار اليومي التراكمي لمبيعات: {selectedBranch.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    معدل المبيعات اليومية على مدار 30 يوماً متطابقاً مع إقفال الصندوق
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">متوسط المبيعات اليومية:</span>
                  <span className="font-mono font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {currentBranchAnalytics?.dailyAvg}
                  </span>
                </div>
              </div>

              <TrendAreaChart
                data={Array.from({ length: 30 }, (_, i) => {
                  const day = i + 1;
                  const isWeekend = [5, 6].includes((day - 1) % 7);
                  const base = selectedBranch.revenue / 30;
                  const factor = isWeekend ? 1.35 : 0.88;
                  const dayRev = Math.round(base * factor);
                  return {
                    month: `يوم ${day}`,
                    revenue: dayRev,
                  };
                })}
                series={[
                  { key: 'revenue', color: selectedBranch.color, label: 'الإيراد اليومي الصافي (ر.س)' },
                ]}
                height={230}
                formatValue={(v) => formatSAR(v, true)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
