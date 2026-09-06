// Dora Cars for Spare Parts - Meta & TikTok AI Customer Service & Social Responder Engine
// Official Prompt & Operating System for «درة السيارة لقطع الغيار»

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
  },
  terminology: {
    'تيل': 'فحمات',
    'تيل فرامل': 'فحمات الفرامل',
    'أقراص فرامل': 'هوبات الفرامل',
    'مفصل مقص': 'ركبة',
    'قواعد محرك': 'كراسي المكينة',
    'قواعد مكينة': 'كراسي المكينة',
    'جلدة مقصات': 'جلب المقصات',
    'خرطوم تيربو': 'خرطوش التيربو',
  }
};

// Default Agent Settings
export const DEFAULT_RESPONDER_SETTINGS = {
  enabled: true,
  autoPilotMode: false,
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

// Initial Company Training Rules based on the 17 Sections
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

// Initial Golden Examples (Based directly on Section 14 & 10)
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

// Guardrails & Red Lines (Based directly on Section 8 & 9)
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
    rule: 'ممنوع تقديم تشخيص فني قطعي أو الجزم بأن قطعة معينة هي سبب العطل (مثل: الكمبروسر خربان) دون فحص فني مباشر.',
    severity: 'high'
  },
  {
    id: 'g-public-vin',
    rule: 'ممنوع طلب رقم الهيكل VIN في التعليقات العامة؛ يطلب دائماً في الخاص أو عبر رقم الفرع للحفاظ على خصوصية العميل.',
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

// Load & Save Methods
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

export async function syncLiveMetaCommentsAndMessages() {
  const metaConfig = loadMetaConfig();
  const token = metaConfig.accessToken || 'EAAUaLFoDrJABSVbiAAMoR7wNS2j8zNUwTDL3AqmE9xSvDBlva3m8tye1y5C9VETiA6annvgNxg8lnOa5Vw82Of7KxjcMGXZCirHM2DZAU9PhA8tZCGZBM60X28MW4063OEhyyfe4KgmQmAVhXE7bapkOG3xnBKhkkwZALrGScAgogQxLeijeEYluyvRcqxAZDZD';
  const liveItems = [];

  try {
    const pagesRes = await fetch(`https://graph.facebook.com/v20.0/me/accounts?access_token=${encodeURIComponent(token)}`);
    const pagesData = await pagesRes.json();

    if (pagesData && pagesData.data && pagesData.data.length > 0) {
      for (const page of pagesData.data) {
        const pageId = page.id;
        const pageToken = page.access_token || token;

        // Feed comments
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
                    senderName: c.from?.name || 'عميل درة لقطع الغيار',
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
                    text: c.message,
                    timestamp: new Date(c.created_time).toLocaleDateString('ar-SA'),
                    rawTime: c.created_time,
                    status: 'pending',
                    intent: 'spare_parts',
                    sentiment: 'positive',
                    adTitle: `منشور فيسبوك: ${post.message ? post.message.slice(0, 35) + '...' : page.name}`,
                    suggestedReply: generateSmartSocialReply(c.message, c.from?.name || '', 'meta_facebook', true),
                    reply: '',
                    leadInfo: analyzeCustomerText(c.message).leadInfo,
                  });
                });
              }
            });
          }
        } catch (e) {}

        // Direct Conversations
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
                  senderName: lastMsg.from?.name || 'محادثة مباشرة',
                  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
                  text: lastMsg.message,
                  timestamp: new Date(lastMsg.created_time).toLocaleDateString('ar-SA'),
                  rawTime: lastMsg.created_time,
                  status: 'pending',
                  intent: 'spare_parts',
                  sentiment: 'positive',
                  adTitle: 'رسالة خاصة Direct DM',
                  suggestedReply: generateSmartSocialReply(lastMsg.message, lastMsg.from?.name || '', 'meta_instagram', false),
                  reply: '',
                  leadInfo: analyzeCustomerText(lastMsg.message).leadInfo,
                });
              }
            });
          }
        } catch (e) {}
      }
    }
  } catch (err) {
    console.warn('Meta Graph sync note:', err.message);
  }

  return liveItems;
}

