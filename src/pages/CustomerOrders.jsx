import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PackageCheck,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Building,
  Building2,
  User,
  UserCheck,
  Phone,
  Car,
  FileText,
  Printer,
  Trash2,
  Edit,
  Edit2,
  Check,
  LayoutGrid,
  List,
  Grid3X3,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  DollarSign,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  Flame,
  Calendar,
  X,
  Send,
  Boxes,
  Layers,
  ChevronRight,
  ArrowRight,
  Globe,
  Lock,
  ShieldCheck,
  Sparkles,
  Timer,
  Archive
} from 'lucide-react';
import doraLogo from '../assets/dora_logo.png';
import { useBIAuth } from '../auth/BIAuthContext';
import { formatSAR, formatNum } from '../lib/kpiEngine';
import { REAL_ALL_PARTS } from '../data/realInventoryData';
import {
  ORDER_STATUSES,
  COMMON_SUPPLIERS,
  BRANCHES,
  BRANCH_KEYS,
  ORDER_TYPES,
  getUserAssignedBranch,
  getUserBranchStaffTitle,
  getLocalCustomerOrders,
  saveLocalCustomerOrders,
  syncCustomerOrdersFromServer,
  upsertCustomerOrder,
  updateCustomerOrderStatus,
  deleteCustomerOrder,
  generateWhatsAppLink,
  getOrderDelayStatus
} from '../lib/customerOrdersStore';

