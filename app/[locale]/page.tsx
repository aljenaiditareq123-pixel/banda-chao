import HomePageClient from '@/components/home/HomePageClient';
import { Product } from '@/types';
import { PRODUCTS_ENDPOINT, normalizeProduct } from '@/lib/product-utils';

interface LocalePageProps {
  params: {
    locale: string;
  };
}

async function fetchLatestProducts(): Promise<Product[]> {
  try {
    const response = await fetch(PRODUCTS_ENDPOINT, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    const json = await response.json();
    const items = Array.isArray(json.data) ? json.data : [];

    return items.slice(0, 8).map(normalizeProduct);
  } catch (error) {
    console.error('[HomePage] Failed to load products from backend:', error);
    return [];
  }
}

export default async function LocaleHomePage({ params }: LocalePageProps) {
  const { locale } = params;
  const products = await fetchLatestProducts();

  return <HomePageClient locale={locale} products={products} />;
}