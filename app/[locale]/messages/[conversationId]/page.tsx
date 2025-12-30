import { notFound } from 'next/navigation';
import ChatPageClient from './page-client';
import axios from 'axios';

interface PageProps {
  params: Promise<{
    locale: string;
    conversationId: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function ChatPage({ params }: PageProps) {
  let locale: string;
  let conversationId: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
    conversationId = resolvedParams.conversationId;
  } catch (error) {
    console.error('Error resolving params in chat page:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  // Fetch conversation and messages
  let conversation: any = null;
  let messages: any[] = [];
  let currentUserId: string = '';

  try {
    // Use centralized API URL utility (imported dynamically to avoid SSR issues)
    const { getApiUrl } = await import('@/lib/api-utils');
    const API_URL = getApiUrl();
    // Note: In production, get token from server-side session
    // For now, this is a placeholder - client will handle auth
    const [conversationRes, messagesRes] = await Promise.all([
      axios.get(`${API_URL}/conversations/${conversationId}/messages`).catch(() => ({ data: { messages: [] } })),
      axios.get(`${API_URL}/conversations/${conversationId}/messages`).catch(() => ({ data: { messages: [] } })),
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



