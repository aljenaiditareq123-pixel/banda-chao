import { redirect } from 'next/navigation';

interface RegisterRedirectPageProps {
  params: {
    locale: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default function RegisterRedirectPage({ params }: RegisterRedirectPageProps) {
  const { locale } = params;

  if (!validLocales.includes(locale)) {
    redirect('/en/auth/register');
  }

  redirect(`/${locale}/auth/register`);
}



