import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import MakerDashboardClient from './page-client';

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

  // Check for auth token in cookies or headers
  // Client component will handle redirect if not authenticated
  // This is a server component, so we can't use hooks
  // The client component will check auth and redirect if needed

  return <MakerDashboardClient locale={locale} />;
}



