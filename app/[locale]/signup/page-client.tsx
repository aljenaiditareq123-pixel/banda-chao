'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginOptions from '@/components/auth/LoginOptions';

interface SignupPageClientProps {
  locale: string;
}

// PASSWORDLESS: Signup redirects to login (social-only)
export default function SignupPageClient({ locale }: SignupPageClientProps) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login (social-only, no separate signup)
    router.replace(`/${locale}/login`);
  }, [locale, router]);

  // Show login options while redirecting
  return <LoginOptions locale={locale} />;
}
