import { notFound } from 'next/navigation';
import CheckoutSuccessClient from './page-client';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: {
    session_id?: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default async function CheckoutSuccessPage({ params, searchParams }: PageProps) {
  let locale: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params in checkout success page:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <CheckoutSuccessClient locale={locale} sessionId={searchParams.session_id} />;
}



