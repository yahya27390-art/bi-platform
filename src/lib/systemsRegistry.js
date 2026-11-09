/**
 * Dora Cars BI Platform - Systems Registry & User Portal Router
 * Determines available systems per user and decides whether to show the launcher or auto-redirect.
 */

import { BI_ROLES } from './biPermissions';
import {
  PackageCheck,
  Search,
  ClipboardList,
  FileText,
  Crown,
  LayoutDashboard,
  Store,
  FileSpreadsheet
} from 'lucide-react';

export const PLATFORM_SYSTEMS = [
  {
    id: 'owner-vault',
    title: 'خزنة المالك ولوحة القيادة التنفيذية',
    shortTitle: 'اللوحة التنفيذية والمالية',
    tag: 'سري للغاية C-Suite',
    badgeClass: 'bg-indigo-500/15 text-indigo-700 border-indigo-400/30',
    dotClass: 'bg-indigo-500',
    description: 'رؤية استراتيجية عليا للسيولة، الأرباح الصافية، هوامش الربح لكل فرع، مبيعات المتجر، ومؤشرات Z-Report المالية 24/7 مشفرة ومؤمنة.',
    path: '/owner',
    icon: Crown,
    accentGradient: 'from-slate-900 via-indigo-950 to-blue-950',
    cardBorder: 'hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20',
    roles: [BI_ROLES.OWNER, BI_ROLES.ADMIN],
    features: ['💎 خزنة مالية مشفرة', '📈 أرباح الفروع والمتجر', '💰 تدقيق Z-Report', '🔒 صلاحية المالك العليا']
  },
  {
    id: 'customer-orders',
    title: 'نظام إدارة طلبات العملاء واستيراد كوريا',
    shortTitle: 'طلبات العملاء وكوريا',
    tag: 'مباشر • فوري',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 border-emerald-400/30',
    dotClass: 'bg-emerald-500 animate-pulse',
    description: 'تسجيل طلبات العملاء الخاصة وقطع الغيار غير المتوفرة، تحديد المورد لكل صنف، ومتابعة طلبيات استيراد كوريا المباشر (~ شهر) مع الربط الفوري بالواتساب.',
    path: '/customer-orders',
    icon: PackageCheck,
    accentGradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    cardBorder: 'hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20',
    roles: [BI_ROLES.OWNER, BI_ROLES.ADMIN, BI_ROLES.PURCHASING_MANAGER],
    features: ['🇸🇦 طلبات محلية', '🇰🇷 استيراد كوريا مباشر', '📱 رسائل واتساب للعميل', '🏢 عزل الفروع']
  },
  {
    id: 'inventory-search',
    title: 'مركز ذكاء المخزون وتوفر قطع الغيار',
    shortTitle: 'بحث وتوفر القطع',
    tag: '8,901 صنف مسعر',
    badgeClass: 'bg-cyan-500/15 text-cyan-700 border-cyan-400/30',
    dotClass: 'bg-cyan-500',
    description: 'فحص فوري وتدقيق توافق القطع (هيونداي، كيا، موبيس)، أسعار الشراء، وتوزيع الأرصدة الحية بين المستودعات الثلاثة (الرئيسي 100، الرواف 200، كيا 300).',
    path: '/inventory/search',
    icon: Search,
    accentGradient: 'from-blue-600 via-cyan-600 to-teal-700',
    cardBorder: 'hover:border-cyan-500 hover:ring-2 hover:ring-cyan-500/20',
    roles: [BI_ROLES.OWNER, BI_ROLES.ADMIN, BI_ROLES.PURCHASING_MANAGER, BI_ROLES.INVENTORY_VIEWER],
    features: ['📦 3 مستودعات حية', '🔍 بحث بالرقم والاسم', '💰 كشف التكلفة والسعر', '⚡ سرعة استجابة فائقة']
  },
  {
    id: 'branch-shortages',
    title: 'سحابة نواقص الفروع ومطابقة الموردين',
    shortTitle: 'نواقص الفروع والموردين',
    tag: 'اعتماد وتوريد',
    badgeClass: 'bg-amber-500/15 text-amber-700 border-amber-400/30',
    dotClass: 'bg-amber-500',
    description: 'تسجيل النواقص الميدانية لكل فرع، تحويل كشوفات الفروع إلى أوامر توريد للموردين، كشف صفقات الوفر المالي، وتصدير أوامر الشراء بصيغة Excel.',
    path: '/inventory/branch-shortages',
    icon: ClipboardList,
    accentGradient: 'from-amber-600 via-orange-600 to-rose-700',
    cardBorder: 'hover:border-amber-500 hover:ring-2 hover:ring-amber-500/20',
    roles: [BI_ROLES.OWNER, BI_ROLES.ADMIN, BI_ROLES.PURCHASING_MANAGER],
    features: ['📝 دفتر النواقص السحابي', '⚖️ كشف الوفر المالي', '📊 تصدير Excel معتمد', '🔒 مسار اعتماد حصري']
  },
  {
    id: 'corporate-quotes',
    title: 'نظام عروض أسعار الشركات والمؤسسات B2B',
    shortTitle: 'عروض الأسعار B2B',
    tag: 'A4 رسمي • 15% ضريبة',
    badgeClass: 'bg-purple-500/15 text-purple-700 border-purple-400/30',
    dotClass: 'bg-purple-500',
    description: 'إنشاء وحفظ وتصدير عروض أسعار رسمية متوافقة مع متطلبات ضريبة القيمة المضافة، مع إمكانية التعديل، التحميل كملف PDF رسمي، ومشاركة العروض عبر الواتساب.',
    path: '/corporate-quotes',
    icon: FileText,
    accentGradient: 'from-purple-600 via-indigo-600 to-violet-800',
    cardBorder: 'hover:border-purple-500 hover:ring-2 hover:ring-purple-500/20',
    roles: [BI_ROLES.OWNER, BI_ROLES.ADMIN, BI_ROLES.PURCHASING_MANAGER],
    features: ['📄 طباعة A4 رسمية', '🏦 رقم الآيبان والضريبة', '💾 حفظ سحابي Hostinger', '🔄 تعديل فوري لكافة البنود']
  },
  {
    id: 'new-branch',
    title: 'كشف طلبية وافتتاح الفرع الجديد',
    shortTitle: 'افتتاح فرع جديد',
    tag: 'تجهيز وتأسيس',
    badgeClass: 'bg-teal-500/15 text-teal-700 border-teal-400/30',
    dotClass: 'bg-teal-500',
    description: 'قائمة الأصناف الموصى بها لتأسيس وافتتاح الفروع الجديدة مع التكاليف وحساب الحد الأدنى من المخزون.',
    path: '/inventory/new-branch',
    icon: Store,
    accentGradient: 'from-teal-600 via-emerald-600 to-green-700',
    cardBorder: 'hover:border-teal-500 hover:ring-2 hover:ring-teal-500/20',
    roles: [BI_ROLES.OWNER, BI_ROLES.ADMIN, BI_ROLES.PURCHASING_MANAGER],
    features: ['📦 أصناف التأسيس المعتمدة', '💰 حساب تكاليف الافتتاح', '📋 جرد أولي منظم']
  },
  {
    id: 'supplier-reconciliation',
    title: 'نظام مطابقة وتسوية كشوف حسابات الموردين',
    shortTitle: 'مطابقة الموردين والمحاسبة',
    tag: 'محاسبة • مطابقة ذكية',
    badgeClass: 'bg-indigo-500/15 text-indigo-700 border-indigo-400/30',
    dotClass: 'bg-indigo-500',
    description: 'المطابقة الآلية لكشوف حسابات الموردين (Excel و PDF) مع نظام درة السيارة الداخلي، تسوية الفروقات وتلاشي الهللات، فك شفرة النصوص العربية وتصدير تقارير الاعتماد الرسمية.',
    path: '/reconciliation/',
    isExternalOrSubApp: true,
    icon: FileSpreadsheet,
    accentGradient: 'from-blue-600 via-indigo-600 to-slate-900',
    cardBorder: 'hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20',
    roles: [BI_ROLES.OWNER, BI_ROLES.ADMIN, BI_ROLES.PURCHASING_MANAGER],
    features: ['📑 مطابقة PDF و Excel', '⚡ خوارزمية ذكية للمبالغ الثابتة', '⚖️ كشف الفواتير المعلقة فوراً', '📄 تقرير A4 رسمي للاعتماد']
  },
  {
    id: 'bi-overview',
    title: 'تحليل المبيعات والفروع والحملات الإعلانية',
    shortTitle: 'التحليلات والمبيعات',
    tag: 'ذكاء أعمال BI',
    badgeClass: 'bg-blue-500/15 text-blue-700 border-blue-400/30',
    dotClass: 'bg-blue-500',
    description: 'متابعة حية لمبيعات الفروع الميدانية، إعلانات تيك توك وميتا وجوجل، ومبيعات المتجر الإلكتروني مع مؤشرات النمو اللحظية.',
    path: '/overview',
    icon: LayoutDashboard,
    accentGradient: 'from-blue-700 via-sky-700 to-slate-900',
    cardBorder: 'hover:border-blue-500 hover:ring-2 hover:ring-blue-500/20',
    roles: [BI_ROLES.ADMIN, BI_ROLES.ANALYST, BI_ROLES.VIEWER],
    features: ['📊 مؤشرات نمو حية', '🎯 حملات جوجل وتيك توك', '🛒 مبيعات سلة أونلاين', '🏢 مقارنة مبيعات الفروع']
  }
];

/**
 * Returns list of accessible systems for a given user.
 */
export function getUserAvailableSystems(user) {
  if (!user) return [];
  const role = user.role || '';
  return PLATFORM_SYSTEMS.filter((sys) => sys.roles.includes(role));
}

/**
 * Checks if user should be redirected directly or given the portal choice.
 * If user has exactly 1 system, returns that system's path.
 * If user has multiple systems, returns null (meaning show portal).
 */
export function getSingleSystemAutoRedirect(user) {
  // If user is OWNER, show the Portal with their exclusive Crown card
  if (user?.role === 'OWNER' || user?.username === 'doracars.fahad') {
    return '/portal';
  }
  const systems = getUserAvailableSystems(user);
  if (systems.length === 1) {
    return systems[0].path;
  }
  return null;
}
