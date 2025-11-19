import ProductListClient from '@/components/products/ProductListClient';
import { Product } from '@/types';
import { normalizeProduct } from '@/lib/product-utils';
import { getApiBaseUrl } from '@/lib/api-utils';
import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';

interface LocaleProductsPageProps {
  params: {
    locale: string;
  };
  searchParams?: {
    category?: string;
    page?: string;
  };
}

async function fetchAllProducts(): Promise<Product[]> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const json = await fetchJsonWithRetry(`${apiBaseUrl}/products`, {
      next: { revalidate: 60 },
      maxRetries: 2,
      retryDelay: 1000,
    });

    const items = Array.isArray(json.data) ? json.data : [];
    return items.map(normalizeProduct);
  } catch (error) {
    console.error('[ProductListPage] Failed to load products from backend:', error);
    return [];
  }
}

export default async function LocaleProductsPage({ params }: LocaleProductsPageProps) {
  const { locale } = params;
  const products = await fetchAllProducts();

  return <ProductListClient locale={locale} products={products} />;
}
