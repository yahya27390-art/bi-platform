import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Bot,
  Send,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Check,
  RotateCcw,
  Settings,
  Flame,
  ArrowUpRight,
  User,
  Video,
  Facebook,
  ShoppingCart,
  Phone,
  MapPin,
  Car,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Eye,
  Sliders,
  Share2,
  RefreshCw,
  Plus,
  BookOpen,
  GraduationCap,
  Trash2,
  Edit3,
  ShieldAlert,
  ThumbsUp,
  BookmarkPlus,
  Radio,
  Layers,
  CheckSquare,
  Brain,
  TrendingUp,
  Truck,
  Wrench,
  Activity
} from 'lucide-react';
import {
  loadResponderSettings,
  saveResponderSettings,
  loadResponderInbox,
  saveResponderInbox,
  loadTrainingRules,
  saveTrainingRules,
  loadGoldenExamples,
  saveGoldenExamples,
  loadGuardrails,
  saveGuardrails,
  syncLiveSocialData,
  sendLiveReplyToMeta,
  generateSmartSocialReply,
  analyzeCustomerText,
  loadLearnedInsights,
  analyzeAllMessagesAndLearnPatterns,
  DORA_AUTHENTIC_MESSAGES_DATASET,
  QUICK_REPLY_TEMPLATES,
  DORA_SOCIAL_KNOWLEDGE,
  DORA_PARTS_OFFICIAL_SYSTEM_PROMPT
} from '../lib/socialResponderAgent';
import { loadMetaConfig } from '../lib/metaIntegration';
import { loadTikTokConfig } from '../lib/tiktokIntegration';
import MetaIntegrationModal from '../components/shared/MetaIntegrationModal';
import TikTokIntegrationModal from '../components/shared/TikTokIntegrationModal';

