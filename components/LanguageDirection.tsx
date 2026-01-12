'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageDirection() {
  const { language } = useLanguage();

  useEffect(() => {
    // Only run in browser (client-side)
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    try {
      const isRTL = language === 'ar';
      
      // Set document direction and language
      if (isRTL) {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
        document.body.classList.add('rtl');
        document.body.classList.remove('ltr');
      } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', language === 'zh' ? 'zh-CN' : 'en');
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl');
      }
    } catch (error) {
      // document may not be available - ignore
      console.warn('Failed to set document direction:', error);
    }
  }, [language]);

  return null;
}

