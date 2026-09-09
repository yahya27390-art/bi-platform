import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useBIAuth } from '@/auth/BIAuthContext';
import {
  LayoutDashboard, TrendingUp, ShoppingCart, MapPin, Package,
  DollarSign, Target, Upload, Building2, Sparkles, X, Crown, Lock
} from 'lucide-react';
import doraLogo from '@/assets/dora_logo.png';

const NAV_ITEMS = [
  { label: 'نظرة عامة', icon: LayoutDashboard, path: '/', exact: true },
  { 
    label: 'خزنة المالك التنفيذية (C-Suite)', 
    icon: Crown, 
    path: '/owner', 
    isOwnerVault: true 
  },
  { label: 'الحملات الإعلانية', icon: TrendingUp, path: '/media' },
  { 
    label: 'مختبر الحملات والذكاء الاصطناعي', 
    icon: Sparkles, 
    path: '/campaign-lab', 
    privateOnly: true,
    highlight: true,
  },
  { label: 'المتجر الإلكتروني', icon: ShoppingCart, path: '/ecommerce' },
  { label: 'الفروع الميدانية', icon: MapPin, path: '/branches' },
  { label: 'المنتجات', icon: Package, path: '/products' },
  { label: 'المالية', icon: DollarSign, path: '/financials' },
  { label: 'الأهداف', icon: Target, path: '/targets' },
  { label: 'استيراد البيانات', icon: Upload, path: '/import' },
];

export default function BISidebar({ mobileOpen, onCloseMobile }) {
  const location = useLocation();
  const { permissions, user } = useBIAuth();

  // OWNER gets a dedicated full-screen mobile dashboard – no sidebar needed
  if (user?.role === 'OWNER' || location.pathname === '/owner') return null;

  const isItemVisible = (item) => {
    // 1. The AI Agent (/campaign-lab): EXCLUSIVE TO ADMIN (يحيي محمد باشا), strictly hidden from OWNER
    if (item.path === '/campaign-lab' || item.privateOnly) {
      return user?.role === 'ADMIN' && !!permissions?.canViewPrivateCampaignLab;
    }
    // 2. Owner Executive Vault: Visible to ADMIN only (owner bypasses sidebar entirely)
    if (item.isOwnerVault) {
      return user?.role === 'ADMIN';
    }
    return true;
  };

  const visibleNavItems = NAV_ITEMS.filter(isItemVisible);

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full items-center py-4">
      {/* Brand Icon: Official Dora Logo (No frames, no backgrounds) */}
      <Link
        to="/"
        className="w-12 h-12 flex items-center justify-center shrink-0 hover:scale-110 transition-transform mb-4"
        title="درة للسيارات — BI Platform"
      >
        <img
          src={doraLogo}
          alt="درة السيارة"
          className="w-11 h-11 object-contain drop-shadow-md"
        />
      </Link>

      <div className="w-8 h-px bg-slate-800/80 mb-3" />

      {/* Icons-Only Nav Items */}
      <nav className="flex-1 w-full flex flex-col items-center space-y-2 overflow-y-auto px-2">
        {visibleNavItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={cn(
                'w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 group relative',
                active
                  ? item.isOwnerVault
                    ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 shadow-lg shadow-amber-500/35 ring-2 ring-amber-400/40 font-bold'
                    : 'bg-blue-600 text-white shadow-lg shadow-blue-600/35 ring-2 ring-blue-400/30 font-bold'
                  : item.isOwnerVault
                  ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 shadow-xs'
                  : item.highlight
                  ? 'text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              )}
            >
              {/* Active inner edge bar indicator */}
              {active && (
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full ${item.isOwnerVault ? 'bg-amber-400 shadow-sm' : 'bg-blue-500 shadow-sm'}`} />
              )}

              <item.icon
                className={cn(
                  'w-5 h-5 transition-transform duration-200 group-hover:scale-110',
                  active
                    ? item.isOwnerVault ? 'text-slate-950' : 'text-white'
                    : item.isOwnerVault
                    ? 'text-amber-400'
                    : item.highlight
                    ? 'text-cyan-400'
                    : 'text-slate-400 group-hover:text-white'
                )}
              />

              {/* Floating Tooltip */}
              <div className="absolute right-full mr-3.5 px-3 py-1.5 bg-[#0F172A] text-white text-xs font-bold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-2xl border border-slate-700/90 z-50">
                {item.label}
                {item.isOwnerVault && (
                  <span className="text-[10px] text-amber-300 mr-1 font-mono">(PIN)</span>
                )}
                {item.highlight && (
                  <span className="text-[10px] text-purple-300 mr-1 font-normal">(AI)</span>
                )}
                {/* Pointer arrow */}
                <span className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 border-4 border-transparent border-l-[#0F172A]" />
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar: Permanent Icons-Only Rail (72px) */}
      <aside
        className={cn(
          'hidden lg:flex fixed top-0 right-0 h-screen w-[72px] flex-col items-center',
          'bg-[#0B1528] border-l border-slate-800/90 z-30 shadow-2xl'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer: Pure Icons-Only Rail with Backdrop */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 right-0 h-screen w-[76px] flex flex-col items-center',
          'bg-[#0B1528] border-l border-slate-800/90 z-50 shadow-2xl',
          'transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="py-3">
          <button
            onClick={onCloseMobile}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10"
            title="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 w-full">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}
