import { notFound } from 'next/navigation';
import MakerDetailClient from '@/components/makers/MakerDetailClient';
import { Maker, Product } from '@/types';
import { PRODUCTS_ENDPOINT, normalizeProduct } from '@/lib/product-utils';
import { MAKERS_ENDPOINT, deriveMakerFromProduct, normalizeMaker } from '@/lib/maker-utils';

interface LocaleMakerPageProps {
  params: {
    locale: string;
    makerId: string;
  };
}

async function fetchMaker(makerId: string): Promise<Maker | null> {
  try {
    const response = await fetch(`${MAKERS_ENDPOINT}/${makerId}`, {
      next: { revalidate: 120 },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch maker ${makerId}: ${response.status}`);
    }

    const json = await response.json();
    const payload = json.data ?? json;
    return normalizeMaker(payload);
  } catch (error) {
    console.error('[MakerPage] Failed to fetch maker details:', error);
    return null;
  }
}

async function fetchMakerProducts(makerId: string): Promise<Product[]> {
  try {
    const response = await fetch(`${PRODUCTS_ENDPOINT}?makerId=${encodeURIComponent(makerId)}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch maker products ${makerId}: ${response.status}`);
    }

    const json = await response.json();
    const items = Array.isArray(json.data) ? json.data : [];
    const normalized = items.map(normalizeProduct);

    const filtered = normalized.filter((product: Product) => product.userId === makerId || product.maker?.id === makerId);
    return filtered.length > 0 ? filtered : normalized;
  } catch (error) {
    console.error('[MakerPage] Failed to fetch maker products:', error);
    return [];
  }
}

export default async function LocaleMakerPage({ params }: LocaleMakerPageProps) {
  const { locale, makerId } = params;

  const [maker, products] = await Promise.all([fetchMaker(makerId), fetchMakerProducts(makerId)]);

  const fallbackMaker = maker ?? (() => {
    const referenceProduct = products.find((product) => product.maker?.id === makerId || product.userId === makerId);
    if (!referenceProduct) {
      return null;
    }
    return deriveMakerFromProduct({
      makerId,
      name: referenceProduct.maker?.name,
      profilePicture: referenceProduct.maker?.profilePicture,
    });
  })();

  if (!fallbackMaker) {
    notFound();
  }

  return <MakerDetailClient locale={locale} maker={fallbackMaker} products={products} />;
}

