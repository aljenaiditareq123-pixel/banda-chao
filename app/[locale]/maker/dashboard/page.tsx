import { notFound, redirect } from 'next/navigation';
import MakerDashboardClient from './page-client';
import { useAuth } from '@/hooks/useAuth';

interface PageProps {
  params: {
    locale: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default async function MakerDashboardPage({ params }: PageProps) {
  const { locale } = params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  // Note: Auth check will be done in client component
  // Server-side auth check can be added here if needed

  return <MakerDashboardClient locale={locale} />;
}



