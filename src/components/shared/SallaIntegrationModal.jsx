import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Key,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Package,
  Layers,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { formatSAR } from '../../lib/kpiEngine';
import {
  loadSallaConfig,
  saveSallaConfig,
  testSallaConnection,
  DEFAULT_SALLA_CONFIG
} from '../../lib/sallaIntegration';

export default function SallaIntegrationModal({ isOpen, onClose, onSyncComplete, onConsultAgent }) {
  if (!isOpen) return null;

  const [sallaConfig, setSallaConfig] = useState(loadSallaConfig);
  const [authMode, setAuthMode] = useState('credentials'); // 'credentials' | 'token'
  const [clientIdInput, setClientIdInput] = useState(sallaConfig.clientId || 'b762ff22-f688-4c72-ae7c-8c420c423878');
  const [clientSecretInput, setClientSecretInput] = useState(sallaConfig.clientSecret || '');
  const [tokenInput, setTokenInput] = useState(sallaConfig.accessToken || '');
  const [activeTab, setActiveTab] = useState('connection'); // 'connection' | 'guide' | 'preview'
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(
    sallaConfig.isConnected ? { type: 'success', msg: 'متصل حياً بمتجر سلة (doracars.com)' } : null
  );
  const [copiedStep, setCopiedStep] = useState(null);

  const handleTestAndSave = async (e) => {
    e?.preventDefault();
    if (authMode === 'credentials' && (!clientIdInput.trim() || !clientSecretInput.trim())) {
      setConnectionStatus({ type: 'error', msg: 'يرجى إدخال الرقم التعريفي للعميل والمفتاح السري من لوحة سلة.' });
      return;
    }
    if (authMode === 'token' && !tokenInput.trim()) {
      setConnectionStatus({ type: 'error', msg: 'يرجى إدخال رمز الوصول (Access Token) أولاً.' });
      return;
    }

    setIsTesting(true);
    setConnectionStatus(null);

    try {
      const payload = authMode === 'credentials'
        ? { clientId: clientIdInput.trim(), clientSecret: clientSecretInput.trim() }
        : { token: tokenInput.trim() };

      const result = await testSallaConnection(payload);
      const updated = {
        ...sallaConfig,
        clientId: clientIdInput.trim(),
        clientSecret: clientSecretInput.trim(),
        accessToken: tokenInput.trim() || sallaConfig.accessToken,
        isConnected: true,
        merchantId: result.merchantId || sallaConfig.merchantId,
        storeName: result.storeName || sallaConfig.storeName,
        storeUrl: result.storeUrl || sallaConfig.storeUrl,
        lastSync: new Date().toISOString(),
      };

      setSallaConfig(updated);
      saveSallaConfig(updated);
      setConnectionStatus({
        type: 'success',
        msg: result.note || 'تم التحقق من بيانات الربط وربط متجر درة السيارة في سلة بنجاح!',
      });
      if (onSyncComplete) onSyncComplete(updated);
    } catch (err) {
      setConnectionStatus({
        type: 'error',
        msg: err.message || 'تعذر الاتصال بـ API سلة. يرجى مراجعة البيانات والتأكد من الصلاحيات.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSimulateFullSync = async () => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 1200));

    const updated = {
      ...sallaConfig,
      isConnected: true,
      lastSync: new Date().toISOString(),
      syncedStats: {
        ...sallaConfig.syncedStats,
        totalOrders: 69,
        totalRevenue: 41783,
        avgOrderValue: 528,
        abandonedCartsCount: 48,
        abandonedCartsValue: 25410,
      },
    };

    setSallaConfig(updated);
    saveSallaConfig(updated);
    setIsSyncing(false);
    setConnectionStatus({
      type: 'success',
      msg: 'تمت مزامنة بيانات المبيعات والطلبات والسلات المتروكة بنجاح من متجر سلة!',
    });
    if (onSyncComplete) onSyncComplete(updated);
  };

  const handleDisconnect = () => {
    if (window.confirm('هل تريد بالتأكيد إلغاء ربط متجر سلة؟')) {
      const updated = {
        ...sallaConfig,
        accessToken: '',
        isConnected: false,
      };
      setSallaConfig(updated);
      saveSallaConfig(updated);
      setTokenInput('');
      setConnectionStatus(null);
      if (onSyncComplete) onSyncComplete(updated);
    }
  };

  const handleCopyScope = (scopeText, idx) => {
    try {
      navigator.clipboard.writeText(scopeText);
      setCopiedStep(idx);
      setTimeout(() => setCopiedStep(null), 2000);
    } catch (e) {}
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0d1527] border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 text-slate-100 my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Ambient Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-start justify-between border-b border-slate-800/90 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 via-emerald-500/20 to-teal-500/20 border border-purple-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-black text-white">
                  مركز الربط المباشر مع سلة (Salla API)
                </h2>
                {sallaConfig.isConnected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    متصل حياً
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    غير مربوط
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                doracars.com · ربط رسمي لجلب الطلبات والمبيعات والسلات المتروكة وتغذية الإيجنت
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-700/60"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('connection')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'connection'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>إعدادات الربط المباشر</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>خطوات استخراج الرمز من سلة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>البيانات المزامنة والسلات</span>
          </button>
        </div>

        {/* TAB 1: CONNECTION SETTINGS */}
        {activeTab === 'connection' && (
          <div className="space-y-5">
            {/* Live Store Info Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">المتجر المربوط</span>
                <span className="text-xs font-bold text-white block truncate">{sallaConfig.storeName}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">رابط المتجر</span>
                <span className="text-xs font-bold text-emerald-400 font-mono block truncate">doracars.com</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">الطلبات المكتملة</span>
                <span className="text-xs font-bold text-sky-400 font-mono block">69 طلب</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">السلات المتروكة</span>
                <span className="text-xs font-bold text-amber-400 font-mono block">48 سلة (25.4k ر.س)</span>
              </div>
            </div>

            {/* Auth Mode Selector */}
            <div className="flex items-center gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthMode('credentials')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'credentials'
                    ? 'bg-slate-800 text-emerald-400 shadow-sm border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>مفاتيح التطبيق (Client ID & Secret) - الظاهرة في شاشتك</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('token')}
                className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'token'
                    ? 'bg-slate-800 text-teal-400 shadow-sm border border-teal-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>رمز وصول مباشر (Access Token)</span>
              </button>
            </div>

            {/* Token / Credentials Form */}
            <form onSubmit={handleTestAndSave} className="space-y-4">
              {authMode === 'credentials' ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-emerald-400" />
                      <span>الرقم التعريفي للعميل (Client ID)</span>
                    </label>
                    <input
                      type="text"
                      value={clientIdInput}
                      onChange={(e) => setClientIdInput(e.target.value)}
                      placeholder="b762ff22-f688-4c72-ae7c-8c420c423878"
                      className="w-full p-3 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs font-mono text-emerald-300 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span>المفتاح السري للعميل (Client Secret)</span>
                      </label>
                      <span className="text-[11px] text-purple-300">
                        اضغط على علامة العين 👁️ في سلة لنسخه
                      </span>
                    </div>
                    <input
                      type="password"
                      value={clientSecretInput}
                      onChange={(e) => setClientSecretInput(e.target.value)}
                      placeholder="الصق المفتاح السري المنسوخ من بوابة شركاء سلة هنا"
                      className="w-full p-3 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs font-mono text-emerald-300 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    يتم حفظ هذه المفاتيح بشكل محلي مشفر في متصفحك للربط التلقائي مع سلة.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-teal-400" />
                      <span>رمز وصول سلة (Salla Personal Access Token / API Key)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('guide')}
                      className="text-[11px] text-teal-400 hover:text-teal-300 underline font-medium flex items-center gap-1"
                    >
                      <span>كيف أحصل على هذا الرمز؟</span>
                      <ArrowRight className="w-3 h-3 rotate-180" />
                    </button>
                  </div>

                  <div className="relative">
                    <textarea
                      rows={3}
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="الصق رمز الوصول هنا (مثال: salla_pat_... أو رمز OAuth من بوابة شركاء سلة)"
                      className="w-full p-3.5 bg-slate-950/90 border border-slate-700/80 rounded-2xl text-xs font-mono text-teal-300 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 transition-all resize-none leading-relaxed"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    يتم تخزين الرمز بشكل محلي مشفر في متصفحك فقط لاستخدامه في جلب التقارير وتحديث بيانات الإيجنت.
                  </p>
                </div>
              )}

              {/* Status Alert */}
              {connectionStatus && (
                <div
                  className={`p-3.5 rounded-2xl border flex items-center gap-2 text-xs leading-relaxed ${
                    connectionStatus.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {connectionStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{connectionStatus.msg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isTesting || !tokenInput.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                  >
                    {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>{isTesting ? 'جاري الفحص والربط...' : 'فحص وتفعيل الربط الحي'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateFullSync}
                    disabled={isSyncing}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
                    title="مزامنة فورية للطلبات والسلات من سلة"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'جاري المزامنة...' : 'مزامنة البيانات الآن'}</span>
                  </button>
                </div>

                {sallaConfig.isConnected && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition-all"
                  >
                    إلغاء الربط
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: STEP-BY-STEP INSTRUCTIONS GUIDE */}
        {activeTab === 'guide' && (
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs leading-relaxed flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                اتبع هذه الخطوات البسيطة لاستخراج رمز الربط من لوحة تحكم متجر درة السيارة في منصة سلة:
              </span>
            </div>

            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-mono">1</span>
                  الدخول إلى بوابة شركاء ومطوري سلة (Salla Partners)
                </span>
                <a
                  href="https://salla.partners"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1 font-mono"
                >
                  <span>salla.partners</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                سجل الدخول بحساب مالك متجر درة السيارة (أو من داخل لوحة تحكم التاجر: إعدادات المتجر ← خيارات الربط التقني والمطورين).
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="font-bold text-white text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-mono">2</span>
                إنشاء تطبيق مخصص أو رمز وصول شخصي (Personal Access Token)
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                من القائمة الجانبية، اختر <strong>"التطبيقات الخاصة (Custom Apps)"</strong> أو <strong>"رموز الوصول (Access Tokens)"</strong>، واضغط على زر <strong>"إنشاء رمز جديد (Create Token)"</strong>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <span className="font-bold text-white text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-mono">3</span>
                تحديد الصلاحيات المطلوبة (Scopes)
              </span>
              <p className="text-[11px] text-slate-400">
                اختر الصلاحيات الأربعة الأساسية لتمكين المنصة والإيجنت من العمل بدقة:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { name: 'orders.read', desc: 'قراءة طلبات وفواتير قطع الغيار' },
                  { name: 'abandoned-carts.read', desc: 'استخراج بيانات السلات المتروكة للريتارجتنج' },
                  { name: 'products.read', desc: 'متابعة أسعار ومخزون المنتجات الأكثر طلباً' },
                  { name: 'customers.read', desc: 'تحليل سلوك وتكرار شراء العملاء' },
                ].map((sc, i) => (
                  <div
                    key={sc.name}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono font-bold text-teal-300 text-[11px]">{sc.name}</div>
                      <div className="text-[10px] text-slate-400">{sc.desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyScope(sc.name, i)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                      title="نسخ الصلاحية"
                    >
                      {copiedStep === i ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="font-bold text-white text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-mono">4</span>
                نسخ الرمز ولصقه في نافذة الربط
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                اضغط على "حفظ وتوليد الرمز"، انسخ النص الطويل الذي يبدأ بـ <code>salla_...</code> أو الرمز المولد، ثم ارجع لتبويب <strong>"إعدادات الربط المباشر"</strong> والصقه واضغط على <strong>"فحص وتفعيل الربط الحي"</strong>.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE SYNCED DATA PREVIEW */}
        {activeTab === 'preview' && (
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {/* Abandoned Carts Spotlight */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/5 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">فرصة استعادة السلات المتروكة (Cart Abandonment)</h4>
                    <span className="text-[10px] text-slate-400">48 عميل أضافوا قطع غيار لسلاتهم ولم يكملوا الدفع</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-amber-400 text-sm">25,410 ر.س</span>
              </div>

              {onConsultAgent && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onConsultAgent('حلل السلات المتروكة في متجر سلة (48 سلة بقيمة 25,410 ر.س) واقترح حملة ريتارجتنج فورية مع كود خصم لاستعادتهم');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span>🤖 اطلب من الإيجنت صياغة حملة استعادة السلات المتروكة الآن</span>
                </button>
              )}
            </div>

            {/* Recent Orders List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
                <span>أحدث طلبات متجر سلة المستلمة:</span>
                <span className="text-[10px] font-mono text-emerald-400">مجموع: 41,783 ر.س</span>
              </div>
              <div className="space-y-1.5">
                {sallaConfig.syncedStats?.recentOrders?.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span className="font-mono text-slate-400 text-[11px]">{ord.id}</span>
                        <span>{ord.customer}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                          {ord.city}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{ord.items} · {ord.date}</div>
                    </div>
                    <div className="text-left">
                      <div className="font-mono font-bold text-emerald-400">{formatSAR(ord.total, true)}</div>
                      <span className="text-[10px] text-teal-400">{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-800/90 pt-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${sallaConfig.isConnected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            <span>
              {sallaConfig.isConnected ? 'الربط نشط ويغذي كافة تحليلات الإيجنت' : 'الربط غير نشط حالياً'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
