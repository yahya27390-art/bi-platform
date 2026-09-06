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
  Plus
} from 'lucide-react';
import {
  loadResponderSettings,
  saveResponderSettings,
  loadResponderInbox,
  saveResponderInbox,
  generateSmartSocialReply,
  analyzeCustomerText,
  QUICK_REPLY_TEMPLATES,
  DORA_SOCIAL_KNOWLEDGE
} from '../lib/socialResponderAgent';
import { loadMetaConfig } from '../lib/metaIntegration';
import { loadTikTokConfig } from '../lib/tiktokIntegration';
import MetaIntegrationModal from '../components/shared/MetaIntegrationModal';
import TikTokIntegrationModal from '../components/shared/TikTokIntegrationModal';

export default function SocialResponderLab() {
  const [settings, setSettings] = useState(loadResponderSettings());
  const [inbox, setInbox] = useState(loadResponderInbox());
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [activePlatformFilter, setActivePlatformFilter] = useState('all'); // 'all' | 'meta_instagram' | 'meta_whatsapp' | 'tiktok' | 'meta_facebook'
  const [activeStatusFilter, setActiveStatusFilter] = useState('all'); // 'all' | 'pending' | 'replied' | 'leads'
  const [searchQuery, setSearchQuery] = useState('');

  // Editable reply draft in modal / panel
  const [replyDraft, setReplyDraft] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [showTikTokModal, setShowTikTokModal] = useState(false);

  // Live Simulator state
  const [simText, setSimText] = useState('');
  const [simSender, setSimSender] = useState('عبدالعزيز التميمي');
  const [simPlatform, setSimPlatform] = useState('tiktok');
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

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

  // Handle selecting message
  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    setReplyDraft(msg.reply || msg.suggestedReply || '');
  };

  // Generate or Regenerate AI Reply
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
    }, 450);
  };

  // Send Approved Reply
  const handleSendReply = () => {
    if (!selectedMessage || !replyDraft.trim()) return;

    const updated = inbox.map((m) => {
      if (m.id === selectedMessage.id) {
        return {
          ...m,
          reply: replyDraft.trim(),
          status: 'replied',
          repliedAt: 'الآن (رد معتمد)',
        };
      }
      return m;
    });

    setInbox(updated);
    setSelectedMessage((prev) => ({
      ...prev,
      reply: replyDraft.trim(),
      status: 'replied',
      repliedAt: 'الآن (رد معتمد)',
    }));
  };

  // Run Simulator
  const handleRunSimulator = () => {
    if (!simText.trim()) return;
    setSimLoading(true);

    setTimeout(() => {
      const analysis = analyzeCustomerText(simText);
      const generatedReply = generateSmartSocialReply(simText, simSender, simPlatform);
      setSimResult({
        analysis,
        reply: generatedReply,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      });
      setSimLoading(false);
    }, 400);
  };

  // Add Simulator entry to inbox
  const handleAddSimToInbox = () => {
    if (!simResult || !simText.trim()) return;

    const newEntry = {
      id: `sim-${Date.now()}`,
      platform: simPlatform,
      channelType: simPlatform === 'tiktok' ? 'ad_comment' : simPlatform === 'meta_whatsapp' ? 'whatsapp' : 'dm',
      senderName: `${simSender} (@simulated_user)`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      text: simText,
      timestamp: 'الآن',
      rawTime: new Date().toISOString(),
      status: settings.autoPilotMode ? 'replied' : 'pending',
      intent: simResult.analysis.intent,
      sentiment: simResult.analysis.sentiment,
      adTitle: simPlatform === 'tiktok' ? 'تجربة إعلان تيك توك نشط' : 'تجربة إعلان ميتا نشط',
      suggestedReply: simResult.reply,
      reply: settings.autoPilotMode ? simResult.reply : '',
      leadInfo: simResult.analysis.leadInfo,
    };

    setInbox([newEntry, ...inbox]);
    setSelectedMessage(newEntry);
    setReplyDraft(newEntry.reply || newEntry.suggestedReply);
  };

  // Filter messages
  const filteredInbox = inbox.filter((m) => {
    // Platform filter
    if (activePlatformFilter !== 'all' && m.platform !== activePlatformFilter) {
      return false;
    }
    // Status filter
    if (activeStatusFilter === 'pending' && m.status !== 'pending') return false;
    if (activeStatusFilter === 'replied' && m.status !== 'replied') return false;
    if (activeStatusFilter === 'leads') {
      const hasPhone = !!m.leadInfo?.phone;
      const isBuying = m.intent === 'purchase_financing' || m.intent === 'spare_parts';
      if (!hasPhone && !isBuying) return false;
    }
    // Search query
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

  // Calculate Metrics
  const totalCount = inbox.length;
  const pendingCount = inbox.filter((m) => m.status === 'pending').length;
  const repliedCount = inbox.filter((m) => m.status === 'replied').length;
  const autoRate = totalCount > 0 ? Math.round((repliedCount / totalCount) * 100) : 0;
  const hotLeadsCount = inbox.filter(
    (m) => m.intent === 'purchase_financing' || !!m.leadInfo?.phone
  ).length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner / Hero Header */}
      <div className="rounded-3xl border border-slate-800/90 bg-gradient-to-br from-[#0c1527] via-[#091122] to-[#111f3d] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Background glow & accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-bold font-mono flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-blue-400" />
                <span>SOCIAL AI RESPONDER</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
                {settings.autoPilotMode ? 'الرد الآلي الفوري مفعّل 🟢' : 'الإشراف البشري الذكي 🛡️'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-3">
              <span>إيجنت الرد الذكي على الرسائل والتعليقات</span>
              <span className="text-sm font-normal text-slate-400 font-mono hidden sm:inline">
                (Meta & TikTok)
              </span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              إدارة الردود الآلية والمحادثات المباشرة لعملاء درة للسيارات عبر إنستقرام، فيسبوك، واتساب، وتيك توك، بأسلوب سعودي راقٍ واحترافي يخدم مبيعات المعرض ومتجر سلة.
            </p>
          </div>

          {/* Quick Action Buttons & Status Indicators */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Meta status */}
            <button
              onClick={() => setShowMetaModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-medium transition-all shadow-sm"
              title="إعدادات وتفاصيل ربط ميتا"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span>ميتا وواتساب: متصل 🟢</span>
            </button>

            {/* TikTok status */}
            <button
              onClick={() => setShowTikTokModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-all shadow-sm"
              title="إعدادات وتفاصيل ربط تيك توك"
            >
              <Video className="w-3.5 h-3.5 text-[#00f2fe]" />
              <span>تيك توك: متصل 🟢</span>
            </button>

            {/* Settings button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all shadow"
            >
              <Settings className="w-3.5 h-3.5 text-teal-400" />
              <span>إعدادات الإيجنت</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>إجمالي الاستفسارات</span>
              <MessageSquare className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">{totalCount}</div>
            <div className="text-[11px] text-slate-400">منصات ميتا وتيك توك</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>يحتاج رداً</span>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">{pendingCount}</div>
            <div className="text-[11px] text-amber-400/80">في انتظار الاعتماد / الإرسال</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>نسبة الرد الذكي</span>
              <Zap className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-teal-300 font-mono">{autoRate}%</div>
            <div className="text-[11px] text-teal-400/80">متوسط السرعة &lt; 25 ثانية</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>عملاء مهتمون للشراء</span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-300 font-mono">{hotLeadsCount}</div>
            <div className="text-[11px] text-rose-400/80">طلبات تمويل وقطع غيار</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Inbox & Details) + Right Column (Live Simulator) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inbox Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-slate-800/90 bg-[#0d1527] p-5 shadow-xl space-y-4">
            {/* Inbox Header & Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-white text-base">صندوق الوارد الموحد (Unified Inbox)</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
                  {filteredInbox.length}
                </span>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="بحث في الرسائل، الأسماء، السيارات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
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
                <span>إعلانات تيك توك</span>
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
                className={`px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 ${
                  activeStatusFilter === 'pending'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>معلق ({pendingCount})</span>
              </button>
              <button
                onClick={() => setActiveStatusFilter('replied')}
                className={`px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 ${
                  activeStatusFilter === 'replied'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'text-slate-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>تم الرد ({repliedCount})</span>
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
                <span>عملاء شراء ({hotLeadsCount})</span>
              </button>
            </div>

            {/* Messages List Feed */}
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {filteredInbox.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs">لا توجد رسائل مطابقة لخيارات التصفية الحالية</p>
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
                      {/* Top row: Platform, Sender, Status */}
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

                      {/* Customer Question Text */}
                      <p className="text-xs text-slate-200 leading-relaxed line-clamp-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                        {msg.text}
                      </p>

                      {/* Badges: Intent + Car Model + City */}
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
                        {msg.intent === 'national_day_offers' && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                            🇸🇦 عروض اليوم الوطني
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

        {/* Right Column: Selected Message Review & Live Reply + Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Message Action Panel */}
          {selectedMessage ? (
            <div className="rounded-3xl border border-slate-800/90 bg-[#0d1527] p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-teal-400" />
                  <h4 className="font-bold text-white text-sm">مراجعة واعتماد الرد الذكي</h4>
                </div>

                <button
                  onClick={handleRegenerateReply}
                  disabled={isGeneratingReply}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700/60 transition-all"
                  title="إعادة توليد الرد بالذكاء الاصطناعي"
                >
                  <RotateCcw className={`w-3 h-3 text-teal-400 ${isGeneratingReply ? 'animate-spin' : ''}`} />
                  <span>توليد جديد</span>
                </button>
              </div>

              {/* Customer original box */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-bold text-slate-300">{selectedMessage.senderName}</span>
                  <span className="font-mono">{selectedMessage.timestamp}</span>
                </div>
                <p className="text-xs text-white leading-relaxed">{selectedMessage.text}</p>
              </div>

              {/* Quick Template Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400">قوالب ردود جاهزة بنقرة واحدة:</span>
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

              {/* AI Draft Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    <span>نص الرد المقترح (قابل للتعديل):</span>
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
                  className="w-full rounded-2xl bg-slate-950/90 border border-slate-700/80 p-3 text-xs text-slate-100 leading-relaxed focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="نص الرد الذكي..."
                />
              </div>

              {/* Send Approved Reply Button */}
              <button
                onClick={handleSendReply}
                disabled={!replyDraft.trim()}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-600 to-teal-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>إرسال واعتماد الرد فوراً على المنصة</span>
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-800 bg-[#0d1527]/50 p-6 text-center text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">اختر أي رسالة أو تعليق من القائمة لمراجعة واعتماد الرد</p>
            </div>
          )}

          {/* Live Simulator Panel (محاكي الردود المباشر) */}
          <div className="rounded-3xl border border-slate-800/90 bg-[#0d1527] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-white text-sm">محاكي الرد المباشر (Live Simulator)</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                تجربة فورية ⚡
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              اكتب أي تعليق أو استفسار كأنك عميل على تيك توك أو انستقرام وشاهد كيف يحلله الإيجنت ويصيغ الرد:
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">اسم العميل:</label>
                  <input
                    type="text"
                    value={simSender}
                    onChange={(e) => setSimSender(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">المنصة:</label>
                  <select
                    value={simPlatform}
                    onChange={(e) => setSimPlatform(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                  >
                    <option value="tiktok">تيك توك (تعليق إعلان)</option>
                    <option value="meta_instagram">انستقرام (رسالة خاصة)</option>
                    <option value="meta_whatsapp">واتساب للأعمال</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">نص الاستفسار:</label>
                <textarea
                  rows={3}
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  placeholder="مثال: بكم قسط اللاندكروزر عندكم وهل فيه عروض لليوم الوطني في بريدة؟ رقمي 0501234567"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700/80 p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Sample Prompts */}
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setSimText('بكم قسط التورس 2024 عندكم بدون دفعة أولى؟')}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                >
                  🚗 قسط التورس
                </button>
                <button
                  type="button"
                  onClick={() => setSimText('هل متوفرة قطع غيار كامري في متجر سلة مع شحن للرياض؟')}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                >
                  🔧 قطع غيار بسلة
                </button>
                <button
                  type="button"
                  onClick={() => setSimText('وين موقعكم في بريدة وساعات العمل اليوم؟')}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                >
                  📍 موقع بريدة
                </button>
              </div>

              <button
                type="button"
                onClick={handleRunSimulator}
                disabled={simLoading || !simText.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{simLoading ? 'جاري التحليل وتوليد الرد...' : 'تحليل الاستفسار وتوليد الرد فوراً'}</span>
              </button>

              {/* Simulator Output Result */}
              {simResult && (
                <div className="mt-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-teal-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                      <span>تحليل النية والمشاعر:</span>
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">{simResult.timestamp}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/25">
                      النية: {simResult.analysis.leadInfo.interestType}
                    </span>
                    {simResult.analysis.leadInfo.carModel && (
                      <span className="px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/25">
                        السيارة: {simResult.analysis.leadInfo.carModel}
                      </span>
                    )}
                    {simResult.analysis.leadInfo.phone && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-mono">
                        جوال: {simResult.analysis.leadInfo.phone}
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-100 leading-relaxed">
                    {simResult.reply}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSimToInbox}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3 h-3 text-teal-400" />
                    <span>إضافة هذه التجربة إلى صندوق الوارد كرسالة حية</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-[#0d1527] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-white text-base">إعدادات وقواعد الإيجنت</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Auto Pilot Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="space-y-0.5">
                  <div className="font-bold text-white">الرد التلقائي الكامل (Full Auto-Pilot)</div>
                  <div className="text-slate-400 text-[11px]">
                    عند التفعيل يقوم الإيجنت بالرد التلقائي فوراً على تعليقات تيك توك وميتا دون انتظار موافقة
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoPilotMode}
                  onChange={(e) => setSettings({ ...settings, autoPilotMode: e.target.checked })}
                  className="w-5 h-5 accent-teal-500 rounded cursor-pointer"
                />
              </div>

              {/* Tone Selection */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">نبرة وأسلوب الرد:</label>
                <select
                  value={settings.responseTone}
                  onChange={(e) => setSettings({ ...settings, responseTone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="saudi_friendly">سعودي راقٍ وودود (أهلاً بك يا غالي ونورتنا 🤍)</option>
                  <option value="formal_business">رسمي تجاري (عميلنا العزيز، تشرفنا بخدمتكم)</option>
                  <option value="quick_sales">تسويقي سريع مع تحويل مباشر للواتساب</option>
                </select>
              </div>

              {/* Connected Knowledge info */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-teal-300">قاعدة بيانات درة المتصلة بالإيجنت:</div>
                <ul className="space-y-1 text-[11px] text-slate-300 list-disc pr-4">
                  <li>المعرض: بريدة، القصيم (طريق الملك عبدالعزيز)</li>
                  <li>المتجر: سلة الإلكتروني لقطع الغيار والشحن (salla.sa/doracars)</li>
                  <li>عروض اليوم الوطني 94 المعتمدة (خصومات كاش وباقات حماية نانو)</li>
                  <li>أرقام واتساب المبيعات الرسمية: 0555123456</li>
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

      {/* Meta & TikTok modals */}
      <MetaIntegrationModal isOpen={showMetaModal} onClose={() => setShowMetaModal(false)} />
      <TikTokIntegrationModal isOpen={showTikTokModal} onClose={() => setShowTikTokModal(false)} />
    </div>
  );
}
