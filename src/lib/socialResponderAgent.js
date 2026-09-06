// Dora Cars - Meta & TikTok AI Social Responder Agent Engine
// Manages automated and smart assisted replies for Meta (Instagram, Facebook, WhatsApp) and TikTok (Ads & Comments)

import { loadMetaConfig } from './metaIntegration';
import { loadTikTokConfig } from './tiktokIntegration';

const STORAGE_KEYS = {
  SETTINGS: 'dora_social_responder_settings',
  MESSAGES: 'dora_social_responder_inbox',
  LEADS: 'dora_social_responder_leads',
  METRICS: 'dora_social_responder_metrics',
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
  autoPilotMode: false, // true = automatic reply without human review, false = suggest & human approval
  responseTone: 'saudi_friendly', // 'saudi_friendly' | 'formal_business' | 'quick_sales'
  responseDelaySeconds: 3, // simulate realistic human typing
  notifyOnLead: true,
  platforms: {
    instagramDm: true,
    instagramComments: true,
    facebookComments: true,
    whatsapp: true,
    tiktokComments: true,
    tiktokDm: true,
  },
  autoCaptureLeads: true,
};

// Initial Seed Messages / Comments Inbox
export const INITIAL_SOCIAL_INBOX = [
  {
    id: 'msg-tk-101',
    platform: 'tiktok',
    channelType: 'ad_comment',
    senderName: 'سعد العتيبي (@saad_otaibi99)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
    text: 'ما شاء الله تبارك الله، بكم قسط التورس 2024 عندكم بدون دفعة أولى؟ وهل السيارة متوفرة بفرع بريدة؟',
    timestamp: 'منذ 8 دقائق',
    rawTime: new Date(Date.now() - 8 * 60000).toISOString(),
    status: 'pending', // 'pending' | 'replied' | 'converted'
    intent: 'purchase_financing',
    sentiment: 'positive',
    adTitle: 'إعلان تيك توك: وصول فورد تورس 2024 درة السيارة',
    adId: '7344310111864799234',
    suggestedReply: 'أهلاً بك أستاذ سعد ويسعد مساك 🤍 نعم الفورد تورس 2024 متوفرة وجاهزة للاستلام في معرض درة للسيارات ببريدة! متاح التمويل بدون دفعة أولى وقسط يبدأ من 1,850 ر.س حسب الراتب والبنك. تواصل معنا على الواتساب 0555123456 لنحسب لك الحسبة بدقة ونجهز لك السيارة بأقوى عروض اليوم الوطني 🇸🇦',
    reply: '',
    leadInfo: {
      carModel: 'فورد تورس 2024',
      interestType: 'تمويل بدون دفعة أولى',
      city: 'بريدة / القصيم',
      phone: '',
    }
  },
  {
    id: 'msg-meta-102',
    platform: 'meta_instagram',
    channelType: 'dm',
    senderName: 'نورة التميمي (@noura.tamimi)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    text: 'مساء الخير، أبغى مساعدات وشمعات كامري 2021 أصلية، هل متوفرة عندكم في متجر سلة وهل عندكم شحن للرياض؟',
    timestamp: 'منذ 24 دقيقة',
    rawTime: new Date(Date.now() - 24 * 60000).toISOString(),
    status: 'pending',
    intent: 'spare_parts',
    sentiment: 'positive',
    adTitle: 'رسالة خاصة انستقرام Direct DM',
    suggestedReply: 'مساء النور أهلاً أخت نورة 🌸 متوفرة جميع قطع الغيار الأصلية لكامري 2021 في متجر درة للسيارات على سلة، مع ضمان أصلي وتوصيل سريع لباب بيتك بالرياض خلال 24-48 ساعة! 🚚 تقدرين تطلبينها مباشرة من الرابط: https://salla.sa/doracars أو ارسلي رقم الهيكل ونخدمك فوراً 🤍',
    reply: '',
    leadInfo: {
      carModel: 'كامري 2021',
      interestType: 'قطع غيار أصلية (مساعدات وشمعات)',
      city: 'الرياض',
      phone: '',
    }
  },
  {
    id: 'msg-meta-103',
    platform: 'meta_whatsapp',
    channelType: 'whatsapp',
    senderName: 'فهد المطيري (+966 50 112 4433)',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces',
    text: 'السلام عليكم ورحمة الله، شفت إعلانكم على انستقرام عن عروض اليوم الوطني، هل العروض تشمل تويوتا لاندكروزر وكم مدة استلام السيارة؟',
    timestamp: 'منذ 45 دقيقة',
    rawTime: new Date(Date.now() - 45 * 60000).toISOString(),
    status: 'replied',
    intent: 'national_day_offers',
    sentiment: 'positive',
    adTitle: 'حملة ميتا: 1,617 محادثة واتساب جارية',
    suggestedReply: 'وعليكم السلام ورحمة الله وبركاته، حياك الله أخوي فهد ونورتنا 🇸🇦 نعم عروض اليوم الوطني 94 تشمل تويوتا لاندكروزر بخصم استثنائي + بكج حماية نانو سيراميك مجاني! الاستلام فوري خلال يومين عمل من فرع معارض بريدة مع إمكانية الشحن لموقعك. هل تفضل كاش أو عن طريق البنك؟',
    reply: 'وعليكم السلام ورحمة الله وبركاته، حياك الله أخوي فهد ونورتنا 🇸🇦 نعم عروض اليوم الوطني 94 تشمل تويوتا لاندكروزر بخصم استثنائي + بكج حماية نانو سيراميك مجاني! الاستلام فوري خلال يومين عمل من فرع معارض بريدة مع إمكانية الشحن لموقعك. هل تفضل كاش أو عن طريق البنك؟',
    repliedAt: 'منذ 42 دقيقة',
    leadInfo: {
      carModel: 'تويوتا لاندكروزر',
      interestType: 'عروض اليوم الوطني 94',
      city: 'القصيم',
      phone: '+966 50 112 4433',
    }
  },
  {
    id: 'msg-tk-104',
    platform: 'tiktok',
    channelType: 'ad_comment',
    senderName: 'عمر خالد (@omarkh_cars)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    text: 'وين موقعكم بالضبط وساعات الدوام لو بجيكم اليوم؟',
    timestamp: 'منذ ساعة',
    rawTime: new Date(Date.now() - 60 * 60000).toISOString(),
    status: 'pending',
    intent: 'location_hours',
    sentiment: 'neutral',
    adTitle: 'إعلان تيك توك: زيارة المعارض في بريدة',
    suggestedReply: 'حياك الله أخوي عمر تشرفنا بأي وقت 🤍 موقعنا في القصيم - بريدة، طريق الملك عبدالعزيز، منطقة معارض السيارات (معرض درة للسيارات). دوامنا اليوم من 4:00 عصراً حتى 10:00 مساءً. لو حاب نوصف لك اللوكيشن ارسل لنا واتساب على 0555123456 وقهوتك جاهزة ☕',
    reply: '',
    leadInfo: {
      carModel: 'زيارة المعرض',
      interestType: 'موقع المعرض وساعات العمل',
      city: 'بريدة',
      phone: '',
    }
  },
  {
    id: 'msg-meta-105',
    platform: 'meta_facebook',
    channelType: 'post_comment',
    senderName: 'م. خالد الدوسري (@eng_khalid)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    text: 'هل عندكم تمويل لمتقاعدين؟ وكم نسبة الفائدة في البنك الأهلي؟',
    timestamp: 'منذ ساعتين',
    rawTime: new Date(Date.now() - 120 * 60000).toISOString(),
    status: 'replied',
    intent: 'purchase_financing',
    sentiment: 'positive',
    adTitle: 'إعلان فيسبوك: حلول التمويل لجميع الفئات',
    suggestedReply: 'أهلاً بك مهندس خالد ويسعدنا خدمتك 🌹 نعم متاح تمويل معتمد وميسر لجميع المتقاعدين بدون دفعة أولى مع البنك الأهلي وكافة البنوك، مع خصومات خاصة ونسبة فائدة مخفضة جداً بمناسبة اليوم الوطني. تواصل معنا على 0555123456 ونحسب لك التمويل والأقساط فوراً 🤍',
    reply: 'أهلاً بك مهندس خالد ويسعدنا خدمتك 🌹 نعم متاح تمويل معتمد وميسر لجميع المتقاعدين بدون دفعة أولى مع البنك الأهلي وكافة البنوك، مع خصومات خاصة ونسبة فائدة مخفضة جداً بمناسبة اليوم الوطني. تواصل معنا على 0555123456 ونحسب لك التمويل والأقساط فوراً 🤍',
    repliedAt: 'منذ ساعة و55 دقيقة',
    leadInfo: {
      carModel: 'تمويل سيارة',
      interestType: 'تمويل متقاعدين - البنك الأهلي',
      city: '',
      phone: '',
    }
  }
];

// Load Settings
export function loadResponderSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_RESPONDER_SETTINGS;
    return { ...DEFAULT_RESPONDER_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_RESPONDER_SETTINGS;
  }
}

// Save Settings
export function saveResponderSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {}
}

// Load Inbox Messages
export function loadResponderInbox() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_SOCIAL_INBOX));
      return INITIAL_SOCIAL_INBOX;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_SOCIAL_INBOX;
  }
}

// Save Inbox Messages
export function saveResponderInbox(messages) {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch (e) {}
}

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

// Generate Smart Saudi-Friendly AI Reply
export function generateSmartSocialReply(customerText, senderName = '', platform = 'meta_instagram') {
  const analysis = analyzeCustomerText(customerText);
  const firstName = senderName ? senderName.split(' ')[0].replace(/[@()_]/g, '').trim() : '';
  const greeting = firstName ? `أهلاً بك ${firstName} ويسعد مساك 🤍` : 'أهلاً بك ويسعد مساك 🤍';

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

// Generate Quick Action Templates
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
