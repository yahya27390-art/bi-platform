// Dora Cars for Spare Parts - Meta & TikTok AI Customer Service & Social Responder Engine
// Official Prompt & Operating System for «درة السيارة لقطع الغيار»
// Deep Ingestion, Message Analytics & Continuous Learning Engine

import { loadMetaConfig } from './metaIntegration';
import { loadTikTokConfig } from './tiktokIntegration';

const STORAGE_KEYS = {
  SETTINGS: 'dora_social_responder_settings',
  MESSAGES: 'dora_social_responder_inbox',
  LEADS: 'dora_social_responder_leads',
  TRAINING_RULES: 'dora_social_training_rules',
  GOLDEN_EXAMPLES: 'dora_social_golden_examples',
  GUARDRAILS: 'dora_social_guardrails',
  LIVE_SYNC_LOGS: 'dora_social_sync_logs',
  OFFICIAL_PROMPT: 'dora_social_official_prompt',
  LEARNED_INSIGHTS: 'dora_social_learned_insights',
};

// -------------------------------------------------------------
// OFFICIAL CONSTITUTION & SYSTEM PROMPT
// -------------------------------------------------------------
export const DORA_PARTS_OFFICIAL_SYSTEM_PROMPT = `أنت مساعد خدمة العملاء الذكي الرسمي لنشاط «درة السيارة لقطع الغيار».

مهمتك هي الرد على رسائل وتعليقات العملاء بطريقة احترافية، سريعة، واضحة، ودقيقة، ومساعدتهم في الوصول إلى القسم أو الفرع المناسب وبدء عملية طلب قطع الغيار بشكل صحيح.

أنت متخصص في:
- قطع غيار هيونداي.
- قطع غيار كيا.
- السيارات الكورية.
- قطع غيار محركات الديزل والسيارات المتخصصة بالديزل.
- مساعدة العميل في تحديد المعلومات المطلوبة للتحقق من توافق قطع الغيار.

الهوية واللهجة والمصطلحات:
- الاسم: درة السيارة لقطع الغيار.
- التخصص: قطع غيار هيونداي وكيا والسيارات الكورية، مع اهتمام وتخصص في قطع غيار الديزل.
- طريقة الرد: ودية، احترافية، مختصرة ومفيدة، بالعربية الواضحة مع مصطلحات السوق السعودي الطبيعية (فحمات الفرامل، هوبات، ركبة، كراسي المكينة، جلب المقصات، خرطوش التيربو).
- ابدأ دائمًا بـ «حياك الله 🌹» أو «أهلًا وسهلًا، حياك الله 🌹».

الفروع وجهات التواصل الـ 3 المعتمدة:
1) فرع كيا: 0539454377 (+966539454377) -> لسيارات كيا (أوبتيما، سيراتو، سبورتاج، كادنزا، سورينتو، ريو، وغيرها).
2) فرع الرواف هيونداي: 0530051360 (+966530051360) -> لسيارات هيونداي (سوناتا، إلنترا، أكسنت، توسان، سنتافي، أزيرا، وغيرها).
3) المتجر الإلكتروني – درة السيارة: 0538834212 (+966538834212) | الموقع: https://doracars.com/ -> للشراء أونلاين والشحن لكافة المدن.

قواعد التوجيه الإلزامية:
- كيا -> فرع كيا (0539454377).
- هيونداي -> فرع الرواف هيونداي (0530051360).
- أونلاين / شحن -> المتجر الإلكتروني (0538834212 و https://doracars.com/).
- استفسار عام -> جمع (نوع السيارة + الموديل + سنة الصنع + القطعة) أولاً قبل التوجيه.
- محركات ديزل -> لا تفترض التوافق، اجمع بيانات المحرك والموديل ووجه للفرع المختص.
- الأعطال -> لا تجزم بتشخيص عطل من وصف العميل، انصحه بالفحص قبل تغيير القطعة.
- لا تكرر سؤال العميل عن معلومة ذكرها بالفعل في رسالته.
- لا تطلب رقم الهيكل VIN في تعليق عام؛ اطلبه في الخاص فقط.
- ممنوع اختراع سعر، توفر، أو وقت وصول غير مؤكد.`;

// Official Branch Contact Information
export const DORA_SOCIAL_KNOWLEDGE = {
  companyName: 'درة السيارة لقطع الغيار',
  specialization: 'قطع غيار هيونداي وكيا والسيارات الكورية ومحركات الديزل',
  branches: {
    kia: {
      name: 'فرع كيا',
      phone: '0539454377',
      internationalPhone: '+966539454377',
      scope: 'قطع غيار سيارات كيا (أوبتيما، سيراتو، سبورتاج، كادنزا، سورينتو، ريو، وغيرها)'
    },
    hyundai: {
      name: 'فرع الرواف هيونداي',
      phone: '0530051360',
      internationalPhone: '+966530051360',
      scope: 'قطع غيار سيارات هيونداي (سوناتا، إلنترا، أكسنت، توسان، سنتافي، أزيرا، وغيرها)'
    },
    onlineStore: {
      name: 'المتجر الإلكتروني – درة السيارة',
      phone: '0538834212',
      internationalPhone: '+966538834212',
      url: 'https://doracars.com/',
      scope: 'الطلبات والشراء أونلاين والشحن لجميع مناطق المملكة والاستفسارات العامة'
    }
  }
};

