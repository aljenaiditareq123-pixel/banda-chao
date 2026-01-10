'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Client component to sync LanguageProvider with locale from URL
 * This ensures the root LanguageProvider matches the current route locale
 * Uses mounted state to prevent hydration mismatches
 */
export default function LanguageSync({ locale }: { locale: 'zh' | 'en' | 'ar' }) {
  const { setLanguage, language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Only run on client after mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only sync after component is mounted and locale is valid
    if (!mounted) return;
    if (!locale || !['zh', 'en', 'ar'].includes(locale)) return;
    
    // Only update if language is different to avoid unnecessary re-renders
    if (language !== locale) {
      setLanguage(locale);
    }
  }, [locale, setLanguage, language, mounted]);

  // This component doesn't render anything
  return null;
}
