import { notFound } from 'next/navigation';
import AboutPageClient from './page-client';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function AboutPage({ params }: PageProps) {
  let locale: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params in about page:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <AboutPageClient locale={locale} />;
}



