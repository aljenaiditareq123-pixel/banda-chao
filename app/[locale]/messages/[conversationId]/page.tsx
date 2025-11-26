import { notFound } from 'next/navigation';
import ChatPageClient from './page-client';
import axios from 'axios';

interface PageProps {
  params: {
    locale: string;
    conversationId: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default async function ChatPage({ params }: PageProps) {
  const { locale, conversationId } = params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  // Fetch conversation and messages
  let conversation: any = null;
  let messages: any[] = [];
  let currentUserId: string = '';

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    // Note: In production, get token from server-side session
    // For now, this is a placeholder - client will handle auth
    const [conversationRes, messagesRes] = await Promise.all([
      axios.get(`${API_URL}/api/v1/conversations/${conversationId}/messages`).catch(() => ({ data: { messages: [] } })),
      axios.get(`${API_URL}/api/v1/conversations/${conversationId}/messages`).catch(() => ({ data: { messages: [] } })),
    ]);

    messages = messagesRes.data.messages || [];
  } catch (error) {
    console.error('Error fetching conversation:', error);
  }

  return (
    <ChatPageClient
      locale={locale}
      conversationId={conversationId}
      initialMessages={messages}
    />
  );
}



