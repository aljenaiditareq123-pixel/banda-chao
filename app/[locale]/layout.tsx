import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Suspense } from 'react';
import { Almarai, Inter } from 'next/font/google';
import { CartProvider } from '@/contexts/CartContext';
import { NightMarketProvider } from '@/contexts/NightMarketContext';
import SessionProviderWrapper from '@/components/providers/SessionProviderWrapper';
import Footer from '@/components/layout/Footer';
import ClientLayoutWrapper from '@/components/layout/ClientLayoutWrapper';
import '../globals.css';

// Premium Arabic font
const almarai = Almarai({
  subsets: ['arabic'],
  weight: ['300', '400', '700', '800'],
  variable: '--font-almarai',
  display: 'swap',
});

// Default font for English/Chinese
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const validLocales = ['zh', 'en', 'ar'];

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  let locale: string = 'ar'; // Default fallback
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams?.locale || 'ar';
    
    // Additional check: if locale is invalid or looks like a file path, use default
    if (!locale || typeof locale !== 'string' || locale.includes('.') || locale === 'robots.txt' || locale === 'favicon.ico') {
      locale = 'ar';
    }
  } catch (error) {
    // Silently fallback to default - don't log errors for static files
    locale = 'ar';
  }
  
  // Final validation - ensure locale is valid
  // Additional safety check - if locale looks like a file, force to default BEFORE validation
  if (!locale || typeof locale !== 'string' || locale.includes('.') || locale === 'robots.txt' || locale === 'favicon.ico') {
    locale = 'ar';
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

  // Safely get keywords array with multiple fallbacks
  let keywordsArray: string[] = [];
  try {
    const keywordsString = keywords[validLocale] || keywords.ar || '';
    keywordsArray = keywordsString.split(', ').filter(k => k.trim().length > 0);
    if (keywordsArray.length === 0) {
      keywordsArray = ['Banda Chao', 'Social Commerce'];
    }
  } catch (error) {
    console.error('Error processing keywords:', error);
    keywordsArray = ['Banda Chao', 'Social Commerce'];
  }

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
  let locale: string = 'ar'; // Default fallback
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams?.locale || 'ar';
    
    // Check if locale looks like a static file
    if (!locale || typeof locale !== 'string' || locale.includes('.') || locale === 'robots.txt' || locale === 'favicon.ico') {
      locale = 'ar';
    }
  } catch (error) {
    // Silently fallback - don't log errors for static files
    locale = 'ar';
  }
  
  // Validate locale and fallback to default if invalid (don't call notFound())
  // Check for static files first to avoid logging warnings
  const isStaticFile = !locale || locale.includes('.') || locale === 'robots.txt' || locale === 'favicon.ico' || locale === 'manifest.json' || locale === 'og-image.png';
  
  if (!locale || !validLocales.includes(locale) || isStaticFile) {
    // Only log warning if it's a real locale issue, not a static file
    if (!isStaticFile && locale && locale !== 'ar' && validLocales.includes(locale) === false) {
      console.warn(`Invalid locale in layout: ${locale}, falling back to 'ar'`);
    }
    locale = 'ar';
  }

  const validLocale = (locale === 'zh' || locale === 'ar' || locale === 'en') ? locale : 'ar';
  const dir = validLocale === 'ar' ? 'rtl' : 'ltr';
  const lang = validLocale;
  
  // Apply premium Arabic font for Arabic locale, Inter for others
  const fontClassName = validLocale === 'ar' ? almarai.className : inter.className;

  return (
    <>
        {/* Baidu-specific meta tags for Chinese pages */}
        {validLocale === 'zh' && (
          <Script
            id="baidu-meta-tags"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  if (typeof window === 'undefined' || typeof document === 'undefined') return;
                  try {
                    const head = document.head || document.getElementsByTagName('head')[0];
                    if (!head) return;
                    
                    if (document.querySelector('meta[name="renderer"]') === null) {
                      const meta1 = document.createElement('meta');
                      meta1.name = 'renderer';
                      meta1.content = 'webkit';
                      head.appendChild(meta1);
                    }
                    if (document.querySelector('meta[http-equiv="X-UA-Compatible"]') === null) {
                      const meta2 = document.createElement('meta');
                      meta2.httpEquiv = 'X-UA-Compatible';
                      meta2.content = 'IE=Edge,chrome=1';
                      head.appendChild(meta2);
                    }
                    if (document.querySelector('meta[name="force-rendering"]') === null) {
                      const meta3 = document.createElement('meta');
                      meta3.name = 'force-rendering';
                      meta3.content = 'webkit';
                      head.appendChild(meta3);
                    }
                    if (document.querySelector('meta[name="keywords"]') === null) {
                      const meta4 = document.createElement('meta');
                      meta4.name = 'keywords';
                      meta4.content = '手作, 匠人, 原创, 手工作品, 手工艺品, 手作平台, 手作人社区, Banda Chao';
                      head.appendChild(meta4);
                    }
                    if (document.querySelector('meta[itemprop="name"]') === null) {
                      const meta5 = document.createElement('meta');
                      meta5.setAttribute('itemprop', 'name');
                      meta5.content = 'Banda Chao 手作平台';
                      head.appendChild(meta5);
                    }
                    if (document.querySelector('meta[itemprop="description"]') === null) {
                      const meta6 = document.createElement('meta');
                      meta6.setAttribute('itemprop', 'description');
                      meta6.content = '全球手作人的温暖之家';
                      head.appendChild(meta6);
                    }
                  } catch (e) {
                    // Silently fail - these are optional meta tags
                    console.warn('Failed to inject meta tags:', e);
                  }
                })();
              `,
            }}
          />
        )}
        <SessionProviderWrapper>
          <CartProvider>
            <NightMarketProvider>
              <div className="flex flex-col min-h-screen pb-20 lg:pb-0">
                {/* Client-only interactive components (Navbar, CartDrawer, etc.) */}
                <ClientLayoutWrapper locale={validLocale} />
                
                <main className="flex-grow">
                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>}>
                    {children}
                  </Suspense>
                </main>
                
                {/* Footer - Server Component */}
                <Footer locale={validLocale} />
              </div>
            </NightMarketProvider>
          </CartProvider>
        </SessionProviderWrapper>
    </>
  );
}
