import { notFound } from 'next/navigation';
import CheckoutPageClient from './page-client';

interface PageProps {
  params: {
    locale: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default function CheckoutPage({ params }: PageProps) {
  const { locale } = params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <CheckoutPageClient locale={locale} />;
}



