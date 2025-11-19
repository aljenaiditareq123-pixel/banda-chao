import Providers from '@/components/Providers';
import type { Metadata } from 'next';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = params;
  const validLocale = (locale === 'zh' || locale === 'ar' || locale === 'en') ? locale : 'zh';

  const titles = {
    zh: 'Banda Chao - 社交电商平台',
    ar: 'Banda Chao - منصة التجارة الاجتماعية',
    en: 'Banda Chao - Social Commerce Platform',
  };

  const descriptions = {
    zh: 'Banda Chao - 结合社交媒体与电子商务的平台，面向中国年轻工作者',
    ar: 'Banda Chao - منصة هجينة تجمع بين التواصل الاجتماعي والتجارة الإلكترونية',
    en: 'Banda Chao - A platform that combines social media with e-commerce',
  };

  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://banda-chao-frontend.onrender.com';

  return {
    title: titles[validLocale],
    description: descriptions[validLocale],
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
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = params;
  
  // Ensure locale is valid, default to 'zh' if not
  const validLocale = (locale === 'zh' || locale === 'ar' || locale === 'en') ? locale : 'zh';

  return (
    <Providers initialLocale={validLocale} showHeader={true} showChatWidget={true}>
      {children}
    </Providers>
  );
}
