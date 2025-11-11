'use client';

import { useCallback, useMemo, useState } from 'react';

type MessageRole = 'founder' | 'assistant';

type ChatMessage = {
  id: string;
  role: MessageRole;
  text: string;
  createdAt: string;
};

type FounderAIResponse = {
  response: string;
};

const assistantGreeting =
  'مرحباً أيها المؤسس، أنا باندا فاوندر. جاهز لمراجعة الرؤية وبناء خطة نمو محكمة.';

const FounderAIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'assistant-init',
      role: 'assistant',
      text: assistantGreeting,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [ttsStatus, setTtsStatus] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = input.trim();
      if (!trimmed) {
        return;
      }

      const userMessage: ChatMessage = {
        id: `founder-${Date.now()}`,
        role: 'founder',
        text: trimmed,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/ai-founder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: trimmed }),
        });

        if (!response.ok) {
          throw new Error(`حدث خطأ غير متوقع (${response.status})`);
        }

        const data = (await response.json()) as FounderAIResponse;

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: data.response ?? assistantGreeting,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setError('تعذر الحصول على استشارة من باندا فاوندر. حاول مرة أخرى خلال لحظات.');
      } finally {
        setIsLoading(false);
      }
    },
    [input],
  );

  const handlePlayAudio = useCallback((message: ChatMessage) => {
    setPlayingMessageId(message.id);
    setTtsStatus('جارٍ تحويل الرد إلى صوت استراتيجي قصير...');

    window.setTimeout(() => {
      setTtsStatus('تم تشغيل الصوت الوهمي لهذا الرد.');
      setPlayingMessageId(null);

      window.setTimeout(() => {
        setTtsStatus(null);
      }, 2500);
    }, 1800);
  }, []);

  const orderedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messages],
  );

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-amber-200 bg-amber-50/70 p-6 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.35)] backdrop-blur">
      <header className="rounded-2xl bg-gradient-to-l from-rose-600 via-amber-500 to-rose-500 px-6 py-4 text-right text-white shadow-inner">
        <p className="text-sm font-light tracking-widest">مستشار النمو الذكي</p>
        <h2 className="mt-1 text-2xl font-black">باندا فاوندر</h2>
        <p className="mt-2 text-sm text-rose-100">خريطة الطريق تبدأ من هنا، كل قرار محسوب بعناية.</p>
      </header>

      <section className="flex max-h-[480px] flex-col gap-4 overflow-hidden">
        <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-amber-200/70 bg-white p-4 text-right shadow-inner">
          {orderedMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <article
                className={`relative max-w-xl rounded-2xl px-4 py-3 leading-relaxed ${
                  message.role === 'assistant'
                    ? 'bg-rose-50 text-rose-900 shadow-[0_20px_40px_-24px_rgba(220,38,38,0.65)]'
                    : 'bg-amber-500 text-white shadow-[0_18px_40px_-22px_rgba(245,158,11,0.65)]'
                }`}
              >
                <p>{message.text}</p>
                {message.role === 'assistant' ? (
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(message)}
                    className="mt-3 flex items-center justify-end gap-1 text-xs font-semibold text-rose-600 transition hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                  >
                    <span role="img" aria-hidden="true">
                      🔊
                    </span>
                    تشغيل الصوت
                    {playingMessageId === message.id ? (
                      <span className="ml-1 animate-pulse text-[10px] text-rose-400">...جارٍ</span>
                    ) : null}
                  </button>
                ) : null}
              </article>
            </div>
          ))}

          {isLoading ? (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-xs text-rose-700 shadow">
                <span className="h-2 w-2 animate-ping rounded-full bg-rose-500" aria-hidden />
                <span>باندا فاوندر يعيد ترتيب أفكاره...</span>
              </div>
            </div>
          ) : null}
        </div>

        {ttsStatus ? (
          <div className="rounded-xl border border-amber-300 bg-amber-100 px-4 py-2 text-center text-xs text-amber-700">
            {ttsStatus}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-white/90 p-4 shadow">
          <label htmlFor="founder-question" className="text-sm font-semibold text-amber-700">
            صغ استفسارك بصيغة استراتيجية:
          </label>
          <textarea
            id="founder-question"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="ما هو التحدي الرئيسي الذي تشعر أنه يبطئ مسار النمو؟"
            className="min-h-[96px] resize-none rounded-xl border border-amber-200 px-3 py-2 text-sm text-amber-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-300/60"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-500">كل إجابة ستتضمن توصية قابلة للتنفيذ.</p>
            <button
              type="submit"
              className="rounded-xl bg-rose-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:cursor-not-allowed disabled:bg-rose-300"
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
