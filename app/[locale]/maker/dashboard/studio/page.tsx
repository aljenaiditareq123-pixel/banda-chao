import { notFound } from 'next/navigation';
import MakerStudioClient from './page-client';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function MakerStudioPage({ params }: PageProps) {
  let locale: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params:', error);
    locale = 'en';
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <MakerStudioClient locale={locale} />;
}
