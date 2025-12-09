import { notFound } from 'next/navigation';
import LoginPageClient from '../../login/page-client';

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function LoginPage({ params }: PageProps) {
  let locale: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params in auth/login page:', error);
    notFound();
  }

  if (!locale || !validLocales.includes(locale)) {
    notFound();
  }

  return <LoginPageClient locale={locale} />;
}