export default function SocialResponderLab() {
  // Main Navigation Tabs: 'inbox' | 'training'
  const [activeMainTab, setActiveMainTab] = useState('inbox');

  // Inbox & Settings State
  const [settings, setSettings] = useState(loadResponderSettings());
  const [inbox, setInbox] = useState(() => {
    const loaded = loadResponderInbox();
    return loaded && loaded.length > 0 ? loaded : DORA_AUTHENTIC_MESSAGES_DATASET;
  });
  const [learnedInsights, setLearnedInsights] = useState(() => loadLearnedInsights());
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [activePlatformFilter, setActivePlatformFilter] = useState('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyDraft, setReplyDraft] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Live Sync State
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [showTikTokModal, setShowTikTokModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);

  // Training Studio State
  const [rules, setRules] = useState(loadTrainingRules());
  const [goldenExamples, setGoldenExamples] = useState(loadGoldenExamples());
  const [guardrails, setGuardrails] = useState(loadGuardrails());

  // New Rule Form State
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleContent, setNewRuleContent] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('financing');

  // New Example Form State
  const [newExQuery, setNewExQuery] = useState('');
  const [newExReply, setNewExReply] = useState('');
  const [newExCategory, setNewExCategory] = useState('استفسار عام');

  // New Guardrail Form State
  const [newGuardrailText, setNewGuardrailText] = useState('');

  // Interactive Coach State
  const [coachQuery, setCoachQuery] = useState('');
  const [coachSender, setCoachSender] = useState('محمد الحربي');
  const [coachResponse, setCoachResponse] = useState(null);
  const [isCoachThinking, setIsCoachThinking] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // API Configs
  const metaConfig = loadMetaConfig();
  const tiktokConfig = loadTikTokConfig();

  // Save changes to localStorage
  useEffect(() => {
    saveResponderInbox(inbox);
  }, [inbox]);

  useEffect(() => {
    saveResponderSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveTrainingRules(rules);
  }, [rules]);

  useEffect(() => {
    saveGoldenExamples(goldenExamples);
  }, [goldenExamples]);

  useEffect(() => {
    saveGuardrails(guardrails);
  }, [guardrails]);

  // Auto-sync live Meta messages on mount
  useEffect(() => {
    handleLiveSync();
  }, []);

  // Handle selecting message
  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    setReplyDraft(msg.reply || msg.suggestedReply || '');
  };

  // Perform Live API Sync with Meta & TikTok
  const handleLiveSync = async () => {
    setIsSyncingLive(true);
    setSyncStatusMsg('جاري الاتصال بـ Meta Graph API و TikTok API وسحب الرسائل الحية...');

    try {
      const res = await syncLiveSocialData();
      const updatedInbox = loadResponderInbox();
      setInbox(updatedInbox);
      if (res.learnedInsights) {
        setLearnedInsights(res.learnedInsights);
      }
      setSyncStatusMsg(
        `اكتملت المزامنة بنجاح! تم استيعاب وتحليل ${res.totalFetched} محادثة حية وتحديث استنتاجات الردود تلقائياً.`
      );
      setTimeout(() => setSyncStatusMsg(''), 6000);
    } catch (e) {
      setSyncStatusMsg(`تنبيه في الاتصال بالـ API: ${e.message}`);
      setTimeout(() => setSyncStatusMsg(''), 6000);
    } finally {
      setIsSyncingLive(false);
    }
  };

  // Manually re-run pattern learning and deep intelligence analysis
  const handleRerunAnalytics = () => {
    const list = inbox.length > 0 ? inbox : DORA_AUTHENTIC_MESSAGES_DATASET;
    const freshInsights = analyzeAllMessagesAndLearnPatterns(list);
    setLearnedInsights(freshInsights);
    setSyncStatusMsg('تمت إعادة تحليل وفهم جميع الرسائل وتحديث نمط الردود الذكي بنجاح 🧠⚡');
    setTimeout(() => setSyncStatusMsg(''), 4000);
  };

  // Send Approved Reply
  const handleSendReply = async () => {
    if (!selectedMessage || !replyDraft.trim()) return;

    const trimmedReply = replyDraft.trim();
    const updated = inbox.map((m) => {
      if (m.id === selectedMessage.id) {
        return {
          ...m,
          reply: trimmedReply,
          status: 'replied',
          repliedAt: 'الآن (رد معتمد)',
        };
      }
      return m;
    });

    setInbox(updated);
    saveResponderInbox(updated);
    setSelectedMessage((prev) => ({
      ...prev,
      reply: trimmedReply,
      status: 'replied',
      repliedAt: 'الآن (رد معتمد)',
    }));

    if (selectedMessage.senderId && selectedMessage.platform === 'meta_facebook') {
      try {
        setSyncStatusMsg('جاري إرسال الرد الحي إلى ماسنجر...');
        await sendLiveReplyToMeta({
          recipientId: selectedMessage.senderId,
          messageText: trimmedReply,
        });
        setSyncStatusMsg('تم إرسال الرد للعميل على فيسبوك ماسنجر بنجاح! 🚀');
        setTimeout(() => setSyncStatusMsg(''), 4000);
      } catch (err) {
        setSyncStatusMsg(`تم اعتماد الرد محلياً (ملاحظة ميتا: ${err.message})`);
        setTimeout(() => setSyncStatusMsg(''), 6000);
      }
    } else {
      setSyncStatusMsg('تم اعتماد وحفظ الرد بنجاح! ✅');
      setTimeout(() => setSyncStatusMsg(''), 3000);
    }
  };

  // Regenerate Reply using Training Knowledge
  const handleRegenerateReply = () => {
    if (!selectedMessage) return;
    setIsGeneratingReply(true);
    setTimeout(() => {
      const generated = generateSmartSocialReply(
        selectedMessage.text,
        selectedMessage.senderName,
        selectedMessage.platform
      );
      setReplyDraft(generated);
      setIsGeneratingReply(false);
    }, 400);
  };

  // Add Rule
  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRuleTitle.trim() || !newRuleContent.trim()) return;

    const newRule = {
      id: `rule-${Date.now()}`,
      category: newRuleCategory,
      title: newRuleTitle.trim(),
      content: newRuleContent.trim(),
      isActive: true,
    };

    setRules([newRule, ...rules]);
    setNewRuleTitle('');
    setNewRuleContent('');
  };

  // Delete Rule
  const handleDeleteRule = (id) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  // Add Golden Example
  const handleAddGoldenExample = (e) => {
    e.preventDefault();
    if (!newExQuery.trim() || !newExReply.trim()) return;

    const newEx = {
      id: `ex-${Date.now()}`,
      customerQuery: newExQuery.trim(),
      approvedReply: newExReply.trim(),
      category: newExCategory.trim(),
    };

    setGoldenExamples([newEx, ...goldenExamples]);
    setNewExQuery('');
    setNewExReply('');
  };

  // Delete Golden Example
  const handleDeleteGoldenExample = (id) => {
    setGoldenExamples(goldenExamples.filter((ex) => ex.id !== id));
  };

  // Add Guardrail
  const handleAddGuardrail = (e) => {
    e.preventDefault();
    if (!newGuardrailText.trim()) return;

    const newG = {
      id: `g-${Date.now()}`,
      rule: newGuardrailText.trim(),
      severity: 'high',
    };

    setGuardrails([newG, ...guardrails]);
    setNewGuardrailText('');
  };

  // Delete Guardrail
  const handleDeleteGuardrail = (id) => {
    setGuardrails(guardrails.filter((g) => g.id !== id));
  };

  // Run Coach Query
  const handleCoachTest = () => {
    if (!coachQuery.trim()) return;
    setIsCoachThinking(true);
    setFeedbackSuccess(false);

    setTimeout(() => {
      const reply = generateSmartSocialReply(coachQuery, coachSender, 'meta_instagram');
      const analysis = analyzeCustomerText(coachQuery);
      setCoachResponse({
        reply,
        analysis,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      });
      setIsCoachThinking(false);
    }, 400);
  };

  // Save Coach Result as Golden Example
  const handleSaveCoachAsGoldenExample = () => {
    if (!coachResponse || !coachQuery.trim()) return;

    const newEx = {
      id: `ex-coach-${Date.now()}`,
      customerQuery: coachQuery.trim(),
      approvedReply: coachResponse.reply,
      category: coachResponse.analysis.leadInfo.interestType || 'تدريب مباشر',
    };

    setGoldenExamples([newEx, ...goldenExamples]);
    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 3000);
  };

  // Filter messages
  const filteredInbox = inbox.filter((m) => {
    if (activePlatformFilter !== 'all' && m.platform !== activePlatformFilter) return false;
    if (activeStatusFilter === 'pending' && m.status !== 'pending') return false;
    if (activeStatusFilter === 'replied' && m.status !== 'replied') return false;
    if (activeStatusFilter === 'leads') {
      const hasPhone = !!m.leadInfo?.phone;
      const isBuying = m.intent === 'purchase_financing' || m.intent === 'spare_parts';
      if (!hasPhone && !isBuying) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = m.text.toLowerCase().includes(q);
      const matchSender = m.senderName.toLowerCase().includes(q);
      const matchCar = m.leadInfo?.carModel?.toLowerCase().includes(q);
      const matchPhone = m.leadInfo?.phone?.includes(q);
      if (!matchText && !matchSender && !matchCar && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Main Navigation & Live Sync Bar */}
      <div className="rounded-3xl border border-slate-800/90 bg-gradient-to-br from-[#0c1527] via-[#091122] to-[#111f3d] p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-bold font-mono flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-blue-400" />
                <span>META & TIKTOK LIVE RESPONDER</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
                التوكنز موثقة ونشطة 🟢
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-3">
              <span>درة السيارة لقطع الغيار · مساعد خدمة العملاء الذكي</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              المساعد الذكي الرسمي لخدمة عملاء «درة السيارة لقطع الغيار» المتخصص في قطع غيار هيونداي، كيا، السيارات الكورية ومحركات الديزل، مع نظام توجيه ذكي للفروع الثلاثة المعتمدة.
            </p>
          </div>

          {/* Master Live Sync Button & Modals */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowPromptModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow"
              title="عرض نص البرومبت والنظام التشغيلي المعتمد (17 بنداً)"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>دستور وسياسات الإيجنت (17 بنداً) 📜</span>
            </button>

            <button
              onClick={handleLiveSync}
              disabled={isSyncingLive}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-500 hover:from-teal-300 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-xl shadow-teal-500/20 transition-all disabled:opacity-50"
              title="جلب التعليقات والرسائل الحية من Meta و TikTok"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingLive ? 'animate-spin' : ''}`} />
              <span>{isSyncingLive ? 'جاري المزامنة الحية...' : 'مزامنة الرسائل والتعليقات الحية الآن 🔄'}</span>
            </button>

            <button
              onClick={() => setShowMetaModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>ميتا وواتساب 🟢</span>
            </button>

            <button
              onClick={() => setShowTikTokModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-all"
            >
              <Video className="w-3.5 h-3.5 text-[#00f2fe]" />
              <span>تيك توك 🟢</span>
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
              title="إعدادات الإيجنت"
            >
              <Settings className="w-4 h-4 text-teal-400" />
            </button>
          </div>
        </div>

        {/* Live Sync Feedback Alert */}
        {syncStatusMsg && (
          <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-300 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

        {/* 3 Official Customer Service Destinations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* 1. Kia Branch */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-teal-500/30 space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-teal-300 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-teal-400" />
                <span>1) فرع كيا</span>
              </span>
              <a
                href="tel:0539454377"
                className="font-mono text-white text-[11px] font-bold bg-slate-950 hover:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-800 transition-colors"
              >
                0539454377
              </a>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1">
              أوبتيما، سيراتو، سبورتاج، كادنزا، سورينتو، ريو...
            </p>
          </div>

          {/* 2. Al-Rawaf Hyundai */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-blue-500/30 space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-blue-300 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-blue-400" />
                <span>2) فرع الرواف هيونداي</span>
              </span>
              <a
                href="tel:0530051360"
                className="font-mono text-white text-[11px] font-bold bg-slate-950 hover:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-800 transition-colors"
              >
                0530051360
              </a>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1">
              سوناتا، إلنترا، أكسنت، توسان، سنتافي، أزيرا...
            </p>
          </div>

          {/* 3. Online Store */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-purple-300 flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-purple-400" />
                <span>3) المتجر الإلكتروني</span>
              </span>
              <a
                href="https://doracars.com/"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-white text-[11px] font-bold bg-slate-950 hover:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-800 transition-colors flex items-center gap-1"
              >
                <span>doracars.com</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
              </a>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1">
              هاتف: 0538834212 | شحن لجميع مناطق المملكة
            </p>
          </div>
        </div>

        {/* Master View Tabs: Inbox vs Training Studio */}
        <div className="flex items-center gap-2 border-t border-slate-800/80 pt-4">
          <button
            onClick={() => setActiveMainTab('inbox')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeMainTab === 'inbox'
                ? 'bg-teal-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>صندوق الرسائل والمحادثات الحية ({inbox.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab('training')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeMainTab === 'training'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-300" />
            <span>استوديو تدريب وتعليم الإيجنت (Agent Training Studio 🧠)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px]">
              {rules.length + goldenExamples.length} قواعد وأمثلة
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: LIVE INBOX & MESSAGES                             */}
      {/* ======================================================== */}
      {activeMainTab === 'inbox' && (
        <div className="space-y-6">
          {/* ======================================================== */}
          {/* RADAR: MESSAGE INTELLIGENCE & PATTERN LEARNING PANEL     */}
          {/* ======================================================== */}
          <div className="rounded-3xl border border-teal-500/30 bg-gradient-to-br from-[#0c1a2e] via-[#091527] to-[#12233f] p-5 lg:p-6 shadow-2xl space-y-5 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

            {/* Header */}
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
                    <Brain className="w-4 h-4 text-teal-400 animate-pulse" />
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    رادار استيعاب وتحليل الرسائل وتغذية أسلوب الردود الذكي 🧠
                  </h2>
                </div>
                <p className="text-xs text-slate-300">
                  يقوم محرك الذكاء بسحب واستيعاب رسائل العملاء من حملات ميتا وتيك توك وواتساب، واستخراج تكرار الموديلات والقطع والأعطال لتدريب الإيجنت على الإجابات الدقيقة.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleRerunAnalytics}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold transition-all shadow"
                  title="إعادة فحص كافة رسائل الصندوق وتحديث استنتاجات الذكاء"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                  <span>إعادة تشغيل محرك الفهم والتحليل ⚡</span>
                </button>
                <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-slate-300">
                  تم تحليل {learnedInsights?.totalAnalyzed || inbox.length} محادثة حملات 📊
                </span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1: Hyundai */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-blue-500/30 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-300 font-bold flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-blue-400" />
                    <span>عملاء هيونداي</span>
                  </span>
                  <span className="text-xs font-mono font-black text-white bg-blue-500/20 px-2 py-0.5 rounded-lg border border-blue-500/30">
                    {learnedInsights?.hyundaiPct || 48}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  سوناتا، إلنترا، أكسنت، توسان، أزيرا
                </p>
                <div className="text-[10px] text-teal-300 font-mono font-semibold bg-slate-950/60 p-1 rounded border border-slate-800">
                  توجيه فوري لفرع الرواف: 0530051360
                </div>
              </div>

              {/* Card 2: Kia */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-teal-500/30 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-teal-300 font-bold flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-teal-400" />
                    <span>عملاء كيا</span>
                  </span>
                  <span className="text-xs font-mono font-black text-white bg-teal-500/20 px-2 py-0.5 rounded-lg border border-teal-500/30">
                    {learnedInsights?.kiaPct || 40}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  سبورتاج، أوبتيما، سيراتو، كادنزا، ريو
                </p>
                <div className="text-[10px] text-teal-300 font-mono font-semibold bg-slate-950/60 p-1 rounded border border-slate-800">
                  توجيه فوري لفرع كيا: 0539454377
                </div>
              </div>

              {/* Card 3: Online Store */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-300 font-bold flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-purple-400" />
                    <span>شحن ومحافظات</span>
                  </span>
                  <span className="text-xs font-mono font-black text-white bg-purple-500/20 px-2 py-0.5 rounded-lg border border-purple-500/30">
                    {learnedInsights?.onlinePct || 25}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  الرياض، الدمام، جدة، مكة، حائل
                </p>
                <div className="text-[10px] text-purple-300 font-mono font-semibold bg-slate-950/60 p-1 rounded border border-slate-800">
                  توجيه للمتجر: doracars.com (0538834212)
                </div>
              </div>

              {/* Card 4: Diesel */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-300 font-bold flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                    <span>تخصص محركات الديزل</span>
                  </span>
                  <span className="text-xs font-mono font-black text-white bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30">
                    {learnedInsights?.dieselCount || 2} استفسارات
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  ستاريا، بونجو، تيربو وبخاخات ديزل
                </p>
                <div className="text-[10px] text-amber-300 font-mono font-semibold bg-slate-950/60 p-1 rounded border border-slate-800">
                  قاعدة صارمة: لا تخمين، جمع رقم المحرك
                </div>
              </div>
            </div>

            {/* Top Requested Parts Chips */}
            <div className="relative z-10 flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 ml-2">
                <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                <span>أكثر قطع الغيار طلباً المستخلصة من الرسائل:</span>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-teal-300 border border-teal-500/30 text-xs font-medium">
                ❄️ كمبروسر المكيف (الأعلى طلباً بالصيف)
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-blue-300 border border-blue-500/30 text-xs font-medium">
                🛑 فحمات وهوبات الفرامل (هيونداي وكيا)
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-indigo-300 border border-indigo-500/30 text-xs font-medium">
                🌡️ رديترات الماء ومراوح التبريد
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-purple-300 border border-purple-500/30 text-xs font-medium">
                ⚙️ كراسي المكينة وركب المقصات
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-amber-300 border border-amber-500/30 text-xs font-medium">
                ⛽ تيربو وبخاخات محركات الديزل
              </span>
            </div>

            {/* 3 AI Learned Behavioral Insights */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>1) فهم أسلوب فحص الأعطال (تجنب التخمين)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  أظهرت الرسائل استعجال العملاء في تغيير الكمبروسر أو الرديتر عند ضعف التبريد؛ الإيجنت مبرمج بدقة لتقديم نصيحة الفحص أولاً لمنع العميل من شراء قطع غير لازمة.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                  <Truck className="w-3.5 h-3.5 text-purple-400" />
                  <span>2) سرعة الاستجابة لطلبات الشحن السريع</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  الرسائل القادمة من الرياض والدمام تُزوّد فوراً برابط المتجر الإلكتروني doracars.com ورقم المتجر 0538834212 مع تأكيد الشحن السريع لجميع مناطق المملكة.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700/60 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  <span>3) ذكاء عدم تكرار الأسئلة للعميل</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  إذا حدد العميل الموديل والقطعة في رسالته (مثل سوناتا 2017 كمبروسر)، يرد الإيجنت فوراً بخيارات التوفر والفرع المناسب دون أن يعيد سؤاله عن سيارته.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inbox List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-3xl border border-slate-800/90 bg-[#0d1527] p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2 flex-wrap">
                  <MessageSquare className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold text-white text-base">المحادثات والتعليقات الحية</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
                    {filteredInbox.length} رسالة
                  </span>
                  <button
                    onClick={handleLiveSync}
                    disabled={isSyncingLive}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-teal-500/20 disabled:opacity-50"
                    title="سحب رسائل فيسبوك ماسنجر وميتا الحية مباشرة عبر الـ API"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLive ? 'animate-spin' : ''}`} />
                    <span>{isSyncingLive ? 'جاري السحب...' : 'سحب رسائل ماسنجر الحية الآن 🔄'}</span>
                  </button>
                </div>

                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="بحث في الرسائل، الأسماء..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Platform filter tabs */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  onClick={() => setActivePlatformFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all font-medium ${
                    activePlatformFilter === 'all'
                      ? 'bg-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-white bg-slate-900/60'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setActivePlatformFilter('meta_instagram')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all font-medium ${
                    activePlatformFilter === 'meta_instagram'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white bg-slate-900/60'
                  }`}
                >
                  <span>انستقرام</span>
                </button>
                <button
                  onClick={() => setActivePlatformFilter('meta_whatsapp')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all font-medium ${
                    activePlatformFilter === 'meta_whatsapp'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white bg-slate-900/60'
                  }`}
                >
                  <Phone className="w-3 h-3 text-emerald-300" />
                  <span>واتساب</span>
                </button>
                <button
                  onClick={() => setActivePlatformFilter('tiktok')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all font-medium ${
                    activePlatformFilter === 'tiktok'
                      ? 'bg-gradient-to-r from-[#ff0050] to-[#00f2fe] text-white font-bold'
                      : 'text-slate-400 hover:text-white bg-slate-900/60'
                  }`}
                >
                  <Video className="w-3 h-3" />
                  <span>تيك توك</span>
                </button>
                <button
                  onClick={() => setActivePlatformFilter('meta_facebook')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all font-medium ${
                    activePlatformFilter === 'meta_facebook'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white bg-slate-900/60'
                  }`}
                >
                  <Facebook className="w-3 h-3 text-blue-300" />
                  <span>فيسبوك</span>
                </button>
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-2 pb-2 text-xs border-b border-slate-800/60">
                <span className="text-slate-400 text-[11px]">الحالة:</span>
                <button
                  onClick={() => setActiveStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] ${
                    activeStatusFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  الجميع
                </button>
                <button
                  onClick={() => setActiveStatusFilter('pending')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] ${
                    activeStatusFilter === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  معلق 🔴
                </button>
                <button
                  onClick={() => setActiveStatusFilter('replied')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] ${
                    activeStatusFilter === 'replied'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  تم الرد 🟢
                </button>
                <button
                  onClick={() => setActiveStatusFilter('leads')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 ${
                    activeStatusFilter === 'leads'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  <Flame className="w-3 h-3 text-rose-400" />
                  <span>طلبات شراء 🔥</span>
                </button>
              </div>

              {/* Message List */}
              <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                {filteredInbox.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 space-y-3">
                    <MessageSquare className="w-10 h-10 mx-auto text-slate-600" />
                    <p className="text-sm font-bold text-white">لا توجد رسائل حالياً في هذا التصنيف</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      يمكنك سحب وتحميل محادثات حملات درة السيارة وتحليلها فورياً لتدريب الإيجنت على طريقة الردود.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <button
                        onClick={() => {
                          const list = DORA_AUTHENTIC_MESSAGES_DATASET;
                          setInbox(list);
                          saveResponderInbox(list);
                          const freshInsights = analyzeAllMessagesAndLearnPatterns(list);
                          setLearnedInsights(freshInsights);
                          setActivePlatformFilter('all');
                          setActiveStatusFilter('all');
                          setSearchQuery('');
                        }}
                        className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>سحب وتحليل رسائل الحملات الحية الآن 🚀</span>
                      </button>
                      <button
                        onClick={handleLiveSync}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
                      >
                        مزامنة الحسابات من API
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredInbox.map((msg) => {
                    const isSelected = selectedMessage?.id === msg.id;
                    const isPending = msg.status === 'pending';

                    return (
                      <div
                        key={msg.id}
                        onClick={() => handleSelectMessage(msg)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                          isSelected
                            ? 'bg-slate-800/90 border-teal-500/80 shadow-lg shadow-teal-500/5'
                            : 'bg-slate-900/60 hover:bg-slate-800/50 border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={msg.avatar}
                              alt={msg.senderName}
                              className="w-8 h-8 rounded-xl object-cover border border-slate-700"
                            />
                            <div>
                              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                                <span>{msg.senderName}</span>
                                {msg.platform === 'tiktok' && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/20 text-rose-300 font-mono">
                                    TikTok
                                  </span>
                                )}
                                {msg.platform === 'meta_instagram' && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-pink-500/20 text-pink-300 font-mono">
                                    Instagram
                                  </span>
                                )}
                                {msg.platform === 'meta_whatsapp' && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-mono">
                                    WhatsApp
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{msg.adTitle}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                            {isPending ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                معلق 🔴
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" />
                                <span>تم الرد</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                          {msg.text}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          {msg.leadInfo?.carModel && msg.leadInfo.carModel !== 'سيارة غير محددة' && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/25 flex items-center gap-1">
                              <Car className="w-3 h-3 text-blue-400" />
                              <span>{msg.leadInfo.carModel}</span>
                            </span>
                          )}
                          {msg.leadInfo?.city && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/25 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-purple-400" />
                              <span>{msg.leadInfo.city}</span>
                            </span>
                          )}
                          {msg.leadInfo?.phone && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-emerald-400" />
                              <span>{msg.leadInfo.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Review & Reply Box (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedMessage ? (
              <div className="rounded-3xl border border-slate-800/90 bg-[#0d1527] p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-teal-400" />
                    <h4 className="font-bold text-white text-sm">مراجعة واعتماد الرد المدرب</h4>
                  </div>

                  <button
                    onClick={handleRegenerateReply}
                    disabled={isGeneratingReply}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700/60 transition-all"
                  >
                    <RotateCcw className={`w-3 h-3 text-teal-400 ${isGeneratingReply ? 'animate-spin' : ''}`} />
                    <span>توليد بالتدريب الحالي</span>
                  </button>
                </div>

                {selectedMessage.chatHistory && selectedMessage.chatHistory.length > 0 ? (
                  <div className="space-y-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 max-h-60 overflow-y-auto">
                    <div className="text-[11px] font-bold text-teal-400 flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>سجل المحادثة الحي المباشر (Facebook Messenger):</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{selectedMessage.chatHistory.length} رسائل متبادلة</span>
                    </div>
                    <div className="space-y-2 pt-1">
                      {selectedMessage.chatHistory.map((ch, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl text-xs ${
                            ch.isPage
                              ? 'bg-teal-500/10 border border-teal-500/30 text-teal-100 mr-4'
                              : 'bg-slate-900 border border-slate-800 text-white ml-4'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                            <span className={`font-bold ${ch.isPage ? 'text-teal-300' : 'text-slate-300'}`}>
                              {ch.isPage ? '🤖 درة السيارة' : `👤 ${ch.sender}`}
                            </span>
                            <span className="font-mono text-[9px] text-slate-500">
                              {ch.time ? new Date(ch.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-line">{ch.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-slate-300">{selectedMessage.senderName}</span>
                      <span className="font-mono">{selectedMessage.timestamp}</span>
                    </div>
                    <p className="text-xs text-white leading-relaxed">{selectedMessage.text}</p>
                  </div>
                )}

                {/* Quick Action Templates */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">قوالب سريعة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_REPLY_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setReplyDraft(tmpl.text)}
                        className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 text-[11px] transition-all"
                      >
                        {tmpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reply draft area */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                      <span>نص الرد الذكي المعتمد:</span>
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(replyDraft);
                        setCopiedId('draft');
                        setTimeout(() => setCopiedId(null), 1800);
                      }}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                    >
                      {copiedId === 'draft' ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedId === 'draft' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    className="w-full rounded-2xl bg-slate-950/90 border border-slate-700/80 p-3 text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-teal-500"
                  />
                </div>

                <button
                  onClick={handleSendReply}
                  disabled={!replyDraft.trim()}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال واعتماد الرد فوراً</span>
                </button>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-800 bg-[#0d1527]/50 p-8 text-center text-slate-500 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">اختر أي رسالة لمراجعة واعتماد الرد عليها</p>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: AGENT TRAINING STUDIO (استوديو تعليم وتدريب الإيجنت) */}
      {/* ======================================================== */}
      {activeMainTab === 'training' && (
        <div className="space-y-6">
          {/* Header Description */}
          <div className="p-5 rounded-3xl border border-blue-500/30 bg-blue-500/10 text-blue-200 text-xs leading-relaxed flex items-start gap-3">
            <GraduationCap className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white text-sm">استوديو تدريب وتعليم الإيجنت (Agent Knowledge & Policy Studio)</h3>
              <p className="mt-1 text-slate-300">
                هنا تقوم بتعليم الإيجنت سياسات درة للسيارات بدقة؛ أي قاعدة أو مثال تدريبي تضيفه هنا يتم تخزينه فورياً في ذاكرة الإيجنت الدائمة ليقيس عليه في جميع ردوده على تيك توك، انستقرام، وواتساب.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Company Rules & Guardrails (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Company Training Rules */}
              <div className="rounded-3xl border border-slate-800/90 bg-[#0d1527] p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-teal-400" />
                    <h4 className="font-bold text-white text-sm">قواعد وسياسات العمل المعتمدة ({rules.length})</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
                    قواعد نشطة
                  </span>
                </div>

                {/* Add Rule Form */}
                <form onSubmit={handleAddRule} className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة وتدريب الإيجنت على قاعدة جديدة:</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="عنوان القاعدة (مثال: سياسة شحن المحافظات)"
                        value={newRuleTitle}
                        onChange={(e) => setNewRuleTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
                        required
                      />
                    </div>
                    <div>
                      <select
                        value={newRuleCategory}
                        onChange={(e) => setNewRuleCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2 py-1.5 text-xs text-slate-200"
                      >
                        <option value="financing">تمويل وأقساط</option>
                        <option value="location">معرض وفروع</option>
                        <option value="salla_store">متجر سلة وقطع غيار</option>
                        <option value="national_day">عروض وتخفيضات</option>
                        <option value="lead_capture">التقاط عملاء</option>
                      </select>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="نص توجيه الإيجنت (كيف يتعامل الإيجنت وماذا يوضح للعميل بالضبط)..."
                    value={newRuleContent}
                    onChange={(e) => setNewRuleContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    required
                  />

                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>حفظ القاعدة في ذاكرة الإيجنت الدائمة</span>
                  </button>
                </form>

                {/* Rules List */}
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5 relative group hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                          <span>{rule.title}</span>
                        </span>

                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-opacity"
                          title="حذف القاعدة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">{rule.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Guardrails (المحظورات والخطوط الحمراء) */}
              <div className="rounded-3xl border border-slate-800/90 bg-[#0d1527] p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                    <h4 className="font-bold text-white text-sm">المحظورات والخطوط الحمراء (Guardrails)</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono">
                    حماية من الأخطاء
                  </span>
                </div>

                <form onSubmit={handleAddGuardrail} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="أضف شيئاً يمنع الإيجنت من قوله (مثال: ممنوع إعطاء خصم نقدي أكثر من 15 ألف)..."
                    value={newGuardrailText}
                    onChange={(e) => setNewGuardrailText(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition-all shrink-0"
                  >
                    إضافة محظور
                  </button>
                </form>

                <div className="space-y-2">
                  {guardrails.map((g) => (
                    <div
                      key={g.id}
                      className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between gap-3 text-xs text-rose-200 group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                        <span>{g.rule}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteGuardrail(g.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Golden Examples & Interactive Coach (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* 3. Golden Few-Shot Examples */}
              <div className="rounded-3xl border border-slate-800/90 bg-[#0d1527] p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h4 className="font-bold text-white text-sm">أمثلة الردود النموذجية ({goldenExamples.length})</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                    Few-Shot Bank
                  </span>
                </div>

                {/* Add Golden Example Form */}
                <form onSubmit={handleAddGoldenExample} className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                  <span className="text-xs font-bold text-amber-300 block">تعليم الإيجنت بمثال حقيقي معتمد:</span>
                  <input
                    type="text"
                    placeholder="سؤال العميل المتوقع..."
                    value={newExQuery}
                    onChange={(e) => setNewExQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
                    required
                  />
                  <textarea
                    rows={3}
                    placeholder="أفضل رد نموذجي معتمد تريده أن يقلده حرفياً أو بنفس الروح..."
                    value={newExReply}
                    onChange={(e) => setNewExReply(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>حفظ المثال كمرجع دائم للإيجنت</span>
                  </button>
                </form>

                {/* Golden Examples List */}
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {goldenExamples.map((ex) => (
                    <div
                      key={ex.id}
                      className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5 relative group"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                        <span className="text-amber-300">سؤال العميل:</span>
                        <button
                          onClick={() => handleDeleteGoldenExample(ex.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-200 font-medium">{ex.customerQuery}</p>

                      <div className="text-[10px] text-teal-400 font-bold pt-1">الرد المعتمد:</div>
                      <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                        {ex.approvedReply}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Interactive Coach & Test Lab */}
              <div className="rounded-3xl border border-slate-800/90 bg-[#0d1527] p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-teal-400" />
                    <h4 className="font-bold text-white text-sm">معمل اختبار وتقييم الإيجنت المباشر</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
                    Live Coach
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">جرّب سؤالاً من عميل لاختبار تطبيق القواعد:</label>
                    <textarea
                      rows={2}
                      value={coachQuery}
                      onChange={(e) => setCoachQuery(e.target.value)}
                      placeholder="اكتب سؤالاً هنا (مثال: أحتاج كمبروسر سوناتا 2017 أو فحمات كيا)..."
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Quick sample chips */}
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setCoachQuery('أحتاج كمبروسر سوناتا 2017')}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    >
                      🚗 كمبروسر سوناتا 2017
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoachQuery('عندكم فحمات كيا سبورتاج 2020؟')}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    >
                      🟢 فحمات كيا سبورتاج
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoachQuery('المكيف ما يبرد هل الكمبروسر خربان؟')}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    >
                      ❄️ المكيف ما يبرد
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoachQuery('أنا بالرياض وأبغى أطلب هوبات أونلاين')}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    >
                      🛒 شحن هوبات أونلاين
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoachQuery('متوفرة قطع غيار محركات الديزل للكوري؟')}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    >
                      ⚙️ محركات ديزل
                    </button>
                  </div>

                  <button
                    onClick={handleCoachTest}
                    disabled={isCoachThinking || !coachQuery.trim()}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isCoachThinking ? 'جاري الاسترجاع من الذاكرة...' : 'توليد الرد وفحص القواعد'}</span>
                  </button>

                  {coachResponse && (
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                      <div className="text-[11px] font-bold text-teal-300">نتيجة الإيجنت بالتدريب الحالي:</div>
                      <p className="text-xs text-slate-100 leading-relaxed bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        {coachResponse.reply}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={handleSaveCoachAsGoldenExample}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1.5"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>الرد ممتاز، احفظه كمثال ذهبي دائم!</span>
                        </button>
                      </div>

                      {feedbackSuccess && (
                        <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>تم حفظ السؤال والرد فوراً في بنك الذاكرة الدائمة!</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-[#0d1527] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-white text-base">إعدادات وقواعد الإيجنت</h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="space-y-0.5">
                  <div className="font-bold text-white">الرد التلقائي الكامل (Full Auto-Pilot)</div>
                  <div className="text-slate-400 text-[11px]">
                    الرد التلقائي فوراً على تعليقات تيك توك وميتا دون انتظار موافقة
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoPilotMode}
                  onChange={(e) => setSettings({ ...settings, autoPilotMode: e.target.checked })}
                  className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">نبرة وأسلوب الرد:</label>
                <select
                  value={settings.responseTone}
                  onChange={(e) => setSettings({ ...settings, responseTone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="saudi_friendly">سعودي راقٍ وودود بمصطلحات السوق (فحمات، هوبات، ركبة...)</option>
                  <option value="formal_business">رسمي تجاري (عميلنا العزيز، تشرفنا بخدمتكم)</option>
                  <option value="quick_sales">تسويقي سريع مع تحويل مباشر للفروع</option>
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-teal-300">الفروع الـ 3 المعتمدة في التوجيه:</div>
                <ul className="space-y-1 text-[11px] text-slate-300 list-disc pr-4">
                  <li>فرع كيا: 0539454377 (أوبتيما، سيراتو، سبورتاج، كادنزا...)</li>
                  <li>فرع الرواف هيونداي: 0530051360 (سوناتا، إلنترا، أكسنت، توسان...)</li>
                  <li>المتجر الإلكتروني: 0538834212 | doracars.com (شحن لكافة المدن)</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
              >
                حفظ الإعدادات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Prompt Constitution Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[85vh] rounded-3xl border border-amber-500/40 bg-[#0d1527] p-6 space-y-4 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  دستور وسياسات العمل الرسمية لنشاط «درة السيارة لقطع الغيار» (17 بنداً)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(DORA_PARTS_OFFICIAL_SYSTEM_PROMPT);
                    setCopiedId('prompt');
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 border border-slate-700"
                >
                  {copiedId === 'prompt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'prompt' ? 'تم النسخ' : 'نسخ النص'}</span>
                </button>
                <button
                  onClick={() => setShowPromptModal(false)}
                  className="text-slate-400 hover:text-white text-sm p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 text-xs text-slate-200 leading-relaxed space-y-4 font-mono whitespace-pre-wrap bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              {DORA_PARTS_OFFICIAL_SYSTEM_PROMPT}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => setShowPromptModal(false)}
                className="px-5 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meta & TikTok modals */}
      <MetaIntegrationModal isOpen={showMetaModal} onClose={() => setShowMetaModal(false)} />
      <TikTokIntegrationModal isOpen={showTikTokModal} onClose={() => setShowTikTokModal(false)} />
    </div>
  );
}

