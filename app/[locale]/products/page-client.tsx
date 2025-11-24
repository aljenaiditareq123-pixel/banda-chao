'use client';

import { Grid, GridItem } from '@/components/Grid';
import ProductCard from '@/components/cards/ProductCard';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images?: Array<{ url: string; alt?: string }>;
  imageUrl?: string;
  maker?: {
    displayName: string;
  };
}

interface ProductsPageClientProps {
  locale: string;
  products: Product[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function ProductsPageClient({ 
  locale, 
  products, 
  pagination,
  loading = false,
  error = null,
  onRetry 
}: ProductsPageClientProps) {
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState message={locale === 'ar' ? 'جاري التحميل...' : 'Loading...'} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {locale === 'ar' ? 'المنتجات' : locale === 'zh' ? '产品' : 'Products'}
        </h1>

        {products.length > 0 ? (
          <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="gap-6">
            {products.map((product) => {
              const imageUrl = product.images?.[0]?.url || product.imageUrl || '';
              
              return (
                <GridItem key={product.id}>
                  <ProductCard
                    product={{
                      ...product,
                      imageUrl,
                    }}
                    href={`/${locale}/products/${product.id}`}
                  />
                </GridItem>
              );
            })}
          </Grid>
        ) : (
          <EmptyState
            icon="🛍️"
            title={locale === 'ar' ? 'لا توجد منتجات' : locale === 'zh' ? '没有产品' : 'No products found'}
            message={locale === 'ar' ? 'لم يتم العثور على منتجات في الوقت الحالي.' : 'No products available at the moment.'}
          />
        )}
      </div>
    </div>
  );
}
