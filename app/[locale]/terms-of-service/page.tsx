import { notFound } from 'next/navigation';
import TermsOfServiceClient from './page-client';

interface PageProps {
  params: {
    locale: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default function TermsOfServicePage({ params }: PageProps) {
  const { locale } = params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <TermsOfServiceClient locale={locale} />;
}

