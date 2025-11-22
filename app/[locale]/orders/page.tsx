import OrdersPageClient from './page-client';

interface LocaleOrdersPageProps {
  params: {
    locale: string;
  };
}

export default function LocaleOrdersPage({ params }: LocaleOrdersPageProps) {
  const { locale } = params;
  return <OrdersPageClient locale={locale} />;
}



