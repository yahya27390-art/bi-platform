// Dora Cars - Meta & TikTok AI Social Responder Agent Engine
// Live API Sync & Interactive Agent Training Studio Engine

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
};

// Dora Cars Knowledge Base for AI Responses
export const DORA_SOCIAL_KNOWLEDGE = {
  companyName: 'درة للسيارات (Dora Cars)',
  headquarters: 'القصيم - بريدة، طريق الملك عبدالعزيز، معارض السيارات',
  phone: '0555123456',
  whatsapp: '966555123456',
  sallaStoreUrl: 'https://salla.sa/doracars',
  workingHours: 'يومياً من 8:00 صباحاً حتى 12:00 ظهراً، ومن 4:00 عصراً حتى 10:00 مساءً (الجمعة عصراً فقط)',
  services: [
    'بيع وشراء جميع أنواع السيارات الحديثة والمستعملة المعتمدة (تويوتا، هيونداي، كيا، فورد، جيلي، شيري)',
    'حلول التمويل والأقساط بالتعاون مع كبرى البنوك وشركات التمويل السعودية (الراجحي، الأهلي، بنك البلاد، إمكان)',
    'متجر سلة الإلكتروني لقطع الغيار الأصلية والإكسسوارات والشحن السريع لجميع مناطق المملكة',
    'شحن وتوصيل السيارات لكافة مدن ومحافظات المملكة حتى باب المنزل'
  ],
  nationalDayOffers: [
    'عروض اليوم الوطني 94: باقات خصم كاش تبدأ من 3,000 ر.س وحتى 15,000 ر.س على فئات مختارة',
    'عازل حراري نانوي مجاني + حماية نانو سيراميك لجميع السيارات المشتراة خلال شهر سبتمبر',
    'شحن مجاني لكافة طلبات قطع الغيار والإكسسوارات عبر متجر سلة عند الشراء بأكثر من 499 ر.س',
    'تسهيلات تمويلية بأقل هامش ربح وبدون دفعة أولى للقطاع الحكومي والخاص'
  ]
};

// Default Agent Settings
export const DEFAULT_RESPONDER_SETTINGS = {
  enabled: true,
  autoPilotMode: false,
  responseTone: 'saudi_friendly', // 'saudi_friendly' | 'formal_business' | 'quick_sales'
  responseDelaySeconds: 2,
  notifyOnLead: true,
  liveSyncIntervalMinutes: 5,
  platforms: {
    instagramDm: true,
    instagramComments: true,
    facebookComments: true,
    whatsapp: true,
    tiktokComments: true,
  },
  autoCaptureLeads: true,
};

// Initial Company Training Rules
export const INITIAL_TRAINING_RULES = [
  {
    id: 'rule-1',
    category: 'financing',
    title: 'سياسة الأقساط والتمويل',
    content: 'التأكيد دائماً على توفر التمويل بدون دفعة أولى لجميع البنوك السعودية، وعدم إعطاء قسط نهائي ثابت بل البدء بعبارة "يبدأ القسط التقريبي من X حسب جهة العمل والبنك" وطلب التواصل واتساب 0555123456 للحسبة الدقيقة.',
    isActive: true
  },
  {
    id: 'rule-2',
    category: 'location',
    title: 'موقع المعرض والدوام',
    content: 'معرضنا الرئيسي يقع في القصيم - بريدة، طريق الملك عبدالعزيز في معارض السيارات. الدوام فترتين: صباحية 8-12ظ ومسائية 4-10م، وتوفير رابط اللوكيشن عبر الواتساب فوراً.',
    isActive: true
  },
  {
    id: 'rule-3',
    category: 'salla_store',
    title: 'قطع الغيار ومتجر سلة',
    content: 'أي سؤال عن قطع الغيار أو الإكسسوارات أو الزيوت يتم توجيهه إلى متجر سلة الرسمي (salla.sa/doracars) مع توضيح توفر الشحن لكافة مدن المملكة وطلب رقم الهيكل للمطابقة.',
    isActive: true
  },
  {
    id: 'rule-4',
    category: 'national_day',
    title: 'عروض اليوم الوطني 94',
    content: 'إبراز عروض اليوم الوطني 94 المعتمدة: خصومات كاش كبرى، عازل حراري نانوي مجاني، وباقات حماية، وشحن مجاني لمتجر سلة فوق 499 ر.س.',
    isActive: true
  },
  {
    id: 'rule-5',
    category: 'lead_capture',
    title: 'التقاط رقم الجوال والمدينة',
    content: 'في نهاية كل محادثة، محاولة الحصول بلباقة على رقم جوال العميل أو تحويله مباشرة لواتساب المبيعات 0555123456 لإتمام الحجز قبل نفاد الكمية.',
    isActive: true
  }
];

