/**
 * Dorat Cars - Customer Special Orders Store
 * Manages customer parts orders, supplier assignments per item, and status lifecycle.
 * Server: Hostinger bi.doracar.com (/api/customer_orders.php)
 */

const STORAGE_KEY = 'dora_customer_orders_v1';

export const ORDER_STATUSES = {
  UNDER_ORDER: {
    key: 'UNDER_ORDER',
    label: 'تحت الطلب',
    color: 'amber',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dotClass: 'bg-amber-400',
    description: 'تم تسجيل الطلب من العميل وبانتظار التواصل مع المورد',
    nextStatus: 'ORDERED',
    nextLabel: 'تحديد كـ تم الطلب'
  },
  ORDERED: {
    key: 'ORDERED',
    label: 'تم الطلب',
    color: 'blue',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    dotClass: 'bg-blue-400',
    description: 'تم تأكيد وطلب القطع من الموردين وجاري الشحن',
    nextStatus: 'ARRIVED',
    nextLabel: 'تحديد كـ تم الوصول في الفرع'
  },
  ARRIVED: {
    key: 'ARRIVED',
    label: 'تم الوصول في الفرع',
    color: 'purple',
    badgeClass: 'bg-purple-500/15 text-purple-700 border-purple-500/30 ring-1 ring-purple-500/50',
    dotClass: 'bg-purple-500 animate-pulse',
    description: 'وصلت القطع إلى الفرع وجاهزة لإبلاغ العميل أو استلامه وشحنه',
    nextStatus: 'DELIVERED',
    nextLabel: 'تحديد كـ تم التسليم / الشحن'
  },
  DELIVERED: {
    key: 'DELIVERED',
    label: 'تم التسليم / الشحن',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
    dotClass: 'bg-emerald-500',
    description: 'تم تسليم أو شحن القطع للعميل بنجاح واستلام كامل الحساب',
    nextStatus: null,
    nextLabel: null
  },
  CANCELLED: {
    key: 'CANCELLED',
    label: 'ملغي',
    color: 'rose',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    dotClass: 'bg-rose-400',
    description: 'تم إلغاء الطلب من قبل العميل أو لعدم توفر الصنف',
    nextStatus: null,
    nextLabel: null
  }
};

export const COMMON_SUPPLIERS = [
  'انور محل القحطاني',
  'عبدالرحمن مندوب الضحيان',
  'احمد الانتاج الأصلي الرياض',
  'التضامن لقطع غيار السيارات الكوريه',
  'شركة التاج الكوري',
  'بدر الوادي',
  'مؤسسة قطع واكثر للتجاره',
  'عبدالله موبكو',
  'احمد جمعان جمعان بامسق الرياض',
  'الرياده العربيه',
  'ناصر القحطاني',
  'الخليفي ALKHULAIFI',
  'نجيب مدار الوادي 1',
  'شمس الأصناف جديد',
  'اوتو',
  'ابراهيم الحارثي',
  'انيس تسلا الخليج',
  'دره البسام الرياض',
  'ابو مشاري الغيار الأفضل',
  'الدرع لقطع الغيار - يحيى درع',
  'حيدر صفوه المستقبل طالب بامسق',
  'هانى القطع الاصلية',
  'عبدالله باطوق منبع الحضاره',
  'صالح / العثيمان الرياض',
  'مؤسسه درب الاصلي',
  'شركة هادي هادي الرياض',
  'مؤسسة قطع وأكثر',
  'فهمي الطير هونداي',
  'وكالة الوعلان للسيارات',
  'وكالة المجدوعي',
  'وكالة الناغي',
  'مورد خارجي / استيراد كوريا مباشر'
];

export const BRANCH_KEYS = {
  MAIN: 'الفرع الرئيسي - بريدة (صناعية السليم)',
  RAWAF: 'فرع الرواف - بريدة (صناعية الرواف)',
  KIA: 'فرع كيا المتخصص - بريدة',
  CENTRAL: 'المستودع المركزي'
};

export const BRANCHES = [
  BRANCH_KEYS.MAIN,
  BRANCH_KEYS.RAWAF,
  BRANCH_KEYS.KIA,
  BRANCH_KEYS.CENTRAL
];

