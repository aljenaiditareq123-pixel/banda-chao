import { notFound } from 'next/navigation';
import AIDashboardClient from './page-client';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function AIDashboardPage({ params }: PageProps) {
  let locale: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params in AI dashboard page:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <AIDashboardClient locale={locale} />;
}

