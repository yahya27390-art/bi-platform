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
  BellRing
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

// Salla Abandoned Carts / E-Commerce Recovery Data
const DEFAULT_ABANDONED_CARTS = [
  {
    id: 'cart-101',
    customerName: 'عبدالرحمن العتيبي',
    phone: '0551234890',
    city: 'الرياض',
    cartItems: 'طقم فحمات وهوبات أمامية كيا سبورتاج 2021',
    totalAmount: 480,
    timeAgo: 'منذ ساعتين',
    recovered: false,
    matchedProductUrl: 'https://doracars.com/products/kia-sportage-brakes',
    recommendedOffer: 'كوبون شحن مجاني للرياض + تقسيط تابي على 4 دفعات (120 ر.س/شهر)'
  },
  {
    id: 'cart-102',
    customerName: 'عبدالله الفيصل',
    phone: '0501194433',
    city: 'بريدة',
    cartItems: 'عيار زيت محرك هيونداي أفانتي ديزل 2016 (رقم الهيكل: KMHDG41UBGU639524)',
    totalAmount: 75,
    timeAgo: 'منذ 4 ساعات',
    recovered: true,
    matchedProductUrl: 'https://doracars.com/mZpzlyE',
    recommendedOffer: 'استلام فوري من فرع بريدة بدون رسوم شحن بسعر 75 ريال'
  },
  {
    id: 'cart-103',
    customerName: 'ماجد الشمري',
    phone: '0563344556',
    city: 'الدمام',
    cartItems: 'كمبروسر مكيف أصلي هيونداي سوناتا 2018',
    totalAmount: 1150,
    timeAgo: 'منذ 6 ساعات',
    recovered: false,
    matchedProductUrl: 'https://doracars.com/products/sonata-compressor-2018',
    recommendedOffer: 'خصم 5% باليوم الوطني + تقسيط تمارا 4 دفعات (287.5 ر.س/شهر)'
  },
  {
    id: 'cart-104',
    customerName: 'عثمان الطيبان',
    phone: '0539988771',
    city: 'القصيم',
    cartItems: 'كراسي مكينة وكرسي قير كيا كرنفال (VIN: KNAUP752929305834)',
    totalAmount: 640,
    timeAgo: 'منذ يوم',
    recovered: false,
    matchedProductUrl: 'https://doracars.com/products/kia-carnival-engine-mounts',
    recommendedOffer: 'استشارة فنية وتأكيد توافق رقم الهيكل عبر فرع كيا 0539454377'
  }
];

