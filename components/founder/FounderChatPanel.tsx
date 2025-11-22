'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getApiBaseUrl } from '@/lib/api-utils';
import { apiCall, handleApiError } from '@/lib/api-error-handler';

import {
  type FounderOperatingMode,
  type FounderSlashCommand,
  type FounderSession,
  type AssistantId,
  type MessageRole,
  type ChatMessage,
  type AssistantProfile,
  type SlashCommand,
  type ModeConfig,
  type FounderChatPanelProps,
  type ApiResponse,
  type FounderSessionsResponse
} from '@/types/founder';

const assistantsMap: Record<AssistantId, AssistantProfile> = {
  founder: {
    id: 'founder',
    label: 'الباندا المؤسس',
    endpoint: '/api/chat',
    title: 'الباندا المؤسس',
    description: 'يرسم القرارات المصيرية ويحوّل الرؤية إلى خطط تنفيذية واضحة.',
    placeholder: 'ما هي المبادرة أو التحدي الاستراتيجي الذي ترغب في تسريعه الآن؟',
    loadingText: 'الباندا المؤسس يعيد صياغة خريطة القرارات...',
    openingMessage: 'مرحباً أيها المؤسس، أنا الباندا المؤسس - نسختك الإلكترونية. أنا أعرف كل شيء عن المشروع من اليوم الأول حتى الآن. كيف يمكنني مساعدتك اليوم؟',
    headerGradient: 'bg-gradient-to-l from-rose-600 via-amber-500 to-rose-500',
    assistantBubble: 'bg-rose-50/90 text-rose-900 shadow-[0_24px_48px_-28px_rgba(225,29,72,0.75)]',
  },
  tech: {
    id: 'tech',
    label: 'الباندا التقني',
    endpoint: '/api/technical-panda',
    title: 'الباندا التقني',
    description: 'يضمن جاهزية البنية التحتية ويقترح حلولاً تقنية قابلة للتوسع.',
    placeholder: 'أي جانب تقني أو بنية تحتية يحتاج إلى مراجعة عاجلة؟',
    loadingText: 'الباندا التقني يختبر البنية ويحدد نقاط التحسين...',
    openingMessage: 'مرحباً، هنا الباندا التقني. دعنا نرفع جاهزية المنصة ونؤمّن أساساً قوياً للتوسع القادم.',
    headerGradient: 'bg-gradient-to-l from-sky-700 via-cyan-600 to-sky-500',
    assistantBubble: 'bg-sky-50/90 text-sky-900 shadow-[0_24px_48px_-28px_rgba(14,116,144,0.75)]',
  },
  guard: {
    id: 'guard',
    label: 'الباندا الحارس',
    endpoint: '/api/chat',
    title: 'الباندا الحارس',
    description: 'يراقب الثغرات، يحمي الحسابات، ويصون البيانات المالية الحساسة.',
    placeholder: 'صف الخطر الأمني أو السياسة التي تحتاج إلى تدعيم فوري.',
    loadingText: 'الباندا الحارس يقيم التهديدات ويحصّن الدفاعات...',
    openingMessage: 'تحية من الباندا الحارس. سأراجع المخاطر الحالية ونبني سياسة حماية محكمة للبيانات.',
    headerGradient: 'bg-gradient-to-l from-emerald-700 via-emerald-600 to-emerald-500',
    assistantBubble: 'bg-emerald-50/90 text-emerald-900 shadow-[0_24px_48px_-28px_rgba(16,185,129,0.75)]',
  },
  commerce: {
    id: 'commerce',
    label: 'باندا التجارة',
    endpoint: '/api/chat',
    title: 'باندا التجارة',
    description: 'يركّز على نمو الإيرادات وتجربة عميل متكاملة من أول زيارة حتى الدفع.',
    placeholder: 'ما هو التحدي التجاري أو مؤشرات التحويل التي تريد تعزيزها؟',
    loadingText: 'باندا التجارة يحلل مسار الشراء ويقترح خطوات التحسين...',
    openingMessage: 'مرحباً، أنا باندا التجارة. لنحدد أسرع مسار لزيادة المبيعات وتحسين التحويل.',
    headerGradient: 'bg-gradient-to-l from-orange-600 via-amber-500 to-yellow-500',
    assistantBubble: 'bg-amber-50/90 text-amber-900 shadow-[0_24px_48px_-28px_rgba(217,119,6,0.75)]',
  },
  content: {
    id: 'content',
    label: 'باندا المحتوى',
    endpoint: '/api/chat',
    title: 'باندا المحتوى',
    description: 'يبني سرداً جذاباً يحفّز المشاركة ويزيد ولاء المجتمع.',
    placeholder: 'ما هو النص أو المحتوى الذي تحتاج مساعدة في صياغته؟',
    loadingText: 'باندا المحتوى يكتب المحتوى المناسب...',
    openingMessage: 'مرحباً، أنا باندا المحتوى. سأساعدك في بناء سرد جذاب يحفّز المشاركة.',
    headerGradient: 'bg-gradient-to-l from-fuchsia-600 via-purple-500 to-violet-500',
    assistantBubble: 'bg-fuchsia-50/90 text-fuchsia-900 shadow-[0_24px_48px_-28px_rgba(168,85,247,0.75)]',
  },
  logistics: {
    id: 'logistics',
    label: 'باندا اللوجستيات',
    endpoint: '/api/chat',
    title: 'باندا اللوجستيات',
    description: 'يضبط المخزون، التوصيل، وسلاسل الإمداد لضمان تجربة بلا تأخير.',
    placeholder: 'ما هو التحدي اللوجستي الذي تواجهه حالياً؟',
    loadingText: 'باندا اللوجستيات يحلل العمليات ويقترح الحلول...',
    openingMessage: 'مرحباً، أنا باندا اللوجستيات. سأساعدك في ضبط المخزون والتوصيل.',
    headerGradient: 'bg-gradient-to-l from-slate-700 via-slate-600 to-slate-500',
    assistantBubble: 'bg-slate-50/90 text-slate-900 shadow-[0_24px_48px_-28px_rgba(71,85,105,0.75)]',
  },
  philosopher: {
    id: 'philosopher',
    label: 'الباندا الفيلسوف المعماري',
    endpoint: '/api/chat',
    title: 'الباندا الفيلسوف المعماري',
    description: 'مراقب معماري ومشرف على جميع الباندات. يفكر في الصورة الكبيرة والتنسيق بين الأنظمة.',
    placeholder: 'ما هو القرار المعماري الذي تحتاج مراجعة شاملة له؟',
    loadingText: 'الباندا الفيلسوف يفكر في المعمارية والتنسيق...',
    openingMessage: 'مرحباً، أنا الباندا الفيلسوف المعماري. سأساعدك في التفكير المعماري طويل الأمد.',
    headerGradient: 'bg-gradient-to-l from-indigo-600 via-purple-500 to-indigo-500',
    assistantBubble: 'bg-indigo-50/90 text-indigo-900 shadow-[0_24px_48px_-28px_rgba(99,102,241,0.75)]',
  },
};

