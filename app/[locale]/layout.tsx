'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { LanguageProvider } from '@/contexts/LanguageContext';
import NotificationBell from '@/components/common/NotificationBell';
import AuthButtons from '@/components/layout/AuthButtons';
import UploadButton from '@/components/layout/UploadButton';
import Link from 'next/link';
import '../globals.css';

const validLocales = ['zh', 'en', 'ar'];

interface LayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = params;
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('bandaChao_isLoggedIn') === 'true';
      const name = localStorage.getItem('bandaChao_userName');
      const role = localStorage.getItem('bandaChao_userRole');
      setIsLoggedIn(loggedIn);
      setUserName(name);
      setUserRole(role);
      
      // Defensive logging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('[Layout] Auth state loaded:', { loggedIn, name, role });
      }
    }
  }, []);

  if (!validLocales.includes(locale)) {
    notFound();
  }

  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const lang = locale;

  const accountTexts = {
    ar: {
      myAccount: 'حسابي',
      logOut: 'تسجيل الخروج',
    },
    en: {
      myAccount: 'My Account',
      logOut: 'Log Out',
    },
    zh: {
      myAccount: '我的账户',
      logOut: '登出',
    },
  };

  const accountT = accountTexts[locale as keyof typeof accountTexts] || accountTexts.en;

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Layout] Logout called');
      }
      localStorage.removeItem('bandaChao_isLoggedIn');
      localStorage.removeItem('bandaChao_userEmail');
      localStorage.removeItem('bandaChao_userName');
      localStorage.removeItem('bandaChao_userRole');
      setIsLoggedIn(false);
      setUserName(null);
      setUserRole(null);
      window.location.href = `/${locale}`;
    }
  };

  // Prevent hydration mismatch by rendering minimal shell until mounted
  if (!mounted) {
    return (
      <html lang={lang} dir={dir}>
        <body>
          <LanguageProvider defaultLanguage={locale as 'zh' | 'en' | 'ar'}>
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-[100]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center">
                    <Link href={`/${locale}`} className="text-xl font-bold text-primary">
                      Banda Chao
                    </Link>
                  </div>
                  <div className="flex items-center gap-4 relative z-[100]">
                    <Link href={`/${locale}/makers`} className="text-gray-600 hover:text-gray-900">
                      {locale === 'ar' ? 'الحرفيون' : locale === 'zh' ? '手工艺人' : 'Makers'}
                    </Link>
                    <Link href={`/${locale}/products`} className="text-gray-600 hover:text-gray-900">
                      {locale === 'ar' ? 'المنتجات' : locale === 'zh' ? '产品' : 'Products'}
                    </Link>
                    <Link href={`/${locale}/videos`} className="text-gray-600 hover:text-gray-900">
                      {locale === 'ar' ? 'الفيديوهات' : locale === 'zh' ? '视频' : 'Videos'}
                    </Link>
                    <Link href={`/${locale}/about`} className="text-gray-600 hover:text-gray-900">
                      {locale === 'ar' ? 'عن' : locale === 'zh' ? '关于' : 'About'}
                    </Link>
                    <AuthButtons locale={locale} isLoggedIn={false} />
                    <UploadButton locale={locale} isLoggedIn={false} />
                  </div>
                </div>
              </div>
            </nav>
            {children}
          </LanguageProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang={lang} dir={dir}>
      <body>
        <LanguageProvider defaultLanguage={locale as 'zh' | 'en' | 'ar'}>
          {/* Simple Navbar */}
          <nav className="bg-white border-b border-gray-200 sticky top-0 z-[100]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <Link href={`/${locale}`} className="text-xl font-bold text-primary">
                    Banda Chao
                  </Link>
                </div>
                <div className="flex items-center gap-4 relative z-[100]">
                  <Link href={`/${locale}/makers`} className="text-gray-600 hover:text-gray-900">
                    {locale === 'ar' ? 'الحرفيون' : locale === 'zh' ? '手工艺人' : 'Makers'}
                  </Link>
                  <Link href={`/${locale}/products`} className="text-gray-600 hover:text-gray-900">
                    {locale === 'ar' ? 'المنتجات' : locale === 'zh' ? '产品' : 'Products'}
                  </Link>
                  <Link href={`/${locale}/videos`} className="text-gray-600 hover:text-gray-900">
                    {locale === 'ar' ? 'الفيديوهات' : locale === 'zh' ? '视频' : 'Videos'}
                  </Link>
                  <Link href={`/${locale}/about`} className="text-gray-600 hover:text-gray-900">
                    {locale === 'ar' ? 'عن' : locale === 'zh' ? '关于' : 'About'}
                  </Link>
                  {/* Auth Buttons */}
                  <AuthButtons 
                    locale={locale} 
                    isLoggedIn={isLoggedIn}
                    userName={userName}
                    onLogout={handleLogout}
                  />
                  {/* Upload Button */}
                  <UploadButton 
                    locale={locale}
                    isLoggedIn={isLoggedIn}
                    userRole={userRole || undefined}
                  />
                  {/* Language Switcher */}
                  <div className="flex items-center gap-2 relative z-[100]">
                    <Link 
                      href="/ar" 
                      className={`text-sm px-2 py-1 rounded ${locale === 'ar' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      AR
                    </Link>
                    <Link 
                      href="/en" 
                      className={`text-sm px-2 py-1 rounded ${locale === 'en' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      EN
                    </Link>
                    <Link 
                      href="/zh" 
                      className={`text-sm px-2 py-1 rounded ${locale === 'zh' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      ZH
                    </Link>
                  </div>
                  <NotificationBell />
                </div>
              </div>
            </div>
          </nav>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
