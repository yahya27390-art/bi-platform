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
import SupplierPriceComparison from './pages/SupplierPriceComparison';
import BranchShortages from './pages/BranchShortages';
import BranchNotebookEntry from './pages/BranchNotebookEntry';
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
  const isPurchasingManager = user?.role === 'PURCHASING_MANAGER';

  // Default home redirect based on role
  const homeElement = isOwner 
    ? <Navigate to="/owner" replace /> 
    : isPurchasingManager
    ? <Navigate to="/inventory/branch-shortages" replace />
    : isInventoryViewer 
    ? <Navigate to="/inventory/search" replace /> 
    : <BIOverview />;

  const restrictedRedirect = isPurchasingManager 
    ? <Navigate to="/inventory/branch-shortages" replace /> 
    : <Navigate to="/inventory/search" replace />;

  const isRestrictedRole = isInventoryViewer || isPurchasingManager;

  return (
    <Routes>
      <Route path="/login" element={<BILogin />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/data-deletion" element={<DataDeletion />} />
      
      {/* Public Branch Notebook Entry (No Login Required) */}
      <Route path="/branch-entry" element={<BranchNotebookEntry />} />
      <Route path="/notebook" element={<Navigate to="/branch-entry" replace />} />

      <Route
        element={
          <BIProtectedRoute>
            <BILayout />
          </BIProtectedRoute>
        }
      >
        <Route path="/" element={homeElement} />
        
        {/* Inventory Intelligence Module (Search & Reports & Supplier Comparison & Branch Shortages) */}
        <Route path="/inventory" element={<Navigate to="/inventory/search" replace />} />
        <Route path="/inventory/search" element={<InventorySearch />} />
        <Route path="/inventory/reports" element={<InventoryReports />} />
        <Route path="/inventory/supplier-comparison" element={<SupplierPriceComparison />} />
        <Route path="/supplier-comparison" element={<Navigate to="/inventory/supplier-comparison" replace />} />
        <Route path="/inventory/branch-shortages" element={<BranchShortages />} />
        <Route path="/branch-shortages" element={<Navigate to="/inventory/branch-shortages" replace />} />
        <Route path="/products" element={<Navigate to="/inventory/search" replace />} />

        {/* Media & Marketing */}
        <Route 
          path="/media" 
          element={isRestrictedRole ? restrictedRedirect : <MediaBuying />} 
        />
        <Route 
          path="/media/:platform" 
          element={isRestrictedRole ? restrictedRedirect : <MediaBuying />} 
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
          element={isRestrictedRole ? restrictedRedirect : <Ecommerce />} 
        />
        <Route 
          path="/branches" 
          element={isRestrictedRole ? restrictedRedirect : <BranchesBI />} 
        />
        <Route 
          path="/financials" 
          element={isRestrictedRole ? restrictedRedirect : <Financials />} 
        />
        <Route 
          path="/targets" 
          element={isRestrictedRole ? restrictedRedirect : <Targets />} 
        />
        <Route 
          path="/import" 
          element={isRestrictedRole ? restrictedRedirect : <DataImport />} 
        />
        <Route 
          path="/owner" 
          element={isRestrictedRole ? restrictedRedirect : <OwnerExecutiveDashboard />} 
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
