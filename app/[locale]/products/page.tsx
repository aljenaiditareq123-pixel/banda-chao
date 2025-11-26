import { notFound } from 'next/navigation';
import ProductsPageClient from './page-client';
import { productsAPI } from '@/lib/api';

interface PageProps {
  params: {
    locale: string;
  };
  searchParams: {
    page?: string;
    category?: string;
    makerId?: string;
    search?: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default async function ProductsPage({ params, searchParams }: PageProps) {
  const { locale } = params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  // Fetch products from API with error handling
  let products: any[] = [];
  let pagination = { page: 1, pageSize: 20, total: 0, totalPages: 0 };
  let error: string | null = null;

  try {
    const response = await productsAPI.getAll({
      page: parseInt(searchParams.page || '1'),
      limit: 100, // Fetch more for client-side filtering/pagination
      category: searchParams.category,
      makerId: searchParams.makerId,
      search: searchParams.search,
    });
    products = response.products || [];
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
    console.error('Error fetching products:', err);
    error = err.response?.data?.message || err.message || 'Failed to load products';
  }

  return (
    <ProductsPageClient 
      locale={locale} 
      products={products} 
      pagination={pagination}
      error={error}
    />
  );
}
