import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useBIAuth } from '@/auth/BIAuthContext';
import {
  LayoutDashboard, TrendingUp, ShoppingCart, MapPin, Package,
  DollarSign, Target, Upload, ChevronRight, ChevronLeft,
  BarChart3, X, Building2, Sparkles, Lock, MessageSquare
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'نظرة عامة', icon: LayoutDashboard, path: '/', exact: true },
  { label: 'الإعلانات', icon: BarChart3, path: '/media' },
  { label: 'الحملات', icon: TrendingUp, path: '/campaigns' },
  { 
    label: 'مختبر الحملات والذكاء الاصطناعي', 
    shortLabel: 'مختبر الحملات (AI)', 
    icon: Sparkles, 
    path: '/campaign-lab', 
    privateOnly: true,
    highlight: true,
  },
  { 
    label: 'إيجنت الرد والمحادثات (Meta & TikTok)', 
    shortLabel: 'إيجنت الردود (Social)', 
    icon: MessageSquare, 
    path: '/social-responder', 
    privateOnly: true,
    highlight: true,
  },
  { label: 'المتجر الإلكتروني', icon: ShoppingCart, path: '/ecommerce' },
  { label: 'الفروع', icon: MapPin, path: '/branches' },
  { label: 'المنتجات', icon: Package, path: '/products' },
  { label: 'المالية', icon: DollarSign, path: '/financials' },
  { label: 'الأهداف', icon: Target, path: '/targets' },
  { label: 'استيراد البيانات', icon: Upload, path: '/import' },
];

export default function BISidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const location = useLocation();
  const { permissions, user } = useBIAuth();

  const isItemVisible = (item) => {
    if (item.privateOnly) {
      return !!permissions?.canViewPrivateCampaignLab && user?.role !== 'OWNER';
    }
    return true;
  };

  const visibleNavItems = NAV_ITEMS.filter(isItemVisible);

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-slate-800/80',
        collapsed && 'justify-center px-2'
      )}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/40">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-black text-white tracking-wide">درة للسيارات</div>
            <div className="text-[10px] text-blue-300 font-semibold tracking-wider uppercase">Dora Cars BI Platform</div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {visibleNavItems.map(item => {
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl transition-all duration-200 group relative',
                collapsed ? 'justify-center p-3' : 'px-3.5 py-2.5',
                active
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                  : item.highlight
                  ? 'text-cyan-300 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-purple-500/20 border border-cyan-500/20 font-bold'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
              )}
            >
              {active && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-l-full" />
              )}
              <item.icon className={cn('shrink-0 transition-all', collapsed ? 'w-5 h-5' : 'w-4 h-4', active ? 'text-white' : item.highlight ? 'text-cyan-400' : 'text-slate-400 group-hover:text-white')} />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="text-sm truncate">{item.label}</span>
                  {item.highlight && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/25 text-purple-300 border border-purple-500/30 font-mono font-bold shrink-0 mr-1.5">
                      AI خاص
                    </span>
                  )}
                </div>
              )}
              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute right-full mr-3 px-2.5 py-1.5 bg-[#0F172A] text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl border border-slate-700 z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          {collapsed
            ? <ChevronLeft className="w-4 h-4" />
            : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex fixed top-0 right-0 h-screen flex-col',
          'bg-[#0B1528] border-l border-slate-800/90 z-30 shadow-2xl',
          'transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 right-0 h-screen w-[260px] flex flex-col',
          'bg-[#0B1528] border-l border-slate-800/90 z-50 shadow-2xl',
          'transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/80">
          <div className="text-sm font-black text-white">درة للسيارات — BI</div>
          <button onClick={onCloseMobile} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}
