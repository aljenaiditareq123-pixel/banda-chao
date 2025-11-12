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
    endpoint: '/api/chat',
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

const FounderAIAssistant: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [activeAssistantId, setActiveAssistantId] = useState<AssistantId>('founder');
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
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition && !recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'ar-SA';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
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

                const response = await fetch(assistant.endpoint, {
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
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          if (event.error === 'no-speech') {
            // Don't show alert, just reset
          } else if (event.error === 'not-allowed') {
            alert('يرجى السماح بالوصول إلى الميكروفون في إعدادات المتصفح.');
          } else if (event.error === 'network') {
            alert('خطأ في الشبكة. يرجى التحقق من اتصال الإنترنت.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
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
  }, []); // Only run once on mount, not on assistant change

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
    if (!recognitionRef.current) {
      alert('ميزة التعرف على الصوت غير مدعومة في متصفحك. يرجى استخدام Chrome أو Edge.');
      return;
    }

    if (isListening) {
      // Stop listening
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
      setIsListening(false);
    } else {
      // Start listening
      try {
        setDrafts((prev) => ({
          ...prev,
          [activeAssistantId]: '',
        }));
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        alert('خطأ في بدء التسجيل الصوتي. تأكد من السماح بالوصول إلى الميكروفون.');
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

        const response = await fetch(assistant.endpoint, {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-right text-white shadow-[0_40px_80px_-45px_rgba(0,0,0,0.7)] backdrop-blur">
          <div
            role="tablist"
            aria-label="فريق القيادة الذكي"
            className="flex flex-wrap justify-end gap-2"
          >
            {tabs}
          </div>

          <header
            className={`rounded-2xl px-6 py-4 text-right shadow-inner ${currentAssistant.theme.headerGradient}`}
          >
            <p className={`text-xs font-semibold tracking-widest ${currentAssistant.theme.overlineColor}`}>
              {currentAssistant.overline}
            </p>
            <h2 className="mt-1 text-2xl font-black">{currentAssistant.title}</h2>
            <p className="mt-2 text-sm text-white/80">{currentAssistant.description}</p>
          </header>

          <section className="flex max-h-[520px] flex-col gap-4 overflow-hidden">
            <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-white/10 p-4 text-right text-sm text-gray-100 shadow-inner">
              {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <article
                    className={`relative max-w-xl rounded-2xl px-4 py-3 leading-relaxed ${
                      message.role === 'assistant'
                        ? currentAssistant.theme.assistantBubble
                        : 'bg-gray-900 text-white shadow-[0_24px_48px_-30px_rgba(15,23,42,0.65)]'
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

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-gray-100 shadow"
            >
              <label htmlFor="founder-question" className="text-sm font-semibold text-white/80">
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
                  className="min-h-[110px] resize-none rounded-xl border border-white/20 bg-black/20 px-3 py-2 pr-12 text-sm text-white focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
                  disabled={isLoading || isListening}
                  dir="rtl"
                />
                {/* Voice Input Button */}
                {isMounted && typeof window !== 'undefined' && 
                 ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`absolute left-3 top-3 p-2 rounded-lg transition ${
                      isListening
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                    title={isListening ? 'إيقاف الاستماع' : 'بدء التحدث'}
                    disabled={isLoading}
                  >
                    <span className="text-xl">{isListening ? '🔴' : '🎤'}</span>
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-white/60">
                <p>سيتم توليد توصية قابلة للتنفيذ من {currentAssistant.label}.</p>
                <button
                  type="submit"
                  className="rounded-xl bg-white/20 px-6 py-2 text-sm font-bold text-white transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading || isListening}
                >
                  {isLoading ? 'جاري المعالجة...' : 'إطلاق الاستشارة الآن'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FounderAIAssistant;