// Initial Golden Few-Shot Examples (سؤال العميل -> الرد المعتمد)
export const INITIAL_GOLDEN_EXAMPLES = [
  {
    id: 'ex-1',
    customerQuery: 'بكم قسط التورس 2024 عندكم وهل متوفرة بفرع بريدة؟',
    approvedReply: 'أهلاً بك يا غالي ويسعد مساك 🤍 نعم متوفرة فورد تورس 2024 وجاهزة للاستلام الفوري بمعرضنا في بريدة! القسط التقريبي يبدأ من 1,850 ر.س بدون دفعة أولى ومعتمد من البنوك السعودية، وتستاهل بكج عازل نانو مجاني بمناسبة اليوم الوطني 🇸🇦 تواصل معنا على الواتساب 0555123456 ونحسب لك الحسبة بدقة ونحجز لك السيارة فوراً 🚗',
    category: 'تمويل سيارة'
  },
  {
    id: 'ex-2',
    customerQuery: 'أبغى مساعدات وشمعات كامري 2021 أصلية، هل عندكم شحن للرياض؟',
    approvedReply: 'حياك الله أختي نورة 🌸 متوفرة جميع قطع الغيار الأصلية لكامري 2021 بضمان أصلي في متجرنا على منصة سلة: https://salla.sa/doracars 🛒 والشحن سريع لباب بيتك بالرياض خلال 24-48 ساعة! ارسلي لنا رقم الهيكل على الواتساب 0555123456 للتأكد ونخدمك من عيونا 🤍',
    category: 'قطع غيار سلة'
  },
  {
    id: 'ex-3',
    customerQuery: 'وين موقعكم بالضبط وساعات الدوام اليوم؟',
    approvedReply: 'تشرفنا بزيارتك بأي وقت 🤍 موقعنا في القصيم - بريدة، طريق الملك عبدالعزيز (معارض السيارات - معرض درة للسيارات). دوامنا اليوم فترتين: صباحية 8-12ظ ومسائية 4-10م. تواصل معنا على الواتساب 0555123456 لنرسل لك اللوكيشن المباشر وقهوتك جاهزة ☕',
    category: 'الموقع والدوام'
  },
  {
    id: 'ex-4',
    customerQuery: 'سلام عليكم، وش عروضكم بمناسبة اليوم الوطني على الجيوب؟',
    approvedReply: 'وعليكم السلام ورحمة الله وبركاته، حياك الله ونورتنا 🇸🇦 عروض اليوم الوطني 94 في درة للسيارات تشمل خصومات كاش استثنائية على سيارات تويوتا لاندكروزر وفئات مختارة، بالإضافة لعازل نانو وتسهيلات تمويلية بدون دفعة أولى! كلمنا على الواتساب 0555123456 ونرسل لك قائمة الأسعار والمواصفات فوراً 🌟',
    category: 'عروض اليوم الوطني'
  }
];

// Guardrails & Forbidden Words (المحظورات والخطوط الحمراء)
export const INITIAL_GUARDRAILS = [
  {
    id: 'g-1',
    rule: 'عدم إعطاء أسعار كاش قطعية نهائية للسيارات إلا بعد استشارة المبيعات (نذكر السعر التقريبي أو خصم اليوم الوطني ونطلب التواصل واتساب).',
    severity: 'high'
  },
  {
    id: 'g-2',
    rule: 'ممنوع الوعود بتسليم خلال ساعات خارج بريدة، الشحن خارج القصيم يستغرق 24-48 ساعة عبر الناقل الرسمي.',
    severity: 'high'
  },
  {
    id: 'g-3',
    rule: 'عدم الرد بفظاظة أو تجاهل أي شكوى عميل، والاعتذار فوراً وإعطاء رقم واتساب الإدارة 0555123456.',
    severity: 'critical'
  },
  {
    id: 'g-4',
    rule: 'ممنوع إعطاء موافقة تمويلية نهائية بدلاً من البنك؛ نذكر "التمويل خاضع لموافقة البنك وسنساعدك بأفضل هامش ربح".',
    severity: 'high'
  }
];

