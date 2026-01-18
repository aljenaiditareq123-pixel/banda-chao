import { notFound } from 'next/navigation';
import InboxPageClient from './page-client';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    conversation?: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export const metadata = {
  title: 'Messages - Banda Chao',
  description: 'Your conversations inbox',
};

export default async function InboxPage({ params, searchParams }: PageProps) {
  let locale: string;
  let conversationId: string | undefined;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
    
    const resolvedSearchParams = await searchParams;
    conversationId = resolvedSearchParams.conversation;
  } catch (error) {
    console.error('Error resolving params:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <InboxPageClient locale={locale} initialConversationId={conversationId} />;
}
