import ProductListClient from '@/components/products/ProductListClient';
import { Product } from '@/types';
import { normalizeProduct } from '@/lib/product-utils';
import { getApiBaseUrl } from '@/lib/api-utils';
import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';
import type { Metadata } from 'next';

interface LocaleProductsPageProps {
  params: {
    locale: string;
  };
  searchParams?: {
    category?: string;
    page?: string;
  };
}

export async function generateMetadata({ params }: LocaleProductsPageProps): Promise<Metadata> {
  const { locale } = params;
  const validLocale = (locale === 'zh' || locale === 'ar' || locale === 'en') ? locale : 'zh';
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://banda-chao-frontend.onrender.com';

  const titles = {
    zh: '发现好物 — Banda Chao 商品',
    ar: 'Banda Chao - المنتجات',
    en: 'Banda Chao - Products',
  };

  return {
    title: titles[validLocale],
    alternates: {
      canonical: `${baseUrl}/${validLocale}/products`,
    },
  };
}

async function fetchAllProducts(): Promise<Product[]> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const json = await fetchJsonWithRetry(`${apiBaseUrl}/products?limit=100`, {
      next: { revalidate: 300 }, // 5 minutes cache
      maxRetries: 2,
      retryDelay: 1000,
    });

    // Backend returns array directly (not wrapped in { data: [...] })
    const items = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
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
