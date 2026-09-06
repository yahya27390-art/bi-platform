import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Lock, 
  Send, 
  Plus, 
  Bot, 
  TrendingUp, 
  Target, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ArrowUpRight, 
  Sliders, 
  Share2, 
  Calendar, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Lightbulb, 
  Search,
  MapPin,
  Flame,
  FileText,
  Save,
  Check,
  Settings,
  Key,
  Cpu,
  Radio,
  ExternalLink,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Minus,
  Copy,
  RotateCcw,
  ListTodo,
  BrainCircuit,
  CheckSquare,
  Clock,
  Zap,
  BookOpen,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { formatSAR, formatNum } from '../lib/kpiEngine';
import ga4Snapshot from '../data/ga4LiveSnapshot.json';
import gscSnapshot from '../data/gscLiveSnapshot.json';
import {
  loadAgentMemories,
  saveAgentMemories,
  loadAgentTasks,
  saveAgentTasks,
  loadChatHistory,
  saveChatHistory,
  formatMemoriesForPrompt,
  formatTasksForPrompt,
  detectLearnableFact,
  DEFAULT_MEMORIES,
  DEFAULT_TASKS
} from '../lib/agentMemory';

// System prompt grounding the AI Agent in real Dora Cars data
const DORA_SYSTEM_PROMPT = `أنت المساعد الذكي والخبير التسويقي الرقمي الخاص لشركة "درة السيارة" (Dora Cars) في المملكة العربية السعودية.
أنت تتحدث مباشرة مع مسؤول الحملات والنظام في مساحته الخاصة والسرية.
تتميز بأسلوب مهني، ذكي، ودود، ومشجع ولبق باللهجة البيضاء الراقية (مزيج راقٍ وسهل بين السعودية والمصرية).
إذا سلم عليك أو سألك "أنت موجود؟" أو ما شابه، رحب به بحرارة وأكد له وجودك واستعدادك للعمل فوراً وبدء التخطيط للحملات.

بيانات وأرقام درة السيارة الحقيقية المعتمدة (يجب أن تبني إجاباتك عليها):
- النشاط: تجارة وتوزيع قطع غيار السيارات الأصلية (هيونداي، كيا، تويوتا، فلاتر هواء وزيت، بواجي، فحمات فرامل، سيور، زيوت، وبطاريات).
- أرقام شهر أغسطس 2026 المعتمدة:
  * إجمالي المبيعات بدون مردود: 1,104,900.66 ر.س
  * المردودات: 115,378.50 ر.س
  * صافي المبيعات الفعلي: 989,522.16 ر.س
  * هامش الربح الصافي المعتمد: 28.03% (صافي الربح: 277,363.06 ر.س)
  * تكلفة البضاعة المباعة (COGS): 712,159.10 ر.س (71.97%)
- الفروع الميدانية (في بريدة - منطقة القصيم):
  * الفرع الرئيسي: 428,881.08 ر.س صافي
  * فرع كيا: 269,275.58 ر.س صافي
  * فرع الرواف: 291,365.50 ر.س صافي
  * الإجمالي الميداني: 989,522.16 ر.س (تجاوز مستهدف الـ 800 ألف ر.س بنسبة 123.7%).
- متجر سلة الإلكتروني (Google Analytics 4 API - الخاصية: 421858793):
  * 14,231 زائر نشط، 18,527 جلسة، 41,783 ر.س مبيعات أونلاين، 66 طلب شراء.
  * توزيع مبيعات المتجر بالمدن:
    1. جدة: 13,150 ر.س (20 طلب شراء | 4,585 زائر)
    2. الرياض: 9,375 ر.س (16 طلب شراء | 3,380 زائر)
    3. الدمام: 6,885 ر.س (12 طلب شراء | 1,943 زائر)
    4. المدينة المنورة: 5,410 ر.س (9 طلبات شراء | 1,115 زائر)
    5. بريدة: 3,350 ر.س سلة + 989.5 ألف فروع
    6. أبها: 2,004 ر.س (3 طلبات شراء | 507 زوار)
    7. مكة المكرمة: 769 ر.س (طلبين | 113 زائر)
    8. تبوك: 125 ر.س (طلب واحد | 43 زائر)
- Google Search Console (doracars.com):
  * الترتيب الأول عالمياً (Rank 1.0) بكلمات "درة السيارة لقطع الغيار" (49.8% CTR)، "درة السيارات"، "درة السياره".
  * استفسارات قطع غيار هيونداي تحقق أكثر من 630 ظهوراً.

مهامك ومسؤولياتك:
1. الإجابة على أي سؤال تسويقي أو تحليلي بدقة واحترافية.
2. كتابة نصوص إعلانات جذابة متوافقة مع منصات Google Search و Meta و TikTok و Snapchat.
3. اقتراح استراتيجيات توزيع الميزانيات وتحديد الجمهور المستهدف بدقة.
4. تحسين تكلفة الاستحواذ على العميل (CPA) ومعدل العائد على الإنفاق الإعلاني (ROAS).`;

// Default starter private campaigns
const INITIAL_CAMPAIGNS = [
  {
    id: 'camp-01',
    name: 'حملة بحث Google للكلمات المتصدرة (قطع غيار كيا وهيونداي)',
    platform: 'Google Search',
    status: 'active',
    objective: 'مبيعات متجر سلة (Online Sales)',
    budget: 12000,
    dailyBudget: 400,
    targetCities: ['الرياض', 'جدة', 'الدمام', 'المدينة'],
    aiScore: 94,
    aiTip: 'استغل كلمة "درة السيارة لقطع الغيار" ذات الترتيب 1.0 و CTR 49.8% في GSC. العائد المتوقع 4.2x.',
    notes: 'تم ربطها بصفحات تصنيف الفرامل والفلاتر الأكثر طلباً.',
  },
  {
    id: 'camp-02',
    name: 'حملة Meta إنستقرام ريلز (عروض اليوم الوطني - فلاتر وزيوت)',
    platform: 'Meta Ads',
    status: 'active',
    objective: 'مبيعات متجر سلة + تحويل واتساب',
    budget: 8500,
    dailyBudget: 280,
    targetCities: ['جدة', 'الرياض', 'القصيم'],
    aiScore: 88,
    aiTip: 'ركز على مقاطع الفيديو القصيرة (15 ثانية) لفك وتركيب الفلاتر. جدة تمثل 32% من حركة زوارك.',
    notes: 'إعادة استهداف زوار الموقع خلال آخر 30 يوماً.',
  },
  {
    id: 'camp-03',
    name: 'حملة Google Maps محلية لزيارات فروع بريدة (Local Store Visits)',
    platform: 'Google Search',
    status: 'needs_optim',
    objective: 'زيارات الفروع الميدانية (بريدة)',
    budget: 5000,
    dailyBudget: 165,
    targetCities: ['بريدة', 'عنيزة', 'منطقة القصيم'],
    aiScore: 78,
    aiTip: 'الفروع حققت 989 ألف ر.س. ارفع الميزانية 15% قبل نهاية الأسبوع لتغطية فرع كيا والفرع الرئيسي.',
    notes: 'إضافة أرقام هواتف الفروع وروابط خرائط جوجل المباشرة.',
  },
  {
    id: 'camp-04',
    name: 'حملة تيك توك الفيروسية للسيارات (Spark Ads)',
    platform: 'TikTok Ads',
    status: 'draft',
    objective: 'وعي وزيارات المتجر',
    budget: 4500,
    dailyBudget: 150,
    targetCities: ['كافة مدن المملكة'],
    aiScore: 82,
    aiTip: 'استهدف المهتمين بصيانة السيارات ومعدات القيادة من عمر 22 إلى 45 سنة.',
    notes: 'قيد تجهيز الفيديوهات مع صناع المحتوى في ورش القصيم.',
  },
  {
    id: 'camp-05',
    name: 'حملة سناب شات ستوري - إعادة استهداف السلات المتروكة',
    platform: 'Snapchat',
    status: 'active',
    objective: 'استعادة السلات المتروكة (Retargeting)',
    budget: 3500,
    dailyBudget: 120,
    targetCities: ['الرياض', 'جدة', 'الشرقية'],
    aiScore: 91,
    aiTip: 'توجد أكثر من 18 ألف جلسة تصفح في GA4. كوبون خصم 5% مع شحن مجاني سيرفع التحويل فوراً.',
    notes: 'استخدام بكسل سلة لتتبع من وصل لصفحة إتمام الطلب.',
  },
];

