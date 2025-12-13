import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductDetailClient from './page-client';
import { productsAPI } from '@/lib/api';
import { getMockProductById, mockProductToApiFormat } from '@/lib/mock-products';

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  let locale: string;
  let id: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
    id = resolvedParams.id;
  } catch (error) {
    console.error('Error resolving params in generateMetadata:', error);
    locale = 'ar';
    id = '';
  }
  
  // Get base URL for metadataBase
  const metadataBaseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 
                          'https://banda-chao-frontend.onrender.com';
  
  // Validate id before making API call
  if (!id || id === 'favicon.ico' || id.includes('.')) {
    return {
      metadataBase: new URL(metadataBaseUrl),
      title: 'Product - Banda Chao',
    };
  }
  
  try {
    const response = await productsAPI.getById(id);
    const product = response?.product;

    if (product) {
      return {
        metadataBase: new URL(metadataBaseUrl),
        title: `${product.name} - Banda Chao`,
        description: product.description || `Buy ${product.name} from Banda Chao`,
        openGraph: {
          title: product.name,
          description: product.description || `Buy ${product.name} from Banda Chao`,
          images: product.images?.[0]?.url ? [product.images[0].url] : product.imageUrl ? [product.imageUrl] : [],
        },
      };
    }
  } catch (error: any) {
    // Try mock data for metadata
    const mockProduct = getMockProductById(id);
    if (mockProduct) {
      const apiFormatProduct = mockProductToApiFormat(mockProduct, locale);
      return {
        metadataBase: new URL(metadataBaseUrl),
        title: `${apiFormatProduct.name} - Banda Chao`,
        description: apiFormatProduct.description || `Buy ${apiFormatProduct.name} from Banda Chao`,
        openGraph: {
          title: apiFormatProduct.name,
          description: apiFormatProduct.description || `Buy ${apiFormatProduct.name} from Banda Chao`,
          images: apiFormatProduct.images?.[0]?.url ? [apiFormatProduct.images[0].url] : apiFormatProduct.imageUrl ? [apiFormatProduct.imageUrl] : [],
        },
      };
    }
    // Silently handle 404 errors - they're expected for invalid product IDs
    if (error?.response?.status !== 404) {
      console.error('Error generating metadata:', error);
    }
  }

  return {
    metadataBase: new URL(metadataBaseUrl),
    title: 'Product - Banda Chao',
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  let locale: string;
  let id: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
    id = resolvedParams.id;
  } catch (error) {
    console.error('Error resolving params:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }
  
  // Validate id - reject file-like paths
  if (!id || id === 'favicon.ico' || id.includes('.')) {
    notFound();
  }

  try {
    const response = await productsAPI.getById(id);
    const product = response.product;

    if (!product) {
      // Try mock data as fallback
      const mockProduct = getMockProductById(id);
      if (mockProduct) {
        const apiFormatProduct = mockProductToApiFormat(mockProduct, locale);
        // Get related products from mock data
        const allMockProducts = require('@/lib/mock-products').getAllMockProducts();
        const relatedProducts = allMockProducts
          .filter((p: any) => p.id !== id && p.maker.id === mockProduct.maker.id)
          .slice(0, 4)
          .map((p: any) => mockProductToApiFormat(p, locale));
        
        return (
          <ProductDetailClient
            locale={locale}
            product={apiFormatProduct}
            relatedProducts={relatedProducts}
          />
        );
      }
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
        // Use mock products as fallback for related products
        const allMockProducts = require('@/lib/mock-products').getAllMockProducts();
        relatedProducts = allMockProducts
          .filter((p: any) => p.id !== id && p.maker.id === product.makerId)
          .slice(0, 4)
          .map((p: any) => mockProductToApiFormat(p, locale));
      }
    }

    return (
      <ProductDetailClient
        locale={locale}
        product={product}
        relatedProducts={relatedProducts}
      />
    );
  } catch (error: any) {
    // Try mock data as fallback before showing 404
    const mockProduct = getMockProductById(id);
    if (mockProduct) {
      const apiFormatProduct = mockProductToApiFormat(mockProduct, locale);
      // Get related products from mock data
      const allMockProducts = require('@/lib/mock-products').getAllMockProducts();
      const relatedProducts = allMockProducts
        .filter((p: any) => p.id !== id && p.maker.id === mockProduct.maker.id)
        .slice(0, 4)
        .map((p: any) => mockProductToApiFormat(p, locale));
      
      return (
        <ProductDetailClient
          locale={locale}
          product={apiFormatProduct}
          relatedProducts={relatedProducts}
        />
      );
    }
    
    // Silently handle 404 errors - they're expected for invalid product IDs
    if (error?.response?.status !== 404 && error?.status !== 404) {
      console.error('Error fetching product details:', error);
    }
    notFound();
  }
}

