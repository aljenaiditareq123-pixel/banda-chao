import { notFound } from 'next/navigation';
import FeedPageClient from './page-client';
import { videosAPI } from '@/lib/api';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function FeedPage({ params }: PageProps) {
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

  // Fetch videos for feed
  let videos: any[] = [];
  try {
    const response = await videosAPI.getAll({ limit: 50, type: 'SHORT' });
    videos = response.videos || [];
  } catch (error) {
    console.error('Error fetching videos:', error);
    // Continue with empty array - will use mock videos
  }

  return <FeedPageClient locale={locale} videos={videos} />;
}
