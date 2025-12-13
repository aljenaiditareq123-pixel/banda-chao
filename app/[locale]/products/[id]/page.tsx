import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
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
    
    // Show elegant Product Not Found page instead of default 404
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full text-center">
          <div className="text-9xl mb-6">🔍</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {locale === 'ar' ? 'المنتج غير موجود' : locale === 'zh' ? '产品未找到' : 'Product Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {locale === 'ar' 
              ? 'عذراً، المنتج الذي تبحث عنه غير موجود أو تم حذفه.'
              : locale === 'zh'
              ? '抱歉，您查找的产品不存在或已被删除。'
              : 'Sorry, the product you are looking for does not exist or has been removed.'}
          </p>
          <Link
            href={`/${locale}/products`}
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            {locale === 'ar' ? '← العودة للمنتجات' : locale === 'zh' ? '← 返回产品' : '← Back to Products'}
          </Link>
        </div>
      </div>
    );
  }
}

