import { notFound } from 'next/navigation';
import SearchPageClient from './page-client';
import { searchAPI } from '@/lib/api';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function SearchPage({ params, searchParams }: PageProps) {
  let locale: string;
  let query: string = '';
  let category: string | undefined;
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  let page: number = 1;

  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;

    const resolvedSearchParams = await searchParams;
    query = resolvedSearchParams.q || '';
    category = resolvedSearchParams.category;
    minPrice = resolvedSearchParams.minPrice ? parseFloat(resolvedSearchParams.minPrice) : undefined;
    maxPrice = resolvedSearchParams.maxPrice ? parseFloat(resolvedSearchParams.maxPrice) : undefined;
    page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1;
  } catch (error) {
    console.error('Error resolving params:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  // Fetch search results
  let searchResults: any = {
    products: [],
    total: 0,
    keywords: [],
    suggestions: [],
  };

  if (query.trim()) {
    try {
      const result = await searchAPI.search(query, {
        locale,
        category,
        minPrice,
        maxPrice,
        limit: 24,
        offset: (page - 1) * 24,
      });

      if (result.success) {
        searchResults = {
          products: result.products || [],
          total: result.total || 0,
          keywords: result.keywords || [],
          suggestions: result.suggestions || [],
        };
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  }

  return (
    <SearchPageClient
      locale={locale}
      query={query}
      searchResults={searchResults}
      filters={{
        category,
        minPrice,
        maxPrice,
      }}
      page={page}
    />
  );
}
