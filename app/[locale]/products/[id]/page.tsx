import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductDetailClient from './page-client';
import { productsAPI } from '@/lib/api';

interface PageProps {
  params: {
    locale: string;
    id: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = params;
  
  // Get base URL for metadataBase
  const metadataBaseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 
                          'https://banda-chao-frontend.onrender.com';
  
  try {
    const response = await productsAPI.getById(id);
    const product = response.product;

    if (product) {
      return {
        metadataBase: new URL(metadataBaseUrl),
        title: `${product.name} - Banda Chao`,
        description: product.description || `Buy ${product.name} from Banda Chao`,
        openGraph: {
          title: product.name,
          description: product.description || `Buy ${product.name} from Banda Chao`,
          images: product.images?.[0]?.url || product.imageUrl ? [product.images[0].url || product.imageUrl] : [],
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return {
    metadataBase: new URL(metadataBaseUrl),
    title: 'Product - Banda Chao',
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { locale, id } = params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  try {
    const response = await productsAPI.getById(id);
    const product = response.product;

    if (!product) {
      notFound();
    }

    // Fetch other products from same maker
    let relatedProducts: any[] = [];
    if (product.makerId) {
      try {
        const relatedResponse = await productsAPI.getByMaker(product.makerId, { limit: 4 });
        relatedProducts = (relatedResponse.products || []).filter((p: any) => p.id !== product.id);
      } catch (error) {
        console.error('Error fetching related products:', error);
      }
    }

    return (
      <ProductDetailClient
        locale={locale}
        product={product}
        relatedProducts={relatedProducts}
      />
    );
  } catch (error) {
    console.error('Error fetching product details:', error);
    notFound();
  }
}

