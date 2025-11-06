'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'zh' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations: Record<Language, Record<string, string>> = {
  zh: {
    // Common
    'home': '首页',
    'shortVideos': '短视频',
    'longVideos': '长视频',
    'products': '商品',
    'search': '搜索',
    'chat': '聊天',
    'feed': '动态',
    'uploadVideo': '上传视频',
    'addProduct': '添加商品',
    'login': '登录',
    'register': '注册',
    'logout': '退出',
    'myAccount': '我的账户',
    'loading': '加载中...',
    'error': '错误',
    'retry': '重试',
    'noContent': '暂无内容',
    'viewMore': '查看更多',
    'welcome': '欢迎来到 Banda Chao',
    'subtitle': '结合社交媒体与电子商务的创新平台',
    'subtitle2': '分享视频，展示产品，连接世界',
    'watchShortVideos': '观看短视频',
    'browseProducts': '浏览商品',
    'hotShortVideos': '热门短视频',
    'featuredLongVideos': '精选长视频',
    'recommendedProducts': '推荐商品',
    'language': '语言',
    'chinese': '中文',
    'arabic': 'العربية',
  },
  ar: {
    // Common
    'home': 'الرئيسية',
    'shortVideos': 'فيديوهات قصيرة',
    'longVideos': 'فيديوهات طويلة',
    'products': 'المنتجات',
    'search': 'البحث',
    'chat': 'الدردشة',
    'feed': 'المنشورات',
    'uploadVideo': 'رفع فيديو',
    'addProduct': 'إضافة منتج',
    'login': 'تسجيل الدخول',
    'register': 'التسجيل',
    'logout': 'تسجيل الخروج',
    'myAccount': 'حسابي',
    'loading': 'جاري التحميل...',
    'error': 'خطأ',
    'retry': 'إعادة المحاولة',
    'noContent': 'لا يوجد محتوى',
    'viewMore': 'عرض المزيد',
    'welcome': 'مرحباً بك في Banda Chao',
    'subtitle': 'منصة مبتكرة تجمع بين التواصل الاجتماعي والتجارة الإلكترونية',
    'subtitle2': 'شارك الفيديوهات، اعرض المنتجات، واتصل بالعالم',
    'watchShortVideos': 'مشاهدة الفيديوهات القصيرة',
    'browseProducts': 'تصفح المنتجات',
    'hotShortVideos': 'الفيديوهات القصيرة الشائعة',
    'featuredLongVideos': 'الفيديوهات الطويلة المميزة',
    'recommendedProducts': 'المنتجات الموصى بها',
    'language': 'اللغة',
    'chinese': '中文',
    'arabic': 'العربية',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('zh');

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'ar')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
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

