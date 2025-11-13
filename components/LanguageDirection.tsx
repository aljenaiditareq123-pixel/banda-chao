'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageDirection() {
  const { language } = useLanguage();

  useEffect(() => {
    // Set document direction based on language
    if (language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', language === 'zh' ? 'zh-CN' : 'en');
    }
  }, [language]);

  return null;
}

