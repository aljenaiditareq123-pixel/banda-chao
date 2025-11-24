'use client';

import { useState, useEffect } from 'react';
import ChatBox from '@/components/messaging/ChatBox';
import { useAuth } from '@/hooks/useAuth';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

interface ChatPageClientProps {
  locale: string;
  conversationId: string;
  initialMessages?: any[];
}

export default function ChatPageClient({ locale, conversationId, initialMessages = [] }: ChatPageClientProps) {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState(initialMessages);

  useEffect(() => {
    // Fetch messages if not provided
    if (initialMessages.length === 0) {
      fetchMessages();
    }
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/v1/conversations/${conversationId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <LoadingState fullScreen />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <ErrorState message="يجب تسجيل الدخول لاستخدام المراسلة" fullScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {locale === 'ar' ? 'المحادثة' : locale === 'zh' ? '对话' : 'Conversation'}
        </h1>
        <div className="h-[600px]">
          <ChatBox
            conversationId={conversationId}
            currentUserId={user.id}
            initialMessages={messages}
          />
        </div>
      </div>
    </div>
  );
}