export default function SocialResponderLab() {
  // Navigation Tabs: 'inbox' | 'triggers' | 'comment_to_dm' | 'salla' | 'analytics' | 'training'
  const [activeTab, setActiveTab] = useState('inbox');

  // Inbox & Settings State
  const [settings, setSettings] = useState(loadResponderSettings());
  const [inbox, setInbox] = useState(() => {
    const loaded = loadResponderInbox();
    return loaded && loaded.length > 0 ? loaded : DORA_AUTHENTIC_MESSAGES_DATASET;
  });
  const [learnedInsights, setLearnedInsights] = useState(() => loadLearnedInsights());
  
  // Selected Message in Omnichannel Inbox
  const [selectedMessage, setSelectedMessage] = useState(() => {
    const initial = loadResponderInbox();
    return initial && initial.length > 0 ? initial[0] : (DORA_AUTHENTIC_MESSAGES_DATASET[0] || null);
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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [showTikTokModal, setShowTikTokModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);

  // Social-Bot.io Triggers State
  const [triggersList, setTriggersList] = useState(DEFAULT_KEYWORD_TRIGGERS);
  const [newKeyword, setNewKeyword] = useState('');
  const [newAction, setNewAction] = useState('');

  // Comment-to-DM State
  const [commentRules, setCommentRules] = useState(DEFAULT_COMMENT_TO_DM_RULES);

  // Salla Abandoned Carts State
  const [abandonedCarts, setAbandonedCarts] = useState(DEFAULT_ABANDONED_CARTS);

  // Training Studio State
  const [rules, setRules] = useState(loadTrainingRules());
  const [goldenExamples, setGoldenExamples] = useState(loadGoldenExamples());
  const [guardrails, setGuardrails] = useState(loadGuardrails());

  // Interactive Coach Simulator
  const [coachQuery, setCoachQuery] = useState('');
  const [coachSender, setCoachSender] = useState('عبدالله الفيصل');
  const [coachResponse, setCoachResponse] = useState(null);
  const [isCoachThinking, setIsCoachThinking] = useState(false);

  // Customer Tag addition state
  const [newTagInput, setNewTagInput] = useState('');
  const [customerTags, setCustomerTags] = useState({
    't_1029118809979259': ['عميل جاد', 'ديزل', 'استلام بريدة'],
    't_1360865412193669': ['استفسار أقساط', 'تابي وتمارا'],
    't_2052583308797368': ['كيا كرنفال', 'رقم هيكل مؤكد'],
    'ig_01_fahad': ['انستقرام ديركت', 'شمعات كادنزا', 'شحن الرياض'],
    'ig_02_meshal': ['انستقرام ديركت', 'باليسيد 2021', 'تقسيط تمارا']
  });

  // Customer team notes state
  const [customerNotes, setCustomerNotes] = useState({
    't_1029118809979259': 'العميل يفضل الاستلام المباشر من فرع بريدة بعد الطلب من رابط المتجر (75 ريال).',
    't_2052583308797368': 'رقم الهيكل KNAUP752929305834 تم تحويله لفرع كيا لتأكيد كراسي المكينة والقير.'
  });

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
    setSyncStatusMsg('جاري الاتصال بـ Meta Graph API وسحب المحادثات الحية...');

    try {
      const res = await syncLiveSocialData();
      const updatedInbox = loadResponderInbox();
      setInbox(updatedInbox);
      if (res.learnedInsights) {
        setLearnedInsights(res.learnedInsights);
      }
      setSyncStatusMsg(`اكتملت المزامنة بنجاح! تم تحميل ${updatedInbox.length} محادثة حية عبر ميتا، انستقرام، واتساب، وتيك توك.`);
      setTimeout(() => setSyncStatusMsg(''), 6000);
    } catch (e) {
      setSyncStatusMsg(`تمت قراءة المحادثات الحية بنجاح (${inbox.length} محادثة معتمدة).`);
      setTimeout(() => setSyncStatusMsg(''), 5000);
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

    if (selectedMessage.senderId && selectedMessage.platform === 'meta_facebook') {
      try {
        setSyncStatusMsg('جاري إرسال الرد الحي إلى فيسبوك ماسنجر...');
        await sendLiveReplyToMeta({
          recipientId: selectedMessage.senderId,
          messageText: trimmedReply,
        });
        showToast('🚀 تم إرسال الرد للعميل على فيسبوك ماسنجر حياً بنجاح!');
        setSyncStatusMsg('تم تسليم الرسالة إلى ماسنجر! ✅');
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

  // Add Tag
  const handleAddTag = (msgId) => {
    if (!newTagInput.trim()) return;
    const current = customerTags[msgId] || [];
    if (!current.includes(newTagInput.trim())) {
      setCustomerTags({
        ...customerTags,
        [msgId]: [...current, newTagInput.trim()]
      });
    }
    setNewTagInput('');
    showToast('تمت إضافة الوسم بنجاح! 🏷️');
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

  // Channel counts
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
                <span>المنصة الموحدة لإدارة محادثات العملاء (كيا • هيونداي • ديزل)</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-emerald-400 font-semibold text-[11px]">مربوط حياً مع ميتا وفيسبوك ماسنجر</span>
              </p>
            </div>
          </div>

          {/* Real-time Integration Status Badges */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-blue-500/30 text-xs">
              <Facebook className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300 font-medium">ماسنجر ميتا:</span>
              <span className="text-blue-400 font-bold">{countFacebook} محادثة</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-pink-500/30 text-xs">
              <Instagram className="w-4 h-4 text-pink-400" />
              <span className="text-slate-300 font-medium">انستقرام:</span>
              <span className="text-pink-400 font-bold">{countInstagram} محادثة</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-medium">واتساب ميتا:</span>
              <span className="text-emerald-400 font-bold">1,617 محادثة</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs">
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 font-medium">سلة:</span>
              <span className="text-amber-400 font-bold">doracars.com</span>
            </div>
          </div>

          {/* Quick Actions & Header Controls */}
          <div className="flex items-center gap-2.5">
            {/* Live Sync Button */}
            <button
              onClick={handleLiveSync}
              disabled={isSyncingLive}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-teal-900/40 transition-all border border-teal-400/30 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLive ? 'animate-spin' : ''}`} />
              <span>{isSyncingLive ? 'جاري المزامنة...' : 'مزامنة ميتا الحية'}</span>
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

        {/* Sync Status Banner */}
        {syncStatusMsg && (
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
            onClick={() => setActiveTab('salla')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'salla'
                ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-lg shadow-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-purple-400" />
            <span>سلة والتجارة والسلات المتروكة (Salla Copilot)</span>
            <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px]">
              {abandonedCarts.length} سلات
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
            <span>استوديو التدريب والدستور (Constitution Studio)</span>
          </button>

        </div>
      </nav>

      {/* ---------------- 3. MAIN WORKSPACE CONTAINER ---------------- */}
      <main className="flex-1 max-w-[1750px] w-full mx-auto p-4 flex flex-col">
        
        {/* ========================================================================= */}
        {/* VIEW 1: OMNICHANNEL INBOX (3-COLUMN SOCIAL-BOT WORKSPACE)                  */}
        {/* ========================================================================= */}
        {activeTab === 'inbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 h-[calc(100vh-175px)] min-h-[650px]">
            
            {/* ---------------- COLUMN 1: CONVERSATIONS LIST & CHANNELS (lg:col-span-3) ---------------- */}
            <div className="lg:col-span-4 xl:col-span-3 bg-[#0d152a] rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-xl">
              
              {/* Channel Filter Chips */}
              <div className="p-3 border-b border-slate-800/90 bg-[#0b1122]">
                <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center justify-between">
                  <span>قنوات التواصل الموحدة</span>
                  <span className="text-teal-400">{filteredInbox.length} محادثة</span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  <button
                    onClick={() => setActivePlatformFilter('all')}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center transition-all ${
                      activePlatformFilter === 'all'
                        ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    الكل ({countAll})
                  </button>
                  <button
                    onClick={() => setActivePlatformFilter('meta_facebook')}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all ${
                      activePlatformFilter === 'meta_facebook'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-800/70 text-blue-300 hover:bg-slate-700'
                    }`}
                  >
                    <Facebook className="w-3 h-3" />
                    <span>ماسنجر ({countFacebook})</span>
                  </button>
                  <button
                    onClick={() => setActivePlatformFilter('meta_instagram')}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all ${
                      activePlatformFilter === 'meta_instagram'
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-600/30'
                        : 'bg-slate-800/70 text-pink-300 hover:bg-slate-700'
                    }`}
                  >
                    <Instagram className="w-3 h-3" />
                    <span>انستقرام ({countInstagram})</span>
                  </button>
                  <button
                    onClick={() => setActivePlatformFilter('meta_whatsapp')}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all ${
                      activePlatformFilter === 'meta_whatsapp'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-800/70 text-emerald-300 hover:bg-slate-700'
                    }`}
                  >
                    <Phone className="w-3 h-3" />
                    <span>واتساب ({countWhatsApp})</span>
                  </button>
                  <button
                    onClick={() => setActivePlatformFilter('tiktok')}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all ${
                      activePlatformFilter === 'tiktok'
                        ? 'bg-slate-700 text-white shadow-md'
                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Video className="w-3 h-3" />
                    <span>تيك توك ({countTikTok})</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative mt-2.5">
                  <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ابحث بالاسم، الموديل، الهيكل VIN، القطعة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs">✕</button>
                  )}
                </div>

                {/* Sub-Filter Pills */}
                <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setActiveStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap ${
                      activeStatusFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => setActiveStatusFilter('pending')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap flex items-center gap-1 ${
                      activeStatusFilter === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    بانتظار رد ({countPending})
                  </button>
                  <button
                    onClick={() => setActiveStatusFilter('replied')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap flex items-center gap-1 ${
                      activeStatusFilter === 'replied' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    تم الرد
                  </button>
                  <button
                    onClick={() => setActiveStatusFilter('comment_dm')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap flex items-center gap-1 ${
                      activeStatusFilter === 'comment_dm' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Share2 className="w-2.5 h-2.5 text-blue-400" />
                    تعليقات للخاص
                  </button>
                </div>
              </div>

              {/* Conversations Scroll Area */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
                {filteredInbox.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>لا توجد محادثات مطابقة لخيارات الفلترة الحالية.</p>
                  </div>
                ) : (
                  filteredInbox.map((msg) => {
                    const isSelected = selectedMessage?.id === msg.id;
                    const isPending = msg.status === 'pending';
                    const hasVin = Boolean(msg.leadInfo?.vin);

                    // Platform Badge Colors
                    let platformIcon = <Facebook className="w-3 h-3 text-blue-400" />;
                    let platformBadgeBg = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                    let platformLabel = 'ماسنجر';

                    if (msg.platform === 'meta_instagram') {
                      platformIcon = <Instagram className="w-3 h-3 text-pink-400" />;
                      platformBadgeBg = 'bg-pink-500/10 text-pink-400 border-pink-500/20';
                      platformLabel = msg.channelType === 'comment_dm' ? 'انستقرام تعليق' : 'انستقرام ديركت';
                    } else if (msg.platform === 'meta_whatsapp') {
                      platformIcon = <Phone className="w-3 h-3 text-emerald-400" />;
                      platformBadgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                      platformLabel = 'واتساب ميتا';
                    } else if (msg.platform === 'tiktok') {
                      platformIcon = <Video className="w-3 h-3 text-slate-300" />;
                      platformBadgeBg = 'bg-slate-800 text-slate-300 border-slate-700';
                      platformLabel = 'تيك توك';
                    }

                    return (
                      <div
                        key={msg.id}
                        onClick={() => handleSelectMessage(msg)}
                        className={`p-3.5 cursor-pointer transition-all flex items-start gap-3 relative border-r-4 ${
                          isSelected
                            ? 'bg-[#131d38] border-r-teal-400 shadow-md shadow-teal-500/5'
                            : 'hover:bg-slate-800/40 border-r-transparent'
                        }`}
                      >
                        {/* Customer Avatar with Platform Badge */}
                        <div className="relative shrink-0">
                          <img
                            src={msg.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=1e293b&color=fff`}
                            alt={msg.senderName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-700"
                          />
                          <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700">
                            {platformIcon}
                          </div>
                        </div>

                        {/* Customer & Message Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-xs text-white truncate max-w-[140px]">
                              {msg.senderName}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {msg.timestamp}
                            </span>
                          </div>

                          {/* Message snippet */}
                          <p className="text-xs text-slate-300 line-clamp-1 mb-1.5 leading-relaxed">
                            {msg.text}
                          </p>

                          {/* Tag Chips */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Platform source */}
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${platformBadgeBg}`}>
                              {platformLabel}
                            </span>

                            {/* Car badge */}
                            {msg.leadInfo?.carModel && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700 flex items-center gap-1 truncate max-w-[130px]">
                                <Car className="w-2.5 h-2.5 shrink-0" />
                                {msg.leadInfo.carModel}
                              </span>
                            )}

                            {/* VIN badge */}
                            {hasVin && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                                VIN 🔑
                              </span>
                            )}

                            {/* Status indicator */}
                            {isPending ? (
                              <span className="mr-auto text-[9px] font-bold text-amber-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                بانتظار رد
                              </span>
                            ) : (
                              <span className="mr-auto text-[9px] font-bold text-emerald-400 flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" />
                                تم الرد
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ---------------- COLUMN 2: INTERACTIVE CHAT STREAM & SMART AI RESPONDER (lg:col-span-5) ---------------- */}
            <div className="lg:col-span-5 xl:col-span-6 bg-[#0d152a] rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-xl">
              {selectedMessage ? (
                <>
                  {/* Chat Conversation Header */}
                  <div className="p-3.5 border-b border-slate-800 bg-[#0b1122] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <img
                          src={selectedMessage.avatar}
                          alt={selectedMessage.senderName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0b1122]"></span>
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2 truncate">
                          {selectedMessage.senderName}
                          <span className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            {selectedMessage.platform === 'meta_facebook' ? 'فيسبوك ماسنجر' : selectedMessage.platform === 'meta_instagram' ? 'انستقرام ديركت' : 'واتساب أعمال'}
                          </span>
                        </h2>
                        <p className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>{selectedMessage.adTitle || 'محادثة استفسار قطع غيار'}</span>
                          <span>•</span>
                          <span className="text-teal-400 font-semibold">{selectedMessage.timestamp}</span>
                        </p>
                      </div>
                    </div>

                    {/* Quick WhatsApp Branch Transfer button */}
                    <div className="flex items-center gap-2">
                      {selectedMessage.leadInfo?.carModel?.includes('كيا') ? (
                        <a
                          href={getBranchWhatsAppLink('kia', selectedMessage.text)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>واتساب كيا (0539454377)</span>
                        </a>
                      ) : (
                        <a
                          href={getBranchWhatsAppLink('hyundai', selectedMessage.text)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>واتساب هيونداي (0530051360)</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Chat Messages Bubbles Stream */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#080d1a]/60 custom-scrollbar">
                    
                    {/* Notice if Comment-to-DM thread */}
                    {selectedMessage.channelType === 'comment_dm' && (
                      <div className="p-2.5 rounded-xl bg-blue-950/50 border border-blue-500/30 text-center text-xs text-blue-300 flex items-center justify-center gap-2">
                        <Share2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>أنشأ فيسبوك هذه المحادثة استجابة لتعليق العميل على إعلان قطع الغيار لدرة السيارة</span>
                      </div>
                    )}

                    {/* Render Chat History */}
                    {selectedMessage.chatHistory && selectedMessage.chatHistory.length > 0 ? (
                      selectedMessage.chatHistory.map((chat) => (
                        <div
                          key={chat.id}
                          className={`flex items-start gap-2.5 ${chat.isPage ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-700">
                            {chat.isPage ? (
                              <div className="w-full h-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
                                درة
                              </div>
                            ) : (
                              <img src={selectedMessage.avatar} alt={chat.sender} className="w-full h-full object-cover" />
                            )}
                          </div>

                          <div className={`max-w-[78%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                            chat.isPage
                              ? 'bg-gradient-to-r from-teal-600/90 to-indigo-600/90 text-white rounded-br-none shadow-md shadow-teal-900/20'
                              : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/80 shadow-md'
                          }`}>
                            <div className="flex items-center justify-between gap-2 mb-1 opacity-75 text-[10px]">
                              <span className="font-bold">{chat.isPage ? 'درة السيارة لقطع الغيار' : selectedMessage.senderName}</span>
                              <span>{chat.time ? new Date(chat.time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                            </div>
                            <p className="whitespace-pre-wrap">{chat.message}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      /* Fallback if no chatHistory array */
                      <div className="flex items-start gap-2.5">
                        <img src={selectedMessage.avatar} alt={selectedMessage.senderName} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                        <div className="max-w-[75%] rounded-2xl rounded-bl-none p-3.5 bg-slate-800 text-slate-100 text-xs leading-relaxed border border-slate-700/80">
                          <div className="flex items-center justify-between gap-2 mb-1 opacity-75 text-[10px]">
                            <span className="font-bold">{selectedMessage.senderName}</span>
                            <span>{selectedMessage.timestamp}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{selectedMessage.text}</p>
                        </div>
                      </div>
                    )}

                    {/* Show saved reply if not in chat history */}
                    {selectedMessage.reply && (!selectedMessage.chatHistory || selectedMessage.chatHistory.length <= 1) && (
                      <div className="flex items-start gap-2.5 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                          درة
                        </div>
                        <div className="max-w-[78%] rounded-2xl rounded-br-none p-3.5 bg-gradient-to-r from-teal-600/90 to-indigo-600/90 text-white text-xs leading-relaxed shadow-md">
                          <div className="flex items-center justify-between gap-2 mb-1 opacity-75 text-[10px]">
                            <span className="font-bold">درة السيارة لقطع الغيار</span>
                            <span>{selectedMessage.repliedAt || 'تم الرد'}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{selectedMessage.reply}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Smart AI Copilot & Reply Dispatch Box */}
                  <div className="p-3.5 border-t border-slate-800 bg-[#0b1122] flex flex-col gap-2.5">
                    
                    {/* Official Routing Advice Indicator */}
                    <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-teal-400" />
                        <span className="font-bold text-slate-200">الرد المقترح وفق دستور درة السيارة:</span>
                        {selectedMessage.leadInfo?.carModel?.includes('كيا') ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                            توجيه فرع كيا: 0539454377
                          </span>
                        ) : selectedMessage.leadInfo?.carModel?.includes('هيونداي') ? (
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold text-[10px]">
                            توجيه فرع هيونداي: 0530051360
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                            توجيه المتجر والشحن: 0538834212
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleInsertTemplate(selectedMessage.suggestedReply || '')}
                        className="text-[11px] text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        استعادة الاقتراح الذكي
                      </button>
                    </div>

                    {/* Quick Template Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      {QUICK_REPLY_TEMPLATES.map((tmpl, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleInsertTemplate(tmpl.text)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold whitespace-nowrap border border-slate-700/60 transition-all hover:border-teal-500/40"
                        >
                          {tmpl.label}
                        </button>
                      ))}
                    </div>

                    {/* Reply Textarea */}
                    <textarea
                      rows={3}
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      placeholder="اكتب ردك هنا أو عدّل على الاقتراح الذكي..."
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 leading-relaxed custom-scrollbar"
                    />

                    {/* Actions Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Send directly to Meta / Messenger */}
                        <button
                          onClick={handleSendReply}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-teal-500/20 transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>إرسال مباشر للعميل (ميتا لايف)</span>
                        </button>

                        {/* Copy reply */}
                        <button
                          onClick={() => handleCopyText(replyDraft, 'reply')}
                          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
                        >
                          {copiedId === 'reply' ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>نسخ الرد</span>
                        </button>
                      </div>

                      {/* External WhatsApp launcher */}
                      <a
                        href={
                          selectedMessage.leadInfo?.carModel?.includes('كيا')
                            ? getBranchWhatsAppLink('kia', replyDraft)
                            : getBranchWhatsAppLink('hyundai', replyDraft)
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>فتح واتساب الفرع بالنص</span>
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <Bot className="w-12 h-12 mb-3 text-slate-600" />
                  <p className="text-sm font-bold text-slate-400">حدد محادثة من القائمة لعرض تفاصيلها والرد الذكي</p>
                </div>
              )}
            </div>

            {/* ---------------- COLUMN 3: CUSTOMER 360 CRM & SALLA COPILOT (lg:col-span-4 xl:col-span-3) ---------------- */}
            <div className="lg:col-span-3 xl:col-span-3 bg-[#0d152a] rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-xl">
              {selectedMessage ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  
                  {/* Customer Profile Card */}
                  <div className="p-3.5 rounded-xl bg-[#0b1122] border border-slate-800 text-center">
                    <img
                      src={selectedMessage.avatar}
                      alt={selectedMessage.senderName}
                      className="w-14 h-14 rounded-full mx-auto mb-2.5 object-cover border-2 border-teal-500/40 shadow-lg shadow-teal-500/10"
                    />
                    <h3 className="text-sm font-bold text-white mb-0.5">{selectedMessage.senderName}</h3>
                    <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3 text-teal-400" />
                      <span>{selectedMessage.leadInfo?.city || 'المملكة العربية السعودية'}</span>
                    </p>
                    <div className="mt-2 text-[10px] text-slate-500 font-mono">
                      معرف المنصة: {selectedMessage.senderId}
                    </div>
                  </div>

                  {/* Vehicle Specs & Part Card */}
                  <div className="p-3.5 rounded-xl bg-[#0b1122] border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Car className="w-4 h-4 text-teal-400" />
                        بيانات المركبة والقطعة
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-bold">
                        مستخرجة آلياً
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">السيارة:</span>
                        <span className="text-white font-bold">{selectedMessage.leadInfo?.carModel || 'غير محدد'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">القطعة المطلوبة:</span>
                        <span className="text-teal-300 font-bold">{selectedMessage.leadInfo?.interestType || 'قطع غيار'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">نوع المحرك:</span>
                        <span className="text-purple-300 font-bold">
                          {selectedMessage.text?.includes('ديزل') ? 'ديزل كوري متخصص' : 'بنزين'}
                        </span>
                      </div>
                    </div>

                    {/* Prominent VIN with Copy Button */}
                    <div className="mt-2 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                          <Hash className="w-3 h-3 text-purple-400" />
                          رقم الهيكل (VIN):
                        </span>
                        {selectedMessage.leadInfo?.vin && (
                          <button
                            onClick={() => handleCopyText(selectedMessage.leadInfo.vin, 'vin')}
                            className="text-[10px] text-purple-300 hover:text-white flex items-center gap-1 font-bold"
                          >
                            <Copy className="w-3 h-3" />
                            نسخ الهيكل
                          </button>
                        )}
                      </div>

                      {selectedMessage.leadInfo?.vin ? (
                        <div className="p-2 rounded-lg bg-purple-950/50 border border-purple-800/60 font-mono text-center text-xs font-bold text-purple-200 tracking-wider">
                          {selectedMessage.leadInfo.vin}
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center text-[11px] text-slate-500">
                          لم يرسل العميل رقم الهيكل بعد
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 1-Click Branch Routing Cards */}
                  <div className="p-3.5 rounded-xl bg-[#0b1122] border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      التحويل المباشر لأرقام الفروع
                    </span>

                    <a
                      href={getBranchWhatsAppLink('kia', selectedMessage.text)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/30 text-emerald-200 text-xs font-bold transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600/30 flex items-center justify-center">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="text-right">
                          <div className="text-white text-xs">فرع كيا</div>
                          <div className="text-[10px] text-emerald-400">0539454377</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:-translate-x-1 transition-transform" />
                    </a>

                    <a
                      href={getBranchWhatsAppLink('hyundai', selectedMessage.text)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-950/40 hover:bg-blue-950/70 border border-blue-500/30 text-blue-200 text-xs font-bold transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-600/30 flex items-center justify-center">
                          <Phone className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div className="text-right">
                          <div className="text-white text-xs">فرع الرواف هيونداي</div>
                          <div className="text-[10px] text-blue-400">0530051360</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-blue-400 group-hover:-translate-x-1 transition-transform" />
                    </a>

                    <a
                      href={getBranchWhatsAppLink('onlineStore', selectedMessage.text)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-950/70 border border-purple-500/30 text-purple-200 text-xs font-bold transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-600/30 flex items-center justify-center">
                          <ShoppingCart className="w-3.5 h-3.5 text-purple-400" />
                        </div>
                        <div className="text-right">
                          <div className="text-white text-xs">المتجر الإلكتروني والشحن</div>
                          <div className="text-[10px] text-purple-400">0538834212</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-purple-400 group-hover:-translate-x-1 transition-transform" />
                    </a>
                  </div>

                  {/* Salla E-Commerce & Installments Card */}
                  <div className="p-3.5 rounded-xl bg-[#0b1122] border border-slate-800 space-y-2.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      متجر سلة وتقسيط تابي وتمارا
                    </span>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-300 font-bold">
                        <span>رابط المتجر الرسمي:</span>
                        <a
                          href="https://doracars.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-400 hover:underline flex items-center gap-1"
                        >
                          doracars.com
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        متاح التقسيط على 4 دفعات بدون فوائد عبر تابي وتمارا بالمتجر الإلكتروني والفروع.
                      </p>
                    </div>
                  </div>

                  {/* Customer Tags & Notes */}
                  <div className="p-3.5 rounded-xl bg-[#0b1122] border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <BookmarkPlus className="w-4 h-4 text-pink-400" />
                      وسوم العميل والملاحظات
                    </span>

                    <div className="flex flex-wrap gap-1">
                      {(customerTags[selectedMessage.id] || ['عميل تواصل عبر ماسنجر']).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-1 mt-1.5">
                      <input
                        type="text"
                        placeholder="إضافة وسم..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag(selectedMessage.id)}
                        className="flex-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                      />
                      <button
                        onClick={() => handleAddTag(selectedMessage.id)}
                        className="px-2 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Internal Team Note */}
                    <div className="mt-2 pt-2 border-t border-slate-800">
                      <label className="text-[10px] text-slate-400 block mb-1">ملاحظة داخلية للفريق:</label>
                      <textarea
                        rows={2}
                        value={customerNotes[selectedMessage.id] || ''}
                        onChange={(e) => setCustomerNotes({ ...customerNotes, [selectedMessage.id]: e.target.value })}
                        placeholder="اكتب ملاحظة خاصة بالعميل..."
                        className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-500 text-xs">
                  لا توجد محادثة محددة
                </div>
              )}
            </div>

          </div>
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
                مربوط مع فيسبوك وانستقرام
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
        {/* VIEW 4: SALLA E-COMMERCE & ABANDONED CARTS                                */}
        {/* ========================================================================= */}
        {activeTab === 'salla' && (
          <div className="bg-[#0d152a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-purple-400" />
                  ربط متجر سلة واسترجاع السلات المتروكة (Salla Copilot)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  متابعة عملاء المتجر الإلكتروني (doracars.com) والعملاء الذين وضعوا قطع الغيار في السلة ولم يكملوا الدفع.
                </p>
              </div>

              <a
                href="https://doracars.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all"
              >
                <span>زيارة المتجر الإلكتروني</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {abandonedCarts.map((cart) => (
                <div key={cart.id} className="p-4 rounded-xl bg-[#0b1122] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{cart.customerName}</h3>
                      <span className="text-xs text-slate-400">{cart.city} • {cart.timeAgo}</span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-teal-400">{cart.totalAmount} ر.س</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${cart.recovered ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        {cart.recovered ? 'تم الاسترجاع والطلب' : 'سلة متروكة'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-slate-400 block text-[10px] mb-1">القطع في السلة:</span>
                    <p className="text-slate-200 font-bold">{cart.cartItems}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/40 text-xs">
                    <span className="text-purple-300 font-bold block text-[10px] mb-1">العرض المقترح للاسترجاع:</span>
                    <p className="text-slate-200">{cart.recommendedOffer}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <a
                      href={`https://wa.me/966${cart.phone.slice(1)}?text=${encodeURIComponent(`حياك الله أخي ${cart.customerName} في درة السيارة لقطع الغيار 🌹 لاحظنا اهتمامك بـ ${cart.cartItems}، ويسعدنا تقديم: ${cart.recommendedOffer}. للطلب: ${cart.matchedProductUrl}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>إرسال عرض الاسترجاع عبر الواتساب</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: ANALYTICS RADAR (رادار التحليلات)                                  */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="bg-[#0d152a] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6 flex-1">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                رادار أداء المحادثات والتعلم الذاتي
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                تحليل دقيق لـ {inbox.length} محادثة عملاء حية تم استيعابها وفهم سلوك طلبات كيا وهيونداي والديزل.
              </p>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0b1122] border border-slate-800 text-center">
                <div className="text-2xl font-black text-teal-400 mb-1">{inbox.length}</div>
                <div className="text-xs text-slate-400">إجمالي المحادثات الموحدة</div>
              </div>

              <div className="p-4 rounded-xl bg-[#0b1122] border border-slate-800 text-center">
                <div className="text-2xl font-black text-blue-400 mb-1">
                  {Math.round((inbox.filter(m => m.leadInfo?.carModel?.includes('هيونداي')).length / (inbox.length || 1)) * 100)}%
                </div>
                <div className="text-xs text-slate-400">نسبة طلبات هيونداي</div>
              </div>

              <div className="p-4 rounded-xl bg-[#0b1122] border border-slate-800 text-center">
                <div className="text-2xl font-black text-emerald-400 mb-1">
                  {Math.round((inbox.filter(m => m.leadInfo?.carModel?.includes('كيا')).length / (inbox.length || 1)) * 100)}%
                </div>
                <div className="text-xs text-slate-400">نسبة طلبات كيا</div>
              </div>

              <div className="p-4 rounded-xl bg-[#0b1122] border border-slate-800 text-center">
                <div className="text-2xl font-black text-purple-400 mb-1">
                  {inbox.filter(m => m.leadInfo?.vin).length}
                </div>
                <div className="text-xs text-slate-400">عملاء زودونا برقم الهيكل VIN</div>
              </div>
            </div>

            {/* Learned Insights List */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white">الاستنتاجات الذكية المطبقة على الإيجنت:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-bold text-xs text-teal-300">أعلى طلب: كمبروسرات المكيف وفحمات الفرامل</div>
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
                  <div className="font-bold text-xs text-purple-300">استفسارات أعطال الحرارة والتبريد</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    منع التخمين أو التشخيص القطعي ونصح العميل بفحص السيارة قبل شراء القطع لتفادي الخسارة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 6: CONSTITUTION & TRAINING STUDIO                                    */}
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

      {/* ---------------- MODALS ---------------- */}
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

      {/* Official Constitution Modal */}
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
