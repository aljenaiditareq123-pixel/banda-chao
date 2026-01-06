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

  // Double Suspense boundary for extra safety - Next.js 15 requires Suspense for useSearchParams
  // Even though LoginPageClient has internal Suspense, we add one here too for SSR safety
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-gray-600">
          {locale === 'ar' ? 'جاري التحميل...' : locale === 'zh' ? '加载中...' : 'Loading...'}
        </div>
      </div>
    }>
      <LoginPageClient locale={locale} />
    </Suspense>
  );
}