// Load & Save Training Rules
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

// Load & Save Golden Examples
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

// Load & Save Guardrails
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

// Load & Save Settings
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

// Load & Save Inbox
export function loadResponderInbox() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveResponderInbox(messages) {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch (e) {}
}

// -------------------------------------------------------------
// LIVE API INTEGRATION ENGINE (Meta Graph API & TikTok API)
// -------------------------------------------------------------

// Live fetch from Meta Graph API
export async function syncLiveMetaCommentsAndMessages() {
  const metaConfig = loadMetaConfig();
  const token = metaConfig.accessToken || 'EAAUaLFoDrJABSVbiAAMoR7wNS2j8zNUwTDL3AqmE9xSvDBlva3m8tye1y5C9VETiA6annvgNxg8lnOa5Vw82Of7KxjcMGXZCirHM2DZAU9PhA8tZCGZBM60X28MW4063OEhyyfe4KgmQmAVhXE7bapkOG3xnBKhkkwZALrGScAgogQxLeijeEYluyvRcqxAZDZD';
  const liveItems = [];

  try {
    // 1. Fetch Pages owned by the token
    const pagesRes = await fetch(`https://graph.facebook.com/v20.0/me/accounts?access_token=${encodeURIComponent(token)}`);
    const pagesData = await pagesRes.json();

    if (pagesData && pagesData.data && pagesData.data.length > 0) {
      for (const page of pagesData.data) {
        const pageId = page.id;
        const pageToken = page.access_token || token;

        // Fetch Recent Feed & Comments
        try {
          const feedRes = await fetch(`https://graph.facebook.com/v20.0/${pageId}/feed?fields=id,message,created_time,comments{id,message,from,created_time}&access_token=${encodeURIComponent(pageToken)}`);
          const feedData = await feedRes.json();

          if (feedData && feedData.data) {
            feedData.data.forEach(post => {
              if (post.comments && post.comments.data) {
                post.comments.data.forEach(c => {
                  liveItems.push({
                    id: `meta-live-${c.id}`,
                    platform: 'meta_facebook',
                    channelType: 'post_comment',
                    senderName: c.from?.name || 'متابع صفحة درة للسيارات',
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
                    text: c.message,
                    timestamp: new Date(c.created_time).toLocaleDateString('ar-SA'),
                    rawTime: c.created_time,
                    status: 'pending',
                    intent: 'general_inquiry',
                    sentiment: 'positive',
                    adTitle: `منشور فيسبوك: ${post.message ? post.message.slice(0, 40) + '...' : page.name}`,
                    suggestedReply: generateSmartSocialReply(c.message, c.from?.name || '', 'meta_facebook'),
                    reply: '',
                    leadInfo: analyzeCustomerText(c.message).leadInfo,
                  });
                });
              }
            });
          }
        } catch (feedErr) {
          console.warn('Feed comments error:', feedErr);
        }

        // Fetch Conversations
        try {
          const convRes = await fetch(`https://graph.facebook.com/v20.0/${pageId}/conversations?fields=id,updated_time,messages{id,message,from,created_time}&access_token=${encodeURIComponent(pageToken)}`);
          const convData = await convRes.json();

          if (convData && convData.data) {
            convData.data.forEach(conv => {
              const lastMsg = conv.messages?.data?.[0];
              if (lastMsg) {
                liveItems.push({
                  id: `meta-conv-${conv.id}`,
                  platform: 'meta_instagram',
                  channelType: 'dm',
                  senderName: lastMsg.from?.name || 'محادثة انستقرام / فيسبوك',
                  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
                  text: lastMsg.message,
                  timestamp: new Date(lastMsg.created_time).toLocaleDateString('ar-SA'),
                  rawTime: lastMsg.created_time,
                  status: 'pending',
                  intent: 'general_inquiry',
                  sentiment: 'positive',
                  adTitle: 'محادثة مباشرة Direct Inbox',
                  suggestedReply: generateSmartSocialReply(lastMsg.message, lastMsg.from?.name || '', 'meta_instagram'),
                  reply: '',
                  leadInfo: analyzeCustomerText(lastMsg.message).leadInfo,
                });
              }
            });
          }
        } catch (convErr) {
          console.warn('Conversations fetch error:', convErr);
        }
      }
    }
  } catch (err) {
    console.error('Meta live sync error:', err);
  }

  return liveItems;
}

