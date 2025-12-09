import { notFound } from 'next/navigation';
import VideosPageClient from './page-client';
import { videosAPI } from '@/lib/api';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
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
  let locale: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params in videos page:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  // Fetch videos from API with error handling
  let videos: any[] = [];
  let pagination = { page: 1, pageSize: 20, total: 0, totalPages: 0 };
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
    // Map API response pagination to component expected format
    if (response.pagination) {
      pagination = {
        page: response.pagination.page || 1,
        pageSize: response.pagination.pageSize || response.pagination.limit || 20,
        total: response.pagination.total || 0,
        totalPages: response.pagination.totalPages || 0,
      };
    }
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
