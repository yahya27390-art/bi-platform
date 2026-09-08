import { useState } from 'react';
import { Menu, ChevronDown, RefreshCw, Bell, User, LogOut, ShieldCheck } from 'lucide-react';
import { useBIAuth } from '@/auth/BIAuthContext';
import { usePeriods } from '../../hooks/useBIData';
import { useCurrentPeriod } from '../../context/BIPeriodContext';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import doraLogo from '@/assets/dora_logo.png';

export default function BITopBar({ onOpenMobileSidebar, periodId: propPeriodId, onPeriodChange }) {
  const { user, roleLabel, logout } = useBIAuth();
  const { periodId: globalPeriodId, setPeriodId: setGlobalPeriodId } = useCurrentPeriod();
  const effectivePeriodId = propPeriodId || globalPeriodId;
  const { data: periods } = usePeriods();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const currentPeriod = periods?.find(p => p.id === effectivePeriodId) || periods?.find(p => p.id === 'p-2026-08') || periods?.[0];

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <button
          className="lg:hidden text-slate-600 hover:text-[#0F172A]"
          onClick={onOpenMobileSidebar}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Logo & Name (No frame, pure transparent logo) */}
        <div className="flex items-center gap-2">
          <img
            src={doraLogo}
            alt="درة السيارة"
            className="h-8 sm:h-9 w-auto object-contain drop-shadow-xs"
          />
          <span className="text-sm font-black text-[#0F172A] tracking-tight hidden sm:inline font-sans">
            درة السيارة
          </span>
        </div>
      </div>

      {/* Period Selector */}
      {periods?.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sm font-bold text-[#0F172A] transition-all shadow-xs"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {currentPeriod?.label || 'اختر الفترة'}
            <ChevronDown className={cn('w-4 h-4 text-slate-500 transition-transform', open && 'rotate-180')} />
          </button>

          {open && (
            <div className="absolute top-full mt-2 right-0 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 p-1">
              {periods.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    if (onPeriodChange) onPeriodChange(p.id);
                    else setGlobalPeriodId(p.id);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full text-right px-4 py-2.5 text-sm rounded-xl transition-all',
                    p.id === currentPeriod?.id
                      ? 'bg-blue-50 text-blue-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{p.label}</span>
                    <div className="flex items-center gap-1">
                      {p.isCurrent && <span className="text-[10px] text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded font-bold">الحالي</span>}
                      {p.isClosed && <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">مغلق</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1" />

      {/* Live Badge */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
        <RefreshCw className="w-3 h-3 text-emerald-600" />
        بيانات مدققة ومطابقة Z-Report
      </div>

      {/* User & Role Switcher */}
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen(u => !u)}
          className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition-all text-right"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0F172A] to-blue-900 flex items-center justify-center text-xs font-black text-white shadow">
            {user?.name?.[0] || 'م'}
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-bold text-[#0F172A]">{user?.name || 'المالك'}</div>
            <div className="text-[10px] text-slate-500 font-semibold">{roleLabel}</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </button>

        {userMenuOpen && (
          <div className="absolute top-full mt-2 left-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 space-y-3 z-50 text-right">
            <div className="px-2 pt-1 border-b border-slate-100 pb-2">
              <div className="text-sm font-bold text-[#0F172A]">{user?.name}</div>
              <div className="text-xs text-slate-500">{user?.email}</div>
              <div className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full mt-1.5 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> {roleLabel} (جلسة معتمدة)
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-all font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج الآمن</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
