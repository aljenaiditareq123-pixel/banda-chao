import { redirect } from 'next/navigation';

interface RegisterRedirectPageProps {
  params: Promise<{
    locale: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function RegisterRedirectPage({ params }: RegisterRedirectPageProps) {
  let locale: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params in signup page:', error);
    redirect('/en/auth/register');
    return;
  }

  if (!validLocales.includes(locale)) {
    redirect('/en/auth/register');
  }

  redirect(`/${locale}/auth/register`);
}



