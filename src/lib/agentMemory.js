// agentMemory.js - Persistent Memory & Task Board Engine for Dora Cars AI Agent

export const MEMORY_STORAGE_KEY = 'dora_agent_memory_bank';
export const TASKS_STORAGE_KEY = 'dora_agent_tasks_board';
export const CHAT_STORAGE_KEY = 'dora_agent_chat_history';

// Curated default long-term memories initialized for Dora Cars
export const DEFAULT_MEMORIES = [
  {
    id: 'mem-01',
    category: 'قواعد واستراتيجيات',
    title: 'توجيه ميزانية المتجر لجدة والرياض',
    content: 'تركيز 60% من ميزانية مبيعات متجر سلة على مدينتي جدة والرياض لكونهما تحققان أكثر من 54% من إجمالي مبيعات المتجر أونلاين (36 عملية شراء مؤكدة في GA4).',
    source: 'توجيه استراتيجي معتمد',
    timestamp: '2026-09-06',
    autoLearned: false,
  },
  {
    id: 'mem-02',
    category: 'قرارات مالية',
    title: 'خطوة تزويد الميزانية (500 ريال)',
    content: 'محاكي توزيع ميزانية الحملات يعتمد خطوة تزويد ثابتة بمقدار 500 ريال لكل نقطة، والميزانية المقترحة تتراوح عادة بين 20,000 إلى 25,000 ر.س شهرياً.',
    source: 'قرار مالي من المستخدم',
    timestamp: '2026-09-06',
    autoLearned: false,
  },
  {
    id: 'mem-03',
    category: 'قواعد الفروع',
    title: 'إعلانات الفروع الميدانية في بريدة',
    content: 'الفروع الميدانية الثلاثة (الرئيسي، كيا، الرواف) حققت 989,522 ر.س وتجاوزت التارجت بنسبة 123.7%. دعمها يتم عبر إعلانات خرائط Google Maps وLocal Search في بريدة والقصيم.',
    source: 'بيانات فروع أغسطس 2026',
    timestamp: '2026-09-06',
    autoLearned: false,
  },
  {
    id: 'mem-04',
    category: 'قواعد التسويق',
    title: 'استغلال الكلمات المتصدرة في Search Console',
    content: 'موقع درة السيارة يتصدر المرتبة الأولى (Rank 1.0) بكلمات "درة السيارة لقطع الغيار" بنسبة نقر CTR 49.8%. يجب دائماً توجيه إعلانات جوجل للفرامل وفلاتر كيا وهيونداي الأكثر طلباً.',
    source: 'بيانات GSC الحية',
    timestamp: '2026-09-06',
    autoLearned: false,
  },
  {
    id: 'mem-05',
    category: 'أسلوب التواصل',
    title: 'اللهجة والأسلوب المفضل في الردود',
    content: 'الردود تكون احترافية، ذكية، ومباشرة باللهجة البيضاء الراقية، مع صياغة نصوص إعلانية جاهزة للتطبيق الفوري بدون حشو.',
    source: 'تفضيلات مسؤول الحملات',
    timestamp: '2026-09-06',
    autoLearned: false,
  },
  {
    id: 'mem-06',
    category: 'حقائق محاسبية',
    title: 'هامش الربح الصافي المعتمد (28.03%)',
    content: 'هامش الربح الصافي لشركة درة السيارة هو 28.03% من صافي المبيعات الفعلي (بعد خصم المردودات)، ويجب بناء أي حسابات للعائد الربحي على هذا الأساس بدقة.',
    source: 'قاعدة محاسبية معتمدة',
    timestamp: '2026-09-06',
    autoLearned: false,
  },
];

// Curated default tasks for the Agent Task Board
export const DEFAULT_TASKS = [
  {
    id: 'task-101',
    title: 'تجهيز حملة عروض اليوم الوطني (بواجي + فلاتر هواء)',
    platform: 'Meta Ads',
    status: 'in_progress', // 'todo' | 'in_progress' | 'completed'
    priority: 'عالية', // 'عالية' | 'متوسطة' | 'منخفضة'
    dueDate: '2026-09-20',
    description: 'كتابة سيناريو فيديو ريلز 15 ثانية واستهداف عملاء جدة والرياض، مع بكج صيانة وتوصيل مجاني.',
    agentNotes: 'الإيجنت يعمل على صياغة 3 نسخ إعلانية لفك وتركيب فحمات وبواجي هيونداي.',
  },
  {
    id: 'task-102',
    title: 'إعادة استهداف زوار السلات المتروكة بمتجر سلة',
    platform: 'Snapchat',
    status: 'todo',
    priority: 'عالية',
    dueDate: '2026-09-12',
    description: 'إطلاق إعلان تذكيري لـ 18.5 ألف جلسة مسجلة في GA4 مع كود خصم 5% لاستعادة 15 إلى 30 طلب معلق.',
    agentNotes: 'قيد الانتظار لموافقة المسؤول على نص الكود ورسائل SMS التذكيرية.',
  },
  {
    id: 'task-103',
    title: 'إطلاق إعلانات Google Maps محلية لزيارات فروع بريدة',
    platform: 'Google Search',
    status: 'todo',
    priority: 'متوسطة',
    dueDate: '2026-09-15',
    description: 'تفعيل إعلانات خرائط جوجل للفرع الرئيسي وفرع كيا وفرع الرواف لجذب عملاء الصيانة العاجلة.',
    agentNotes: 'مطلوب مراجعة النطاق الجغرافي المحيط (نصف قطر 15 كم حول بريدة).',
  },
  {
    id: 'task-104',
    title: 'مراجعة الكلمات المتصدرة في Search Console (Rank 1.0)',
    platform: 'Google Search',
    status: 'completed',
    priority: 'منخفضة',
    dueDate: '2026-09-05',
    description: 'فحص كلمات "درة السيارة لقطع الغيار" وتوجيه الروابط لصفحة الفلاتر والفرامل المباشرة.',
    agentNotes: 'تم إنجاز التحليل وربطها بنجاح وتحقيق CTR بلغ 49.8%.',
  },
  {
    id: 'task-105',
    title: 'اختبار حملة تيك توك الفيروسية للسيارات (Spark Ads)',
    platform: 'TikTok Ads',
    status: 'todo',
    priority: 'متوسطة',
    dueDate: '2026-09-25',
    description: 'فيديوهات تفاعلية مع صناع محتوى سيارات بالقصيم لرفع الوعي ونقرات المتجر منخفضة التكلفة.',
    agentNotes: 'تنتظر تجهيز الفيديوهات وتحديد الميزانية اليومية (150 ر.س).',
  },
];

