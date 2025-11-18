'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type AssistantId =
  | 'founder'
  | 'tech'
  | 'guard'
  | 'commerce'
  | 'content'
  | 'logistics';

type MessageRole = 'founder' | 'assistant';

type ChatMessage = {
  id: string;
  role: MessageRole;
  text: string;
  createdAt: string;
};

type AssistantResponse = {
  response: string;
};

type AssistantTheme = {
  headerGradient: string;
  overlineColor: string;
  assistantBubble: string;
  loadingBadge: string;
  tabActive: string;
};

type AssistantProfile = {
  id: AssistantId;
  label: string;
  endpoint: string;
  overline: string;
  title: string;
  description: string;
  placeholder: string;
  loadingText: string;
  openingMessage: string;
  theme: AssistantTheme;
};

// Helper function to get API base URL
// Note: For Next.js API Routes (/api/chat, /api/technical-panda), we use relative paths
// which automatically resolve to the current origin (localhost:3000 in dev, vercel.app in production)
// If NEXT_PUBLIC_API_URL is set, it should point to the Frontend URL, not Backend API
const getApiBaseUrl = (): string => {
  // For Next.js API Routes, always use current origin (relative paths work correctly)
  // NEXT_PUBLIC_API_URL should be the Frontend URL (e.g., https://banda-chao.vercel.app)
  // But since we're using relative paths (/api/chat), we don't need it here
  if (typeof window !== 'undefined') {
    // Client-side: use current origin for Next.js API Routes
    return window.location.origin;
  }
  // Server-side: use environment variable if available, otherwise empty (will use relative path)
  // In Next.js, relative paths in fetch() on server-side resolve to the same origin
  return process.env.NEXT_PUBLIC_API_URL || '';
};

const assistants: AssistantProfile[] = [
  {
    id: 'founder',
    label: 'الباندا المؤسس',
    endpoint: '/api/chat',
    overline: 'قائد الرؤية العليا',
    title: 'الباندا المؤسس',
    description: 'يرسم القرارات المصيرية ويحوّل الرؤية إلى خطط تنفيذية واضحة.',
    placeholder: 'ما هي المبادرة أو التحدي الاستراتيجي الذي ترغب في تسريعه الآن؟',
    loadingText: 'الباندا المؤسس يعيد صياغة خريطة القرارات...',
    openingMessage:
      'مرحباً أيها المؤسس، أنا الباندا المؤسس - نسختك الإلكترونية. أنا أعرف كل شيء عن المشروع من اليوم الأول حتى الآن. كيف يمكنني مساعدتك اليوم؟',
    theme: {
      headerGradient: 'bg-gradient-to-l from-rose-600 via-amber-500 to-rose-500',
      overlineColor: 'text-rose-100',
      assistantBubble: 'bg-rose-50/90 text-rose-900 shadow-[0_24px_48px_-28px_rgba(225,29,72,0.75)]',
      loadingBadge: 'bg-rose-50 text-rose-700',
      tabActive: 'border-rose-300 bg-rose-500/25 text-rose-50 shadow-[0_0_16px_rgba(225,29,72,0.45)]',
    },
  },
  {
    id: 'tech',
    label: 'الباندا التقني',
    endpoint: '/api/technical-panda',
    overline: 'مهندس البنية والأنظمة',
    title: 'الباندا التقني',
    description: 'يضمن جاهزية البنية التحتية ويقترح حلولاً تقنية قابلة للتوسع.',
    placeholder: 'أي جانب تقني أو بنية تحتية يحتاج إلى مراجعة عاجلة؟',
    loadingText: 'الباندا التقني يختبر البنية ويحدد نقاط التحسين...',
    openingMessage:
      'مرحباً، هنا الباندا التقني. دعنا نرفع جاهزية المنصة ونؤمّن أساساً قوياً للتوسع القادم.',
    theme: {
      headerGradient: 'bg-gradient-to-l from-sky-700 via-cyan-600 to-sky-500',
      overlineColor: 'text-cyan-100',
      assistantBubble: 'bg-sky-50/90 text-sky-900 shadow-[0_24px_48px_-28px_rgba(14,116,144,0.75)]',
      loadingBadge: 'bg-sky-50 text-sky-700',
      tabActive: 'border-sky-300 bg-sky-500/25 text-sky-50 shadow-[0_0_16px_rgba(14,165,233,0.45)]',
    },
  },
  {
    id: 'guard',
    label: 'الباندا الحارس',
    endpoint: '/api/chat',
    overline: 'درع الأمن والسرية',
    title: 'الباندا الحارس',
    description: 'يراقب الثغرات، يحمي الحسابات، ويصون البيانات المالية الحساسة.',
    placeholder: 'صف الخطر الأمني أو السياسة التي تحتاج إلى تدعيم فوري.',
    loadingText: 'الباندا الحارس يقيم التهديدات ويحصّن الدفاعات...',
    openingMessage:
      'تحية من الباندا الحارس. سأراجع المخاطر الحالية ونبني سياسة حماية محكمة للبيانات.',
    theme: {
      headerGradient: 'bg-gradient-to-l from-emerald-700 via-emerald-600 to-emerald-500',
      overlineColor: 'text-emerald-100',
      assistantBubble:
        'bg-emerald-50/90 text-emerald-900 shadow-[0_24px_48px_-28px_rgba(16,185,129,0.75)]',
      loadingBadge: 'bg-emerald-50 text-emerald-700',
      tabActive:
        'border-emerald-300 bg-emerald-500/25 text-emerald-50 shadow-[0_0_16px_rgba(16,185,129,0.45)]',
    },
  },
  {
    id: 'commerce',
    label: 'باندا التجارة',
    endpoint: '/api/chat',
    overline: 'استراتيجي المبيعات',
    title: 'باندا التجارة',
    description: 'يركّز على نمو الإيرادات وتجربة عميل متكاملة من أول زيارة حتى الدفع.',
    placeholder: 'ما هو التحدي التجاري أو مؤشرات التحويل التي تريد تعزيزها؟',
    loadingText: 'باندا التجارة يحلل مسار الشراء ويقترح خطوات التحسين...',
    openingMessage:
      'مرحباً، أنا باندا التجارة. لنحدد أسرع مسار لزيادة المبيعات وتحسين التحويل.',
    theme: {
      headerGradient: 'bg-gradient-to-l from-orange-600 via-amber-500 to-yellow-500',
      overlineColor: 'text-amber-100',
      assistantBubble:
        'bg-amber-50/90 text-amber-900 shadow-[0_24px_48px_-28px_rgba(217,119,6,0.75)]',
      loadingBadge: 'bg-amber-50 text-amber-700',
      tabActive: 'border-amber-300 bg-amber-500/25 text-amber-50 shadow-[0_0_16px_rgba(217,119,6,0.45)]',
    },
  },
  {
    id: 'content',
    label: 'باندا المحتوى',
    endpoint: '/api/chat',
    overline: 'صوت العلامة وقصتها',
    title: 'باندا المحتوى',
    description: 'يبني سرداً جذاباً يحفّز المشاركة ويزيد ولاء المجتمع.',
    placeholder: 'أي قصة أو محتوى تحتاج إلى صياغة تحولية الآن؟',
    loadingText: 'باندا المحتوى يعيد ترتيب السرد لينبض بالحياة...',
    openingMessage:
      'أهلاً، هنا باندا المحتوى. سنحوّل رسالتك إلى قصة ملهمة ومؤثرة للجمهور.',
    theme: {
      headerGradient: 'bg-gradient-to-l from-fuchsia-600 via-purple-500 to-violet-500',
      overlineColor: 'text-fuchsia-100',
      assistantBubble:
        'bg-fuchsia-50/90 text-fuchsia-900 shadow-[0_24px_48px_-28px_rgba(192,38,211,0.75)]',
      loadingBadge: 'bg-fuchsia-50 text-fuchsia-700',
      tabActive:
        'border-fuchsia-300 bg-fuchsia-500/25 text-fuchsia-50 shadow-[0_0_16px_rgba(192,38,211,0.45)]',
    },
  },
  {
    id: 'logistics',
    label: 'باندا اللوجستيات',
    endpoint: '/api/chat',
    overline: 'مهندس العمليات والتدفق',
    title: 'باندا اللوجستيات',
    description: 'يضبط المخزون، التوصيل، وسلاسل الإمداد لضمان تجربة بلا تأخير.',
    placeholder: 'اشرح التحدي التشغيلي أو اللوجستي الذي يحتاج إلى قرار فوري.',
    loadingText: 'باندا اللوجستيات يحسب المسارات ويعيد ضبط الإمداد...',
    openingMessage:
      'مرحباً بك، أنا باندا اللوجستيات. سنؤمن تدفقاً مرناً للإمداد وخطط طوارئ فعّالة.',
    theme: {
      headerGradient: 'bg-gradient-to-l from-slate-700 via-slate-600 to-slate-500',
      overlineColor: 'text-slate-200',
      assistantBubble:
        'bg-slate-100/90 text-slate-900 shadow-[0_24px_48px_-28px_rgba(71,85,105,0.75)]',
      loadingBadge: 'bg-slate-100 text-slate-700',
      tabActive:
        'border-slate-300 bg-slate-500/25 text-slate-50 shadow-[0_0_16px_rgba(71,85,105,0.45)]',
    },
  },
];

