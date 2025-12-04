'use client';

import { useState, useEffect, useRef } from 'react';
import { FounderKPIs } from '@/types/founder';
import { useFounderKpis } from '@/hooks/useFounderKpis';
import axios from 'axios';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FounderChatPanelProps {
  user: { id: string; email: string; name: string; role: string } | null;
  loading: boolean;
}

export default function FounderChatPanel({ user, loading: authLoading }: FounderChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { kpis, loading: kpisLoading } = useFounderKpis();
  
  // Check if speech recognition is supported
  const speechSupported = typeof window !== 'undefined' && 
    typeof navigator !== 'undefined' && 
    typeof navigator.mediaDevices !== 'undefined' && 
    typeof navigator.mediaDevices.getUserMedia !== 'undefined';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show welcome message when component mounts and user is authenticated
  useEffect(() => {
    if (!authLoading && user && user.role === 'FOUNDER' && messages.length === 0 && !kpisLoading) {
      const welcomeMessage = generateWelcomeMessage(kpis);
      setMessages([welcomeMessage]);
      setIsFirstMessage(true);
    }
  }, [authLoading, user, kpis, kpisLoading, messages.length]);

  const generateWelcomeMessage = (kpisData: FounderKPIs | null): ChatMessage => {
    let content = 'مرحباً بك، المؤسس! 👋\n\n';
    
    if (kpisData) {
      content += 'هذه هي مؤشرات الأداء الحالية لمنصة Banda Chao:\n\n';
      content += `• إجمالي الحرفيين: ${kpisData.totalArtisans.toLocaleString('ar-EG')}\n`;
      content += `• إجمالي المنتجات: ${kpisData.totalProducts.toLocaleString('ar-EG')}\n`;
      content += `• إجمالي الفيديوهات: ${kpisData.totalVideos.toLocaleString('ar-EG')}\n`;
      content += `• إجمالي الطلبات: ${kpisData.totalOrders.toLocaleString('ar-EG')}\n`;
      content += `• إجمالي المستخدمين: ${kpisData.totalUsers.toLocaleString('ar-EG')}\n`;
      content += `• حرفيون جدد هذا الأسبوع: ${kpisData.newArtisansThisWeek.toLocaleString('ar-EG')}\n`;
      content += `• طلبات جديدة هذا الأسبوع: ${kpisData.newOrdersThisWeek.toLocaleString('ar-EG')}\n\n`;
    }

    content += 'كيف يمكنني مساعدتك اليوم؟ يمكنك اختيار أحد الإجراءات السريعة أدناه أو طرح سؤالك مباشرة.';

    return {
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
  };

  const handleQuickAction = async (action: string) => {
    const actionMessages: Record<string, string> = {
      analyze: 'حلل أداء الحرفيين هذا الأسبوع',
      insights: 'أعطني أهم ٣ ملاحظات من مؤشرات الأداء',
      priorities: 'اقترح عليّ أولويتين للعمل اليوم',
    };

    const messageText = actionMessages[action] || action;
    await handleSendMessage(messageText);
  };

  const formatKPIsForAI = (kpisData: FounderKPIs | null): string => {
    if (!kpisData) return '';
    
    return `هذه هي مؤشرات الأداء الحالية لمنصة Banda Chao:

إجمالي الحرفيين: ${kpisData.totalArtisans}
إجمالي المنتجات: ${kpisData.totalProducts}
إجمالي الفيديوهات: ${kpisData.totalVideos}
إجمالي الطلبات: ${kpisData.totalOrders}
إجمالي المستخدمين: ${kpisData.totalUsers}
حرفيون جدد هذا الأسبوع: ${kpisData.newArtisansThisWeek}
طلبات جديدة هذا الأسبوع: ${kpisData.newOrdersThisWeek}

`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAndSend(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error: any) {
      console.error('Error starting recording:', error);
      const errorMessage: ChatMessage = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: `عذراً، لا يمكن الوصول إلى الميكروفون: ${error.message}. يرجى التحقق من صلاحيات الميكروفون.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAndSend = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('languageCode', 'ar-SA');

      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) {
        throw new Error('No authentication token');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://banda-chao.onrender.com';
      const response = await fetch(`${apiUrl}/api/v1/speech/transcribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to transcribe audio');
      }

      const data = await response.json();
      const transcript = data.transcript;

      if (transcript && transcript.trim()) {
        // Set transcribed text in input and send
        setInputValue(transcript);
        await handleSendMessage(transcript);
      } else {
        const errorMessage: ChatMessage = {
          id: 'error-' + Date.now(),
          role: 'assistant',
          content: 'عذراً، لم يتم التعرف على الكلام. يرجى المحاولة مرة أخرى.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error: any) {
      console.error('Error transcribing audio:', error);
      const errorMessage: ChatMessage = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: `عذراً، حدث خطأ أثناء تحويل الصوت إلى نص: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepend KPIs to first message only
      let fullMessage = text;
      if (isFirstMessage && kpis) {
        fullMessage = formatKPIsForAI(kpis) + text;
        setIsFirstMessage(false);
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) {
        throw new Error('No authentication token');
      }

      // Use AI API endpoint
      const { aiAPI } = await import('@/lib/api');
      const response = await aiAPI.assistant({
        assistant: 'consultant',
        message: fullMessage,
      });

      const assistantMessage: ChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: response.response || response.message || 'لم أتمكن من الحصول على رد.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء إرسال الرسالة';
      const errorChatMessage: ChatMessage = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: `عذراً، حدث خطأ: ${errorMessage}. يرجى المحاولة مرة أخرى.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D32] mb-4"></div>
          <p className="text-gray-600" dir="rtl">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  // Not logged in or not founder
  if (!user || user.role !== 'FOUNDER') {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center max-w-md px-4">
          <div className="mb-4">
            <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2" dir="rtl">هذه المساحة مخصصة للمؤسس فقط</h3>
          <p className="text-gray-600 mb-4" dir="rtl">الرجاء تسجيل الدخول بحساب المؤسس للوصول إلى هذه الصفحة.</p>
        </div>
      </div>
    );
  }

  // Show chat UI
  return (
    <div className="flex flex-col h-full bg-white" dir="rtl">
      {/* Chat Header */}
      <div className="border-b border-gray-200 px-6 py-4 bg-[#2E7D32] text-white">
        <h2 className="text-xl font-semibold">مساعد Consultant Panda</h2>
        <p className="text-sm text-green-100">مساعدك الذكي لإدارة المنصة</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-[#2E7D32] text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.timestamp).toLocaleTimeString('ar-EG', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Quick Actions (show only if no messages or just welcome message) */}
        {messages.length <= 1 && !isLoading && (
          <div className="space-y-2 pt-4">
            <p className="text-sm text-gray-600 mb-3">إجراءات سريعة:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickAction('analyze')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                حلل أداء الحرفيين هذا الأسبوع
              </button>
              <button
                onClick={() => handleQuickAction('insights')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                أعطني أهم ٣ ملاحظات من مؤشرات الأداء
              </button>
              <button
                onClick={() => handleQuickAction('priorities')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                اقترح عليّ أولويتين للعمل اليوم
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex space-x-2 space-x-reverse">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent"
            disabled={isLoading || isRecording}
          />
          {speechSupported && (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                isRecording
                  ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title={isRecording ? 'إيقاف التسجيل' : 'بدء التسجيل الصوتي'}
            >
              {isRecording ? '⏹️' : '🎤'}
            </button>
          )}
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputValue.trim() || isRecording}
            className="px-6 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#256628] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            إرسال
          </button>
        </div>
        {isRecording && (
          <div className="mt-2 text-center">
            <p className="text-sm text-red-600 animate-pulse">🎤 جاري التسجيل... اضغط على زر الإيقاف عند الانتهاء</p>
          </div>
        )}
      </div>
    </div>
  );
}

