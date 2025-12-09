import { notFound } from 'next/navigation';
import CheckoutCancelClient from './page-client';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: {
    order_id?: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default async function CheckoutCancelPage({ params, searchParams }: PageProps) {
  let locale: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params in checkout cancel page:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <CheckoutCancelClient locale={locale} orderId={searchParams.order_id} />;
}



