import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BISidebar from './BISidebar';
import BITopBar from './BITopBar';

export default function BILayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans overflow-x-hidden w-full relative" dir="rtl">
      {/* Desktop Sidebar */}
      <BISidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area - Strictly 0 margin on mobile & tablet, responsive desktop margin */}
      <div className="bi-main-content transition-all duration-300 w-full min-w-0">
        <style>{`
          .bi-main-content {
            margin-right: 0 !important;
            width: 100% !important;
          }
          @media (min-width: 1024px) {
            .bi-main-content {
              margin-right: ${sidebarCollapsed ? '72px' : '260px'} !important;
              width: calc(100% - ${sidebarCollapsed ? '72px' : '260px'}) !important;
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
