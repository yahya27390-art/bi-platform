import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BISidebar from './BISidebar';
import BITopBar from './BITopBar';

export default function BILayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans overflow-x-hidden w-full relative" dir="rtl">
      {/* Permanent Icons-Only Sidebar */}
      <BISidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area - 72px margin on desktop (Icons-Only Rail), strictly 0 on mobile */}
      <div className="bi-main-content transition-all duration-300 w-full min-w-0">
        <style>{`
          .bi-main-content {
            margin-right: 0 !important;
            width: 100% !important;
          }
          @media (min-width: 1024px) {
            .bi-main-content {
              margin-right: 72px !important;
              width: calc(100% - 72px) !important;
            }
          }
        `}</style>

        <BITopBar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

        <main className="px-3 sm:px-6 lg:px-8 py-5 max-w-[1800px] mx-auto space-y-6 pb-20 lg:pb-8 w-full min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile drawer backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
}