// Load memories from localStorage or return defaults
export function loadAgentMemories() {
  try {
    const saved = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error loading agent memories from localStorage', e);
  }
  return DEFAULT_MEMORIES;
}

// Save memories to localStorage
export function saveAgentMemories(memories) {
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories));
  } catch (e) {
    console.error('Error saving agent memories', e);
  }
}

// Load tasks from localStorage or return defaults
export function loadAgentTasks() {
  try {
    const saved = localStorage.getItem(TASKS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error loading agent tasks from localStorage', e);
  }
  return DEFAULT_TASKS;
}

// Save tasks to localStorage
export function saveAgentTasks(tasks) {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving agent tasks', e);
  }
}

// Load chat history from localStorage
export function loadChatHistory() {
  try {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error loading chat history from localStorage', e);
  }
  return [
    {
      sender: 'ai',
      text: 'مرحباً بك يا باشا في مساحتك الخاصة والسرية! 🚀 أنا إيجنت الذكاء الاصطناعي الخاص بحملات درة السيارة، ومزود الآن بذاكرة دائمة متصلة بكل ما نتفق عليه ومطلع على بورد المهام الموكلة لي. كيف نبدأ اليوم؟',
      timestamp: 'الآن',
    },
  ];
}

// Save chat history to localStorage
export function saveChatHistory(messages) {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-30)));
  } catch (e) {}
}

// Format all memories into a clean prompt context block for the AI Agent
export function formatMemoriesForPrompt(memories = []) {
  if (!memories.length) return '';

  const lines = memories.map((m, i) => 
    `${i + 1}. [${m.category || 'معلومة'}] ${m.title ? `${m.title}: ` : ''}${m.content} (مصدر: ${m.source || 'المحادثة'})`
  );

  return `
=== ذاكرة الإيجنت الدائمة (Agent Long-Term Memory - ما تعلمته وتتذكره دائماً من محادثاتك مع مسؤول الحملات): ===
${lines.join('\n')}
(تنبيه للإيجنت: يجب أن تراعي هذه القواعد والذاكرة في كل إجاباتك، ولا تناقض أي توجيه أو قرار مسجل هنا، ويمكنك الإشارة لما تتذكره لبيان فهمك المستمر).
`;
}

// Format all tasks into a clean prompt context block for the AI Agent
export function formatTasksForPrompt(tasks = []) {
  if (!tasks.length) return '';

  const todo = tasks.filter(t => t.status === 'todo');
  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const completed = tasks.filter(t => t.status === 'completed');

  const formatList = (list) => 
    list.map(t => `- [أولوية ${t.priority}] ${t.title} (${t.platform}) | التفاصيل: ${t.description} ${t.agentNotes ? `[ملاحظاتك: ${t.agentNotes}]` : ''}`).join('\n');

  return `
=== لوحة المهام الموكلة إليك (Agent Task Board - Kanban): ===
⚡ المهام قيد التنفيذ حالياً (In Progress):
${inProgress.length ? formatList(inProgress) : 'لا توجد مهام قيد التنفيذ حالياً.'}

📋 المهام قيد الانتظار (To Do):
${todo.length ? formatList(todo) : 'لا توجد مهام قيد الانتظار.'}

✅ المهام المنجزة (Completed):
${completed.length ? formatList(completed) : 'لا توجد مهام مكتملة بعد.'}

(تنبيه للإيجنت: أنت على دراية تامة بهذه اللوحة ويمكنك اقتراح تحديث حالتها، تنظيم الأولويات، أو البدء الفوري في تنفيذ أي مهمة يطلبها منك المسؤول).
`;
}

// Heuristic to detect if user is stating an instruction, preference, or rule that should be remembered
export function detectLearnableFact(userQuery) {
  const q = userQuery.trim();
  const lower = q.toLowerCase();

  const triggers = [
    'تذكر', 'افتكر', 'لا تنسى', 'احفظ عندك', 'سجل عندك', 
    'القاعدة', 'نصيحة', 'دايما', 'دائما', 'الميزانية المعتمدة',
    'أنا بفضل', 'انا بفضل', 'نركز على', 'الفرع ده', 'المدير مش لازم',
    'طريقة العمل', 'الشغل هنا', 'قاعدتنا', 'اعتمد ان'
  ];

  const hasTrigger = triggers.some(t => lower.includes(t));
  if (hasTrigger && q.length > 10) {
    return {
      category: 'توجيهات المستخدم',
      title: q.slice(0, 40) + '...',
      content: q,
      source: 'تعلم آلي من المحادثة',
      timestamp: new Date().toISOString().split('T')[0],
      autoLearned: true,
    };
  }
  return null;
}
