import { notFound } from 'next/navigation';
import CheckoutCancelClient from './page-client';

interface PageProps {
  params: {
    locale: string;
  };
  searchParams: {
    order_id?: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default async function CheckoutCancelPage({ params, searchParams }: PageProps) {
  const { locale } = params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <CheckoutCancelClient locale={locale} orderId={searchParams.order_id} />;
}



