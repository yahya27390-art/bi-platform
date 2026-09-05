import { Navigate } from 'react-router-dom';
import { useBIAuth } from '@/auth/BIAuthContext';
import { hasBIPermission } from '../../lib/biPermissions';

/**
 * Guards BI routes by checking a specific permission
 * Falls back to a restricted message or redirect
 */
export function BIRoleGuard({ permission = 'canViewDashboard', children, fallback }) {
  const { user } = useBIAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (!hasBIPermission(user, permission)) {
    if (fallback) return fallback;
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-3xl">🔒</div>
        <div className="text-center">
          <p className="text-white font-bold text-lg">غير مصرح بالوصول</p>
          <p className="text-slate-400 text-sm mt-1">لا تملك صلاحية عرض هذا القسم</p>
        </div>
      </div>
    );
  }

  return children;
}

export default BIRoleGuard;
