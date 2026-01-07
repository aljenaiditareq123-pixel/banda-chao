'use client';

import { Suspense } from 'react';
import LoginOptions from '@/components/auth/LoginOptions';

interface SignInPageClientProps {
  locale: string;
}

function SignInPageContent({ locale }: SignInPageClientProps) {
  return <LoginOptions locale={locale} />;
}

export default function SignInPageClient({ locale }: SignInPageClientProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-gray-600">
          {locale === 'ar' ? 'جاري التحميل...' : locale === 'zh' ? '加载中...' : 'Loading...'}
        </div>
      </div>
    }>
      <SignInPageContent locale={locale} />
    </Suspense>
  );
}
