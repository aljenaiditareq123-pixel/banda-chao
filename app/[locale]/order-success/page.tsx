import { notFound } from 'next/navigation';
import OrderSuccessClient from './page-client';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    orderId?: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function OrderSuccessPage({ params, searchParams }: PageProps) {
  let locale: string;
  let orderId: string | undefined;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
    const resolvedSearchParams = await searchParams;
    orderId = resolvedSearchParams.orderId;
  } catch (error) {
    console.error('Error resolving params:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <OrderSuccessClient locale={locale} orderId={orderId} />;
}
