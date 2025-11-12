import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import { Product } from '@/types';
import { PRODUCTS_ENDPOINT, normalizeProduct } from '@/lib/product-utils';

interface LocaleProductDetailPageProps {
  params: {
    locale: string;
    productId: string;
  };
}

async function fetchProduct(productId: string): Promise<Product | null> {
  try {
    const response = await fetch(`${PRODUCTS_ENDPOINT}/${productId}`, {
      next: { revalidate: 60 },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }

    const json = await response.json();
    const item = json.data ?? json;
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
