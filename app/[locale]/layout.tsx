import { notFound } from 'next/navigation';
import { LanguageProvider } from '@/contexts/LanguageContext';
import NotificationBell from '@/components/common/NotificationBell';
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

  if (!validLocales.includes(locale)) {
    notFound();
  }

  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const lang = locale;

  return (
    <html lang={lang} dir={dir}>
      <body>
        <LanguageProvider defaultLanguage={locale as 'zh' | 'en' | 'ar'}>
          {/* Simple Navbar */}
          <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <a href={`/${locale}`} className="text-xl font-bold text-primary">
                    Banda Chao
                  </a>
                </div>
                <div className="flex items-center gap-4">
                  <a href={`/${locale}/makers`} className="text-gray-600 hover:text-gray-900">
                    {locale === 'ar' ? 'الحرفيون' : locale === 'zh' ? '手工艺人' : 'Makers'}
                  </a>
                  <a href={`/${locale}/products`} className="text-gray-600 hover:text-gray-900">
                    {locale === 'ar' ? 'المنتجات' : locale === 'zh' ? '产品' : 'Products'}
                  </a>
                  <a href={`/${locale}/videos`} className="text-gray-600 hover:text-gray-900">
                    {locale === 'ar' ? 'الفيديوهات' : locale === 'zh' ? '视频' : 'Videos'}
                  </a>
                  <a href={`/${locale}/about`} className="text-gray-600 hover:text-gray-900">
                    {locale === 'ar' ? 'عن' : locale === 'zh' ? '关于' : 'About'}
                  </a>
                  {/* Language Switcher */}
                  <div className="flex items-center gap-2">
                    <a href="/ar" className={`text-sm px-2 py-1 rounded ${locale === 'ar' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'}`}>AR</a>
                    <a href="/en" className={`text-sm px-2 py-1 rounded ${locale === 'en' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'}`}>EN</a>
                    <a href="/zh" className={`text-sm px-2 py-1 rounded ${locale === 'zh' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'}`}>ZH</a>
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

