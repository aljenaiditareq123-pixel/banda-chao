'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { chatAPI } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, Send, ArrowLeft, Package } from 'lucide-react';
import UserNameWithBadge from '@/components/common/UserNameWithBadge';
import Image from 'next/image';

interface Conversation {
  id: string;
  otherParticipant: {
    id: string;
    name: string | null;
    profilePicture: string | null;
    isVerified: boolean;
  };
  product: {
    id: string;
    name: string;
    image_url: string | null;
  } | null;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    senderName: string | null;
    isRead: boolean;
    createdAt: string;
  } | null;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  updatedAt: string;
  createdAt: string;
}

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string | null;
    profilePicture: string | null;
    isVerified: boolean;
  };
  isRead: boolean;
  createdAt: string;
}

interface InboxPageClientProps {
  locale: string;
  initialConversationId?: string;
}

export default function InboxPageClient({ locale, initialConversationId }: InboxPageClientProps) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations (inbox)
  useEffect(() => {
    const fetchInbox = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await chatAPI.getInbox();
        
        if (response.success && response.conversations) {
          setConversations(response.conversations);
          
          // If initialConversationId is provided, select that conversation
          if (initialConversationId) {
            const conv = response.conversations.find((c: Conversation) => c.id === initialConversationId);
            if (conv) {
              setSelectedConversation(conv);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching inbox:', err);
        setError(locale === 'ar' ? 'فشل تحميل المحادثات' : locale === 'zh' ? '加载对话失败' : 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, [user, locale, initialConversationId]);

  // Fetch messages when conversation is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) {
        setMessages([]);
        return;
      }

      try {
        setLoadingMessages(true);
        const response = await chatAPI.getConversation(selectedConversation.id, { limit: 100 });
        
        if (response.success && response.messages) {
          setMessages(response.messages);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(locale === 'ar' ? 'فشل تحميل الرسائل' : locale === 'zh' ? '加载消息失败' : 'Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedConversation, locale]);

  // Auto-refresh inbox every 10 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const response = await chatAPI.getInbox();
      if (response.success && response.conversations) {
        setConversations(response.conversations);
        // Update selected conversation if it exists
        if (selectedConversation) {
          const updatedConv = response.conversations.find((c: Conversation) => c.id === selectedConversation.id);
          if (updatedConv) {
            setSelectedConversation(updatedConv);
          }
        }
      }
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [user, selectedConversation]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || sending) return;

    const content = messageInput.trim();
    setMessageInput('');
    setSending(true);

    try {
      const response = await chatAPI.sendUserMessage({
        conversationId: selectedConversation.id,
        content,
      });

      if (response.success && response.message) {
        // Add message to local state
        setMessages((prev) => [...prev, response.message!]);
        
        // Update last message in conversations list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation.id
              ? {
                  ...conv,
                  lastMessage: {
                    id: response.message!.id,
                    content: response.message!.content,
                    senderId: response.message!.sender.id,
                    senderName: response.message!.sender.name,
                    isRead: false,
                    createdAt: response.message!.createdAt,
                  },
                  lastMessageText: content.substring(0, 100),
                  lastMessageAt: response.message!.createdAt,
                  updatedAt: response.message!.createdAt,
                }
              : conv
          )
        );
      } else {
        setError(response.error || (locale === 'ar' ? 'فشل إرسال الرسالة' : locale === 'zh' ? '发送消息失败' : 'Failed to send message'));
        setMessageInput(content); // Restore message on error
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(locale === 'ar' ? 'فشل إرسال الرسالة' : locale === 'zh' ? '发送消息失败' : 'Failed to send message');
      setMessageInput(content); // Restore message on error
    } finally {
      setSending(false);
      messageInputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return locale === 'ar' ? 'الآن' : locale === 'zh' ? '刚刚' : 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}${locale === 'ar' ? 'د' : locale === 'zh' ? '分钟前' : 'm'}`;
    } else if (diffHours < 24) {
      return `${diffHours}${locale === 'ar' ? 'س' : locale === 'zh' ? '小时前' : 'h'}`;
    } else if (diffDays < 7) {
      return `${diffDays}${locale === 'ar' ? 'يوم' : locale === 'zh' ? '天前' : 'd'}`;
    } else {
      return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : locale === 'zh' ? 'zh-CN' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {locale === 'ar' ? 'يجب تسجيل الدخول لعرض المحادثات' : locale === 'zh' ? '请登录以查看对话' : 'Please log in to view conversations'}
          </p>
          <Link
            href={`/${locale}/login`}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {locale === 'ar' ? 'تسجيل الدخول' : locale === 'zh' ? '登录' : 'Log In'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Conversations List - Left Sidebar */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-primary-600 text-white">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            {locale === 'ar' ? 'الرسائل' : locale === 'zh' ? '消息' : 'Messages'}
          </h1>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              {locale === 'ar' ? 'جاري التحميل...' : locale === 'zh' ? '加载中...' : 'Loading...'}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {locale === 'ar' ? 'لا توجد محادثات' : locale === 'zh' ? '暂无对话' : 'No conversations'}
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => {
                  setSelectedConversation(conv);
                  router.push(`/${locale}/chat/inbox?conversation=${conv.id}`, { scroll: false });
                }}
                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                  selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  {conv.otherParticipant.profilePicture ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      <Image
                        src={conv.otherParticipant.profilePicture}
                        alt={conv.otherParticipant.name || 'User'}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {(conv.otherParticipant.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Name and Time */}
                    <div className="flex items-center justify-between mb-1">
                      <UserNameWithBadge
                        name={conv.otherParticipant.name || 'Unknown'}
                        isVerified={conv.otherParticipant.isVerified}
                        className="font-semibold text-gray-900 truncate"
                        badgeSize={14}
                      />
                      {conv.lastMessageAt && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      )}
                    </div>

                    {/* Last Message Preview */}
                    <p className="text-sm text-gray-600 truncate">
                      {conv.lastMessage
                        ? conv.lastMessage.senderId === user.id
                          ? `${locale === 'ar' ? 'أنت' : locale === 'zh' ? '你' : 'You'}: ${conv.lastMessage.content}`
                          : conv.lastMessage.content
                        : conv.lastMessageText || (locale === 'ar' ? 'لا توجد رسائل' : locale === 'zh' ? '暂无消息' : 'No messages')}
                    </p>

                    {/* Product Info (if exists) */}
                    {conv.product && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Package className="w-3 h-3" />
                        <span className="truncate">{conv.product.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area - Right Side */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
              {selectedConversation.otherParticipant.profilePicture ? (
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  <Image
                    src={selectedConversation.otherParticipant.profilePicture}
                    alt={selectedConversation.otherParticipant.name || 'User'}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                  {(selectedConversation.otherParticipant.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <UserNameWithBadge
                  name={selectedConversation.otherParticipant.name || 'Unknown'}
                  isVerified={selectedConversation.otherParticipant.isVerified}
                  className="font-semibold text-gray-900"
                  badgeSize={16}
                />
                {selectedConversation.product && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    {selectedConversation.product.name}
                  </p>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="text-center text-gray-500 py-8">
                  {locale === 'ar' ? 'جاري تحميل الرسائل...' : locale === 'zh' ? '加载消息中...' : 'Loading messages...'}
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {locale === 'ar' ? 'لا توجد رسائل بعد' : locale === 'zh' ? '暂无消息' : 'No messages yet'}
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender.id === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isOwn
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? 'text-primary-100' : 'text-gray-500'
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString(locale === 'ar' ? 'ar-SA' : locale === 'zh' ? 'zh-CN' : 'en-US', {
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
            <div className="bg-white border-t border-gray-200 p-4">
              {error && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="flex items-end gap-2">
                <textarea
                  ref={messageInputRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    locale === 'ar' ? 'اكتب رسالة...' : locale === 'zh' ? '输入消息...' : 'Type a message...'
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={1}
                  disabled={sending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sending}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">
                {locale === 'ar' ? 'اختر محادثة لعرضها' : locale === 'zh' ? '选择对话查看' : 'Select a conversation to view'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
