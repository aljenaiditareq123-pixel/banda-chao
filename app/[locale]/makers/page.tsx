import { notFound } from 'next/navigation';
import MakersPageClient from './page-client';
import { makersAPI } from '@/lib/api';

interface PageProps {
  params: {
    locale: string;
  };
  searchParams: {
    page?: string;
    country?: string;
    language?: string;
    search?: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default async function MakersPage({ params, searchParams }: PageProps) {
  const { locale } = params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  // Fetch makers from API
  let makers: any[] = [];
  let pagination = { page: 1, limit: 20, total: 0, totalPages: 0 };

  try {
    const response = await makersAPI.getAll({
      page: parseInt(searchParams.page || '1'),
      limit: 20,
      country: searchParams.country,
      language: searchParams.language,
      search: searchParams.search,
    });
    makers = response.makers || [];
    pagination = response.pagination || pagination;
  } catch (error) {
    console.error('Error fetching makers:', error);
  }

  return <MakersPageClient locale={locale} makers={makers} pagination={pagination} />;
}

