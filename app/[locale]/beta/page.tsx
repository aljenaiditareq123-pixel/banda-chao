import { notFound } from 'next/navigation';
import BetaLandingPageClient from './page-client';

interface PageProps {
  params: {
    locale: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default function BetaLandingPage({ params }: PageProps) {
  const { locale } = params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <BetaLandingPageClient locale={locale} />;
}

