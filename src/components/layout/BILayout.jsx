import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BISidebar from './BISidebar';
import BITopBar from './BITopBar';
import { useBIAuth } from '@/auth/BIAuthContext';

export default function BILayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useBIAuth();
  const location = useLocation();
  const isOwnerVaultPage = location.pathname === '/owner';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans overflow-x-hidden w-full relative" dir="rtl">
      {/* Sidebar is hidden on print and on the Owner Executive Vault page */}
      <div className="no-print print:hidden">
        <BISidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div
        className="transition-all duration-300 w-full min-w-0"
        style={isOwnerVaultPage ? { marginRight: 0, width: '100%' } : undefined}
      >
        {!isOwnerVaultPage && (
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
            @media print {
              .bi-main-content {
                margin-right: 0 !important;
                margin-left: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                padding: 0 !important;
              }
            }
          `}</style>
        )}

        {/* TopBar: hidden on print and on the Owner Executive Vault page */}
        {!isOwnerVaultPage && (
          <div className="no-print print:hidden">
            <BITopBar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
          </div>
        )}

        <main
          className={
            isOwnerVaultPage
              ? 'w-full min-w-0 overflow-x-hidden p-0'
              : 'bi-main-content px-3 sm:px-6 lg:px-8 py-5 max-w-[1800px] mx-auto space-y-6 pb-20 lg:pb-8 w-full min-w-0 overflow-x-hidden print:p-0 print:m-0 print:max-w-none'
          }
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile drawer backdrop (non-owner-vault only) */}
      {!isOwnerVaultPage && mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
}
