'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'zh' | 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys
const translations: Record<Language, Record<string, string>> = {
  zh: {
    homeHeroHeadline: '发现中国手工艺之美',
    homeHeroDescription: '连接手工艺人与全球买家，探索独特的中国文化产品',
    homeHeroCTA: '浏览产品',
    featuredMakersTitle: '精选手工艺人',
    featuredMakerName1: '张师傅',
    featuredMakerBio1: '传统陶瓷工艺大师，拥有30年经验',
    featuredMakerName2: '李师傅',
    featuredMakerBio2: '丝绸刺绣专家，传承家族技艺',
    featuredMakerName3: '王师傅',
    featuredMakerBio3: '竹编工艺师，创新传统设计',
    latestProductsTitle: '最新产品',
    howItWorksTitle: '如何使用',
    howItWorksStep1Title: '浏览产品',
    howItWorksStep1Description: '探索来自中国各地手工艺人的独特产品',
    howItWorksStep2Title: '联系手工艺人',
    howItWorksStep2Description: '直接与手工艺人沟通，了解产品详情',
    howItWorksStep3Title: '下单购买',
    howItWorksStep3Description: '安全便捷的购买流程，支持多种支付方式',
    ctaHeadline: '开始您的中国手工艺之旅',
    ctaButtonText: '立即开始',
    noContent: '暂无内容',
  },
  en: {
    homeHeroHeadline: 'Discover the Beauty of Chinese Handicrafts',
    homeHeroDescription: 'Connect artisans with global buyers, explore unique Chinese cultural products',
    homeHeroCTA: 'Browse Products',
    featuredMakersTitle: 'Featured Artisans',
    featuredMakerName1: 'Master Zhang',
    featuredMakerBio1: 'Traditional ceramics master with 30 years of experience',
    featuredMakerName2: 'Master Li',
    featuredMakerBio2: 'Silk embroidery expert, inheriting family craftsmanship',
    featuredMakerName3: 'Master Wang',
    featuredMakerBio3: 'Bamboo weaving artisan, innovating traditional designs',
    latestProductsTitle: 'Latest Products',
    howItWorksTitle: 'How It Works',
    howItWorksStep1Title: 'Browse Products',
    howItWorksStep1Description: 'Explore unique products from artisans across China',
    howItWorksStep2Title: 'Contact Artisans',
    howItWorksStep2Description: 'Communicate directly with artisans to learn about products',
    howItWorksStep3Title: 'Place Orders',
    howItWorksStep3Description: 'Safe and convenient purchasing process with multiple payment options',
    ctaHeadline: 'Start Your Chinese Handicraft Journey',
    ctaButtonText: 'Get Started',
    noContent: 'No content available',
  },
  ar: {
    homeHeroHeadline: 'اكتشف جمال الحرف اليدوية الصينية',
    homeHeroDescription: 'ربط الحرفيين بالمشترين العالميين، استكشف المنتجات الثقافية الصينية الفريدة',
    homeHeroCTA: 'تصفح المنتجات',
    featuredMakersTitle: 'الحرفيون المميزون',
    featuredMakerName1: 'الأستاذ Zhang',
    featuredMakerBio1: 'سيد السيراميك التقليدي مع 30 عاماً من الخبرة',
    featuredMakerName2: 'الأستاذ Li',
    featuredMakerBio2: 'خبير التطريز الحريري، وراثة الحرف العائلية',
    featuredMakerName3: 'الأستاذ Wang',
    featuredMakerBio3: 'حرفي نسج الخيزران، ابتكار التصاميم التقليدية',
    latestProductsTitle: 'أحدث المنتجات',
    howItWorksTitle: 'كيف يعمل',
    howItWorksStep1Title: 'تصفح المنتجات',
    howItWorksStep1Description: 'استكشف المنتجات الفريدة من الحرفيين في جميع أنحاء الصين',
    howItWorksStep2Title: 'اتصل بالحرفيين',
    howItWorksStep2Description: 'تواصل مباشرة مع الحرفيين لمعرفة المزيد عن المنتجات',
    howItWorksStep3Title: 'تقديم الطلبات',
    howItWorksStep3Description: 'عملية شراء آمنة ومريحة مع خيارات دفع متعددة',
    ctaHeadline: 'ابدأ رحلتك في الحرف اليدوية الصينية',
    ctaButtonText: 'ابدأ الآن',
    noContent: 'لا يوجد محتوى',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export function LanguageProvider({ children, defaultLanguage = 'zh' }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    // Try to get language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['zh', 'en', 'ar'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
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

