import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Building2,
  PlusCircle,
  Clock,
  Check,
  AlertTriangle,
  Search,
  Copy,
  Printer,
  Edit3,
  Lock,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  UploadCloud
} from 'lucide-react';
import doraLogo from '../assets/dora_logo.png';
import {
  BRANCH_KEYS,
  BRANCH_META,
  PRIORITY_LEVELS,
  getBranchShortagesStore,
  addShortageItem,
  updateShortageItem,
  searchCatalogParts,
  lookupCatalogPart,
  isItemEditable,
  getRemainingEditMinutes,
  subscribeToShortagesSync,
  uploadLocalShortagesToCloud,
  fetchRemoteShortagesStore
} from '../lib/branchShortagesStore';

const STAFF_PRESETS = [
  'صالح المحيميد',
  'خالد الجوعي',
  'فهد الجوعي',
  'عبد العزيز الجوعي',
  'موظف الفرع'
];

export default function BranchNotebookEntry() {
  const [searchParams, setSearchParams] = useSearchParams();
  const branchFromUrl = searchParams.get('branch');

  // Active Branch: defaults from URL or localStorage or Main
  const [activeBranch, setActiveBranch] = useState(() => {
    if (branchFromUrl && BRANCH_META[branchFromUrl]) return branchFromUrl;
    return localStorage.getItem('dora_notebook_branch') || BRANCH_KEYS.MAIN;
  });

  // Remember staff name in local storage
  const [staffName, setStaffName] = useState(() => {
    return localStorage.getItem('dora_notebook_staff_name') || 'صالح المحيميد';
  });

  // Store state
  const [store, setStore] = useState(() => getBranchShortagesStore());
  const [liveSyncActive, setLiveSyncActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState(null);

  const handleUploadLocalData = async () => {
    setIsUploading(true);
    const res = await uploadLocalShortagesToCloud();
    setIsUploading(false);
    if (res && res.count > 0) {
      setUploadFeedback(`تمت مزامنة ونقل ${res.count} صنف مسجل من هذا الجهاز إلى السحابة بنجاح!`);
    } else {
      setUploadFeedback('تم التحقق ومزامنة كافة السجلات بنجاح مع السحابة.');
    }
    setTimeout(() => setUploadFeedback(null), 5000);
    const fresh = await fetchRemoteShortagesStore();
    if (fresh) setStore(fresh);
  };

  // Subscribe to real-time cloud database sync across all 9 branch devices + Purchasing Manager
  useEffect(() => {
    const unsubscribe = subscribeToShortagesSync((freshStore) => {
      if (freshStore) {
        setStore(freshStore);
        setLiveSyncActive(true);
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Input states
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

  // Auto-save feedback animation
  const [autoSaveStatus, setAutoSaveStatus] = useState(null); // 'saving' | 'saved' | null

  // Editing modal state (1-hour window)
  const [editingItem, setEditingItem] = useState(null);
  const [editQty, setEditQty] = useState('1');
  const [editPriority, setEditPriority] = useState('NORMAL');
  const [editNotes, setEditNotes] = useState('');
  const [editPartName, setEditPartName] = useState('');

  // Search in table
  const [tableSearch, setTableSearch] = useState('');

  // Notification for parts automatically registered into inventory with zero stock
  const [newCatalogNotice, setNewCatalogNotice] = useState(null);

  // Current time state to re-evaluate remaining minutes every 60s
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Sync active branch to URL & storage
  useEffect(() => {
    localStorage.setItem('dora_notebook_branch', activeBranch);
    setSearchParams({ branch: activeBranch }, { replace: true });
    setSuggestions([]);
    setIsSuggestionsOpen(false);
  }, [activeBranch]);

  // Sync staff name to storage
  const handleSetStaffName = (name) => {
    setStaffName(name);
    localStorage.setItem('dora_notebook_staff_name', name);
  };

  // Batches for active branch
  const branchBatches = useMemo(() => {
    return store[activeBranch] || [];
  }, [store, activeBranch]);

  // Current active batch (working batch)
  const currentBatch = useMemo(() => {
    return branchBatches.find((b) => b.status === 'ACTIVE') || branchBatches[0] || null;
  }, [branchBatches]);

  // Close suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionsDropdownRef.current && !suggestionsDropdownRef.current.contains(event.target)) {
        setIsSuggestionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete typing handler
  const handlePartNumberChange = (val) => {
    setPartNumber(val);
    if (val.trim().length >= 2) {
      const matches = searchCatalogParts(val, 8);
      setSuggestions(matches);
      setIsSuggestionsOpen(matches.length > 0);
      setHighlightedIndex(-1);

      const hint = lookupCatalogPart(val);
      if (hint && !partName.trim()) {
        setPartName(hint.name);
      }
    } else {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
    }
  };

  const handleSelectSuggestion = (item) => {
    setPartNumber(item.sku);
    setPartName(item.name);
    setIsSuggestionsOpen(false);
    setSuggestions([]);
    if (qtyInputRef.current) {
      qtyInputRef.current.focus();
    }
  };

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

  // Add Item to Branch Shortages Notebook
  const handleAddItem = (e) => {
    if (e) e.preventDefault();
    if (!partNumber.trim()) return;

    setAutoSaveStatus('saving');

    const result = addShortageItem(
      activeBranch,
      {
        partNumber,
        partName: partName.trim() || 'صنف غير مسمى',
        requestedQty,
        priority,
        notes
      },
      { name: staffName || 'موظف الفرع', username: 'branch-staff' }
    );

    setStore({ ...result.store });

    if (result.isNewToInventory) {
      setNewCatalogNotice({
        sku: partNumber.trim().toUpperCase(),
        name: partName.trim() || 'صنف جديد مسجل'
      });
      setTimeout(() => setNewCatalogNotice(null), 7000);
    }

    // Reset inputs
    setPartNumber('');
    setPartName('');
    setRequestedQty('1');
    setPriority('NORMAL');
    setNotes('');

    setAutoSaveStatus('saved');
    setTimeout(() => setAutoSaveStatus(null), 2500);
  };

  // Open Edit Modal (strictly allowed within 1 hour)
  const handleOpenEdit = (item) => {
    if (!isItemEditable(item)) return;
    setEditingItem(item);
    setEditPartName(item.partName || '');
    setEditQty(String(item.requestedQty || 1));
    setEditPriority(item.priority || 'NORMAL');
    setEditNotes(item.notes || '');
  };

  // Save Edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!isItemEditable(editingItem)) {
      alert('عذراً، انتهت مهلة التعديل المسموحة (ساعة واحدة من وقت التسجيل).');
      setEditingItem(null);
      return;
    }

    const res = updateShortageItem(activeBranch, editingItem.id, {
      partName: editPartName.trim(),
      requestedQty: Math.max(1, parseInt(editQty, 10) || 1),
      priority: editPriority,
      notes: editNotes.trim()
    });

    if (res) {
      setStore({ ...res.store });
    }
    setEditingItem(null);
  };

  // Filtered items in table
  const items = currentBatch?.items || [];
  const filteredItems = useMemo(() => {
    if (!tableSearch.trim()) return items;
    const q = tableSearch.trim().toLowerCase();
    return items.filter((i) => {
      return (
        (i.partNumber || '').toLowerCase().includes(q) ||
        (i.partName || '').toLowerCase().includes(q) ||
        (i.notes || '').toLowerCase().includes(q) ||
        (i.createdByName || '').toLowerCase().includes(q)
      );
    });
  }, [items, tableSearch]);

  const totalQty = useMemo(() => {
    return items.reduce((acc, curr) => acc + (curr.requestedQty || 1), 0);
  }, [items]);

  const urgentCount = useMemo(() => {
    return items.filter((i) => i.priority === 'URGENT' || i.priority === 'CUSTOMER_REQUEST').length;
  }, [items]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 select-none pb-20" dir="rtl">

      {/* ─── SCREEN ONLY: NOT FOR PRINT ─── */}
      <div className="print:hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={doraLogo} alt="درة للسيارات" className="w-10 h-10 object-contain drop-shadow" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    دفتر نواقص الفروع الرقمي
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    مدخلات مباشرة ⚡
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  تسجيل فوري لنواقص الفروع مع حفظ تلقائي وحماية السجلات
                </p>
              </div>
            </div>

            {/* Quick Actions & Live Sync Indicator */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold"
                title="مزامنة فورية حية بين أجهزة الفروع ومدير المشتريات"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>قاعدة بيانات موحدة (مزامنة حية)</span>
              </div>

              <button
                type="button"
                onClick={handleUploadLocalData}
                disabled={isUploading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer shadow-sm"
                title="مزامنة ونقل أي نواقص مسجلة مسبقاً على هذا الجهاز إلى السحابة لتظهر لباقي الأجهزة"
              >
                <UploadCloud className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{isUploading ? 'جارٍ الرفع...' : 'رفع نواقص هذا الجهاز للسحابة ☁️'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>طباعة الكشف</span>
              </button>

              <Link
                to="/inventory/branch-shortages"
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 transition-all"
                title="لوحة مدير المشتريات والاعتمادات"
              >
                <span>لوحة الاعتمادات</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Cloud Upload Feedback Notification */}
        {uploadFeedback && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 animate-fade-in">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-800 dark:text-indigo-200 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{uploadFeedback}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setUploadFeedback(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs px-2"
              >
                إغلاق ✕
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* 1. Branch Selector & Active Staff Header */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Branch Selector Tabs */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500">اختر الفرع الحالي للتسجيل:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {Object.values(BRANCH_META).map((b) => {
                    const isSelected = activeBranch === b.id;
                    const bBatches = store[b.id] || [];
                    const bActive = bBatches.find((x) => x.status === 'ACTIVE');
                    const bCount = bActive?.items?.length || 0;
                    const theme = b.theme || {};

                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setActiveBranch(b.id)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer border ${isSelected
                            ? `${theme.activeTab} scale-[1.03]`
                            : `${theme.inactiveTab}`
                          }`}
                      >
                        <span className="text-base">{b.icon}</span>
                        <span>{b.name}</span>
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                          {bCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Staff Name Identity Selector */}
              <div className="space-y-1 md:text-left">
                <span className="text-[11px] font-bold text-slate-500">الموظف المسجل حالياً:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {STAFF_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSetStaffName(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${staffName === preset
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-white'
                        }`}
                    >
                      {preset}
                    </button>
                  ))}
                  <input
                    type="text"
                    placeholder="أو اكتب اسمك..."
                    value={staffName}
                    onChange={(e) => handleSetStaffName(e.target.value)}
                    className="w-36 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Fast Notebook Entry Card with Instant Auto-Save */}
          <div className={`p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-all ${BRANCH_META[activeBranch]?.theme?.cardBorder || 'border-t-4 border-t-blue-500'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black ${BRANCH_META[activeBranch]?.theme?.pillBg || 'bg-blue-50 text-blue-600'}`}>
                  <span className="text-base">{BRANCH_META[activeBranch]?.icon || '🏢'}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white">
                      تسجيل صنف ناقص —
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-xl text-xs font-black border ${BRANCH_META[activeBranch]?.theme?.pillBg || 'bg-blue-50 text-blue-700'}`}>
                      {BRANCH_META[activeBranch]?.name}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      (دورة طلب #{currentBatch?.batchNumber || 1})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    يحفظ النظام كل مدخلاتك لحظياً دون الحاجة لأي نقرة حفظ
                  </p>
                </div>
              </div>

              {/* Auto-save Status Indicator */}
              <div className="flex items-center gap-1.5">
                {autoSaveStatus === 'saving' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/40 animate-pulse">
                    <Clock className="w-3 h-3" />
                    <span>جارٍ الحفظ الفوري...</span>
                  </span>
                )}
                {autoSaveStatus === 'saved' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                    <Check className="w-3 h-3" />
                    <span>تم الحفظ في سجل الفرع ✓</span>
                  </span>
                )}
              </div>
            </div>

            {/* Entry Form */}
            <form onSubmit={handleAddItem} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Part Number Input with Live Autocomplete */}
                <div className="md:col-span-4 space-y-1 relative" ref={suggestionsDropdownRef}>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      رقم القطعة *
                    </label>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
                      فلترة فورية بالأرقام ⚡
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      placeholder="اكتب رقم القطعة أو الاسم (مثل 58101)..."
                      value={partNumber}
                      onChange={(e) => handlePartNumberChange(e.target.value)}
                      onKeyDown={handlePartNumberKeyDown}
                      onFocus={() => {
                        if (partNumber.trim().length >= 2 && suggestions.length > 0) {
                          setIsSuggestionsOpen(true);
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {partNumber && (
                      <button
                        type="button"
                        onClick={() => {
                          setPartNumber('');
                          setPartName('');
                          setSuggestions([]);
                          setIsSuggestionsOpen(false);
                        }}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Dropdown List */}
                  {isSuggestionsOpen && suggestions.length > 0 && (
                    <div className="absolute right-0 mt-1.5 w-full sm:w-[480px] lg:w-[540px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto custom-scrollbar animate-fade-in ring-1 ring-slate-900/5">
                      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-[11px] font-bold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          <span>أصناف متطابقة بالمخزون:</span>
                          <span className="font-mono text-blue-600 dark:text-cyan-400 font-bold">({suggestions.length} صنف)</span>
                        </span>
                        <span className="text-blue-600 dark:text-cyan-400 font-mono text-[10px] font-bold">
                          انقر للاختيار التلقائي ↵
                        </span>
                      </div>

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
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-mono font-black text-xs text-blue-700 dark:text-cyan-300 bg-blue-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-blue-200/80 dark:border-slate-700 shrink-0">
                                  {item.sku}
                                </span>
                                <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                                  {item.name}
                                </span>
                              </div>

                              <span
                                className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold shrink-0 border ${hasStock
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/50'
                                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/50'
                                  }`}
                              >
                                {hasStock ? `متوفر: ${item.totalQty}` : 'نفذ من المخزون'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] font-mono flex-wrap">
                              <span className="text-[10px] font-bold text-slate-400">أرصدة الفروع:</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                الرئيسي: <strong className={item.qtyMain > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>{item.qtyMain}</strong>
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                الرواف: <strong className={item.qtyRawaf > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>{item.qtyRawaf}</strong>
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                كيا: <strong className={item.qtySulaim > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>{item.qtySulaim}</strong>
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Part Description */}
                <div className="md:col-span-4 space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    اسم وتوصيف الصنف
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: فحمات أمامي كوري"
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Quantity */}
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
                    className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <option value="URGENT">🟡 عاجل جداً</option>
                    <option value="CUSTOMER_REQUEST">🔴 طلب عميل محدد</option>
                  </select>
                </div>
              </div>

              {/* Notes & Submit Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-9">
                  <input
                    type="text"
                    placeholder="ملاحظات الموظف / العميل (سيارة محددة، موديل، رقم شاسيه...)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <button
                    type="submit"
                    disabled={!partNumber.trim()}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50 ${BRANCH_META[activeBranch]?.theme?.submitBtn || 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'}`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>تسجيل الصنف في {BRANCH_META[activeBranch]?.name}</span>
                  </button>
                </div>
              </div>

              {/* Automatic New Catalog Registration Alert */}
              {newCatalogNotice && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-amber-800 dark:text-amber-200 flex items-center gap-2.5 text-xs font-bold animate-fade-in">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div className="leading-relaxed">
                    <span>✨ تم إدراج الصنف برقم </span>
                    <span className="font-mono text-blue-700 dark:text-cyan-300 font-black px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {newCatalogNotice.sku}
                    </span>
                    <span> تلقائياً في سجل المخزون العام كصنف جديد (برصيد 0 في المركز الرئيسي، 0 في الرواف، 0 في كيا).</span>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* 3. Table of Registered Items in Working Batch */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  النواقص المسجلة بالدفتر ({items.length} صنف)
                </h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  إجمالي القطع: {totalQty}
                </span>
                {urgentCount > 0 && (
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    عاجل: {urgentCount}
                  </span>
                )}
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="بحث في دفتر النواقص..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
                />
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-500">لا توجد نواقص مسجلة حالياً بهذا الفرع.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60 text-slate-500 dark:text-slate-400 font-bold">
                      <th className="py-3 px-4 w-12 text-center">م</th>
                      <th className="py-3 px-4">رقم القطعة</th>
                      <th className="py-3 px-4">اسم وتوصيف الصنف</th>
                      <th className="py-3 px-4 text-center">الكمية</th>
                      <th className="py-3 px-4">درجة الأهمية</th>
                      <th className="py-3 px-4">الموظف</th>
                      <th className="py-3 px-4">وقت التسجيل</th>
                      <th className="py-3 px-4">ملاحظات</th>
                      <th className="py-3 px-4 w-28 text-center">صلاحية التعديل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredItems.map((item, idx) => {
                      const prioMeta = PRIORITY_LEVELS[item.priority] || PRIORITY_LEVELS.NORMAL;
                      const editable = isItemEditable(item);
                      const remMinutes = getRemainingEditMinutes(item);

                      return (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono font-black text-blue-700 dark:text-cyan-300">{item.partNumber}</td>
                          <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span>{item.partName}</span>
                              {item.isNewToInventory && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25" title="صنف جديد أُدرج تلقائياً في سجل المخزون بلا رصيد">
                                  ✨ جديد بالمخزون (0 رصيد)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-black text-slate-900 dark:text-white">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                              {item.requestedQty}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${prioMeta.badgeClass}`}>
                              {prioMeta.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-[11px]">{item.createdByName}</td>
                          <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                            {new Date(item.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px] max-w-xs truncate">{item.notes || '--'}</td>

                          {/* 1-Hour Strict Edit Window Column (No Delete) */}
                          <td className="py-3 px-4 text-center">
                            {editable ? (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                                title={`متاح للتعديل خلال ساعة (متبقي ${remMinutes} دقيقة)`}
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>تعديل ({remMinutes} د)</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono" title="مقفلة ولا يمكن التعديل بعد مرور ساعة">
                                <Lock className="w-3 h-3" />
                                <span>مقفلة</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ─── 4. EDIT ITEM MODAL (ONLY ACTIVE WITHIN 1 HOUR) ─── */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in print:hidden">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl p-6 space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  تعديل الصنف المسجل (متاح خلال ساعة)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                متبقي {getRemainingEditMinutes(editingItem)} دقيقة
              </span>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">رقم القطعة (ثابت):</label>
                <div className="font-mono font-black text-sm text-blue-700 dark:text-cyan-300 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
                  {editingItem.partNumber}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">اسم الصنف:</label>
                <input
                  type="text"
                  value={editPartName}
                  onChange={(e) => setEditPartName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">الكمية:</label>
                  <input
                    type="number"
                    min="1"
                    value={editQty}
                    onChange={(e) => setEditQty(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">درجة الأهمية:</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="NORMAL">⚪ عادي</option>
                    <option value="URGENT">🟡 عاجل جداً</option>
                    <option value="CUSTOMER_REQUEST">🔴 طلب عميل</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">ملاحظات إضافية:</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md transition-all cursor-pointer"
                >
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 5. OFFICIAL PRINTABLE DOCUMENT (A4 EXECUTIVE DESIGN) ─── */}
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
            <span className="text-base font-black text-slate-900 font-mono">{items.length} صنف</span>
          </div>
          <div>
            <span className="text-slate-500 block">إجمالي كميات القطع</span>
            <span className="text-base font-black text-slate-900 font-mono">{totalQty} قطعة</span>
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
            {items.map((item, index) => (
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
            <span className="font-bold text-slate-700 block">مسؤول تسجيل الفرع:</span>
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
