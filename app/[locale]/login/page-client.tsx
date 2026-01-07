'use client';

import { Suspense } from 'react';
import LoginOptions from '@/components/auth/LoginOptions';

interface LoginPageClientProps {
  locale: string;
}

function LoginPageContent({ locale }: LoginPageClientProps) {
  return <LoginOptions locale={locale} />;
}

export default function LoginPageClient({ locale }: LoginPageClientProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-gray-600">
          {locale === 'ar' ? 'جاري التحميل...' : locale === 'zh' ? '加载中...' : 'Loading...'}
        </div>
      </div>
    }>
      <LoginPageContent locale={locale} />
    </Suspense>
  );
}
