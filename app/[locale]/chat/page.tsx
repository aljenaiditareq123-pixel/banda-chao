import { notFound } from 'next/navigation';
import AIChat from '@/components/AIChat';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function ChatPage({ params }: PageProps) {
  let locale: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params in chat page:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return (
    <div className="h-screen w-full">
      <AIChat className="h-full" />
    </div>
  );
}



