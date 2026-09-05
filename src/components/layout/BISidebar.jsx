import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, TrendingUp, ShoppingCart, MapPin, Package,
  DollarSign, Target, Upload, ChevronRight, ChevronLeft,
  BarChart3, X, Building2
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'نظرة عامة', icon: LayoutDashboard, path: '/', exact: true },
  { label: 'الإعلانات', icon: BarChart3, path: '/media' },
  { label: 'الحملات', icon: TrendingUp, path: '/campaigns' },
  { label: 'المتجر الإلكتروني', icon: ShoppingCart, path: '/ecommerce' },
  { label: 'الفروع', icon: MapPin, path: '/branches' },
  { label: 'المنتجات', icon: Package, path: '/products' },
  { label: 'المالية', icon: DollarSign, path: '/financials' },
  { label: 'الأهداف', icon: Target, path: '/targets' },
  { label: 'استيراد البيانات', icon: Upload, path: '/import' },
];

export default function BISidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const location = useLocation();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-white/5',
        collapsed && 'justify-center px-2'
      )}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-black text-white">درة للسيارات</div>
            <div className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Dora Cars BI Platform</div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl transition-all duration-200 group relative',
                collapsed ? 'justify-center p-3' : 'px-3 py-2.5',
                active
                  ? 'bg-emerald-500/15 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              )}
            >
              {active && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-400 rounded-l-full" />
              )}
              <item.icon className={cn('shrink-0 transition-all', collapsed ? 'w-5 h-5' : 'w-4 h-4', active ? 'text-emerald-400' : '')} />
              {!collapsed && (
                <span className="text-sm font-semibold">{item.label}</span>
              )}
              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute right-full mr-3 px-2 py-1 bg-[#1a2a3f] text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl border border-white/10 z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
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
          'bg-[#0d1f35] border-l border-white/5 z-30',
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
          'bg-[#0d1f35] border-l border-white/5 z-50',
          'transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          <div className="text-sm font-black text-white">درة السيارة — BI</div>
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
