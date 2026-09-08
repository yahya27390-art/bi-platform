import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BILayout from './components/layout/BILayout';
import BIOverview from './pages/BIOverview';
import MediaBuying from './pages/MediaBuying';
import Ecommerce from './pages/Ecommerce';
import BranchesBI from './pages/BranchesBI';
import Products from './pages/Products';
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

export default function App() {
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
        <Route path="/" element={<BIOverview />} />
        <Route path="/media" element={<MediaBuying />} />
        <Route path="/media/:platform" element={<MediaBuying />} />
        <Route path="/campaigns" element={<Navigate to="/media" replace />} />
        <Route 
          path="/campaign-lab" 
          element={
            <BIProtectedRoute requiredPermission="canViewPrivateCampaignLab" fallback={<Navigate to="/" replace />}>
              <PrivateCampaignLab />
            </BIProtectedRoute>
          } 
        />
        <Route path="/ecommerce" element={<Ecommerce />} />
        <Route path="/branches" element={<BranchesBI />} />
        <Route path="/products" element={<Products />} />
        <Route path="/financials" element={<Financials />} />
        <Route path="/targets" element={<Targets />} />
        <Route path="/import" element={<DataImport />} />
        <Route path="/owner" element={<OwnerExecutiveDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