// Smart Natural Language Fallback (when no live API key is set)
function generateSmartLocalReply(q, memories = [], tasks = []) {
  const lower = q.toLowerCase();

  // Greetings & Presence Check
  if (
    lower.includes('موجود') || 
    lower.includes('انت هنا') || 
    lower.includes('رد عليا') || 
    lower.includes('السلام') || 
    lower.includes('مرحبا') || 
    lower.includes('هلا') || 
    lower.includes('صباح') || 
    lower.includes('مساء') ||
    lower.includes('هاي') ||
    lower.includes('ازيك') ||
    lower.includes('عامل ايه')
  ) {
    return `أهلاً وسهلاً يا باشا! نعم أنا موجود معك ولحظة بلحظة! 🚀⚡

أنا مساعدك الذكي المخصص لمساحتك الخاصة، مربوط مباشرة ببيانات درة السيارة (Google Analytics 4، Google Search Console، وفواتير فروع بريدة).

جاهز أساعدك في:
1. ✍️ **كتابة نصوص إعلانات جذابة** (جوجل سيرش، ريلز، تيك توك، سناب).
2. 📊 **اقتراح وتوزيع الميزانيات** وحساب العائد المتوقع.
3. 🎯 **استهداف العملاء في المدن الأكثر مبيعاً** (جدة والرياض والقصيم).
4. 🛠️ **ربطي مباشرة بمفتاح Google Gemini API** عبر زر الإعدادات أعلاه للإجابة بأقوى نماذج الذكاء الاصطناعي الحية!

قول لي عايز نبدأ نشتغل على إيه النهاردة؟`;
  }

  // Who are you?
  if (lower.includes('مين انت') || lower.includes('عرف نفسك') || lower.includes('بتعمل ايه') || lower.includes('وظيفتك')) {
    return `أنا **AI Marketing Copilot** الخاص بشركة درة السيارة.
تم تدريبي على بيانات المبيعات الحقيقية لشهر أغسطس 2026 (989,522 ر.س مبيعات فروع بريدة، و 41,783 ر.س مبيعات متجر سلة، وكلمات البحث المتصدرة بـ Google).
وظيفتي أساعدك كمسؤول حملات في إدارة وتنظيم ميزانياتك وصياغة إعلانات تحقق أعلى ROAS ممكن بدون أن يطّلع عليها المدير.`;
  }

  // Copywriting
  if (lower.includes('نص') || lower.includes('كتابة') || lower.includes('إعلان') || lower.includes('copy') || lower.includes('صيغة') || lower.includes('عروض')) {
    return `📝 **مقترح 3 نصوص إعلانية احترافية لقطع غيار درة السيارة:**

1. **إعلان Google Search (تركيز على السرعة والأصالة):**
   - **العنوان:** قطع غيار هيونداي وكيا أصلية 100% | شحن سريع لجميع مدن المملكة
   - **الوصف:** اطلب الآن من متجر درة السيارة مع ضمان أصلي وتوصيل لباب بيتك أو استلم من فروعنا ببريدة. أسعار خاصة وتوصيل فوري!
   - **رابط الهبوط:** doracars.com/collections/hyundai-kia

2. **إعلان إنستقرام وريلز (تفاعلي وجذاب):**
   - **النص:** "لا تخلي سيارتك تنتظر! 🚗 فلاتر، بواجي، وسيور من درة السيارة بأفضل سعر في المملكة. اطلب في دقيقة وتصلك أينما كنت في الرياض أو جدة أو الشرقية."
   - **CTA:** تسوق الآن مع كود خصم إضافي: DORA2026

3. **إعلان سناب شات وتيك توك (سريع ومباشر):**
   - **النص:** دورك تدلع موترك! عروض درة لقطع الغيار وصلت. شحن فوري ودفع عند الاستلام أو تابي وتمارا. انقر للطلب الآن! ⚡`;
  }

  // Budget
  if (lower.includes('ميزانية') || lower.includes('توزيع') || lower.includes('صرف') || lower.includes('budget')) {
    return `📊 **التوزيع الذكي الموصى به لميزانية الحملات بناءً على بيانات الربط الحي:**

- **Google Search Ads (45%):**
  - السبب: موقعك يتصدر المرتبة الأولى في عبارات "درة قطع غيار". هذه القناة تحقق أعلى نية شراء مباشرة (High Purchase Intent) وأقل تكلفة اكتساب.
- **Meta Ads (انستقرام وفيسبوك) (30%):**
  - السبب: إعادة استهداف 14,231 زائر مسجلين في GA4، والتركيز الجغرافي على جدة والرياض (36 عملية شراء مؤكدة).
- **TikTok Ads (15%):**
  - للانتشار السريع بين فئات الشباب وجلب زوار جدد للمتجر الإلكتروني بتكلفة نقرة منخفضة (Low CPC).
- **Google Local Campaigns (10%):**
  - موجهة لمنطقة القصيم وبريدة لتعزيز مبيعات الفروع الميدانية الثلاثة (الرئيسي، كيا، الرواف).`;
  }

  // Geo
  if (lower.includes('مدن') || lower.includes('جغرافي') || lower.includes('جدة') || lower.includes('رياض') || lower.includes('بريدة') || lower.includes('استهداف')) {
    return `🗺️ **تحليل الاستهداف الجغرافي الذكي (من واقع بيانات GA4 الحي):**

1. **التركيز الأول (جدة & الرياض):**
   - حققتا معاً 7,965 زائر نشط و 36 عملية شراء مؤكدة بقيمة 22,525 ر.س.
   - **الإجراء:** يجب حصر 60% من ميزانية مبيعات المتجر أونلاين لهاتين المدينتين.
2. **المركز الميداني (بريدة والقصيم):**
   - مبيعات الفروع الميدانية بلغت 989,522.16 ر.س.
   - **الإجراء:** إعلانات خرائط جوجل المحلية (Local Performance Max) مع إبراز خدمة "استلم من أقرب فرع في بريدة".
3. **فرص النمو (الدمام والمدينة):**
   - سجلتا 3,058 زائر و 21 عملية شراء بقيمة 12,295 ر.س.
   - **الإجراء:** عروض شحن مخفض أو مجاني للطلبات فوق 300 ر.س.`;
  }

  // Retargeting
  if (lower.includes('سلات') || lower.includes('متروكة') || lower.includes('إعادة استهداف') || lower.includes('retargeting')) {
    return `🎯 **خطة استعادة السلات المتروكة (Cart Abandonment Funnel):**

- **البيانات الحالية:** في شهر أغسطس سجل GA4 أكثر من 18,527 جلسة و 47,221 مشاهدة صفحة ولكن 66 طلب شراء فقط، ما يعني وجود نسبة زوار مهتمين لم يكملوا الدفع.
- **الخطة المقترحة:**
  1. إنشاء شريحة في Meta Ads و Google Ads تستهدف زوار حدث \`add_to_cart\` خلال آخر 14 يوماً.
  2. تقديم كود خصم 5% مع رسالة: "هل نسيت قطعتك في السلة؟ أكمل طلبك الآن من درة السيارة واستمتع بشحن مجاني".
  3. إرسال تذكير تلقائي عبر رسائل سلة SMS أو واتساب بعد ساعتين من ترك السلة.
  - **العائد المتوقع:** استرجاع 15 إلى 30 طلب شراء إضافي شهرياً.`;
  }

  // Memory or Remember check
  if (lower.includes('ذاكر') || lower.includes('فاكر') || lower.includes('تتذكر') || lower.includes('اتعلمت') || lower.includes('افتكر')) {
    if (memories && memories.length > 0) {
      return `🧠 **نعم يا باشا! أنا فاكر ومتعلم كل كلامنا ومسجله في ذاكرتي الدائمة:**\n\n` +
        memories.map((m, i) => `${i + 1}. **[${m.category}]** ${m.title ? `${m.title}: ` : ''}${m.content}`).join('\n\n') +
        `\n\n📌 يمكنك مراجعة وتعديل هذه القواعد بأي وقت من تاب "ذاكرة الإيجنت الدائمة" بالأعلى!`;
    }
    return `🧠 ذاكرتي الدائمة مفعلة ومستعدة لحفظ أي قواعد أو توجيهات تقدمها لي فوراً!`;
  }

  // Tasks or Board check
  if (lower.includes('بورد') || lower.includes('مهام') || lower.includes('مهمة') || lower.includes('أولويات') || lower.includes('اولويات') || lower.includes('نظم نفسك')) {
    if (tasks && tasks.length > 0) {
      const active = tasks.filter(t => t.status !== 'completed');
      return `📋 **إليك بورد المهام الموكلة لي وأولويات العمل المقترحة:**\n\n` +
        active.map((t, i) => `${i + 1}. **[أولوية ${t.priority}] ${t.title}** (${t.platform})\n   - الحالة: ${t.status === 'in_progress' ? '⚡ قيد التنفيذ' : '📋 قيد الانتظار'}\n   - الملاحظة: ${t.agentNotes || t.description}`).join('\n\n') +
        `\n\n💡 يمكنك النقر على زر "اطلب من الإيجنت تنفيذها فوراً" في لوحة المهام لأبدأ العمل عليها لحظياً!`;
    }
    return `📋 لوحة المهام جاهزة ويمكنك إضافة أي مهام جديدة لي من تاب "بورد المهام" بالأعلى!`;
  }

  // General default smart response
  return `💡 **تحليل ذكي مخصص لاستفسارك:**
بناءً على أداء متجر درة السيارة في شهر أغسطس (14,231 زائر و 1,031,305 ر.س إجمالي مبيعات فروع ومتجر)، وبناءً على ما في ذاكرتي وبورد المهام:
1. **بالنسبة لطلبك:** يمكننا تطبيق ذلك فوراً سواء بإنشاء حملة جديدة أو تحديث المهام في البورد أو ضبط الاستهداف الجغرافي بدقة.
2. **نصيحة تكتيكية:** التركيز على المنتجات الأكثر طلباً (فلاتر الزيت والهواء وبواجي هيونداي وكيا) يحقق أعلى نسبة تحويل أونلاين.
3. 🧠 **الذاكرة نشطة:** يمكنك قول "تذكر أن..." أو النقر على زر "حفظ في الذاكرة" لأي رسالة لأحفظها دائماً!`;
}

