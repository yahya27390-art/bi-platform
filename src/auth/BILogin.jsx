import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useBIAuth } from './BIAuthContext';
import { 
  ShieldCheck, 
  ShieldAlert,
  Lock, 
  User, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  KeyRound, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Boxes,
  Scale,
  ClipboardList,
  Crown,
  TrendingUp,
  Layers,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import doraLogo from '../assets/dora_logo.png';
import greenArrowLogo from '../assets/green-arrow-logo.png';

// System Showcase Slides Configuration (محتوى النظام في سلايدات تفاعلية)
const SYSTEM_SLIDES = [
  {
    id: 'inventory',
    badge: '📦 إدارة ومطابقة المخزون',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
    title: 'إدارة ومطابقة المخزون الذكي للفروع الثلاثة',
    subtitle: '8,901 صنف مسعر ومطابق سحابياً بدقة متناهية',
    description: 'تغطية شاملة للمركز الرئيسي (100) وفرع الرواف (200) وفرع السليم 2 / كيا (300)، مع حصر السيولة المجمدة (Dead Stock) وتنبيهات نفاد القطع ومطابقة الفواتير بدقة Z-Report.',
    icon: Boxes,
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    floatingCards: [
      { text: '🔒 بيانات مشفرة ومطابقة 100%', bg: 'bg-amber-500/20 text-amber-200 border-amber-500/30' },
      { text: '⚡ جرد حي لـ 8,901 صنف', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
      { text: '📈 تقارير حركة المخزون والوفر', bg: 'bg-blue-500/20 text-blue-200 border-blue-500/30' },
    ],
    stats: [
      { label: 'الأصناف المسعرة', value: '8,901' },
      { label: 'الفروع المتصلة', value: '3 فروع' },
      { label: 'دقة المطابقة', value: '100%' },
    ]
  },
  {
    id: 'comparator',
    badge: '⚖️ ذكاء المشتريات ومقارنة الأسعار',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    title: 'محرك مقارنة أسعار الموردين وتحقيق الوفر المالي',
    subtitle: 'فحص عروض الأسعار وكشف أقل تكلفة قبل الشراء',
    description: 'تحليل آلي فوري لكشوفات الموردين (أرقام الديزل، فحمات بدر الوادي، مسك)، مع احتساب الوفر المالي لكل قطعة وتنبيه الإدارة من الأسعار المرتفعة ومطابقة أصلي وكالة (Mobis) والكوري.',
    icon: Scale,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    floatingCards: [
      { text: '🟢 كشف وفر مالي مباشر للمشتريات', bg: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' },
      { text: '⚠️ تحذير استباقي من الأسعار الأعلى', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
      { text: '📄 تقارير A4 معتمدة وتصدير Excel', bg: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30' },
    ],
    stats: [
      { label: 'وفر الشراء المتاح', value: 'مباشر' },
      { label: 'تحليل أرقام الديزل', value: '109 صنف' },
      { label: 'تصدير الكشوفات', value: 'Excel / PDF' },
    ]
  },
  {
    id: 'shortages',
    badge: '📋 سحابة نواقص الفروع والطلبيات',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    title: 'منظومة نواقص الفروع وأوامر الشراء الفورية',
    subtitle: 'من نوتة الفرع اليدوية إلى أمر التوريد بنقرة واحدة',
    description: 'تسجيل سحابي آمن لنواقص قطع الغيار وطلبات العملاء من كاونتر الفروع، مع مسار اعتماد خاص بمدير المشتريات وتحديث دورة الطلب (معتمد • تم الطلب • تم الاستلام).',
    icon: ClipboardList,
    gradient: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    floatingCards: [
      { text: '🚀 ربط لحظي بين الفروع والمشتريات', bg: 'bg-blue-500/20 text-blue-200 border-blue-500/30' },
      { text: '✓ اعتماد إلكتروني معتمد', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
      { text: '📦 إغلاق دورة التوريد والاستلام', bg: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30' },
    ],
    stats: [
      { label: 'سرعة التحويل', value: 'فوري' },
      { label: 'الاعتماد', value: 'سحابي' },
      { label: 'تتبع الطلبيات', value: 'مباشر' },
    ]
  },
  {
    id: 'owner',
    badge: '👑 الخزنة التنفيذية والذكاء المالي',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    title: 'لوحة قيادة المالك والتحليلات المالية العليا (C-Suite)',
    subtitle: 'رؤية شاملة للسيولة، الأرباح، وهوامش البيع والتجزئة',
    description: 'منظومة مشفرة مخصصة لقرارات الإدارة العليا، تتابع هوامش الربح، أداء الفروع الميدانية، ومبيعات المتجر الإلكتروني مع مؤشرات مالية استباقية ومطابقة الضريبة المعتمدة 15%.',
    icon: Crown,
    gradient: 'from-purple-500/20 via-pink-500/10 to-transparent',
    floatingCards: [
      { text: '💎 خزنة مشفرة للإدارة والمالك', bg: 'bg-purple-500/20 text-purple-200 border-purple-500/30' },
      { text: '📊 ربحية الفروع والمتجر الإلكتروني', bg: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30' },
      { text: '💰 تدقيق Z-Report ومطابقة محاسبية', bg: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' },
    ],
    stats: [
      { label: 'حماية البيانات', value: 'تشفير كامل' },
      { label: 'مؤشرات الأداء', value: 'حية 24/7' },
      { label: 'تقارير الضريبة', value: '15% معتمد' },
    ]
  }
];

export default function BILogin() {
  const { loginWithCredentials } = useBIAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Slides State
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Security inactivity check
  const [securityNotice, setSecurityNotice] = useState(() => {
    try {
      const reason = sessionStorage.getItem('bi_logout_reason');
      if (reason === 'inactivity_5min') {
        sessionStorage.removeItem('bi_logout_reason');
        return 'تم إنهاء الجلسة تلقائياً لعدم وجود أي حركة لمدة 5 دقائق حفاظاً على أمان وسرية البيانات. يرجى تسجيل الدخول مجدداً.';
      }
    } catch {
      // ignore
    }
    return '';
  });

  // Automatic Slide Rotation every 5.5s
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SYSTEM_SLIDES.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % SYSTEM_SLIDES.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + SYSTEM_SLIDES.length) % SYSTEM_SLIDES.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await loginWithCredentials(identifier, password);
      let destination = location.state?.from?.pathname;
      if (!destination || destination === '/') {
        if (loggedUser?.role === 'OWNER') {
          destination = '/owner';
        } else if (loggedUser?.role === 'PURCHASING_MANAGER') {
          destination = '/inventory/branch-shortages';
        } else if (loggedUser?.role === 'INVENTORY_VIEWER') {
          destination = '/inventory/supplier-comparison';
        } else {
          destination = '/';
        }
      }
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'بيانات الدخول غير صحيحة. يرجى التأكد من اسم المستخدم وكلمة المرور.');
    } finally {
      setLoading(false);
    }
  };

  const currentSlideData = SYSTEM_SLIDES[activeSlide];
  const SlideIcon = currentSlideData.icon;

  return (
    <div 
      className="min-h-screen bg-[#070F1E] flex items-center justify-center p-3 sm:p-6 selection:bg-emerald-500 selection:text-white relative overflow-hidden font-sans" 
      dir="rtl"
    >
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 -right-32 w-[32rem] h-[32rem] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-[32rem] h-[32rem] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/[0.04] rounded-full blur-[140px] pointer-events-none" />

      {/* ════════════════════════════════════════════════════════════════
          MASTER SPLIT CONTAINER: RIGHT (SLIDES) + LEFT (LOGIN FORM)
         ════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl w-full bg-[#0B1728]/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10 backdrop-blur-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* ────────────────────────────────────────────────────────────
            الجزء الأيمن: محتوى النظام عبر سلايدات عامة وتفاعلية (RIGHT)
           ──────────────────────────────────────────────────────────── */}
        <div 
          className="lg:col-span-7 bg-gradient-to-br from-slate-900/90 via-[#0B1B32]/80 to-slate-950/95 p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-l border-white/10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Subtle Ambient Slide Glow */}
          <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${currentSlideData.gradient} rounded-full blur-3xl pointer-events-none transition-all duration-700`} />

          {/* Top Brand Header on Slides */}
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
                  DORA CARS BI SYSTEM • 2026
                </span>
              </div>

              {/* Slide Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-bold border transition-all duration-300 ${currentSlideData.badgeColor}`}>
                {currentSlideData.badge}
              </div>
            </div>

            {/* Slide Title & Subtitle */}
            <div className="space-y-1.5 pt-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide leading-tight transition-all duration-300">
                {currentSlideData.title}
              </h2>
              <p className="text-sm font-bold text-cyan-400/90 transition-all duration-300">
                {currentSlideData.subtitle}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1 max-w-xl transition-all duration-300">
                {currentSlideData.description}
              </p>
            </div>
          </div>

          {/* Middle Visual Showcase & Floating Feature Cards */}
          <div className="relative z-10 py-6 sm:py-8 space-y-4">
            {/* Interactive Mockup Presentation Card */}
            <div className="bg-[#091526]/80 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
                    <SlideIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">منظومة ذكاء الأعمال المعتمدة</div>
                    <div className="text-[10px] text-slate-400 font-mono">Dora Cars Enterprise Intelligence</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">نشط ومتصل</span>
                </div>
              </div>

              {/* Floating Feature Badges (Interactive Pills) */}
              <div className="flex flex-wrap gap-2">
                {currentSlideData.floatingCards.map((card, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 ${card.bg}`}
                  >
                    {card.text}
                  </div>
                ))}
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 font-mono text-center">
                {currentSlideData.stats.map((st, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-slate-400 font-sans">{st.label}</div>
                    <div className="font-black text-xs sm:text-sm text-white mt-0.5">{st.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Slide Controller (Dots & Arrows) */}
          <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/10">
            {/* Slide Indicator Dots */}
            <div className="flex items-center gap-2">
              {SYSTEM_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeSlide === idx 
                      ? 'w-8 bg-gradient-to-r from-emerald-400 to-cyan-400' 
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  title={s.badge}
                />
              ))}
            </div>

            {/* Prev / Next Navigation Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prevSlide}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="السابق"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="التالي"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────
            الجزء الأيسر: نموذج تسجيل الدخول والاعتماد الإداري (LEFT)
           ──────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-5 bg-[#0D1E36]/90 p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative z-10">
          
          <div className="space-y-6">
            {/* Top Official Dora Logo & Header */}
            <div className="text-center space-y-2.5">
              <div className="flex justify-center">
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 shadow-lg relative group">
                  <img 
                    src={doraLogo} 
                    alt="درة السيارة" 
                    className="h-16 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300" 
                  />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0D1E36]" />
                </div>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  تسجيل الدخول للمنصة
                </h1>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  منظومة ذكاء الأعمال والتحليلات الرسمية
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>بوابة الدخول المشفرة والمحمية</span>
              </div>
            </div>

            {/* Inactivity Security Notice */}
            {securityNotice && (
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed animate-fadeIn">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>{securityNotice}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs leading-relaxed animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Identifier Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 px-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>اسم المستخدم أو البريد الإلكتروني</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="اسم المستخدم أو الإيميل"
                    className="w-full px-4 py-3 bg-slate-900/90 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-600 font-mono"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 px-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  <span>كلمة المرور (Password)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className="w-full pr-4 pl-11 py-3 bg-slate-900/90 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 cursor-pointer"
                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Session Option */}
              <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-white/10 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>تذكر بيانات الجلسة</span>
                </label>

                <span className="text-[11px] text-slate-500 font-mono">
                  🔒 اتصال مشفر TLS
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>جارٍ التحقق والاعتماد...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>تسجيل الدخول الآمن للمنصة</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ────────────────────────────────────────────────────────────
              FOOTER: LEGAL LINKS + CREATED BY GREEN ARROW BRANDING
             ──────────────────────────────────────────────────────────── */}
          <div className="space-y-3 pt-6 border-t border-white/10 mt-6">
            {/* Legal / Policy Links */}
            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400">
              <Link to="/privacy" className="hover:text-emerald-400 transition-colors underline">
                سياسة الخصوصية
              </Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-emerald-400 transition-colors underline">
                شروط الاستخدام
              </Link>
              <span>•</span>
              <Link to="/data-deletion" className="hover:text-rose-400 transition-colors underline">
                حذف البيانات
              </Link>
            </div>

            {/* Official Green Arrow Creator Signature */}
            <div className="flex items-center justify-center gap-2.5 pt-2 border-t border-white/5">
              <img 
                src={greenArrowLogo} 
                alt="Green Arrow" 
                className="h-7 w-auto object-contain rounded-md shadow-xs opacity-90 hover:opacity-100 transition-opacity" 
              />
              <div className="text-right">
                <div className="text-[11px] font-bold text-slate-300">
                  تم الإنشاء بواسطة <span className="text-emerald-400 font-black">GREEN ARROW</span>
                </div>
                <div className="text-[9px] text-slate-500 font-mono">
                  Performance Ads & Growth Solutions
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
