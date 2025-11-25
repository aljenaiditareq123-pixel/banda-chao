import { notFound } from 'next/navigation';
import VideosPageClient from './page-client';
import { videosAPI } from '@/lib/api';

interface PageProps {
  params: {
    locale: string;
  };
  searchParams: {
    page?: string;
    type?: 'SHORT' | 'LONG';
    language?: string;
    makerId?: string;
    search?: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default async function VideosPage({ params, searchParams }: PageProps) {
  const { locale } = params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  // Fetch videos from API with error handling
  let videos: any[] = [];
  let pagination = { page: 1, limit: 20, total: 0, totalPages: 0 };
  let error: string | null = null;

  try {
    const response = await videosAPI.getAll({
      page: parseInt(searchParams.page || '1'),
      limit: 20,
      type: searchParams.type,
      language: searchParams.language || locale,
      makerId: searchParams.makerId,
      search: searchParams.search,
    });
    videos = response.videos || [];
    pagination = response.pagination || pagination;
  } catch (err: any) {
    console.error('Error fetching videos:', err);
    error = err.response?.data?.message || err.message || 'Failed to load videos';
  }

  return (
    <VideosPageClient 
      locale={locale} 
      videos={videos} 
      pagination={pagination}
      error={error}
    />
  );
}
