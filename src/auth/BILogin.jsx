import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBIAuth } from './BIAuthContext';
import { getBIRoleMeta } from '../lib/biPermissions';
import { ShieldCheck, ArrowLeft, BarChart3, Lock, Mail, AlertCircle, Database } from 'lucide-react';

export default function BILogin() {
  const { loginAs, loginWithSupabase, demoUsers, isSupabaseConfigured } = useBIAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickLogin = (user) => {
    loginAs(user.id);
    navigate('/');
  };

  const handleSupabaseSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginWithSupabase(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'فشل تسجيل الدخول. يرجى التحقق من البريد وكلمة المرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070F1E] flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-white relative overflow-hidden" dir="rtl">
      {/* Ambient glowing radial gradients */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full bg-[#0D1E36] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10 backdrop-blur-xl">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">منصة ذكاء الأعمال والتحليلات (BI)</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">Dora Cars • Performance & Media Buying Intelligence</p>
          </div>
          
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Supabase Auth + RLS Protection</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-semibold">
              <Database className="w-3.5 h-3.5" />
              <span>22 جداول معزولة تماماً</span>
            </span>
          </div>
        </div>

        {/* Supabase Production Login Form */}
        <form onSubmit={handleSupabaseSubmit} className="space-y-3 pt-2">
          <div className="text-xs text-slate-300 font-bold px-1">تسجيل الدخول عبر حساب Supabase:</div>
          
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني (مثال: owner@doratcars.com)"
                className="w-full pr-10 pl-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور"
                className="w-full pr-10 pl-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {loading ? 'جارٍ التحقق...' : 'تسجيل الدخول (Supabase Sign-In)'}
          </button>
        </form>

        {/* Quick Demo Access Roles (Section 4 directive) */}
        <div className="space-y-2.5 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-300 font-bold">أو الدخول السريع لاختبار أدوار الـ RBAC الـ 5:</span>
            <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              اختبار الأدوار
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {demoUsers.map(u => {
              const meta = getBIRoleMeta(u.role);
              return (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-emerald-500/15 border border-white/5 hover:border-emerald-500/30 transition-all text-right group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 group-hover:bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs transition-colors shrink-0">
                      {u.avatar}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {u.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{meta.label}</div>
                    </div>
                  </div>
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:-translate-x-1 transition-all shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-500 font-mono pt-2 border-t border-white/5">
          درة السيارة © 2026 • Standalone Executive Business Intelligence Platform
        </div>
      </div>
    </div>
  );
}
