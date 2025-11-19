import ProductListClient from '@/components/products/ProductListClient';
import { Product } from '@/types';
import { normalizeProduct } from '@/lib/product-utils';
import { getApiBaseUrl } from '@/lib/api-utils';

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
    const response = await fetch(`${apiBaseUrl}/products`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    const json = await response.json();
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