export async function syncLiveTikTokComments() {
  const tiktokConfig = loadTikTokConfig();
  const token = tiktokConfig.accessToken || '61a22e0b24b413e83da9ef7e5d012475caea7ec2';
  const advertiserId = tiktokConfig.advertiserId || '7344310111864799234';
  const liveItems = [];

  try {
    const res = await fetch(`https://business-api.tiktok.com/open_api/v1.3/comment/list/?advertiser_id=${advertiserId}`, {
      headers: { 'Access-Token': token },
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
          timestamp: 'الآن',
          rawTime: new Date().toISOString(),
          status: 'pending',
          intent: 'spare_parts',
          sentiment: 'positive',
          adTitle: `إعلان تيك توك: ${item.ad_name || 'درة لقطع الغيار'}`,
          suggestedReply: generateSmartSocialReply(item.text, item.user_name || '', 'tiktok', true),
          reply: '',
          leadInfo: analyzeCustomerText(item.text).leadInfo,
        });
      });
    }
  } catch (e) {
    console.warn('TikTok comments API call note:', e.message);
  }

  return liveItems;
}

export async function syncLiveSocialData() {
  const metaItems = await syncLiveMetaCommentsAndMessages();
  const tiktokItems = await syncLiveTikTokComments();
  const allLive = [...metaItems, ...tiktokItems];

  const currentInbox = loadResponderInbox();
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
// TEXT ANALYSIS & TRAINED DORA CARS REPLY ENGINE
// -------------------------------------------------------------

// Customer Text Analyzer: Extract brand (Kia / Hyundai), Model, Year, Part, Fault
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
      leadInfo: { carModel: '', interestType: '', city: '', phone: '' }
    };
  }

  const raw = text.toLowerCase();
  let brand = 'unknown'; // 'kia' | 'hyundai' | 'diesel' | 'online' | 'unknown'
  let model = '';
  let year = '';
  let part = '';
  let isFault = false;
  let isDiesel = false;

  // Extract phone number
  let phone = '';
  const phoneMatch = text.match(/(?:(?:\+?966)|0)?5\d{8}/);
  if (phoneMatch) phone = phoneMatch[0];

  // Extract 4-digit year (e.g. 2015 - 2026)
  const yearMatch = text.match(/20[1-2]\d/);
  if (yearMatch) year = yearMatch[0];

  // Check Kia models
  if (/كيا|أوبتيما|اوبتيما|سيراتو|سبورتاج|كادنزا|سورينتو|ريو|سيلتوس|بيجاس|كارينز|تيلورايد|k5|كي فايف/.test(raw)) {
    brand = 'kia';
    if (/أوبتيما|اوبتيما/.test(raw)) model = 'أوبتيما';
    else if (/سيراتو/.test(raw)) model = 'سيراتو';
    else if (/سبورتاج/.test(raw)) model = 'سبورتاج';
    else if (/كادنزا/.test(raw)) model = 'كادنزا';
    else if (/سورينتو/.test(raw)) model = 'سورينتو';
    else if (/ريو/.test(raw)) model = 'ريو';
    else model = 'كيا';
  }

  // Check Hyundai models
  if (/هيونداي|سوناتا|إلنترا|النترا|أكسنت|اكسنت|توسان|سنتافي|سنتا في|أزيرا|ازيرا|كريتا|كونا|ستاريا|باليسيد/.test(raw)) {
    brand = 'hyundai';
    if (/سوناتا/.test(raw)) model = 'سوناتا';
    else if (/إلنترا|النترا/.test(raw)) model = 'إلنترا';
    else if (/أكسنت|اكسنت/.test(raw)) model = 'أكسنت';
    else if (/توسان/.test(raw)) model = 'توسان';
    else if (/سنتافي|سنتا في/.test(raw)) model = 'سنتافي';
    else if (/أزيرا|ازيرا/.test(raw)) model = 'أزيرا';
    else model = 'هيونداي';
  }

  // Check Diesel
  if (/ديزل|تيربو|بخاخات ديزل|طرمبة ديزل|فلتر ديزل/.test(raw)) {
    isDiesel = true;
  }

  // Check Online / Shipping intent
  const isOnline = /موقع|متجر|سلة|شحن|اونلاين|أونلاين|توصيل|الرياض|جدة|الدمام|الشرقية|مكة|المدينة|تبوك|حائل|خميس/.test(raw);

  // Check Fault / Technical questions
  if (/ما يبرد|حرارة|ترتفع|صوت|طقة|تفتفة|تقطيع|يقطع|تهريب|خربان|أغير|ابدل|مشكلة/.test(raw)) {
    isFault = true;
  }

  // Detect common parts with Saudi terminology
  if (/فحمات|تيل/.test(raw)) part = 'فحمات الفرامل';
  else if (/هوبات|أقراص/.test(raw)) part = 'هوبات الفرامل';
  else if (/كمبروسر|مكيف/.test(raw)) part = 'كمبروسر المكيف';
  else if (/رديتر/.test(raw)) part = 'رديتر الماء';
  else if (/مساعدات|مساعد/.test(raw)) part = 'مساعدات';
  else if (/شمعات|شمعة|نور/.test(raw)) part = 'شمعات إنارة';
  else if (/صدام|كبوت|باب|بدي|رفرف/.test(raw)) part = 'قطع بدي';
  else if (/كراسي مكينة|قواعد محرك/.test(raw)) part = 'كراسي المكينة';
  else if (/ركبة|مفصل مقص/.test(raw)) part = 'ركبة مقص';
  else if (/جلب مقصات|جلدة/.test(raw)) part = 'جلب المقصات';

  return {
    brand,
    model,
    year,
    part,
    isFault,
    isDiesel,
    isOnline,
    leadInfo: {
      carModel: model ? `${brand === 'kia' ? 'كيا' : 'هيونداي'} ${model} ${year}`.trim() : (brand === 'kia' ? 'كيا' : brand === 'hyundai' ? 'هيونداي' : 'غير محدد'),
      interestType: part || (isFault ? 'استفسار فحص عطل' : 'قطع غيار'),
      city: isOnline ? 'شحن خارج الفروع' : 'القصيم / بريدة',
      phone
    }
  };
}

