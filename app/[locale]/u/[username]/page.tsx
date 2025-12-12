import { notFound } from 'next/navigation';
import PublicProfileClient from './page-client';

interface PageProps {
  params: Promise<{
    locale: string;
    username: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function PublicProfilePage({ params }: PageProps) {
  let locale: string;
  let username: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
    username = resolvedParams.username;
  } catch (error) {
    console.error('Error resolving params in public profile page:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  if (!username || username === 'favicon.ico' || username.includes('.')) {
    notFound();
  }

  return <PublicProfileClient locale={locale} username={username} />;
}
