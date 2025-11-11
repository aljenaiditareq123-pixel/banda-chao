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
    endpoint: '/api/ai-founder',
    overline: 'قائد الرؤية العليا',
    title: 'الباندا المؤسس',
    description: 'يرسم القرارات المصيرية ويحوّل الرؤية إلى خطط تنفيذية واضحة.',
    placeholder: 'ما هي المبادرة أو التحدي الاستراتيجي الذي ترغب في تسريعه الآن؟',
    loadingText: 'الباندا المؤسس يعيد صياغة خريطة القرارات...',
    openingMessage:
      'مرحباً أيها المؤسس، أنا الباندا المؤسس. لنبنِ معاً قراراً استراتيجياً يقود النمو القادم.',
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
    endpoint: '/api/ai-tech',
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
    endpoint: '/api/ai-guard',
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
    endpoint: '/api/ai-commerce',
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
    endpoint: '/api/ai-content',
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
    endpoint: '/api/ai-logistics',
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

  const timeoutsRef = useRef<TimeoutHandle[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutsRef.current = [];
    };
  }, []);

  const handleTabChange = useCallback((assistantId: AssistantId) => {
    setActiveAssistantId(assistantId);
  }, []);

  const handlePlayAudio = useCallback((assistantId: AssistantId, message: ChatMessage) => {
    const assistant = assistantMap[assistantId];
    setPlayingState({ assistantId, messageId: message.id });
    setTtsStatuses((prev) => ({
      ...prev,
      [assistantId]: `جارٍ تحويل رد ${assistant.label} إلى موجة صوتية قيادية...`,
    }));

    const firstTimeout = setTimeout(() => {
      setTtsStatuses((prev) => ({
        ...prev,
        [assistantId]: `تم تشغيل الصوت الوهمي لرد ${assistant.label}.`,
      }));
      setPlayingState((prev) => (prev?.assistantId === assistantId ? null : prev));
      timeoutsRef.current = timeoutsRef.current.filter((timeoutId) => timeoutId !== firstTimeout);

      const secondTimeout = setTimeout(() => {
        setTtsStatuses((prev) => ({
          ...prev,
          [assistantId]: null,
        }));
        timeoutsRef.current = timeoutsRef.current.filter((timeoutId) => timeoutId !== secondTimeout);
      }, 2500);

      timeoutsRef.current.push(secondTimeout);
    }, 1800);

    timeoutsRef.current.push(firstTimeout);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

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
        const response = await fetch(assistant.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: draft }),
        });

        if (!response.ok) {
          throw new Error(`حدث خطأ غير متوقع (${response.status})`);
        }

        const data = (await response.json()) as AssistantResponse;

        const assistantMessage: ChatMessage = {
          id: `${assistantId}-assistant-${Date.now()}`,
          role: 'assistant',
          text: data.response ?? assistant.openingMessage,
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
                    className="mt-3 flex items-center justify-end gap-1 text-xs font-semibold text-current transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-white/40"
                  >
                    <span role="img" aria-hidden="true">
                      🔊
                    </span>
                    تشغيل الصوت
                    {playingMessageId === message.id ? (
                      <span className="ml-1 animate-pulse text-[10px] opacity-80">...جارٍ</span>
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
          <textarea
            id="founder-question"
            value={currentDraft}
            onChange={(event) =>
              setDrafts((prev) => ({
                ...prev,
                [activeAssistantId]: event.target.value,
              }))
            }
            placeholder={currentAssistant.placeholder}
            className="min-h-[110px] resize-none rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-sm text-white focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between text-xs text-white/60">
            <p>سيتم توليد توصية قابلة للتنفيذ من {currentAssistant.label}.</p>
            <button
              type="submit"
              className="rounded-xl bg-white/20 px-6 py-2 text-sm font-bold text-white transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              إطلاق الاستشارة الآن
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default FounderAIAssistant;
