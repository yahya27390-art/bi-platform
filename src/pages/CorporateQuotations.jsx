import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  Plus,
  Trash2,
  Search,
  Building2,
  Car,
  User,
  Hash,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  ShieldCheck,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Clock,
  BadgePercent,
  FileSpreadsheet,
  Eye,
  Edit3,
  Archive,
  Save,
  RotateCcw,
  Boxes,
  Maximize2,
  Minimize2,
  Cloud,
  RefreshCw,
  FolderOpen,
  FilePlus,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import doraLogo from '../assets/dora_logo.png';
import { tafqeetSAR } from '../lib/tafqeet';
import { formatSAR, formatNum } from '../lib/kpiEngine';
import { getAllInventoryParts, registerInventoryItemIfNotExists } from '../lib/customInventoryStore';
import {
  getSavedQuotations,
  saveQuotations,
  upsertQuotation,
  deleteQuotation,
  generateQuoteNumber,
  createBlankQuotation,
  duplicateQuotation,
  syncQuotationsFromDatabase,
  DORA_TO_ALANDIMAJ_QUOTATION,
  DORA_TO_AZERA_2026_QUOTATION,
  OUR_COMPANY_VERIFIED,
  CLIENT_COMPANY_ALANDIMAJ,
  ITEMS_FROM_PAPER_TWO
} from '../lib/corporateQuotesStore';

