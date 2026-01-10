'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Disable SSR for LanguageProvider to prevent React Error #310
// LanguageProvider uses useEffect to read from localStorage, which causes hydration mismatches
const LanguageProvider = dynamic(
  () => import('@/contexts/LanguageContext').then(mod => ({ default: mod.LanguageProvider })),
  { ssr: false }
);

interface ClientLanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: 'zh' | 'en' | 'ar';
}

export default function ClientLanguageProvider({ children, defaultLanguage = 'ar' }: ClientLanguageProviderProps) {
  return (
    <Suspense fallback={<div>{children}</div>}>
      <LanguageProvider defaultLanguage={defaultLanguage}>
        {children}
      </LanguageProvider>
    </Suspense>
  );
}