export const ORDER_TYPES = {
  LOCAL: {
    key: 'LOCAL',
    label: 'طلب محلي',
    badge: '🇸🇦 محلي',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    etaText: 'توريد محلي سريع (1 - 3 أيام)',
    desc: 'قطع يتم توفيرها من الموردين المحليين والمستودعات المركزية بالمملكة'
  },
  KOREA: {
    key: 'KOREA',
    label: 'استيراد كوريا مباشر',
    badge: '🇰🇷 استيراد كوريا',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/40 ring-1 ring-blue-500/40',
    etaText: 'استيراد وشحن دولي من كوريا (25 - 35 يوماً / قرابة شهر)',
    desc: 'طلبيات خاصة يتم شحنها واستيرادها مباشرة من مصانع ومستودعات كوريا وتستغرق قرابة شهر'
  }
};

/**
 * Returns allowed branch for user:
 * - Khaled: Main Branch (الفرع الرئيسي)
 * - Abdulaziz: Rawaf Branch (فرع الرواف)
 * - Saleh & Taha (Online Store): Kia Branch (فرع كيا المتخصص)
 * - Admin/Owner/Others: null (All branches allowed)
 */
export function getUserAssignedBranch(user) {
  if (!user) return null;
  const username = String(user.username || '').toLowerCase();
  const name = String(user.name || '').toLowerCase();
  
  if (username.includes('khaled') || name.includes('خالد')) {
    return BRANCH_KEYS.MAIN;
  }
  if (username.includes('abdulaziz') || name.includes('عبد العزيز') || name.includes('عبدالعزيز')) {
    return BRANCH_KEYS.RAWAF;
  }
  // Online Store & Kia Branch are unified
  if (
    username.includes('saleh') ||
    name.includes('صالح') ||
    username.includes('taha') ||
    name.includes('طه')
  ) {
    return BRANCH_KEYS.KIA;
  }
  return null; // Admin / Full Management
}

export function getUserBranchStaffTitle(user) {
  if (!user) return 'إدارة المنصة / الإدارة العامة';
  const username = String(user.username || '').toLowerCase();
  const name = String(user.name || '').toLowerCase();
  
  if (username.includes('taha') || name.includes('طه')) {
    return 'مسؤول المتجر الإلكتروني (فرع كيا)';
  }
  const branch = getUserAssignedBranch(user);
  if (branch === BRANCH_KEYS.MAIN) return 'موظف الفرع الرئيسي';
  if (branch === BRANCH_KEYS.RAWAF) return 'موظف فرع الرواف';
  if (branch === BRANCH_KEYS.KIA) return 'موظف فرع كيا';
  return 'إدارة المنصة / الإدارة العامة';
}

const HOSTINGER_ORDERS_API = typeof window !== 'undefined' && window.location.hostname === 'bi.doracar.com'
  ? '/api/customer_orders.php'
  : 'https://bi.doracar.com/api/customer_orders.php';

export function getLocalCustomerOrders() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Error reading local customer orders:', err);
  }
  return [];
}

export function saveLocalCustomerOrders(orders) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent('dora-customer-orders-updated', { detail: orders }));
  } catch (err) {
    console.warn('Error saving local customer orders:', err);
  }
}

/**
 * Fetch orders from Hostinger server and merge with local cache
 */
export async function syncCustomerOrdersFromServer() {
  try {
    const res = await fetch(HOSTINGER_ORDERS_API, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.orders)) {
        const local = getLocalCustomerOrders();
        const map = new Map(local.map(o => [String(o.id), o]));
        data.orders.forEach(remote => {
          if (!remote || !remote.id) return;
          const remoteId = String(remote.id);
          const existing = map.get(remoteId);
          if (!existing || (remote.updatedAt && new Date(remote.updatedAt) > new Date(existing.updatedAt || 0))) {
            map.set(remoteId, remote);
          }
        });
        const merged = Array.from(map.values());
        saveLocalCustomerOrders(merged);
        return merged;
      }
    }
  } catch (err) {
    console.warn('Hostinger sync orders notice:', err);
  }
  return getLocalCustomerOrders();
}

/**
 * Saves/upserts an order locally and sends to Hostinger server
 */
