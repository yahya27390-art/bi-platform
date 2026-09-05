import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BISidebar from './BISidebar';
import BITopBar from './BITopBar';

export default function BILayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A1628] text-white font-sans" dir="rtl">
      {/* Desktop Sidebar */}
      <BISidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main area */}
      <div
        className="transition-all duration-300"
        style={{ marginRight: sidebarCollapsed ? '72px' : '260px' }}
      >
        {/* Hide margin on mobile */}
        <style>{`@media(max-width:1023px){.bi-main{margin-right:0!important}}`}</style>

        <BITopBar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1800px] mx-auto space-y-6 pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
}
