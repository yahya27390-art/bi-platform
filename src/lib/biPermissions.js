// ============================================================
// BI PLATFORM — ROLE-BASED ACCESS CONTROL (RBAC)
// Strictly independent BI roles: OWNER, ADMIN, ANALYST, MEDIA_BUYER, VIEWER
// ============================================================

export const BI_ROLES = {
  OWNER:       'OWNER',
  ADMIN:       'ADMIN',
  ANALYST:     'ANALYST',
  MEDIA_BUYER: 'MEDIA_BUYER',
  VIEWER:      'VIEWER',
};

export const BI_PERMISSIONS = {
  OWNER: {
    canViewDashboard:              true,
    canViewMediaBuying:            true,
    canViewEcommerce:              true,
    canViewBranches:               true,
    canViewProducts:               true,
    canViewFinancialsFull:         true,  // Full P&L, Net Profit, OPEX, COGS, Cash flow
    canViewFinancialsSummary:      true,
    canViewTargets:                true,
    canEditTargets:                true,
    canImportData:                 true,
    canViewImportHistory:          true,
    canViewAuditLog:               true,
    canDeleteImports:              true,
    canConfigureDataSources:       true,
    canExportData:                 true,
    canViewPrivateCampaignLab:     false, // Strictly private for marketer/admin, hidden from Owner
  },
  ADMIN: {
    canViewDashboard:              true,
    canViewMediaBuying:            true,
    canViewEcommerce:              true,
    canViewBranches:               true,
    canViewProducts:               true,
    canViewFinancialsFull:         true,
    canViewFinancialsSummary:      true,
    canViewTargets:                true,
    canEditTargets:                true,
    canImportData:                 true,
    canViewImportHistory:          true,
    canViewAuditLog:               true,
    canDeleteImports:              false,
    canConfigureDataSources:       true,
    canExportData:                 true,
    canViewPrivateCampaignLab:     true,  // Private Campaign Lab & AI Copilot
  },
  ANALYST: {
    canViewDashboard:              true,
    canViewMediaBuying:            true,
    canViewEcommerce:              true,
    canViewBranches:               true,
    canViewProducts:               true,
    canViewFinancialsFull:         false, // Restricted from sensitive Net Profit / OPEX
    canViewFinancialsSummary:      true,  // Gross Margin & Revenue allowed
    canViewTargets:                true,
    canEditTargets:                false,
    canImportData:                 true,
    canViewImportHistory:          true,
    canViewAuditLog:               false,
    canDeleteImports:              false,
    canConfigureDataSources:       false,
    canExportData:                 true,
    canViewPrivateCampaignLab:     false,
  },
  MEDIA_BUYER: {
    canViewDashboard:              true,
    canViewMediaBuying:            true,
    canViewEcommerce:              true,
    canViewBranches:               false,
    canViewProducts:               true,
    canViewFinancialsFull:         false, // Never access net financial figures
    canViewFinancialsSummary:      false,
    canViewTargets:                true,
    canEditTargets:                false,
    canImportData:                 true,  // Can upload ad platform reports
    canViewImportHistory:          true,
    canViewAuditLog:               false,
    canDeleteImports:              false,
    canConfigureDataSources:       false,
    canExportData:                 true,
    canViewPrivateCampaignLab:     true,  // Private Campaign Lab & AI Copilot
  },
  VIEWER: {
    canViewDashboard:              true,
    canViewMediaBuying:            true,
    canViewEcommerce:              true,
    canViewBranches:               true,
    canViewProducts:               true,
    canViewFinancialsFull:         false,
    canViewFinancialsSummary:      false,
    canViewTargets:                true,
    canEditTargets:                false,
    canImportData:                 false,
    canViewImportHistory:          false,
    canViewAuditLog:               false,
    canDeleteImports:              false,
    canConfigureDataSources:       false,
    canExportData:                 false,
    canViewPrivateCampaignLab:     false,
  },
};

export function normalizeRole(role) {
  if (!role) return BI_ROLES.OWNER;
  const upper = String(role).toUpperCase();
  if (upper === 'OWNER' || upper === 'BI_OWNER') return BI_ROLES.OWNER;
  if (upper === 'ADMIN' || upper === 'BI_ADMIN') return BI_ROLES.ADMIN;
  if (upper === 'ANALYST' || upper === 'BI_ANALYST' || upper === 'MANAGER') return BI_ROLES.ANALYST;
  if (upper === 'MEDIA_BUYER' || upper === 'BUYER') return BI_ROLES.MEDIA_BUYER;
  if (upper === 'VIEWER' || upper === 'BI_VIEWER' || upper === 'HR' || upper === 'EMPLOYEE') return BI_ROLES.VIEWER;
  return BI_ROLES.VIEWER;
}

export function getBIPermissions(role) {
  const norm = normalizeRole(role);
  return BI_PERMISSIONS[norm] || BI_PERMISSIONS.VIEWER;
}

export function hasBIPermission(user, permission) {
  const perms = getBIPermissions(user?.bi_role || user?.role);
  return perms[permission] === true;
}

export function getBIRoleMeta(role) {
  const norm = normalizeRole(role);
  const META = {
    [BI_ROLES.OWNER]: {
      label: 'المالك والمشرف العام',
      labelEn: 'Owner & Executive',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'صلاحيات كاملة وغير مقيدة لكافة الأقسام وصافي الأرباح والقوائم المالية.',
    },
    [BI_ROLES.ADMIN]: {
      label: 'مدير النظام التنفيذي',
      labelEn: 'BI Administrator',
      badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      description: 'صلاحيات تشغيلية وتحليلية كاملة وإدارة الاستيراد والأهداف.',
    },
    [BI_ROLES.ANALYST]: {
      label: 'محلل أداء استراتيجي',
      labelEn: 'Data Analyst',
      badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      description: 'تحليل الأداء الإعلاني والبيعي وهوامش الربح الإجمالية.',
    },
    [BI_ROLES.MEDIA_BUYER]: {
      label: 'مسؤول الميديا بايينغ',
      labelEn: 'Media Buyer',
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      description: 'متابعة الحملات الإعلانية ومؤشرات ROAS, CPA ورفع ملفات الإعلانات.',
    },
    [BI_ROLES.VIEWER]: {
      label: 'مشاهد تقارير',
      labelEn: 'Read-only Viewer',
      badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      description: 'استعراض عام للوحة النظرة العامة والمؤشرات العامة.',
    },
  };
  return META[norm] || META[BI_ROLES.VIEWER];
}
