'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { messagesAPI } from '@/lib/api';
import { connectSocket, socketHelpers, disconnectSocket } from '@/lib/socket';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  sender: {
    id: string;
    name: string | null;
    profilePicture: string | null;
  };
  receiver: {
    id: string;
    name: string | null;
    profilePicture: string | null;
  };
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userProfilePicture: string | null;
  lastMessage: string;
  lastMessageTime: string;
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatContent />
    </ProtectedRoute>
  );
}

function ChatContent() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!token || !user) return;

    // Connect to WebSocket
    const socket = connectSocket(token);

    // Listen for new messages
    socketHelpers.onMessage((message: Message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    // Listen for typing indicator
    socketHelpers.onUserTyping((data) => {
      setIsTyping(data.isTyping);
    });

    // Load conversations
    loadConversations();

    return () => {
      disconnectSocket();
    };
  }, [token, user]);

  useEffect(() => {
    if (selectedConversation && user) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await messagesAPI.getConversations();
      // Transform response to conversations format
      const transformed = response.data.map((msg: Message) => ({
        id: msg.receiverId === user?.id ? msg.senderId : msg.receiverId,
        userId: msg.receiverId === user?.id ? msg.senderId : msg.receiverId,
        userName: msg.receiverId === user?.id ? msg.sender.name : msg.receiver.name,
        userProfilePicture: msg.receiverId === user?.id ? msg.sender.profilePicture : msg.receiver.profilePicture,
        lastMessage: msg.content,
        lastMessageTime: msg.timestamp,
      }));
      setConversations(transformed);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    if (!user) return;

    try {
      const response = await messagesAPI.getChatHistory(user.id, otherUserId);
      setMessages(response.data);

      // Join chat room for WebSocket
      socketHelpers.joinChat(otherUserId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation || !user) return;

    const content = messageInput.trim();
    setMessageInput('');
    setSending(true);

    try {
      // Send message via API (will also trigger WebSocket)
      await messagesAPI.sendMessage({
        receiverId: selectedConversation,
        content,
      });

      // Message will be added via WebSocket event
    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert('فشل إرسال الرسالة: ' + (error.response?.data?.error || error.message));
      setMessageInput(content); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (typing: boolean) => {
    if (!selectedConversation) return;
    socketHelpers.setTyping(selectedConversation, typing);
  };

  const selectedConversationData = conversations.find(
    (conv) => conv.userId === selectedConversation
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 text-center md:text-right">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            {t('chat') || 'المحادثات'}
          </h1>
          <p className="text-lg text-gray-600">
            {t('chatSubtitle') || 'تواصل مع أعضاء المجتمع'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row h-[calc(100vh-16rem)] lg:h-[calc(100vh-20rem)]">
            {/* Conversations Sidebar */}
            <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
              <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {t('conversations') || 'المحادثات'}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">{t('loading') || 'جاري التحميل...'}</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="text-5xl mb-4">💬</div>
                    <p className="text-gray-500 font-medium">
                      {t('noConversations') || 'لا توجد محادثات بعد'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.userId)}
                        className={`w-full p-4 text-right hover:bg-gray-50 transition-colors ${
                          selectedConversation === conversation.userId ? 'bg-primary-50 border-r-4 border-primary-600' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {conversation.userProfilePicture ? (
                              <img
                                src={conversation.userProfilePicture}
                                alt={conversation.userName || 'User'}
                                className="w-12 h-12 rounded-full border-2 border-primary-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-lg">
                                {(conversation.userName || 'U')[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-right">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {conversation.userName || t('user') || 'مستخدم'}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {conversation.lastMessage}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(conversation.lastMessageTime).toLocaleDateString('ar-SA', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 md:p-6 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-4">
                      {selectedConversationData?.userProfilePicture ? (
                        <img
                          src={selectedConversationData.userProfilePicture}
                          alt={selectedConversationData.userName || 'User'}
                          className="w-12 h-12 rounded-full border-2 border-primary-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-lg">
                          {(selectedConversationData?.userName || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-lg">
                          {selectedConversationData?.userName || t('user') || 'مستخدم'}
                        </p>
                        {isTyping && (
                          <p className="text-sm text-primary-600 flex items-center gap-1">
                            <span className="inline-block animate-pulse">●</span>
                            <span>{t('typing') || 'يكتب...'}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500">{t('noMessages') || 'لا توجد رسائل بعد. ابدأ المحادثة!'}</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isOwn = message.senderId === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                                isOwn
                                  ? 'bg-primary-600 text-white rounded-br-none'
                                  : 'bg-white text-gray-900 border-2 border-gray-200 rounded-bl-none'
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <p
                                className={`text-xs mt-2 ${
                                  isOwn ? 'text-primary-100' : 'text-gray-500'
                                }`}
                              >
                                {new Date(message.timestamp).toLocaleTimeString('ar-SA', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 md:p-6 border-t border-gray-200 bg-white">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => {
                          setMessageInput(e.target.value);
                          handleTyping(true);
                        }}
                        onBlur={() => handleTyping(false)}
                        placeholder={t('typeMessage') || 'اكتب رسالة...'}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={!messageInput.trim() || sending}
                        className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold shadow-lg"
                      >
                        {sending ? (
                          <>
                            <span className="inline-block animate-spin mr-2">⏳</span>
                            {t('sending') || 'جاري الإرسال...'}
                          </>
                        ) : (
                          <>
                            <span className="mr-2">📤</span>
                            {t('send') || 'إرسال'}
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-xl font-semibold text-gray-700 mb-2">
                      {t('selectConversation') || 'اختر محادثة للبدء'}
                    </p>
                    <p className="text-gray-500">
                      {t('selectConversationDescription') || 'اختر محادثة من القائمة الجانبية لبدء المحادثة'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