// Generate Official Trained Reply strictly following the 17 prompt sections
export function generateSmartSocialReply(customerText, senderName = '', platform = 'meta_instagram', isPublicComment = false) {
  const analysis = analyzeCustomerText(customerText);
  const raw = customerText.toLowerCase();

  // 1. Handling Fault Questions (Section 10)
  if (analysis.isFault) {
    if (/مكيف|كمبروسر|ما يبرد|تبريد/.test(raw)) {
      return `حياك الله 🌹 ضعف التبريد له أكثر من سبب مثل نقص غاز التبريد أو التهريب أو مشكلة كهربائية، لذلك الأفضل فحص السيارة وتحديد سبب المشكلة قبل تغيير الكمبروسر. إذا تم الفحص وتحتاج القطعة، أرسل لنا موديل السيارة وسنة الصنع ونساعدك في توفير المناسب.`;
    }
    if (/حرارة|ترتفع|رديتر|بلف/.test(raw)) {
      return `حياك الله 🌹 ارتفاع الحرارة قد يكون له أكثر من سبب، لذلك الأفضل تحديد سبب المشكلة عبر الفحص قبل تغيير القطعة. إذا تم تشخيص العطل وتحتاج الرديتر أو بلف الحرارة، أرسل لنا موديل السيارة وسنة الصنع ونساعدك في تحديد المناسب.`;
    }
    return `حياك الله 🌹 لتجنب تغيير قطع غير لازمة، يُفضل دائماً فحص المشكلة وتحديد السبب الدقيق أولاً. وإذا تم التشخيص وتحتاج قطع الغيار، أرسل لنا بيانات السيارة وسنة الصنع والقطعة المطلوبة ونساعدك في توفيرها بأفضل سعر.`;
  }

  // 2. Public Comments Handling (Section 6)
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

  // 3. Online Store / Shipping Intent (Section 3 & 14)
  if (analysis.isOnline && !analysis.brand.startsWith('k') && !analysis.brand.startsWith('h')) {
    return `حياك الله في درة السيارة لقطع الغيار 🌹 يسعدنا خدمتك. يمكنك التواصل مع المتجر الإلكتروني على: 0538834212 أو تصفح والطلب عبر المتجر: https://doracars.com/ وللتأكد من القطعة المناسبة أرسل لنا موديل السيارة وسنة الصنع والقطعة المطلوبة.`;
  }

  // 4. KIA Routing (Section 2, 3, 14)
  if (analysis.brand === 'kia') {
    const carDetails = [analysis.model, analysis.year].filter(Boolean).join(' ');
    // If car model and year already provided, don't ask for them!
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

  // 5. HYUNDAI Routing (Section 2, 3, 14)
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

  // 6. Diesel Engine Inquiries (Section 3)
  if (analysis.isDiesel) {
    return `حياك الله 🌹 يسعدنا خدمتك في تخصص محركات الديزل وسيارات الديزل الكورية. للتأكد التام من القطعة المناسبة والتوافق، أرسل لنا: نوع السيارة + الموديل + سنة الصنع + نوع المحرك والقطعة المطلوبة، ونوجهك للفرع المتخصص لخدمتك بدقة.`;
  }

  // 7. General Inquiry Template (Section 14)
  return `حياك الله في درة السيارة لقطع الغيار 🌹
يسعدنا خدمتك. أرسل لنا نوع السيارة + الموديل + سنة الصنع + القطعة المطلوبة، ونساعدك في التحقق من القطعة المناسبة وتوجيهك للفرع المختص.`;
}

// Quick Reply Template Shortcuts based on Section 14
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
