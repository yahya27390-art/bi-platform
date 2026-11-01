import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBIAuth } from '../auth/BIAuthContext';
import { getUserAvailableSystems } from '../lib/systemsRegistry';
import { getUserAssignedBranch, getUserBranchStaffTitle } from '../lib/customerOrdersStore';
import {
  Building2,
  LogOut,
  ChevronLeft,
  ShieldCheck,
  Compass
} from 'lucide-react';
import doraLogo from '../assets/dora_logo.png';
import {
  AntigravityCanvas,
  SpotlightCard,
  ShinyText,
  MagnetButton
} from '../components/animations';

export default function SystemsPortal() {
  const { user, logout } = useBIAuth();
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const availableSystems = getUserAvailableSystems(user);
  const assignedBranch = getUserAssignedBranch(user);
  const staffTitle = getUserBranchStaffTitle(user);

  const handleLaunchSystem = (path) => {
    navigate(path);
  };

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden p-4 sm:p-6 md:p-10"
      dir="rtl"
    >
      {/* 🪐 Antigravity Interactive Canvas Background */}
      <AntigravityCanvas
        particleCount={32}
        speedFactor={0.5}
        gravity={-0.03}
        colors={['#2563EB', '#38BDF8', '#10B981', '#F59E0B', '#6366F1', '#CBD5E1']}
        shape="mixed"
        interactionRadius={160}
        className="opacity-70"
      />

      {/* Soft Ambient Colorful Glows */}
      <div className="absolute top-0 right-1/4 w-[36rem] h-[36rem] bg-blue-100/50 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[36rem] h-[36rem] bg-emerald-100/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-cyan-100/30 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* ── Top Header Bar (Animista entrance) ── */}
        <header className="animate-scale-up-top bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 p-2 border border-slate-200 flex items-center justify-center shadow-xs transition-transform duration-300 hover:scale-105">
              <img src={doraLogo} alt="درة السيارة" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  بوابة أنظمة شركة درة السيارة
                </h1>
                <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 animate-pulsate-bck">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>متصل الآن</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                منظومة ذكاء الأعمال والعمليات التشغيلية المركزية
              </p>
            </div>
          </div>

          {/* User Profile & Logout with Magnet Button */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl flex items-center gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                {user?.name?.[0] || 'م'}
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{user?.name}</span>
                </div>
                <div className="text-[11px] text-blue-700 font-bold flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-blue-600" />
                  <span>{assignedBranch || staffTitle || 'الإدارة العامة'}</span>
                </div>
              </div>
            </div>

            <MagnetButton
              onClick={() => logout()}
              magnetStrength={0.3}
              className="p-2.5 rounded-2xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-500 hover:text-rose-600 transition-all cursor-pointer shadow-xs"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </MagnetButton>
          </div>
        </header>

        {/* ── Welcome Banner ── */}
        <div className="text-center space-y-2.5 py-3 animate-fade-in-fwd">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>اختر نظام العمل المطلوب لبدء جلستك</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            مرحباً بك يا {user?.name?.split(' ')?.[0] || 'زميلنا'}،{' '}
            <ShinyText text="أين تود البدء اليوم؟" speed={3.5} shimmerColor="#3B82F6" className="text-blue-700 font-black" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            تم تخصيص الأنظمة التالية وفقاً لصلاحيات حسابك المعتمدة. يمكنك التنقل بين الأنظمة في أي وقت من خلال زر «بوابة الأنظمة» في الشريط العلوي.
          </p>
        </div>

        {/* ── Systems Grid (Enhanced with SpotlightCard & Animista) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {availableSystems.map((sys, idx) => {
            const Icon = sys.icon;
            const isHovered = hoveredCard === sys.id;

            return (
              <SpotlightCard
                key={sys.id}
                spotlightColor="rgba(37, 99, 235, 0.12)"
                borderColor="rgba(37, 99, 235, 0.4)"
                onMouseEnter={() => setHoveredCard(sys.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleLaunchSystem(sys.path)}
                className="cursor-pointer group flex flex-col justify-between space-y-5 rounded-3xl border border-slate-200/90 hover:border-blue-400 p-6 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 animate-slide-in-bottom"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="space-y-4">
                  {/* Card Top: Icon & Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${sys.accentGradient} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${sys.badgeClass}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${sys.dotClass}`} />
                      <span>{sys.tag}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {sys.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-normal">
                      {sys.description}
                    </p>
                  </div>

                  {/* Feature chips */}
                  {sys.features && sys.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sys.features.map((feat, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-bold bg-slate-100/80 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors group-hover:bg-blue-50/70 group-hover:text-blue-700 group-hover:border-blue-200"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Button with Micro-interaction */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-blue-600 group-hover:text-blue-700 transition-colors flex items-center gap-1">
                    <span>دخول النظام الآن</span>
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-xs group-hover:-translate-x-1">
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>

        {/* ── Footer Information ── */}
        <div className="text-center pt-8 border-t border-slate-200/80 space-y-2 animate-fade-in-fwd">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>نظام محمي ومشفر بالكامل • شركة درة السيارة لقطع غيار السيارات الكورية</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Dorat Cars Unified Operations • Session Secured
          </p>
        </div>
      </div>
    </div>
  );
}