export function upsertCustomerOrder(order) {
  const all = getLocalCustomerOrders();
  const index = all.findIndex(o => String(o.id) === String(order.id));
  const now = new Date().toISOString();
  let updated;

  if (index >= 0) {
    updated = { ...all[index], ...order, updatedAt: now };
    all[index] = updated;
  } else {
    updated = {
      ...order,
      id: order.id || 'ORD-' + Date.now().toString(36).toUpperCase(),
      status: order.status || 'UNDER_ORDER',
      createdAt: order.createdAt || now,
      updatedAt: now
    };
    all.unshift(updated);
  }

  saveLocalCustomerOrders(all);

  // Background server sync
  fetch(HOSTINGER_ORDERS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save', order: updated })
  }).catch(err => {
    console.warn('Background server order save error:', err);
  });

  return updated;
}

/**
 * Quick status update helper
 */
export function updateCustomerOrderStatus(orderId, newStatus, staffName = 'موظف درة السيارات', note = '') {
  const all = getLocalCustomerOrders();
  const index = all.findIndex(o => String(o.id) === String(orderId));
  if (index === -1) return null;

  const now = new Date().toISOString();
  const target = all[index];
  const history = Array.isArray(target.statusHistory) ? target.statusHistory : [];

  const historyEntry = { status: newStatus, time: now, by: staffName };
  if (note && note.trim()) {
    historyEntry.note = note.trim();
  }

  const updated = {
    ...target,
    status: newStatus,
    updatedAt: now,
    statusHistory: [
      ...history,
      historyEntry
    ]
  };

  all[index] = updated;
  saveLocalCustomerOrders(all);

  // Background server sync
  fetch(HOSTINGER_ORDERS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update_status', id: orderId, status: newStatus, staffName, note: note || '' })
  }).catch(err => {
    console.warn('Background server status update error:', err);
  });

  return updated;
}

/**
 * Delete order
 */
export function deleteCustomerOrder(orderId) {
  const all = getLocalCustomerOrders();
  const filtered = all.filter(o => String(o.id) !== String(orderId));
  saveLocalCustomerOrders(filtered);

  fetch(HOSTINGER_ORDERS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id: orderId })
  }).catch(err => {
    console.warn('Background server delete error:', err);
  });

  return filtered;
}

/**
 * Analyzes order timing and returns delay flags:
 * - isOverdue: true if delayed
 * - type: 'INITIAL_48H' (under order for >= 48 hours without action) | 'LOCAL_7D' (ordered locally >= 7 days) | 'KOREA_25D' (ordered from Korea >= 25 days)
 */
export function getOrderDelayStatus(order) {
  if (!order || order.status === 'DELIVERED' || order.status === 'CANCELLED') {
    return { isOverdue: false, reason: null, hours: 0, days: 0 };
  }

  const createdTime = order.createdAt ? new Date(order.createdAt).getTime() : 0;
  const updatedTime = order.updatedAt ? new Date(order.updatedAt).getTime() : createdTime;
  const refTime = updatedTime || createdTime || Date.now();
  const diffMs = Math.max(0, Date.now() - refTime);
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  // 1. Initial Action Delay (Unchanged from UNDER_ORDER for >= 48 hours)
  if (order.status === 'UNDER_ORDER' && hours >= 48) {
    return {
      isOverdue: true,
      type: 'INITIAL_48H',
      label: `معلّق > 48 ساعة (${days > 0 ? `${days} يوم` : `${hours} ساعة`})`,
      shortLabel: `> 48 ساعة`,
      badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-400/40 ring-1 ring-amber-400/30',
      dotClass: 'bg-amber-500 animate-pulse',
      cardHighlight: 'ring-2 ring-amber-400/60 border-amber-400 bg-amber-50/25',
      hours,
      days,
      description: 'مر أكثر من 48 ساعة على تسجيل الطلب دون رفعه للمورد أو تغيير حالته إلى (تم الطلب)'
    };
  }

  // 2. Korea Import Delay (Ordered but not arrived for >= 25 days)
  if (order.orderType === 'KOREA' && order.status === 'ORDERED' && days >= 25) {
    return {
      isOverdue: true,
      type: 'KOREA_25D',
      label: `تأخر شحن كوريا (${days} يوم)`,
      shortLabel: `تأخر كوريا`,
      badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-400/40 ring-1 ring-rose-400/30',
      dotClass: 'bg-rose-500 animate-pulse',
      cardHighlight: 'ring-2 ring-rose-400/60 border-rose-400 bg-rose-50/25',
      hours,
      days,
      description: 'مر أكثر من 25 يوماً على طلبية كوريا دون وصولها للفرع'
    };
  }

  // 3. Local Supplier Fulfillment Delay (Ordered but not arrived for >= 7 days)
  if (order.orderType !== 'KOREA' && order.status === 'ORDERED' && days >= 7) {
    return {
      isOverdue: true,
      type: 'LOCAL_7D',
      label: `تأخر توريد محلي (${days} يوم)`,
      shortLabel: `تأخر توريد`,
      badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-400/40 ring-1 ring-rose-400/30',
      dotClass: 'bg-rose-500 animate-pulse',
      cardHighlight: 'ring-2 ring-rose-400/60 border-rose-400 bg-rose-50/25',
      hours,
      days,
      description: 'مر أكثر من 7 أيام على طلب القطعة من المورد دون وصولها للفرع'
    };
  }

  return { isOverdue: false, reason: null, hours, days };
}

