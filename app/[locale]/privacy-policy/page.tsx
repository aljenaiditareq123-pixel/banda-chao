import { notFound } from 'next/navigation';
import PrivacyPolicyClient from './page-client';

interface PageProps {
  params: {
    locale: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default function PrivacyPolicyPage({ params }: PageProps) {
  const { locale } = params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <PrivacyPolicyClient locale={locale} />;
}

