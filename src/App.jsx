import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BILayout from './components/layout/BILayout';
import BIOverview from './pages/BIOverview';
import MediaBuying from './pages/MediaBuying';
import Ecommerce from './pages/Ecommerce';
import BranchesBI from './pages/BranchesBI';
import Products from './pages/Products';
import InventorySearch from './pages/InventorySearch';
import InventoryReports from './pages/InventoryReports';
import Financials from './pages/Financials';
import Targets from './pages/Targets';
import DataImport from './pages/DataImport';
import PrivateCampaignLab from './pages/PrivateCampaignLab';
import OwnerExecutiveDashboard from './pages/OwnerExecutiveDashboard';
import BILogin from './auth/BILogin';
import BIProtectedRoute from './auth/BIProtectedRoute';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import DataDeletion from './pages/DataDeletion';
import { useBIAuth } from './auth/BIAuthContext';

export default function App() {
  const { user } = useBIAuth();
  const isOwner = user?.role === 'OWNER';
  const isInventoryViewer = user?.role === 'INVENTORY_VIEWER';

  // Default home redirect based on role
  const homeElement = isOwner 
    ? <Navigate to="/owner" replace /> 
    : isInventoryViewer 
    ? <Navigate to="/inventory/search" replace /> 
    : <BIOverview />;

  return (
    <Routes>
      <Route path="/login" element={<BILogin />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/data-deletion" element={<DataDeletion />} />

      <Route
        element={
          <BIProtectedRoute>
            <BILayout />
          </BIProtectedRoute>
        }
      >
        <Route path="/" element={homeElement} />
        
        {/* Inventory Intelligence Module (Search & 5 Specialized Reports) */}
        <Route path="/inventory" element={<Navigate to="/inventory/search" replace />} />
        <Route path="/inventory/search" element={<InventorySearch />} />
        <Route path="/inventory/reports" element={<InventoryReports />} />
        <Route path="/products" element={<Navigate to="/inventory/search" replace />} />

        {/* Media & Marketing */}
        <Route 
          path="/media" 
          element={isInventoryViewer ? <Navigate to="/inventory/search" replace /> : <MediaBuying />} 
        />
        <Route 
          path="/media/:platform" 
          element={isInventoryViewer ? <Navigate to="/inventory/search" replace /> : <MediaBuying />} 
        />
        <Route path="/campaigns" element={<Navigate to="/media" replace />} />
        <Route 
          path="/campaign-lab" 
          element={
            <BIProtectedRoute requiredPermission="canViewPrivateCampaignLab" fallback={<Navigate to="/owner" replace />}>
              <PrivateCampaignLab />
            </BIProtectedRoute>
          } 
        />

        {/* Commercial & Operations */}
        <Route 
          path="/ecommerce" 
          element={isInventoryViewer ? <Navigate to="/inventory/search" replace /> : <Ecommerce />} 
        />
        <Route 
          path="/branches" 
          element={isInventoryViewer ? <Navigate to="/inventory/search" replace /> : <BranchesBI />} 
        />
        <Route 
          path="/financials" 
          element={isInventoryViewer ? <Navigate to="/inventory/search" replace /> : <Financials />} 
        />
        <Route 
          path="/targets" 
          element={isInventoryViewer ? <Navigate to="/inventory/search" replace /> : <Targets />} 
        />
        <Route 
          path="/import" 
          element={isInventoryViewer ? <Navigate to="/inventory/search" replace /> : <DataImport />} 
        />
        <Route 
          path="/owner" 
          element={isInventoryViewer ? <Navigate to="/inventory/search" replace /> : <OwnerExecutiveDashboard />} 
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
