import { notFound } from 'next/navigation';
import MakerJoinClient from './page-client';

interface PageProps {
  params: {
    locale: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default async function MakerJoinPage({ params }: PageProps) {
  const { locale } = params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <MakerJoinClient locale={locale} />;
}


