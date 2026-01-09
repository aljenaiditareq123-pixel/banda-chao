'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMessage, type Language as LanguageType } from '@/lib/messages';

type Language = 'zh' | 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Legacy translations for backward compatibility
// These are gradually being migrated to lib/messages.ts
const legacyTranslations: Record<Language, Record<string, string>> = {
  zh: {
    featuredMakerName1: '张师傅',
    featuredMakerBio1: '传统陶瓷工艺大师，拥有30年经验',
    featuredMakerName2: '李师傅',
    featuredMakerBio2: '丝绸刺绣专家，传承家族技艺',
    featuredMakerName3: '王师傅',
    featuredMakerBio3: '竹编工艺师，创新传统设计',
    howItWorksStep1Description: '探索来自中国各地手工艺人的独特产品',
    howItWorksStep2Description: '直接与手工艺人沟通，了解产品详情',
    howItWorksStep3Description: '安全便捷的购买流程，支持多种支付方式',
    ctaHeadline: '开始您的中国手工艺之旅',
    ctaButtonText: '立即开始',
  },
  en: {
    featuredMakerName1: 'Master Zhang',
    featuredMakerBio1: 'Traditional ceramics master with 30 years of experience',
    featuredMakerName2: 'Master Li',
    featuredMakerBio2: 'Silk embroidery expert, inheriting family craftsmanship',
    featuredMakerName3: 'Master Wang',
    featuredMakerBio3: 'Bamboo weaving artisan, innovating traditional designs',
    howItWorksStep1Description: 'Explore unique products from artisans across China',
    howItWorksStep2Description: 'Communicate directly with artisans to learn about products',
    howItWorksStep3Description: 'Safe and convenient purchasing process with multiple payment options',
    ctaHeadline: 'Start Your Chinese Handicraft Journey',
    ctaButtonText: 'Get Started',
  },
  ar: {
    featuredMakerName1: 'الأستاذ Zhang',
    featuredMakerBio1: 'سيد السيراميك التقليدي مع 30 عاماً من الخبرة',
    featuredMakerName2: 'الأستاذ Li',
    featuredMakerBio2: 'خبير التطريز الحريري، وراثة الحرف العائلية',
    featuredMakerName3: 'الأستاذ Wang',
    featuredMakerBio3: 'حرفي نسج الخيزران، ابتكار التصاميم التقليدية',
    howItWorksStep1Description: 'استكشف المنتجات الفريدة من الحرفيين في جميع أنحاء الصين',
    howItWorksStep2Description: 'تواصل مباشرة مع الحرفيين لمعرفة المزيد عن المنتجات',
    howItWorksStep3Description: 'عملية شراء آمنة ومريحة مع خيارات دفع متعددة',
    ctaHeadline: 'ابدأ رحلتك في الحرف اليدوية الصينية',
    ctaButtonText: 'ابدأ الآن',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export function LanguageProvider({ children, defaultLanguage = 'ar' }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    // Try to get language from localStorage (only on client to prevent hydration mismatch)
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && ['zh', 'en', 'ar'].includes(savedLanguage)) {
        setLanguageState(savedLanguage);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  const t = (key: string): string => {
    // First, try to get from centralized messages (new system)
    try {
      const message = getMessage(language, key);
      if (message !== key) {
        return message;
      }
    } catch {
      // Fall through to legacy translations
    }
    
    // Fallback to legacy translations for backward compatibility
    return legacyTranslations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}



