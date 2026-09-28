import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Building2,
  PlusCircle,
  Trash2,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Clock,
  Search,
  Copy,
  Check,
  Send,
  Sparkles,
  Layers,
  ChevronDown,
  Info,
  UserCheck,
  Tag,
  ArrowRight,
  Scale,
  FileSpreadsheet,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import doraLogo from '../assets/dora_logo.png';
import { useBIAuth } from '../auth/BIAuthContext';
import {
  BRANCH_KEYS,
  BRANCH_META,
  PRIORITY_LEVELS,
  getBranchShortagesStore,
  getActiveBatchForBranch,
  getAllBatchesForBranch,
  addShortageItem,
  deleteShortageItem,
  finalizeAndOrderBatch,
  lookupCatalogPart,
  searchCatalogParts,
  exportShortagesBatchToExcel,
  subscribeToShortagesSync
} from '../lib/branchShortagesStore';

export default function BranchShortages() {
  const { user, permissions } = useBIAuth();

  // Authority to approve and finalize batches (Exclusively Purchasing Manager, Admin, Owner)
  const canApprove = Boolean(
    permissions?.canApproveBranchShortages ||
    user?.role === 'PURCHASING_MANAGER' ||
    user?.role === 'PURCHASING' ||
    user?.role === 'ADMIN' ||
    user?.role === 'OWNER'
  );

  // Active Branch: 'main' | 'rawaf' | 'kia'
  const [activeBranch, setActiveBranch] = useState(BRANCH_KEYS.MAIN);

  // Store state
  const [store, setStore] = useState(() => getBranchShortagesStore());

  // Real-time synchronization across all devices and branches
  useEffect(() => {
    const unsubscribe = subscribeToShortagesSync((freshStore) => {
      if (freshStore) {
        setStore(freshStore);
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Selected Batch ID for currently viewed branch
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  // Form input states
  const [partNumber, setPartNumber] = useState('');
  const [partName, setPartName] = useState('');
  const [requestedQty, setRequestedQty] = useState('1');
  const [priority, setPriority] = useState('NORMAL');
  const [notes, setNotes] = useState('');

  // Autocomplete Suggestions State
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionsDropdownRef = useRef(null);
  const qtyInputRef = useRef(null);

  // Auto-lookup hint from Dora master catalog
  const [catalogHint, setCatalogHint] = useState(null);

  // Auto-save feedback animation
  const [autoSaveStatus, setAutoSaveStatus] = useState(null); // 'saving' | 'saved' | null

  // Table search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all'); // 'all' | 'NORMAL' | 'URGENT' | 'CUSTOMER_REQUEST'
  const [copiedSku, setCopiedSku] = useState(null);

  // Modal for finalizing/ordering
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [supplierNotes, setSupplierNotes] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Reload store from local/cloud
  const refreshStore = () => {
    const updated = getBranchShortagesStore();
    setStore({ ...updated });
  };

  // Batches for current branch
  const branchBatches = useMemo(() => {
    return store[activeBranch] || [];
  }, [store, activeBranch]);

  // Current selected batch
  const currentBatch = useMemo(() => {
    if (selectedBatchId) {
      const found = branchBatches.find((b) => b.id === selectedBatchId);
      if (found) return found;
    }
    // Default to active batch
    return branchBatches.find((b) => b.status === 'ACTIVE') || branchBatches[0] || null;
  }, [branchBatches, selectedBatchId]);

  // When active branch changes, reset selectedBatchId to active
  useEffect(() => {
    const active = branchBatches.find((b) => b.status === 'ACTIVE');
    setSelectedBatchId(active ? active.id : branchBatches[0]?.id || null);
    setSearchQuery('');
    setFilterPriority('all');
    setPartNumber('');
    setPartName('');
    setCatalogHint(null);
    setSuggestions([]);
    setIsSuggestionsOpen(false);
  }, [activeBranch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionsDropdownRef.current && !suggestionsDropdownRef.current.contains(event.target)) {
        setIsSuggestionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle typing in Part Number with live filtered suggestions
  const handlePartNumberChange = (val) => {
    setPartNumber(val);
    if (val.trim().length >= 2) {
      const matches = searchCatalogParts(val, 8);
      setSuggestions(matches);
      setIsSuggestionsOpen(matches.length > 0);
      setHighlightedIndex(-1);

      // Also check exact match hint
      const hint = lookupCatalogPart(val);
      if (hint) {
        setCatalogHint(hint);
        if (!partName.trim()) {
          setPartName(hint.name);
        }
      } else {
        setCatalogHint(null);
      }
    } else {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      setCatalogHint(null);
    }
  };

  // Select a suggestion from the dropdown
  const handleSelectSuggestion = (item) => {
    setPartNumber(item.sku);
    setPartName(item.name);
    setCatalogHint(item);
    setIsSuggestionsOpen(false);
    setSuggestions([]);
    if (qtyInputRef.current) {
      qtyInputRef.current.focus();
    }
  };

  // Keyboard navigation inside suggestions
  const handlePartNumberKeyDown = (e) => {
    if (!isSuggestionsOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsSuggestionsOpen(false);
    }
  };

  // Copy SKU helper
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSku(text);
    setTimeout(() => setCopiedSku(null), 1800);
  };

  // Add Item with instant auto-save
  const handleAddItem = (e) => {
    if (e) e.preventDefault();
    if (!partNumber.trim()) return;

    setAutoSaveStatus('saving');

    const result = addShortageItem(
      activeBranch,
      {
        partNumber,
        partName: partName.trim() || catalogHint?.name || 'صنف غير مسمى',
        requestedQty,
        priority,
        notes
      },
      user
    );

    setStore({ ...result.store });
    setSelectedBatchId(result.activeBatch.id);

    // Reset inputs
    setPartNumber('');
    setPartName('');
    setRequestedQty('1');
    setPriority('NORMAL');
    setNotes('');
    setCatalogHint(null);

    // Show auto-saved feedback
    setAutoSaveStatus('saved');
    setTimeout(() => {
      setAutoSaveStatus(null);
    }, 2500);
  };

  // Delete Item
  const handleDeleteItem = (itemId) => {
    if (currentBatch?.status === 'ORDERED') return;
    const updatedStore = deleteShortageItem(activeBranch, itemId);
    if (updatedStore) {
      setStore({ ...updatedStore });
    }
  };

  // Confirm Finalize / Order with post-action: 'EXCEL' | 'PRINT' | 'CLOSE_ONLY'
  const handleConfirmOrder = (postAction = 'EXCEL') => {
    if (!currentBatch || currentBatch.status === 'ORDERED') return;
    setIsSubmittingOrder(true);

    try {
      const batchToExport = { ...currentBatch };
      const branchMeta = BRANCH_META[activeBranch];
      const res = finalizeAndOrderBatch(activeBranch, supplierNotes, user);
      if (res) {
        setStore({ ...res.store });
        setSelectedBatchId(res.newActiveBatch.id);
        setIsFinalizeModalOpen(false);
        setSupplierNotes('');

        if (postAction === 'EXCEL') {
          // Immediately trigger Excel spreadsheet download
          exportShortagesBatchToExcel(batchToExport, branchMeta);
        } else if (postAction === 'PRINT') {
          // Immediately trigger official print sheet
          setTimeout(() => {
            window.print();
          }, 350);
        }
      }
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Export current batch to Excel
  const handleExportExcel = () => {
    if (!currentBatch) return;
    exportShortagesBatchToExcel(currentBatch, BRANCH_META[activeBranch]);
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    if (!currentBatch || !currentBatch.items) return [];
    let list = currentBatch.items;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((i) => {
        return (
          (i.partNumber || '').toLowerCase().includes(q) ||
          (i.partName || '').toLowerCase().includes(q) ||
          (i.notes || '').toLowerCase().includes(q) ||
          (i.createdByName || '').toLowerCase().includes(q)
        );
      });
    }

    if (filterPriority !== 'all') {
      list = list.filter((i) => i.priority === filterPriority);
    }

    return list;
  }, [currentBatch, searchQuery, filterPriority]);

  // Batch stats
  const itemsCount = currentBatch?.items?.length || 0;
  const urgentCount = useMemo(() => {
    return (currentBatch?.items || []).filter((i) => i.priority === 'URGENT' || i.priority === 'CUSTOMER_REQUEST').length;
  }, [currentBatch]);

  const totalQtyRequested = useMemo(() => {
    return (currentBatch?.items || []).reduce((acc, curr) => acc + (curr.requestedQty || 1), 0);
  }, [currentBatch]);

  const isCurrentBatchActive = currentBatch?.status === 'ACTIVE';

  return (
    <div className="font-sans select-none pb-20" dir="rtl">
      {/* ─── SCREEN UI: HIDDEN WHEN PRINTING ─── */}
      <div className="space-y-6 print:hidden">
        {/* ─── 0. TOP NAVIGATION MODULE TABS (البحث • التقارير • مقارنة الموردين • نواقص الفروع) ─── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200 dark:border-slate-800">
          <Link
            to="/inventory/search"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all shrink-0"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>البحث وتوفر الفروع</span>
          </Link>

          <Link
            to="/inventory/reports"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>تقارير المخزون التخصصية</span>
          </Link>

          <Link
            to="/inventory/supplier-comparison"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all shrink-0"
          >
            <Scale className="w-4 h-4 text-slate-500" />
            <span>مقارنة أسعار الموردين</span>
          </Link>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black bg-blue-600 text-white shadow-md shadow-blue-600/25 ring-2 ring-blue-400/30 shrink-0">
            <ClipboardList className="w-4 h-4 text-white" />
            <span>نواقص الفروع والطلبات</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
              جديد
            </span>
          </div>
        </div>

        {/* ─── 1. HEADER SECTION ─── */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 p-6 md:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>نظام حصر النواقص والقرار النهائي للطلبات</span>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                نواقص الفروع واعتماد طلبيات الموردين
              </h1>
              <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
                تسجيل ومتابعة نواقص قطع الغيار لكل فرع بشكل مستقل مع الحفظ التلقائي اللحظي وقفل القوائم عند اعتماد الطلب.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Approval Button: EXCLUSIVE to Purchasing Manager / Admin / Owner */}
              {isCurrentBatchActive && itemsCount > 0 && canApprove && (
                <button
                  type="button"
                  onClick={() => setIsFinalizeModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-l from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-black shadow-lg shadow-emerald-900/40 border border-emerald-400/40 transition-all cursor-pointer ring-2 ring-emerald-400/20 active:scale-95"
                  title="اعتماد طلب النواقص من الموردين وقفل هذه القائمة"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>اعتماد تم الطلب من المورد</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
                    خاص بالمشتريات
                  </span>
                </button>
              )}

              {/* Status tag for branch staff (Cannot approve) */}
              {isCurrentBatchActive && itemsCount > 0 && !canApprove && (
                <div
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-800/90 text-slate-300 text-xs font-bold border border-slate-700/70 shadow-sm"
                  title="تسجيل الأصناف متاح للفرع — الاعتماد وقفل الطلب مخصص لمسؤول المشتريات"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>قيد التجميع (الاعتماد لمسؤول المشتريات)</span>
                </div>
              )}

              <Link
                to={`/branch-entry?branch=${activeBranch}`}
                target="_blank"
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-bold border border-indigo-400/30 shadow-md transition-all cursor-pointer"
                title="فتح دفتر مدخلات الفرع المباشر (بدون تسجيل دخول)"
              >
                <BookOpen className="w-4 h-4 text-indigo-200" />
                <span>دفتر مدخلات الفرع المباشر</span>
                <ExternalLink className="w-3.5 h-3.5 text-indigo-200" />
              </Link>

              <button
                type="button"
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>تصدير إكسل</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-cyan-400" />
                <span>طباعة</span>
              </button>
            </div>
          </div>

          {/* ─── 2. BRANCH SELECTOR TABS ─── */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center gap-3 overflow-x-auto pb-1">
            {Object.values(BRANCH_META).map((b) => {
              const isSelected = activeBranch === b.id;
              const bBatches = store[b.id] || [];
              const bActive = bBatches.find((x) => x.status === 'ACTIVE');
              const bCount = bActive?.items?.length || 0;

              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setActiveBranch(b.id)}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-black text-xs md:text-sm transition-all cursor-pointer shrink-0 border ${isSelected
                      ? `${b.theme?.activeTabDark || 'bg-blue-600 text-white'} scale-[1.02]`
                      : `${b.theme?.inactiveTab || 'bg-slate-800/80 text-slate-300'}`
                    }`}
                >
                  <span className="text-lg">{b.icon}</span>
                  <span>{b.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-900/80 text-slate-400 border border-slate-700'
                      }`}
                  >
                    {bCount} صنف
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── 3. EXECUTIVE MINI-KPIS & BATCH SELECTOR ─── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* KPI 1: Total Items */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span>أصناف الدورة الحالية</span>
              <Layers className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {itemsCount} <span className="text-xs font-normal text-slate-400">صنف</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              إجمالي الكميات: <span className="font-bold text-slate-200">{totalQtyRequested} قطعة</span>
            </div>
          </div>

          {/* KPI 2: Urgent Items */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span>أصناف عاجلة / طلب عميل</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {urgentCount} <span className="text-xs font-normal text-slate-400">صنف</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {urgentCount > 0 ? 'تتطلب طلب فوري ومتابعة أولوية' : 'لا توجد طلبات عاجلة متأخرة'}
            </div>
          </div>

          {/* KPI 3: Status */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span>حالة القائمة المعروضة</span>
              {isCurrentBatchActive ? (
                <Unlock className="w-4 h-4 text-emerald-400" />
              ) : (
                <Lock className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <div className="text-lg font-black font-mono">
              {isCurrentBatchActive ? (
                <span className="text-emerald-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  قيد التسجيل النشط
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  معتمدة (تم الطلب)
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              {isCurrentBatchActive ? 'مفتوحة لإضافة النواقص وتعديلها' : 'للقراءة والطباعة فقط'}
            </div>
          </div>

          {/* KPI 4: Batch Selector & History */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
              <span>الدورات وقوائم الطلب</span>
              <Clock className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="relative">
              <select
                value={currentBatch?.id || ''}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {branchBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.status === 'ACTIVE' ? '🟢 [الحالية النشطة] ' : '🔒 [معتمدة ومقفلة] '}
                    دورة #{b.batchNumber} ({b.items?.length || 0} صنف)
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[10px] text-slate-400 font-mono truncate">
              {currentBatch?.status === 'ORDERED' && currentBatch.orderedAt
                ? `طُلبت: ${new Date(currentBatch.orderedAt).toLocaleDateString('ar-SA')} بواسطة ${currentBatch.orderedByName || 'المدير'}`
                : `بدأت: ${new Date(currentBatch?.createdAt || Date.now()).toLocaleDateString('ar-SA')}`}
            </div>
          </div>
        </div>

        {/* ─── 4. QUICK AUTO-SAVING ENTRY FORM (ONLY WHEN BATCH IS ACTIVE) ─── */}
        {isCurrentBatchActive ? (
          <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-black">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    تسجيل قطعة ناقصة في {BRANCH_META[activeBranch]?.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    الحفظ يتم تلقائياً وفورياً لجميع الحقول والبيانات
                  </p>
                </div>
              </div>

              {/* Live Auto-Save Indicator */}
              <div className="flex items-center gap-1.5">
                {autoSaveStatus === 'saving' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-800/40 animate-pulse">
                    <Clock className="w-3 h-3" />
                    <span>جارٍ الحفظ...</span>
                  </span>
                )}
                {autoSaveStatus === 'saved' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/40">
                    <Check className="w-3 h-3" />
                    <span>تم الحفظ تلقائياً ✓</span>
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Part Number with Smart Branch Stock Filter & Autocomplete */}
                <div className="md:col-span-4 space-y-1 relative" ref={suggestionsDropdownRef}>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      رقم القطعة (Part Number) *
                    </label>
                    <span className="text-[10px] text-cyan-500 dark:text-cyan-400 font-bold">
                      فلترة ذكية بأرقام المخزون ⚡
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      placeholder="اكتب رقم القطعة أو الاسم (مثال: 58101 أو فحمات)..."
                      value={partNumber}
                      onChange={(e) => handlePartNumberChange(e.target.value)}
                      onKeyDown={handlePartNumberKeyDown}
                      onFocus={() => {
                        if (partNumber.trim().length >= 2 && suggestions.length > 0) {
                          setIsSuggestionsOpen(true);
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {partNumber && (
                      <button
                        type="button"
                        onClick={() => {
                          setPartNumber('');
                          setPartName('');
                          setCatalogHint(null);
                          setSuggestions([]);
                          setIsSuggestionsOpen(false);
                        }}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5 text-xs cursor-pointer"
                        title="مسح الحقل"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Dropdown List - Premium Theme Adaptive Design */}
                  {isSuggestionsOpen && suggestions.length > 0 && (
                    <div className="absolute right-0 mt-1.5 w-full sm:w-[480px] lg:w-[540px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto custom-scrollbar animate-fade-in ring-1 ring-slate-900/5">
                      {/* Header bar */}
                      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-[11px] font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          <span className="text-slate-700 dark:text-slate-300">أصناف متطابقة بالمخزون:</span>
                          <span className="font-mono text-blue-600 dark:text-cyan-400 font-bold">({suggestions.length} صنف)</span>
                        </span>
                        <span className="text-blue-600 dark:text-cyan-400 font-mono text-[10px] font-bold">
                          انقر للاختيار التلقائي ↵
                        </span>
                      </div>

                      {/* Suggestions Rows */}
                      {suggestions.map((item, index) => {
                        const isHighlighted = highlightedIndex === index;
                        const hasStock = item.totalQty > 0;

                        return (
                          <button
                            key={item.sku + index}
                            type="button"
                            onClick={() => handleSelectSuggestion(item)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            className={`w-full text-right p-3.5 transition-all flex flex-col gap-2 cursor-pointer ${isHighlighted
                                ? 'bg-blue-50/90 dark:bg-blue-950/50 border-r-4 border-blue-600'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                              }`}
                          >
                            {/* Top Row: Part SKU + Name + Overall Stock Badge */}
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-mono font-black text-xs text-blue-700 dark:text-cyan-300 bg-blue-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-blue-200/80 dark:border-slate-700 shrink-0">
                                  {item.sku}
                                </span>
                                <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                                  {item.name}
                                </span>
                              </div>

                              {/* Status Badge */}
                              <span
                                className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold shrink-0 border ${hasStock
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/50'
                                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/50'
                                  }`}
                              >
                                {hasStock ? `متوفر: ${item.totalQty}` : 'نفذ من المخزون'}
                              </span>
                            </div>

                            {/* Bottom Row: Branch by branch stock tags */}
                            <div className="flex items-center gap-2 text-[10px] font-mono flex-wrap">
                              <span className="text-[10px] font-bold text-slate-400">أرصدة الفروع:</span>

                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                <span>الرئيسي:</span>
                                <strong className={item.qtyMain > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
                                  {item.qtyMain}
                                </strong>
                              </span>

                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                <span>الرواف:</span>
                                <strong className={item.qtyRawaf > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
                                  {item.qtyRawaf}
                                </strong>
                              </span>

                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                <span>كيا:</span>
                                <strong className={item.qtySulaim > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
                                  {item.qtySulaim}
                                </strong>
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Part Description / Name */}
                <div className="md:col-span-4 space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    اسم وتوصيف القطعة
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: قماش فرامل أمامي كوري"
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Requested Quantity */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    الكمية المطلوبة
                  </label>
                  <input
                    ref={qtyInputRef}
                    type="number"
                    min="1"
                    value={requestedQty}
                    onChange={(e) => setRequestedQty(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Priority */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    درجة الأهمية
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="NORMAL">⚪ عادي (طلب دوري)</option>
                    <option value="URGENT">🟡 عاجل جداً (نقص حرج)</option>
                    <option value="CUSTOMER_REQUEST">🔴 طلب عميل محدد</option>
                  </select>
                </div>
              </div>

              {/* Notes & Submit Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-9">
                  <input
                    type="text"
                    placeholder="ملاحظات إضافية (مثل: اسم العميل، سيارة محددة، موديل...)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={!partNumber.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>تسجيل القطعة وحفظها</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Catalog auto-lookup hint alert */}
            {catalogHint && (
              <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-800/40 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-blue-200">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    تم التعرف على الصنف بمخزون درة: <strong>{catalogHint.name}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-300 font-mono text-[11px] shrink-0">
                  <span>رصيد الفرع الرئيسي: <strong>{catalogHint.qtyMain}</strong></span>
                  <span>فرع الرواف: <strong>{catalogHint.qtyRawaf}</strong></span>
                  <span>فرع السليم: <strong>{catalogHint.qtySulaim}</strong></span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Read-Only Locked Batch Banner */
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <span>هذه القائمة معتمدة ومقفلة (تم الطلب من المورد)</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/50">
                    دورة رقم #{currentBatch?.batchNumber}
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  تم اعتمادها بتاريخ {currentBatch?.orderedAt ? new Date(currentBatch.orderedAt).toLocaleString('ar-SA') : '--'} بواسطة {currentBatch?.orderedByName || 'مدير المشتريات'}.
                  القائمة متاحة للعرض والطباعة والتصدير فقط.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const active = branchBatches.find((b) => b.status === 'ACTIVE');
                if (active) setSelectedBatchId(active.id);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              <span>العودة للقائمة النشطة</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ─── 5. SHORTAGES ITEMS TABLE ─── */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Table Filter & Search Header */}
          <div className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                قائمة النواقص المسجلة ({filteredItems.length} صنف)
              </h3>
              {filterPriority !== 'all' && (
                <span className="text-xs font-bold text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded-lg border border-blue-800/40">
                  مفلترة
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="بحث برقم الصنف أو الاسم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
                />
              </div>

              {/* Filter Priority */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">كافة الأولويات</option>
                <option value="URGENT">🟡 عاجل جداً</option>
                <option value="CUSTOMER_REQUEST">🔴 طلبات عملاء</option>
                <option value="NORMAL">⚪ طلبات عادية</option>
              </select>
            </div>
          </div>

          {/* Table Content */}
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <ClipboardList className="w-6 h-6" />
              </div>
              <p className="text-slate-400 text-xs font-bold">
                لا توجد نواقص مسجلة حالياً في هذه القائمة لـ {BRANCH_META[activeBranch]?.name}.
              </p>
              {isCurrentBatchActive && (
                <p className="text-[11px] text-slate-500">
                  يمكن للموظفين استخدام شريط الإدخال في الأعلى لتسجيل الأصناف الناقصة وسيتم حفظها فوراً.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60 text-slate-500 dark:text-slate-400 font-bold">
                    <th className="py-3 px-4 w-12 text-center">م</th>
                    <th className="py-3 px-4">رقم القطعة</th>
                    <th className="py-3 px-4">اسم وتوصيف الصنف</th>
                    <th className="py-3 px-4 text-center">الكمية المطلوبة</th>
                    <th className="py-3 px-4">درجة الأهمية</th>
                    <th className="py-3 px-4">ملاحظات</th>
                    <th className="py-3 px-4">الموظف المسجل</th>
                    <th className="py-3 px-4">تاريخ التسجيل</th>
                    {isCurrentBatchActive && <th className="py-3 px-4 w-16 text-center">إجراء</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredItems.map((item, idx) => {
                    const prioMeta = PRIORITY_LEVELS[item.priority] || PRIORITY_LEVELS.NORMAL;
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        {/* Row No */}
                        <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                          {idx + 1}
                        </td>

                        {/* Part Number */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-slate-900 dark:text-cyan-300">
                              {item.partNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(item.partNumber)}
                              className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                              title="نسخ رقم القطعة"
                            >
                              {copiedSku === item.partNumber ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Part Name */}
                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                          {item.partName || '--'}
                        </td>

                        {/* Requested Quantity */}
                        <td className="py-3 px-4 text-center font-mono font-black text-slate-900 dark:text-white">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            {item.requestedQty}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${prioMeta.badgeClass}`}
                          >
                            <span>{prioMeta.label}</span>
                          </span>
                        </td>

                        {/* Notes */}
                        <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                          {item.notes || '--'}
                        </td>

                        {/* Created By */}
                        <td className="py-3 px-4 text-slate-300 font-bold text-[11px]">
                          {item.createdByName || 'موظف الفرع'}
                        </td>

                        {/* Date & Time */}
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(item.createdAt).toLocaleDateString('ar-SA', {
                            day: 'numeric',
                            month: 'short'
                          })}{' '}
                          <span className="text-slate-500 text-[10px]">
                            {new Date(item.createdAt).toLocaleTimeString('ar-SA', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </td>

                        {/* Actions */}
                        {isCurrentBatchActive && (
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="حذف هذا الصنف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─── 6. CONFIRMATION MODAL FOR PURCHASING MANAGER: FINALIZE & ORDER ─── */}
        {isFinalizeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 md:p-7 space-y-5 text-right">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                  <span>صلاحية حصرية لمسؤول المشتريات والإدارة</span>
                </div>
                <h3 className="text-xl font-black text-white">
                  اعتماد طلب نواقص {BRANCH_META[activeBranch]?.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                  اختر الإجراء المطلوب؛ سيتم اعتماد الطلبية وقفل الدورة الحالية مع فتح دورة جديدة فارغة للفرع تلقائياً.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">الفرع الميداني:</span>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span>{BRANCH_META[activeBranch]?.icon}</span>
                    <span>{BRANCH_META[activeBranch]?.name}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">عدد الأصناف وإجمالي القطع:</span>
                  <span className="font-mono font-bold text-cyan-300">{itemsCount} صنف ({totalQtyRequested} قطعة)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">الموظف المعتمد:</span>
                  <span className="font-bold text-emerald-400">{user?.name || 'مسؤول المشتريات'}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">
                  ملاحظات المورد أو رقم أمر الشراء (اختياري):
                </label>
                <textarea
                  rows={2}
                  placeholder="مثال: تم إرسال الطلبية لشركة بدر الوادي وحصون برقم أمر 961..."
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotes(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* ACTION SELECTION BUTTONS */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400 block">
                  اختر طريقة إنهاء الاعتماد والإجراء الفوري:
                </span>

                {/* Option 1: Approve + Export Excel */}
                <button
                  type="button"
                  onClick={() => handleConfirmOrder('EXCEL')}
                  disabled={isSubmittingOrder}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/40 border border-emerald-400/40 transition-all cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black flex items-center gap-1.5">
                        <span>اعتماد وتصدير إلى إكسل فوراً (.xlsx)</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white/20 font-mono">شائع</span>
                      </div>
                      <div className="text-[11px] text-emerald-100">
                        قفل الدورة وتحميل ملف الإكسل المنظم لإرساله للموردين
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:-translate-x-1 transition-transform" />
                </button>

                {/* Option 2: Approve + Print Official Sheet */}
                <button
                  type="button"
                  onClick={() => handleConfirmOrder('PRINT')}
                  disabled={isSubmittingOrder}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-l from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-900/40 border border-blue-400/40 transition-all cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Printer className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black">
                        اعتماد وطباعة الكشف الرسمي فوراً (A4)
                      </div>
                      <div className="text-[11px] text-blue-100">
                        قفل الدورة وفتح نافذة الطباعة الرسمية للختم والتوقيع
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-cyan-200 group-hover:-translate-x-1 transition-transform" />
                </button>

                {/* Option 3: Approve Only */}
                <button
                  type="button"
                  onClick={() => handleConfirmOrder('CLOSE_ONLY')}
                  disabled={isSubmittingOrder}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>اعتماد وقفل القائمة فقط في النظام (بدون تصدير)</span>
                </button>
              </div>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setIsFinalizeModalOpen(false)}
                  disabled={isSubmittingOrder}
                  className="w-full py-2.5 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold border border-slate-800 transition-all cursor-pointer"
                >
                  إلغاء وتراجع
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── OFFICIAL PRINTABLE DOCUMENT (A4 EXECUTIVE DESIGN) ─── */}
      <div className="hidden print:block p-8 bg-white text-slate-950 font-sans" dir="rtl">
        {/* Official Letterhead */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={doraLogo} alt="درة للسيارات" className="w-16 h-16 object-contain" />
            <div>
              <h1 className="text-xl font-black text-slate-900">شركة درة السيارة للتجارة</h1>
              <h2 className="text-sm font-bold text-slate-600">سجل حصر النواقص واعتماد طلبيات الموردين</h2>
              <p className="text-xs text-slate-500 font-bold">{BRANCH_META[activeBranch]?.fullName}</p>
            </div>
          </div>

          <div className="text-left text-xs font-mono space-y-1">
            <div className="font-bold">رقم الدورة: #{currentBatch?.batchNumber || 1}</div>
            <div>تاريخ الطباعة: {new Date().toLocaleDateString('ar-SA')}</div>
            <div>وقت الطباعة: {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</div>
            <div>حالة القائمة: {currentBatch?.status === 'ORDERED' ? 'معتمدة (تم الطلب)' : 'قيد التسجيل النشط'}</div>
          </div>
        </div>

        {/* Summary Stats Box */}
        <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-xl border border-slate-300 bg-slate-50 text-center text-xs">
          <div>
            <span className="text-slate-500 block">إجمالي الأصناف المطلوبة</span>
            <span className="text-base font-black text-slate-900 font-mono">{(currentBatch?.items || []).length} صنف</span>
          </div>
          <div>
            <span className="text-slate-500 block">إجمالي كميات القطع</span>
            <span className="text-base font-black text-slate-900 font-mono">{totalQtyRequested} قطعة</span>
          </div>
          <div>
            <span className="text-slate-500 block">القطع العاجلة والحرجة</span>
            <span className="text-base font-black text-slate-900 font-mono">{urgentCount} صنف</span>
          </div>
        </div>

        {/* Official Table */}
        <table className="w-full text-right border-collapse text-xs mb-8">
          <thead>
            <tr className="border-y-2 border-slate-900 bg-slate-100 text-slate-900 font-black">
              <th className="py-2.5 px-3 w-10 text-center border-l border-slate-300">م</th>
              <th className="py-2.5 px-3 border-l border-slate-300">رقم القطعة</th>
              <th className="py-2.5 px-3 border-l border-slate-300">اسم وتوصيف الصنف</th>
              <th className="py-2.5 px-3 text-center border-l border-slate-300 w-16">الكمية</th>
              <th className="py-2.5 px-3 border-l border-slate-300 w-24">درجة الأهمية</th>
              <th className="py-2.5 px-3 border-l border-slate-300 w-28">الموظف المسجل</th>
              <th className="py-2.5 px-3 border-l border-slate-300 w-24">وقت التسجيل</th>
              <th className="py-2.5 px-3">ملاحظات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300 border-b-2 border-slate-900">
            {(currentBatch?.items || []).map((item, index) => (
              <tr key={item.id} className="odd:bg-white even:bg-slate-50/50">
                <td className="py-2 px-3 text-center font-mono border-l border-slate-300">{index + 1}</td>
                <td className="py-2 px-3 font-mono font-black border-l border-slate-300">{item.partNumber}</td>
                <td className="py-2 px-3 font-bold border-l border-slate-300">{item.partName}</td>
                <td className="py-2 px-3 text-center font-mono font-bold border-l border-slate-300">{item.requestedQty}</td>
                <td className="py-2 px-3 border-l border-slate-300">
                  {PRIORITY_LEVELS[item.priority]?.label || item.priority}
                </td>
                <td className="py-2 px-3 border-l border-slate-300 font-bold">{item.createdByName}</td>
                <td className="py-2 px-3 font-mono text-[11px] border-l border-slate-300">
                  {new Date(item.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-2 px-3 text-[11px]">{item.notes || '--'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Sign-off & Approval Section */}
        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-300 text-xs">
          <div className="p-4 rounded-xl border border-slate-300 space-y-8">
            <span className="font-bold text-slate-700 block">مسؤول الفرع:</span>
            <div className="border-t border-dashed border-slate-400 pt-2 flex justify-between text-slate-500">
              <span>التوقيع: .....................</span>
              <span>التاريخ: ............</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-300 space-y-8">
            <span className="font-bold text-slate-700 block">اعتماد مدير المشتريات:</span>
            <div className="border-t border-dashed border-slate-400 pt-2 flex justify-between text-slate-500">
              <span>التوقيع: .....................</span>
              <span>التاريخ: ............</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-300 space-y-8 text-center">
            <span className="font-bold text-slate-700 block">الختم الرسمي للشركة:</span>
            <div className="h-10 flex items-center justify-center text-slate-400 italic">
              (ختم درة السيارة)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