// Live fetch from TikTok Business API
export async function syncLiveTikTokComments() {
  const tiktokConfig = loadTikTokConfig();
  const token = tiktokConfig.accessToken || '61a22e0b24b413e83da9ef7e5d012475caea7ec2';
  const advertiserId = tiktokConfig.advertiserId || '7344310111864799234';
  const liveItems = [];

  try {
    const res = await fetch(`https://business-api.tiktok.com/open_api/v1.3/comment/list/?advertiser_id=${advertiserId}`, {
      headers: {
        'Access-Token': token,
      },
    });
    const data = await res.json();

    if (data && data.data && data.data.list) {
      data.data.list.forEach((item) => {
        liveItems.push({
          id: `tiktok-live-${item.comment_id}`,
          platform: 'tiktok',
          channelType: 'ad_comment',
          senderName: item.user_name || 'مستخدم تيك توك',
          avatar: item.profile_image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
          text: item.text,
          timestamp: 'منذ قليل',
          rawTime: new Date().toISOString(),
          status: 'pending',
          intent: 'general_inquiry',
          sentiment: 'positive',
          adTitle: `إعلان تيك توك: ${item.ad_name || 'حملة درة السيارة'}`,
          suggestedReply: generateSmartSocialReply(item.text, item.user_name || '', 'tiktok'),
          reply: '',
          leadInfo: analyzeCustomerText(item.text).leadInfo,
        });
      });
    }
  } catch (e) {
    console.warn('TikTok live comments API call note:', e.message);
  }

  return liveItems;
}

// Master Unified Live Sync
export async function syncLiveSocialData() {
  const metaItems = await syncLiveMetaCommentsAndMessages();
  const tiktokItems = await syncLiveTikTokComments();
  const allLive = [...metaItems, ...tiktokItems];

  const currentInbox = loadResponderInbox();
  // Merge live items with existing inbox without duplicates
  const existingIds = new Set(currentInbox.map(m => m.id));
  const newItems = allLive.filter(item => !existingIds.has(item.id));

  const updated = [...newItems, ...currentInbox];
  saveResponderInbox(updated);

  return {
    totalFetched: allLive.length,
    newCount: newItems.length,
    metaCount: metaItems.length,
    tiktokCount: tiktokItems.length,
  };
}

// -------------------------------------------------------------
// TEXT ANALYSIS & TRAINED REPLY ENGINE
// -------------------------------------------------------------