export default function CustomerOrders() {
  const { user } = useBIAuth();
  const navigate = useNavigate();

  // Branch isolation based on logged-in user
  // Khaled -> Main Branch only
  // Abdulaziz -> Rawaf Branch only
  // Saleh -> Kia Branch only
  // Admin / Owner / Fahad -> null (All branches accessible)
  const assignedBranch = useMemo(() => getUserAssignedBranch(user), [user]);
  const userStaffRoleTitle = useMemo(() => getUserBranchStaffTitle(user), [user]);
  const isAdmin = !assignedBranch;

  const [orders, setOrders] = useState(getLocalCustomerOrders);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'saving' | 'offline'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState(assignedBranch || 'ALL');
  const [orderTypeFilter, setOrderTypeFilter] = useState('ALL'); // 'ALL' | 'LOCAL' | 'KOREA'

  // Persistent View Mode per user account ('cards' | 'compact' | 'list')
  const accountIdentifier = useMemo(() => {
    return user?.username || user?.id || user?.name || 'default_user';
  }, [user]);

  const storageKey = `bi_orders_view_mode_${accountIdentifier}`;

  const [viewMode, setViewMode] = useState(() => {
    try {
      const saved = localStorage.getItem(`bi_orders_view_mode_${user?.username || user?.id || user?.name || 'default_user'}`);
      return saved && ['cards', 'compact', 'list'].includes(saved) ? saved : 'cards';
    } catch (e) {
      return 'cards';
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && ['cards', 'compact', 'list'].includes(saved)) {
        setViewMode(saved);
      }
    } catch (e) {
      // ignore
    }
  }, [storageKey]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(storageKey, mode);
    } catch (e) {
      // ignore
    }
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // If assignedBranch exists, lock the branch filter to it
  useEffect(() => {
    if (assignedBranch) {
      setBranchFilter(assignedBranch);
    }
  }, [assignedBranch]);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    orderNumber: '',
    orderType: 'LOCAL', // 'LOCAL' | 'KOREA'
    customerName: '',
    customerPhone: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vin: '',
    branch: assignedBranch || BRANCHES[0],
    branchStaffRole: userStaffRoleTitle,
    receivingStaffName: '',
    deposit: 0,
    status: 'UNDER_ORDER',
    notes: '',
    items: []
  });

  // Current item being added to form
  const [catalogSearch, setCatalogSearch] = useState('');
  const [allCatalogParts, setAllCatalogParts] = useState([]);
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false);
  const [itemInput, setItemInput] = useState({
    sku: '',
    name: '',
    qty: 1,
    supplierName: COMMON_SUPPLIERS[0],
    expectedCost: '',
    sellingPrice: '',
    notes: ''
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Load catalog and sync with server
  useEffect(() => {
    try {
      setAllCatalogParts(REAL_ALL_PARTS || []);
    } catch (e) {
      console.warn('Failed to load inventory parts:', e);
    }

    setSyncStatus('saving');
    syncCustomerOrdersFromServer()
      .then((data) => {
        setOrders(data);
        setSyncStatus('synced');
      })
      .catch((err) => {
        console.warn('Sync orders failed:', err);
        setSyncStatus('offline');
      });

    const handleUpdateEvent = (e) => {
      if (Array.isArray(e.detail)) {
        setOrders(e.detail);
      }
    };
    window.addEventListener('dora-customer-orders-updated', handleUpdateEvent);
    return () => window.removeEventListener('dora-customer-orders-updated', handleUpdateEvent);
  }, []);

  // Filtered parts for autocomplete
  const filteredParts = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return allCatalogParts
      .filter((p) => {
        const skuMatch = p.sku && String(p.sku).toLowerCase().includes(q);
        const nameMatch = p.name && String(p.name).toLowerCase().includes(q);
        return skuMatch || nameMatch;
      })
      .slice(0, 10);
  }, [catalogSearch, allCatalogParts]);

  // Base scope of orders visible to the user
  const visibleScopeOrders = useMemo(() => {
    if (assignedBranch) {
      // Strictly isolate to the user's branch
      return orders.filter((o) => (o.branch || BRANCHES[0]) === assignedBranch);
    }
    return orders; // Admin sees all
  }, [orders, assignedBranch]);

  // KPIs scoped to the user's visibility
  const stats = useMemo(() => {
    const total = visibleScopeOrders.length;
    const underOrder = visibleScopeOrders.filter((o) => o.status === 'UNDER_ORDER').length;
    const ordered = visibleScopeOrders.filter((o) => o.status === 'ORDERED').length;
    const arrived = visibleScopeOrders.filter((o) => o.status === 'ARRIVED').length;
    const delivered = visibleScopeOrders.filter((o) => o.status === 'DELIVERED').length;
    const activeOrders = visibleScopeOrders.filter((o) => o.status !== 'DELIVERED').length;
    const koreaOrders = visibleScopeOrders.filter((o) => o.orderType === 'KOREA').length;
    const localOrders = visibleScopeOrders.filter((o) => o.orderType !== 'KOREA').length;
    const totalDeposit = visibleScopeOrders.reduce((sum, o) => sum + (Number(o.deposit) || 0), 0);

    // Overdue calculations (48h without action, 7d local fulfillment, 25d Korea)
    const overdue48h = visibleScopeOrders.filter((o) => {
      const d = getOrderDelayStatus(o);
      return d.isOverdue && d.type === 'INITIAL_48H';
    }).length;
    const totalOverdue = visibleScopeOrders.filter((o) => getOrderDelayStatus(o).isOverdue).length;

    return { total, activeOrders, underOrder, ordered, arrived, delivered, koreaOrders, localOrders, totalDeposit, overdue48h, totalOverdue };
  }, [visibleScopeOrders]);

  // Filtered and sorted list based on search, status, branch, Korea type, and chronological order (newest to oldest)
  const filteredOrders = useMemo(() => {
    const list = visibleScopeOrders.filter((o) => {
      // Order Type filter (Local vs Korea Import)
      if (orderTypeFilter === 'KOREA' && o.orderType !== 'KOREA') return false;
      if (orderTypeFilter === 'LOCAL' && o.orderType === 'KOREA') return false;

      // Status filter & Overdue filter & Archive separation
      if (statusFilter === 'ALL') {
        // "جميع الحالات" / Default active view: only show ongoing/active orders, exclude DELIVERED
        if (o.status === 'DELIVERED') return false;
      } else if (statusFilter === 'OVERDUE_48H') {
        // "معلقة > 48 ساعة"
        const delay = getOrderDelayStatus(o);
        if (!delay.isOverdue) return false;
      } else if (statusFilter === 'DELIVERED' || statusFilter === 'ARCHIVE') {
        // "الأرشيف": only show delivered / shipped orders
        if (o.status !== 'DELIVERED') return false;
      } else if (statusFilter === 'ALL_INCLUDING_ARCHIVE') {
        // Show everything including archive
      } else if (o.status !== statusFilter) {
        return false;
      }

      // Branch filter (only applies if admin didn't select ALL)
      if (isAdmin && branchFilter !== 'ALL' && (o.branch || BRANCHES[0]) !== branchFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const nameMatch = o.customerName && o.customerName.toLowerCase().includes(q);
        const phoneMatch = o.customerPhone && String(o.customerPhone).includes(q);
        const orderNoMatch = o.orderNumber && String(o.orderNumber).toLowerCase().includes(q);
        const staffMatch = o.receivingStaffName && o.receivingStaffName.toLowerCase().includes(q);
        const itemMatch = (o.items || []).some(
          (it) =>
            (it.name && it.name.toLowerCase().includes(q)) ||
            (it.sku && it.sku.toLowerCase().includes(q)) ||
            (it.supplierName && it.supplierName.toLowerCase().includes(q))
        );
        return nameMatch || phoneMatch || orderNoMatch || staffMatch || itemMatch;
      }
      return true;
    });

    // Sort strictly from newest (آخر ما تم طلبه) to oldest (الأقدم)
    return list.sort((a, b) => {
      const getTime = (ord) => {
        if (ord.createdAt) {
          const t = new Date(ord.createdAt).getTime();
          if (!isNaN(t) && t > 0) return t;
        }
        if (ord.orderDate) {
          const t = new Date(ord.orderDate).getTime();
          if (!isNaN(t) && t > 0) return t;
        }
        if (ord.updatedAt) {
          const t = new Date(ord.updatedAt).getTime();
          if (!isNaN(t) && t > 0) return t;
        }
        if (ord.id && typeof ord.id === 'string') {
          const m = ord.id.match(/\d{10,}/);
          if (m) {
            const num = Number(m[0]);
            if (!isNaN(num) && num > 0) return num;
          }
        }
        return 0;
      };

      const timeA = getTime(a);
      const timeB = getTime(b);
      if (timeB !== timeA) {
        return timeB - timeA; // Descending (newest first)
      }

      const numA = Number(String(a.orderNumber || '').replace(/\D/g, '')) || 0;
      const numB = Number(String(b.orderNumber || '').replace(/\D/g, '')) || 0;
      if (numB !== numA) {
        return numB - numA;
      }

      return String(b.id || '').localeCompare(String(a.id || ''));
    });
  }, [visibleScopeOrders, orderTypeFilter, statusFilter, branchFilter, isAdmin, searchQuery]);

  // Item inline edit state in create/edit modal
  const [editingFormItemId, setEditingFormItemId] = useState(null);
  const [editingItemDraft, setEditingItemDraft] = useState({
    sku: '',
    name: '',
    qty: 1,
    supplierName: '',
    sellingPrice: ''
  });

  const handleStartEditItem = (item) => {
    setEditingFormItemId(item.id);
    setEditingItemDraft({
      sku: item.sku || '',
      name: item.name || '',
      qty: item.qty || 1,
      supplierName: item.supplierName || (formData.orderType === 'KOREA' ? 'مورد خارجي / استيراد كوريا مباشر' : COMMON_SUPPLIERS[0]),
      sellingPrice: item.sellingPrice !== undefined ? item.sellingPrice : ''
    });
  };

  const handleCancelEditItem = () => {
    setEditingFormItemId(null);
    setEditingItemDraft({ sku: '', name: '', qty: 1, supplierName: '', sellingPrice: '' });
  };

  const handleSaveItemEdit = (itemId) => {
    if (!editingItemDraft.name?.trim()) {
      showToast('يرجى كتابة اسم القطعة');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((it) => {
        if (it.id === itemId) {
          return {
            ...it,
            sku: editingItemDraft.sku.trim() || '—',
            name: editingItemDraft.name.trim(),
            qty: Math.max(1, Number(editingItemDraft.qty) || 1),
            supplierName: editingItemDraft.supplierName.trim() || 'مورد عام',
            sellingPrice: Number(editingItemDraft.sellingPrice) || 0
          };
        }
        return it;
      })
    }));
    setEditingFormItemId(null);
    showToast('تم حفظ تعديل الصنف بنجاح');
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingOrder(null);
    setEditingFormItemId(null);
    setEditingItemDraft({ sku: '', name: '', qty: 1, supplierName: '', sellingPrice: '' });
    setFormData({
      id: '',
      orderNumber: '',
      orderType: orderTypeFilter === 'KOREA' ? 'KOREA' : 'LOCAL',
      customerName: '',
      customerPhone: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vin: '',
      branch: assignedBranch || BRANCHES[0],
      branchStaffRole: userStaffRoleTitle,
      receivingStaffName: '',
      deposit: 0,
      status: 'UNDER_ORDER', // Default initial status
      notes: '',
      items: []
    });
    setItemInput({
      sku: '',
      name: '',
      qty: 1,
      supplierName: COMMON_SUPPLIERS[0],
      expectedCost: '',
      sellingPrice: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (order) => {
    setEditingOrder(order);
    setEditingFormItemId(null);
    setEditingItemDraft({ sku: '', name: '', qty: 1, supplierName: '', sellingPrice: '' });
    setFormData({
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType || 'LOCAL',
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      vehicleMake: order.vehicleMake || '',
      vehicleModel: order.vehicleModel || '',
      vehicleYear: order.vehicleYear || '',
      vin: order.vin || '',
      branch: order.branch || assignedBranch || BRANCHES[0],
      branchStaffRole: order.branchStaffRole || userStaffRoleTitle,
      receivingStaffName: order.receivingStaffName || '',
      deposit: order.deposit || 0,
      status: order.status || 'UNDER_ORDER',
      notes: order.notes || '',
      items: order.items || []
    });
    setIsModalOpen(true);
  };

  // Add Item to current Order form
  const handleAddItemToForm = () => {
    if (!itemInput.name.trim()) {
      showToast('يرجى تحديد أو كتابة اسم القطعة المطلوبة');
      return;
    }

    const newItem = {
      id: 'it-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      sku: itemInput.sku.trim() || '—',
      name: itemInput.name.trim(),
      qty: Math.max(1, Number(itemInput.qty) || 1),
      supplierName: itemInput.supplierName.trim() || 'مورد عام',
      expectedCost: Number(itemInput.expectedCost) || 0,
      sellingPrice: Number(itemInput.sellingPrice) || 0,
      notes: itemInput.notes.trim()
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setItemInput({
      sku: '',
      name: '',
      qty: 1,
      supplierName: formData.orderType === 'KOREA' ? 'مورد خارجي / استيراد كوريا مباشر' : COMMON_SUPPLIERS[0],
      expectedCost: '',
      sellingPrice: '',
      notes: ''
    });
    setCatalogSearch('');
    showToast(`تمت إضافة القطعة [${newItem.name}] وتحديد المورد`);
  };

  // Remove Item from Order form
  const handleRemoveItemFromForm = (itemId) => {
    if (editingFormItemId === itemId) {
      setEditingFormItemId(null);
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== itemId)
    }));
  };

  // Save Order
  const handleSaveOrder = (e) => {
    e.preventDefault();
    if (!formData.customerName.trim()) {
      showToast('يرجى كتابة اسم العميل');
      return;
    }
    if (!formData.customerPhone.trim()) {
      showToast('يرجى كتابة رقم جوال العميل للواتساب');
      return;
    }
    if (formData.items.length === 0) {
      showToast('يرجى إضافة قطعة واحدة على الأقل في الطلب');
      return;
    }

    const totalAmount = formData.items.reduce(
      (sum, it) => sum + (Number(it.sellingPrice) || 0) * (Number(it.qty) || 1),
      0
    );

    const payload = {
      ...formData,
      branch: assignedBranch || formData.branch || BRANCHES[0],
      branchStaffRole: formData.branchStaffRole || userStaffRoleTitle,
      receivingStaffName: formData.receivingStaffName?.trim() || '',
      recordedByUser: user?.username || 'user',
      totalAmount,
      deposit: Number(formData.deposit) || 0
    };

    const saved = upsertCustomerOrder(payload);
    if (saved) {
      setOrders((prev) => {
        const idx = prev.findIndex((o) => String(o.id) === String(saved.id));
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
    }
    setIsModalOpen(false);
    showToast('✓ تم حفظ طلب العميل بنجاح والمزامنة سحابياً');
  };

  // Status Confirmation Modal State (زر تأكيد لحالة الطلب عند تغييرها)
  const [statusConfirmModal, setStatusConfirmModal] = useState({
    isOpen: false,
    order: null,
    currentStatus: '',
    newStatus: '',
    note: ''
  });

  // Open Confirmation Modal before any status transition
  const openStatusConfirmation = (order, newStatus) => {
    if (!order || !newStatus || order.status === newStatus) return;
    setStatusConfirmModal({
      isOpen: true,
      order,
      currentStatus: order.status,
      newStatus,
      note: ''
    });
  };

  // Confirm and apply the status update
  const handleConfirmStatusChange = () => {
    if (!statusConfirmModal.order || !statusConfirmModal.newStatus) return;
    const { order, newStatus, note } = statusConfirmModal;
    const staffName = user?.name || user?.username || 'موظف درة السيارة';
    const updated = updateCustomerOrderStatus(order.id, newStatus, staffName, note);
    if (updated) {
      setOrders((prev) =>
        prev.map((o) => (String(o.id) === String(order.id) ? updated : o))
      );
      if (newStatus === 'DELIVERED') {
        showToast(`✓ تم تأكيد تسليم/شحن الطلب #${order.orderNumber || order.id} ونقله إلى الأرشيف`);
      } else {
        showToast(`✓ تم تأكيد تغيير حالة الطلب #${order.orderNumber || order.id} إلى [${ORDER_STATUSES[newStatus]?.label}]`);
      }
    }
    setStatusConfirmModal({ isOpen: false, order: null, currentStatus: '', newStatus: '', note: '' });
  };

  // Direct Status Update for any order (legacy / fallback)
  const handleUpdateOrderStatus = (orderId, newStatus, note = '') => {
    if (!newStatus) return;
    const staffName = user?.name || user?.username || 'موظف درة السيارة';
    const updated = updateCustomerOrderStatus(orderId, newStatus, staffName, note);
    if (updated) {
      setOrders((prev) =>
        prev.map((o) => (String(o.id) === String(orderId) ? updated : o))
      );
      showToast(`✓ تم تحديث حالة الطلب إلى [${ORDER_STATUSES[newStatus]?.label}]`);
    }
  };

  // Delete Order
  const handleDeleteOrder = (orderId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) {
      deleteCustomerOrder(orderId);
      setOrders((prev) => prev.filter((o) => String(o.id) !== String(orderId)));
      showToast('تم حذف الطلب');
    }
  };

  // Trigger Print for Receipt
  const handlePrintReceipt = (order) => {
    setPrintOrder(order);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-16 font-sans" dir="rtl">
      {/* ── Print Styles ── */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-receipt-section, #print-receipt-section * {
            visibility: visible !important;
          }
          #print-receipt-section {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ── Toast ── */}
      {toastMsg && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 no-print animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{toastMsg}</span>
        </div>
      )}

      {/* ── User & Branch Status Banner ── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-900 flex items-center justify-center p-3 shadow-lg shadow-emerald-500/20 shrink-0">
              <PackageCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  نظام إدارة طلبات العملاء الخاصة
                </h1>

                {/* Branch Isolation Badge */}
                {assignedBranch ? (
                  <span className="text-xs bg-amber-500/15 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-xs">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>مخصص لفرع: {assignedBranch}</span>
                    <span className="text-[11px] text-amber-200/80">({user?.name || user?.username})</span>
                  </span>
                ) : (
                  <span className="text-xs bg-purple-500/15 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    <span>صلاحية الإدارة العامة: استعراض وإشراف كامل الفروع</span>
                  </span>
                )}

                <span className="text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                  {visibleScopeOrders.length} طلب بالفرع
                </span>

                {syncStatus === 'synced' && (
                  <span className="text-xs bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span>متصل بالسيرفر المركزي</span>
                  </span>
                )}
                {syncStatus === 'saving' && (
                  <span className="text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>جاري المزامنة...</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
                نظام تنظيمي متكامل مفصول لكل فرع (الرئيسي، الرواف، كيا) مع تبويب مخصص لطلبيات استيراد كوريا التي تستغرق قرابة شهر
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Reports & Demand Intelligence Button (For Admin / Owner / Purchasing Manager) */}
            {(!assignedBranch || user?.role === 'OWNER' || user?.role === 'PURCHASING_MANAGER' || user?.role === 'ADMIN') && (
              <button
                onClick={() => navigate('/customer-orders/reports')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all cursor-pointer active:scale-95"
                title="مركز تقارير طلبات العملاء وتوصيات المخزون الدائم (للمشتريات والمالية)"
              >
                <TrendingUp className="w-4 h-4 text-purple-200" />
                <span>تقارير القطع وتوصيات المخزون</span>
              </button>
            )}

            <button
              onClick={() => {
                setSyncStatus('saving');
                syncCustomerOrdersFromServer().then((d) => {
                  setOrders(d);
                  setSyncStatus('synced');
                  showToast('تمت مزامنة الطلبات مع الخادم');
                });
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="تحديث البيانات من السيرفر"
            >
              <RefreshCw className="w-4 h-4" />
              <span>مزامنة</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة طلب عميل جديد</span>
            </button>
          </div>
        </div>

        {/* ── KPI Status Bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800">
          {/* Active Orders Total */}
          <div
            onClick={() => {
              setStatusFilter('ALL');
              setOrderTypeFilter('ALL');
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'ALL' && orderTypeFilter === 'ALL'
                ? 'bg-slate-800 border-blue-500/50 shadow-md ring-1 ring-blue-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>الطلبات الجارية النشطة</span>
              <Boxes className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">{stats.activeOrders}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">تحت الطلب والتجهيز والفرع</div>
          </div>

          {/* Korea Import Dedicated Card */}
          <div
            onClick={() => {
              setOrderTypeFilter('KOREA');
              setStatusFilter('ALL');
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              orderTypeFilter === 'KOREA'
                ? 'bg-blue-950/60 border-blue-400 shadow-lg shadow-blue-500/20 ring-1 ring-blue-400'
                : 'bg-gradient-to-b from-blue-950/25 to-slate-950/60 border-blue-900/50 hover:border-blue-600/60'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-blue-300 font-bold">
              <span className="flex items-center gap-1">
                <span>🇰🇷 استيراد كوريا</span>
              </span>
              <Timer className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-300 mt-1">{stats.koreaOrders}</div>
            <div className="text-[10px] text-blue-400/80 font-bold mt-0.5">شحن دولي (~ شهر)</div>
          </div>

          {/* Under Order */}
          <div
            onClick={() => setStatusFilter('UNDER_ORDER')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'UNDER_ORDER'
                ? 'bg-amber-950/40 border-amber-500/60 shadow-md shadow-amber-500/10'
                : 'bg-slate-950/60 border-slate-800 hover:border-amber-900/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-amber-300">
              <span>تحت الطلب (الأساسية)</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl sm:text-2xl font-black text-amber-400">{stats.underOrder}</span>
              {stats.overdue48h > 0 && (
                <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold animate-pulse" title="طلبات مر عليها أكثر من 48 ساعة دون إجراء">
                  ⚠️ {stats.overdue48h} متأخرة
                </span>
              )}
            </div>
            <div className="text-[10px] text-amber-300/60 mt-0.5">بانتظار التأكيد مع المورد</div>
          </div>

          {/* Ordered */}
          <div
            onClick={() => setStatusFilter('ORDERED')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'ORDERED'
                ? 'bg-blue-950/40 border-blue-500/60 shadow-md shadow-blue-500/10'
                : 'bg-slate-950/60 border-slate-800 hover:border-blue-900/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-blue-300">
              <span>تم الطلب</span>
              <Truck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-400 mt-1">{stats.ordered}</div>
            <div className="text-[10px] text-blue-300/60 mt-0.5">جاري الشحن والنقل</div>
          </div>

          {/* Arrived at Branch */}
          <div
            onClick={() => setStatusFilter('ARRIVED')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'ARRIVED'
                ? 'bg-purple-950/40 border-purple-500/60 shadow-md shadow-purple-500/10'
                : 'bg-slate-950/60 border-slate-800 hover:border-purple-900/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-purple-300">
              <span>وصلت في الفرع</span>
              <Building className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-300 mt-1 flex items-center gap-1.5">
              <span>{stats.arrived}</span>
              {stats.arrived > 0 && <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />}
            </div>
            <div className="text-[10px] text-purple-300/60 mt-0.5">جاهزة لإبلاغ العميل</div>
          </div>

          {/* Delivered / Archive */}
          <div
            onClick={() => setStatusFilter('DELIVERED')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
              statusFilter === 'DELIVERED'
                ? 'bg-emerald-950/50 border-emerald-400 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/60'
                : 'bg-slate-950/60 border-slate-800 hover:border-emerald-900/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-emerald-300">
              <span className="flex items-center gap-1 font-bold">
                <Archive className="w-3.5 h-3.5 text-emerald-400" />
                <span>أرشيف الطلبات</span>
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{stats.delivered}</div>
            <div className="text-[10px] text-emerald-300/70 mt-0.5 font-bold">المسلمة والمشحونة للعميل</div>
          </div>
        </div>
      </div>

      {/* ── 48h Overdue Action Required Notification Banner ── */}
      {stats.overdue48h > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-400/50 rounded-3xl p-4 sm:p-5 text-amber-950 shadow-md flex items-center justify-between gap-4 flex-wrap no-print animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/25 border border-amber-400/60 flex items-center justify-center shrink-0 text-xl text-amber-800 shadow-xs">
              <Clock className="w-5 h-5 text-amber-600 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-sm sm:text-base text-amber-950">
                  تنبيه متابعة: يوجد ({stats.overdue48h}) طلب عادي مر عليه أكثر من 48 ساعة دون تغيير الحالة
                </h3>
                <span className="text-[11px] bg-amber-200 text-amber-950 border border-amber-400/60 px-2.5 py-0.5 rounded-full font-bold">
                  بانتظار طلبها من المورد
                </span>
              </div>
              <p className="text-xs text-amber-900/90 mt-1">
                تنبيه للموظف: يُرجى التواصل مع المورد المعتمد وتحديث حالة الطلب إلى (تم الطلب) لضمان عدم نسيان طلبات العملاء وسرعة التسليم.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter(statusFilter === 'OVERDUE_48H' ? 'ALL' : 'OVERDUE_48H')}
            className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <span>{statusFilter === 'OVERDUE_48H' ? 'إلغاء التصفية' : 'عرض الطلبات المتأخرة فقط'}</span>
          </button>
        </div>
      )}

      {/* ── Korea Orders Special Alert Banner (Shown when Korea tab is selected) ── */}
      {orderTypeFilter === 'KOREA' && (
        <div className="bg-gradient-to-r from-blue-900/80 via-indigo-900/80 to-blue-900/80 border border-blue-500/40 rounded-3xl p-4 sm:p-5 text-white shadow-xl flex items-center justify-between gap-4 flex-wrap no-print">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shrink-0 text-xl">
              🇰🇷
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg">تبويب طلبيات استيراد كوريا المباشر</h3>
                <span className="text-[11px] bg-blue-400/20 text-blue-200 border border-blue-400/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  مدة التوريد: قرابة شهر (25 - 35 يوماً)
                </span>
              </div>
              <p className="text-xs text-blue-200/90 mt-1">
                طلبيات خاصة يتم شحنها واستيرادها دولياً من كوريا. يتم متابعة كل صنف وتحديد المورد والموظف المسؤول وإبلاغ العميل بالموعد عبر الواتساب فوراً.
              </p>
            </div>
          </div>
          <button
            onClick={() => setOrderTypeFilter('ALL')}
            className="text-xs text-blue-200 hover:text-white underline cursor-pointer"
          >
            عرض جميع الطلبات المحلية والكورية
          </button>
        </div>
      )}

      {/* ── Main Filter Bar & Tabs ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm no-print space-y-4">
        {/* Top Row: Search + Korea/Local Tabs + Branch Selector */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث باسم العميل، جوال الواتساب، رقم القطعة، اسم المورد، الموظف المستلم..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Korea / Local Navigation Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl shrink-0">
            <button
              onClick={() => setOrderTypeFilter('ALL')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                orderTypeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              جميع الطلبات ({visibleScopeOrders.length})
            </button>

            <button
              onClick={() => setOrderTypeFilter('LOCAL')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                orderTypeFilter === 'LOCAL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <span>🇸🇦 طلبات محلية</span>
              <span className="text-[11px] opacity-80 font-mono">({stats.localOrders})</span>
            </button>

            <button
              onClick={() => setOrderTypeFilter('KOREA')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                orderTypeFilter === 'KOREA'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              <span>🇰🇷 استيراد كوريا (~ شهر)</span>
              <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full ${orderTypeFilter === 'KOREA' ? 'bg-blue-800' : 'bg-blue-100 text-blue-900'}`}>
                {stats.koreaOrders}
              </span>
            </button>
          </div>

          {/* Branch Filter Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 font-bold shrink-0">الفرع:</span>
            {isAdmin ? (
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">جميع الفروع الميدانية (الأدمن)</option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>{assignedBranch}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status Filter Pills & View Mode Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {/* 1. All Active Orders (Default) */}
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="عرض كافة الطلبات الجارية النشطة تحت الطلب والتوريد (مستثنى منها الأرشيف)"
            >
              <span>الطلبات الجارية النشطة</span>
              <span className="opacity-80 text-[11px]">({stats.activeOrders})</span>
            </button>

            {/* 2. Specific Active Status Pills: UNDER_ORDER, ORDERED, ARRIVED */}
            {['UNDER_ORDER', 'ORDERED', 'ARRIVED'].map((key) => {
              const cfg = ORDER_STATUSES[key];
              if (!cfg) return null;
              const count = visibleScopeOrders.filter((o) => {
                if (orderTypeFilter === 'KOREA' && o.orderType !== 'KOREA') return false;
                if (orderTypeFilter === 'LOCAL' && o.orderType === 'KOREA') return false;
                return o.status === key;
              }).length;
              const active = statusFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
                  <span>{cfg.label}</span>
                  <span className="opacity-70 text-[11px]">({count})</span>
                </button>
              );
            })}

            {/* ⚠️ Overdue > 48h Special Alert Filter Tab */}
            {stats.totalOverdue > 0 && (
              <button
                onClick={() => setStatusFilter(statusFilter === 'OVERDUE_48H' ? 'ALL' : 'OVERDUE_48H')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                  statusFilter === 'OVERDUE_48H'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md ring-2 ring-amber-400/40'
                    : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 animate-pulse'
                }`}
                title="عرض الطلبات المتأخرة التي مر عليها أكثر من 48 ساعة دون إجراء"
              >
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>معلّقة &gt; 48 ساعة</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200/90 text-amber-950 font-black">
                  {stats.totalOverdue}
                </span>
              </button>
            )}

            {/* Separator */}
            <span className="text-slate-300 font-bold px-0.5">|</span>

            {/* 3. Archive Button (تم التسليم / الشحن) */}
            <button
              onClick={() => setStatusFilter('DELIVERED')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                statusFilter === 'DELIVERED'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm ring-2 ring-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
              title="عرض أرشيف الطلبات المسلمة والمشحونة"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>الأرشيف (المسلّم والمشحون)</span>
              <span className="opacity-90 font-mono text-[11px]">({stats.delivered})</span>
            </button>

            {/* 4. All Orders Including Archive */}
            <button
              onClick={() => setStatusFilter('ALL_INCLUDING_ARCHIVE')}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                statusFilter === 'ALL_INCLUDING_ARCHIVE'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title="عرض كافة الطلبات شاملة الأرشيف"
            >
              <span>الكل شامل الأرشيف ({stats.total})</span>
            </button>
          </div>

          {/* View Mode Switcher (Per Account) */}
          <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start lg:self-auto">
            <span className="text-[11px] font-bold text-slate-500 px-1.5 hidden sm:inline">طريقة العرض:</span>
            <button
              type="button"
              onClick={() => handleViewModeChange('cards')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض بطاقات كاملة تفصيلية (الافتراضي)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>بطاقات</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('compact')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'compact'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض بطاقات صغيرة ومدمجة لتسهيل التنقل السريع"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>بطاقات صغيرة</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('list')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض جدول / قائمة سريعة للطلبات"
            >
              <List className="w-3.5 h-3.5" />
              <span>جدول / قائمة</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Orders List Presentation ── */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 no-print">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {statusFilter === 'DELIVERED'
              ? 'لا توجد طلبات في الأرشيف حالياً'
              : statusFilter === 'ALL'
              ? 'لا توجد طلبات جارية نشطة حالياً'
              : orderTypeFilter === 'KOREA'
              ? 'لا توجد طلبات استيراد كوريا مسجلة لهذا الفرع حالياً'
              : 'لا توجد طلبات عملاء مطابقة للبحث حالياً'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {statusFilter === 'DELIVERED'
              ? 'الطلبات التي يتم اعتمادها كـ (تم التسليم / الشحن) يتم حفظها ونقلها تلقائياً إلى هذا الأرشيف'
              : statusFilter === 'ALL'
              ? 'كافة طلبات العملاء إما مكتملة ومؤرشفة في الأرشيف، أو يمكنك تسجيل طلب جديد عبر الزر أدناه'
              : assignedBranch
              ? `يتم عرض الطلبات الحقيقية المسجلة في (${assignedBranch}) فقط`
              : 'يمكنك تسجيل طلب جديد وتحديد المورد لكل صنف من خلال زر «إضافة طلب عميل جديد» أعلاه'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل طلب جديد الآن</span>
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* ── MODE 2: TABLE / LIST VIEW ── */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden no-print">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">الطلب والنوع</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">العميل والفرع</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">المركبة</th>
                  <th className="py-3 px-3.5 text-right">القطع المطلوبة والموردين</th>
                  <th className="py-3 px-3.5 text-center whitespace-nowrap">المبالغ (ر.س)</th>
                  <th className="py-3 px-3.5 text-center whitespace-nowrap">الحالة الحالية</th>
                  <th className="py-3 px-3.5 text-center whitespace-nowrap">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((order) => {
                  const statusConfig = ORDER_STATUSES[order.status] || ORDER_STATUSES.UNDER_ORDER;
                  const isKorea = order.orderType === 'KOREA';
                  const delay = getOrderDelayStatus(order);
                  const waLink = generateWhatsAppLink(order.customerPhone, order.customerName, order);
                  const totalItemsCount = (order.items || []).reduce((s, it) => s + (Number(it.qty) || 1), 0);
                  const totalSelling = (order.items || []).reduce(
                    (s, it) => s + (Number(it.sellingPrice) || 0) * (Number(it.qty) || 1),
                    0
                  );
                  const deposit = Number(order.deposit) || 0;
                  const remaining = Math.max(0, totalSelling - deposit);

                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors ${
                        delay.isOverdue ? 'bg-amber-50/45 hover:bg-amber-50/70' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-3.5 align-top whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-slate-900">
                            #{order.orderNumber || order.id}
                          </span>
                          {isKorea ? (
                            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded font-bold">
                              🇰🇷 استيراد
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-bold">
                              🇸🇦 محلي
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {order.orderDate || order.createdAt?.split('T')[0]}
                        </div>
                        {delay.isOverdue && (
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${delay.badgeClass}`}
                              title={delay.description}
                            >
                              <Clock className="w-2.5 h-2.5" />
                              <span>{delay.label}</span>
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3.5 align-top">
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono text-slate-600">{order.customerPhone}</span>
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-1.5 py-0.2 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[9px] font-bold inline-flex items-center gap-0.5 shadow-xs"
                              title="فتح واتساب"
                            >
                              <MessageCircle className="w-2.5 h-2.5 fill-white" />
                              <span>واتساب</span>
                            </a>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                          {order.branch || BRANCHES[0]}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 align-top whitespace-nowrap">
                        {order.vehicleMake || order.vehicleModel ? (
                          <div>
                            <div className="font-bold text-slate-800">
                              {order.vehicleMake} {order.vehicleModel} {order.vehicleYear}
                            </div>
                            {order.vin && (
                              <div className="text-[9px] font-mono text-slate-400">
                                VIN: {order.vin}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 align-top min-w-[220px]">
                        <div className="text-[11px] font-bold text-slate-700 mb-1">
                          {order.items?.length || 0} أصناف ({totalItemsCount} حبة):
                        </div>
                        <div className="space-y-1">
                          {(order.items || []).map((it, idx) => (
                            <div key={it.id || idx} className="text-[11px] flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-900">• {it.name}</span>
                              <span className="text-[10px] text-slate-500">×{it.qty || 1}</span>
                              <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded font-bold">
                                {it.supplierName || 'مورد عام'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 align-top text-center whitespace-nowrap">
                        <div className="font-mono font-black text-slate-900 text-xs">
                          {formatSAR(totalSelling)}
                        </div>
                        <div className="text-[10px] text-emerald-700 mt-0.5">
                          العربون: {deposit > 0 ? formatSAR(deposit) : '0'}
                        </div>
                        {remaining > 0 && (
                          <div className="text-[10px] text-amber-800 font-bold">
                            المتبقي: {formatSAR(remaining)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3.5 align-top text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center gap-1">
                          <select
                            value={order.status}
                            onChange={(e) => openStatusConfirmation(order, e.target.value)}
                            className={`text-xs font-bold px-2 py-1 rounded-lg border cursor-pointer focus:outline-hidden ${statusConfig.badgeClass} bg-white shadow-xs`}
                            title="تغيير حالة الطلب - يفتح نافذة التأكيد"
                          >
                            {Object.entries(ORDER_STATUSES).map(([k, v]) => (
                              <option key={k} value={k}>
                                {v.label}
                              </option>
                            ))}
                          </select>
                          {order.status !== 'ARRIVED' && order.status !== 'DELIVERED' && (
                            <button
                              type="button"
                              onClick={() => openStatusConfirmation(order, 'ARRIVED')}
                              className="text-[10px] font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                            >
                              وصل للفرع
                            </button>
                          )}
                          {order.status !== 'DELIVERED' && (
                            <button
                              type="button"
                              onClick={() => openStatusConfirmation(order, 'DELIVERED')}
                              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                            >
                              تم التسليم
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 align-top text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handlePrintReceipt(order)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="طباعة السند"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(order)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="تعديل الطلب"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف الطلب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'compact' ? (
        /* ── MODE 3: COMPACT CARDS VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 no-print">
          {filteredOrders.map((order) => {
            const statusConfig = ORDER_STATUSES[order.status] || ORDER_STATUSES.UNDER_ORDER;
            const isKorea = order.orderType === 'KOREA';
            const delay = getOrderDelayStatus(order);
            const waLink = generateWhatsAppLink(order.customerPhone, order.customerName, order);
            const totalItemsCount = (order.items || []).reduce((s, it) => s + (Number(it.qty) || 1), 0);
            const totalSelling = (order.items || []).reduce(
              (s, it) => s + (Number(it.sellingPrice) || 0) * (Number(it.qty) || 1),
              0
            );
            const deposit = Number(order.deposit) || 0;
            const remaining = Math.max(0, totalSelling - deposit);

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 border ${
                  delay.isOverdue
                    ? delay.cardHighlight
                    : isKorea
                    ? 'border-blue-300 ring-1 ring-blue-200/50 hover:border-blue-400'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-black text-slate-900 text-xs">
                        #{order.orderNumber || order.id}
                      </span>
                      {isKorea ? (
                        <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded font-bold">
                          🇰🇷 كوريا
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-bold">
                          🇸🇦 محلي
                        </span>
                      )}
                      {delay.isOverdue && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${delay.badgeClass}`}
                          title={delay.description}
                        >
                          <Clock className="w-2.5 h-2.5" />
                          <span>{delay.label}</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {order.orderDate || order.createdAt?.split('T')[0]}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${statusConfig.badgeClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
                    <span>{statusConfig.label}</span>
                  </span>
                </div>

                {/* Customer & Branch */}
                <div className="bg-slate-50/80 rounded-xl p-2.5 space-y-1.5 text-xs border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[140px]" title={order.customerName}>
                      {order.customerName}
                    </span>
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-1.5 py-0.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-xs"
                        title="واتساب مباشر"
                      >
                        <MessageCircle className="w-2.5 h-2.5 fill-white" />
                        <span>واتساب</span>
                      </a>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-600 flex items-center justify-between">
                    <span className="font-mono">{order.customerPhone}</span>
                    <span className="font-bold text-slate-700">{order.branch || BRANCHES[0]}</span>
                  </div>

                  {(order.vehicleMake || order.vehicleModel) && (
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-0.5 border-t border-slate-200/60 truncate">
                      <Car className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {order.vehicleMake} {order.vehicleModel} {order.vehicleYear}
                      </span>
                    </div>
                  )}
                </div>

                {/* Items Mini Breakdown */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span className="flex items-center gap-1">
                      <Boxes className="w-3 h-3 text-emerald-600" />
                      <span>{order.items?.length || 0} أصناف ({totalItemsCount} حبة)</span>
                    </span>
                    <span className="font-mono text-slate-900 font-bold">{formatSAR(totalSelling)}</span>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200/70 text-[11px]">
                    {(order.items || []).slice(0, 2).map((it, idx) => (
                      <div key={it.id || idx} className="flex items-center justify-between text-[10px] gap-1">
                        <span className="truncate text-slate-800" title={it.name}>
                          • {it.name}
                        </span>
                        <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold shrink-0">
                          {it.supplierName || 'مورد عام'}
                        </span>
                      </div>
                    ))}
                    {(order.items || []).length > 2 && (
                      <div className="text-[9px] text-blue-600 font-bold text-center pt-0.5">
                        +{ (order.items || []).length - 2 } أصناف أخرى...
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial note */}
                <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1 border-t border-slate-100">
                  <span>العربون: <strong className="text-emerald-700">{deposit > 0 ? formatSAR(deposit) : '0'}</strong></span>
                  {remaining > 0 && <span>المتبقي: <strong className="text-amber-800">{formatSAR(remaining)}</strong></span>}
                </div>

                {/* Compact Footer Actions */}
                <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
                  <select
                    value={order.status}
                    onChange={(e) => openStatusConfirmation(order, e.target.value)}
                    className="text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white cursor-pointer focus:outline-hidden"
                    title="تغيير حالة الطلب - يفتح نافذة التأكيد"
                  >
                    {Object.entries(ORDER_STATUSES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePrintReceipt(order)}
                      className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                      title="طباعة"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(order)}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      title="تعديل"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── MODE 1: DETAILED CARDS VIEW (DEFAULT) ── */
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 no-print">
          {filteredOrders.map((order) => {
            const statusConfig = ORDER_STATUSES[order.status] || ORDER_STATUSES.UNDER_ORDER;
            const isKorea = order.orderType === 'KOREA';
            const delay = getOrderDelayStatus(order);
            const waLink = generateWhatsAppLink(order.customerPhone, order.customerName, order);
            const totalItemsCount = (order.items || []).reduce((s, it) => s + (Number(it.qty) || 1), 0);
            const totalSelling = (order.items || []).reduce(
              (s, it) => s + (Number(it.sellingPrice) || 0) * (Number(it.qty) || 1),
              0
            );
            const deposit = Number(order.deposit) || 0;
            const remaining = Math.max(0, totalSelling - deposit);

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 border ${
                  delay.isOverdue
                    ? delay.cardHighlight
                    : isKorea
                    ? 'border-blue-300 ring-1 ring-blue-200/60 hover:border-blue-400'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* 1. Order Header: ID, Date, Order Type Badge, Status */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-slate-900 text-sm">
                        #{order.orderNumber || order.id}
                      </span>

                      {/* Korea vs Local Badge */}
                      {isKorea ? (
                        <span className="text-[11px] bg-blue-500/15 text-blue-700 border border-blue-400/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <span>🇰🇷 استيراد كوريا مباشر</span>
                          <span className="text-[10px] text-blue-600 font-normal">(~ شهر)</span>
                        </span>
                      ) : (
                        <span className="text-[11px] bg-emerald-500/15 text-emerald-700 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                          🇸🇦 طلب محلي
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400 font-mono">
                        {order.orderDate || order.createdAt?.split('T')[0]}
                      </span>

                      {/* Overdue Alert Badge */}
                      {delay.isOverdue && (
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1.5 ${delay.badgeClass}`}
                          title={delay.description}
                        >
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>{delay.label}</span>
                        </span>
                      )}
                    </div>

                    {/* Branch and Staff Metadata */}
                    <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 font-bold text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{order.branch || BRANCHES[0]}</span>
                      </span>

                      {/* Staff Role */}
                      <span className="text-slate-400">•</span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        {order.branchStaffRole || 'موظف الفرع'}
                      </span>

                      {/* Optional Receiving Staff Name */}
                      {order.receivingStaffName && (
                        <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-indigo-600" />
                          <span>المستلم: {order.receivingStaffName}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold border flex items-center gap-1.5 ${statusConfig.badgeClass}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`} />
                      <span>{statusConfig.label}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {order.items?.length || 0} أصناف ({totalItemsCount} حبة)
                    </span>
                  </div>
                </div>

                {/* Korea Delivery Timeline Alert (for Korea Orders) */}
                {isKorea && (
                  <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-2.5 flex items-center gap-2 text-xs text-blue-900">
                    <Timer className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      <strong>مدة التوريد:</strong> استيراد دولي مباشر من كوريا ويستغرق الوصول قرابة شهر (25 إلى 35 يوماً).
                    </span>
                  </div>
                )}

                {/* 2. Customer & Vehicle Info */}
                <div className="bg-slate-50/80 rounded-2xl p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border border-slate-100">
                  {/* Customer with WhatsApp direct action */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>بيانات العميل</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">{order.customerName}</div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="font-mono font-bold text-slate-700">{order.customerPhone}</span>
                      {waLink && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                          title="فتح محادثة واتساب فورية مع رسالة تفصيلية بحالة الطلب"
                        >
                          <MessageCircle className="w-3 h-3 fill-white" />
                          <span>واتساب</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="space-y-1 border-t sm:border-t-0 sm:border-r border-slate-200/80 sm:pr-3 pt-2 sm:pt-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Car className="w-3 h-3 text-slate-500" />
                      <span>المركبة</span>
                    </div>
                    <div className="font-bold text-slate-900">
                      {order.vehicleMake || order.vehicleModel
                        ? `${order.vehicleMake || ''} ${order.vehicleModel || ''} ${order.vehicleYear || ''}`
                        : 'لم تسجل بيانات مركبة'}
                    </div>
                    {order.vin && (
                      <div className="text-[10px] font-mono text-slate-500 tracking-wider">
                        VIN: {order.vin}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Items Breakdown with Supplier Identified for Each Part */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>القطع المطلوبة والمورد المحدد لكل قطعة:</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      إجمالي البيع: <strong className="text-slate-900 font-mono">{formatSAR(totalSelling)}</strong>
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                    {(order.items || []).map((it, idx) => (
                      <div
                        key={it.id || idx}
                        className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-900">{it.name}</span>
                            {it.sku && it.sku !== '—' && (
                              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded font-bold">
                                {it.sku}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500">× {it.qty || 1} حبة</span>
                          </div>
                        </div>

                        {/* Supplier Tag for this specific item */}
                        <div className="flex items-center gap-2 shrink-0 pr-7 sm:pr-0">
                          <div className="text-left sm:text-right">
                            <div className="text-[11px] bg-amber-50 text-amber-900 border border-amber-300 rounded-lg px-2 py-0.5 font-bold flex items-center gap-1">
                              <Truck className="w-3 h-3 text-amber-600" />
                              <span>المورد: {it.supplierName || 'مورد عام'}</span>
                            </div>
                          </div>
                          {it.sellingPrice > 0 && (
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              {formatSAR(it.sellingPrice * (it.qty || 1))}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Financial Status & Notes */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] text-slate-500">العربون المستلم: </span>
                      <strong className="text-emerald-700 font-mono font-bold">
                        {deposit > 0 ? formatSAR(deposit) : 'بدون عربون'}
                      </strong>
                    </div>
                    {remaining > 0 && (
                      <div>
                        <span className="text-[10px] text-slate-500">المتبقي عند الاستلام: </span>
                        <strong className="text-amber-800 font-mono font-bold">{formatSAR(remaining)}</strong>
                      </div>
                    )}
                  </div>
                  {order.notes && (
                    <div className="text-[11px] text-slate-500 italic max-w-xs truncate" title={order.notes}>
                      ملاحظة: {order.notes}
                    </div>
                  )}
                </div>

                {/* 5. Footer Actions & Status Progression (Universal for All Accounts) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  {/* Status Direct Selector & Quick Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Direct Status Selector Dropdown */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-black text-slate-500 pr-1">الحالة:</span>
                      <select
                        value={order.status}
                        onChange={(e) => openStatusConfirmation(order, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-hidden transition-all shadow-xs ${statusConfig.badgeClass} bg-white`}
                        title="تغيير حالة الطلب - يفتح نافذة التأكيد"
                      >
                        {Object.entries(ORDER_STATUSES).map(([k, v]) => (
                          <option key={k} value={k} className="text-slate-900 bg-white font-bold py-1">
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quick Button 1: تم الوصول في الفرع (if not arrived yet) */}
                    {order.status !== 'ARRIVED' && order.status !== 'DELIVERED' && (
                      <button
                        type="button"
                        onClick={() => openStatusConfirmation(order, 'ARRIVED')}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                        title="تحديد: تم وصول القطع إلى الفرع"
                      >
                        <Boxes className="w-3.5 h-3.5" />
                        <span>تم الوصول في الفرع</span>
                      </button>
                    )}

                    {/* Quick Button 2: تم التسليم / الشحن (if not delivered yet) */}
                    {order.status !== 'DELIVERED' ? (
                      <button
                        type="button"
                        onClick={() => openStatusConfirmation(order, 'DELIVERED')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                        title="تحديد: تم التسليم أو الشحن للعميل"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تم التسليم / الشحن</span>
                      </button>
                    ) : (
                      <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>تم التسليم / الشحن بنجاح</span>
                      </span>
                    )}
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      onClick={() => handlePrintReceipt(order)}
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="طباعة سند استلام الطلب"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(order)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="تعديل الطلب"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="حذف الطلب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── STATUS CHANGE CONFIRMATION MODAL (زر تأكيد لحالة الطلب عند تغييرها) ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {statusConfirmModal.isOpen && statusConfirmModal.order && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-scale-up space-y-0">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">تأكيد تغيير حالة الطلب</h3>
                  <p className="text-xs text-slate-400">
                    طلب #{statusConfirmModal.order.orderNumber || statusConfirmModal.order.id} · {statusConfirmModal.order.branch}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatusConfirmModal({ isOpen: false, order: null, currentStatus: '', newStatus: '', note: '' })}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Order and Customer Summary */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">العميل:</span>
                  <span className="font-bold text-slate-900 text-sm">{statusConfirmModal.order.customerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">رقم الجوال:</span>
                  <span className="font-mono font-bold text-slate-700">{statusConfirmModal.order.customerPhone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">القطع المطلوبة:</span>
                  <span className="font-bold text-slate-700">{statusConfirmModal.order.items?.length || 0} أصناف</span>
                </div>
              </div>

              {/* Status Transition Visual */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-2">
                <div className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                  <span>اعتماد تغيير الحالة إلى الحالة الجديدة:</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block">الحالة الحالية</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${ORDER_STATUSES[statusConfirmModal.currentStatus]?.badgeClass || 'bg-slate-100 text-slate-700'}`}>
                      <span className={`w-2 h-2 rounded-full ${ORDER_STATUSES[statusConfirmModal.currentStatus]?.dotClass || 'bg-slate-400'}`} />
                      <span>{ORDER_STATUSES[statusConfirmModal.currentStatus]?.label || statusConfirmModal.currentStatus}</span>
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border-2 border-emerald-500 text-center space-y-1 shadow-sm">
                    <span className="text-[10px] text-emerald-600 font-bold block">الحالة الجديدة المعتمدة</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black border ${ORDER_STATUSES[statusConfirmModal.newStatus]?.badgeClass || 'bg-emerald-100 text-emerald-800'}`}>
                      <span className={`w-2 h-2 rounded-full ${ORDER_STATUSES[statusConfirmModal.newStatus]?.dotClass || 'bg-emerald-500'}`} />
                      <span>{ORDER_STATUSES[statusConfirmModal.newStatus]?.label || statusConfirmModal.newStatus}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ملاحظة تغيير الحالة (اختياري)
                </label>
                <input
                  type="text"
                  value={statusConfirmModal.note}
                  onChange={(e) => setStatusConfirmModal({ ...statusConfirmModal, note: e.target.value })}
                  placeholder="مثال: تم الاستلام في الفرع / تم الشحن للعميل..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Confirmation Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusConfirmModal({ isOpen: false, order: null, currentStatus: '', newStatus: '', note: '' })}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء التراجع
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStatusChange}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد تغيير حالة الطلب</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── CREATE / EDIT ORDER MODAL ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                  <PackageCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">
                    {editingOrder ? 'تعديل طلب العميل' : 'تسجيل طلب قطع جديد للعميل'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    الحالة الافتراضية: <strong>تحت الطلب</strong> · مع إمكانية تحديد مورد مختلف لكل صنف
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveOrder} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
              {/* Order Type Toggle: Local vs Korea */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-xs font-black text-slate-800">
                  نوع الطلب ومسار التوريد:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, orderType: 'LOCAL' })}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      formData.orderType !== 'KOREA'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">🇸🇦 طلب محلي</span>
                      <span className="text-[10px] text-emerald-700 font-normal">توريد سريع (1-3 أيام)</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      قطع متوفرة محلياً من الوكالات والمستودعات في المملكة
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, orderType: 'KOREA' })}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      formData.orderType === 'KOREA'
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">🇰🇷 استيراد كوريا مباشر</span>
                      <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-1.5 py-0.5 rounded">
                        يستغرق قرابة شهر
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      شحن دولي من كوريا (25 إلى 35 يوماً للوصول للفرع)
                    </div>
                  </button>
                </div>

                {formData.orderType === 'KOREA' && (
                  <div className="bg-blue-500/10 border border-blue-300 rounded-xl p-2.5 text-xs text-blue-900 mt-2 flex items-center gap-2">
                    <Timer className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      <strong>تنبيه المدة:</strong> طلب استيراد كوريا يحتاج قرابة شهر للوصول. يرجى تنبيه العميل بذلك وتوثيق العربون.
                    </span>
                  </div>
                )}
              </div>

              {/* Section 1: Customer Details & Branch & Staff */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>1. بيانات العميل والفرع والموظف المستلم</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اسم العميل *</label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="اسم العميل الكامل"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">رقم الواتساب / الجوال *</label>
                    <input
                      type="text"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      placeholder="05XXXXXXXX"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-hidden focus:border-emerald-500 text-left"
                    />
                  </div>

                  {/* Branch field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الفرع المسجل فيه الطلب</label>
                    {assignedBranch ? (
                      <div className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>{assignedBranch}</span>
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    ) : (
                      <select
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                      >
                        {BRANCHES.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Optional Organizational Field: Receiving Staff Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>اسم الموظف المستلم للطلب</span>
                      <span className="text-[10px] text-slate-400 font-normal">(بند تنظيمي اختياري)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.receivingStaffName}
                      onChange={(e) => setFormData({ ...formData, receivingStaffName: e.target.value })}
                      placeholder="اسم الموظف الذي استلم وسجل الطلب (اختياري)"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">صفة موظف الفرع</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.branchStaffRole || userStaffRoleTitle}
                      className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">بيانات السيارة (اختياري)</label>
                    <input
                      type="text"
                      value={formData.vehicleMake}
                      onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                      placeholder="مثال: سوناتا 2024 / أزيرا"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Items & Supplier Assignment */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-emerald-600" />
                    <span>2. القطع المطلوبة والمورد المحدد لكل صنف</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {formData.items.length} أصناف مضافة
                  </span>
                </div>

                {/* Sub-form to add item */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-300 space-y-3 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-600">
                    + إضافة صنف للطلب (بحث من الكتالوج أو كتابة يدوية):
                  </div>

                  {/* Autocomplete Search */}
                  <div className="relative">
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={(e) => {
                        setCatalogSearch(e.target.value);
                        setShowCatalogDropdown(true);
                      }}
                      onFocus={() => setShowCatalogDropdown(true)}
                      placeholder="ابحث برقم القطعة أو اسمها من قاعدة بيانات المخزون..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-blue-500"
                    />

                    {showCatalogDropdown && filteredParts.length > 0 && (
                      <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {filteredParts.map((p) => (
                          <div
                            key={p.sku}
                            onClick={() => {
                              setItemInput({
                                ...itemInput,
                                sku: p.sku || '',
                                name: p.name || '',
                                expectedCost: p.unitCost || ''
                              });
                              setCatalogSearch(`${p.sku} - ${p.name}`);
                              setShowCatalogDropdown(false);
                            }}
                            className="p-2.5 hover:bg-blue-50 cursor-pointer text-xs flex items-center justify-between"
                          >
                            <div>
                              <strong className="text-blue-700 font-mono">{p.sku}</strong>
                              <span className="text-slate-800 mx-2">{p.name}</span>
                            </div>
                            <span className="text-slate-500 font-mono font-bold">
                              {p.unitCost ? `${p.unitCost} ر.س` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">اسم القطعة / الوصف</label>
                      <input
                        type="text"
                        value={itemInput.name}
                        onChange={(e) => setItemInput({ ...itemInput, name: e.target.value })}
                        placeholder="مثال: صدام أمامي أصلي وكالة"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">رقم القطعة SKU</label>
                      <input
                        type="text"
                        value={itemInput.sku}
                        onChange={(e) => setItemInput({ ...itemInput, sku: e.target.value })}
                        placeholder="اختياري"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-0.5">الكمية</label>
                      <input
                        type="number"
                        min="1"
                        value={itemInput.qty}
                        onChange={(e) => setItemInput({ ...itemInput, qty: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-center font-bold"
                      />
                    </div>
                  </div>

                  {/* Supplier for THIS SPECIFIC ITEM */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-black text-amber-950 mb-0.5 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-amber-600" />
                        <span>المورد المطلوب منه هذه القطعة تحديداً *</span>
                      </label>
                      <div className="space-y-1">
                        <input
                          type="text"
                          list="suppliers-list"
                          value={itemInput.supplierName}
                          onChange={(e) => setItemInput({ ...itemInput, supplierName: e.target.value })}
                          placeholder="اختر من القائمة أو اكتب اسم المورد..."
                          className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-amber-500"
                        />
                        <datalist id="suppliers-list">
                          {COMMON_SUPPLIERS.map((s) => (
                            <option key={s} value={s} />
                          ))}
                        </datalist>
                        <div className="text-[10px] text-amber-800 flex items-center justify-between">
                          <span>قائمة الموردين المعتمدين ({COMMON_SUPPLIERS.length} مورد)</span>
                          <span className="text-amber-600">يمكنك الكتابة للبحث المباشر</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">سعر بيع الحبة (ر.س)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={itemInput.sellingPrice}
                        onChange={(e) => setItemInput({ ...itemInput, sellingPrice: e.target.value })}
                        placeholder="0.00"
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 text-center"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItemToForm}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إدراج القطعة في جدول الطلب</span>
                  </button>
                </div>

                {/* Table of items added in form with Inline Edit & Delete */}
                {formData.items.length > 0 && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 bg-white text-xs">
                    {formData.items.map((it, idx) => {
                      const isEditingThis = editingFormItemId === it.id;
                      if (isEditingThis) {
                        return (
                          <div key={it.id} className="p-3 bg-blue-50/70 border-b border-blue-200 space-y-2.5">
                            <div className="flex items-center justify-between text-xs font-bold text-blue-900 border-b border-blue-200 pb-1.5">
                              <div className="flex items-center gap-1.5">
                                <Edit2 className="w-3.5 h-3.5 text-blue-700" />
                                <span>تعديل الصنف #{idx + 1}: {it.name}</span>
                              </div>
                              <span className="text-[10px] text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-md font-semibold">تعديل فوري</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">اسم القطعة</label>
                                <input
                                  type="text"
                                  value={editingItemDraft.name}
                                  onChange={(e) => setEditingItemDraft({ ...editingItemDraft, name: e.target.value })}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-hidden focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">رقم القطعة SKU</label>
                                <input
                                  type="text"
                                  value={editingItemDraft.sku}
                                  onChange={(e) => setEditingItemDraft({ ...editingItemDraft, sku: e.target.value })}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold focus:outline-hidden focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">الكمية</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={editingItemDraft.qty}
                                  onChange={(e) => setEditingItemDraft({ ...editingItemDraft, qty: e.target.value })}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono text-center font-bold focus:outline-hidden focus:border-blue-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-amber-950 mb-0.5 flex items-center gap-1">
                                  <Truck className="w-3 h-3 text-amber-600" />
                                  <span>المورد المطلوب منه هذه القطعة تحديداً</span>
                                </label>
                                <input
                                  type="text"
                                  list="suppliers-list"
                                  value={editingItemDraft.supplierName}
                                  onChange={(e) => setEditingItemDraft({ ...editingItemDraft, supplierName: e.target.value })}
                                  placeholder="اختر أو اكتب اسم المورد..."
                                  className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-amber-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-700 mb-0.5">سعر بيع الحبة (ر.س)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editingItemDraft.sellingPrice}
                                  onChange={(e) => setEditingItemDraft({ ...editingItemDraft, sellingPrice: e.target.value })}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-center focus:outline-hidden focus:border-blue-500"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-blue-200">
                              <button
                                type="button"
                                onClick={handleCancelEditItem}
                                className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>إلغاء</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveItemEdit(it.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>حفظ التعديل</span>
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={it.id} className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900">
                              {idx + 1}. {it.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              SKU: {it.sku} · الكمية: {it.qty} حبة
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-bold">
                              {it.supplierName}
                            </span>
                            <span className="font-mono font-bold text-slate-900">
                              {formatSAR(it.sellingPrice * (it.qty || 1))}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEditItem(it)}
                                className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-colors cursor-pointer"
                                title="تعديل بيانات هذه القطعة (الكمية، السعر، المورد)"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveItemFromForm(it.id)}
                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-md transition-colors cursor-pointer"
                                title="حذف هذا الصنف من الطلب"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 3: Financials & Status */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>3. الحسابات وحالة الطلب</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      حالة الطلب الحالية
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer"
                    >
                      {Object.entries(ORDER_STATUSES).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-emerald-700 font-bold mt-1 block">
                      ✓ يتم تأكيد واعتماد الحالة بالضغط على زر «حفظ وتأكيد الطلب» أدناه
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      العربون المستلم (ر.س)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.deposit}
                      onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات الطلب</label>
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="مثال: العميل مستعجل / تم تحويل عربون بنكي"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer"
                >
                  حفظ وتأكيد الطلب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── PRINT RECEIPT TEMPLATE (Hidden on screen, visible on print) ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {printOrder && (
        <div id="print-receipt-section" className="hidden print:block font-sans text-black">
          <div className="border-b-2 border-black pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={doraLogo} alt="درة السيارة" className="h-16 w-auto" />
              <div>
                <h1 className="text-xl font-black">شركة درة السيارة لقطع غيار السيارات</h1>
                <div className="text-xs font-bold">
                  سند طلب قطع غيار خاص للعميل {printOrder.orderType === 'KOREA' ? '(استيراد مباشر من كوريا)' : ''}
                </div>
                <div className="text-[11px] text-slate-700">
                  سجل تجاري: 1131303965 · الرقم الضريبي: 311861381500003
                </div>
              </div>
            </div>
            <div className="text-left font-mono text-xs border border-black p-2 rounded-lg">
              <div>رقم الطلب: <strong>#{printOrder.orderNumber || printOrder.id}</strong></div>
              <div>التاريخ: {printOrder.orderDate}</div>
              <div>النوع: <strong>{printOrder.orderType === 'KOREA' ? 'استيراد كوريا (شهر)' : 'طلب محلي'}</strong></div>
              <div>الحالة: {ORDER_STATUSES[printOrder.status]?.label}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 my-4 p-3 border border-black rounded-lg text-xs">
            <div>
              <div>اسم العميل: <strong>{printOrder.customerName}</strong></div>
              <div>الجوال: <strong>{printOrder.customerPhone}</strong></div>
              <div>الفرع: <strong>{printOrder.branch}</strong></div>
              {printOrder.receivingStaffName && (
                <div>الموظف المستلم: <strong>{printOrder.receivingStaffName}</strong> ({printOrder.branchStaffRole || 'موظف الفرع'})</div>
              )}
            </div>
            <div>
              <div>المركبة: {printOrder.vehicleMake || '—'}</div>
              <div>رقم الهيكل VIN: {printOrder.vin || '—'}</div>
              <div>العربون: <strong>{formatSAR(printOrder.deposit || 0)}</strong></div>
              {printOrder.orderType === 'KOREA' && (
                <div className="text-slate-800 font-bold mt-1">
                  ⚠️ مدة التوريد: استيراد وشحن دولي من كوريا يستغرق قرابة شهر (25 إلى 35 يوماً).
                </div>
              )}
            </div>
          </div>

          <table className="w-full text-right text-xs border-collapse border border-black my-4">
            <thead>
              <tr className="bg-slate-100 border-b border-black">
                <th className="p-2 border-l border-black w-8">م</th>
                <th className="p-2 border-l border-black">القطعة / الوصف</th>
                <th className="p-2 border-l border-black">رقم القطعة SKU</th>
                <th className="p-2 border-l border-black w-14 text-center">الكمية</th>
                <th className="p-2 border-l border-black">المورد المطلوب منه</th>
                <th className="p-2 text-center w-24">السعر</th>
              </tr>
            </thead>
            <tbody>
              {(printOrder.items || []).map((it, idx) => (
                <tr key={idx} className="border-b border-slate-300">
                  <td className="p-2 border-l border-slate-300 text-center font-mono">{idx + 1}</td>
                  <td className="p-2 border-l border-slate-300 font-bold">{it.name}</td>
                  <td className="p-2 border-l border-slate-300 font-mono">{it.sku}</td>
                  <td className="p-2 border-l border-slate-300 text-center font-mono">{it.qty}</td>
                  <td className="p-2 border-l border-slate-300">{it.supplierName}</td>
                  <td className="p-2 text-center font-mono font-bold">
                    {formatSAR((it.sellingPrice || 0) * (it.qty || 1))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t-2 border-black pt-4 grid grid-cols-3 gap-6 text-center text-xs mt-12">
            <div>
              <div className="font-bold">توقيع المستلم / العميل</div>
              <div className="h-14 flex items-end justify-center text-slate-400">........................</div>
            </div>
            <div>
              <div className="font-bold">ختم الفرع</div>
              <div className="h-14 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[10px]">
                  درة السيارة
                </div>
              </div>
            </div>
            <div>
              <div className="font-bold">مسؤول المبيعات / الموظف المستلم</div>
              <div className="h-14 flex items-end justify-center text-slate-400">
                {printOrder.receivingStaffName ? `(${printOrder.receivingStaffName})` : '........................'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
