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
import NewBranchRequisition from './pages/NewBranchRequisition';
import CorporateQuotations from './pages/CorporateQuotations';
import CustomerOrders from './pages/CustomerOrders';
import SystemsPortal from './pages/SystemsPortal';
import BILogin from './auth/BILogin';
import BIProtectedRoute from './auth/BIProtectedRoute';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import DataDeletion from './pages/DataDeletion';
import { useBIAuth } from './auth/BIAuthContext';
import { getSingleSystemAutoRedirect } from './lib/systemsRegistry';

export default function App() {
  const { user } = useBIAuth();
  const isOwner = user?.role === 'OWNER' || user?.username === 'doracars.fahad' || user?.email === 'fahad@doratcars.com';
  const isInventoryViewer = user?.role === 'INVENTORY_VIEWER';
  const isPurchasingManager = user?.role === 'PURCHASING_MANAGER' && !isOwner;

  const isRestrictedRole = isInventoryViewer || isPurchasingManager || isOwner;

  const restrictedRedirect = isOwner
    ? <Navigate to="/owner" replace />
    : isPurchasingManager 
      ? <Navigate to="/inventory/branch-shortages" replace /> 
      : <Navigate to="/inventory/search" replace />;

  const overviewElement = isRestrictedRole ? restrictedRedirect : <BIOverview />;

  // Smart single-system redirect: If restricted single-system user, send to their system; otherwise default to Sales Analysis (BIOverview)
  const singleAutoRedirect = getSingleSystemAutoRedirect(user);
  const homeElement = singleAutoRedirect
    ? <Navigate to={singleAutoRedirect} replace />
    : overviewElement;

  return (
    <Routes>
      <Route path="/login" element={<BILogin />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/data-deletion" element={<DataDeletion />} />
      
      {/* Interactive Systems Portal */}
      <Route
        path="/portal"
        element={
          <BIProtectedRoute>
            <SystemsPortal />
          </BIProtectedRoute>
        }
      />
      <Route path="/launcher" element={<Navigate to="/portal" replace />} />

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
        <Route path="/overview" element={overviewElement} />
        
        {/* Inventory Intelligence Module (Search & Reports & Supplier Comparison & Branch Shortages & New Branch Requisition) */}
        <Route path="/inventory" element={<Navigate to="/inventory/search" replace />} />
        <Route path="/inventory/search" element={<InventorySearch />} />
        <Route path="/inventory/reports" element={<InventoryReports />} />
        <Route path="/inventory/supplier-comparison" element={<SupplierPriceComparison />} />
        <Route path="/supplier-comparison" element={<Navigate to="/inventory/supplier-comparison" replace />} />
        <Route path="/inventory/branch-shortages" element={<BranchShortages />} />
        <Route path="/branch-shortages" element={<Navigate to="/inventory/branch-shortages" replace />} />
        <Route path="/inventory/new-branch" element={<NewBranchRequisition />} />
        <Route path="/new-branch" element={<Navigate to="/inventory/new-branch" replace />} />
        <Route path="/corporate-quotes" element={<CorporateQuotations />} />
        <Route path="/quotes" element={<Navigate to="/corporate-quotes" replace />} />
        <Route path="/customer-orders" element={<CustomerOrders />} />
        <Route path="/orders" element={<Navigate to="/customer-orders" replace />} />
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
          element={<OwnerExecutiveDashboard />} 
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
