import OrdersPageClient from './page-client';
import type { Metadata } from 'next';

interface LocaleOrdersPageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: LocaleOrdersPageProps): Promise<Metadata> {
  const { locale } = params;
  const validLocale = (locale === 'zh' || locale === 'ar' || locale === 'en') ? locale : 'zh';
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://banda-chao-frontend.onrender.com';

  const titles = {
    zh: '我的订单 — Banda Chao',
    ar: 'Banda Chao - الطلبات',
    en: 'Banda Chao - Orders',
  };

  return {
    title: titles[validLocale],
    alternates: {
      canonical: `${baseUrl}/${validLocale}/orders`,
    },
  };
}

export default function LocaleOrdersPage({ params }: LocaleOrdersPageProps) {
  const { locale } = params;
  return <OrdersPageClient locale={locale} />;
}





