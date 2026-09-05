import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useBIAuth } from './BIAuthContext';
import { hasBIPermission } from '../lib/biPermissions';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function BIProtectedRoute({ children, requiredPermission, fallback }) {
  const { user, isAuthenticated, isLoading } = useBIAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasBIPermission(user, requiredPermission)) {
    if (fallback) return fallback;

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-[#0D1E36] border border-red-500/20 rounded-3xl m-4 space-y-4" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">منطقة محمية – صلاحية غير كافية</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-md">
            دورك الحالي <span className="text-emerald-400 font-bold">({user.role})</span> لا يملك تصريح عرض هذه البيانات الحساسة وفقاً لسياسة Row Level Security وصلاحيات المنصة.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
