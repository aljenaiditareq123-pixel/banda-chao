import { redirect } from 'next/navigation';

interface LoginRedirectPageProps {
  params: {
    locale: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default function LoginRedirectPage({ params }: LoginRedirectPageProps) {
  const { locale } = params;

  if (!validLocales.includes(locale)) {
    redirect('/en/auth/login');
  }

  redirect(`/${locale}/auth/login`);
}



