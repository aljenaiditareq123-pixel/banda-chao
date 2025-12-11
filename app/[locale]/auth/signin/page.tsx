import { notFound } from 'next/navigation';
import SignInPageClient from './page-client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function SignInPage({ params }: PageProps) {
  let locale: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params in auth/signin page:', error);
    notFound();
  }

  if (!locale || !validLocales.includes(locale)) {
    notFound();
  }

  return <SignInPageClient locale={locale} />;
}
