'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'zh' | 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations: Record<Language, Record<string, string>> = {
  zh: {
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
    'welcome': '欢迎来到 Panda Chao',
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
    'english': 'English',
    'footerTagline': '为世界上的创作者打造的中立平台',
    'discover': '探索',
    'aboutPandaChao': '关于 Panda Chao',
    'whySell': '为什么选择我们？',
    'creatorStories': '创作者故事',
    'faq': '常见问题',
    'communityServices': '社区与服务',
    'servicesMarketplace': '服务市场',
    'becomeServiceProvider': '成为服务提供者',
    'blog': '博客',
    'contact': '联系我们',
    'toolsLanguages': '工具与语言',
    'languageSwitcher': '切换语言',
    'currencySwitcher': '货币',
    'appComingSoon': '应用商店图标即将上线',
    'rightsReserved': '© 2025 Panda Chao. 版权所有。',
    'terms': '服务条款',
    'privacy': '隐私政策',
  },
  ar: {
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
    'welcome': 'مرحباً بك في Panda Chao',
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
    'english': 'English',
    'footerTagline': 'منصة محايدة لدعم صنّاع المحتوى حول العالم',
    'discover': 'استكشف',
    'aboutPandaChao': 'عن Panda Chao',
    'whySell': 'لماذا البيع معنا؟',
    'creatorStories': 'قصص المبدعين',
    'faq': 'الأسئلة الشائعة',
    'communityServices': 'المجتمع والخدمات',
    'servicesMarketplace': 'سوق الخدمات',
    'becomeServiceProvider': 'انضم كمقدم خدمة',
    'blog': 'المدونة',
    'contact': 'تواصل معنا',
    'toolsLanguages': 'الأدوات واللغات',
    'languageSwitcher': 'اختر اللغة',
    'currencySwitcher': 'العملة',
    'appComingSoon': 'أيقونات المتاجر قادمة قريباً',
    'rightsReserved': '© 2025 Panda Chao. جميع الحقوق محفوظة.',
    'terms': 'شروط الخدمة',
    'privacy': 'سياسة الخصوصية',
  },
  en: {
    'home': 'Home',
    'shortVideos': 'Short Videos',
    'longVideos': 'Long Videos',
    'products': 'Products',
    'search': 'Search',
    'chat': 'Chat',
    'feed': 'Feed',
    'uploadVideo': 'Upload Video',
    'addProduct': 'Add Product',
    'login': 'Log In',
    'register': 'Sign Up',
    'logout': 'Log Out',
    'myAccount': 'My Account',
    'loading': 'Loading...',
    'error': 'Error',
    'retry': 'Retry',
    'noContent': 'No content available',
    'viewMore': 'View more',
    'welcome': 'Welcome to Panda Chao',
    'subtitle': 'An innovative platform that blends social media and commerce',
    'subtitle2': 'Share stories, showcase products, connect globally',
    'watchShortVideos': 'Watch short videos',
    'browseProducts': 'Browse products',
    'hotShortVideos': 'Trending short videos',
    'featuredLongVideos': 'Featured long videos',
    'recommendedProducts': 'Recommended products',
    'language': 'Language',
    'chinese': '中文',
    'arabic': 'العربية',
    'english': 'English',
    'footerTagline': 'A neutral platform for makers to reach the world',
    'discover': 'Discover',
    'aboutPandaChao': 'About Panda Chao',
    'whySell': 'Why sell with us?',
    'creatorStories': 'Creator stories',
    'faq': 'FAQ',
    'communityServices': 'Community & Services',
    'servicesMarketplace': 'Services marketplace',
    'becomeServiceProvider': 'Become a service provider',
    'blog': 'Blog',
    'contact': 'Contact us',
    'toolsLanguages': 'Tools & Languages',
    'languageSwitcher': 'Switch language',
    'currencySwitcher': 'Currency',
    'appComingSoon': 'App store links coming soon',
    'rightsReserved': '© 2025 Panda Chao. All rights reserved.',
    'terms': 'Terms of Service',
    'privacy': 'Privacy Policy',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('zh');

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'ar' || savedLanguage === 'en')) {
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

