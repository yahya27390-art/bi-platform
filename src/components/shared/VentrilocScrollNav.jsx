import { useState, useEffect } from 'react';
import { Layers, ChevronUp, Compass, Check, ArrowUp } from 'lucide-react';

export default function VentrilocScrollNav({
  cards = [],
  activeCardId = '',
  isStackedMode = false,
  onToggleStackedMode,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowScrollTop(scrollY > 300);

      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToCard = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 75;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeIndex = cards.findIndex(c => c.id === activeCardId);
  const currentCard = cards[activeIndex] || cards[0];

  return (
    <>
      {/* 1. Mobile-only Minimal Floating Back-to-Top (Only when scrolled down) */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="md:hidden fixed bottom-5 left-5 z-40 w-10 h-10 rounded-full bg-[#0F172A] text-white shadow-xl flex items-center justify-center border border-slate-700 active:scale-95 transition-all"
          title="للأعلى"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* 2. Desktop-only Executive Floating Quick-Nav Pill */}
      <aside aria-label="شريط التنقل السريع" className="hidden md:flex fixed bottom-6 left-6 z-40 flex-col items-start gap-2 font-sans select-none" dir="rtl">
        {/* Expanded Popover */}
        {menuOpen && (
          <div className="w-72 max-h-[60vh] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3 shadow-2xl text-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between px-2 pb-2.5 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-bold text-white">فهرس أقسام القيادة</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {cards.length} أقسام
              </span>
            </div>

            <div className="space-y-0.5">
              {cards.map((card, idx) => {
                const isActive = card.id === activeCardId;
                return (
                  <button
                    key={card.id}
                    onClick={() => scrollToCard(card.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all text-right ${
                      isActive
                        ? 'bg-blue-600/25 text-blue-300 border border-blue-500/40 shadow-xs'
                        : 'hover:bg-slate-800/80 text-slate-300 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[10px] font-bold opacity-60">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="truncate">{card.shortTitle || card.title}</span>
                    </div>
                    {isActive && <Check className="w-3 h-3 text-blue-400 shrink-0 mr-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Floating Capsule Bar */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-900 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-full shadow-xl text-white transition-all">
          {/* Progress Ring */}
          <div className="relative w-7 h-7 flex items-center justify-center mr-1">
            <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-500 transition-all duration-150"
                strokeDasharray={`${scrollProgress}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono text-[9px] font-bold text-slate-300">
              {activeIndex >= 0 ? String(activeIndex + 1).padStart(2, '0') : '01'}
            </span>
          </div>

          {/* Quick Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 text-xs font-bold text-slate-100 transition-all shadow-xs max-w-[200px]"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate text-xs">
              {currentCard?.shortTitle || currentCard?.title || 'مركز القيادة'}
            </span>
            <ChevronUp className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all shadow-xs"
            title="الصعود للأعلى"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
}
