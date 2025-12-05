import { notFound } from 'next/navigation';
import SignupPageClient from '../../signup/page-client';

interface PageProps {
  params: {
    locale: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default function RegisterPage({ params }: PageProps) {
  const { locale } = params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <SignupPageClient locale={locale} />;
}

