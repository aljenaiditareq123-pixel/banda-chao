import { notFound } from 'next/navigation';
import MarketerPageClient from './page-client';

const validLocales = ['zh', 'en', 'ar'];

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = 'force-dynamic';

export default async function MarketerAIPage({ params }: PageProps) {
  let locale: string;

  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params in marketer page:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <MarketerPageClient locale={locale} />;
}
