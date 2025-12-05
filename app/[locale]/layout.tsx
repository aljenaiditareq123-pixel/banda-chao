import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Script from 'next/script';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CartProvider } from '@/contexts/CartContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/CartDrawer';
import '../globals.css';

const validLocales = ['zh', 'en', 'ar'];

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = params;
  const validLocale = (locale === 'zh' || locale === 'ar' || locale === 'en') ? locale : 'ar';

  const titles = {
    zh: 'Banda Chao 手作平台 — 全球手作人的温暖之家',
    ar: 'Banda Chao - منصة التجارة الاجتماعية',
    en: 'Banda Chao - Social Commerce Platform',
  };

  const descriptions = {
    zh: 'Banda Chao 是一个连接全球手作人与买家的温暖平台，让每一件原创好物被看到，让每一位手作人都被尊重。',
    ar: 'Banda Chao - منصة هجينة تجمع بين التواصل الاجتماعي والتجارة الإلكترونية',
    en: 'Banda Chao - A platform that combines social media with e-commerce',
  };

  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://banda-chao-frontend.onrender.com';
  const keywords = {
    zh: '手作, 匠人, 原创, 手工作品, 手工艺品, 手作平台, 手作人社区, Banda Chao',
    ar: 'منصة, تجارة, اجتماعية, حرفيين',
    en: 'social commerce, e-commerce, makers, handmade, artisans',
  };

  const metadata: Metadata = {
    title: titles[validLocale],
    description: descriptions[validLocale],
    keywords: keywords[validLocale].split(', '),
    alternates: {
      canonical: `${baseUrl}/${validLocale}`,
      languages: {
        'zh': `${baseUrl}/zh`,
        'ar': `${baseUrl}/ar`,
        'en': `${baseUrl}/en`,
      },
    },
    openGraph: {
      title: titles[validLocale],
      description: descriptions[validLocale],
      url: `${baseUrl}/${validLocale}`,
      siteName: 'Banda Chao',
      locale: validLocale === 'zh' ? 'zh_CN' : validLocale === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[validLocale],
      description: descriptions[validLocale],
    },
  };

  // Add Baidu-specific meta tags for Chinese locale
  if (validLocale === 'zh') {
    metadata.other = {
      'renderer': 'webkit',
      'force-rendering': 'webkit',
      'baidu-site-verification': 'TODO_ADD_CODE',
      'X-UA-Compatible': 'IE=Edge,chrome=1',
      'itemprop:name': 'Banda Chao 手作平台',
      'itemprop:description': '全球手作人的温暖之家',
      'itemprop:image': `${baseUrl}/og-china.png`,
    };
  }

  return metadata;
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = params;
  
  // Validate locale
  if (!validLocales.includes(locale)) {
    notFound();
  }

  const validLocale = (locale === 'zh' || locale === 'ar' || locale === 'en') ? locale : 'ar';
  const dir = validLocale === 'ar' ? 'rtl' : 'ltr';
  const lang = validLocale;

  return (
    <html lang={lang} dir={dir}>
      <body>
        {/* Baidu-specific meta tags for Chinese pages */}
        {validLocale === 'zh' && (
          <Script
            id="baidu-meta-tags"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                if (document.querySelector('meta[name="renderer"]') === null) {
                  const meta1 = document.createElement('meta');
                  meta1.name = 'renderer';
                  meta1.content = 'webkit';
                  document.getElementsByTagName('head')[0].appendChild(meta1);
                }
                if (document.querySelector('meta[http-equiv="X-UA-Compatible"]') === null) {
                  const meta2 = document.createElement('meta');
                  meta2.httpEquiv = 'X-UA-Compatible';
                  meta2.content = 'IE=Edge,chrome=1';
                  document.getElementsByTagName('head')[0].appendChild(meta2);
                }
                if (document.querySelector('meta[name="force-rendering"]') === null) {
                  const meta3 = document.createElement('meta');
                  meta3.name = 'force-rendering';
                  meta3.content = 'webkit';
                  document.getElementsByTagName('head')[0].appendChild(meta3);
                }
                if (document.querySelector('meta[name="keywords"]') === null) {
                  const meta4 = document.createElement('meta');
                  meta4.name = 'keywords';
                  meta4.content = '手作, 匠人, 原创, 手工作品, 手工艺品, 手作平台, 手作人社区, Banda Chao';
                  document.getElementsByTagName('head')[0].appendChild(meta4);
                }
                if (document.querySelector('meta[itemprop="name"]') === null) {
                  const meta5 = document.createElement('meta');
                  meta5.setAttribute('itemprop', 'name');
                  meta5.content = 'Banda Chao 手作平台';
                  document.getElementsByTagName('head')[0].appendChild(meta5);
                }
                if (document.querySelector('meta[itemprop="description"]') === null) {
                  const meta6 = document.createElement('meta');
                  meta6.setAttribute('itemprop', 'description');
                  meta6.content = '全球手作人的温暖之家';
                  document.getElementsByTagName('head')[0].appendChild(meta6);
                }
              `,
            }}
          />
        )}
        <LanguageProvider defaultLanguage={validLocale as 'zh' | 'en' | 'ar'}>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar locale={validLocale} />
              <main className="flex-grow">
                {children}
              </main>
              <Footer locale={validLocale} />
            </div>
            <CartDrawer locale={validLocale} />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