export default function CorporateQuotations() {
  // View mode: 'preview' (Official Document View) | 'builder' (Interactive editor)
  const [viewMode, setViewMode] = useState('preview');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeBuilderTab, setActiveBuilderTab] = useState('items'); // 'client' | 'vehicle' | 'terms' | 'items'

  // Saved quotations list & current quote
  const [savedQuotes, setSavedQuotes] = useState(getSavedQuotations);
  const [currentQuote, setCurrentQuote] = useState(() => {
    const list = getSavedQuotations();
    const base = list[0] || DORA_TO_AZERA_2026_QUOTATION;
    return {
      ...base,
      ourCompany: {
        ...OUR_COMPANY_VERIFIED,
        ...(base.ourCompany || {})
      }
    };
  });

  const [toastMsg, setToastMsg] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'saving' | 'offline'

  // Search catalog state
  const [catalogSearch, setCatalogSearch] = useState('');
  const [allCatalogParts, setAllCatalogParts] = useState([]);
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false);

  // Manual new item form
  const [newItemForm, setNewItemForm] = useState({
    sku: '',
    name: '',
    brand: 'وكالة',
    unit: 'حبه',
    qty: 1,
    unitPrice: '',
    discount: 0,
    vatRate: 15,
    saveToCatalog: true
  });

  // Load catalog parts & sync with Cloud / Hostinger
  useEffect(() => {
    try {
      const parts = getAllInventoryParts();
      setAllCatalogParts(parts || []);
    } catch (e) {
      console.warn('Failed to load inventory parts:', e);
    }

    // Initial background sync from Hostinger & Supabase
    syncQuotationsFromDatabase()
      .then((quotes) => {
        if (Array.isArray(quotes) && quotes.length > 0) {
          setSavedQuotes(quotes);
          setSyncStatus('synced');
        }
      })
      .catch((err) => {
        console.warn('Sync failed:', err);
        setSyncStatus('offline');
      });

    // Listen to quote updates across tabs or stores
    const handleQuotesUpdated = (e) => {
      if (Array.isArray(e.detail) && e.detail.length > 0) {
        setSavedQuotes(e.detail);
      }
    };
    window.addEventListener('dora-quotes-updated', handleQuotesUpdated);
    return () => window.removeEventListener('dora-quotes-updated', handleQuotesUpdated);
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Filtered catalog parts for autocomplete
  const filteredCatalogParts = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return allCatalogParts
      .filter((p) => {
        const skuMatch = p.sku && String(p.sku).toLowerCase().includes(q);
        const nameMatch = p.name && String(p.name).toLowerCase().includes(q);
        return skuMatch || nameMatch;
      })
      .slice(0, 15);
  }, [catalogSearch, allCatalogParts]);

  // Calculated items strictly following Paper 1 format with VAT-INCLUSIVE prices
  const calculatedItems = useMemo(() => {
    return (currentQuote.items || []).map((item, idx) => {
      const qty = Math.max(1, Number(item.qty) || 1);
      // The price is VAT-inclusive as specified from Paper 2
      const unitPriceInclusive = Number(item.priceInclusive ?? item.unitPriceInclusive ?? item.unitPrice ?? 0);
      const totalWithVat = Number((unitPriceInclusive * qty).toFixed(2));
      const totalBeforeTax = Number((totalWithVat / 1.15).toFixed(2));
      const vatAmount = Number((totalWithVat - totalBeforeTax).toFixed(2));
      const unitPriceBeforeTax = Number((totalBeforeTax / qty).toFixed(2));

      return {
        ...item,
        index: idx + 1,
        qty,
        unitPriceInclusive,
        priceInclusive: unitPriceInclusive,
        unitPriceBeforeTax,
        unitPrice: unitPriceBeforeTax,
        totalBeforeTax,
        vatRatePercent: '15%',
        vatAmount,
        totalWithVat
      };
    });
  }, [currentQuote.items]);

  // Overall financial totals
  const totals = useMemo(() => {
    let totalBeforeTax = 0;
    let totalVat = 0;
    let totalWithVat = 0;
    let totalUnits = 0;

    for (const item of calculatedItems) {
      totalBeforeTax += item.totalBeforeTax;
      totalVat += item.vatAmount;
      totalWithVat += item.totalWithVat;
      totalUnits += item.qty;
    }

    return {
      totalBeforeTax,
      totalVat,
      totalWithVat,
      totalUnits,
      itemCount: calculatedItems.length
    };
  }, [calculatedItems]);

  const tafqeetText = useMemo(() => {
    return tafqeetSAR(totals.totalWithVat);
  }, [totals.totalWithVat]);

  // Field updaters for sub-objects
  const updateClientField = (field, val) => {
    setCurrentQuote((prev) => ({
      ...prev,
      clientCompany: {
        ...(prev.clientCompany || {}),
        [field]: val
      }
    }));
  };

  const updateVehicleField = (field, val) => {
    setCurrentQuote((prev) => ({
      ...prev,
      vehicle: {
        ...(prev.vehicle || {}),
        [field]: val
      }
    }));
  };

  const updateQuoteMetaField = (field, val) => {
    setCurrentQuote((prev) => ({
      ...prev,
      [field]: val
    }));
  };

  const updateItemField = (id, field, value) => {
    setCurrentQuote((prev) => ({
      ...prev,
      items: (prev.items || []).map((it) => {
        if (it.id !== id) return it;
        if (field === 'priceInclusive' || field === 'unitPrice') {
          const num = Number(value) || 0;
          return { ...it, priceInclusive: num, unitPrice: num };
        }
        return { ...it, [field]: value };
      })
    }));
  };

  const removeItem = (id) => {
    setCurrentQuote((prev) => ({
      ...prev,
      items: (prev.items || []).filter((it) => it.id !== id)
    }));
    showToast('تم حذف البند');
  };

  // Select item from catalog
  const handleSelectCatalogItem = (part) => {
    const price = part.unitCost ? Number((part.unitCost * 1.35).toFixed(2)) : 50;
    const newItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      sku: part.sku || '',
      name: part.name || 'قطعة غيار وكالة',
      brand: 'وكالة',
      unit: part.unit || 'حبه',
      qty: 1,
      priceInclusive: price,
      unitPrice: price,
      vatRate: 15
    };

    setCurrentQuote((prev) => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));

    setCatalogSearch('');
    setShowCatalogDropdown(false);
    showToast(`تمت إضافة الصنف [${part.sku}] بنجاح`);
  };

  // Add manual item
  const handleAddManualItem = (e) => {
    if (e) e.preventDefault();
    if (!newItemForm.name.trim()) {
      showToast('يرجى كتابة اسم الصنف / الوصف');
      return;
    }

    const price = Number(newItemForm.unitPrice) || 0;
    const qty = Math.max(1, Number(newItemForm.qty) || 1);

    const newItem = {
      id: 'manual-' + Date.now(),
      sku: newItemForm.sku.trim() || `PART-${Date.now().toString().slice(-4)}`,
      name: newItemForm.name.trim(),
      brand: newItemForm.brand.trim() || 'وكالة',
      unit: newItemForm.unit.trim() || 'حبه',
      qty,
      priceInclusive: price,
      unitPrice: price,
      vatRate: 15
    };

    if (newItemForm.saveToCatalog && newItem.sku) {
      try {
        registerInventoryItemIfNotExists({
          sku: newItem.sku,
          name: newItem.name,
          staffName: 'عروض أسعار الشركات',
          notes: `أضيف من عرض السعر ${currentQuote.quoteNumber}`
        });
      } catch (err) {
        console.warn('Catalog save error:', err);
      }
    }

    setCurrentQuote((prev) => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));

    setNewItemForm({
      sku: '',
      name: '',
      brand: 'وكالة',
      unit: 'حبه',
      qty: 1,
      unitPrice: '',
      discount: 0,
      vatRate: 15,
      saveToCatalog: true
    });

    showToast('تمت إضافة الصنف بنجاح');
  };

  // Save current quote to Hostinger / Supabase & localStorage
  const handleSaveQuote = async () => {
    setIsSaving(true);
    setSyncStatus('saving');
    try {
      const toSave = {
        ...currentQuote,
        totals
      };
      const saved = await upsertQuotation(toSave);
      setCurrentQuote(saved);
      
      // Sync with cloud server and update state
      const syncedList = await syncQuotationsFromDatabase();
      const updatedList = Array.isArray(syncedList) && syncedList.length > 0 ? syncedList : getSavedQuotations();
      setSavedQuotes(updatedList);
      
      const foundInSynced = updatedList.find(q => q.id === saved.id || q.quoteNumber === saved.quoteNumber);
      if (foundInSynced) {
        setCurrentQuote(foundInSynced);
      }
      
      setSyncStatus('synced');
      showToast(`✓ تم حفظ عرض السعر [${saved.quoteNumber}] ومزامنته سحابياً بنجاح`);
    } catch (err) {
      console.error(err);
      setSyncStatus('offline');
      showToast('تم الحفظ محلياً في جهازك');
    } finally {
      setIsSaving(false);
    }
  };

  // Create new blank quote
  const handleCreateNew = async () => {
    const blank = createBlankQuotation();
    await upsertQuotation(blank);
    setSavedQuotes(getSavedQuotations());
    setCurrentQuote(blank);
    setViewMode('builder');
    setActiveBuilderTab('client');
    showToast(`تم فتح عرض سعر جديد فارغ رقم ${blank.quoteNumber}`);
  };

  // Duplicate current quote
  const handleDuplicate = async () => {
    const copy = duplicateQuotation(currentQuote);
    await upsertQuotation(copy);
    setSavedQuotes(getSavedQuotations());
    setCurrentQuote(copy);
    setViewMode('builder');
    showToast(`تم نسخ العرض وتوليد رقم جديد [${copy.quoteNumber}]`);
  };

  // Switch to another saved quote
  const handleSelectQuote = (quoteId) => {
    const found = savedQuotes.find((q) => q.id === quoteId);
    if (found) {
      setCurrentQuote(found);
      showToast(`تم فتح عرض السعر رقم ${found.quoteNumber}`);
    }
  };

  // Delete current quote
  const handleDeleteCurrentQuote = async () => {
    if (savedQuotes.length <= 1) {
      showToast('لا يمكن حذف العرض الأخير في النظام');
      return;
    }
    if (window.confirm(`هل أنت متأكد من حذف عرض السعر رقم ${currentQuote.quoteNumber}؟`)) {
      const remaining = await deleteQuotation(currentQuote.id);
      setSavedQuotes(remaining);
      setCurrentQuote(remaining[0] || DORA_TO_ALANDIMAJ_QUOTATION);
      showToast('تم حذف عرض السعر بنجاح');
    }
  };

  // Reset to authentic default template (Alandimaj 31 items)
  const handleResetToDefault = async () => {
    if (window.confirm('هل تريد استعادة النموذج المعتمد الأصلي لشركة الاندماج (31 صنفاً)؟')) {
      setCurrentQuote(DORA_TO_ALANDIMAJ_QUOTATION);
      await upsertQuotation(DORA_TO_ALANDIMAJ_QUOTATION);
      setSavedQuotes(getSavedQuotations());
      showToast('تم استعادة العرض المعتمد الأصلي (31 صنفاً)');
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    try {
      const rows = calculatedItems.map((item) => ({
        'م': item.index,
        'رقم القطعة SKU': item.sku || '',
        'البند الوصف': item.name,
        'السعر Price (قبل الضريبة)': Number(item.unitPriceBeforeTax.toFixed(2)),
        'الكمية Qty': item.qty,
        'المجموع قبل الضريبه Total Before Tax': Number(item.totalBeforeTax.toFixed(2)),
        'نسبة الضريبه VAT 15%': '15%',
        'قيمة الضريبه VAT Amount': Number(item.vatAmount.toFixed(2)),
        'المجموع مع الضريبه Total With VAT': Number(item.totalWithVat.toFixed(2))
      }));

      rows.push({});
      rows.push({
        'البند الوصف': 'المجموع قبل الضريبه Total Before Tax',
        'المجموع مع الضريبه Total With VAT': Number(totals.totalBeforeTax.toFixed(2))
      });
      rows.push({
        'البند الوصف': 'ضريبة القيمة المضافة VAT 15%',
        'المجموع مع الضريبه Total With VAT': Number(totals.totalVat.toFixed(2))
      });
      rows.push({
        'البند الوصف': 'المجموع النهائي مع الضريبه Total With VAT',
        'المجموع مع الضريبه Total With VAT': Number(totals.totalWithVat.toFixed(2))
      });
      rows.push({
        'البند الوصف': 'المبلغ كتابة باللغة العربية',
        'المجموع مع الضريبه Total With VAT': tafqeetText
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'عرض سعر درة للسيارات');
      XLSX.writeFile(wb, `عرض_سعر_${currentQuote.quoteNumber}_درة_للسيارات.xlsx`);
      showToast('تم تصدير ملف الإكسل بنجاح');
    } catch (e) {
      console.error(e);
      showToast('حدث خطأ أثناء تصدير ملف الإكسل');
    }
  };

  const handlePrint = () => {
    setViewMode('preview');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className={`space-y-6 pb-20 text-right font-sans ${isFullScreen ? 'fixed inset-0 z-50 bg-slate-950/95 overflow-y-auto p-4 sm:p-8' : ''}`} dir="rtl">
      {/* ── Print Specific Stylesheet (Guarantees 100% Clean A4 Output) ── */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 8mm 10mm 8mm;
          }
          html, body, #root, #root > div, .min-h-screen, .bi-main-content, main, .print-container-wrapper, .print-a4-sheet {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 10px !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            min-width: 0 !important;
            overflow: visible !important;
            overflow-x: visible !important;
            overflow-y: visible !important;
            height: auto !important;
            max-height: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          aside,
          header,
          nav,
          .no-print,
          .print-hidden-important,
          [data-sidebar] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .bi-main-content {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow: visible !important;
          }
          .print-container-wrapper {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .print-a4-sheet {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            min-height: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .print-table td, .print-table th {
            padding: 3.5px 5px !important;
            font-size: 9px !important;
            line-height: 1.25 !important;
            border: 1px solid #94a3b8 !important;
          }
          .print-table th {
            background-color: #f1f5f9 !important;
            font-weight: 800 !important;
            color: #0f172a !important;
          }
          .print-table tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-table thead {
            display: table-header-group !important;
          }
          .print-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 no-print">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-bold">{toastMsg}</span>
        </div>
      )}

      {/* ── Control Action Toolbar (Hidden on Print) ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl no-print max-w-[1050px] mx-auto space-y-4">
        {/* Top Row: Title, Quote Selector, Cloud Indicator */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-2 shadow-lg shadow-blue-500/20 shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-white">
                  عروض أسعار الشركات B2B · درة السيارة
                </h1>
                <span className="text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  {calculatedItems.length} أصناف
                </span>
                {syncStatus === 'synced' && (
                  <span className="text-[11px] bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                    <Cloud className="w-3 h-3 text-blue-400" />
                    <span>متصل بقاعدة البيانات</span>
                  </span>
                )}
                {syncStatus === 'saving' && (
                  <span className="text-[11px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>جاري المزامنة السحابية...</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                العرض النشط: <strong className="text-slate-200">#{currentQuote.quoteNumber}</strong> · المستفيد: <span className="text-emerald-400 font-bold">{currentQuote.clientCompany?.name || 'شركة عميل جديدة'}</span> · المركبة: <span className="text-blue-300">{currentQuote.vehicle?.make} {currentQuote.vehicle?.model} {currentQuote.vehicle?.year}</span>
              </p>
            </div>
          </div>

          {/* Quote Selection Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[240px]">
              <select
                value={currentQuote.id}
                onChange={(e) => handleSelectQuote(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                {savedQuotes.map((q) => (
                  <option key={q.id} value={q.id}>
                    #{q.quoteNumber} - {q.clientCompany?.name ? q.clientCompany.name.slice(0, 24) : 'عرض جديد'} ({q.items?.length || 0} صنف)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleCreateNew}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer transition-all active:scale-95"
              title="إنشاء عرض سعر جديد فارغ"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>جديد</span>
            </button>
          </div>
        </div>

        {/* Second Row: Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* View Mode Toggle */}
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center text-xs">
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>معاينة العرض A4</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('builder')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'builder'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل بيانات العرض والبنود</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Save to DB Button */}
            <button
              type="button"
              onClick={handleSaveQuote}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جاري الحفظ...' : 'حفظ في قاعدة البيانات'}</span>
            </button>

            {/* Duplicate Button */}
            <button
              type="button"
              onClick={handleDuplicate}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="نسخ العرض الحالي لعميل أو سيارة أخرى"
            >
              <Copy className="w-3.5 h-3.5 text-blue-400" />
              <span>نسخ العرض</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow-xs active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>طباعة / PDF</span>
            </button>

            {/* Export Excel */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>إكسل</span>
            </button>

            {/* Reset to authentic sample */}
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="استعادة عرض شركة الاندماج الأصلي (31 صنفاً)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>النموذج الأصلي</span>
            </button>

            {/* Delete Quote */}
            {savedQuotes.length > 1 && (
              <button
                type="button"
                onClick={handleDeleteCurrentQuote}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs cursor-pointer"
                title="حذف هذا العرض"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs cursor-pointer"
              title={isFullScreen ? "خروج من وضع التركيز" : "معاينة كاملة على الشاشة"}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── BUILDER & ITEM MANAGER (When in builder mode) ──────────── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {viewMode === 'builder' && (
        <div className="space-y-5 no-print max-w-[1050px] mx-auto">
          {/* Builder Sub-Navigation Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveBuilderTab('items')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all ${
                activeBuilderTab === 'items'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>جدول البنود والأسعار ({calculatedItems.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveBuilderTab('client')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all ${
                activeBuilderTab === 'client'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>بيانات العميل والشركة المستفيدة</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveBuilderTab('vehicle')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all ${
                activeBuilderTab === 'vehicle'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>بيانات المركبة والعملية (الهيكل واللوحة)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveBuilderTab('terms')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer transition-all ${
                activeBuilderTab === 'terms'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>تفاصيل العرض والشروط والمدة</span>
            </button>
          </div>

          {/* ── TAB 1: CLIENT DETAILS EDITOR ── */}
          {activeBuilderTab === 'client' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>تعديل بيانات الشركة المستفيدة / العميل (Client Info)</span>
                </h3>
                <span className="text-xs text-slate-400">تظهر في البطاقة اليمنى بالوثيقة الرسمية</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-bold">اسم الشركة (عربي) *</label>
                  <input
                    type="text"
                    value={currentQuote.clientCompany?.name || ''}
                    onChange={(e) => updateClientField('name', e.target.value)}
                    placeholder="مثال: شركة الاندماج الاولي لصيانة السيارات"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-bold">اسم الشركة (English)</label>
                  <input
                    type="text"
                    value={currentQuote.clientCompany?.nameEn || ''}
                    onChange={(e) => updateClientField('nameEn', e.target.value)}
                    placeholder="e.g. Alandimaj Alawwali For Cars Maintenance"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-bold">الرقم الضريبي للعميل (15 رقماً) *</label>
                  <input
                    type="text"
                    value={currentQuote.clientCompany?.vatNumber || ''}
                    onChange={(e) => updateClientField('vatNumber', e.target.value)}
                    placeholder="312765772600003"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-blue-400 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-bold">رقم الهاتف / الجوال *</label>
                  <input
                    type="text"
                    value={currentQuote.clientCompany?.phone || ''}
                    onChange={(e) => updateClientField('phone', e.target.value)}
                    placeholder="966553979299"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-300 block mb-1 font-bold">العنوان الوطني / التفصيلي *</label>
                  <input
                    type="text"
                    value={currentQuote.clientCompany?.address || ''}
                    onChange={(e) => updateClientField('address', e.target.value)}
                    placeholder="بريدة - الشارع التجاري (7541Al Anbar AL TILIFZYUN DIST 55422)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-bold">عناية المهندس / الشخص المسؤول</label>
                  <input
                    type="text"
                    value={currentQuote.clientCompany?.attn || ''}
                    onChange={(e) => updateClientField('attn', e.target.value)}
                    placeholder="م. فهد التويجري / إدارة الصيانة والتشغيل"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-bold">رقم السجل التجاري للعميل (اختياري)</label>
                  <input
                    type="text"
                    value={currentQuote.clientCompany?.crNumber || ''}
                    onChange={(e) => updateClientField('crNumber', e.target.value)}
                    placeholder="1131054321"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveQuote}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ بيانات العميل في قاعدة البيانات</span>
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 2: VEHICLE & WORK ORDER EDITOR ── */}
          {activeBuilderTab === 'vehicle' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-400" />
                  <span>تعديل بيانات المركبة والعملية (Vehicle & Work Order)</span>
                </h3>
                <span className="text-xs text-slate-400">تظهر في البطاقة اليسرى بالوثيقة الرسمية</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-bold">الشركة الصانعة (Make)</label>
                  <input
                    type="text"
                    value={currentQuote.vehicle?.make || ''}
                    onChange={(e) => updateVehicleField('make', e.target.value)}
                    placeholder="هيونداي"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-bold">طراز السيارة (Model)</label>
                  <input
                    type="text"
                    value={currentQuote.vehicle?.model || ''}
                    onChange={(e) => updateVehicleField('model', e.target.value)}
                    placeholder="أكسنت"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-bold">سنة الصنع / الموديل</label>
                  <input
                    type="text"
                    value={currentQuote.vehicle?.year || ''}
                    onChange={(e) => updateVehicleField('year', e.target.value)}
                    placeholder="2022"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-bold">لوحة السيارة</label>
                  <input
                    type="text"
                    value={currentQuote.vehicle?.plate || ''}
                    onChange={(e) => updateVehicleField('plate', e.target.value)}
                    placeholder="ر د ص - 6651"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-300 block mb-1 font-bold">رقم الهيكل VIN (الشاسي) *</label>
                  <input
                    type="text"
                    value={currentQuote.vehicle?.vin || ''}
                    onChange={(e) => updateVehicleField('vin', e.target.value.toUpperCase())}
                    placeholder="MALC741B4PM337075"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono font-black uppercase text-xs focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-bold">رقم أمر العمل (Work Order)</label>
                  <input
                    type="text"
                    value={currentQuote.vehicle?.workOrderNo || ''}
                    onChange={(e) => updateVehicleField('workOrderNo', e.target.value)}
                    placeholder="00268224"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-bold">قراءة العداد (KM)</label>
                  <input
                    type="text"
                    value={currentQuote.vehicle?.odometer || ''}
                    onChange={(e) => updateVehicleField('odometer', e.target.value)}
                    placeholder="136,369 كم"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-bold">الفرع المسؤول</label>
                  <input
                    type="text"
                    value={currentQuote.vehicle?.branch || ''}
                    onChange={(e) => updateVehicleField('branch', e.target.value)}
                    placeholder="بريدة"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveQuote}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ بيانات المركبة في قاعدة البيانات</span>
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 3: QUOTE DETAILS & TERMS EDITOR ── */}
          {activeBuilderTab === 'terms' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>تعديل تفاصيل العرض والتواريخ والشروط (Quote Metadata & Terms)</span>
                </h3>
                <span className="text-xs text-slate-400">تظهر في ترويسة العرض والشروط البنكية</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-bold">رقم عرض السعر *</label>
                    <button
                      type="button"
                      onClick={() => updateQuoteMetaField('quoteNumber', generateQuoteNumber())}
                      className="text-[10px] text-blue-400 hover:underline cursor-pointer"
                    >
                      توليد رقم تلقائي
                    </button>
                  </div>
                  <input
                    type="text"
                    value={currentQuote.quoteNumber || ''}
                    onChange={(e) => updateQuoteMetaField('quoteNumber', e.target.value)}
                    placeholder="00834"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-blue-400 font-mono font-black focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-bold">تاريخ إصدار العرض *</label>
                  <input
                    type="date"
                    value={currentQuote.issueDate || ''}
                    onChange={(e) => updateQuoteMetaField('issueDate', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-bold">مدة سريان العرض (بالأيام) *</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={currentQuote.validDays || 4}
                    onChange={(e) => updateQuoteMetaField('validDays', Number(e.target.value) || 4)}
                    placeholder="4"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-slate-300 block mb-1 font-bold">شروط الضمان والبنك والملاحظات</label>
                  <textarea
                    rows={3}
                    value={currentQuote.notes || ''}
                    onChange={(e) => updateQuoteMetaField('notes', e.target.value)}
                    placeholder="عرض سعر مقدم من شركة درة السيارة لقطع غيار السيارات. الأسعار شاملة ضريبة القيمة المضافة 15% وسارية لمدة 4 أيام من تاريخه."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveQuote}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ الشروط في قاعدة البيانات</span>
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 4: ITEMS MANAGEMENT (Default) ── */}
          {activeBuilderTab === 'items' && (
            <div className="space-y-4">
              {/* Item Insertion Form: Catalog Search OR Manual Add */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-blue-400" />
                  <span>إضافة صنف جديد لعرض السعر (من الكتالوج المسجل أو يدوياً)</span>
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Option A: Catalog Search */}
                  <div className="bg-slate-800/40 border border-blue-500/30 rounded-2xl p-4 space-y-2.5">
                    <span className="text-xs font-bold text-blue-400 block">
                      1. اختيار صنف مسجل في مستودعات درة للسيارات:
                    </span>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="ابحث برقم القطعة (SKU) أو الاسم (مثلاً: 86842, صدام, فحمات)..."
                        value={catalogSearch}
                        onChange={(e) => {
                          setCatalogSearch(e.target.value);
                          setShowCatalogDropdown(true);
                        }}
                        onFocus={() => setShowCatalogDropdown(true)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500"
                      />

                      {showCatalogDropdown && filteredCatalogParts.length > 0 && (
                        <div className="absolute top-full right-0 left-0 mt-1 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-800">
                          {filteredCatalogParts.map((p) => (
                            <div
                              key={p.sku}
                              onClick={() => handleSelectCatalogItem(p)}
                              className="p-2.5 hover:bg-blue-600/20 cursor-pointer flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-mono font-bold text-blue-400">{p.sku}</span>
                                <span className="text-white mr-2">{p.name}</span>
                              </div>
                              <span className="text-emerald-400 font-bold font-mono">+ إضافة</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Option B: Manual Add */}
                  <div className="bg-slate-800/40 border border-emerald-500/30 rounded-2xl p-4 space-y-2.5">
                    <span className="text-xs font-bold text-emerald-400 block">
                      2. إضافة صنف يدوي جديد بالكامل:
                    </span>
                    <form onSubmit={handleAddManualItem} className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="رقم الصنف SKU"
                          value={newItemForm.sku}
                          onChange={(e) => setNewItemForm({ ...newItemForm, sku: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white uppercase focus:outline-hidden focus:border-emerald-500"
                        />
                        <input
                          type="text"
                          placeholder="اسم الصنف / البيان *"
                          value={newItemForm.name}
                          onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                          className="col-span-2 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="الكمية"
                          value={newItemForm.qty}
                          onChange={(e) => setNewItemForm({ ...newItemForm, qty: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white"
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="السعر الشامل ر.س *"
                          value={newItemForm.unitPrice}
                          onChange={(e) => setNewItemForm({ ...newItemForm, unitPrice: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-mono text-emerald-400"
                        />
                        <button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-md cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إضافة للبند</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Quick Editable Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>جدول البنود التفاعلي ({calculatedItems.length} صنف)</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveQuote}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>حفظ التعديلات</span>
                    </button>
                    <span className="text-xs text-slate-400">يمكنك تعديل الكمية والسعر الشامل مباشرة</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-800 text-slate-300 font-bold border-b border-slate-700">
                      <tr>
                        <th className="p-2.5 w-10 text-center">م</th>
                        <th className="p-2.5">رقم القطعة (SKU)</th>
                        <th className="p-2.5">الوصف والبيان</th>
                        <th className="p-2.5 w-24 text-center">السعر الشامل ر.س</th>
                        <th className="p-2.5 w-20 text-center">الكمية</th>
                        <th className="p-2.5 text-center">قبل الضريبة</th>
                        <th className="p-2.5 text-center">ضريبة 15%</th>
                        <th className="p-2.5 text-center font-bold text-emerald-400">الإجمالي مع الضريبة</th>
                        <th className="p-2.5 w-10 text-center">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {calculatedItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/40">
                          <td className="p-2.5 text-center font-mono text-slate-500">{item.index}</td>
                          <td className="p-2.5 font-mono font-bold text-blue-400">
                            <input
                              type="text"
                              value={item.sku || ''}
                              onChange={(e) => updateItemField(item.id, 'sku', e.target.value)}
                              className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 font-mono text-blue-400 text-xs font-bold"
                            />
                          </td>
                          <td className="p-2.5 font-medium text-white">
                            <input
                              type="text"
                              value={item.name || ''}
                              onChange={(e) => updateItemField(item.id, 'name', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                            />
                          </td>
                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              step="0.01"
                              value={item.priceInclusive}
                              onChange={(e) => updateItemField(item.id, 'priceInclusive', e.target.value)}
                              className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-emerald-400 text-xs font-bold"
                            />
                          </td>
                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => updateItemField(item.id, 'qty', e.target.value)}
                              className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-white text-xs"
                            />
                          </td>
                          <td className="p-2.5 text-center font-mono">{formatNum(item.totalBeforeTax, 2)}</td>
                          <td className="p-2.5 text-center font-mono text-slate-400">{formatNum(item.vatAmount, 2)}</td>
                          <td className="p-2.5 text-center font-mono font-bold text-emerald-400">
                            {formatNum(item.totalWithVat, 2)} ر.س
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                              title="حذف هذا البند"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ── OFFICIAL A4 PRINT DOCUMENT (ULTRA CLEAN EXECUTIVE LOOK) ── */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="max-w-[1020px] mx-auto overflow-hidden print:overflow-visible print:max-w-none print:m-0 print:p-0 print-container-wrapper">
        <div
          className={`${
            viewMode === 'preview' ? 'block' : 'hidden print:block'
          } print-a4-sheet bg-white text-slate-900 border border-slate-300 rounded-2xl p-6 sm:p-10 shadow-xl space-y-4 font-sans`}
          style={viewMode === 'preview' ? { minHeight: '297mm' } : undefined}
        >
          {/* ── 1. TOP HEADER (الترويسة الرسمية لشركة درة للسيارات) ── */}
          <div className="flex items-start justify-between border-b-2 border-slate-800 pb-3 gap-4">
            {/* Right: Company Logo & Details */}
            <div className="flex items-center gap-4">
              <img
                src={doraLogo}
                alt="درة السيارة"
                className="h-16 w-auto object-contain print:h-14 drop-shadow-xs shrink-0"
              />
              <div className="space-y-0.5">
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-tight">
                  {currentQuote.ourCompany?.companyName || 'شركة درة السيارة لقطع غيار السيارات'}
                </h1>
                <div className="text-xs font-bold text-slate-600 font-mono">
                  {currentQuote.ourCompany?.companyNameEn || 'Dorat Cars Auto Spare Parts Co.'}
                </div>
                <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-700 font-medium pt-0.5">
                  <span>سجل تجاري: <strong className="font-mono text-slate-950 font-bold">{currentQuote.ourCompany?.crNumber || '1131303965'}</strong></span>
                  <span>·</span>
                  <span>الرقم الضريبي: <strong className="font-mono text-slate-950 font-bold">{currentQuote.ourCompany?.vatNumber || '311861381500003'}</strong></span>
                </div>
                <div className="text-[11px] text-slate-700">
                  <span>{currentQuote.ourCompany?.address || 'المملكة العربية السعودية · القصيم - بريدة'}</span>
                  <span className="mx-1.5">·</span>
                  <span className="font-mono font-bold text-slate-900">هاتف: {currentQuote.ourCompany?.phone || '0539454377 - 0538834212'}</span>
                </div>
              </div>
            </div>

            {/* Left: Document Badge */}
            <div className="text-left font-sans shrink-0 bg-slate-50 border border-slate-300 rounded-xl p-3 print:bg-transparent min-w-[190px]">
              <div className="text-base font-black text-slate-950">
                عرض سعر
              </div>
              <div className="text-xs font-bold text-slate-600 uppercase font-mono tracking-wider">
                Quotation / Estimate
              </div>
              <div className="mt-1 pt-1 border-t border-slate-200 text-xs space-y-0.5 font-mono">
                <div>رقم العرض: <strong className="text-blue-900 font-black">{currentQuote.quoteNumber}</strong></div>
                <div>التاريخ: <strong className="text-slate-900">{currentQuote.issueDate}</strong></div>
                <div className="text-[10px] text-slate-500 font-sans">
                  المدة: سارٍ لمدة {currentQuote.validDays || 4} أيام
                </div>
                <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-1.5 py-0.5 mt-1 text-center font-sans print:border-slate-300 print:bg-transparent">
                  الأسعار شاملة ضريبة 15%
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. METADATA CARDS: CLIENT VS VEHICLE (مقسم بشكل أفقي منظم ومتزن) ── */}
          <div className="border border-slate-800 rounded-xl overflow-hidden grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-800 text-xs">
            {/* Right Card: العميل / المستفيد (Client Company) */}
            <div className="p-3.5 space-y-1.5 bg-slate-50/30 print:bg-transparent">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="font-black text-slate-900 text-xs">العميل / مقدم له العرض (Client)</span>
                <span className="text-[10px] text-slate-500 font-mono">Corporate Account</span>
              </div>
              <div className="text-sm font-black text-slate-950 pt-0.5">
                {currentQuote.clientCompany?.name || 'شركة عميل جديدة'}
              </div>
              {currentQuote.clientCompany?.nameEn && (
                <div className="text-[10px] text-slate-500 font-mono">
                  {currentQuote.clientCompany.nameEn}
                </div>
              )}
              <div className="space-y-0.5 pt-1 text-[11px] text-slate-700">
                <div>الرقم الضريبي : <strong className="font-mono text-slate-950 font-bold">{currentQuote.clientCompany?.vatNumber || '—'}</strong></div>
                <div>العنوان : {currentQuote.clientCompany?.address || '—'}</div>
                <div>هاتف : <strong className="font-mono text-slate-950 font-bold">{currentQuote.clientCompany?.phone || '—'}</strong></div>
                {currentQuote.clientCompany?.attn && (
                  <div>عناية : <span className="font-medium text-slate-900">{currentQuote.clientCompany.attn}</span></div>
                )}
              </div>
            </div>

            {/* Left Card: Vehicle & Work Order (بيانات السيارة وأمر العمل) */}
            <div className="p-3.5 space-y-1.5 bg-slate-50/30 print:bg-transparent">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="font-black text-slate-900 text-xs">بيانات السيارة والعملية (Vehicle Details)</span>
                <span className="text-[10px] font-mono text-slate-600">
                  {currentQuote.vehicle?.workOrderNo ? `Work order: ${currentQuote.vehicle.workOrderNo}` : ''}
                </span>
              </div>
              <table className="w-full text-right text-[11px] mt-1">
                <tbody>
                  <tr>
                    <td className="py-0.5 text-slate-600 w-24">نوع السيارة:</td>
                    <td className="py-0.5 font-bold text-slate-950">
                      {currentQuote.vehicle?.make || ''} {currentQuote.vehicle?.model || ''}
                    </td>
                    <td className="py-0.5 text-slate-600 w-20">الموديل:</td>
                    <td className="py-0.5 font-mono font-bold text-slate-950">
                      {currentQuote.vehicle?.year || '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-0.5 text-slate-600">لوحة السيارة:</td>
                    <td className="py-0.5 font-bold text-slate-950">
                      {currentQuote.vehicle?.plate || '—'}
                    </td>
                    <td className="py-0.5 text-slate-600">الفرع:</td>
                    <td className="py-0.5 font-bold text-slate-950">
                      {currentQuote.vehicle?.branch || 'بريدة'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-0.5 text-slate-600">العداد KM:</td>
                    <td className="py-0.5 font-mono font-bold text-slate-950">
                      {currentQuote.vehicle?.odometer || '—'}
                    </td>
                    <td className="py-0.5 text-slate-600">أمر العمل:</td>
                    <td className="py-0.5 font-mono font-bold text-slate-950">
                      {currentQuote.vehicle?.workOrderNo || '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-0.5 text-slate-600">رقم الهيكل VIN:</td>
                    <td colSpan="3" className="py-0.5 font-mono font-black text-slate-950 uppercase tracking-wider text-[11px]">
                      {currentQuote.vehicle?.vin || '—'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 3. ITEMS TABLE (EXACT 7 COLUMNS AS IN PAPER 1 - BEAUTIFULLY SPACED) ── */}
          <div className="border border-slate-800 rounded-xl overflow-hidden print:overflow-visible print:border-none print:rounded-none mt-2">
            <table className="w-full text-right text-[11px] border-collapse print-table">
              <thead className="bg-slate-100 text-slate-950 font-black border-b border-slate-800">
                <tr>
                  <th className="p-2 border-l border-slate-300 w-8 text-center">م</th>
                  <th className="p-2 border-l border-slate-300">البند الوصف</th>
                  <th className="p-2 border-l border-slate-300 w-24 text-center">
                    السعر<br/><span className="font-mono font-normal text-[9px] text-slate-600">Price (Excl. VAT)</span>
                  </th>
                  <th className="p-2 border-l border-slate-300 w-14 text-center">
                    الكمية<br/><span className="font-mono font-normal text-[9px] text-slate-600">Qty</span>
                  </th>
                  <th className="p-2 border-l border-slate-300 w-24 text-center">
                    المجموع قبل الضريبه<br/><span className="font-mono font-normal text-[9px] text-slate-600">Total Before Tax</span>
                  </th>
                  <th className="p-2 border-l border-slate-300 w-16 text-center">
                    نسبه الضريبه<br/><span className="font-mono font-normal text-[9px] text-slate-600">VAT 15%</span>
                  </th>
                  <th className="p-2 border-l border-slate-300 w-20 text-center">
                    قيمة الضريبه<br/><span className="font-mono font-normal text-[9px] text-slate-600">VAT Amount</span>
                  </th>
                  <th className="p-2 text-center font-black w-24">
                    المجموع مع الضريبه<br/><span className="font-mono font-normal text-[9px] text-slate-600">Total With VAT</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-900">
                {calculatedItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-6 text-center text-slate-400 font-bold">
                      لا توجد بنود مضافة في هذا العرض حالياً. يمكنك إضافة بنود من وضع التعديل.
                    </td>
                  </tr>
                ) : (
                  calculatedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-1.5 border-l border-slate-200 text-center font-mono text-slate-500">{item.index}</td>
                      <td className="p-1.5 border-l border-slate-200 font-bold text-slate-950">
                        <div className="leading-snug">{item.name}</div>
                        {item.sku && (
                          <div className="text-[10px] font-mono text-slate-500 font-normal">
                            {item.sku}
                          </div>
                        )}
                      </td>
                      <td className="p-1.5 border-l border-slate-200 text-center font-mono font-bold text-slate-900">
                        {formatNum(item.unitPriceBeforeTax, 2)}
                      </td>
                      <td className="p-1.5 border-l border-slate-200 text-center font-mono font-bold text-slate-950">
                        {item.qty}
                      </td>
                      <td className="p-1.5 border-l border-slate-200 text-center font-mono">
                        {formatNum(item.totalBeforeTax, 2)}
                      </td>
                      <td className="p-1.5 border-l border-slate-200 text-center font-mono text-slate-600">
                        15%
                      </td>
                      <td className="p-1.5 border-l border-slate-200 text-center font-mono text-slate-600">
                        {formatNum(item.vatAmount, 2)}
                      </td>
                      <td className="p-1.5 text-center font-mono font-black text-slate-950">
                        {formatNum(item.totalWithVat, 2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── 4. FINANCIAL SUMMARY & TAFQEET ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 print-avoid-break">
            {/* Notes & Bank Details */}
            <div className="border border-slate-300 rounded-xl p-3 text-xs space-y-1 bg-slate-50/50 print:bg-transparent">
              <div className="font-bold text-slate-950 border-b border-slate-200 pb-1">الشروط البنكية والضمان:</div>
              <div className="text-[11px] text-slate-700 space-y-0.5">
                <div>• الأصناف أصلية وكالة معتمدة وفق معايير هيونداي موتورز.</div>
                <div>• الحساب البنكي: <strong>{currentQuote.ourCompany?.bankName || 'مصرف الراجحي (Al Rajhi Bank)'}</strong> · الآيبان: <span className="font-mono font-black text-slate-950">{currentQuote.ourCompany?.iban || 'SA2680000108608010709658'}</span></div>
                <div>• رقم الحساب: <span className="font-mono font-bold text-slate-900">{currentQuote.ourCompany?.accountNumber || '108000010006080709658'}</span> · الرقم الموحد: <span className="font-mono font-bold text-slate-900">{currentQuote.ourCompany?.unifiedNumber700 || '7016475555'}</span></div>
                <div>• التسليم فوري في مستودعات ومراكز درة لقطع الغيار بريدة.</div>
                <div>• الأسعار تشمل ضريبة القيمة المضافة 15% وسارية لمدة {currentQuote.validDays || 4} أيام من تاريخه.</div>
              </div>
            </div>

            {/* Totals Box */}
            <div className="border border-slate-800 rounded-xl p-3 text-xs space-y-1 font-mono bg-slate-50/50 print:bg-transparent">
              <div className="flex justify-between text-slate-800 pb-1 border-b border-slate-200">
                <span className="font-sans font-bold">المجموع قبل الضريبه Total Before Tax:</span>
                <span className="font-bold text-sm">{formatNum(totals.totalBeforeTax, 2)} ر.س</span>
              </div>
              <div className="flex justify-between text-slate-800 pb-1 border-b border-slate-200">
                <span className="font-sans font-bold">ضريبة القيمة المضافة VAT (15%):</span>
                <span className="font-bold text-sm">{formatNum(totals.totalVat, 2)} ر.س</span>
              </div>
              <div className="flex justify-between text-slate-950 font-black text-sm pt-1">
                <span className="font-sans text-base">المجموع النهائي مع الضريبه Total With VAT:</span>
                <span className="text-base text-blue-900 font-black">{formatNum(totals.totalWithVat, 2)} ر.س</span>
              </div>
            </div>
          </div>

          {/* Tafqeet in Arabic Banner */}
          <div className="bg-slate-100 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-bold text-center print-avoid-break">
            {tafqeetText}
          </div>

          {/* ── 5. OFFICIAL SIGNATURES & STAMPS (التوقيعات والاعتماد) ── */}
          <div className="border-t-2 border-slate-900 pt-3 grid grid-cols-3 gap-6 text-center text-xs print-avoid-break">
            <div>
              <div className="font-bold text-slate-900">مسؤول المبيعات / مقدم العرض</div>
              <div className="text-[10px] text-slate-600 mt-0.5">{currentQuote.ourCompany?.companyName || 'شركة درة السيارة لقطع الغيار'}</div>
              <div className="h-12 flex items-end justify-center font-bold text-slate-800 text-[11px]">
                معتمد ومطابق للأصناف
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-900">الختم الرسمي</div>
              <div className="text-[10px] text-slate-600 mt-0.5">شركة درة السيارة · س.ت: {currentQuote.ourCompany?.crNumber || '1131303965'}</div>
              <div className="h-12 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-500 flex items-center justify-center text-[9px] text-slate-600 font-bold rotate-12">
                  درة السيارات
                </div>
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-900">استلام وموافقة العميل</div>
              <div className="text-[10px] text-slate-600 mt-0.5">
                {currentQuote.clientCompany?.name || 'الشركة المستلمة'}
              </div>
              <div className="h-12 flex items-end justify-center text-slate-400 text-[10px]">
                التوقيع / التاريخ: ......................
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
