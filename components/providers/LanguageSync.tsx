'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Client component to sync LanguageProvider with locale from URL
 * This ensures the root LanguageProvider matches the current route locale
 */
export default function LanguageSync({ locale }: { locale: 'zh' | 'en' | 'ar' }) {
  const { setLanguage } = useLanguage();

  useEffect(() => {
    // Sync language with locale from URL
    if (locale && ['zh', 'en', 'ar'].includes(locale)) {
      setLanguage(locale);
    }
  }, [locale, setLanguage]);

  // This component doesn't render anything
  return null;
}
