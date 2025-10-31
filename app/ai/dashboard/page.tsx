'use client';

import { useState, useEffect } from 'react';
import { getAllAgents, BaseAgent, AgentResponse } from '@/lib/ai/agents';
import Link from 'next/link';
import VoiceInputButton from '@/components/VoiceInputButton';

export default function AIDashboardPage() {
  const [agents, setAgents] = useState<BaseAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<BaseAgent | null>(null);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAgents(getAllAgents());
    setSelectedAgent(getAllAgents()[2]); // Chat Agent by default
  }, []);

  const handleAsk = async () => {
    if (!selectedAgent || !question.trim() || loading) return;

    setLoading(true);
    setResponse(null);

    try {
      const result = await selectedAgent.process(question);
      setResponse(result);
    } catch (error) {
      console.error('Error:', error);
      setResponse({
        message: '❌ حدث خطأ. يرجى المحاولة مرة أخرى.'
      });
    } finally {
      setLoading(false);
    }
  };

  const agentIcons: Record<string, string> = {
    'development': '👨‍💻',
    'marketing': '📈',
    'chat': '💬',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI Agents Dashboard</h1>
          <p className="text-gray-600">لوحة تحكم الوكلاء الذكاء الاصطناعي للمشروع</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agents List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">الوكلاء المتاحون</h2>
              <div className="space-y-3">
                {agents.map((agent, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedAgent(agent);
                      setResponse(null);
                      setQuestion('');
                    }}
                    className={`w-full text-right p-4 rounded-lg border-2 transition ${
                      selectedAgent === agent
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{agentIcons[agent['agentType']] || '🤖'}</span>
                          <h3 className="font-semibold text-gray-900">{agent['name']}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{agent['description']}</p>
                        <p className="text-xs text-gray-500 mt-2">{agent.getStatus()}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">روابط سريعة</h2>
              <div className="space-y-2">
                <Link
                  href="/ai/chat"
                  className="block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-center"
                >
                  💬 الدردشة المباشرة
                </Link>
                <Link
                  href="/"
                  className="block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-center"
                >
                  🏠 الصفحة الرئيسية
                </Link>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {selectedAgent ? (
                <>
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="text-3xl">{agentIcons[selectedAgent['agentType']] || '🤖'}</span>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedAgent['name']}</h2>
                      <p className="text-sm text-gray-600">{selectedAgent.getStatus()}</p>
                    </div>
                  </div>

                  {/* Question Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسأل {selectedAgent['name']}:
                    </label>
                    <div className="flex space-x-2">
                      {/* Voice Button */}
                      {typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) && (
                        <VoiceInputButton
                          onTranscript={(text) => {
                            setQuestion(text);
                            setTimeout(() => handleAsk(), 300);
                          }}
                        />
                      )}
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAsk();
                          }
                        }}
                        placeholder="اكتب أو اضغط 🎤 للتحدث..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        onClick={handleAsk}
                        disabled={loading || !question.trim()}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                      >
                        {loading ? 'جاري...' : 'إرسال'}
                      </button>
                    </div>
                  </div>

                  {/* Response */}
                  {loading && (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      <p className="mt-2 text-gray-600">جاري التفكير...</p>
                    </div>
                  )}

                  {response && !loading && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-3">{response.message}</h3>
                      
                      {response.suggestions && response.suggestions.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700 mb-2">💡 الاقتراحات:</h4>
                          <ul className="list-disc list-inside space-y-1 text-gray-600">
                            {response.suggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {response.actions && response.actions.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">📋 الإجراءات المقترحة:</h4>
                          <div className="space-y-2">
                            {response.actions.map((action, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded-lg border-2 ${
                                  action.priority === 'high'
                                    ? 'border-red-600 bg-red-50'
                                    : action.priority === 'medium'
                                    ? 'border-yellow-500 bg-yellow-50'
                                    : 'border-gray-300 bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-900">{action.description}</span>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    action.priority === 'high'
                                      ? 'bg-red-600 text-white'
                                      : action.priority === 'medium'
                                      ? 'bg-yellow-500 text-white'
                                      : 'bg-gray-300 text-gray-700'
                                  }`}>
                                    {action.priority === 'high' ? 'عالي' : action.priority === 'medium' ? 'متوسط' : 'منخفض'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Questions */}
                  {!response && !loading && (
                    <div className="mt-6">
                      <p className="text-sm text-gray-600 mb-3">💡 أسئلة سريعة:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedAgent['agentType'] === 'development' && (
                          <>
                            <button onClick={() => setQuestion('ما التحسينات الممكنة؟')} className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                              تحسينات؟
                            </button>
                            <button onClick={() => setQuestion('هل هناك أخطاء؟')} className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                              أخطاء؟
                            </button>
                          </>
                        )}
                        {selectedAgent['agentType'] === 'marketing' && (
                          <>
                            <button onClick={() => setQuestion('كيف أنشر المشروع في الصين؟')} className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                              الانتشار في الصين
                            </button>
                            <button onClick={() => setQuestion('كيف أحقق دخل؟')} className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                              تحقيق الدخل
                            </button>
                            <button onClick={() => setQuestion('WeChat')} className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                              WeChat
                            </button>
                          </>
                        )}
                        {selectedAgent['agentType'] === 'chat' && (
                          <>
                            <button onClick={() => setQuestion('ما حالة المشروع؟')} className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                              حالة المشروع
                            </button>
                            <button onClick={() => setQuestion('نصيحتك لي اليوم')} className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                              نصيحة اليوم
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  اختر وكيلاً للبدء
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

