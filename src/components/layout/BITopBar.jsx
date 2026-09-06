import { useState } from 'react';
import { Menu, ChevronDown, RefreshCw, Bell, User, LogOut, ShieldCheck } from 'lucide-react';
import { useBIAuth } from '@/auth/BIAuthContext';
import { usePeriods } from '../../hooks/useBIData';
import { useCurrentPeriod } from '../../context/BIPeriodContext';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function BITopBar({ onOpenMobileSidebar, periodId: propPeriodId, onPeriodChange }) {
  const { user, roleLabel, demoUsers, loginAs, logout } = useBIAuth();
  const { periodId: globalPeriodId, setPeriodId: setGlobalPeriodId } = useCurrentPeriod();
  const effectivePeriodId = propPeriodId || globalPeriodId;
  const { data: periods } = usePeriods();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const currentPeriod = periods?.find(p => p.id === effectivePeriodId) || periods?.find(p => p.id === 'p-2026-08') || periods?.[0];

  return (
    <header className="sticky top-0 z-20 bg-[#0A1628]/90 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
      {/* Mobile menu */}
      <button
        className="lg:hidden text-slate-400 hover:text-white"
        onClick={onOpenMobileSidebar}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Period Selector */}
      {periods?.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white transition-all"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {currentPeriod?.label || 'اختر الفترة'}
            <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', open && 'rotate-180')} />
          </button>

          {open && (
            <div className="absolute top-full mt-2 right-0 w-52 bg-[#0d1f35] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
              {periods.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    if (onPeriodChange) onPeriodChange(p.id);
                    else setGlobalPeriodId(p.id);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full text-right px-4 py-2.5 text-sm transition-all',
                    p.id === currentPeriod?.id
                      ? 'bg-emerald-500/15 text-emerald-400 font-bold'
                      : 'text-slate-300 hover:bg-white/5'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{p.label}</span>
                    <div className="flex items-center gap-1">
                      {p.isCurrent && <span className="text-[10px] text-emerald-400 font-bold">الحالي</span>}
                      {p.isClosed && <span className="text-[10px] text-slate-500">مغلق</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1" />

      {/* Data Source badge */}
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
        <RefreshCw className="w-3 h-3" />
        بيانات حية ومحاكاة
      </div>

      {/* User & Role Switcher */}
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen(u => !u)}
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 border border-white/5 transition-all text-right"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-xs font-black text-white shadow-lg">
            {user?.name?.[0] || 'م'}
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-bold text-white">{user?.name || 'المالك'}</div>
            <div className="text-[10px] text-emerald-400 font-medium">{roleLabel}</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {userMenuOpen && (
          <div className="absolute top-full mt-2 left-0 w-64 bg-[#0d1f35] border border-white/10 rounded-2xl shadow-2xl p-3 space-y-3 z-50">
            <div className="px-2 pt-1 border-b border-white/10 pb-2">
              <div className="text-sm font-bold text-white">{user?.name}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
              <div className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded-full mt-1.5 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" /> {roleLabel}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-bold px-2 mb-1.5">تبديل الحساب / الصلاحية:</div>
              {demoUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => { loginAs(u.id); setUserMenuOpen(false); }}
                  className={cn(
                    'w-full text-right px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all',
                    u.id === user?.id
                      ? 'bg-emerald-500/15 text-emerald-300 font-bold'
                      : 'text-slate-300 hover:bg-white/5'
                  )}
                >
                  <span>{u.name}</span>
                  <span className="text-[10px] text-slate-400">({u.role === 'owner' ? 'مالك' : u.role === 'admin' ? 'مدير' : 'محلل'})</span>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="w-full text-right px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
