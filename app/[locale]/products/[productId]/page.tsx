import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import { Product } from '@/types';
import { normalizeProduct } from '@/lib/product-utils';
import { getApiBaseUrl } from '@/lib/api-utils';
import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';

interface LocaleProductDetailPageProps {
  params: {
    locale: string;
    productId: string;
  };
}

/**
 * Fetch product by ID
 * Uses fetchJsonWithRetry for consistent error handling and retry logic
 */
async function fetchProduct(productId: string): Promise<Product | null> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const json = await fetchJsonWithRetry(`${apiBaseUrl}/products/${productId}`, {
      next: { revalidate: 60 }, // 1 minute cache
      maxRetries: 2,
      retryDelay: 1000,
    });

    // Backend returns product object directly (not wrapped in { data: {...} })
    // If error or not found
    if (json.error || !json.id) {
      return null;
    }

    // Backend returns product object directly
    const item = json;
    return normalizeProduct(item);
  } catch (error) {
    console.error('[ProductDetailPage] Failed to load product from backend:', error);
    return null;
  }
}

export default async function LocaleProductDetailPage({ params }: LocaleProductDetailPageProps) {
  const { locale, productId } = params;
  const product = await fetchProduct(productId);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient locale={locale} product={product} />;
}