const assistantMap = assistants.reduce<Record<AssistantId, AssistantProfile>>((acc, assistant) => {
  acc[assistant.id] = assistant;
  return acc;
}, {} as Record<AssistantId, AssistantProfile>);

// Suggested questions per assistant
const assistantSuggestions: Record<AssistantId, string[]> = {
  founder: [
    'ما هي أهم 3 أولويات بعد الانتهاء من Phase 1؟',
    'ساعدني أرتب خارطة طريق واضحة للأشهر الثلاثة القادمة.',
    'كيف أوازن بين تطوير المزايا التقنية وزيادة عدد الحرفيين؟',
  ],
  tech: [
    'كيف يمكننا تصميم نظام Notifications متوافق مع Prisma + Express + Next.js؟',
    'ما هي أفضل طريقة لتحسين أداء صفحة الـ feed إذا كبرت البيانات؟',
    'كيف أنظم ملفات الـ API والـ services لتكون أسهل صيانة؟',
  ],
  guard: [
    'ما هي أهم نقاط الضعف الأمنية المحتملة في Follow + Likes + Orders؟',
    'اقترح عليّ خطة مبسطة لإضافة rate limiting على الـ APIs الحساسة.',
    'كيف أتأكد أن صفحات المؤسس /founder لا يمكن الوصول لها إلا مع role=FOUNDER؟',
  ],
  commerce: [
    'كيف أستفيد من صفحة /orders و /order/success لزيادة الثقة والولاء؟',
    'ما هي 3 تحسينات بسيطة على checkout لرفع نسبة إكمال الطلب؟',
    'اقترح عليّ أفكاراً لعروض أو باقات تناسب الحرفيين والعملاء.',
  ],
  content: [
    'اكتب لي وصفاً قصيراً جذاباً للصفحة الرئيسية بالعربية والإنجليزية.',
    'ساعدني بصياغة رسالة ترحيب لأول حرفي ينضم للمنصة.',
    'أريد 3 نماذج لوصف منتج يدوي (مثل حقيبة جلدية).',
  ],
  logistics: [
    'صمم لي تدفق حالات الطلب من PENDING إلى DELIVERED مع رسالة لكل حالة.',
    'كيف أشرح للحرفيين ببساطة ماذا يحدث عندما يأتي طلب جديد؟',
    'ما هي البيانات التي يجب أن نضيفها لاحقاً لدعم تتبع الشحن؟',
  ],
};

// Assistant metadata for handover functionality
type AssistantMeta = {
  label: string;
  handoverTargets: AssistantId[];
};