// Classify Intent & Extract Lead info automatically
export function analyzeCustomerText(text) {
  if (!text) {
    return {
      intent: 'general_inquiry',
      sentiment: 'neutral',
      leadInfo: { carModel: '', interestType: '', city: '', phone: '' }
    };
  }

  let intent = 'general_inquiry';
  let sentiment = 'positive';
  let carModel = '';
  let interestType = 'استفسار عام';
  let city = '';
  let phone = '';

  // Extract phone number (e.g. 05xxxxxxxx or +9665xxxxxxxx)
  const phoneMatch = text.match(/(?:(?:\+?966)|0)?5\d{8}/);
  if (phoneMatch) {
    phone = phoneMatch[0];
  }

  // Detect City
  if (/بريدة|القصيم|عنيزة|الرس/.test(text)) city = 'بريدة / القصيم';
  else if (/الرياض|الخرج/.test(text)) city = 'الرياض';
  else if (/جدة|مكة|الطائف/.test(text)) city = 'جدة / الغربية';
  else if (/الدمام|الخبر|الاحساء|الشرقية/.test(text)) city = 'المنطقة الشرقية';

  // Detect Car Model
  if (/تورس|فورد/.test(text)) carModel = 'فورد تورس';
  else if (/لاندكروزر|لاند كروزر/.test(text)) carModel = 'تويوتا لاندكروزر';
  else if (/كامري/.test(text)) carModel = 'تويوتا كامري';
  else if (/هايلوكس|شاص|ربع/.test(text)) carModel = 'تويوتا بيك أب / هايلوكس';
  else if (/سوناتا|النترا|توسان|أكسنت|هيونداي/.test(text)) carModel = 'هيونداي';
  else if (/سبورتاج|كيا|كي فايف/.test(text)) carModel = 'كيا';
  else if (/جيلي|شيري|شانجان|هافال|صيني/.test(text)) carModel = 'سيارات صينية حديثة';

  // Detect Intent
  if (/قسط|تمويل|اقساط|دفعة|راتب|بنك|الراجحي|الاهلي/.test(text)) {
    intent = 'purchase_financing';
    interestType = 'شراء وتمويل بالأقساط';
  } else if (/قطع|غيار|سلة|مساعدات|شمعات|فحمات|شحن|زيت|صدام/.test(text)) {
    intent = 'spare_parts';
    interestType = 'قطع غيار وصيانة (متجر سلة)';
  } else if (/عروض|عرض|اليوم الوطني|خصم|تخفيض|باقة/.test(text)) {
    intent = 'national_day_offers';
    interestType = 'عروض وتخفيضات اليوم الوطني';
  } else if (/وين|موقع|لوكيشن|مكان|ساعات|دوام|فاتحين|متى/.test(text)) {
    intent = 'location_hours';
    interestType = 'زيارة المعرض وساعات العمل';
  } else if (/سعر|بكم|تكلفة|قيمة|كم تحسب/.test(text)) {
    intent = 'price_inquiry';
    interestType = 'استفسار عن سعر كاش';
  } else if (/تأخر|مشكلة|سيئة|ما رديتوا|اشتكي/.test(text)) {
    intent = 'complaint';
    sentiment = 'negative';
    interestType = 'شكوى وملاحظة عميل';
  }

  return {
    intent,
    sentiment,
    leadInfo: {
      carModel: carModel || 'سيارة غير محددة',
      interestType,
      city: city || 'المملكة العربية السعودية',
      phone
    }
  };
}

