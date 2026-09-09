import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useBIAuth, AUTH_ACCOUNTS } from './BIAuthContext';
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
  Info, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function BILogin() {
  const { loginWithCredentials } = useBIAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCredentialsHelper, setShowCredentialsHelper] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await loginWithCredentials(identifier, password);
      let destination = location.state?.from?.pathname;
      if (!destination || destination === '/') {
        destination = loggedUser?.role === 'OWNER' ? '/owner' : '/';
      }
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (username, pass) => {
    setIdentifier(username);
    setPassword(pass);
    setError('');
  };

  return (
    <div 
      className="min-h-screen bg-[#070F1E] flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-white relative overflow-hidden font-sans" 
      dir="rtl"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full bg-[#0D1E36]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10 backdrop-blur-2xl">
        
        {/* Shield & Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 shadow-xl shadow-emerald-500/10 relative">
            <ShieldCheck className="w-9 h-9" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0D1E36] animate-ping" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0D1E36]" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-white tracking-wide">
              منصة ذكاء الأعمال والتحليلات
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Dora Cars • Executive BI & Analytics Platform
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>بوابة الدخول المشفرة والمحمية</span>
          </div>
        </div>

        {/* Security Inactivity Notice */}
        {securityNotice && (
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed animate-fadeIn">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-amber-300">أمان الجلسات (Auto-Logout)</div>
              <div className="text-amber-200/90">{securityNotice}</div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs leading-relaxed animate-shake">
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
                placeholder="admin أو البريد الإلكتروني"
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
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
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

        {/* Credentials Helper Toggle */}
        <div className="pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setShowCredentialsHelper(!showCredentialsHelper)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all text-right text-xs text-slate-400 hover:text-white"
          >
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>بيانات الدخول المصرح بها للإدارة</span>
            </span>
            <span className="text-[11px] text-cyan-400 underline">
              {showCredentialsHelper ? 'إخفاء' : 'عرض الحسابات'}
            </span>
          </button>

          {showCredentialsHelper && (
            <div className="mt-3 p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/20 space-y-2.5 text-xs animate-fadeIn">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                انقر على أي حساب لتعبئة بياناته تلقائياً أو استخدم كلمة المرور العامة: <code className="bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">dora2026</code>
              </p>
              <div className="space-y-1.5">
                {AUTH_ACCOUNTS.slice(0, 3).map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => fillCredentials(acc.username, acc.password)}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-emerald-500/15 border border-white/5 hover:border-emerald-500/30 transition-all text-right group"
                  >
                    <div>
                      <div className="font-bold text-white text-xs group-hover:text-emerald-300">
                        {acc.name} ({acc.username})
                      </div>
                      <div className="text-[10px] text-slate-400">{acc.title}</div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      تعبئة
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Security Notice & Compliance Links */}
        <div className="text-center space-y-2 pt-2 border-t border-white/5">
          <div className="text-[11px] text-slate-500">
            🔒 منصة إدارية رسمية لشركة درة السيارة لقطع غيار السيارات
          </div>
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
        </div>
      </div>
    </div>
  );
}