/**
 * Generate WhatsApp chat URL with contextual message
 */
export function generateWhatsAppLink(phone, customerName, order) {
  if (!phone) return null;
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const formattedPhone = cleanPhone.startsWith('05')
    ? '966' + cleanPhone.slice(1)
    : cleanPhone.startsWith('5')
    ? '966' + cleanPhone
    : cleanPhone;

  let msg = `السلام عليكم ورحمة الله وبركاته، الأخ الكريم ${customerName || ''}\nمن شركة درة السيارة لقطع غيار السيارات.\n`;

  if (order?.orderNumber) {
    msg += `بخصوص طلبكم رقم (${order.orderNumber}):\n`;
  }

  const itemsList = (order?.items || [])
    .map((it, idx) => `• ${it.name || ''} ${it.sku && it.sku !== '—' ? `[${it.sku}]` : ''} (عدد ${it.qty || 1})`)
    .join('\n');

  if (itemsList) {
    msg += `القطع المطلوبة:\n${itemsList}\n\n`;
  }

  if (order?.orderType === 'KOREA') {
    msg += `🇰🇷 نوع الطلب: استيراد خاص مباشر من كوريا (مدة الشحن والتوريد المتوقعة قرابة شهر / 25 إلى 35 يوماً).\n`;
  }

  if (order?.status === 'ARRIVED') {
    const totalSelling = (order?.items || []).reduce((sum, it) => sum + ((Number(it.sellingPrice) || 0) * (Number(it.qty) || 1)), 0);
    const deposit = Number(order?.deposit) || 0;
    const remaining = Math.max(0, totalSelling - deposit);

    msg += `🎉 نود إبلاغكم بأن قطعتكم وصلت الفرع وجاهزة للاستلام حالياً!\n`;
    if (order?.branch) {
      msg += `📍 فرع الاستلام: ${order.branch}\n`;
    }
    if (totalSelling > 0) {
      msg += `💵 إجمالي القيمة: ${totalSelling.toLocaleString('en-US')} ر.س\n`;
      msg += `💳 العربون المدفوع: ${deposit.toLocaleString('en-US')} ر.س\n`;
      msg += `💰 المتبقي للتحصيل عند الاستلام: ${remaining.toLocaleString('en-US')} ر.س\n`;
    }
    msg += `\nنسعد بزيارتكم الكريمة خلال ساعات العمل الرسمية لاستلام الطلب.\nشكراً لتعاملكم مع شركة درة السيارة ✨`;
  } else if (order?.status === 'ORDERED') {
    if (order?.orderType === 'KOREA') {
      msg += `🚢 تم تأكيد وشحن الطلبية من كوريا وهي قيد النقل الدولي، وسنبلغكم فور وصولها للمستودع والفرع.`;
    } else {
      msg += `🚚 تم طلب القطع من الموردين وتأكيد الشحن إلى الفرع، وسنبلغكم فور وصولها مباشرة.`;
    }
  } else {
    msg += `📋 تم تسجيل طلبكم لدينا وجاري المتابعة والتجهيز مع الموردين.`;
  }

  if (order?.receivingStaffName) {
    msg += `\nالموظف المستلم للطلب: ${order.receivingStaffName}`;
  }

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
}
