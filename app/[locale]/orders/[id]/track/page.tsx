import { notFound } from 'next/navigation';
import TrackingPageClient from './page-client';
import { trackingAPI } from '@/lib/api';

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function TrackingPage({ params }: PageProps) {
  let locale: string;
  let orderId: string;

  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
    orderId = resolvedParams.id;
  } catch (error) {
    console.error('Error resolving params:', error);
    notFound();
  }

  if (!validLocales.includes(locale) || !orderId) {
    notFound();
  }

  return <TrackingPageClient locale={locale} orderId={orderId} />;
}
