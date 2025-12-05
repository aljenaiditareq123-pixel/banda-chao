import { notFound } from 'next/navigation';
import AIDashboardClient from './page-client';

interface PageProps {
  params: {
    locale: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default async function AIDashboardPage({ params }: PageProps) {
  const { locale } = params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <AIDashboardClient locale={locale} />;
}