// Generate Smart Reply informed by Active Training Rules & Golden Examples
export function generateSmartSocialReply(customerText, senderName = '', platform = 'meta_instagram') {
  const analysis = analyzeCustomerText(customerText);
  const firstName = senderName ? senderName.split(' ')[0].replace(/[@()_]/g, '').trim() : '';
  const greeting = firstName ? `أهلاً بك ${firstName} ويسعد مساك 🤍` : 'أهلاً بك ويسعد مساك 🤍';

  // Check if there is a matching Golden Example in the training memory
  const goldenExamples = loadGoldenExamples();
  const matchingExample = goldenExamples.find(ex => {
    const qWords = ex.customerQuery.toLowerCase().split(/\s+/);
    const matchCount = qWords.filter(w => w.length > 3 && customerText.toLowerCase().includes(w)).length;
    return matchCount >= 2;
  });

  if (matchingExample) {
    return matchingExample.approvedReply;
  }

  // Generate reply following trained policies
  switch (analysis.intent) {
    case 'purchase_financing':
      return `${greeting} نعم متاح التمويل والأقساط الميسرة بدون دفعة أولى وبالتعاون مع جميع البنوك السعودية! ${
        analysis.leadInfo.carModel !== 'سيارة غير محددة' ? `سيارة ${analysis.leadInfo.carModel} متوفرة وجاهزة للاستلام الفوري من معرضنا في بريدة.` : 'متوفرة تشكيلة واسعة من أحدث السيارات.'
      } تفضل بالتواصل معنا على الواتساب 0555123456 لنحسب لك القسط والخصم بدقة بأقوى عروض اليوم الوطني 🇸🇦`;

    case 'spare_parts':
      return `${greeting} متوفرة جميع قطع الغيار الأصلية والإكسسوارات مع ضمان معتمد وشحن سريع لكافة مدن المملكة عبر متجر درة للسيارات على منصة سلة 🛒 الرابط المباشر: ${DORA_SOCIAL_KNOWLEDGE.sallaStoreUrl} — أو ارسل رقم هيكل السيارة على الواتساب 0555123456 ونجهزه لك فوراً 🌸`;

    case 'national_day_offers':
      return `${greeting} حياك الله ونورتنا! 🇸🇦 عروض اليوم الوطني 94 في درة للسيارات تشمل: خصومات كاش استثنائية، حماية نانو سيراميك مجانية، وتسهيلات تمويلية بدون دفعة أولى. تواصل معنا على الواتساب 0555123456 لنرسل لك قائمة العروض والسيارات المشمولة فوراً 🚗💨`;

    case 'location_hours':
      return `${greeting} تشرفنا بزيارتك بأي وقت 🤍 موقعنا: ${DORA_SOCIAL_KNOWLEDGE.headquarters}. مواعيد العمل اليومية: ${DORA_SOCIAL_KNOWLEDGE.workingHours}. ارسل لنا واتساب على 0555123456 لنرسل لك اللوكيشن المباشر وقهوتك جاهزة ☕`;

    case 'price_inquiry':
      return `${greeting} حياك الله يا غالي، أسعارنا في درة للسيارات تنافسية ومشمولة بخصومات خاصة ومفاجآت اليوم الوطني 94! للحصول على أفضل سعر كاش أو تمويل معتمد، تواصل مع فريق المبيعات مباشرة على 0555123456 ونعطيك أدق تفصيل 🌟`;

    case 'complaint':
      return `نعتذر منك بشدة يا غالي وحقك علينا ومقامك محفوظ 🌹 رضاكم هو أولويتنا القصوى، يرجى تزويدنا برقم جوالك أو التواصل مباشرة مع إدارة خدمة العملاء على الواتساب 0555123456 لنحل لك الأمر ونعوضك بما يسرك فوراً 🤍`;

    default:
      return `${greeting} حياك الله في درة للسيارات! سعداء جداً بتواصلك، كيف نقدر نخدمك اليوم بخصوص مبيعات السيارات، التمويل، أو قطع الغيار من متجر سلة؟ تقدر تتواصل معنا مباشرة عبر الواتساب: 0555123456 ويسعدنا خدمتك دائماً 🤍`;
  }
}

// Quick Action Templates
export const QUICK_REPLY_TEMPLATES = [
  {
    label: '🇸🇦 عروض اليوم الوطني 94',
    text: 'حياك الله ونورتنا! 🇸🇦 عروض اليوم الوطني 94 في درة للسيارات مستمرة بخصومات كاش كبرى، عازل نانو مجاني، وتسهيلات تمويلية بدون دفعة أولى. تواصل معنا على الواتساب 0555123456 لنرسل لك تفاصيل العرض فوراً 🤍'
  },
  {
    label: '📍 موقع المعرض والدوام',
    text: 'تشرفنا بزيارتك 🤍 موقعنا: القصيم - بريدة، طريق الملك عبدالعزيز (معارض السيارات - درة للسيارات). دوامنا يومياً من 8ص-12ظ ومن 4ع-10م. تواصل على 0555123456 ونرسل لك اللوكيشن وقهوتك جاهزة ☕'
  },
  {
    label: '🛒 رابط متجر سلة لقطع الغيار',
    text: 'متوفرة جميع قطع الغيار الأصلية والإكسسوارات بضمان أصلي وشحن سريع لباب بيتك عبر متجرنا في سلة: https://salla.sa/doracars 🚚'
  },
  {
    label: '📞 طلب رقم الجوال للمبيعات',
    text: 'لتزويدك بكافة التفاصيل والحسبة التمويلية الدقيقة للسيارة، تفضل بكتابة رقم جوالك وسيتصل بك استشاري المبيعات فوراً لخدمتك 🤝'
  },
  {
    label: '💬 تحويل لواتساب المبيعات',
    text: 'تفضل بمراسلتنا مباشرة على الواتساب 0555123456 وسيتواجد معك مستشار المبيعات لحظة بلحظة للرد على أي استفسار وحجز السيارة 📲'
  }
];
