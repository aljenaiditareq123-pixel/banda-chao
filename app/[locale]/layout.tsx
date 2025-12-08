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
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  let locale: string;
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error("Error resolving locale params in layout metadata, falling back to 'ar':", error);
    locale = 'ar'; // Fallback to default locale
  }
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

  // Use Render frontend URL in production, fallback to Vercel
  // Always set a proper base URL for metadataBase
  // Check if we're in production by checking RENDER environment or NODE_ENV
  const isProduction = process.env.NODE_ENV === 'production' || 
                       process.env.RENDER === 'true' ||
                       process.env.RENDER_SERVICE_NAME !== undefined;
  
  // Always use a production URL for metadataBase to avoid localhost warnings
  const metadataBaseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 
                          'https://banda-chao-frontend.onrender.com'; // Default to Render URL
  const baseUrl = metadataBaseUrl;
  
  const keywords = {
    zh: '手作, 匠人, 原创, 手工作品, 手工艺品, 手作平台, 手作人社区, Banda Chao',
    ar: 'منصة, تجارة, اجتماعية, حرفيين',
    en: 'social commerce, e-commerce, makers, handmade, artisans',
  };

  // Safely get keywords array
  const keywordsArray = keywords[validLocale]?.split(', ') || keywords.ar.split(', ');

  const metadata: Metadata = {
    metadataBase: new URL(metadataBaseUrl),
    title: titles[validLocale] || titles.ar,
    description: descriptions[validLocale] || descriptions.ar,
    keywords: keywordsArray,
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

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  let locale: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params in layout:', error);
    // Fallback to default locale if params resolution fails
    locale = 'ar';
  }
  
  // Validate locale and fallback to default if invalid (don't call notFound())
  if (!validLocales.includes(locale)) {
    console.warn(`Invalid locale in layout: ${locale}, falling back to 'ar'`);
    locale = 'ar';
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
