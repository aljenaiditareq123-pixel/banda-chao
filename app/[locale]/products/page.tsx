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

  // Fetch products from API
  let products: any[] = [];
  let pagination = { page: 1, limit: 20, total: 0, totalPages: 0 };

  try {
    const response = await productsAPI.getAll({
      page: parseInt(searchParams.page || '1'),
      limit: 20,
      category: searchParams.category,
      makerId: searchParams.makerId,
      search: searchParams.search,
    });
    products = response.products || [];
    pagination = response.pagination || pagination;
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  return <ProductsPageClient locale={locale} products={products} pagination={pagination} />;
}

