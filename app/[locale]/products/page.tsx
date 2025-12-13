import ProductsPageClient from './page-client';
import { productsAPI } from '@/lib/api';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    page?: string;
    category?: string;
    makerId?: string;
    search?: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function ProductsPage({ params, searchParams }: PageProps) {
  let locale: string;
  let resolvedSearchParams: {
    page?: string;
    category?: string;
    makerId?: string;
    search?: string;
  };
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
    resolvedSearchParams = await searchParams;
  } catch (error) {
    console.error('Error resolving params:', error);
    locale = 'ar';
    resolvedSearchParams = {};
  }

  // Validate locale and fallback to default if invalid
  if (!validLocales.includes(locale)) {
    console.warn(`Invalid locale: ${locale}, falling back to 'ar'`);
    locale = 'ar';
  }

  // Fetch products from API with error handling
  let products: any[] = [];
  let pagination = { page: 1, pageSize: 20, total: 0, totalPages: 0 };
  let error: string | null = null;

  try {
    const response = await productsAPI.getAll({
      page: parseInt(resolvedSearchParams.page || '1'),
      limit: 100, // Fetch more for client-side filtering/pagination
      category: resolvedSearchParams.category,
      makerId: resolvedSearchParams.makerId,
      search: resolvedSearchParams.search,
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

  // Use mock products as fallback if API fails or returns empty
  if (products.length === 0) {
    const { getAllMockProducts, mockProductToApiFormat } = await import('@/lib/mock-products');
    const mockProducts = getAllMockProducts();
    products = mockProducts.map(p => mockProductToApiFormat(p, locale));
    pagination = {
      page: 1,
      pageSize: products.length,
      total: products.length,
      totalPages: 1,
    };
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
