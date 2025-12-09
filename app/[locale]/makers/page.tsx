import { notFound } from 'next/navigation';
import MakersPageClient from './page-client';
import { makersAPI } from '@/lib/api';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: {
    page?: string;
    country?: string;
    language?: string;
    search?: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default async function MakersPage({ params, searchParams }: PageProps) {
  let locale: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params in makers page:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  // Fetch makers from API with error handling
  let makers: any[] = [];
  let pagination = { page: 1, pageSize: 20, total: 0, totalPages: 0 };
  let error: string | null = null;

  try {
    const response = await makersAPI.getAll({
      page: parseInt(searchParams.page || '1'),
      limit: 100, // Fetch more for client-side filtering/pagination
      country: searchParams.country,
      language: searchParams.language,
      search: searchParams.search,
    });
    makers = response.makers || [];
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
    console.error('Error fetching makers:', err);
    error = err.response?.data?.message || err.message || 'Failed to load makers';
  }

  return (
    <MakersPageClient 
      locale={locale} 
      makers={makers} 
      pagination={pagination}
      error={error}
    />
  );
}
