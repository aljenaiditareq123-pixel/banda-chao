'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChatAgent, AgentMessage, AgentResponse } from '@/lib/ai/agents';
import { EnhancedVoiceManager, defaultArabicVoice } from '@/lib/ai/voice';

export default function AIChatPage() {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      role: 'assistant',
      content: '👋 مرحباً! أنا Chat AI - مساعدك الشخصي للمشروع 😊\n\n🎤 اضغط على زر الميكروفون للتحدث معي مباشرة!\n\nيمكنني مساعدتك في:\n• حالة المشروع\n• نصائح يومية\n• استراتيجيات الانتشار\n• طرق تحقيق الدخل\n• أي شيء آخر!\n\nتحدث معي مباشرة! 🎤',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const voiceManagerRef = useRef<EnhancedVoiceManager | null>(null);
  const chatAgent = useRef(new ChatAgent()).current;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Voice Manager with saved settings
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Load saved settings
      const saved = localStorage.getItem('voiceSettings');
      let settings = defaultArabicVoice;
      
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          settings = {
            ...defaultArabicVoice,
            lang: parsed.lang || defaultArabicVoice.lang,
            rate: parsed.rate || defaultArabicVoice.rate,
            pitch: parsed.pitch || defaultArabicVoice.pitch,
            volume: parsed.volume || defaultArabicVoice.volume,
          };
        } catch (e) {
          console.error('Error loading voice settings:', e);
        }
      }

      voiceManagerRef.current = new EnhancedVoiceManager(settings);
      voiceManagerRef.current.setCallbacks({
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    }

    return () => {
      if (voiceManagerRef.current) {
        voiceManagerRef.current.stop();
      }
    };
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'ar-SA'; // Arabic, can also use 'en-US' or 'zh-CN'

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
          // Auto send after recognition
          setTimeout(() => {
            handleSendMessage(transcript);
          }, 500);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'no-speech') {
            alert('لم أسمع أي صوت. يرجى المحاولة مرة أخرى.');
          } else if (event.error === 'not-allowed') {
            alert('يرجى السماح بالوصول إلى الميكروفون.');
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
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setInput('');
      } catch (error) {
        console.error('Error starting recognition:', error);
        alert('خطأ في بدء التسجيل الصوتي. تأكد من السماح بالوصول إلى الميكروفون.');
      }
    } else {
      alert('ميزة التعرف على الصوت غير مدعومة في متصفحك. يرجى استخدام Chrome أو Edge.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: AgentMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response: AgentResponse = await chatAgent.process(textToSend);
      
      const assistantMessage: AgentMessage = {
        role: 'assistant',
        content: formatResponse(response),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the response with enhanced voice
      if (voiceManagerRef.current) {
        voiceManagerRef.current.speak(assistantMessage.content, true);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: AgentMessage = {
        role: 'assistant',
        content: '❌ عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    handleSendMessage();
  };

  const stopSpeaking = () => {
    if (voiceManagerRef.current) {
      voiceManagerRef.current.stop();
    }
  };

  const formatResponse = (response: AgentResponse): string => {
    let content = response.message + '\n\n';
    
    if (response.suggestions && response.suggestions.length > 0) {
      content += response.suggestions.map(s => `• ${s}`).join('\n');
    }

    if (response.actions && response.actions.length > 0) {
      content += '\n\n📋 الإجراءات المقترحة:\n';
      content += response.actions.map((a, i) => 
        `${i + 1}. ${a.description} (${a.priority === 'high' ? 'عالي' : a.priority === 'medium' ? 'متوسط' : 'منخفض'})`
      ).join('\n');
    }

    return content;
  };

  const quickQuestions = [
    'ما حالة المشروع؟',
    'نصيحتك لي اليوم',
    'كيف أنشر المشروع في الصين؟',
    'كيف أحقق دخل من الموقع؟',
    'ما أهم 3 أشياء يجب فعلها الآن؟'
  ];

  const isSpeechSupported = typeof window !== 'undefined' && 
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🤖 Chat AI - مساعدك الشخصي</h1>
            <p className="text-gray-600 text-sm mt-1">
              {chatAgent.getStatus()} • {isSpeechSupported ? '🎤 يمكنك التحدث مباشرة!' : '⚠️ التحدث المباشر غير مدعوم - استخدم Chrome أو Edge'}
            </p>
          </div>
          <Link
            href="/ai/voice-settings"
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            🎚️ إعدادات الصوت
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-red-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.timestamp && (
                  <div className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-red-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  <span className="text-gray-600">جاري التفكير...</span>
                </div>
              </div>
            </div>
          )}
          {isListening && (
            <div className="flex justify-end">
              <div className="bg-red-600 text-white rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse w-3 h-3 bg-white rounded-full"></div>
                  <span>🎤 أستمع إليك... تحدث الآن</span>
                </div>
              </div>
            </div>
          )}
          {speaking && (
            <div className="flex justify-start">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-green-700">🔊 جاري التحدث...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Questions */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto mb-2">
          <p className="text-sm text-gray-600 mb-2">💡 أسئلة سريعة:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(q);
                  handleSendMessage(q);
                }}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex space-x-2">
          {/* Voice Button */}
          {isSpeechSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={speaking}
              className={`px-4 py-3 rounded-lg transition ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : speaking
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={isListening ? 'اضغط لإيقاف التسجيل' : speaking ? 'انتظر حتى ينتهي AI من التحدث' : 'اضغط للتحدث'}
            >
              {isListening ? (
                <span className="text-xl">🛑</span>
              ) : (
                <span className="text-xl">🎤</span>
              )}
            </button>
          )}

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isSpeechSupported ? "اكتب أو اضغط 🎤 للتحدث..." : "اكتب سؤالك هنا... (اضغط Enter للإرسال)"}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            disabled={loading || isListening}
          />

          {/* Send/Stop Speaking Button */}
          {speaking ? (
            <button
              onClick={stopSpeaking}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
              title="إيقاف التحدث"
            >
              <span className="animate-pulse">🔊</span>
              <span>إيقاف</span>
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={loading || !input.trim() || isListening || speaking}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'جاري...' : 'إرسال'}
            </button>
          )}
        </div>

        {/* Instructions */}
        {isSpeechSupported && (
          <div className="max-w-4xl mx-auto mt-2">
            <p className="text-xs text-gray-500 text-center">
              💡 اضغط على 🎤 للتحدث مباشرة - يمكنك التحدث بالعربية أو الإنجليزية
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
