import { notFound } from 'next/navigation';
import MakerJoinClient from './page-client';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function MakerJoinPage({ params }: PageProps) {
  let locale: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
<<<<<<< HEAD
    console.error('Error resolving params in maker join page:', error);
    notFound();
=======
    console.error('Error resolving params:', error);
    locale = 'en';
>>>>>>> 7ed631c (Fix Upload Button routing: Redirect non-makers to join page correctly)
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <MakerJoinClient locale={locale} />;
}
<<<<<<< HEAD



=======
>>>>>>> 7ed631c (Fix Upload Button routing: Redirect non-makers to join page correctly)