const OFFICIAL_GEMINI_KEY = 'AIzaSyA9qOLWzie8GC4SmpD_lxF_jYsNX3ecquo';

export default function PrivateCampaignLab() {
  // AI Agent Configuration State
  const [agentConfig, setAgentConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('dora_ai_agent_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.apiKey && parsed.apiKey.startsWith('AIzaSy')) {
          return {
            ...parsed,
            model: parsed.model === 'gemini-1.5-flash' ? 'gemini-flash-latest' : parsed.model,
            enabled: true,
          };
        }
      }
      return {
        provider: 'gemini',
        apiKey: OFFICIAL_GEMINI_KEY,
        model: 'gemini-flash-latest',
        enabled: true,
      };
    } catch {
      return {
        provider: 'gemini',
        apiKey: OFFICIAL_GEMINI_KEY,
        model: 'gemini-flash-latest',
        enabled: true,
      };
    }
  });

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(agentConfig.apiKey || OFFICIAL_GEMINI_KEY);
  const [tempProvider, setTempProvider] = useState(agentConfig.provider || 'gemini');
  const [tempModel, setTempModel] = useState(agentConfig.model || 'gemini-flash-latest');
  const [configSaveStatus, setConfigSaveStatus] = useState('');

  // Saved campaigns in localStorage
  const [campaigns, setCampaigns] = useState(() => {
    try {
      const saved = localStorage.getItem('dora_private_campaigns');
      return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  });

  // Saved scratchpad notes
  const [scratchpad, setScratchpad] = useState(() => {
    return localStorage.getItem('dora_private_notes') || 
`# مفكرتي السرية للحملات 📝
- التركيز على عروض اليوم الوطني (بواجي + فلاتر هواء).
- التفاوض مع مورد الزيوت لعمل بكج صيانة لعملاء بريدة.
- اختبار إعلان ريلز جديد لفك وتركيب فحمات هيونداي النترا.
- متابعة نسبة النقر في حملة Google Search يوم الأحد.`;
  });
  const [noteSavedToast, setNoteSavedToast] = useState(false);

  // Active Sub-Tab: 'chat_lab' | 'tasks_board' | 'memory_bank' | 'campaigns'
  const [activeSubTab, setActiveSubTab] = useState('chat_lab');

  // Agent Long-Term Memories
  const [memories, setMemories] = useState(loadAgentMemories);
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false);
  const [newMemory, setNewMemory] = useState({ category: 'توجيهات واستراتيجيات', title: '', content: '' });
  const [memoryFilter, setMemoryFilter] = useState('all');

  // Agent Tasks Board
  const [tasks, setTasks] = useState(loadAgentTasks);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    platform: 'Meta Ads',
    status: 'todo',
    priority: 'عالية',
    dueDate: new Date().toISOString().split('T')[0],
    description: '',
    agentNotes: '',
  });

  // Learned Memory Toast
  const [learnedToast, setLearnedToast] = useState(false);

  // Filters & State
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [budgetSlider, setBudgetSlider] = useState(25000);

  // New campaign modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCamp, setNewCamp] = useState({
    name: '',
    platform: 'Google Search',
    status: 'draft',
    objective: 'مبيعات متجر سلة (Online Sales)',
    budget: 5000,
    dailyBudget: 150,
    targetCities: 'الرياض، جدة',
    notes: '',
  });

  // AI Chat state (Persistent from localStorage)
  const [chatMessages, setChatMessages] = useState(loadChatHistory);
  const [inputQuery, setInputQuery] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [copiedMsgIndex, setCopiedMsgIndex] = useState(null);
  const chatBottomRef = useRef(null);

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  // Persist memories
  useEffect(() => {
    saveAgentMemories(memories);
  }, [memories]);

  // Persist tasks
  useEffect(() => {
    saveAgentTasks(tasks);
  }, [tasks]);

  // Persist chat history
  useEffect(() => {
    saveChatHistory(chatMessages);
  }, [chatMessages]);

  // Stepper function for budget slider (500 SAR increments)
  const handleBudgetStep = (delta) => {
    setBudgetSlider((prev) => Math.max(500, Math.min(200000, prev + delta)));
  };

  // Copy AI response to clipboard
  const handleCopyMessage = (text, idx) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedMsgIndex(idx);
      setTimeout(() => setCopiedMsgIndex(null), 2000);
    } catch (e) {}
  };

  // Clear chat history and restart
  const handleClearChat = () => {
    const freshWelcome = [
      {
        sender: 'ai',
        text: 'تم مسح سجل المحادثة المؤقت! 🚀 ذاكرتي الدائمة وبورد المهام لا يزالان محفوظين بنجاح. ما هي الحملة أو المهمة التي تريد العمل عليها الآن؟',
        timestamp: 'الآن',
      },
    ];
    setChatMessages(freshWelcome);
    saveChatHistory(freshWelcome);
  };

  // Save specific message directly to agent long-term memory
  const handleSaveMessageToMemory = (text, sender) => {
    const created = {
      id: `mem-${Date.now()}`,
      category: sender === 'user' ? 'توجيهات المستخدم' : 'استراتيجيات الإيجنت',
      title: text.slice(0, 35) + '...',
      content: text,
      source: sender === 'user' ? 'محفوظ من كلام المستخدم' : 'محفوظ من إجابة الإيجنت',
      timestamp: new Date().toISOString().split('T')[0],
      autoLearned: false,
    };
    setMemories((prev) => [created, ...prev]);
    setLearnedToast(true);
    setTimeout(() => setLearnedToast(false), 3000);
  };

  // Ask Agent to execute a specific task from the Board
  const handleExecuteTaskWithAgent = (task) => {
    setActiveSubTab('chat_lab');
    const query = `ابدأ بالعمل فوراً على هذه المهمة من بورد المهام الموكلة إليك:\n📌 **المهمة:** ${task.title}\n🎯 **المنصة:** ${task.platform}\n🚨 **الأولوية:** ${task.priority}\n📝 **التفاصيل:** ${task.description}\n\nقدم لي الآن خطة تنفيذية كاملة ومقترحات نصوص الإعلانات أو الخطوات العملية!`;
    handleSendQuery(query);
  };

  // Ask Agent to reorganize and prioritize tasks
  const handleAgentOrganizeTasks = () => {
    setActiveSubTab('chat_lab');
    const query = `أريدك أن تراجع بورد المهام الموكلة إليك حالياً بالكامل، وتنظم نفسك، وتقترح لي خطة عمل مرتبة حسب الأولويات وميزانيات القنوات لهذا الأسبوع.`;
    handleSendQuery(query);
  };

  // Move task status
  const handleMoveTaskStatus = (taskId, newStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
  };

  // Delete task
  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Add new task
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    const created = {
      id: `task-${Date.now()}`,
      ...newTask,
    };
    setTasks((prev) => [created, ...prev]);
    setShowAddTaskModal(false);
    setNewTask({
      title: '',
      platform: 'Meta Ads',
      status: 'todo',
      priority: 'عالية',
      dueDate: new Date().toISOString().split('T')[0],
      description: '',
      agentNotes: '',
    });
  };

  // Add new memory
  const handleAddMemory = (e) => {
    e.preventDefault();
    if (!newMemory.content.trim()) return;
    const created = {
      id: `mem-${Date.now()}`,
      category: newMemory.category || 'توجيهات واستراتيجيات',
      title: newMemory.title || newMemory.content.slice(0, 30) + '...',
      content: newMemory.content,
      source: 'إضافة يدوية من مسؤول الحملات',
      timestamp: new Date().toISOString().split('T')[0],
      autoLearned: false,
    };
    setMemories((prev) => [created, ...prev]);
    setShowAddMemoryModal(false);
    setNewMemory({ category: 'توجيهات واستراتيجيات', title: '', content: '' });
  };

  // Delete memory
  const handleDeleteMemory = (memId) => {
    setMemories((prev) => prev.filter((m) => m.id !== memId));
  };

  // Reset to default memories
  const handleResetDefaultMemories = () => {
    if (window.confirm('هل تريد استعادة قواعد الذاكرة الافتراضية المعتمدة؟')) {
      setMemories(DEFAULT_MEMORIES);
    }
  };

  // Save campaigns to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dora_private_campaigns', JSON.stringify(campaigns));
    } catch (e) {}
  }, [campaigns]);

  // Save scratchpad
  const handleSaveNotes = () => {
    localStorage.setItem('dora_private_notes', scratchpad);
    setNoteSavedToast(true);
    setTimeout(() => setNoteSavedToast(false), 2000);
  };

  // Save AI Agent Settings
  const handleSaveAgentConfig = (e) => {
    e.preventDefault();
    const updated = {
      provider: tempProvider,
      apiKey: tempApiKey.trim(),
      model: tempModel,
      enabled: !!tempApiKey.trim(),
    };
    setAgentConfig(updated);
    localStorage.setItem('dora_ai_agent_config', JSON.stringify(updated));
    setConfigSaveStatus('تم حفظ وتفعيل ربط الإيجنت بنجاح!');
    setTimeout(() => {
      setConfigSaveStatus('');
      setShowSettingsModal(false);
    }, 1500);
  };

  // Add campaign handler
  const handleAddCampaign = (e) => {
    e.preventDefault();
    if (!newCamp.name) return;

    const created = {
      id: `camp-${Date.now()}`,
      name: newCamp.name,
      platform: newCamp.platform,
      status: newCamp.status,
      objective: newCamp.objective,
      budget: Number(newCamp.budget),
      dailyBudget: Number(newCamp.dailyBudget),
      targetCities: newCamp.targetCities.split(/[,،]/).map((c) => c.trim()).filter(Boolean),
      aiScore: Math.floor(Math.random() * 15) + 82,
      aiTip: 'تم إنشاء الحملة بنجاح، راقب تكلفة النقرة CPC خلال الـ 48 ساعة الأولى.',
      notes: newCamp.notes || 'حملة مخصصة في مساحتك الخاصة.',
    };

    setCampaigns([created, ...campaigns]);
    setShowAddModal(false);
    setNewCamp({
      name: '',
      platform: 'Google Search',
      status: 'draft',
      objective: 'مبيعات متجر سلة (Online Sales)',
      budget: 5000,
      dailyBudget: 150,
      targetCities: 'الرياض، جدة',
      notes: '',
    });
  };

  // Delete campaign
  const handleDeleteCampaign = (id) => {
    setCampaigns(campaigns.filter((c) => c.id !== id));
  };

  // Change status
  const handleToggleStatus = (id, newStatus) => {
    setCampaigns(campaigns.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
  };

  // Call Live AI Agent API (Google Gemini or OpenAI) Grounded in Memory & Task Board
  const callLiveAgent = async (userQuery, history) => {
    const memoriesContext = formatMemoriesForPrompt(memories);
    const tasksContext = formatTasksForPrompt(tasks);
    const fullSystemPrompt = `${DORA_SYSTEM_PROMPT}\n\n${memoriesContext}\n\n${tasksContext}`;

    if (agentConfig.provider === 'gemini') {
      let model = agentConfig.model || 'gemini-flash-latest';
      if (model === 'gemini-1.5-flash') model = 'gemini-flash-latest';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${agentConfig.apiKey}`;

      // Format multi-turn conversation
      const contents = [
        ...history.slice(-8).map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        })),
        {
          role: 'user',
          parts: [{ text: userQuery }],
        },
      ];

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: fullSystemPrompt }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `خطأ في الاتصال بـ Gemini API (${res.status})`);
      }

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } else if (agentConfig.provider === 'openai') {
      const model = agentConfig.model || 'gpt-4o-mini';
      const url = 'https://api.openai.com/v1/chat/completions';

      const messages = [
        { role: 'system', content: fullSystemPrompt },
        ...history.slice(-8).map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        })),
        { role: 'user', content: userQuery },
      ];

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${agentConfig.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `خطأ في الاتصال بـ OpenAI API (${res.status})`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content;
    }
  };

  // Main AI Chat Query Handler with Auto-Learning
  const handleSendQuery = async (queryText) => {
    const q = (queryText || inputQuery).trim();
    if (!q) return;

    // Detect if user statement is a learnable fact, preference, or rule
    const learnable = detectLearnableFact(q);
    if (learnable) {
      setMemories((prev) => [learnable, ...prev]);
      setLearnedToast(true);
      setTimeout(() => setLearnedToast(false), 3500);
    }

    const userMsg = { sender: 'user', text: q, timestamp: 'الآن' };
    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    setInputQuery('');
    setIsAiTyping(true);

    try {
      let aiReply = '';

      // Check if Live Agent API is configured
      if (agentConfig.enabled && agentConfig.apiKey) {
        try {
          aiReply = await callLiveAgent(q, chatMessages);
        } catch (apiErr) {
          console.warn('Live Agent API call failed, falling back to smart local agent:', apiErr);
          aiReply =
            `⚠️ *(تنبيه: تعذر الاتصال بمفتاح الـ API: ${apiErr.message} - تم التبديل التلقائي للمساعد المدمج)*\n\n` +
            generateSmartLocalReply(q, memories, tasks);
        }
      } else {
        // Smart Natural Language Fallback with memories and tasks
        await new Promise((r) => setTimeout(r, 450));
        aiReply = generateSmartLocalReply(q, memories, tasks);
      }

      setChatMessages((prev) => [...prev, { sender: 'ai', text: aiReply, timestamp: 'الآن' }]);
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'حدث خطأ في معالجة الرد، يرجى المحاولة مرة أخرى.', timestamp: 'الآن' },
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Filtered campaigns
  const filteredCampaigns = campaigns.filter(c => {
    if (platformFilter !== 'all' && c.platform !== platformFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  const totalBudget = campaigns.reduce((acc, c) => acc + c.budget, 0);
  const activeCampaignsCount = campaigns.filter(c => c.status === 'active').length;

  return (
    <div className="space-y-8 pb-16 font-sans text-slate-200" dir="rtl">
      {/* Top Banner: Confidential Workspace */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b1325] via-[#0f172a] to-[#0a0f1d] border border-slate-800 p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                مساحة سرية خاصة بك (محجوبة تماماً عن حساب المدير)
              </span>
              
              {agentConfig.enabled && agentConfig.apiKey ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>إيجنت {agentConfig.provider === 'gemini' ? 'Google Gemini' : 'OpenAI'} متصل حياً</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-teal-500/10 text-teal-300 border border-teal-500/25">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-spin" />
                  <span>المساعد المدمج نشط (جاهز للربط الحي)</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
              مختبر الحملات والمساعد الذكي (Campaign Lab & AI Copilot)
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-3xl leading-relaxed">
              مساحتك المستقلة لتنظيم، جدولة، وتطوير الحملات الإعلانية واختبار الاستراتيجيات بحرية تامة. مربوط ببيانات Google Analytics 4 و Search Console ومبيعات الفروع المباشرة.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center flex-wrap">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 hover:text-white font-medium text-xs md:text-sm transition-all shadow-sm"
              title="إعدادات ربط الإيجنت (Gemini / OpenAI)"
            >
              <Settings className="w-4 h-4 text-teal-400" />
              <span>إعدادات الإيجنت (API)</span>
              {agentConfig.enabled && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs md:text-sm shadow-lg shadow-teal-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة حملة جديدة</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">الحملات النشطة</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {activeCampaignsCount} <span className="text-xs text-slate-500 font-normal">حملات</span>
            </div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">إجمالي الميزانيات المجدولة</div>
            <div className="text-xl font-bold text-slate-100 font-mono mt-1" dir="ltr">
              {formatSAR(totalBudget, true)}
            </div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">حالة الإيجنت</div>
            <div className="text-sm font-bold text-teal-300 font-mono mt-1.5 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-teal-400" />
              <span>{agentConfig.enabled ? agentConfig.model : 'Smart Built-in'}</span>
            </div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">الكلمات المتصدرة المكتشفة</div>
            <div className="text-xl font-bold text-indigo-300 font-mono mt-1">
              4 كلمات <span className="text-xs text-slate-500 font-normal">(Rank 1.0)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-[#0d1527] rounded-2xl border border-slate-800/90 shadow-lg overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('chat_lab')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
            activeSubTab === 'chat_lab'
              ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>المساعد الذكي والمحاكي</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tasks_board')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
            activeSubTab === 'tasks_board'
              ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ListTodo className="w-4 h-4 text-indigo-400" />
          <span>بورد مهام الإيجنت (Task Board)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeSubTab === 'tasks_board' ? 'bg-white/20 text-white' : 'bg-slate-800 text-indigo-300'
            }`}
          >
            {tasks.filter((t) => t.status !== 'completed').length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('memory_bank')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
            activeSubTab === 'memory_bank'
              ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          <span>ذاكرة الإيجنت الدائمة (Memory Bank)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeSubTab === 'memory_bank' ? 'bg-white/20 text-white' : 'bg-slate-800 text-purple-300'
            }`}
          >
            {memories.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('campaigns')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
            activeSubTab === 'campaigns'
              ? 'bg-slate-700 text-white font-bold shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Target className="w-4 h-4 text-teal-400" />
          <span>جدولة الحملات</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
            {campaigns.length}
          </span>
        </button>
      </div>

      {/* VIEW 1: CHAT LAB & SIMULATOR */}
      {activeSubTab === 'chat_lab' && (
        <div className="space-y-8">
          {/* Tactical AI Recommendations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">ترشيحات الذكاء الاصطناعي التكتيكية (AI Tactical Insights)</h2>
                  <p className="text-xs text-slate-400">فرص تسويقية فورية مستخرجة آلياً من بيانات الربط الحي لرفع المبيعات وخفض تكلفة الشراء</p>
                </div>
              </div>
              <span className="text-xs text-slate-300 font-mono font-medium bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
                تحديث لحظي
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 */}
              <div className="rounded-3xl border border-slate-800/90 hover:border-slate-700 bg-[#0f172a] p-5 space-y-3.5 relative group transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20">
                    فرصة Google Search
                  </span>
                  <span className="text-xs font-mono font-bold text-sky-400">عائد متوقع 4.5x</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 leading-snug">
                  اقتناص كلمات البحث المتصدرة بـ Search Console
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  كلمة "درة السيارة لقطع الغيار" تتصدر الترتيب 1.0 بنسبة CTR 49.8%. أنشئ حملة بحثية مخصصة موجهة لصفحة الفرامل والفلاتر لحصد مبيعات فورية.
                </p>
                <button
                  onClick={() => handleSendQuery('اقترح خطة لحملة Google Search تستهدف الكلمات المتصدرة في Search Console')}
                  className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs border border-slate-700/60 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>توليد خطة الحملة بالإيجنت</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* Card 2 */}
              <div className="rounded-3xl border border-slate-800/90 hover:border-slate-700 bg-[#0f172a] p-5 space-y-3.5 relative group transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    تركيز جغرافي (Geo-Push)
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-400">54% من مبيعات سلة</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 leading-snug">
                  توجيه 60% من ميزانية Meta إلى جدة والرياض
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  سجلت جدة والرياض 36 عملية شراء مؤكدة في GA4 بقيمة 22.5 ألف ر.س. احصر إعلانات الفيديو على هاتين المدينتين مع ميزة شحن سريع.
                </p>
                <button
                  onClick={() => handleSendQuery('كيف استهدف عملاء جدة والرياض في إعلانات انستقرام وسناب شات؟')}
                  className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs border border-slate-700/60 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>طلب استراتيجية الاستهداف</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* Card 3 */}
              <div className="rounded-3xl border border-slate-800/90 hover:border-slate-700 bg-[#0f172a] p-5 space-y-3.5 relative group transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    دعم الفروع الميدانية
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">989 ألف فروع</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 leading-snug">
                  إعلانات محلية (Local Maps) لبريدة والقصيم
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  الفروع الميدانية هي القوة الكبرى للشركة. تفعيل إعلانات الخرائط المحيطة بالفرع الرئيسي وفرع كيا والرواف سيجذب عملاء الصيانة العاجلة.
                </p>
                <button
                  onClick={() => handleSendQuery('كيف أصمم حملة Google Maps محلية لزيارات فروع بريدة؟')}
                  className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs border border-slate-700/60 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>تفاصيل حملة الفروع</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* Card 4 */}
              <div className="rounded-3xl border border-slate-800/90 hover:border-slate-700 bg-[#0f172a] p-5 space-y-3.5 relative group transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    السلات المتروكة
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">18.5 ألف جلسة</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 leading-snug">
                  إعادة استهداف زوار المتجر غير المكتملين
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  هناك آلاف الزوار الذين دخلوا المتجر ولم يشتروا. إطلاق إعلان تذكيري بسيط مع كود خصم 5% سيستعيد ما بين 15 إلى 30 طلب معلق.
                </p>
                <button
                  onClick={() => handleSendQuery('ما هي أفضل طريقة لإعادة استهداف زوار المتجر الذين لم يشتروا؟')}
                  className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs border border-slate-700/60 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>خطة السلات المتروكة</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive AI Strategy Chat & Budget Allocator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Col: AI Copilot Chat */}
            <div
              className={`${
                isChatExpanded ? 'lg:col-span-12 h-[780px]' : 'lg:col-span-8 h-[700px]'
              } rounded-3xl border border-slate-800/90 bg-[#0d1527] p-6 space-y-4 shadow-xl flex flex-col transition-all duration-300 relative`}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                      <span>إيجنت الحملات الذكي (AI Campaign Agent)</span>
                      {agentConfig.enabled ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                          LIVE {agentConfig.provider.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 font-medium">
                          SMART BUILT-IN
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">
                      محادثة ذكية متصلة ببيانات الشركة وذاكرتها الدائمة وبورد المهام
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Reset / Clear Chat */}
                  <button
                    onClick={handleClearChat}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all text-xs flex items-center gap-1.5"
                    title="بدء محادثة جديدة ومسح السجل"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">جلسة جديدة</span>
                  </button>

                  {/* Expand / Maximize Toggle */}
                  <button
                    onClick={() => setIsChatExpanded(!isChatExpanded)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all text-xs flex items-center gap-1.5"
                    title={isChatExpanded ? 'تصغير مساحة الشات' : 'تكبير مساحة الشات'}
                  >
                    {isChatExpanded ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5 text-teal-400" />
                        <span className="hidden sm:inline">تصغير</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5 text-teal-400" />
                        <span className="hidden sm:inline">مساحة أوسع</span>
                      </>
                    )}
                  </button>

                  {/* Settings button */}
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all text-xs flex items-center gap-1.5"
                    title="تعديل مفتاح الـ API ومزود الذكاء الاصطناعي"
                  >
                    <Settings className="w-3.5 h-3.5 text-teal-400" />
                    <span className="hidden sm:inline">ربط الإيجنت</span>
                  </button>
                </div>
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => handleSendQuery('عايزك ترد عليا الاول انت موجود ؟')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-all whitespace-nowrap text-xs font-medium"
                >
                  👋 انت موجود؟
                </button>
                <button
                  onClick={() => handleSendQuery('نظم نفسك وبورد المهام الموكلة إليك واقترح أولويات العمل')}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-all whitespace-nowrap text-xs font-medium"
                >
                  📋 نظم نفسك وبورد المهام
                </button>
                <button
                  onClick={() => handleSendQuery('ما هي القواعد والمعلومات المحفوظة في ذاكرتك الدائمة؟')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all whitespace-nowrap text-xs"
                >
                  🧠 ما الذي تتذكره؟
                </button>
                <button
                  onClick={() => handleSendQuery(`أفضل توزيع لميزانية ${formatSAR(budgetSlider)} شهرياً`)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all whitespace-nowrap text-xs"
                >
                  📊 توزيع الميزانية
                </button>
                <button
                  onClick={() => handleSendQuery('كيف استهدف عملاء جدة والرياض في إعلانات انستقرام وسناب شات؟')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all whitespace-nowrap text-xs"
                >
                  🎯 استهداف المدن
                </button>
                <button
                  onClick={() => handleSendQuery('اقترح استراتيجية تسويقية متكاملة لعروض اليوم الوطني في درة السيارة')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all whitespace-nowrap text-xs"
                >
                  🇸🇦 عروض اليوم الوطني
                </button>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 pl-2">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.sender === 'user' ? 'justify-start flex-row-reverse' : 'justify-start'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                        msg.sender === 'user'
                          ? 'bg-slate-700 text-slate-100 font-bold'
                          : 'bg-teal-500/15 border border-teal-500/30 text-teal-300'
                      }`}
                    >
                      {msg.sender === 'user' ? 'أنت' : <Bot className="w-4 h-4" />}
                    </div>
                    <div
                      className={`relative group rounded-2xl p-4 text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-slate-800/90 border border-slate-700/70 text-slate-100 font-normal max-w-[85%]'
                          : 'bg-[#0f172a]/95 border border-slate-800/90 text-slate-200 whitespace-pre-wrap max-w-[90%]'
                      }`}
                    >
                      {msg.text}

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        {msg.sender === 'ai' && (
                          <button
                            onClick={() => handleCopyMessage(msg.text, i)}
                            className="px-2 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] flex items-center gap-1 border border-slate-700/60"
                            title="نسخ الرد"
                          >
                            {copiedMsgIndex === i ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>تم</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>نسخ</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleSaveMessageToMemory(msg.text, msg.sender)}
                          className="px-2 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/35 text-purple-300 hover:text-purple-100 text-[10px] flex items-center gap-1 border border-purple-500/40"
                          title="حفظ هذه المعلومة دائماً في ذاكرة الإيجنت"
                        >
                          <BrainCircuit className="w-3 h-3 text-purple-400" />
                          <span>حفظ بالذاكرة</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {isAiTyping && (
                  <div className="flex items-center gap-2 text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-2 rounded-xl w-fit animate-pulse">
                    <Bot className="w-4 h-4" />
                    <span>الإيجنت يحلل السؤال ويبحث في الذاكرة وبورد المهام...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuery();
                }}
                className="flex items-center gap-2 pt-3 border-t border-slate-800/80"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="اكتب سؤالك أو أمرك للإيجنت (مثال: تذكر أن نزيد ميزانية جدة، أو ما هي مهامك اليوم؟)"
                  className="flex-1 px-4 py-3 bg-slate-900/95 border border-slate-700/70 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-teal-500 transition-all placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={isAiTyping || !inputQuery.trim()}
                  className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all flex items-center gap-2 shadow-md shadow-teal-500/15"
                >
                  <span>إرسال</span>
                  <Send className="w-3.5 h-3.5 rotate-180" />
                </button>
              </form>
            </div>

            {/* Right Col: AI Budget Simulator & Scratchpad */}
            <div
              className={`${
                isChatExpanded ? 'lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6' : 'lg:col-span-4 space-y-6'
              }`}
            >
              {/* Smart Budget Allocator */}
              <div className="rounded-3xl border border-slate-800/90 bg-[#0d1527] p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">محاكي توزيع الميزانية الذكي (AI Allocator)</h3>
                  </div>
                  <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                    خطوة 500 ر.س
                  </span>
                </div>

                {/* Stepper Display & Buttons */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400">الميزانية الشهرية المقترحة:</span>
                    <span className="font-mono text-emerald-400 font-bold text-lg">{formatSAR(budgetSlider)}</span>
                  </div>

                  {/* Exact 500 SAR Stepper Controls */}
                  <div className="flex items-center justify-between gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleBudgetStep(-500)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95"
                      title="إنقاص 500 ريال"
                    >
                      <Minus className="w-3.5 h-3.5 text-rose-400" />
                      <span>500- ر.س</span>
                    </button>

                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step={500}
                        min={500}
                        max={200000}
                        value={budgetSlider}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (!isNaN(val)) setBudgetSlider(val);
                        }}
                        className="w-20 text-center bg-slate-800/80 border border-slate-700 rounded-lg py-1 text-xs font-mono font-bold text-white focus:outline-none focus:border-teal-500"
                      />
                      <span className="text-[11px] text-slate-400">ر.س</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBudgetStep(500)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95"
                      title="زيادة 500 ريال"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>500+ ر.س</span>
                    </button>
                  </div>

                  {/* Slider Input with Step=500 */}
                  <input
                    type="range"
                    min={1000}
                    max={100000}
                    step={500}
                    value={budgetSlider}
                    onChange={(e) => setBudgetSlider(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1,000 ر.س</span>
                    <span>50,000 ر.س</span>
                    <span>100,000 ر.س</span>
                  </div>

                  {/* Quick Presets Chips */}
                  <div className="pt-1">
                    <div className="text-[11px] text-slate-400 mb-1.5">ميزانيات جاهزة سريعة:</div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[5000, 10000, 15000, 20000, 25000, 30000, 50000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setBudgetSlider(preset)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                            budgetSlider === preset
                              ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold'
                              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          {preset / 1000}k
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Channel Breakdown */}
                <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                        Google Search Ads (45%)
                      </div>
                      <div className="text-[10px] text-slate-400">نية شراء عالية + كلمات Rank 1.0</div>
                    </div>
                    <span className="font-mono font-bold text-sky-400" dir="ltr">
                      {formatSAR(budgetSlider * 0.45, true)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        Meta Ads (Instagram Reels) (30%)
                      </div>
                      <div className="text-[10px] text-slate-400">استهداف جدة والرياض وإعادة استهداف GA4</div>
                    </div>
                    <span className="font-mono font-bold text-indigo-400" dir="ltr">
                      {formatSAR(budgetSlider * 0.30, true)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-400" />
                        TikTok Ads (15%)
                      </div>
                      <div className="text-[10px] text-slate-400">زيارات متجر سريعة ونقرات منخفضة التكلفة</div>
                    </div>
                    <span className="font-mono font-bold text-teal-400" dir="ltr">
                      {formatSAR(budgetSlider * 0.15, true)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Google Local Maps (بريدة) (10%)
                      </div>
                      <div className="text-[10px] text-slate-400">زيارات الفروع الميدانية الثلاثة</div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400" dir="ltr">
                      {formatSAR(budgetSlider * 0.10, true)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Private Marketer Scratchpad */}
              <div className="rounded-3xl border border-slate-800/90 bg-[#0d1527] p-6 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">مفكرتي الاستراتيجية السرية (Private Notes)</h3>
                  </div>
                  <button
                    onClick={handleSaveNotes}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1"
                  >
                    {noteSavedToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{noteSavedToast ? 'تم الحفظ!' : 'حفظ'}</span>
                  </button>
                </div>

                <textarea
                  value={scratchpad}
                  onChange={(e) => setScratchpad(e.target.value)}
                  rows={4}
                  placeholder="اكتب أفكارك وملاحظاتك واختبارات A/B هنا. لا يمكن لأي مستخدم آخر أو للمدير رؤيتها."
                  className="w-full p-3 bg-slate-900/90 border border-slate-700/70 rounded-2xl text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500 transition-all resize-none font-mono"
                />
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-indigo-400" />
                  <span>يتم الحفظ تلقائياً في ذاكرة جهازك فقط وبشكل مشفر.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: AGENT TASKS BOARD (KANBAN) */}
      {activeSubTab === 'tasks_board' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1527] p-6 rounded-3xl border border-slate-800/90 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <ListTodo className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white">
                    بورد المهام الموكلة للإيجنت (Interactive AI Task Board)
                  </h2>
                  <p className="text-xs text-slate-400">
                    لوحة مهام تفاعلية يتطلع عليها الإيجنت باستمرار لتنظيم أولوياته وتنفيذ استراتيجيات التسويق بنقرة واحدة
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleAgentOrganizeTasks}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs md:text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                title="اطلب من الإيجنت مراجعة البورد وترتيب أولوياته فوراً"
              >
                <Bot className="w-4 h-4" />
                <span>🤖 اطلب من الإيجنت تنظيم وترتيب البورد</span>
              </button>

              <button
                onClick={() => setShowAddTaskModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs md:text-sm transition-all shadow-lg shadow-teal-500/20 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مهمة جديدة</span>
              </button>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: To Do (قيد الانتظار) */}
            <div className="bg-[#0b1325] border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-white text-sm">قيد الانتظار (To Do)</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {tasks.filter((t) => t.status === 'todo').length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[750px] pr-1">
                {tasks.filter((t) => t.status === 'todo').length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl p-4">
                    لا توجد مهام قيد الانتظار حالياً.
                  </div>
                ) : (
                  tasks
                    .filter((t) => t.status === 'todo')
                    .map((task) => (
                      <div
                        key={task.id}
                        className="bg-[#0f172a] border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 space-y-3 transition-all shadow-sm group relative"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            {task.platform}
                          </span>
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                              task.priority === 'عالية'
                                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                : task.priority === 'متوسطة'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
                            }`}
                          >
                            أولوية {task.priority}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-100 text-sm leading-snug group-hover:text-teal-300 transition-colors">
                          {task.title}
                        </h4>

                        <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>

                        {task.agentNotes && (
                          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-teal-300 flex items-start gap-2">
                            <Bot className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                            <span>{task.agentNotes}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>مستهدف: {task.dueDate}</span>
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleExecuteTaskWithAgent(task)}
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-medium text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                            title="اطلب من الإيجنت تولي هذه المهمة وإعطائك خطة تنفيذية كاملة"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            <span>⚡ اطلب من الإيجنت تنفيذها</span>
                          </button>

                          <button
                            onClick={() => handleMoveTaskStatus(task.id, 'in_progress')}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-medium"
                            title="نقل إلى قيد التنفيذ"
                          >
                            بدء ▶
                          </button>

                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="حذف المهمة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Column 2: In Progress (قيد التنفيذ) */}
            <div className="bg-[#0b1325] border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-teal-400 animate-pulse" />
                  <h3 className="font-bold text-white text-sm">قيد التنفيذ (In Progress)</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                  {tasks.filter((t) => t.status === 'in_progress').length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[750px] pr-1">
                {tasks.filter((t) => t.status === 'in_progress').length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl p-4">
                    لا توجد مهام قيد التنفيذ حالياً.
                  </div>
                ) : (
                  tasks
                    .filter((t) => t.status === 'in_progress')
                    .map((task) => (
                      <div
                        key={task.id}
                        className="bg-[#0f172a] border border-teal-500/40 rounded-2xl p-4 space-y-3 transition-all shadow-md group relative"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            {task.platform}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                            جاري العمل
                          </span>
                        </div>

                        <h4 className="font-bold text-white text-sm leading-snug">{task.title}</h4>

                        <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>

                        {task.agentNotes && (
                          <div className="p-2.5 rounded-xl bg-teal-950/20 border border-teal-500/25 text-[11px] text-teal-300 flex items-start gap-2">
                            <Bot className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                            <span>{task.agentNotes}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>مستهدف: {task.dueDate}</span>
                          </span>
                          <span className="text-[10px] text-teal-400 font-mono">أولوية {task.priority}</span>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleExecuteTaskWithAgent(task)}
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 font-medium text-xs transition-all flex items-center justify-center gap-1 border border-teal-500/30"
                            title="طلب تقرير أو متابعة من الإيجنت"
                          >
                            <Bot className="w-3.5 h-3.5 text-teal-400" />
                            <span>استشارة الإيجنت</span>
                          </button>

                          <button
                            onClick={() => handleMoveTaskStatus(task.id, 'todo')}
                            className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px]"
                            title="إعادة للانتظار"
                          >
                            انتظار ⏸
                          </button>

                          <button
                            onClick={() => handleMoveTaskStatus(task.id, 'completed')}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold"
                            title="تمييز كمكتملة"
                          >
                            إنجاز ✓
                          </button>

                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="حذف المهمة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Column 3: Completed (مكتملة بنجاح) */}
            <div className="bg-[#0b1325] border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">مكتملة بنجاح (Completed)</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {tasks.filter((t) => t.status === 'completed').length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[750px] pr-1">
                {tasks.filter((t) => t.status === 'completed').length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl p-4">
                    لا توجد مهام مكتملة بعد.
                  </div>
                ) : (
                  tasks
                    .filter((t) => t.status === 'completed')
                    .map((task) => (
                      <div
                        key={task.id}
                        className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-4 space-y-2.5 transition-all opacity-85 hover:opacity-100"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                            {task.platform}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            ✓ مكتملة
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-300 text-sm line-through decoration-slate-500">
                          {task.title}
                        </h4>

                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{task.description}</p>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <button
                            onClick={() => handleMoveTaskStatus(task.id, 'todo')}
                            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>إعادة فتح</span>
                          </button>

                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: AGENT LONG-TERM MEMORY BANK */}
      {activeSubTab === 'memory_bank' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1527] p-6 rounded-3xl border border-slate-800/90 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white">
                    ذاكرة الإيجنت الدائمة والتعلم التلقائي (Agent Long-Term Memory)
                  </h2>
                  <p className="text-xs text-slate-400">
                    قاعدة بيانات معرفية محلية لا ينساها الإيجنت عبر الجلسات، تُحقن في عقله عند كل محادثة، ويتعلم منها ذاتياً من محادثاتك معه
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleResetDefaultMemories}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all"
                title="استعادة قواعد درة السيارة الافتراضية"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>استعادة القواعد المعتمدة</span>
              </button>

              <button
                onClick={() => setShowAddMemoryModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs md:text-sm transition-all shadow-lg shadow-purple-600/20 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة معلومة للذاكرة</span>
              </button>
            </div>
          </div>

          {/* Memory Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0b1325] p-4 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">إجمالي المعلومات بالذاكرة</div>
              <div className="text-2xl font-bold text-purple-300 font-mono mt-1">{memories.length}</div>
            </div>
            <div className="bg-[#0b1325] p-4 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">قواعد تم تعلمها ذاتياً</div>
              <div className="text-2xl font-bold text-teal-400 font-mono mt-1">
                {memories.filter((m) => m.autoLearned).length}
              </div>
            </div>
            <div className="bg-[#0b1325] p-4 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">توجيهات واستراتيجيات</div>
              <div className="text-2xl font-bold text-indigo-300 font-mono mt-1">
                {memories.filter((m) => m.category.includes('توجيه') || m.category.includes('استراتيج')).length}
              </div>
            </div>
            <div className="bg-[#0b1325] p-4 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">حالة الحقن بالنموذج</div>
              <div className="text-sm font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>محقونة حياً بالـ Prompt</span>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setMemoryFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                memoryFilter === 'all'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              الكل ({memories.length})
            </button>
            {['توجيهات واستراتيجيات', 'بيانات الشركة وأرقامها', 'ميزانيات واستهداف', 'قواعد وقرارات'].map((cat) => (
              <button
                key={cat}
                onClick={() => setMemoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                  memoryFilter === cat
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat} ({memories.filter((m) => m.category === cat).length})
              </button>
            ))}
            <button
              onClick={() => setMemoryFilter('auto')}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                memoryFilter === 'auto'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🤖 تعلم ذاتي من الشات ({memories.filter((m) => m.autoLearned).length})
            </button>
          </div>

          {/* Memory Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {memories
              .filter((m) => {
                if (memoryFilter === 'all') return true;
                if (memoryFilter === 'auto') return m.autoLearned;
                return m.category === memoryFilter;
              })
              .map((mem) => (
                <div
                  key={mem.id}
                  className="bg-[#0f172a] border border-slate-800/90 hover:border-purple-500/40 rounded-2xl p-5 space-y-3 transition-all flex flex-col justify-between shadow-sm relative group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/25">
                        {mem.category}
                      </span>
                      {mem.autoLearned && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                          🤖 تعلم ذاتي
                        </span>
                      )}
                    </div>

                    {mem.title && <h4 className="font-bold text-slate-100 text-sm">{mem.title}</h4>}

                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{mem.content}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[200px]">{mem.source || 'محفوظ'}</span>
                    <button
                      onClick={() => handleDeleteMemory(mem.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="حذف من الذاكرة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Educational Callout */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/20 via-[#0d1527] to-[#0b1325] border border-purple-500/25 text-xs text-slate-300 leading-relaxed flex items-start gap-3.5 shadow-md">
            <div className="w-8 h-8 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-white text-sm">💡 كيف تعمل الذاكرة والتعلم الذاتي مع الإيجنت؟</div>
              <p className="text-slate-400">
                جميع هذه القواعد تُرسل تلقائياً مع كل رسالة للإيجنت كـ <span className="text-purple-300 font-mono font-medium">System Grounding</span>.
                وعندما تتحدث معه في الشات وتقول له مثلاً: "تذكر أن نزيد ميزانية جدة" أو "احفظ عندك أن النسبة 60%"، يقوم المحرك الذكي باكتشافها فوراً وحفظها في الذاكرة الدائمة ولن ينساها إطلاقاً حتى بعد إعادة تشغيل المتصفح!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: CAMPAIGN ORGANIZER & TRACKER */}
      {activeSubTab === 'campaigns' && (
        <div className="rounded-3xl border border-slate-800/90 bg-[#0d1527] p-6 space-y-6 shadow-xl animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">لوحة تنظيم وجدولة الحملات (Campaign Organizer)</h2>
              <p className="text-xs text-slate-400">
                إدارة وتنظيم كافة حملاتك عبر المنصات المختلفة ومتابعة حالتها وميزانياتها
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="all">جميع المنصات</option>
                <option value="Google Search">Google Search</option>
                <option value="Meta Ads">Meta Ads (إنستقرام/فيسبوك)</option>
                <option value="TikTok Ads">TikTok Ads</option>
                <option value="Snapchat">Snapchat</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشطة (Active)</option>
                <option value="draft">قيد التجهيز (Draft)</option>
                <option value="needs_optim">تحتاج تحسين (Needs Optim)</option>
                <option value="paused">متوقفة (Paused)</option>
              </select>
            </div>
          </div>

          {/* Campaign Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCampaigns.map((camp) => {
              const statusConfig = {
                active: { text: 'نشطة', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
                draft: { text: 'مسودة', color: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
                needs_optim: { text: 'تحتاج تحسين', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
                paused: { text: 'متوقفة', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
              }[camp.status] || { text: camp.status, color: 'bg-slate-500/15 text-slate-300 border-slate-500/30' };

              return (
                <div
                  key={camp.id}
                  className="rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80 p-5 space-y-3.5 transition-all group relative flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                        {camp.platform}
                      </span>
                      <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${statusConfig.color}`}>
                        {statusConfig.text}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors leading-snug">
                      {camp.name}
                    </h4>
                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-teal-400" />
                      <span>{camp.objective}</span>
                    </div>
                  </div>

                  {/* Cities & Budget */}
                  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-[11px] text-slate-500">المدن:</span>
                      <span className="text-[11px] font-medium text-slate-300 truncate max-w-[180px]">
                        {camp.targetCities.join('، ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">الميزانية:</span>
                      <span className="font-mono font-bold text-white text-xs" dir="ltr">
                        {formatSAR(camp.budget, true)}{' '}
                        <span className="text-[10px] text-slate-500">({camp.dailyBudget} يومي)</span>
                      </span>
                    </div>

                    {/* AI Tip box */}
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                      <span>{camp.aiTip}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <div className="flex items-center gap-1">
                      {camp.status !== 'active' && (
                        <button
                          onClick={() => handleToggleStatus(camp.id, 'active')}
                          className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-medium transition-colors"
                        >
                          تنشيط
                        </button>
                      )}
                      {camp.status === 'active' && (
                        <button
                          onClick={() => handleToggleStatus(camp.id, 'paused')}
                          className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-medium transition-colors"
                        >
                          إيقاف مؤقت
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteCampaign(camp.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="حذف الحملة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: AI Agent Settings (Google Gemini / OpenAI) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full bg-[#0d1527] border border-slate-700/80 rounded-3xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">إعدادات ربط إيجنت الذكاء الاصطناعي (AI Agent)</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                إغلاق ✕
              </button>
            </div>

            <form onSubmit={handleSaveAgentConfig} className="space-y-4 text-xs">
              {configSaveStatus && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{configSaveStatus}</span>
                </div>
              )}

              {/* Provider selection */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">مزود الذكاء الاصطناعي (AI Provider)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTempProvider('gemini');
                      setTempModel('gemini-flash-latest');
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all font-bold ${
                      tempProvider === 'gemini'
                        ? 'bg-teal-500/15 text-teal-300 border-teal-500/40 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div>Google Gemini</div>
                    <div className="text-[10px] text-slate-400 font-normal">سريع ومجاني</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTempProvider('openai');
                      setTempModel('gpt-4o-mini');
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all font-bold ${
                      tempProvider === 'openai'
                        ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div>OpenAI (ChatGPT)</div>
                    <div className="text-[10px] text-slate-400 font-normal">GPT-4o Mini / 4o</div>
                  </button>
                </div>
              </div>

              {/* Model selection */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">اسم الموديل (Model)</label>
                <select
                  value={tempModel}
                  onChange={(e) => setTempModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-500"
                >
                  {tempProvider === 'gemini' ? (
                    <>
                      <option value="gemini-flash-latest">gemini-flash-latest (موصى به وسريع جداً)</option>
                      <option value="gemini-2.5-flash">gemini-2.5-flash (إصدار 2.5 فلاش)</option>
                      <option value="gemini-pro-latest">gemini-pro-latest (النسخة المتقدمة)</option>
                    </>
                  ) : (
                    <>
                      <option value="gpt-4o-mini">gpt-4o-mini (سريع واقتصادي)</option>
                      <option value="gpt-4o">gpt-4o (القدرة الكاملة)</option>
                      <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                    </>
                  )}
                </select>
              </div>

              {/* API Key input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium">مفتاح الـ API Key</label>
                  {tempProvider === 'gemini' && (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-teal-400 hover:underline flex items-center gap-1"
                    >
                      <span>احصل على مفتاح Gemini مجاناً</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showApiKeyInput ? 'text' : 'password'}
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder={tempProvider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                    className="w-full pr-3.5 pl-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  >
                    {showApiKeyInput ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  يتم حفظ المفتاح مشفراً ومحلياً على متصفحك فقط، ولا يُرسل لأي سيرفر خارجي.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-md shadow-teal-500/20"
                >
                  حفظ وتفعيل الإيجنت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Campaign */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-lg w-full bg-[#0d1527] border border-slate-700/80 rounded-3xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">إضافة حملة جديدة لمساحتك الخاصة</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                إغلاق ✕
              </button>
            </div>

            <form onSubmit={handleAddCampaign} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">اسم الحملة</label>
                <input
                  type="text"
                  required
                  value={newCamp.name}
                  onChange={(e) => setNewCamp({ ...newCamp, name: e.target.value })}
                  placeholder="مثال: حملة عروض نهاية الشهر لفحمات هيونداي"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">المنصة الإعلانية</label>
                  <select
                    value={newCamp.platform}
                    onChange={(e) => setNewCamp({ ...newCamp, platform: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Google Search">Google Search</option>
                    <option value="Meta Ads">Meta Ads (إنستقرام/فيسبوك)</option>
                    <option value="TikTok Ads">TikTok Ads</option>
                    <option value="Snapchat">Snapchat</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">الحالة المبدئية</label>
                  <select
                    value={newCamp.status}
                    onChange={(e) => setNewCamp({ ...newCamp, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="draft">مسودة (Draft)</option>
                    <option value="active">نشطة (Active)</option>
                    <option value="needs_optim">تحتاج تحسين (Optimization)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">الميزانية الإجمالية (ر.س)</label>
                  <input
                    type="number"
                    value={newCamp.budget}
                    onChange={(e) => setNewCamp({ ...newCamp, budget: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">الميزانية اليومية (ر.س)</label>
                  <input
                    type="number"
                    value={newCamp.dailyBudget}
                    onChange={(e) => setNewCamp({ ...newCamp, dailyBudget: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">المدن المستهدفة</label>
                <input
                  type="text"
                  value={newCamp.targetCities}
                  onChange={(e) => setNewCamp({ ...newCamp, targetCities: e.target.value })}
                  placeholder="الرياض، جدة، بريدة..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">ملاحظات واستراتيجية الحملة</label>
                <textarea
                  value={newCamp.notes}
                  onChange={(e) => setNewCamp({ ...newCamp, notes: e.target.value })}
                  placeholder="أي تفاصيل خاصة بالاستهداف أو الكوبونات..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-md shadow-teal-500/20"
                >
                  حفظ الحملة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Agent Task */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-lg w-full bg-[#0d1527] border border-slate-700/80 rounded-3xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">إضافة مهمة جديدة لبورد الإيجنت</h3>
              </div>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                إغلاق ✕
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">عنوان المهمة</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="مثال: إطلاق حملة سناب شات لقطع غيار كيا في الرياض"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">المنصة الإعلانية</label>
                  <select
                    value={newTask.platform}
                    onChange={(e) => setNewTask({ ...newTask, platform: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Google Search">Google Search</option>
                    <option value="Meta Ads">Meta Ads (إنستقرام)</option>
                    <option value="TikTok Ads">TikTok Ads</option>
                    <option value="Snapchat">Snapchat</option>
                    <option value="متجر سلة">متجر سلة (Online)</option>
                    <option value="فروع بريدة">فروع بريدة (Local)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">الأولوية</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="عالية">عالية (High)</option>
                    <option value="متوسطة">متوسطة (Medium)</option>
                    <option value="منخفضة">منخفضة (Low)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">الحالة المبدئية</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="todo">قيد الانتظار (To Do)</option>
                    <option value="in_progress">قيد التنفيذ (In Progress)</option>
                    <option value="completed">مكتملة (Completed)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">تاريخ الإنجاز المستهدف</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">تفاصيل المهمة والمستهدفات</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="اكتب تفاصيل ما هو مطلوب تحقيقه في هذه المهمة..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">ملاحظات وتوجيهات للإيجنت</label>
                <textarea
                  value={newTask.agentNotes}
                  onChange={(e) => setNewTask({ ...newTask, agentNotes: e.target.value })}
                  placeholder="أي توجيه خاص للإيجنت عند تنفيذ هذه المهمة (مثال: ركز على فحمات سوناتا وكادينزا)..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20"
                >
                  إضافة المهمة للبورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Memory Fact */}
      {showAddMemoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-lg w-full bg-[#0d1527] border border-slate-700/80 rounded-3xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">إضافة قاعدة جديدة لذاكرة الإيجنت الدائمة</h3>
              </div>
              <button
                onClick={() => setShowAddMemoryModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                إغلاق ✕
              </button>
            </div>

            <form onSubmit={handleAddMemory} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">تصنيف المعلومة / القاعدة</label>
                <select
                  value={newMemory.category}
                  onChange={(e) => setNewMemory({ ...newMemory, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="توجيهات واستراتيجيات">توجيهات واستراتيجيات</option>
                  <option value="بيانات الشركة وأرقامها">بيانات الشركة وأرقامها</option>
                  <option value="ميزانيات واستهداف">ميزانيات واستهداف</option>
                  <option value="قواعد وقرارات">قواعد وقرارات</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">عنوان المعلومة</label>
                <input
                  type="text"
                  value={newMemory.title}
                  onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                  placeholder="مثال: حصر عروض فحمات الفرامل لجدة"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">نص القاعدة التي يجب أن يتذكرها الإيجنت دائماً</label>
                <textarea
                  required
                  rows={4}
                  value={newMemory.content}
                  onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
                  placeholder="اكتب هنا القاعدة بالتفصيل (مثال: يجب تخصيص 60% من الميزانية لجدة والرياض دائماً، وعدم زيادة الميزانية اليومية عن 300 ريال في بداية التجربة)..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemoryModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/20"
                >
                  حفظ بالذاكرة الدائمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Notification for Self-Learned Facts */}
      {learnedToast && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-900/95 via-indigo-900/95 to-slate-900/95 border border-purple-500/50 rounded-2xl shadow-2xl text-white text-xs md:text-sm animate-bounce">
          <div className="w-8 h-8 rounded-xl bg-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
            <BrainCircuit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-purple-200">🧠 قام الإيجنت بتعلم وحفظ قاعدة جديدة!</div>
            <div className="text-[11px] text-purple-300/80">
              تم تثبيت التوجيه تلقائياً في ذاكرته الدائمة ولن ينساها عبر الجلسات.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