// Props interface moved to types file

/**
 * Founder Chat Panel - Central chat interface with selected assistant
 * 
 * Features:
 * - Chat messages display
 * - Input field with voice input
 * - Send button
 * - Loading states
 */
export default function FounderChatPanel({ assistantId, currentMode: externalMode }: FounderChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentMode, setCurrentMode] = useState<FounderOperatingMode>(externalMode || 'STRATEGY_MODE');
  const [sessions, setSessions] = useState<FounderSession[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const assistant = assistantsMap[assistantId as AssistantId] || null;

  // LocalStorage key for chat history (founder-only)
  const storageKey = assistantId === 'founder' 
    ? 'founder_panda_history' // Dedicated key for founder panda
    : `founder_panda_history_${assistantId}`;

  // Operating mode configurations
  const modeConfigs: Record<FounderOperatingMode, ModeConfig> = {
    STRATEGY_MODE: { label: 'استراتيجي', icon: '🎯', color: 'bg-blue-500' },
    PRODUCT_MODE: { label: 'منتج', icon: '🛠️', color: 'bg-green-500' },
    TECH_MODE: { label: 'تقني', icon: '💻', color: 'bg-purple-500' },
    MARKETING_MODE: { label: 'تسويق', icon: '📢', color: 'bg-orange-500' },
    CHINA_MODE: { label: 'الصين', icon: '🇨🇳', color: 'bg-red-500' }
  };

  // Slash commands
  const slashCommands: SlashCommand[] = [
    { command: '/plan', label: 'خطة تنفيذية', description: 'إنشاء خطة تنفيذية مفصلة' },
    { command: '/tasks', label: 'قائمة مهام', description: 'توليد قائمة مهام قابلة للتنفيذ' },
    { command: '/risks', label: 'تحليل المخاطر', description: 'تحليل المخاطر واستراتيجيات التخفيف' },
    { command: '/roadmap', label: 'خريطة طريق', description: 'خريطة طريق لـ 1-3 أشهر' },
    { command: '/script', label: 'نص تسويقي', description: 'كتابة نص تسويقي أو محتوى' },
    { command: '/email', label: 'بريد مهني', description: 'صياغة بريد إلكتروني مهني' }
  ];

  // Load chat history from localStorage
  const loadChatHistory = useCallback(() => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate the structure
        if (Array.isArray(parsed)) {
          return parsed.filter((msg: any) => 
            msg && typeof msg.id === 'string' && typeof msg.text === 'string'
          );
        }
      }
    } catch (error) {
      console.warn('[FounderChatPanel] Failed to load chat history:', error);
    }
    return [];
  }, [storageKey]);

  // Save chat history to localStorage
  const saveChatHistory = useCallback((messages: ChatMessage[]) => {
    if (typeof window === 'undefined') return;
    
    try {
      // Only save last 50 messages to avoid localStorage size limits
      const messagesToSave = messages.slice(-50);
      localStorage.setItem(storageKey, JSON.stringify(messagesToSave));
    } catch (error) {
      console.warn('[FounderChatPanel] Failed to save chat history:', error);
    }
  }, [storageKey]);

  // Clear chat history
  const clearChatHistory = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(storageKey);
      // Reset to opening message only
      if (assistant) {
        const openingMessage: ChatMessage = {
          id: `${assistantId}-opening-${Date.now()}`,
          role: 'assistant',
          text: assistant.openingMessage,
          createdAt: new Date().toISOString(),
        };
        setMessages([openingMessage]);
      }
    } catch (error) {
      console.warn('[FounderChatPanel] Failed to clear chat history:', error);
    }
  }, [storageKey, assistant, assistantId]);

  // Save session summary
  const saveSessionSummary = useCallback(async () => {
    if (assistantId !== 'founder' || !sessionSummary) return;
    
    try {
      const apiBaseUrl = getApiBaseUrl();
      const recentMessages = messages.slice(-10); // Last 10 messages
      const title = `Session ${new Date().toLocaleDateString('ar-SA')}`;
      
      await apiCall(`${apiBaseUrl}/founder/sessions`, {
        method: 'POST',
        body: JSON.stringify({
          title,
          summary: sessionSummary,
          mode: currentMode,
          tasks: [] // Could extract tasks from conversation
        }),
      });
      
      setSessionSummary('');
      loadSessions(); // Refresh sessions list
    } catch (error) {
      console.error('[FounderChatPanel] Failed to save session:', error);
    }
  }, [assistantId, sessionSummary, messages, currentMode, loadSessions]);

  // Initialize messages with chat history or opening message
  useEffect(() => {
    if (assistant) {
      const history = loadChatHistory();
      if (history.length > 0) {
        setMessages(history);
      } else {
        // No history, start with opening message
        const openingMessage: ChatMessage = {
          id: `${assistantId}-opening-${Date.now()}`,
          role: 'assistant',
          text: assistant.openingMessage,
          createdAt: new Date().toISOString(),
        };
        setMessages([openingMessage]);
      }
    }
  }, [assistantId, assistant, loadChatHistory]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages, saveChatHistory]);

  // Load recent sessions for founder panda
  const loadSessions = useCallback(async () => {
    if (assistantId !== 'founder') return;
    
    try {
      const apiBaseUrl = getApiBaseUrl();
      const data = await apiCall(`${apiBaseUrl}/founder/sessions?limit=5`, {
        method: 'GET',
      });
      
      if (data.success) {
        setSessions(data.data.sessions);
      }
    } catch (error) {
      console.warn('[FounderChatPanel] Failed to load sessions:', error);
    }
  }, [assistantId]);

  // Load sessions on mount for founder panda
  useEffect(() => {
    if (assistantId === 'founder') {
      loadSessions();
    }
  }, [assistantId, loadSessions]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
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
        if (transcript.trim()) {
          setDraft(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors
        }
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('ميزة التعرف على الصوت غير مدعومة في متصفحك. يرجى استخدام Chrome أو Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        alert('خطأ في بدء التسجيل الصوتي. تأكد من السماح بالوصول إلى الميكروفون.');
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }

    if (!assistant) return;

    const textToSend = draft.trim();
    if (!textToSend || loading) return;

    const founderMessage: ChatMessage = {
      id: `${assistantId}-founder-${Date.now()}`,
      role: 'founder',
      text: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, founderMessage]);
    setDraft('');
    setLoading(true);

    try {
      const apiBaseUrl = getApiBaseUrl();
      
      // Use special Founder Panda endpoint for founder assistant
      if (assistantId === 'founder') {
        // Detect slash command
        const slashCommand = slashCommands.find(cmd => textToSend.startsWith(cmd.command));
        
        const data = await apiCall(`${apiBaseUrl}/ai/founder`, {
          method: 'POST',
          body: JSON.stringify({
            message: textToSend,
            context: {
              timestamp: new Date().toISOString(),
              assistantId: 'founder'
            },
            mode: currentMode,
            slashCommand: slashCommand?.command
          }),
        });

        const assistantMessage: ChatMessage = {
          id: `${assistantId}-assistant-${Date.now()}`,
          role: 'assistant',
          text: data.data?.response || data.response || 'عذراً، لم أتمكن من توليد رد.',
          createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        // Handle session summary if provided
        if (data.data?.sessionSummary) {
          setSessionSummary(data.data.sessionSummary);
        }
      } else {
        // Use regular assistant endpoint for other assistants
        const data = await apiCall(`${apiBaseUrl}/ai/assistant`, {
          method: 'POST',
          body: JSON.stringify({
            assistant: assistantId,
            message: textToSend,
          }),
        });

        const assistantMessage: ChatMessage = {
          id: `${assistantId}-assistant-${Date.now()}`,
          role: 'assistant',
          text: data.reply || data.response || 'عذراً، لم أتمكن من توليد رد.',
          createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error: unknown) {
      console.error('[FounderChatPanel] Error:', error);
      
      // Enhanced error handling with better typing
      let userFriendlyMessage = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
      
      if (error instanceof Error) {
        userFriendlyMessage = handleApiError(error);
      } else if (typeof error === 'string') {
        userFriendlyMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        userFriendlyMessage = handleApiError(error as Error);
      }
      
      const errorMessage: ChatMessage = {
        id: `${assistantId}-error-${Date.now()}`,
        role: 'assistant',
        text: `❌ ${userFriendlyMessage}`,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (!assistant) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <span className="text-6xl mb-4 block" aria-hidden="true">🐼</span>
          <p className="text-gray-600">مساعد غير صالح</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col min-h-[600px]">
      {/* Header */}
      <div className={`${assistant.headerGradient} p-6 rounded-t-2xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-3xl" aria-hidden="true">
              {assistantId === 'founder' && '🐼'}
              {assistantId === 'tech' && '💻'}
              {assistantId === 'guard' && '🛡️'}
              {assistantId === 'commerce' && '📊'}
              {assistantId === 'content' && '✍️'}
              {assistantId === 'logistics' && '📦'}
              {assistantId === 'philosopher' && '🎓'}
            </span>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {assistant.title}
                {assistantId === 'founder' && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded ml-2">
                    v2.0
                  </span>
                )}
              </h2>
              <p className="text-sm text-white/90">
                {assistant.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Sessions Button (Founder only) */}
            {assistantId === 'founder' && (
              <button
                onClick={() => setShowSessions(!showSessions)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                title="الجلسات المحفوظة"
                disabled={loading}
              >
                <span className="text-lg">📚</span>
              </button>
            )}
            
            {/* Clear Chat Button */}
            <button
              onClick={clearChatHistory}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              title="مسح المحادثة"
              disabled={loading}
            >
              <span className="text-lg">🗑️</span>
            </button>
          </div>
        </div>
        
        {/* Operating Mode Selector (Founder only) */}
        {assistantId === 'founder' && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(modeConfigs).map(([mode, config]) => (
              <button
                key={mode}
                onClick={() => setCurrentMode(mode as FounderOperatingMode)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  currentMode === mode
                    ? 'bg-white text-gray-900'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {config.icon} {config.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'founder' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'founder'
                  ? 'bg-primary-600 text-white'
                  : `${assistant.assistantBubble}`
              }`}
            >
              <p className="text-sm whitespace-pre-wrap" dir="rtl">
                {message.text}
              </p>
              <p className={`text-xs mt-2 ${message.role === 'founder' ? 'text-white/70' : 'text-gray-600'}`}>
                {new Date(message.createdAt).toLocaleTimeString('ar-SA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${assistant.assistantBubble}`}>
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <p className="text-sm text-gray-600">{assistant.loadingText}</p>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Sessions Panel (Founder only) */}
      {assistantId === 'founder' && showSessions && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">الجلسات الأخيرة</h3>
            {sessionSummary && (
              <button
                onClick={saveSessionSummary}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                حفظ الجلسة
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="text-xs bg-white p-2 rounded border cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    // Could implement session loading here
                    console.log('Load session:', session.id);
                  }}
                >
                  <div className="font-medium">{session.title}</div>
                  <div className="text-gray-600 truncate">{session.summary}</div>
                  <div className="text-gray-400 mt-1">
                    {new Date(session.createdAt).toLocaleDateString('ar-SA')}
                    {session.mode && (
                      <span className="ml-2 px-1 bg-gray-200 rounded text-xs">
                        {modeConfigs[session.mode as FounderOperatingMode]?.label}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">لا توجد جلسات محفوظة</p>
            )}
          </div>
        </div>
      )}

      {/* Slash Commands (Founder only) */}
      {assistantId === 'founder' && draft.startsWith('/') && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">الأوامر السريعة</h3>
          <div className="grid grid-cols-2 gap-2">
            {slashCommands
              .filter(cmd => cmd.command.startsWith(draft) || draft === '/')
              .map((cmd) => (
                <button
                  key={cmd.command}
                  onClick={() => setDraft(cmd.command + ' ')}
                  className="text-left p-2 bg-white rounded border hover:bg-gray-50 text-xs"
                >
                  <div className="font-medium">{cmd.command}</div>
                  <div className="text-gray-600">{cmd.description}</div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-6 border-t border-gray-200 bg-white rounded-b-2xl">
        <div className="relative">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={isListening ? 'جاري الاستماع... تحدث الآن' : assistant.placeholder}
            className="w-full min-h-[100px] resize-none rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-3 pr-14 text-sm text-gray-900 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 transition-colors"
            disabled={loading || isListening}
            dir="rtl"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          {/* Voice Input Button */}
          {recognitionRef.current && (
            <button
              type="button"
              onClick={toggleListening}
              className={`absolute left-3 top-3 p-2 rounded-lg transition ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title={isListening ? 'إيقاف الاستماع' : 'بدء التحدث'}
              disabled={loading}
            >
              <span className="text-xl">{isListening ? '🔴' : '🎤'}</span>
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">
            سيتم توليد رد من {assistant.label}
          </p>
          <button
            type="submit"
            className={`${assistant.headerGradient} text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={loading || isListening || !draft.trim()}
          >
            {loading ? 'جاري المعالجة...' : 'إرسال'}
          </button>
        </div>
      </form>
    </div>
  );
}

