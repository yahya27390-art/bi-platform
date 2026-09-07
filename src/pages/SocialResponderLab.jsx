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
  Instagram,
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
  Activity,
  ChevronRight,
  CreditCard,
  MessageCircle,
  Smartphone,
  Hash,
  ShoppingBag,
  BellRing,
  Calendar,
  Sun,
  Moon,
  ToggleLeft,
  ToggleRight,
  Paperclip,
  Smile,
  Mic,
  Quote,
  CheckCheck,
  Mail,
  Users,
  ChevronDown,
  X
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
  isAutoReplyActiveNow,
  DORA_AUTHENTIC_MESSAGES_DATASET,
  QUICK_REPLY_TEMPLATES,
  DORA_SOCIAL_KNOWLEDGE,
  DORA_PARTS_OFFICIAL_SYSTEM_PROMPT,
  loadCustomerTags,
  saveCustomerTags,
  loadCustomerNotes,
  saveCustomerNotes,
  loadCustomerCustomProfiles,
  saveCustomerCustomProfile,
  exportCustomerTagsReportCSV
} from '../lib/socialResponderAgent';
import { loadMetaConfig } from '../lib/metaIntegration';
import { loadTikTokConfig } from '../lib/tiktokIntegration';
import MetaIntegrationModal from '../components/shared/MetaIntegrationModal';
import TikTokIntegrationModal from '../components/shared/TikTokIntegrationModal';
import OmnichannelInboxView from '../components/social/OmnichannelInboxView';

// Social-Bot.io Default Keyword Triggers
const DEFAULT_KEYWORD_TRIGGERS = [
  { id: 'kw-1', keyword: 'سعر / بكم / كم', action: 'طلب موديل السيارة وتوجيه للفرع المختص', category: 'pricing', matches: 342, isActive: true },
  { id: 'kw-2', keyword: 'أقساط / اقصاد / تابي / تمارا', action: 'شرح التقسيط 4 دفعات بدون فوائد + رابط المتجر 0538834212', category: 'financing', matches: 189, isActive: true },
  { id: 'kw-3', keyword: 'كيا / سبورتاج / سيراتو / كادنزا / كرنفال', action: 'توجيه مباشر لفرع كيا المعتمد: 0539454377', category: 'kia_routing', matches: 412, isActive: true },
  { id: 'kw-4', keyword: 'هيونداي / سوناتا / النترا / أكسنت / أفانتي', action: 'توجيه مباشر لفرع الرواف هيونداي: 0530051360', category: 'hyundai_routing', matches: 528, isActive: true },
  { id: 'kw-5', keyword: 'ديزل / تيربو / بخاخات / محرك ديزل', action: 'طلب بيانات المحرك ورقم الهيكل وتوجيه لقسم الديزل', category: 'diesel', matches: 215, isActive: true },
  { id: 'kw-6', keyword: 'مكيف / كمبروسر / ما يبرد / تبريد', action: 'نصيحة فحص الدائرة والفريون قبل تغيير الكمبروسر', category: 'diagnostics', matches: 178, isActive: true },
  { id: 'kw-7', keyword: 'شحن / توصيل / الرياض / جدة / الدمام', action: 'تزويد برابط متجر doracars.com ورقم المتجر 0538834212', category: 'shipping', matches: 310, isActive: true },
  { id: 'kw-8', keyword: 'رقم الهيكل / VIN / الشاصي', action: 'مطابقة القطعة 100% بنظام الوكالة وتأكيد التوافق', category: 'compatibility', matches: 265, isActive: true },
];

// Social-Bot.io Comment-to-DM Automation Rules
const DEFAULT_COMMENT_TO_DM_RULES = [
  {
    id: 'cdm-1',
    name: 'الرد على استفسارات الأسعار في الإعلانات',
    triggerWords: 'بكم، كم السعر، السعر، بكم سعرها، السعر كم',
    publicReply: 'حياك الله 🌹 تم إرسال كافة التفاصيل وخيارات التوفر في رسالة خاصة عبر الخاص 📩',
    privateDm: 'أهلاً بك 🌹 يسعدنا خدمتك في درة السيارة لقطع الغيار. بخصوص استفسارك عن السعر، أرسل لنا موديل وسنة صنع سيارتك أو رقم الهيكل ونفيدك بالأسعار وخيارات الأصلي والكوري فوراً. فروعنا: كيا: 0539454377 | هيونداي: 0530051360 | المتجر: 0538834212',
    conversions: 184,
    status: 'ACTIVE'
  },
  {
    id: 'cdm-2',
    name: 'إعلانات قطع كيا (سبورتاج، كادنزا، أوبتيما)',
    triggerWords: 'كيا، سبورتاج، كادنزا، سيراتو، سورينتو، ريو',
    publicReply: 'أهلاً بك 🌹 تم تحويل استفسارك لقسم كيا وتزويدك بالتفاصيل في الخاص 📩',
    privateDm: 'حياك الله 🌹 يسعدنا خدمتك في قطع غيار كيا. للتأكد من التوفر والأسعار لسيارتك كيا، يسعدنا تواصلك مع فرع كيا المتخصص: 0539454377 أو تزويدنا برقم الهيكل في هذه المحادثة.',
    conversions: 156,
    status: 'ACTIVE'
  },
  {
    id: 'cdm-3',
    name: 'إعلانات محركات وقطع الديزل الكورية',
    triggerWords: 'ديزل، تيربو، ستاريا، بونجو، افانتي ديزل',
    publicReply: 'حياك الله 🌹 قسم الديزل المتخصص تواصل معك في الخاص بكافة خيارات التوفر 📩',
    privateDm: 'مرحباً بك 🌹 يسعدنا خدمتك في تخصص محركات الديزل وسيارات الديزل الكورية. أرسل لنا رقم المحرك أو رقم الهيكل لتأكيد التوافق 100% ومساعدتك فوراً عبر القسم المتخصص.',
    conversions: 92,
    status: 'ACTIVE'
  },
  {
    id: 'cdm-4',
    name: 'استفسارات الشحن للمدن وخارج القصيم',
    triggerWords: 'الرياض، جدة، الدمام، شحن، توصيل، مكة',
    publicReply: 'أهلاً بك 🌹 متاح الشحن لجميع مناطق المملكة، أرسلنا لك رابط المتجر بالخاص 📩',
    privateDm: 'حياك الله 🌹 نعم متاح الشحن السريع لباب بيتك لجميع مدن المملكة. يمكنك الطلب مباشرة عبر المتجر: https://doracars.com/ أو التواصل مع فريق المتجر الإلكتروني على: 0538834212',
    conversions: 210,
    status: 'ACTIVE'
  }
];

