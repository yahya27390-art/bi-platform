import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function VentrilocStackCard({
  id,
  index = 0,
  totalCards = 10,
  title,
  subtitle,
  icon,
  badge,
  badgeColor = 'blue',
  accentColor = '#2563EB',
  isStackedMode = false,
  actions = null,
  children,
}) {
  const [collapsed, setCollapsed] = useState(false);

  // Determine badge styling based on badgeColor
  const getBadgeStyle = () => {
    switch (badgeColor) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'purple':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'amber':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'rose':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'cyan':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  return (
    <section
      id={id}
      style={{
        zIndex: isStackedMode ? 10 + index : 'auto',
      }}
      className={`transition-all duration-300 mb-6 sm:mb-8 w-full ${
        isStackedMode ? 'lg:sticky lg:top-[68px]' : ''
      }`}
    >
      <div className="relative rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-shadow duration-300 overflow-hidden w-full">
        {/* Top Accent Line */}
        <div
          className="h-1 sm:h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${accentColor} 0%, rgba(255,255,255,0.4) 100%)`,
          }}
        />

        {/* Clean Executive Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-b from-slate-50/70 to-white">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
            {/* Number Counter Badge */}
            <span className="font-mono text-[11px] sm:text-xs font-black tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg shadow-2xs shrink-0">
              {String(index + 1).padStart(2, '0')}/{String(totalCards).padStart(2, '0')}
            </span>

            {/* Icon */}
            {icon && (
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xs border text-slate-700 shrink-0"
                style={{
                  backgroundColor: `${accentColor}12`,
                  borderColor: `${accentColor}25`,
                  color: accentColor,
                }}
              >
                {icon}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-[#0F172A] tracking-tight truncate">
                  {title}
                </h2>
                {badge && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs shrink-0 ${getBadgeStyle()}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 font-medium truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Actions & Quick collapse/expand button */}
          <div className="flex items-center gap-2 shrink-0">
            {actions}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 transition-all text-xs flex items-center gap-1 font-semibold shrink-0"
              title={collapsed ? 'توسيع البطاقة' : 'طي البطاقة'}
            >
              <span className="text-[11px] hidden md:inline">
                {collapsed ? 'عرض' : 'طي'}
              </span>
              {collapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Card Content */}
        {!collapsed && (
          <div className="p-4 sm:p-6 w-full overflow-x-hidden">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
