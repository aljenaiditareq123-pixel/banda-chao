import { notFound } from 'next/navigation';
import LoginPageClient from './page-client';

interface PageProps {
  params: {
    locale: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default function LoginPage({ params }: PageProps) {
  const { locale } = params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <LoginPageClient locale={locale} />;
}