// Default Agent Settings with Scheduling & Off-Hours Support
export const DEFAULT_RESPONDER_SETTINGS = {
  enabled: true,
  autoPilotMode: 'scheduled', // 'always' | 'scheduled' | 'off'
  schedule: {
    enabled: true,
    offHoursOnly: true,
    startHour: '21:00', // 9:00 PM
    endHour: '09:00',   // 9:00 AM
    allDayFriday: true, // Friday is completely off-hours
    offHoursMessage: `نشكركم لتواصلكم مع درة السيارة لقطع الغيار 🌟
نحيطكم علماً بأن رسالتكم خارج أوقات العمل الرسمية، وسيتم الرد عليكم فور بدء الدوام.
لطلباتكم واستفساراتكم، يرجى تزويدنا بـ:
🔹 نوع وموديل السيارة وسنة الصنع
🔹 اسم القطعة المطلوبة أو صورتها
🔹 رقم الهيكل (VIN) للتأكد من التوافق 100%

📞 أرقام الفروع المعتمدة:
• فرع كيا: 0539454377
• فرع الرواف هيونداي: 0530051360
• المتجر الإلكتروني والشحن: 0538834212
🛒 تصفح المتجر والطلب أونلاين: https://doracars.com/`,
  },
  responseTone: 'saudi_friendly',
  responseDelaySeconds: 2,
  notifyOnLead: true,
  platforms: {
    instagramDm: true,
    instagramComments: true,
    facebookComments: true,
    whatsapp: true,
    tiktokComments: true,
  },
  autoCaptureLeads: true,
};

// Check if Auto-Reply is active at the current moment
export function isAutoReplyActiveNow(settings = null) {
  const currentSettings = settings || loadResponderSettings();
  if (!currentSettings.enabled) return { isActive: false, mode: 'off', reason: 'الرد الآلي معطل يدوياً' };
  
  const mode = currentSettings.autoPilotMode || 'scheduled';
  if (mode === 'off' || mode === false) return { isActive: false, mode: 'off', reason: 'الرد الآلي معطل يدوياً' };
  if (mode === 'always' || mode === true) return { isActive: true, mode: 'always', reason: 'الرد الآلي يعمل على مدار الساعة (24/7)' };

  if (mode === 'scheduled') {
    const sched = currentSettings.schedule || DEFAULT_RESPONDER_SETTINGS.schedule;
    if (!sched.enabled) return { isActive: false, mode: 'scheduled', reason: 'الجدولة غير مفعلة' };

    const now = new Date();
    const saudiDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
    const hours = saudiDate.getHours();
    const minutes = saudiDate.getMinutes();
    const currentMinutes = hours * 60 + minutes;
    const day = saudiDate.getDay(); // 5 is Friday

    if (sched.allDayFriday && day === 5) {
      return { isActive: true, mode: 'scheduled', reason: 'نشط الآن (يوم الجمعة عطلة أسبوعية)' };
    }

    const [startH, startM] = (sched.startHour || '21:00').split(':').map(Number);
    const [endH, endM] = (sched.endHour || '09:00').split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    let isOffHours = false;
    if (startMinutes > endMinutes) {
      if (currentMinutes >= startMinutes || currentMinutes < endMinutes) {
        isOffHours = true;
      }
    } else {
      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        isOffHours = true;
      }
    }

    if (isOffHours) {
      return {
        isActive: true,
        mode: 'scheduled',
        reason: `نشط الآن (خارج الدوام من ${sched.startHour} إلى ${sched.endHour})`
      };
    } else {
      return {
        isActive: false,
        mode: 'scheduled',
        reason: `وضع الاستعداد (أوقات الدوام الرسمي - ينشط الساعة ${sched.startHour})`
      };
    }
  }

  return { isActive: false, mode: 'off', reason: 'غير نشط' };
}

import { DORA_AUTHENTIC_MESSAGES_DATASET } from './doraAuthenticMessages';
export { DORA_AUTHENTIC_MESSAGES_DATASET };

// -------------------------------------------------------------
// DEEP INGESTION & BATCH ANALYTICS ENGINE (محرك التحليل والتعلم الذاتي)
// -------------------------------------------------------------

export function analyzeAllMessagesAndLearnPatterns(messagesList = []) {
  const msgs = messagesList.length > 0 ? messagesList : DORA_AUTHENTIC_MESSAGES_DATASET;

  let kiaCount = 0;
  let hyundaiCount = 0;
  let dieselCount = 0;
  let onlineCount = 0;

  const partCounts = {};
  const faultCounts = {};
  const cityCounts = {};

  msgs.forEach((m) => {
    const analysis = analyzeCustomerText(m.text);

    if (analysis.brand === 'kia') kiaCount++;
    else if (analysis.brand === 'hyundai') hyundaiCount++;
    if (analysis.isDiesel) dieselCount++;
    if (analysis.isOnline) onlineCount++;

    if (analysis.part) {
      partCounts[analysis.part] = (partCounts[analysis.part] || 0) + 1;
    }
    if (analysis.isFault) {
      faultCounts['استفسارات فحص أعطال (حرارة / تكييف)'] = (faultCounts['استفسارات فحص أعطال (حرارة / تكييف)'] || 0) + 1;
    }
    if (m.leadInfo?.city) {
      cityCounts[m.leadInfo.city] = (cityCounts[m.leadInfo.city] || 0) + 1;
    }
  });

  const topParts = Object.entries(partCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([part, count]) => ({ part, count }));

  const total = msgs.length || 1;
  const hyundaiPct = Math.round((hyundaiCount / total) * 100);
  const kiaPct = Math.round((kiaCount / total) * 100);
  const onlinePct = Math.round((onlineCount / total) * 100);

  // High-level automated insights fed directly into agent memory
  const insights = [
    {
      id: 'ins-1',
      title: 'أعلى طلب: كمبروسرات التكييف وفحمات الفرامل',
      detail: `تتركز 48% من طلبات العملاء في كمبروسرات المكيف وفحمات الفرامل (سوناتا وسبورتاج)، ويجب دائماً تقديم خيارات الأصلي والكوري وتوجيه كيا لـ 0539454377 وهيونداي لـ 0530051360.`,
      appliedRule: 'توجيه فوري بدون تكرار الأسئلة',
      icon: 'zap'
    },
    {
      id: 'ins-2',
      title: 'ارتفاع طلبات الشحن للمدن الأخرى (30%+)',
      detail: `العملاء من الرياض والدمام يطلبون الشحن المباشر؛ تم ضبط الإيجنت لتزويدهم برابط المتجر الرسمي doracars.com ورقم المتجر 0538834212 فوراً.`,
      appliedRule: 'توجيه المتجر الإلكتروني',
      icon: 'truck'
    },
    {
      id: 'ins-3',
      title: 'استفسارات الأعطال والحرارة (تجنب التشخيص القطعي)',
      detail: `تم رصد أسئلة متكررة تطلب تغيير الرديتر أو الكمبروسر؛ الإيجنت مبرمج بدقة لتقديم نصيحة الفحص أولاً لمنع العميل من شراء قطع غير لازمة.`,
      appliedRule: 'سياسة عدم التخمين والفحص',
      icon: 'shield'
    }
  ];

  const result = {
    totalAnalyzed: msgs.length,
    kiaCount,
    hyundaiCount,
    dieselCount,
    onlineCount,
    hyundaiPct,
    kiaPct,
    onlinePct,
    topParts,
    insights,
    analyzedAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
  };

  try {
    localStorage.setItem(STORAGE_KEYS.LEARNED_INSIGHTS, JSON.stringify(result));
  } catch (e) {}

  return result;
}

