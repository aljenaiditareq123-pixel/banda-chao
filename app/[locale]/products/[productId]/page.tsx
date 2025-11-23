import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import { Product } from '@/types';
import { normalizeProduct } from '@/lib/product-utils';
import { getApiBaseUrl } from '@/lib/api-utils';
import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';
import type { Metadata } from 'next';

interface LocaleProductDetailPageProps {
  params: {
    locale: string;
    productId: string;
  };
}

/**
 * Fetch product by ID
 * Uses fetchJsonWithRetry for consistent error handling and retry logic
 * Locale is NOT used in the API path - products are fetched by ID only
 */
async function fetchProduct(productId: string): Promise<Product | null> {
  try {
    // Always fetch from /api/v1/products/{id} - locale-independent
    const apiBaseUrl = getApiBaseUrl();
    const productUrl = `${apiBaseUrl}/products/${productId}`;
    
    const json = await fetchJsonWithRetry(productUrl, {
      next: { revalidate: 60 }, // 1 minute cache
      maxRetries: 2,
      retryDelay: 1000,
    });

    // Handle different response formats
    // If response is an array (unexpected), return null
    if (Array.isArray(json)) {
      console.warn(`[ProductDetailPage] Got array instead of product object for ID: ${productId}`);
      return null;
    }

    // If response has error property or missing id, product not found
    if (json.error || !json.id) {
      console.warn(`[ProductDetailPage] Product not found or error: ${json.error || 'No ID'}`);
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

export async function generateMetadata({ params }: LocaleProductDetailPageProps): Promise<Metadata> {
  const { locale, productId } = params;
  const product = await fetchProduct(productId);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const titles: Record<string, string> = {
    zh: `${product.name} - Banda Chao 商品详情`,
    ar: `${product.name} - Banda Chao تفاصيل المنتج`,
    en: `${product.name} - Banda Chao Product Details`,
  };

  return {
    title: titles[locale] || titles.en,
    description: product.description || `${product.name} from Banda Chao`,
  };
}

export default async function LocaleProductDetailPage({ params }: LocaleProductDetailPageProps) {
  const { locale, productId } = params;
  
  // Fetch product (locale-independent)
  const product = await fetchProduct(productId);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient locale={locale} product={product} />;
}
