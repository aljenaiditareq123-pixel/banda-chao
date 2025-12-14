import { notFound } from 'next/navigation';
import WalletPageClient from './page-client';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function WalletPage({ params }: PageProps) {
  let locale: string;

  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  return <WalletPageClient locale={locale} />;
}