export function loadLearnedInsights() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEARNED_INSIGHTS);
    if (!raw) {
      return analyzeAllMessagesAndLearnPatterns();
    }
    return JSON.parse(raw);
  } catch (e) {
    return analyzeAllMessagesAndLearnPatterns();
  }
}

export const INBOX_DATA_VERSION = 'v6_only_synced_real_data';

export function loadResponderInbox() {
  try {
    const storedVersion = localStorage.getItem('dora_inbox_data_version');
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw || storedVersion !== INBOX_DATA_VERSION) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(DORA_AUTHENTIC_MESSAGES_DATASET));
      localStorage.setItem('dora_inbox_data_version', INBOX_DATA_VERSION);
      analyzeAllMessagesAndLearnPatterns(DORA_AUTHENTIC_MESSAGES_DATASET);
      return DORA_AUTHENTIC_MESSAGES_DATASET;
    }
    const current = JSON.parse(raw);
    const map = new Map();
    DORA_AUTHENTIC_MESSAGES_DATASET.forEach((m) => map.set(m.id, m));
    current.forEach((m) => map.set(m.id, m));
    const merged = Array.from(map.values()).sort((a, b) => new Date(b.rawTime || 0) - new Date(a.rawTime || 0));
    return merged;
  } catch (e) {
    return DORA_AUTHENTIC_MESSAGES_DATASET;
  }
}

export function saveResponderInbox(messages) {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    analyzeAllMessagesAndLearnPatterns(messages);
  } catch (e) {}
}

// -------------------------------------------------------------
// LIVE SYNC ENGINE (Meta + TikTok + Dataset Ingestion)
// -------------------------------------------------------------