export default function SocialResponderLab() {
  // Navigation Tabs: 'inbox' | 'triggers' | 'comment_to_dm' | 'analytics' | 'training'
  const [activeTab, setActiveTab] = useState('inbox');

  // Inbox & Settings State
  const [settings, setSettings] = useState(loadResponderSettings());
  const [inbox, setInbox] = useState(() => {
    // نبدأ من localStorage فقط - لا نحقن الـ dataset تلقائياً
    return loadResponderInbox();
  });
  const [learnedInsights, setLearnedInsights] = useState(() => loadLearnedInsights());
  
  // Selected Message in Omnichannel Inbox
  const [selectedMessage, setSelectedMessage] = useState(() => {
    const initial = loadResponderInbox();
    // اختر أول رسالة حية إن وجدت، وإلا أول رسالة
    const firstLive = initial.find(m => m.isLive);
    return firstLive || initial[0] || null;
  });

  // Channel & Filter Tabs
  const [activePlatformFilter, setActivePlatformFilter] = useState('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyDraft, setReplyDraft] = useState(() => {
    const initial = loadResponderInbox();
    const first = initial && initial.length > 0 ? initial[0] : (DORA_AUTHENTIC_MESSAGES_DATASET[0] || null);
    return first ? (first.reply || first.suggestedReply || '') : '';
  });

  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Live Sync State
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);

  // Schedule Draft State
  const [draftMode, setDraftMode] = useState(settings.autoPilotMode || 'scheduled');
  const [draftStartHour, setDraftStartHour] = useState(settings.schedule?.startHour || '21:00');
  const [draftEndHour, setDraftEndHour] = useState(settings.schedule?.endHour || '09:00');
  const [draftFridayAllDay, setDraftFridayAllDay] = useState(settings.schedule?.allDayFriday !== false);
  const [draftOffHoursMsg, setDraftOffHoursMsg] = useState(
    settings.schedule?.offHoursMessage || `نشكركم لتواصلكم مع درة السيارة لقطع الغيار 🌟
نحيطكم علماً بأن رسالتكم خارج أوقات العمل الرسمية، وسيتم الرد عليكم فور بدء الدوام.
لطلباتكم واستفساراتكم، يرجى تزويدنا بـ:
🔹 نوع وموديل السيارة وسنة الصنع
🔹 اسم القطعة المطلوبة أو صورتها
🔹 رقم الهيكل (VIN) للتأكد من التوافق 100%

📞 أرقام الفروع المعتمدة:
• فرع كيا: 0539454377
• فرع الرواف هيونداي: 0530051360
• المتجر الإلكتروني والشحن: 0538834212
🛒 تصفح المتجر والطلب أونلاين: https://doracars.com/`
  );

  // Real-time Auto Reply Status
  const [autoReplyStatus, setAutoReplyStatus] = useState(() => isAutoReplyActiveNow(settings));

  useEffect(() => {
    const timer = setInterval(() => {
      setAutoReplyStatus(isAutoReplyActiveNow(settings));
    }, 30000);
    return () => clearInterval(timer);
  }, [settings]);

  // Social-Bot.io Triggers State
  const [triggersList, setTriggersList] = useState(DEFAULT_KEYWORD_TRIGGERS);

  // Comment-to-DM State
  const [commentRules, setCommentRules] = useState(DEFAULT_COMMENT_TO_DM_RULES);

  // Training Studio State
  const [rules, setRules] = useState(loadTrainingRules());
  const [guardrails, setGuardrails] = useState(loadGuardrails());

  // Customer Tag addition state (Persisted in localStorage)
  const [newTagInput, setNewTagInput] = useState('');
  const [customerTags, setCustomerTags] = useState(() => loadCustomerTags());

  // Customer team notes state (Persisted in localStorage)
  const [customerNotes, setCustomerNotes] = useState(() => loadCustomerNotes());

  // Customer custom profile attributes (phone, car, vin - Persisted in localStorage)
  const [customerProfiles, setCustomerProfiles] = useState(() => loadCustomerCustomProfiles());

  // 4-Column Professional SaaS CRM States (Karzoun / Crisp style)
  const [composerMode, setComposerMode] = useState('reply'); // 'reply' | 'note'
  const [noteDraft, setNoteDraft] = useState('');
  const [subFilter, setSubFilter] = useState('all'); // 'all' | 'unassigned' | 'mine'
  const [chatSubTab, setChatSubTab] = useState('messages'); // 'messages' | 'notifications'
  const [assignedAgents, setAssignedAgents] = useState({
    default: 'أحمد العتيبي (خدمة العملاء)'
  });
  const [assignedDepts, setAssignedDepts] = useState({
    default: 'خدمة العملاء والمبيعات'
  });
  const [closedConversations, setClosedConversations] = useState(new Set());
  const [inboxStatusFilter, setInboxStatusFilter] = useState('open'); // 'open' | 'closed' | 'all'

  // Auto-sync on mount
  useEffect(() => {
    handleLiveSync();
  }, []);

  // Sync inbox changes
  useEffect(() => {
    saveResponderInbox(inbox);
  }, [inbox]);

  // Sync settings
  useEffect(() => {
    saveResponderSettings(settings);
    setAutoReplyStatus(isAutoReplyActiveNow(settings));
  }, [settings]);

  // Toast helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Copy helper
  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('تم النسخ بنجاح! 📋');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Select message
  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    setReplyDraft(msg.reply || msg.suggestedReply || '');
  };

  // Live Meta & TikTok Sync
  const handleLiveSync = async () => {
    setIsSyncingLive(true);
    setSyncStatusMsg('جاري فحص وتحديث المحادثات الحية من صفحة فيسبوك ماسنجر...');

    try {
      const res = await syncLiveSocialData();
      const updatedInbox = loadResponderInbox();
      setInbox(updatedInbox);
      if (res.learnedInsights) {
        setLearnedInsights(res.learnedInsights);
      }

      const liveCount = updatedInbox.filter(m => m.isLive).length;
      const histCount = updatedInbox.filter(m => m.isHistorical).length;

      if (res.newCount > 0) {
        const via = res.proxyWorked ? 'عبر Cloudflare Worker ✅' : 'مباشرة من Meta ✅';
        setSyncStatusMsg(`✅ تمت المزامنة ${via}! ${liveCount} رسالة حية جديدة • ${histCount} رسالة تاريخية في الأرشيف.`);
      } else {
        setSyncStatusMsg(`📡 المزامنة تمت. لا توجد رسائل جديدة حالياً. ${liveCount} رسالة حية • ${histCount} تاريخية محفوظة.`);
      }
      setTimeout(() => setSyncStatusMsg(''), 6000);
    } catch (e) {
      setSyncStatusMsg(`⚠️ تعذّر الاتصال بـ Meta API مباشرة (CORS). للرسائل الحية يُرجى نشر Cloudflare Worker وضبط META_PROXY_URL.`);
      setTimeout(() => setSyncStatusMsg(''), 8000);
    } finally {
      setIsSyncingLive(false);
    }
  };

  // Send Reply (Meta Graph API live dispatch or manual approval)
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
          chatHistory: [
            ...(m.chatHistory || []),
            {
              id: 'rep_' + Date.now(),
              sender: 'درة السيارة',
              isPage: true,
              message: trimmedReply,
              time: new Date().toISOString()
            }
          ]
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
      chatHistory: [
        ...(prev.chatHistory || []),
        {
          id: 'rep_' + Date.now(),
          sender: 'درة السيارة',
          isPage: true,
          message: trimmedReply,
          time: new Date().toISOString()
        }
      ]
    }));

    if (selectedMessage.senderId && (selectedMessage.platform === 'meta_facebook' || selectedMessage.platform === 'meta_instagram')) {
      try {
        const isIg = selectedMessage.platform === 'meta_instagram';
        const channelName = isIg ? 'انستغرام DM' : 'فيسبوك ماسنجر';
        setSyncStatusMsg(`جاري إرسال الرد الحي إلى ${channelName}...`);
        await sendLiveReplyToMeta({
          recipientId: selectedMessage.senderId,
          messageText: trimmedReply,
          platform: selectedMessage.platform,
        });
        showToast(`🚀 تم إرسال الرد للعميل على ${channelName} حياً بنجاح!`);
        setSyncStatusMsg(`تم تسليم الرسالة إلى ${channelName}! ✅`);
        setTimeout(() => setSyncStatusMsg(''), 4000);
      } catch (err) {
        showToast('تم حفظ الرد وتجهيزه محلياً ✅');
        setSyncStatusMsg(`تم اعتماد الرد بنجاح (ملاحظة: ${err.message})`);
        setTimeout(() => setSyncStatusMsg(''), 5000);
      }
    } else {
      showToast('تم اعتماد وحفظ الرد بنجاح! ✅');
    }
  };

  // Quick Template insertion
  const handleInsertTemplate = (templateText) => {
    setReplyDraft(templateText);
    showToast('تم إدراج القالب الجاهز ⚡');
  };

  // WhatsApp transfer link generator
  const getBranchWhatsAppLink = (branchKey, msgText) => {
    const branch = DORA_SOCIAL_KNOWLEDGE.branches[branchKey];
    if (!branch) return '#';
    const phone = branch.internationalPhone.replace('+', '');
    const text = encodeURIComponent(
      `مرحباً ${branch.name}، لدي استفسار من عميل بخصوص: ${msgText || 'قطع غيار'}`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  // Add Tag (Persists to localStorage)
  const handleAddTag = (msgId, tagText) => {
    const text = (tagText || newTagInput || '').trim();
    if (!msgId || !text) return;
    setCustomerTags((prev) => {
      const current = prev[msgId] || [];
      if (current.includes(text)) return prev;
      const updated = { ...prev, [msgId]: [...current, text] };
      saveCustomerTags(updated);
      return updated;
    });
    setNewTagInput('');
    showToast(`تمت إضافة الوسم «${text}» بنجاح! 🏷️`);
  };

  // Remove Tag (Persists to localStorage)
  const handleRemoveTag = (msgId, tagToRemove) => {
    if (!msgId || !tagToRemove) return;
    setCustomerTags((prev) => {
      const current = prev[msgId] || [];
      const updated = { ...prev, [msgId]: current.filter((t) => t !== tagToRemove) };
      saveCustomerTags(updated);
      return updated;
    });
    showToast(`تم حذف الوسم «${tagToRemove}»`);
  };

  // Toggle Close / Reopen Conversation (Matching green button in reference screenshot)
  const handleToggleCloseConversation = (msgId) => {
    setClosedConversations((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
        showToast('تمت إعادة فتح المحادثة 🟢');
      } else {
        next.add(msgId);
        showToast('تم إغلاق وتوثيق المحادثة بنجاح ✓');
      }
      return next;
    });
  };

  // Save Private Internal Note (Persists to localStorage)
  const handleSavePrivateNote = (msgId, noteContent) => {
    const text = (noteContent || noteDraft || '').trim();
    if (!msgId || !text) return;
    setCustomerNotes((prev) => {
      const updated = { ...prev, [msgId]: text };
      saveCustomerNotes(updated);
      return updated;
    });
    setNoteDraft('');
    showToast('تم حفظ ملاحظة الفريق الخاصة بنجاح 📝');
  };

  // Update Customer Profile Data (Phone, Car, VIN - Persists to localStorage)
  const handleUpdateCustomerProfile = (msgId, profileData) => {
    if (!msgId || !profileData) return;
    setCustomerProfiles((prev) => {
      const updated = { ...prev, [msgId]: { ...(prev[msgId] || {}), ...profileData } };
      saveCustomerCustomProfile(msgId, profileData);
      return updated;
    });
    showToast('تم حفظ وتحديث بطاقة العميل بنجاح 💾');
  };

  // Export Customer Tags & CRM Report as CSV
  const handleExportCRMReport = () => {
    exportCustomerTagsReportCSV(inbox, customerTags, customerNotes, customerProfiles);
    showToast('جاري تصدير تقرير العملاء بصيغة Excel / CSV 📊');
  };

  // Save Schedule Settings
  const handleSaveSchedule = () => {
    const updated = {
      ...settings,
      enabled: draftMode !== 'off',
      autoPilotMode: draftMode,
      schedule: {
        enabled: draftMode === 'scheduled',
        offHoursOnly: true,
        startHour: draftStartHour,
        endHour: draftEndHour,
        allDayFriday: draftFridayAllDay,
        offHoursMessage: draftOffHoursMsg
      }
    };
    setSettings(updated);
    saveResponderSettings(updated);
    setAutoReplyStatus(isAutoReplyActiveNow(updated));
    setShowScheduleModal(false);
    showToast('تم حفظ وتطبيق إعدادات الجدولة والرد الآلي بنجاح! ⏰');
  };

  // Filter conversations
  const filteredInbox = inbox.filter((m) => {
    // Channel filter
    if (activePlatformFilter === 'meta_facebook' && m.platform !== 'meta_facebook') return false;
    if (activePlatformFilter === 'meta_instagram' && m.platform !== 'meta_instagram') return false;
    if (activePlatformFilter === 'meta_whatsapp' && m.platform !== 'meta_whatsapp') return false;
    if (activePlatformFilter === 'tiktok' && m.platform !== 'tiktok') return false;

    // Status filter
    if (activeStatusFilter === 'pending' && m.status !== 'pending') return false;
    if (activeStatusFilter === 'replied' && m.status !== 'replied') return false;
    if (activeStatusFilter === 'comment_dm' && m.channelType !== 'comment_dm') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (m.senderName || '').toLowerCase().includes(q);
      const matchText = (m.text || '').toLowerCase().includes(q);
      const matchModel = (m.leadInfo?.carModel || '').toLowerCase().includes(q);
      const matchVin = (m.leadInfo?.vin || '').toLowerCase().includes(q);
      const matchPart = (m.leadInfo?.interestType || '').toLowerCase().includes(q);
      if (!matchName && !matchText && !matchModel && !matchVin && !matchPart) return false;
    }

    return true;
  });

  // Channel counts (Strictly genuine synced items)
  const countAll = inbox.length;
  const countFacebook = inbox.filter((m) => m.platform === 'meta_facebook').length;
  const countInstagram = inbox.filter((m) => m.platform === 'meta_instagram').length;
  const countWhatsApp = inbox.filter((m) => m.platform === 'meta_whatsapp').length;
  const countTikTok = inbox.filter((m) => m.platform === 'tiktok').length;
  const countPending = inbox.filter((m) => m.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 font-sans flex flex-col antialiased selection:bg-teal-500 selection:text-white" dir="rtl">
      
      {/* ---------------- TOP NOTIFICATION TOAST ---------------- */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-teal-400/40 animate-bounce">
          <Sparkles className="w-5 h-5 text-teal-200" />
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* ---------------- 1. SOCIAL-BOT HEADER BAR ---------------- */}
      <header className="bg-[#0b1329]/95 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-40 px-5 py-3.5">
        <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-teal-500/20 border border-teal-400/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  سوشيال بوت درة السيارة
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Social-Bot.io Pro
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>المحادثات المتزامنة الحقيقية فقط (كيا • هيونداي • ديزل)</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-emerald-400 font-semibold text-[11px]">مربوط مع صفحة فيسبوك ماسنجر حياً</span>
              </p>
            </div>
          </div>

          {/* Real-time Integration Status Badges */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-blue-500/30 text-xs">
              <Facebook className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300 font-medium">ماسنجر ميتا:</span>
              <span className="text-blue-400 font-bold">{countFacebook} محادثة متزامنة</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-pink-500/30 text-xs" title="حساب انستقرام يحتاج للربط في إعدادات صفحة فيسبوك">
              <Instagram className="w-4 h-4 text-pink-400" />
              <span className="text-slate-300 font-medium">انستقرام:</span>
              <span className="text-pink-300 font-bold">بانتظار ربط الحساب</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-medium">واتساب ميتا:</span>
              <span className="text-emerald-400 font-bold">1,617 محادثة مسجلة</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
          </div>

          {/* Quick Actions & Header Controls */}
          <div className="flex items-center gap-2.5">
            
            {/* ⏰ AUTO-REPLY CONTROLLER WIDGET */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs">
              <div className="flex items-center gap-1.5 px-2 py-1">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  autoReplyStatus.isActive
                    ? 'bg-emerald-400 animate-pulse'
                    : (settings.autoPilotMode === 'scheduled' ? 'bg-amber-400' : 'bg-slate-500')
                }`}></span>
                <span className="text-[11px] font-bold text-slate-200">
                  {autoReplyStatus.isActive
                    ? 'الرد الآلي: نشط الآن'
                    : (settings.autoPilotMode === 'scheduled' ? 'الرد الآلي: استعداد' : 'الرد الآلي: معطل')}
                </span>
              </div>

              {/* Mode Selector Dropdown */}
              <select
                value={settings.autoPilotMode || 'scheduled'}
                onChange={(e) => {
                  const newMode = e.target.value;
                  const updated = {
                    ...settings,
                    autoPilotMode: newMode,
                    enabled: newMode !== 'off'
                  };
                  setSettings(updated);
                  saveResponderSettings(updated);
                  showToast(
                    newMode === 'scheduled'
                      ? `تم تفعيل الرد الآلي المجدول (${settings.schedule?.startHour || '21:00'} إلى ${settings.schedule?.endHour || '09:00'}) ⏰`
                      : newMode === 'always'
                      ? 'تم تفعيل الرد الآلي على مدار 24 ساعة 🟢'
                      : 'تم إيقاف الرد الآلي مؤقتاً ⚪'
                  );
                }}
                className="bg-slate-800 text-teal-300 font-bold text-[11px] py-1 px-2 rounded-lg border border-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="scheduled">⏰ مجدول خارج الدوام (9م - 9ص)</option>
                <option value="always">🟢 تشغيل دائم (24/7)</option>
                <option value="off">⚪ إيقاف الرد الآلي</option>
              </select>

              {/* Configure Schedule Button */}
              <button
                onClick={() => setShowScheduleModal(true)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-teal-400 hover:text-teal-200 transition-colors"
                title="تخصيص أوقات الجدولة ورسالة خارج الدوام"
              >
                <Clock className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Live Sync Button */}
            <button
              onClick={handleLiveSync}
              disabled={isSyncingLive}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-teal-900/40 transition-all border border-teal-400/30 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLive ? 'animate-spin' : ''}`} />
              <span>{isSyncingLive ? 'جاري المزامنة...' : 'مزامنة ميتا'}</span>
            </button>

            {/* Official Constitution Modal Button */}
            <button
              onClick={() => setShowPromptModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>دستور درة (17 بند)</span>
            </button>

            {/* Meta Integration Config */}
            <button
              onClick={() => setShowMetaModal(true)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
              title="إعدادات توكن ميتا"
            >
              <Settings className="w-4 h-4 text-blue-400" />
            </button>
          </div>
        </div>

        {/* Sync Status Banner (Only on secondary tabs; Inbox has its own integrated status) */}
        {syncStatusMsg && activeTab !== 'inbox' && (
          <div className="max-w-[1700px] mx-auto mt-2 px-4 py-1.5 rounded-lg bg-teal-950/70 border border-teal-500/30 text-xs text-teal-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              {syncStatusMsg}
            </span>
            <button onClick={() => setSyncStatusMsg('')} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}
      </header>

      {/* ---------------- 2. SOCIAL-BOT NAVIGATION MODULE TABS ---------------- */}
      <nav className="bg-[#0e172e] border-b border-slate-800/90 px-5 py-2">
        <div className="max-w-[1700px] mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'inbox'
                ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-lg shadow-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>صندوق المحادثات الموحد (Omnichannel Inbox)</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black">
              {countAll}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('triggers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'triggers'
                ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-lg shadow-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>مشغلات الكلمات المفتاحية (Keyword Triggers)</span>
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px]">
              {triggersList.length} مشغلات
            </span>
          </button>

          <button
            onClick={() => setActiveTab('comment_to_dm')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'comment_to_dm'
                ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-lg shadow-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Share2 className="w-4 h-4 text-blue-400" />
            <span>الرد على التعليقات للخاص (Comment-to-DM)</span>
            <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px]">
              {commentRules.length} قواعد
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-lg shadow-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>رادار التحليلات (Analytics Radar)</span>
          </button>

          <button
            onClick={() => setActiveTab('training')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'training'
                ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-lg shadow-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-pink-400" />
            <span>دستور درة واستوديو التدريب (Constitution Studio)</span>
          </button>

        </div>
      </nav>

      {/* ---------------- 3. MAIN WORKSPACE CONTAINER ---------------- */}
      <main className="flex-1 max-w-[1750px] w-full mx-auto p-4 flex flex-col">
        
        {/* ========================================================================= */}
        {/* VIEW 1: OMNICHANNEL INBOX (4-COLUMN WORLD-CLASS SAAS WORKSPACE)             */}
        {/* ========================================================================= */}
        {activeTab === 'inbox' && (
          <OmnichannelInboxView
            inbox={inbox}
            selectedMessage={selectedMessage}
            onSelectMessage={handleSelectMessage}
            activePlatformFilter={activePlatformFilter}
            onSetPlatformFilter={setActivePlatformFilter}
            searchQuery={searchQuery}
            onSetSearchQuery={setSearchQuery}
            replyDraft={replyDraft}
            onSetReplyDraft={setReplyDraft}
            onSendReply={handleSendReply}
            onInsertTemplate={handleInsertTemplate}
            onCopyText={handleCopyText}
            customerTags={customerTags}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            customerNotes={customerNotes}
            onSavePrivateNote={handleSavePrivateNote}
            customerProfiles={customerProfiles}
            onUpdateCustomerProfile={handleUpdateCustomerProfile}
            onExportCRMReport={handleExportCRMReport}
            closedConversations={closedConversations}
            onToggleCloseConversation={handleToggleCloseConversation}
            getBranchWhatsAppLink={getBranchWhatsAppLink}
            onSyncLive={handleLiveSync}
            isSyncingLive={isSyncingLive}
            syncStatusMsg={syncStatusMsg}
            counts={{
              all: countAll,
              facebook: countFacebook,
              instagram: countInstagram,
              whatsapp: countWhatsApp,
              tiktok: countTikTok,
              pending: countPending
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: KEYWORD TRIGGERS (مشغلات الكلمات المفتاحية)                        */}
        {/* ========================================================================= */}
        {activeTab === 'triggers' && (
          <div className="bg-[#0d152a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  مشغلات الكلمات المفتاحية الذكية (Keyword Triggers)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  نظام الردود الفورية بمجرد رصد كلمات محددة في رسائل العملاء (الأسعار، التقسيط، كيا، هيونداي، الديزل).
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs">
                {triggersList.length} مشغلات نشطة ومبرمجة
              </div>
            </div>

            {/* Triggers Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0b1122] text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">الكلمة المفتاحية (Keyword)</th>
                    <th className="p-3.5">الإجراء والرد المبرمج (Action)</th>
                    <th className="p-3.5">التصنيف</th>
                    <th className="p-3.5">التطابقات المسجلة</th>
                    <th className="p-3.5">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {triggersList.map((tr) => (
                    <tr key={tr.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-white">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-teal-300">
                          {tr.keyword}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-slate-200">{tr.action}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 text-[10px]">
                          {tr.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-teal-400 font-bold">{tr.matches} مرة</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          نشط تلقائياً
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: COMMENT-TO-DM ENGINE (الرد على التعليقات للخاص)                     */}
        {/* ========================================================================= */}
        {activeTab === 'comment_to_dm' && (
          <div className="bg-[#0d152a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-400" />
                  محرك الرد على التعليقات والتحويل للخاص (Comment-to-DM Engine)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  أتمتة متطورة للرد العام على تعليقات المنشورات والإعلانات وإرسال تفاصيل الأسعار ورقم الفرع في الخاص فوراً.
                </p>
              </div>

              <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold text-xs">
                مربوط مع فيسبوك ماسنجر
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commentRules.map((rule) => (
                <div key={rule.id} className="p-4 rounded-xl bg-[#0b1122] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{rule.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {rule.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-2">
                    <div>
                      <span className="text-slate-400 block text-[10px] mb-1">الكلمات المشغلة للتعليق:</span>
                      <span className="px-2 py-1 rounded bg-slate-800 text-teal-300 font-bold">{rule.triggerWords}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                      <span className="text-blue-400 font-bold block mb-1">الرد العام في التعليق:</span>
                      <p className="text-slate-200">{rule.publicReply}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-[11px]">
                      <span className="text-indigo-300 font-bold block mb-1">الرسالة الخاصة التلقائية (DM):</span>
                      <p className="text-slate-200">{rule.privateDm}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                      <span>إجمالي التحويلات المحققة:</span>
                      <span className="text-teal-400 font-bold">{rule.conversions} محادثة خاصة</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: ANALYTICS RADAR (رادار التحليلات)                                  */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="bg-[#0d152a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6 flex-1">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                رادار أداء المحادثات المتزامنة والتعلم الذاتي
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                تحليل دقيق لـ {inbox.length} محادثة عملاء حقيقية متزامنة من صفحة درة السيارة في ميتا.
              </p>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0b1122] border border-slate-800 text-center">
                <div className="text-2xl font-black text-teal-400 mb-1">{inbox.length}</div>
                <div className="text-xs text-slate-400">إجمالي المحادثات المتزامنة</div>
              </div>

              <div className="p-4 rounded-xl bg-[#0b1122] border border-slate-800 text-center">
                <div className="text-2xl font-black text-blue-400 mb-1">
                  {Math.round((inbox.filter(m => m.leadInfo?.carModel?.includes('هيونداي') || m.leadInfo?.carModel?.includes('أفانتي') || m.leadInfo?.carModel?.includes('سوناتا')).length / (inbox.length || 1)) * 100)}%
                </div>
                <div className="text-xs text-slate-400">نسبة طلبات هيونداي</div>
              </div>

              <div className="p-4 rounded-xl bg-[#0b1122] border border-slate-800 text-center">
                <div className="text-2xl font-black text-emerald-400 mb-1">
                  {Math.round((inbox.filter(m => m.leadInfo?.carModel?.includes('كيا') || m.leadInfo?.carModel?.includes('كرنفال') || m.leadInfo?.carModel?.includes('كارنز')).length / (inbox.length || 1)) * 100)}%
                </div>
                <div className="text-xs text-slate-400">نسبة طلبات كيا</div>
              </div>

              <div className="p-4 rounded-xl bg-[#0b1122] border border-slate-800 text-center">
                <div className="text-2xl font-black text-purple-400 mb-1">
                  {inbox.filter(m => m.leadInfo?.vin).length}
                </div>
                <div className="text-xs text-slate-400">أرقام هياكل VIN مسجلة</div>
              </div>
            </div>

            {/* Learned Insights List */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">الاستنتاجات الذكية المطبقة على الإيجنت:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-xs text-teal-300">أعلى طلب: كراسي المكينة وعيار زيت الديزل</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    تم ضبط الإيجنت لتقديم خيارات الكوري والأصلي فوراً وتوجيه كيا لـ 0539454377 وهيونداي لـ 0530051360.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-xs text-blue-300">شحن خارج القصيم (الرياض، الدمام، جدة)</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    الإيجنت يزود العميل فوراً برابط المتجر doracars.com ورقم هاتف المتجر 0538834212 مع خيارات الشحن.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-xs text-purple-300">أقساط تابي وتمارا</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    توضيح خيارات التقسيط على 4 دفعات بدون فوائد لجميع العملاء الذين يسألون عن الأقساط.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: CONSTITUTION & TRAINING STUDIO                                    */}
        {/* ========================================================================= */}
        {activeTab === 'training' && (
          <div className="bg-[#0d152a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-pink-400" />
                  دستور درة السيارة الرسمي واستوديو التدريب
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  القواعد الـ 17 الإلزامية ونظام حماية المخرجات (Guardrails) وقواعد توجيه الفروع الـ 3 المعتمدة.
                </p>
              </div>

              <button
                onClick={() => setShowPromptModal(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
              >
                عرض نص الدستور كاملاً
              </button>
            </div>

            {/* Constitution Rules Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rules.map((rule) => (
                <div key={rule.id} className="p-3.5 rounded-xl bg-[#0b1122] border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{rule.title}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{rule.content}</p>
                </div>
              ))}
            </div>

            {/* Guardrails Section */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                حواجز الحماية الصارمة (Guardrails):
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {guardrails.map((g) => (
                  <div key={g.id} className="p-3 rounded-xl bg-red-950/20 border border-red-800/40 text-xs text-red-200 space-y-1">
                    <div className="font-bold text-[11px] text-red-300 flex items-center gap-1">
                      <span>⛔ قاعدة حماية صارمة</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{g.rule}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ---------------- 4. MODAL: AUTO-REPLY SCHEDULE SETTINGS ---------------- */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
          <div className="bg-[#0f172a] rounded-2xl border border-slate-700 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-700/80 bg-[#0b1122] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">إعدادات وجدولة الرد الآلي (Auto-Reply)</h3>
                  <p className="text-[11px] text-slate-400">تحديد أوقات عمل الإيجنت التلقائي ورسائل خارج الدوام</p>
                </div>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto custom-scrollbar space-y-4 text-xs">
              
              {/* Current Status Box */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white mb-0.5">الحالة الحالية:</div>
                  <div className="text-teal-400 font-medium text-[11px]">{autoReplyStatus.reason}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                  autoReplyStatus.isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {autoReplyStatus.isActive ? 'نشط الآن' : 'في وضع الاستعداد'}
                </span>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-2">وضع التشغيل المطلوب:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDraftMode('scheduled')}
                    className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1 ${
                      draftMode === 'scheduled'
                        ? 'bg-teal-950/60 border-teal-400 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Clock className="w-4 h-4 text-teal-400" />
                      {draftMode === 'scheduled' && <Check className="w-3.5 h-3.5 text-teal-400" />}
                    </div>
                    <span className="font-bold text-xs text-white">مجدول خارج الدوام</span>
                    <span className="text-[10px] text-slate-400 leading-tight">ينشط من المساء للصباح</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDraftMode('always')}
                    className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1 ${
                      draftMode === 'always'
                        ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Sun className="w-4 h-4 text-emerald-400" />
                      {draftMode === 'always' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <span className="font-bold text-xs text-white">تشغيل دائم (24/7)</span>
                    <span className="text-[10px] text-slate-400 leading-tight">رد آلي على مدار الساعة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDraftMode('off')}
                    className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1 ${
                      draftMode === 'off'
                        ? 'bg-red-950/60 border-red-400 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Moon className="w-4 h-4 text-red-400" />
                      {draftMode === 'off' && <Check className="w-3.5 h-3.5 text-red-400" />}
                    </div>
                    <span className="font-bold text-xs text-white">إيقاف الرد الآلي</span>
                    <span className="text-[10px] text-slate-400 leading-tight">ردود يدوية فقط</span>
                  </button>
                </div>
              </div>

              {/* Scheduling Times (when scheduled is selected) */}
              {draftMode === 'scheduled' && (
                <div className="p-4 rounded-xl bg-[#0b1122] border border-slate-800 space-y-3">
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-teal-400" />
                    <span>تحديد فترة خارج الدوام (الرد التلقائي):</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">وقت بدء الرد الآلي في المساء:</label>
                      <input
                        type="time"
                        value={draftStartHour}
                        onChange={(e) => setDraftStartHour(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">الافتراضي: 21:00 (9:00 مساءً)</span>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">وقت انتهاء الرد الآلي في الصباح:</label>
                      <input
                        type="time"
                        value={draftEndHour}
                        onChange={(e) => setDraftEndHour(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono font-bold"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">الافتراضي: 09:00 (9:00 صباحاً)</span>
                    </div>
                  </div>

                  {/* Friday All-Day Toggle */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-200 block text-xs">تفعيل الرد الآلي طوال يوم الجمعة:</span>
                      <span className="text-[10px] text-slate-400">عطلة نهاية الأسبوع الرسمية لمعارض درة</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDraftFridayAllDay(!draftFridayAllDay)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${draftFridayAllDay ? 'bg-teal-500' : 'bg-slate-700'}`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${draftFridayAllDay ? 'right-1' : 'right-6'}`}></span>
                    </button>
                  </div>
                </div>
              )}

              {/* Off-Hours Message Template */}
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1">نص رسالة خارج أوقات الدوام التلقائية:</label>
                <textarea
                  rows={5}
                  value={draftOffHoursMsg}
                  onChange={(e) => setDraftOffHoursMsg(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-teal-500 custom-scrollbar"
                />
                <span className="text-[10px] text-slate-400">
                  تتضمن أرقام فروع كيا (0539454377)، هيونداي (0530051360)، المتجر (0538834212)، ورابط المتجر.
                </span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-700/80 bg-[#0b1122] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleSaveSchedule}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-teal-500/20"
              >
                حفظ وتطبيق إعدادات الجدولة
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ---------------- 5. MODAL: META INTEGRATION CONFIG ---------------- */}
      {showMetaModal && (
        <MetaIntegrationModal
          isOpen={showMetaModal}
          onClose={() => setShowMetaModal(false)}
          onSuccess={() => {
            setShowMetaModal(false);
            handleLiveSync();
          }}
        />
      )}

      {/* ---------------- 6. MODAL: OFFICIAL CONSTITUTION (17 RULES) ---------------- */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                الدستور ونظام التشغيل الرسمي لـ «درة السيارة لقطع الغيار»
              </h3>
              <button onClick={() => setShowPromptModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {DORA_PARTS_OFFICIAL_SYSTEM_PROMPT}
            </div>
            <div className="p-3 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setShowPromptModal(false)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