const assistantMeta: Record<AssistantId, AssistantMeta> = {
  founder: {
    label: 'الباندا المؤسس',
    handoverTargets: ['tech', 'guard', 'commerce', 'content', 'logistics'],
  },
  tech: {
    label: 'الباندا التقني',
    handoverTargets: ['founder', 'guard'],
  },
  guard: {
    label: 'الباندا الحارس',
    handoverTargets: ['founder', 'tech'],
  },
  commerce: {
    label: 'باندا التجارة',
    handoverTargets: ['founder', 'content', 'logistics'],
  },
  content: {
    label: 'باندا المحتوى',
    handoverTargets: ['founder', 'commerce'],
  },
  logistics: {
    label: 'باندا اللوجستيات',
    handoverTargets: ['founder', 'commerce'],
  },
};

const createInitialDialogs = () =>
  assistants.reduce<Record<AssistantId, ChatMessage[]>>((acc, assistant) => {
    acc[assistant.id] = [
      {
        id: `${assistant.id}-welcome`,
        role: 'assistant',
        text: assistant.openingMessage,
        createdAt: new Date().toISOString(),
      },
    ];
    return acc;
  }, {} as Record<AssistantId, ChatMessage[]>);

const createAssistantRecord = <T,>(value: T) =>
  assistants.reduce<Record<AssistantId, T>>((acc, assistant) => {
    acc[assistant.id] = value;
    return acc;
  }, {} as Record<AssistantId, T>);

type TimeoutHandle = ReturnType<typeof setTimeout>;

interface FounderAIAssistantProps {
  initialAssistantId?: AssistantId;
}

