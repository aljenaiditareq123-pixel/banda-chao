import { notFound } from 'next/navigation';
import LoginPageClient from './page-client';

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface LoginPageProps {
  params: Promise<{
    locale: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function LoginPage({ params }: LoginPageProps) {
  let locale: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params in login page:', error);
    notFound();
  }

  if (!locale || !validLocales.includes(locale)) {
    notFound();
  }

  // Render login page directly - no redirects
  return <LoginPageClient locale={locale} />;
}



