import { notFound } from 'next/navigation';
import { Suspense } from 'react';
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

function LoginPageFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-600">Loading...</div>
    </div>
  );
}

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

  // Wrap LoginPageClient in Suspense to prevent hydration errors with useSearchParams
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageClient locale={locale} />
    </Suspense>
  );
}