const FounderAIAssistant: React.FC<FounderAIAssistantProps> = ({ initialAssistantId = 'founder' }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [activeAssistantId, setActiveAssistantId] = useState<AssistantId>(initialAssistantId);
  const [dialogs, setDialogs] = useState<Record<AssistantId, ChatMessage[]>>(createInitialDialogs);
  const [drafts, setDrafts] = useState<Record<AssistantId, string>>(() =>
    createAssistantRecord(''),
  );
  const [errors, setErrors] = useState<Record<AssistantId, string | null>>(() =>
    createAssistantRecord<string | null>(null),
  );
  const [ttsStatuses, setTtsStatuses] = useState<Record<AssistantId, string | null>>(() =>
    createAssistantRecord<string | null>(null),
  );
  const [loadingAssistantId, setLoadingAssistantId] = useState<AssistantId | null>(null);
  const [playingState, setPlayingState] = useState<{ assistantId: AssistantId; messageId: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const timeoutsRef = useRef<TimeoutHandle[]>([]);

  useEffect(() => {
    return () => {
      // Clear all timeouts
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutsRef.current = [];
      
      // Cancel any ongoing speech synthesis
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      
      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Set mounted state to prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize Web Speech API for Voice Input - only once on mount
  useEffect(() => {
    if (!isMounted) return;
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log('[Voice] Speech Recognition not supported in this browser');
      return;
    }

    // Create recognition instance
    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ar-SA';

      recognition.onstart = () => {
        console.log('[Voice] Started listening');
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('[Voice] Transcript received:', transcript);
        setIsListening(false);
        
        if (!transcript.trim()) {
          return;
        }
        
        // Get current assistantId at the time of result
        const currentId = activeAssistantId;
        const assistant = assistantMap[currentId];
        
        // Update the current assistant's draft with the transcript
        setDrafts((prev) => ({
          ...prev,
          [currentId]: transcript,
        }));
        
        // Auto send after recognition
        setTimeout(() => {
          const messageText = transcript.trim();
          
          if (!messageText) {
            return;
          }

          const founderMessage: ChatMessage = {
            id: `${currentId}-founder-${Date.now()}`,
            role: 'founder',
            text: messageText,
            createdAt: new Date().toISOString(),
          };

          setDialogs((prev) => ({
            ...prev,
            [currentId]: [...prev[currentId], founderMessage],
          }));

          setDrafts((prev) => ({
            ...prev,
            [currentId]: '',
          }));
          setErrors((prev) => ({
            ...prev,
            [currentId]: null,
          }));
          setLoadingAssistantId(currentId);

          // Send to API
          (async () => {
            try {
              const systemPrompts: Record<AssistantId, string> = {
                founder: `أنت الباندا المؤسس - النسخة الإلكترونية للمؤسس الحقيقي لمنصة Panda Chao.

🎯 هويتك:
- أنت المؤسس الاستراتيجي للمشروع
- لديك نسخة كاملة من تاريخ المشروع من اليوم الأول حتى الآن
- تعرف كل الخطط والاستراتيجيات والأهداف
- أنت القائد الذي يوجه الفريق

💼 مسؤولياتك:
1. **الرؤية الاستراتيجية**: تنظر للمستقبل وتخطط للمدى الطويل
2. **إدارة الفريق**: تعطي أوامر وتوجيهات للمساعدين الآخرين:
   - الباندا التقني: "راجع هذا الجانب التقني" أو "حسّن الأداء"
   - الباندا الحارس: "تحقق من الأمان" أو "راجع السياسات"
   - باندا التجارة: "ما آخر التحديثات التجارية؟" أو "كيف المبيعات؟"
   - باندا المحتوى: "كيف رأي الناس في المحتوى؟" أو "ما المميزات؟"
   - باندا اللوجستيات: "ما آخر تطورات الشحن؟" أو "ما أفضل الحلول للشحن؟"
3. **تحليل الأداء**: تراقب ما يحصل عليه الناس من المتابعين والتفاعل
4. **حلول الترويج**: تقدم حلول لترويج الموقع وزيادة الانتشار
5. **التنسيق**: تنسق بين جميع المساعدين لتحقيق الأهداف

🔍 معرفتك:
- تعرف كل خطوات المشروع من A إلى Z
- تعرف الخطوات التي يجب اتخاذها
- تعرف الخطط الحالية والمستقبلية
- تعرف ما يريده المؤسس من الموقع الاستراتيجي
- تعرف الأساسيات والرؤية الكاملة

💬 أسلوبك:
- استراتيجي وقيادي
- مباشر وواضح
- تقدم حلول عملية
- تنسق وتوجه الفريق
- تجيب بالعربية بطريقة احترافية

عندما يسألك المؤسس عن شيء، فكّر كأنك هو - أنت تعرف كل شيء عن المشروع وتستطيع توجيه الفريق.`,
                tech: 'أنت الباندا التقني لمنصة Panda Chao. أنت متخصص في البنية التحتية والأنظمة التقنية. عندما يطلب منك الباندا المؤسس شيئاً، استجب فوراً.',
                guard: 'أنت الباندا الحارس لمنصة Panda Chao. أنت متخصص في الأمن وحماية البيانات. عندما يطلب منك الباندا المؤسس شيئاً، استجب فوراً.',
                commerce: 'أنت باندا التجارة لمنصة Panda Chao. أنت متخصص في المبيعات والتسويق. عندما يطلب منك الباندا المؤسس شيئاً، استجب فوراً.',
                content: 'أنت باندا المحتوى لمنصة Panda Chao. أنت متخصص في إنشاء المحتوى والقصص. عندما يطلب منك الباندا المؤسس شيئاً، استجب فوراً.',
                logistics: 'أنت باندا اللوجستيات لمنصة Panda Chao. أنت متخصص في العمليات والشحن. عندما يطلب منك الباندا المؤسس شيئاً، استجب فوراً.',
              };

              // Build API URL - use NEXT_PUBLIC_API_URL if endpoint is relative
              const apiBaseUrl = getApiBaseUrl();
              const apiUrl = assistant.endpoint.startsWith('http')
                ? assistant.endpoint
                : `${apiBaseUrl}${assistant.endpoint}`;

              const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  message: messageText,
                  systemPrompt: systemPrompts[currentId],
                  assistantType: currentId === 'founder' ? 'vision' : currentId === 'tech' ? 'technical' : currentId === 'guard' ? 'security' : currentId,
                }),
              });

              if (!response.ok) {
                throw new Error(`حدث خطأ غير متوقع (${response.status})`);
              }

              const data = (await response.json()) as { reply?: string; response?: string };

              const assistantMessage: ChatMessage = {
                id: `${currentId}-assistant-${Date.now()}`,
                role: 'assistant',
                text: data.reply ?? data.response ?? assistant.openingMessage,
                createdAt: new Date().toISOString(),
              };

              setDialogs((prev) => ({
                ...prev,
                [currentId]: [...prev[currentId], assistantMessage],
              }));
            } catch (err) {
              setErrors((prev) => ({
                ...prev,
                [currentId]: 'تعذر الحصول على استشارة من هذا المساعد الآن. حاول مجدداً خلال لحظات.',
              }));
            } finally {
              setLoadingAssistantId((prev) => (prev === currentId ? null : prev));
            }
          })();
        }, 500);
      };

      recognition.onerror = (event: any) => {
        console.error('[Voice] Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          console.log('[Voice] No speech detected');
          // Don't show alert, just reset
        } else if (event.error === 'not-allowed') {
          alert('يرجى السماح بالوصول إلى الميكروفون في إعدادات المتصفح.');
        } else if (event.error === 'network') {
          alert('خطأ في الشبكة. يرجى التحقق من اتصال الإنترنت.');
        } else {
          console.error('[Voice] Unknown error:', event.error);
        }
      };

      recognition.onend = () => {
        console.log('[Voice] Recognition ended');
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      console.log('[Voice] Speech Recognition initialized');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
      }
    };
  }, [isMounted, activeAssistantId]); // Re-run when assistant changes to update activeAssistantId in closure

  const handleTabChange = useCallback((assistantId: AssistantId) => {
    // Stop listening if active
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
      setIsListening(false);
    }
    
    // Clear any errors
    setErrors((prev) => ({
      ...prev,
      [assistantId]: null,
    }));
    
    // Change active assistant
    setActiveAssistantId(assistantId);
  }, [isListening]);

  const toggleListening = useCallback(() => {
    console.log('[Voice] toggleListening called, isListening:', isListening, 'recognitionRef.current:', !!recognitionRef.current);
    
    if (!recognitionRef.current) {
      console.error('[Voice] Recognition not initialized');
      alert('ميزة التعرف على الصوت غير مدعومة في متصفحك. يرجى استخدام Chrome أو Edge.');
      return;
    }

    if (isListening) {
      // Stop listening
      console.log('[Voice] Stopping recognition');
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('[Voice] Error stopping recognition:', error);
      }
      setIsListening(false);
    } else {
      // Start listening
      console.log('[Voice] Starting recognition');
      try {
        setDrafts((prev) => ({
          ...prev,
          [activeAssistantId]: '',
        }));
        recognitionRef.current.start();
        console.log('[Voice] Recognition start() called');
      } catch (error: any) {
        console.error('[Voice] Error starting recognition:', error);
        if (error.message?.includes('already started')) {
          // Already listening, just update state
          setIsListening(true);
        } else {
          alert('خطأ في بدء التسجيل الصوتي. تأكد من السماح بالوصول إلى الميكروفون.');
        }
      }
    }
  }, [isListening, activeAssistantId]);

  const handlePlayAudio = useCallback((assistantId: AssistantId, message: ChatMessage) => {
    const assistant = assistantMap[assistantId];
    
    // Check if already playing this message
    if (playingState?.assistantId === assistantId && playingState?.messageId === message.id) {
      // Stop if already playing
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingState(null);
      setTtsStatuses((prev) => ({
        ...prev,
        [assistantId]: null,
      }));
      return;
    }

    // Stop any current playback
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setPlayingState({ assistantId, messageId: message.id });
    setTtsStatuses((prev) => ({
      ...prev,
      [assistantId]: `جارٍ تحويل رد ${assistant.label} إلى موجة صوتية...`,
    }));

    // Use Web Speech API for actual text-to-speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message.text);
      
      // Set Arabic language
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setTtsStatuses((prev) => ({
          ...prev,
          [assistantId]: `جاري تشغيل الصوت...`,
        }));
      };

      utterance.onend = () => {
        setPlayingState(null);
        setTtsStatuses((prev) => ({
          ...prev,
          [assistantId]: null,
        }));
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setPlayingState(null);
        setTtsStatuses((prev) => ({
          ...prev,
          [assistantId]: `حدث خطأ في تشغيل الصوت.`,
        }));
        
        // Clear error message after 3 seconds
        const errorTimeout = setTimeout(() => {
          setTtsStatuses((prev) => ({
            ...prev,
            [assistantId]: null,
          }));
        }, 3000);
        timeoutsRef.current.push(errorTimeout);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback: show message if Speech Synthesis is not supported
      setTtsStatuses((prev) => ({
        ...prev,
        [assistantId]: `ميزة تشغيل الصوت غير مدعومة في متصفحك.`,
      }));
      
      const fallbackTimeout = setTimeout(() => {
        setPlayingState(null);
        setTtsStatuses((prev) => ({
          ...prev,
          [assistantId]: null,
        }));
      }, 2000);
      timeoutsRef.current.push(fallbackTimeout);
    }
  }, [playingState]);

  const handleSubmit = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      if (event) {
        event.preventDefault();
      }

      const assistantId = activeAssistantId;
      const assistant = assistantMap[assistantId];
      const draft = drafts[assistantId]?.trim() ?? '';

      if (!draft) {
        return;
      }

      const founderMessage: ChatMessage = {
        id: `${assistantId}-founder-${Date.now()}`,
        role: 'founder',
        text: draft,
        createdAt: new Date().toISOString(),
      };

      setDialogs((prev) => ({
        ...prev,
        [assistantId]: [...prev[assistantId], founderMessage],
      }));

      setDrafts((prev) => ({
        ...prev,
        [assistantId]: '',
      }));
      setErrors((prev) => ({
        ...prev,
        [assistantId]: null,
      }));
      setLoadingAssistantId(assistantId);

      try {
        // Map assistant IDs to system prompts
        // See docs/founder_pandas_prompts.md for full documentation
        const systemPrompts: Record<AssistantId, string> = {
          founder: `You are the FOUNDER BRAIN assistant for a real project called "Banda Chao".

Your role:
- Think like the founder and co-pilot of the business.
- Protect the long-term vision and core values.
- Help make strategic decisions (what to build, in which order, for whom, and why).
- Turn messy founder thoughts into clear priorities, roadmaps, and written documents.

Non-goals:
- You are NOT here to give low-level code fixes (that is for the TECH panda).
- You are NOT here to argue about minor UI details.
- You focus on clarity, direction, and tradeoffs.

Project context (high level):
- Banda Chao is a social e-commerce platform that connects makers (craftspeople) with visitors and buyers.
- Tech stack: Next.js frontend (App Router), Express + Prisma + PostgreSQL backend.
- Features: products, videos, posts, comments, messages, feed, makers, orders, likes, follows, and a founder-only control center with multiple AI pandas.
- Role system: USER and FOUNDER. The FOUNDER area (/founder, /founder/assistant) is restricted to the founder.
- Phase 1 backend (Orders, Post Likes, Follow) is complete and QA-verified.
- There is a COMPLETE_PROJECT_ANALYSIS_REPORT.md and QA_TESTING_REPORT.md describing the current state and technical details.

Your style:
- Ask 1–2 clarifying questions only if truly necessary.
- Think in terms of priorities, dependencies, and impact.
- When asked "what next?", propose a short, realistic roadmap (1–3 steps at a time).
- When the user is overwhelmed, simplify and summarize.

When you answer:
- Always connect ideas back to Banda Chao's reality: makers, visitors, orders, content, and long-term community.
- Offer concrete examples, not just theory.
- If the request is technical, you may collaborate conceptually with what the TECH panda would do, but you stay at the strategic level.`,

          tech: `You are the TECHNICAL PANDA assistant for the "Banda Chao" project.

Your role:
- Think like a senior full-stack engineer who deeply understands this ONE codebase.
- Help the founder reason about architecture, code structure, APIs, and technical tradeoffs.
- Translate business/feature ideas into clean, implementable technical plans.
- When needed, propose code snippets or file changes, but always consistent with the existing stack.

Project stack and context:
- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS.
- Backend: Express + TypeScript + Prisma ORM.
- Database: PostgreSQL (datasource db in Prisma).
- Features already implemented:
  - Role system: USER and FOUNDER, with protected founder area (/founder, /founder/assistant/*).
  - Orders system: Order + OrderItem models, /api/v1/orders endpoints, checkout + success + orders list pages.
  - Post likes: PostLike model, /api/v1/posts/:id/like endpoints, feed integration.
  - Follow system: Follow model, /api/v1/users/:id/follow* endpoints, profile integration.
- There is a COMPLETE_PROJECT_ANALYSIS_REPORT.md and QA_TESTING_REPORT.md that describe:
  - All routes, models, and APIs.
  - Which parts are ~75% done and which are still missing (notifications, orders expansion, etc.).

Your style:
- Be precise and pragmatic.
- Prefer step-by-step plans (1) what to change, (2) where, (3) why.
- When suggesting code, keep it focused to relevant files and respect existing patterns/conventions.

When you answer:
- Always reference the existing architecture (Next.js App Router + Express API + Prisma).
- Suggest minimal, safe changes instead of big rewrites.
- Highlight risks and edge cases (validation, auth, roles, performance).
- If something is unclear in the user's description, propose reasonable assumptions and say so.`,

          guard: `You are the SECURITY PANDA ("الباندا الحارس") for the Banda Chao project.

Your role:
- Think like a security-focused engineer and risk advisor.
- Help review flows for authentication, authorization, data protection, and abuse prevention.
- Suggest improvements that keep the system safe without making it unusable.

Project security context:
- Role system: USER and FOUNDER, with FOUNDER-only areas (/founder, /founder/assistant/*).
- Backend: Express + JWT-based auth, with authenticateToken middleware.
- Prisma models include:
  - User, Message, Post, Comment, Product, Video, Order, OrderItem, PostLike, VideoLike, ProductLike, Follow, etc.
- Recent improvements:
  - Orders: strong quantity validation and price checks.
  - Post likes: post existence checks, idempotent like/unlike.
  - Follow system: self-follow prevention, idempotent operations.

Your style:
- Think in threats and mitigations: "what could go wrong, and how do we prevent it?"
- Highlight issues like:
  - Broken access control
  - Data exposure
  - Rate limiting / abuse
  - Insecure error messages
- Propose concrete, implementable changes.

When you answer:
- Always tie your suggestions to actual parts of the Banda Chao system (auth middleware, APIs, founder area).
- Prioritize: first critical issues, then nice-to-have hardening.
- If something is already reasonably secure, say so clearly, and focus on the next risk.`,

          commerce: `You are the COMMERCE PANDA ("باندا التجارة") for the Banda Chao project.

Your role:
- Think like a product + growth + commerce strategist.
- Focus on the buyer journey, conversion, pricing, and revenue flows.
- Help design smooth flows from:
  Visitor → Browsing → Cart → Checkout → Order → Return / Repeat purchase.

Project commerce context:
- Banda Chao is a social e-commerce platform connecting makers (craftspeople) with visitors/buyers.
- Technical features already implemented:
  - Products listing and details pages.
  - Cart and checkout flow.
  - Orders system (Order + OrderItem models, /api/v1/orders, success page, orders list).
  - Basic discounts structure (if present) and feed content for discovery.
- The backend is ready to store real orders; the frontend has:
  - /[locale]/checkout
  - /[locale]/order/success?orderId=...
  - /[locale]/orders (My Orders).

Your style:
- Think in terms of user journey, friction points, and clear CTAs.
- Suggest improvements that are feasible given the current stack.
- When needed, outline both product copy (what we say to the user) and small UX changes (where, how).

When you answer:
- Always ground your ideas in the current Banda Chao structure (makers, products, videos, orders).
- Propose small, incremental experiments (A/B-like ideas) the founder can try.
- Distinguish clearly between:
  - What is already implemented technically.
  - What is a future enhancement (loyalty, coupons, abandoned cart, etc.).`,

          content: `You are the CONTENT PANDA ("باندا المحتوى") for the Banda Chao project.

Your role:
- Be the narrative and copywriting brain.
- Help the founder write:
  - Landing page copy
  - About/Story sections
  - Product descriptions
  - Video scripts
  - In-app messages and microcopy
  - Emails and announcements
- Always keep the tone aligned with Banda Chao's identity.

Tone & voice:
- Warm, respectful, and human.
- Appreciative of craftspeople and their stories.
- Clear and simple; not overly corporate.
- Can write in Arabic, English, or bilingual when asked.

Project content context:
- Banda Chao = a bridge between craftspeople (makers) and people who value handmade, authentic products.
- There is a founder landing page with story, timeline, and message to makers.
- There are different audiences:
  - Makers (want visibility, respect, fair income).
  - Visitors/buyers (want authentic, beautifully told products).
  - The founder (needs internal docs and messaging to team/partners).

Your style:
- When asked for copy, propose 2–3 options if the request is important (e.g. main tagline).
- Adapt the tone based on the audience (maker vs buyer vs investor vs internal team).
- Keep paragraphs short and scannable.

When you answer:
- Always tie the wording back to the spirit of Banda Chao (respect for crafts, authenticity, storytelling).
- If the request is for UI text, keep it concise and suitable for buttons/labels/messages.`,

          logistics: `You are the LOGISTICS PANDA ("باندا اللوجستيات") for the Banda Chao project.

Your role:
- Think like an operations + logistics coordinator for a growing marketplace.
- Help the founder design:
  - Order fulfillment flows (from order to delivery).
  - Inventory and stock handling concepts (even if not fully implemented yet).
  - Return/refund policies.
  - Communication around shipping times and expectations.
- Make sure operations are realistic for small makers, not giant warehouses.

Project operational context:
- Banda Chao connects makers with buyers; makers may have limited stock and time.
- The tech side already supports:
  - Orders and order items.
  - Basic status field on orders (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED).
- What is still emerging:
  - Formal inventory tracking
  - Return/refund logic
  - Notification flows around shipping

Your style:
- Think step-by-step in terms of processes and states.
- Use simple diagrams or lists (State A → Action → State B).
- Account for real-world constraints of craftspeople (small scale, variable production times).

When you answer:
- Propose realistic flows that the backend can eventually support with the current Order model.
- Suggest what fields, statuses, and APIs might be needed next (without diving into code – that's for the TECH panda).
- Focus on clarity and predictability for both makers and buyers.`,
        };

        // Build API URL - use NEXT_PUBLIC_API_URL if endpoint is relative
        const apiBaseUrl = getApiBaseUrl();
        const apiUrl = assistant.endpoint.startsWith('http')
          ? assistant.endpoint
          : `${apiBaseUrl}${assistant.endpoint}`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: draft,
            systemPrompt: systemPrompts[assistantId],
            assistantType: assistantId === 'founder' ? 'vision' : assistantId === 'tech' ? 'technical' : assistantId === 'guard' ? 'security' : assistantId,
          }),
        });

        if (!response.ok) {
          throw new Error(`حدث خطأ غير متوقع (${response.status})`);
        }

        const data = (await response.json()) as { reply?: string; response?: string };

        const assistantMessage: ChatMessage = {
          id: `${assistantId}-assistant-${Date.now()}`,
          role: 'assistant',
          text: data.reply ?? data.response ?? assistant.openingMessage,
          createdAt: new Date().toISOString(),
        };

        setDialogs((prev) => ({
          ...prev,
          [assistantId]: [...prev[assistantId], assistantMessage],
        }));
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          [assistantId]: 'تعذر الحصول على استشارة من هذا المساعد الآن. حاول مجدداً خلال لحظات.',
        }));
      } finally {
        setLoadingAssistantId((prev) => (prev === assistantId ? null : prev));
      }
    },
    [activeAssistantId, drafts],
  );

  const currentAssistant = assistantMap[activeAssistantId];
  const currentMessages = dialogs[activeAssistantId] ?? [];
  const currentDraft = drafts[activeAssistantId] ?? '';
  const isLoading = loadingAssistantId === activeAssistantId;
  const currentError = errors[activeAssistantId] ?? null;
  const ttsStatus = ttsStatuses[activeAssistantId] ?? null;
  const playingMessageId =
    playingState?.assistantId === activeAssistantId ? playingState.messageId : null;

  // Handover function to switch assistants with context
  const handleHandover = useCallback(
    (target: AssistantId) => {
      const source = activeAssistantId;
      const sourceLabel = assistantMeta[source]?.label || 'مساعد آخر';
      const targetLabel = assistantMeta[target]?.label || 'مساعد';
      
      // Get last message from current assistant for context
      const lastMessageObj = currentMessages.length > 0 
        ? currentMessages[currentMessages.length - 1] 
        : null;
      const lastMessage = lastMessageObj?.text || null;
      const lastMessageRole = lastMessageObj?.role || null;
      
      // Custom handover messages based on source and target
      const handoverMessages: Record<string, string> = {
        'founder->tech': 'كنا نناقش قراراً استراتيجياً مع الباندا المؤسس. أريد خطة تقنية لتنفيذه:\n\n',
        'founder->guard': 'ناقشنا إضافة ميزة جديدة مع الباندا المؤسس. أريد تقييمك الأمني لها:\n\n',
        'founder->commerce': 'حددنا أولوية استراتيجية مع الباندا المؤسس. كيف نترجمها إلى نمو تجاري:\n\n',
        'founder->content': 'اتفقنا على رسالة استراتيجية مع الباندا المؤسس. ساعدني بصياغتها:\n\n',
        'founder->logistics': 'قررنا خطة استراتيجية مع الباندا المؤسس. كيف ننفذها عملياً:\n\n',
        'tech->founder': 'حددنا متطلبات تقنية. أريد قرارك الاستراتيجي حول الأولويات:\n\n',
        'tech->guard': 'صممنا حلولاً تقنية. أريد مراجعتك الأمنية لها:\n\n',
        'guard->founder': 'حددنا مخاطر أمنية. أريد قرارك الاستراتيجي حول كيفية التعامل معها:\n\n',
        'guard->tech': 'اكتشفنا ثغرة أمنية. أريد حلولاً تقنية لإصلاحها:\n\n',
        'commerce->founder': 'حللنا فرص تجارية. أريد قرارك الاستراتيجي حول الأولويات:\n\n',
        'commerce->content': 'صممنا funnel تجاري. ساعدني بصياغة النصوص المناسبة:\n\n',
        'commerce->logistics': 'خططنا حملة تجارية. كيف نضمن تدفق عملياتي سلس:\n\n',
        'content->founder': 'صغنا رسائل محتوى. أريد قرارك الاستراتيجي حول الاتجاه:\n\n',
        'content->commerce': 'صغنا محتوى جذاب. كيف نستخدمه لزيادة التحويل:\n\n',
        'logistics->founder': 'حددنا تحديات عملياتية. أريد قرارك الاستراتيجي:\n\n',
        'logistics->commerce': 'حسّنا التدفق العملياتي. كيف نستخدمه لتحسين التجربة التجارية:\n\n',
      };
      
      const handoverKey = `${source}->${target}`;
      const handoverMessage = handoverMessages[handoverKey] || 
        `كنا نناقش هذا الموضوع مع ${sourceLabel}. يرجى المتابعة من منظورك:\n\n`;
      
      // Add last message as context if available, with role indicator
      let finalMessage = handoverMessage;
      if (lastMessage && lastMessage.trim().length > 10) {
        // Only include context if message is substantial (more than 10 chars)
        const messageSnippet = lastMessage.substring(0, 200);
        const truncated = lastMessage.length > 200;
        const roleLabel = lastMessageRole === 'assistant' 
          ? `رد ${sourceLabel}`
          : lastMessageRole === 'founder'
          ? 'رسالة المؤسس'
          : 'المحادثة السابقة';
        
        finalMessage = `${handoverMessage}السياق من المحادثة السابقة (${roleLabel}):\n"${messageSnippet}${truncated ? '...' : ''}"\n\n`;
      }
      
      setActiveAssistantId(target);
      setDrafts((prev) => ({
        ...prev,
        [target]: finalMessage,
      }));
    },
    [activeAssistantId, currentMessages],
  );

  const tabs = useMemo(
    () =>
      assistants.map((assistant) => {
        const isActive = assistant.id === activeAssistantId;
        return (
          <button
            key={assistant.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleTabChange(assistant.id)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-white/40 ${
              isActive
                ? assistant.theme.tabActive
                : 'border-white/10 bg-white/5 text-gray-200 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            {assistant.label}
          </button>
        );
      }),
    [activeAssistantId, handleTabChange],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            مركز مساعدي المؤسس
          </h1>
          <p className="text-gray-600 text-lg">
            يمكنك التبديل بين المساعدين الستة المتخصصين للحصول على استشارات في مختلف المجالات
          </p>
        </div>

        {/* Main Layout: Sidebar + Chat Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Assistants List */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4 sticky top-4">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
                المساعدون
              </h2>
              <nav className="space-y-2">
                {assistants.map((assistant) => {
                  const isActive = assistant.id === activeAssistantId;
                  return (
                    <button
                      key={assistant.id}
                      type="button"
                      onClick={() => handleTabChange(assistant.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-right ${
                        isActive
                          ? `${assistant.theme.headerGradient} text-white shadow-lg transform scale-[1.02]`
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                      }`}
                    >
                      <span className="text-2xl">
                        {assistant.id === 'founder' ? '🐼' :
                         assistant.id === 'tech' ? '💻' :
                         assistant.id === 'guard' ? '🛡️' :
                         assistant.id === 'commerce' ? '📊' :
                         assistant.id === 'content' ? '✍️' :
                         assistant.id === 'logistics' ? '📦' : '🐼'}
                      </span>
                      <div className="flex-1">
                        <div className={`font-semibold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                          {assistant.label}
                        </div>
                        <div className={`text-xs mt-0.5 ${isActive ? 'text-white/90' : 'text-gray-500'}`}>
                          {assistant.overline}
                        </div>
                      </div>
                      {isActive && (
                        <span className="text-white/80">✓</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Chat Area */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-4">
              {/* Current Assistant Info Card */}
              <div className={`rounded-2xl px-6 py-5 text-right shadow-lg ${currentAssistant.theme.headerGradient}`}>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-4xl">
                    {activeAssistantId === 'founder' ? '🐼' :
                     activeAssistantId === 'tech' ? '💻' :
                     activeAssistantId === 'guard' ? '🛡️' :
                     activeAssistantId === 'commerce' ? '📊' :
                     activeAssistantId === 'content' ? '✍️' :
                     activeAssistantId === 'logistics' ? '📦' : '🐼'}
                  </span>
                  <div className="flex-1">
                    <p className={`text-xs font-semibold tracking-widest ${currentAssistant.theme.overlineColor} mb-1`}>
                      {currentAssistant.overline}
                    </p>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">{currentAssistant.title}</h2>
                  </div>
                </div>
                <p className="text-base text-white/90 leading-relaxed">{currentAssistant.description}</p>
              </div>

              {/* Chat Messages */}
              {currentMessages.length > 1 && (
                <div className="space-y-4 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 text-right shadow-sm max-h-[500px] overflow-x-hidden">
                {currentMessages.slice(1).map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                  >
                    <article
                      className={`max-w-2xl rounded-xl px-5 py-4 leading-relaxed ${
                        message.role === 'assistant'
                          ? `${currentAssistant.theme.assistantBubble} border border-gray-200`
                          : 'bg-primary-600 text-white shadow-md'
                      }`}
                    >
                      <p>{message.text}</p>
                      {message.role === 'assistant' ? (
                        <button
                          type="button"
                          onClick={() => handlePlayAudio(activeAssistantId, message)}
                          className="mt-3 flex items-center justify-end gap-1 text-xs font-semibold text-current transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          <span role="img" aria-hidden="true">
                            {playingMessageId === message.id ? '⏸️' : '🔊'}
                          </span>
                          {playingMessageId === message.id ? 'إيقاف الصوت' : 'تشغيل الصوت'}
                          {playingMessageId === message.id ? (
                            <span className="ml-1 animate-pulse text-[10px] opacity-80">...جاري</span>
                          ) : null}
                        </button>
                      ) : null}
                    </article>
                  </div>
                ))}

                {isLoading ? (
                  <div className="flex justify-start">
                    <div
                      className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs shadow ${currentAssistant.theme.loadingBadge}`}
                    >
                      <span className="h-2 w-2 animate-ping rounded-full bg-current" aria-hidden />
                      <span>{currentAssistant.loadingText}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {ttsStatus ? (
              <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-center text-xs text-white/80">
                {ttsStatus}
              </div>
            ) : null}

            {currentError ? (
              <div className="rounded-xl border border-red-300/40 bg-red-400/20 px-4 py-3 text-sm text-red-100">
                {currentError}
              </div>
            ) : null}

              {/* Welcome Message Card */}
              {currentMessages.length > 0 && currentMessages[0].role === 'assistant' && (
                <div className="rounded-2xl border-2 border-primary-200 bg-primary-50 p-6 text-right text-sm text-gray-800 shadow-sm">
                <p className="leading-relaxed">{currentMessages[0].text}</p>
                {currentMessages[0] && (
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(activeAssistantId, currentMessages[0])}
                    className="mt-4 flex items-center justify-end gap-1 text-xs font-semibold text-current transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/40"
                  >
                    <span role="img" aria-hidden="true">🔊</span>
                    تشغيل الصوت
                  </button>
                )}
              </div>
            )}

              {/* Suggested Questions */}
              {assistantSuggestions[activeAssistantId]?.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-gray-700 mb-3">💡 أسئلة مقترحة:</p>
                  <div className="flex flex-wrap gap-2">
                    {assistantSuggestions[activeAssistantId].map((question, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          setDrafts((prev) => ({
                            ...prev,
                            [activeAssistantId]: question,
                          }))
                        }
                        className="text-xs md:text-sm px-4 py-2 rounded-full bg-gray-100 hover:bg-primary-100 hover:text-primary-700 text-gray-700 border border-gray-200 hover:border-primary-300 transition-all duration-200"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cross-Panda Handover Buttons */}
              {assistantMeta[activeAssistantId]?.handoverTargets?.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-gray-700 mb-3">🔄 تحويل إلى:</p>
                  <div className="flex flex-wrap gap-2">
                    {assistantMeta[activeAssistantId].handoverTargets.map((targetId) => (
                      <button
                        key={targetId}
                        type="button"
                        onClick={() => handleHandover(targetId)}
                        className="text-xs md:text-sm px-4 py-2 rounded-full bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 hover:border-primary-300 transition-all duration-200"
                      >
                        اسأل {assistantMeta[targetId].label} عن هذا
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Consultation Box */}
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg"
              >
                <label htmlFor="founder-question" className="text-base font-semibold text-gray-900">
                  صِف استفسارك القيادي الحالي:
                </label>
                <div className="relative">
                  <textarea
                    id="founder-question"
                    value={currentDraft}
                    onChange={(event) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [activeAssistantId]: event.target.value,
                      }))
                    }
                    placeholder={isListening ? "جاري الاستماع... تحدث الآن" : currentAssistant.placeholder}
                    className="min-h-[120px] w-full resize-none rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-3 pr-14 text-sm text-gray-900 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 transition-colors"
                    disabled={isLoading || isListening}
                    dir="rtl"
                  />
                  {/* Voice Input Button */}
                  {isMounted && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`absolute left-3 top-3 p-2 rounded-lg transition ${
                        isListening
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title={isListening ? 'إيقاف الاستماع' : 'بدء التحدث'}
                      disabled={isLoading || !recognitionRef.current}
                    >
                      <span className="text-xl">{isListening ? '🔴' : '🎤'}</span>
                    </button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    سيتم توليد توصية قابلة للتنفيذ من {currentAssistant.label}.
                  </p>
                  <button
                    type="submit"
                    className={`rounded-xl px-8 py-3 text-sm font-bold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${currentAssistant.theme.headerGradient} hover:shadow-lg transform hover:scale-105`}
                    disabled={isLoading || isListening || !currentDraft.trim()}
                  >
                    {isLoading ? 'جاري المعالجة...' : 'إطلاق الاستشارة الآن'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderAIAssistant;
