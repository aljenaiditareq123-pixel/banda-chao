import { notFound } from 'next/navigation';
import CheckoutSuccessClient from './page-client';

interface PageProps {
  params: {
    locale: string;
  };
  searchParams: {
    session_id?: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default async function CheckoutSuccessPage({ params, searchParams }: PageProps) {
  const { locale } = params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <CheckoutSuccessClient locale={locale} sessionId={searchParams.session_id} />;
}

