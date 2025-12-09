import { notFound } from 'next/navigation';
import LoginPageClient from './page-client';

interface LoginPageProps {
  params: {
    locale: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default function LoginPage({ params }: LoginPageProps) {
  const { locale } = params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  // Render login page directly instead of redirecting
  return <LoginPageClient locale={locale} />;
}



