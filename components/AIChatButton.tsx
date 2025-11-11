'use client';

import { useCallback, useMemo, useState } from 'react';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

const assistantGreeting = 'مرحباً، أنا مساعد Banda Chao. كيف يمكنني دعمك في إيجاد منتج حرفي اليوم؟';

const AIChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'assistant-greeting',
      role: 'assistant',
      text: assistantGreeting,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = input.trim();
      if (!trimmed) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: trimmed,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: trimmed }),
        });

        if (!response.ok) {
          throw new Error(`response status ${response.status}`);
        }

        const data = (await response.json()) as { response: string };

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: data.response ?? assistantGreeting,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setError('لم نتمكن من التواصل مع المساعد الآن. يرجى المحاولة بعد قليل.');
      } finally {
        setIsLoading(false);
      }
    },
    [input],
  );

  const chatButtonLabel = useMemo(
    () => (isOpen ? 'إغلاق المساعد' : 'فتح مساعد Banda Chao'),
    [isOpen],
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-80 max-w-[90vw] rounded-2xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5">
          <div className="flex items-center justify-between rounded-t-2xl bg-rose-600 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">مساعد Banda Chao</p>
              <p className="text-xs text-rose-100">جاهز لمساعدتك في اكتشاف الحرف اليدوية</p>
            </div>
            <button
              type="button"
              onClick={toggleChat}
              className="rounded-full p-1 transition hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-white/70"
              aria-label="إغلاق نافذة الدردشة"
            >
              ✕
            </button>
          </div>

          <div className="flex max-h-80 flex-col justify-between gap-3 p-4">
            <div className="flex flex-col gap-2 overflow-y-auto pr-1 text-sm text-gray-800">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                      message.role === 'assistant'
                        ? 'bg-rose-50 text-rose-900'
                        : 'bg-gray-900 text-white'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isLoading ? (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-rose-900">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" aria-hidden />
                    <span>المساعد يفكر...</span>
                  </div>
                </div>
              ) : null}
            </div>

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </p>
            ) : null}

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="صف ما تبحث عنه..."
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-400/60"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:cursor-not-allowed disabled:bg-rose-300"
                disabled={isLoading}
              >
                إرسال
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleChat}
        aria-label={chatButtonLabel}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-2xl shadow-lg transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-400/60"
      >
        🤖
      </button>
    </div>
  );
};

export default AIChatButton;
