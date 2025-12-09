import { notFound } from 'next/navigation';
import BetaLandingPageClient from './page-client';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function BetaLandingPage({ params }: PageProps) {
  let locale: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params in beta page:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <BetaLandingPageClient locale={locale} />;
}

