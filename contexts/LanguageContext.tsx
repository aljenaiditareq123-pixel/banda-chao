'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import zhMessages from '@/locales/zh.json';
import arMessages from '@/locales/ar.json';
import enMessages from '@/locales/en.json';

type Language = 'zh' | 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const messagesMap: Record<Language, Record<string, string>> = {
  zh: zhMessages,
  ar: arMessages,
  en: enMessages,
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('zh');

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'ar' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
      document.cookie = `NEXT_LOCALE=${encodeURIComponent(savedLanguage)}; path=/; max-age=31536000`;
      return;
    }

    const cookieMatch = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
    if (cookieMatch) {
      const cookieLang = decodeURIComponent(cookieMatch[1]) as Language;
      if (cookieLang === 'zh' || cookieLang === 'ar' || cookieLang === 'en') {
        setLanguageState(cookieLang);
        localStorage.setItem('language', cookieLang);
        document.cookie = `NEXT_LOCALE=${encodeURIComponent(cookieLang)}; path=/; max-age=31536000`;
      }
    }
  }, []);

  useEffect(() => {
    const localeAttribute = language === 'zh' ? 'zh-CN' : language;
    document.documentElement.lang = localeAttribute;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.cookie = `NEXT_LOCALE=${encodeURIComponent(lang)}; path=/; max-age=31536000`;
  };

  const t = (key: string): string => {
    return messagesMap[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <NextIntlClientProvider locale={language} messages={messagesMap[language]}>
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

