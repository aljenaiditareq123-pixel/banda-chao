'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Loader2 } from 'lucide-react';
import { chatAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PandaChatBubbleProps {
  locale: string;
}

export default function PandaChatBubble({ locale }: PandaChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Extract product ID from current path
  const currentProductId = pathname?.match(/\/products\/([^/]+)/)?.[1];

  // Scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Initialize with greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: ChatMessage = {
        id: 'greeting',
        role: 'assistant',
        content: user?.name
          ? locale === 'ar'
            ? `أهلاً ${user.name}! 🐼 كيف يمكنني مساعدتك اليوم؟`
            : locale === 'zh'
            ? `你好 ${user.name}！🐼 今天我能为你做什么？`
            : `Hello ${user.name}! 🐼 How can I help you today?`
          : locale === 'ar'
          ? 'أهلاً بك! 🐼 أنا الباندا المساعد. كيف يمكنني مساعدتك؟'
          : locale === 'zh'
          ? '你好！🐼 我是熊猫助手。我能为你做什么？'
          : 'Hello! 🐼 I\'m Panda, your AI assistant. How can I help you?',
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [isOpen, user, locale]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setSuggestions([]);

    try {
      const response = await chatAPI.sendMessage(userMessage.content, {
        context: {
          currentProductId,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          })),
        },
        locale,
      });

      if (response.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.message || 'Sorry, I didn\'t understand that.',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setSuggestions(response.suggestions || []);

        // Handle actions
        if (response.action) {
          if (response.action.type === 'show_order' && response.action.data?.orderId) {
            router.push(`/${locale}/orders/${response.action.data.orderId}`);
          } else if (response.action.type === 'show_product' && response.action.data?.productId) {
            router.push(`/${locale}/products/${response.action.data.productId}`);
          }
        }
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: locale === 'ar'
            ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
            : locale === 'zh'
            ? '抱歉，出错了。请重试。'
            : 'Sorry, an error occurred. Please try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: locale === 'ar'
          ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
          : locale === 'zh'
          ? '抱歉，出错了。请重试。'
          : 'Sorry, an error occurred. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : locale === 'zh' ? 'zh-CN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
            aria-label={locale === 'ar' ? 'فتح المحادثة' : locale === 'zh' ? '打开聊天' : 'Open chat'}
          >
            <MessageCircle className="w-7 h-7" />
            {messages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs">
                {messages.length}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '600px',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col ${
              isMinimized ? 'h-auto' : 'h-[600px]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-primary-600 text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🐼</span>
                </div>
                <div>
                  <h3 className="font-semibold">
                    {locale === 'ar' ? 'الباندا المساعد' : locale === 'zh' ? '熊猫助手' : 'Panda Assistant'}
                  </h3>
                  <p className="text-xs text-white/80">
                    {locale === 'ar' ? 'متصل' : locale === 'zh' ? '在线' : 'Online'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label={locale === 'ar' ? 'تصغير' : locale === 'zh' ? '最小化' : 'Minimize'}
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(false);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label={locale === 'ar' ? 'إغلاق' : locale === 'zh' ? '关闭' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="px-4 pb-2 flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <VoiceInput
                      value={inputMessage}
                      onChange={setInputMessage}
                      placeholder={
                        locale === 'ar'
                          ? 'اكتب رسالتك أو اضغط الميكروفون للتحدث...'
                          : locale === 'zh'
                          ? '输入您的消息或点击麦克风说话...'
                          : 'Type your message or click microphone to speak...'
                      }
                      lang={locale === 'ar' ? 'ar-SA' : locale === 'zh' ? 'zh-CN' : 'en-US'}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isLoading}
                      className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label={locale === 'ar' ? 'إرسال' : locale === 'zh' ? '发送' : 'Send'}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