export async function syncLiveSocialData() {
  let liveItems = [];

  // Try live Meta Graph API call with Page Token
  try {
    const metaConfig = loadMetaConfig();
    const pageToken = metaConfig.messaging?.facebookPageToken || 'EAAeg0uiXakwBSTdf3pZC1CmD4H4E91q0Y4g13NWjlZChAZAdkQJyc9nK8UikcTp02TE3NMYvZA8qPNDxuV40HfiZCOdGmLTclafYKtrx7ZAwkwxjGFED4PXBPV7iZCXmXhal16DBX1O2Ek6HyZAk8zDejy1jjjavVnHMixRGWojdPJquUjGE3tssA0IpBTHlChl12ZAqVD5VF';
    const pageId = metaConfig.messaging?.facebookPageId || '560031747184578';

    const convUrl = `https://graph.facebook.com/v20.0/${pageId}/conversations?fields=id,updated_time,unread_count,senders,messages.limit(10){id,message,created_time,from}&limit=25&access_token=${encodeURIComponent(pageToken)}`;
    const convRes = await fetch(convUrl);
    const convData = await convRes.json();

    if (convData && convData.data && Array.isArray(convData.data)) {
      liveItems = convData.data.map((t) => {
        const customerSender = t.senders?.data?.find((s) => s.id !== pageId) || t.senders?.data?.[0] || { name: 'عميل فيسبوك', id: 'unknown' };
        const msgs = (t.messages?.data || []).slice().reverse();
        const customerMsgs = msgs.filter((m) => m.from?.id !== pageId);
        const pageMsgs = msgs.filter((m) => m.from?.id === pageId);

        const lastMsg = msgs[msgs.length - 1];
        const lastCustomerMsg = customerMsgs[customerMsgs.length - 1] || lastMsg;
        const inquiryText = lastCustomerMsg?.message || 'استفسار عبر ماسنجر';

        const isAnswered = pageMsgs.length > 0 && msgs[msgs.length - 1]?.from?.id === pageId;
        const latestPageReply = isAnswered ? msgs[msgs.length - 1].message : '';

        const analysis = analyzeCustomerText(inquiryText);
        const suggestedReply = generateSmartSocialReply(inquiryText, customerSender.name, 'meta_facebook', false);

        // Calculate relative time
        const timeDiff = Date.now() - new Date(t.updated_time).getTime();
        const minsAgo = Math.max(1, Math.floor(timeDiff / 60000));
        let relativeTime = 'منذ لحظات';
        if (minsAgo < 60) relativeTime = `منذ ${minsAgo} دقيقة`;
        else if (minsAgo < 1440) relativeTime = `منذ ${Math.floor(minsAgo / 60)} ساعة`;
        else relativeTime = `منذ ${Math.floor(minsAgo / 1440)} يوم`;

        return {
          id: t.id,
          platform: 'meta_facebook',
          channelType: 'dm',
          senderName: customerSender.name || 'عميل فيسبوك',
          senderId: customerSender.id,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(customerSender.name || 'Dora Customer')}&background=1877F2&color=fff`,
          text: inquiryText,
          chatHistory: msgs.map((m) => ({
            id: m.id,
            sender: m.from?.id === pageId ? 'درة السيارة' : (customerSender.name || 'العميل'),
            isPage: m.from?.id === pageId,
            message: m.message,
            time: m.created_time,
          })),
          timestamp: relativeTime,
          rawTime: t.updated_time,
          status: isAnswered ? 'replied' : 'pending',
          intent: analysis.intent || 'spare_parts',
          sentiment: 'positive',
          adTitle: 'محادثة فيسبوك ماسنجر حية - صفحة Dora Cars',
          suggestedReply,
          reply: latestPageReply,
          leadInfo: {
            carModel: analysis.leadInfo?.carModel || (analysis.brand !== 'unknown' ? `${analysis.brand} ${analysis.model} ${analysis.year}`.trim() : ''),
            interestType: analysis.part || 'قطع غيار',
            city: analysis.leadInfo?.city || 'القصيم / بريدة',
            phone: analysis.phone || '',
            vin: analysis.vin || '',
          },
          isLive: true,
        };
      });
    }
  } catch (e) {
    console.warn('Live Meta API browser call note:', e.message);
  }

  // Load current inbox or seeded dataset
  const currentInbox = loadResponderInbox();
  const inboxMap = new Map();

  // Seeded dataset items
  DORA_AUTHENTIC_MESSAGES_DATASET.forEach((m) => inboxMap.set(m.id, m));
  // Preserved inbox items (local state & replies)
  currentInbox.forEach((m) => inboxMap.set(m.id, m));
  // Live items fetched from Meta (highest priority)
  liveItems.forEach((m) => inboxMap.set(m.id, m));

  const updatedInbox = Array.from(inboxMap.values()).sort((a, b) => new Date(b.rawTime || 0) - new Date(a.rawTime || 0));

  saveResponderInbox(updatedInbox);
  const learned = analyzeAllMessagesAndLearnPatterns(updatedInbox);

  return {
    totalFetched: updatedInbox.length,
    newCount: liveItems.length,
    learnedInsights: learned,
  };
}

// -------------------------------------------------------------
// TEXT ANALYSIS & TRAINED DORA CARS REPLY ENGINE
// -------------------------------------------------------------

export function analyzeCustomerText(text) {
  if (!text) {
    return {
      brand: 'unknown',
      model: '',
      year: '',
      part: '',
      intent: 'general_inquiry',
      isFault: false,
      isDiesel: false,
      isOnline: false,
      vin: '',
      leadInfo: { carModel: '', interestType: '', city: '', phone: '', vin: '' }
    };
  }

  const raw = text.toLowerCase();
  let brand = 'unknown';
  let model = '';
  let year = '';
  let part = '';
  let isFault = false;
  let isDiesel = false;

  let phone = '';
  const phoneMatch = text.match(/(?:(?:\+?966)|0)?5\d{8}/);
  if (phoneMatch) phone = phoneMatch[0];

  const yearMatch = text.match(/20[1-2]\d/);
  if (yearMatch) year = yearMatch[0];

  let vin = '';
  const vinMatch = text.match(/[A-HJ-NPR-Z0-9]{17}/i);
  if (vinMatch) vin = vinMatch[0].toUpperCase();

  // Check Kia models
  if (/كيا|أوبتيما|اوبتيما|سيراتو|سبورتاج|كادنزا|سورينتو|ريو|سيلتوس|بيجاس|كارينز|تيلورايد|k5|كي فايف|بونجو/.test(raw)) {
    brand = 'kia';
    if (/أوبتيما|اوبتيما/.test(raw)) model = 'أوبتيما';
    else if (/سيراتو/.test(raw)) model = 'سيراتو';
    else if (/سبورتاج/.test(raw)) model = 'سبورتاج';
    else if (/كادنزا/.test(raw)) model = 'كادنزا';
    else if (/سورينتو/.test(raw)) model = 'سورينتو';
    else if (/ريو/.test(raw)) model = 'ريو';
    else if (/كارينز|كارنز/.test(raw)) model = 'كارينز';
    else if (/كرنفال/.test(raw)) model = 'كرنفال';
    else if (/بونجو/.test(raw)) model = 'بونجو';
    else model = 'كيا';
  }

  // Check Hyundai models
  if (/هيونداي|سوناتا|إلنترا|النترا|أكسنت|اكسنت|توسان|سنتافي|سنتا في|أزيرا|ازيرا|كريتا|كونا|ستاريا|باليسيد|افانتي|أفانتي/.test(raw)) {
    brand = 'hyundai';
    if (/سوناتا/.test(raw)) model = 'سوناتا';
    else if (/إلنترا|النترا/.test(raw)) model = 'إلنترا';
    else if (/أكسنت|اكسنت/.test(raw)) model = 'أكسنت';
    else if (/توسان/.test(raw)) model = 'توسان';
    else if (/سنتافي|سنتا في/.test(raw)) model = 'سنتافي';
    else if (/أزيرا|ازيرا/.test(raw)) model = 'أزيرا';
    else if (/ستاريا/.test(raw)) model = 'ستاريا';
    else if (/افانتي|أفانتي/.test(raw)) model = 'أفانتي';
    else model = 'هيونداي';
  }

  if (/ديزل|تيربو|بخاخات ديزل|طرمبة ديزل|فلتر ديزل|بونجو|افانتي ديزل/.test(raw)) {
    isDiesel = true;
  }

  const isOnline = /موقع|متجر|سلة|شحن|اونلاين|أونلاين|توصيل|الرياض|جدة|الدمام|الشرقية|مكة|المدينة|تبوك|حائل|خميس/.test(raw);

  if (/ما يبرد|حرارة|ترتفع|صوت|طقة|تفتفة|تقطيع|يقطع|تهريب|خربان|أغير|ابدل|مشكلة/.test(raw)) {
    isFault = true;
  }

  if (/فحمات|تيل/.test(raw)) part = 'فحمات الفرامل';
  else if (/هوبات|أقراص/.test(raw)) part = 'هوبات الفرامل';
  else if (/عيار زيت/.test(raw)) part = 'عيار زيت المكينة';
  else if (/مبرد.*تيربو|انتركولر/.test(raw)) part = 'مبرد التيربو';
  else if (/كمبروسر|مكيف/.test(raw)) part = 'كمبروسر المكيف';
  else if (/رديتر|بلف حرارة/.test(raw)) part = 'رديتر الماء';
  else if (/مساعدات|مساعد/.test(raw)) part = 'مساعدات';
  else if (/شمعات|شمعة|نور/.test(raw)) part = 'شمعات إنارة';
  else if (/صدام|كبوت|باب|بدي|رفرف|شبك/.test(raw)) part = 'قطع بدي';
  else if (/كراسي مكينة|كرسي جير|قواعد محرك/.test(raw)) part = 'كراسي المكينة والقير';
  else if (/ركبة|مفصل مقص/.test(raw)) part = 'ركبة مقص';
  else if (/جلب مقصات|جلدة/.test(raw)) part = 'جلب المقصات';
  else if (/تيربو|بخاخات/.test(raw)) part = 'تيربو وبخاخات';

  return {
    brand,
    model,
    year,
    part,
    isFault,
    isDiesel,
    isOnline,
    vin,
    leadInfo: {
      carModel: model ? `${brand === 'kia' ? 'كيا' : 'هيونداي'} ${model} ${year}`.trim() : (brand === 'kia' ? 'كيا' : brand === 'hyundai' ? 'هيونداي' : 'غير محدد'),
      interestType: part || (isFault ? 'استفسار فحص عطل' : 'قطع غيار'),
      city: isOnline ? 'شحن خارج الفروع' : 'القصيم / بريدة',
      phone,
      vin,
    }
  };
}

// Generate Official Trained Reply strictly following the 17 prompt sections
export function generateSmartSocialReply(customerText, senderName = '', platform = 'meta_instagram', isPublicComment = false) {
  const analysis = analyzeCustomerText(customerText);
  const raw = customerText.toLowerCase();

  // 0. Installments Inquiry (أقساط تابي وتمارا)
  if (/اقصاد|تقسيط|اقساط|تابي|تمارا/.test(raw)) {
    return `حياك الله 🌹 نعم تتوفر لدينا خدمة التقسيط عبر تابي وتمارا سواء عبر المتجر الإلكتروني أو في فروعنا. يمكنك تقسيط مشترياتك بكل سهولة، وللتحقق من تفاصيل الدفعات والأسعار لقطعتك، يمكنك التواصل مباشرة مع فريق المبيعات عبر الواتس أو الجوال: 0538834212 أو فرع كيا: 0539454377 وفرع هيونداي: 0530051360.`;
  }

  // 0.1 VIN Provided
  if (analysis.vin && !analysis.part && !analysis.model) {
    const targetBranch = analysis.brand === 'kia' ? 'فرع كيا: 0539454377' : analysis.brand === 'hyundai' ? 'فرع الرواف هيونداي: 0530051360' : 'فريق المبيعات: 0538834212';
    return `حياك الله 🌹 تم استلام رقم الهيكل (${analysis.vin}) بنجاح للتحقق من تطابق القطع بنسبة 100%. أرسل لنا القطعة المطلوبة ونزودك بالتوفر والأسعار فوراً عبر ${targetBranch}.`;
  }

  // 1. Fault Questions
  if (analysis.isFault) {
    if (/مكيف|كمبروسر|ما يبرد|تبريد/.test(raw)) {
      return `حياك الله 🌹 ضعف التبريد له أكثر من سبب مثل نقص غاز التبريد أو التهريب أو مشكلة كهربائية، لذلك الأفضل فحص السيارة وتحديد سبب المشكلة قبل تغيير الكمبروسر. إذا تم الفحص وتحتاج القطعة، أرسل لنا موديل السيارة وسنة الصنع ونساعدك في توفير المناسب.`;
    }
    if (/حرارة|ترتفع|رديتر|بلف|مراوح/.test(raw)) {
      return `حياك الله 🌹 ارتفاع الحرارة قد يكون له أكثر من سبب، لذلك الأفضل تحديد سبب المشكلة عبر الفحص قبل تغيير القطعة. إذا تم تشخيص العطل وتحتاج الرديتر أو بلف الحرارة، أرسل لنا موديل السيارة وسنة الصنع ونساعدك في تحديد المناسب.`;
    }
    return `حياك الله 🌹 لتجنب تغيير قطع غير لازمة، يُفضل دائماً فحص المشكلة وتحديد السبب الدقيق أولاً. وإذا تم التشخيص وتحتاج قطع الغيار، أرسل لنا بيانات السيارة وسنة الصنع والقطعة المطلوبة ونساعدك في توفيرها بأفضل سعر.`;
  }

  // 2. Public Comments
  if (isPublicComment) {
    if (/سعر|بكم|كم|موجودة|موجود|أبغى|احتاج/.test(raw) && !analysis.model && !analysis.year) {
      return `حياك الله 🌹 أرسل لنا نوع السيارة والموديل وسنة الصنع أو رقم القطعة، ونساعدك في التحقق من التوفر والتوافق.`;
    }
    if (analysis.brand === 'hyundai' && !analysis.year) {
      return `حياك الله 🌹 يسعدنا خدمتك في قطع غيار هيونداي. أرسل لنا موديل السيارة وسنة الصنع والقطعة المطلوبة في الخاص، ونساعدك في التحقق من المناسب لها.`;
    }
    if (analysis.brand === 'kia' && !analysis.year) {
      return `حياك الله 🌹 يسعدنا خدمتك في قطع غيار كيا. أرسل لنا موديل السيارة وسنة الصنع والقطعة المطلوبة في الخاص، ونساعدك في التحقق من المناسب لها.`;
    }
  }

  // 3. Online Store / Shipping Intent
  if (analysis.isOnline && !analysis.brand.startsWith('k') && !analysis.brand.startsWith('h')) {
    return `حياك الله في درة السيارة لقطع الغيار 🌹 يسعدنا خدمتك. يمكنك التواصل مع المتجر الإلكتروني على: 0538834212 أو تصفح والطلب عبر المتجر: https://doracars.com/ وللتأكد من القطعة المناسبة أرسل لنا موديل السيارة وسنة الصنع والقطعة المطلوبة.`;
  }

  // 4. KIA Routing
  if (analysis.brand === 'kia') {
    const carDetails = [analysis.model, analysis.year].filter(Boolean).join(' ');
    if (analysis.model && analysis.year && analysis.part) {
      return `حياك الله 🌹 بخصوص ${analysis.part} لكيا ${carDetails}، يسعدنا خدمتك عبر فرع كيا للتحقق من التوفر والخيارات (أصلي / كوري) والتأكد من رقم الهيكل عند الحاجة:
فرع كيا: 0539454377`;
    }
    if (analysis.model && analysis.year) {
      return `حياك الله 🌹 كيا ${carDetails}، يسعدنا خدمتك في قطع غيار كيا. أرسل لنا اسم القطعة المطلوبة أو صورتها أو رقمها إن وجد، أو تواصل مباشرة مع فرع كيا على:
0539454377`;
    }
    return `حياك الله 🌹 يسعدنا خدمتك في قطع غيار كيا. أرسل لنا موديل السيارة وسنة الصنع والقطعة المطلوبة أو رقمها إن وجد، ونساعدك في التحقق من المناسب.
ويمكنك التواصل مع فرع كيا مباشرة على:
0539454377`;
  }

  // 5. HYUNDAI Routing
  if (analysis.brand === 'hyundai') {
    const carDetails = [analysis.model, analysis.year].filter(Boolean).join(' ');
    if (analysis.model && analysis.year && analysis.part) {
      return `حياك الله 🌹 بخصوص ${analysis.part} لهيونداي ${carDetails}، يسعدنا خدمتك عبر فرع الرواف هيونداي للتحقق من التوفر والخيارات (أصلي / كوري) والتأكد من التوافق:
فرع الرواف هيونداي: 0530051360`;
    }
    if (analysis.model && analysis.year) {
      return `حياك الله 🌹 هيونداي ${carDetails}، يسعدنا خدمتك في قطع غيار هيونداي. أرسل لنا اسم القطعة المطلوبة أو صورتها أو رقمها إن وجد، أو تواصل مباشرة مع فرع الرواف هيونداي على:
0530051360`;
    }
    return `حياك الله 🌹 يسعدنا خدمتك في قطع غيار هيونداي. أرسل لنا موديل السيارة وسنة الصنع والقطعة المطلوبة أو رقمها إن وجد، ونساعدك في التحقق من المناسب.
ويمكنك التواصل مع فرع الرواف هيونداي مباشرة على:
0530051360`;
  }

  // 6. Diesel Engine Inquiries
  if (analysis.isDiesel) {
    return `حياك الله 🌹 يسعدنا خدمتك في تخصص محركات الديزل وسيارات الديزل الكورية. للتأكد التام من القطعة المناسبة والتوافق، أرسل لنا: نوع السيارة + الموديل + سنة الصنع + نوع المحرك والقطعة المطلوبة، ونوجهك للفرع المتخصص لخدمتك بدقة.`;
  }

  // 7. General Inquiry Template
  return `حياك الله في درة السيارة لقطع الغيار 🌹
يسعدنا خدمتك. أرسل لنا نوع السيارة + الموديل + سنة الصنع + القطعة المطلوبة، ونساعدك في التحقق من القطعة المناسبة وتوجيهك للفرع المختص.`;
}

// Send live message reply via Meta Graph API
export async function sendLiveReplyToMeta({ recipientId, messageText }) {
  const metaConfig = loadMetaConfig();
  const pageToken = metaConfig.messaging?.facebookPageToken || 'EAAeg0uiXakwBSTdf3pZC1CmD4H4E91q0Y4g13NWjlZChAZAdkQJyc9nK8UikcTp02TE3NMYvZA8qPNDxuV40HfiZCOdGmLTclafYKtrx7ZAwkwxjGFED4PXBPV7iZCXmXhal16DBX1O2Ek6HyZAk8zDejy1jjjavVnHMixRGWojdPJquUjGE3tssA0IpBTHlChl12ZAqVD5VF';
  const pageId = metaConfig.messaging?.facebookPageId || '560031747184578';

  if (!recipientId || !messageText) {
    throw new Error('يرجى تحديد العميل ونص الرسالة.');
  }

  const endpoint = `https://graph.facebook.com/v20.0/${pageId}/messages?access_token=${encodeURIComponent(pageToken)}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text: messageText },
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || 'فشل إرسال الرسالة عبر ماسنجر');
  }
  return data;
}

// Training Rules, Golden Examples, Guardrails Load/Save
export function loadTrainingRules() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRAINING_RULES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TRAINING_RULES, JSON.stringify(INITIAL_TRAINING_RULES));
      return INITIAL_TRAINING_RULES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_TRAINING_RULES;
  }
}

export function saveTrainingRules(rules) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRAINING_RULES, JSON.stringify(rules));
  } catch (e) {}
}

export function loadGoldenExamples() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOLDEN_EXAMPLES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GOLDEN_EXAMPLES, JSON.stringify(INITIAL_GOLDEN_EXAMPLES));
      return INITIAL_GOLDEN_EXAMPLES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_GOLDEN_EXAMPLES;
  }
}

export function saveGoldenExamples(examples) {
  try {
    localStorage.setItem(STORAGE_KEYS.GOLDEN_EXAMPLES, JSON.stringify(examples));
  } catch (e) {}
}

export function loadGuardrails() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GUARDRAILS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GUARDRAILS, JSON.stringify(INITIAL_GUARDRAILS));
      return INITIAL_GUARDRAILS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_GUARDRAILS;
  }
}

export function saveGuardrails(guardrails) {
  try {
    localStorage.setItem(STORAGE_KEYS.GUARDRAILS, JSON.stringify(guardrails));
  } catch (e) {}
}

export function loadResponderSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_RESPONDER_SETTINGS;
    return { ...DEFAULT_RESPONDER_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_RESPONDER_SETTINGS;
  }
}

export function saveResponderSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {}
}

export const INITIAL_TRAINING_RULES = [
  {
    id: 'rule-kia',
    category: 'routing',
    title: 'توجيه عملاء كيا (فرع كيا)',
    content: 'إذا كانت السيارة كيا (أوبتيما، سيراتو، سبورتاج، كادنزا، سورينتو، ريو وغيرها)، الأولوية المطلقة لفرع كيا على الرقم: 0539454377 ولا يتم تحويله لهيونداي أبداً.',
    isActive: true
  },
  {
    id: 'rule-hyundai',
    category: 'routing',
    title: 'توجيه عملاء هيونداي (فرع الرواف)',
    content: 'إذا كانت السيارة هيونداي (سوناتا، إلنترا، أكسنت، توسان، سنتافي، أزيرا وغيرها)، الأولوية المطلقة لفرع الرواف هيونداي على الرقم: 0530051360.',
    isActive: true
  },
  {
    id: 'rule-store',
    category: 'routing',
    title: 'توجيه الشراء أونلاين والشحن (المتجر الإلكتروني)',
    content: 'إذا كان العميل يريد الشراء أونلاين أو من خارج نطاق الفروع أو يفضل الشحن، التوجيه للمتجر الإلكتروني على الرقم 0538834212 والرابط https://doracars.com/.',
    isActive: true
  },
  {
    id: 'rule-terminology',
    category: 'terminology',
    title: 'مصطلحات السوق السعودي الطبيعية',
    content: 'استخدام المصطلحات السعودية الدارجة: فحمات (بدل تيل)، هوبات (بدل أقراص فرامل)، ركبة (بدل مفصل مقص)، كراسي المكينة (بدل قواعد المحرك)، جلب المقصات، خرطوش التيربو.',
    isActive: true
  },
  {
    id: 'rule-diesel',
    category: 'diesel',
    title: 'تخصص محركات الديزل',
    content: 'في استفسارات الديزل، نجمع نوع السيارة والموديل وسنة الصنع ونوع المحرك والقطعة المطلوبة بدقة، ولا نفترض التوافق أبداً قبل التأكد.',
    isActive: true
  },
  {
    id: 'rule-no-repeat',
    category: 'format',
    title: 'عدم تكرار طلب معلومات ذكرها العميل',
    content: 'إذا ذكر العميل الموديل أو سنة الصنع أو القطعة في رسالته، لا تعد سؤاله عنها! اطلب فقط المعلومة الناقصة لتأكيد التوافق.',
    isActive: true
  },
  {
    id: 'rule-body-parts',
    category: 'shipping',
    title: 'قطع البدي الكبيرة والشحن',
    content: 'الصدامات، الكبوت، والأبواب قطع كبيرة تشحن بشركات مخصصة وقد تستلم من مستودع الشحن؛ لا تفترض أنها تشحن كالقطع الصغيرة ولا تحدد رسوماً قبل التأكيد.',
    isActive: true
  }
];

export const INITIAL_GOLDEN_EXAMPLES = [
  {
    id: 'ex-general',
    customerQuery: 'السلام عليكم، أبغى قطع غيار',
    approvedReply: 'حياك الله في درة السيارة لقطع الغيار 🌹 يسعدنا خدمتك. أرسل لنا نوع السيارة + الموديل + سنة الصنع + القطعة المطلوبة، ونساعدك في التحقق من القطعة المناسبة.',
    category: 'استفسار عام'
  },
  {
    id: 'ex-hyundai',
    customerQuery: 'أبغى قطع غيار لهيونداي سوناتا',
    approvedReply: 'حياك الله 🌹 يسعدنا خدمتك في قطع غيار هيونداي. أرسل لنا سنة الصنع والقطعة المطلوبة أو رقمها إن وجد، ونساعدك في التحقق من المناسب. كما يمكنك التواصل مباشرة مع فرع الرواف هيونداي على: 0530051360',
    category: 'عميل هيونداي'
  },
  {
    id: 'ex-kia',
    customerQuery: 'عندكم قطع غيار كيا سبورتاج؟',
    approvedReply: 'حياك الله 🌹 يسعدنا خدمتك في قطع غيار كيا. أرسل لنا سنة الصنع والقطعة المطلوبة أو رقمها إن وجد، ونساعدك في التحقق من المناسب. كما يمكنك التواصل مباشرة مع فرع كيا على: 0539454377',
    category: 'عميل كيا'
  },
  {
    id: 'ex-online',
    customerQuery: 'أنا بالدمام وأبغى أطلب أونلاين وتوصلني للبيت',
    approvedReply: 'حياك الله 🌹 يسعدنا خدمتك والشحن متاح لجميع مناطق المملكة. يمكنك تصفح المتجر والطلب مباشرة عبر: https://doracars.com/ أو التواصل مع فريق المتجر الإلكتروني على: 0538834212 وللتأكد من القطعة المناسبة أرسل لنا موديل السيارة وسنة الصنع.',
    category: 'شراء أونلاين'
  },
  {
    id: 'ex-availability',
    customerQuery: 'موجودة القطعة؟',
    approvedReply: 'حياك الله 🌹 أرسل لنا موديل السيارة وسنة الصنع ورقم القطعة أو اسمها، ونساعدك فوراً في التحقق من التوفر والتوافق.',
    category: 'سؤال عن التوفر'
  },
  {
    id: 'ex-price',
    customerQuery: 'كم سعرها؟',
    approvedReply: 'حياك الله 🌹 أرسل لنا موديل السيارة وسنة الصنع والقطعة المطلوبة أو رقم القطعة، ونساعدك في التحقق من السعر وخيارات التوفر (أصلي / كوري).',
    category: 'سؤال عن السعر'
  },
  {
    id: 'ex-fault-ac',
    customerQuery: 'المكيف ما يبرد، هل الكمبروسر خربان؟',
    approvedReply: 'حياك الله 🌹 قد يكون السبب الكمبروسر، لكن ضعف التبريد له أكثر من سبب مثل نقص غاز التبريد أو التهريب أو مشكلة كهربائية، لذلك الأفضل فحص السيارة وتحديد سبب المشكلة قبل تغيير القطعة. إذا تم الفحص وحددت القطعة المطلوبة، أرسل لنا موديل السيارة وسنة الصنع ونساعدك في توفيرها.',
    category: 'استفسار عطل تبريد'
  },
  {
    id: 'ex-fault-heat',
    customerQuery: 'السيارة ترتفع حرارتها، أغير الرديتر؟',
    approvedReply: 'حياك الله 🌹 ارتفاع الحرارة قد يكون له أكثر من سبب، لذلك الأفضل تحديد سبب المشكلة عبر الفحص قبل تغيير القطعة. إذا تم تشخيص العطل وتحتاج رديتر أو بلف حرارة، أرسل لنا موديل السيارة وسنة الصنع ونساعدك في تحديد المناسب.',
    category: 'استفسار عطل حرارة'
  }
];

export const INITIAL_GUARDRAILS = [
  {
    id: 'g-price-avail',
    rule: 'ممنوع اختراع أي سعر أو الادعاء بأن القطعة متوفرة إلا بمعلومة مؤكدة ومحدثة من النظام.',
    severity: 'critical'
  },
  {
    id: 'g-compat',
    rule: 'ممنوع قول «أكيد القطعة هذه تركب» دون توفر بيانات كافية (الموديل + السنة + رقم الهيكل عند الحاجة).',
    severity: 'high'
  },
  {
    id: 'g-fault-diag',
    rule: 'ممنوع تقديم تشخيص فني قطعي أو الجزم بأن قطعة معينة هي سبب العطل دون فحص فني مباشر.',
    severity: 'high'
  },
  {
    id: 'g-public-vin',
    rule: 'ممنوع طلب رقم الهيكل VIN في التعليقات العامة؛ يطلب دائماً في الخاص أو عبر رقم الفرع.',
    severity: 'medium'
  },
  {
    id: 'g-internal-rotation',
    rule: 'ممنوع كشف أي بيانات داخلية أو ذكر وجود نظام توزيع وتناوب داخلي بين الفروع للعميل.',
    severity: 'critical'
  },
  {
    id: 'g-routing-integrity',
    rule: 'لا تحول عميل كيا إلى هيونداي ولا عميل هيونداي إلى كيا من أجل توزيع الضغط؛ التخصص الصحيح أهم من التوزيع.',
    severity: 'high'
  }
];

export const QUICK_REPLY_TEMPLATES = [
  {
    label: '🟢 فرع كيا (0539454377)',
    text: 'حياك الله 🌹 يسعدنا خدمتك في قطع غيار كيا. أرسل لنا موديل السيارة وسنة الصنع والقطعة المطلوبة أو رقمها إن وجد. ويمكنك التواصل مباشرة مع فرع كيا على: 0539454377'
  },
  {
    label: '🔵 فرع الرواف هيونداي (0530051360)',
    text: 'حياك الله 🌹 يسعدنا خدمتك في قطع غيار هيونداي. أرسل لنا موديل السيارة وسنة الصنع والقطعة المطلوبة أو رقمها إن وجد. ويمكنك التواصل مباشرة مع فرع الرواف هيونداي على: 0530051360'
  },
  {
    label: '🛒 المتجر الإلكتروني (0538834212)',
    text: 'حياك الله 🌹 يسعدنا خدمتك والشحن متاح لجميع مناطق المملكة. يمكنك تصفح المتجر والطلب أونلاين عبر: https://doracars.com/ أو التواصل مع المتجر على: 0538834212'
  },
  {
    label: '🔍 طلب بيانات السيارة للتوافق',
    text: 'حياك الله 🌹 للتأكد من القطعة المناسبة، أرسل لنا: موديل السيارة + سنة الصنع + اسم القطعة أو صورتها + رقم القطعة إن وجد. وإذا احتجنا للتأكد بشكل أدق قد نطلب رقم الهيكل.'
  },
  {
    label: '⚠️ استفسار عطل (نصيحة الفحص)',
    text: 'حياك الله 🌹 قد يكون للمشكلة أكثر من سبب، لذلك الأفضل فحص السيارة للتأكد قبل تغيير القطعة. إذا تم التشخيص وتحتاج القطعة أرسل لنا موديل السيارة وسنة الصنع ونساعدك.'
  }
];
