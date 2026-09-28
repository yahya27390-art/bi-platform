import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useBIAuth } from './BIAuthContext';
import { 
  Lock, 
  User, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ChevronRight,
  ChevronLeft,
  Boxes,
  Scale,
  ClipboardList,
  Crown,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import doraLogo from '../assets/dora_logo.png';
import greenArrowLogo from '../assets/green-arrow-logo.png';

// System Showcase Slides Configuration (محتوى النظام في سلايدات تفاعلية)
const SYSTEM_SLIDES = [
  {
    id: 'inventory',
    tag: 'مخزون الفروع الثلاثة',
    title: 'إدارة ومطابقة المخزون الذكي',
    highlight: '8,901 صنف مسعر ومطابق لحظياً',
    description: 'تغطية حية للمركز الرئيسي (100) وفرع الرواف (200) وفرع السليم 2 / كيا (300)، مع حصر السيولة المجمدة وتنبيهات نفاد المخزون ومطابقة Z-Report بدقة 100%.',
    icon: Boxes,
    chips: [
      { text: '🔒 مطابقة محاسبية دقيقة', color: 'bg-white/15 text-white border-white/20' },
      { text: '⚡ جرد حي لـ 8,901 صنف', color: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30' },
      { text: '📈 تقارير حركة المخزون', color: 'bg-cyan-400/20 text-cyan-200 border-cyan-400/30' }
    ],
    stats: [
      { label: 'الأصناف المسعرة', value: '8,901' },
      { label: 'الفروع المتصلة', value: '3 فروع' },
      { label: 'نسبة التطابق', value: '100%' },
    ]
  },
  {
    id: 'comparator',
    tag: 'ذكاء المشتريات والوفر',
    title: 'محرك مقارنة أسعار الموردين',
    highlight: 'كشف صفقات الوفر وحماية الهوامش',
    description: 'فحص آلي فوري لكشوفات وعروض أسعار الموردين (أرقام الديزل، فحمات بدر الوادي، مسك)، مع احتساب الوفر المالي لكل قطعة وتنبيه الإدارة من الأسعار المرتفعة.',
    icon: Scale,
    chips: [
      { text: '🟢 كشف وفر مالي مباشر', color: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30' },
      { text: '⚠️ تحذير من الأسعار المرتفعة', color: 'bg-rose-400/20 text-rose-200 border-rose-400/30' },
      { text: '📄 تقارير A4 معتمدة وتصدير إكسل', color: 'bg-white/15 text-white border-white/20' }
    ],
    stats: [
      { label: 'وفر الشراء المتاح', value: 'مباشر' },
      { label: 'أرقام الديزل', value: '109 صنف' },
      { label: 'تصدير التقارير', value: 'A4 / Excel' },
    ]
  },
  {
    id: 'shortages',
    tag: 'نواقص الفروع والطلبات',
    title: 'سحابة نواقص الفروع المؤتمتة',
    highlight: 'من نوتة الفرع إلى أمر التوريد بنقرة واحدة',
    description: 'تسجيل سحابي آمن لنواقص قطع الغيار وطلبات العملاء من كاونتر الفروع، مع مسار اعتماد حصري لمدير المشتريات وتتبع دورة الطلب (معتمد • تم الطلب • تم الاستلام).',
    icon: ClipboardList,
    chips: [
      { text: '🚀 ربط فوري بين الفروع والمشتريات', color: 'bg-cyan-400/20 text-cyan-200 border-cyan-400/30' },
      { text: '✓ اعتماد إلكتروني معتمد', color: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30' },
      { text: '📦 إغلاق دورة الاستلام', color: 'bg-white/15 text-white border-white/20' }
    ],
    stats: [
      { label: 'سرعة التحويل', value: 'فوري' },
      { label: 'الاعتماد', value: 'سحابي' },
      { label: 'دورة الطلب', value: 'مكتملة' },
    ]
  },
  {
    id: 'owner',
    tag: 'الخزنة التنفيذية C-Suite',
    title: 'لوحة قيادة المالك والذكاء المالي',
    highlight: 'رؤية شاملة للسيولة، الأرباح، وهوامش البيع',
    description: 'منظومة قيادة عليا مشفرة للإدارة والمالك، تتابع هوامش الربح، أداء الفروع الميدانية، ومبيعات المتجر الإلكتروني مع مؤشرات مالية حية ومطابقة ضريبية 15%.',
    icon: Crown,
    chips: [
      { text: '💎 خزنة مالية مشفرة', color: 'bg-purple-400/20 text-purple-200 border-purple-400/30' },
      { text: '📊 ربحية الفروع والمتجر', color: 'bg-cyan-400/20 text-cyan-200 border-cyan-400/30' },
      { text: '💰 تدقيق محاسبي Z-Report', color: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30' }
    ],
    stats: [
      { label: 'حماية البيانات', value: 'مشفرة' },
      { label: 'المؤشرات المالية', value: 'حية 24/7' },
      { label: 'مطابقة الضريبة', value: '15% معتمد' },
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
        return 'تم إنهاء الجلسة تلقائياً لعدم وجود حركة لمدة 5 دقائق حفاظاً على سرية البيانات. يرجى تسجيل الدخول مجدداً.';
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

  const currentSlide = SYSTEM_SLIDES[activeSlide];
  const SlideIcon = currentSlide.icon;

  return (
    <div 
      className="min-h-screen bg-[#EEF2F6] flex items-center justify-center p-3 sm:p-6 md:p-10 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden" 
      dir="rtl"
    >
      {/* Soft Ambient Background Highlights */}
      <div className="absolute top-0 right-1/4 w-[36rem] h-[36rem] bg-blue-300/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[36rem] h-[36rem] bg-cyan-300/20 rounded-full blur-[140px] pointer-events-none" />

      {/* ════════════════════════════════════════════════════════════════
          MASTER CARD CONTAINER (VIBRANT OCEANIC BLUE + CLEAN WHITE)
         ════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl w-full bg-white rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_70px_-10px_rgba(15,23,42,0.18)] border border-slate-200/80 overflow-hidden relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
        
        {/* ────────────────────────────────────────────────────────────
            الجزء الأيمن: ألوان التدرج الأزرق الملكي والفخم مع سلايدات النظام
           ──────────────────────────────────────────────────────────── */}
        <div 
          className="lg:col-span-7 bg-gradient-to-br from-[#0c224a] via-[#113b82] to-[#1c5fca] text-white p-7 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Wave / Mountain Abstract Light Overlay (مطابق للشكل المطلوب) */}
          <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay">
            <svg viewBox="0 0 800 600" className="w-full h-full object-cover">
              <path d="M0,350 C150,220 300,420 500,280 C650,180 750,240 800,200 L800,600 L0,600 Z" fill="rgba(255,255,255,0.15)" />
              <path d="M0,420 C200,320 350,480 550,360 C700,280 780,330 800,310 L800,600 L0,600 Z" fill="rgba(255,255,255,0.1)" />
            </svg>
          </div>

          {/* Top Brand Pill & System Badge */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>منصة ذكاء الأعمال والتحليلات • درة السيارة</span>
              </div>

              <div className="px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/30 text-xs font-black">
                {currentSlide.tag}
              </div>
            </div>

            {/* Slide Title & Dynamic Text */}
            <div className="pt-3 space-y-2">
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-wide leading-tight drop-shadow-sm">
                {currentSlide.title}
              </h2>
              <p className="text-base sm:text-lg font-bold text-cyan-200/95">
                {currentSlide.highlight}
              </p>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl opacity-90 pt-1">
                {currentSlide.description}
              </p>
            </div>
          </div>

          {/* Middle Floating Glassmorphic Cards (مطابق لتصميم الصورة) */}
          <div className="relative z-10 py-6 sm:py-8 space-y-3.5">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-inner">
                    <SlideIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">منظومة ذكاء الأعمال المعتمدة</div>
                    <div className="text-[10px] text-cyan-200/80 font-mono">Dora Cars Enterprise Intelligence</div>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>اتصال سحابي نشط</span>
                </span>
              </div>

              {/* Floating Feature Badges */}
              <div className="flex flex-wrap gap-2">
                {currentSlide.chips.map((chip, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border backdrop-blur-md shadow-xs transition-all duration-300 ${chip.color}`}
                  >
                    {chip.text}
                  </div>
                ))}
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 font-mono text-center">
                {currentSlide.stats.map((st, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md">
                    <div className="text-[10px] text-slate-200 font-sans">{st.label}</div>
                    <div className="font-black text-xs sm:text-sm text-white mt-0.5">{st.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Slide Controller (Dots & Arrows) */}
          <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/15">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {SYSTEM_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeSlide === idx 
                      ? 'w-9 bg-white shadow-md' 
                      : 'w-2.5 bg-white/30 hover:bg-white/50'
                  }`}
                  title={s.tag}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevSlide}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                title="السابق"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                title="التالي"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────
            الجزء الأيسر: تصميم أبيض نقي وفخم مع حقول تسجيل الدخول (CLEAN WHITE)
           ──────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-5 bg-white p-7 sm:p-10 lg:p-12 flex flex-col justify-between relative z-10">
          
          <div className="space-y-6">
            {/* Top Official Dora Logo & Header */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-sm relative group">
                  <img 
                    src={doraLogo} 
                    alt="درة السيارة" 
                    className="h-16 sm:h-20 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300" 
                  />
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  تسجيل الدخول
                </h1>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  منظومة ذكاء الأعمال والتحليلات الرسمية
                </p>
              </div>
            </div>

            {/* Inactivity Security Notice */}
            {securityNotice && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>{securityNotice}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span className="font-bold">{error}</span>
                </div>
              )}

              {/* Username Input Card (Modern Floating Style) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 px-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>اسم المستخدم أو البريد الإلكتروني</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@mail.com أو اسم المستخدم"
                    className="w-full px-4 py-3.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 rounded-2xl text-slate-900 text-sm font-medium transition-all outline-none placeholder:text-slate-400 shadow-2xs"
                  />
                </div>
              </div>

              {/* Password Input Card */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 px-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <span>كلمة المرور (Password)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pr-4 pl-11 py-3.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 rounded-2xl text-slate-900 text-sm font-medium transition-all outline-none placeholder:text-slate-400 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Option */}
              <div className="flex items-center justify-between text-xs px-1 text-slate-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-900 transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 bg-white border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="font-bold">تذكر بيانات الجلسة</span>
                </label>

                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>اتصال مشفر آمن</span>
                </span>
              </div>

              {/* Vibrant Sky/Royal Blue Gradient Login Button (مطابق لزر الصورة) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#2563eb] to-[#1d4ed8] hover:from-[#0369a1] hover:to-[#1e40af] text-white font-black text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-3 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جارٍ التحقق والاعتماد...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-white" />
                    <span>تسجيل الدخول للمنصة</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ────────────────────────────────────────────────────────────
              تذييل الصفحة: روابط السياسات + شعار GREEN ARROW الفاخر
             ──────────────────────────────────────────────────────────── */}
          <div className="space-y-3.5 pt-6 border-t border-slate-100 mt-6">
            {/* Legal / Policy Links */}
            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500">
              <Link to="/privacy" className="hover:text-blue-600 transition-colors underline font-medium">
                سياسة الخصوصية
              </Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-blue-600 transition-colors underline font-medium">
                شروط الاستخدام
              </Link>
              <span>•</span>
              <Link to="/data-deletion" className="hover:text-rose-600 transition-colors underline font-medium">
                حذف البيانات
              </Link>
            </div>

            {/* Official Green Arrow Signature */}
            <div className="flex items-center justify-center gap-2.5 pt-2 border-t border-slate-100">
              <img 
                src={greenArrowLogo} 
                alt="Green Arrow" 
                className="h-8 w-auto object-contain rounded-lg shadow-xs" 
              />
              <div className="text-right">
                <div className="text-xs font-bold text-slate-800">
                  تم الإنشاء بواسطة <span className="text-[#059669] font-black">GREEN ARROW</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
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
