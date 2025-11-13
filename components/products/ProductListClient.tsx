'use client';

import { useEffect, useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Grid, GridItem } from '@/components/Grid';
import Button from '@/components/Button';
import ProductCard from '@/components/ProductCard';
import ProductFilters, { FilterState } from '@/components/products/ProductFilters';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product } from '@/types';

interface ProductListClientProps {
  locale: string;
  products: Product[];
}

export default function ProductListClient({ locale, products: initialProducts }: ProductListClientProps) {
  const { setLanguage, t } = useLanguage();
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: { min: null, max: null },
    makers: [],
  });
  const [loading, setLoading] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    if (locale === 'zh' || locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    } else {
      setLanguage('zh');
    }
  }, [locale, setLanguage]);

  // Apply filters to products
  useEffect(() => {
    applyFilters();
  }, [filters, initialProducts]);

  const applyFilters = async () => {
    setLoading(true);
    
    try {
      // Build query parameters
      const params: any = {};
      
      if (filters.categories.length > 0) {
        params.category = filters.categories.join(',');
      }
      
      if (filters.priceRange.min !== null) {
        params.minPrice = filters.priceRange.min;
      }
      
      if (filters.priceRange.max !== null) {
        params.maxPrice = filters.priceRange.max;
      }
      
      if (filters.makers.length > 0) {
        params.makerIds = filters.makers.join(',');
      }

      // If no filters, use initial products
      if (Object.keys(params).length === 0) {
        setFilteredProducts(initialProducts);
        setLoading(false);
        return;
      }

      // Fetch filtered products from API
      const { productsAPI } = await import('@/lib/api');
      const response = await productsAPI.getProducts(params.category);
      const apiProducts = response.data?.data || response.data || [];
      
      // Apply client-side filtering for price and makers (if API doesn't support them)
      let filtered = apiProducts.map((p: any) => ({
        id: p.id,
        userId: p.userId,
        name: p.name,
        description: p.description,
        price: p.price,
        images: p.imageUrl ? [p.imageUrl] : [],
        category: p.category,
        stock: 0,
        rating: 0,
        reviewCount: 0,
        createdAt: p.createdAt,
        externalLink: p.externalLink,
        maker: p.maker || p.user,
      }));

      // Filter by price range
      if (filters.priceRange.min !== null || filters.priceRange.max !== null) {
        filtered = filtered.filter((product: Product) => {
          if (product.price === null) return false;
          const price = product.price;
          const min = filters.priceRange.min ?? 0;
          const max = filters.priceRange.max ?? Infinity;
          return price >= min && price <= max;
        });
      }

      // Filter by makers
      if (filters.makers.length > 0) {
        filtered = filtered.filter((product: Product) => {
          const makerId = product.maker?.id || product.userId;
          return filters.makers.includes(makerId);
        });
      }

      setFilteredProducts(filtered);
    } catch (error) {
      console.error('Failed to apply filters:', error);
      // Fallback to client-side filtering
      const filtered = initialProducts.filter((product) => {
        // Category filter
        if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
          return false;
        }

        // Price filter
        if (filters.priceRange.min !== null || filters.priceRange.max !== null) {
          if (product.price === null) return false;
          const price = product.price;
          const min = filters.priceRange.min ?? 0;
          const max = filters.priceRange.max ?? Infinity;
          if (price < min || price > max) return false;
        }

        // Maker filter
        if (filters.makers.length > 0) {
          const makerId = product.maker?.id || product.userId;
          if (!filters.makers.includes(makerId)) return false;
        }

        return true;
      });
      setFilteredProducts(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <Layout showHeader={false}>
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar - Filters */}
            <aside className="lg:w-72 flex-shrink-0">
              <ProductFilters onFilterChange={handleFilterChange} />
            </aside>

            {/* Main Content */}
            <section className="flex-1">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h1 className="text-3xl font-semibold text-gray-900">{t('productsPageTitle')}</h1>
                  <p className="text-sm text-gray-500">
                    {loading ? (
                      <span>加载中...</span>
                    ) : (
                      <span>
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                        {filteredProducts.length !== initialProducts.length && (
                          <span className="text-[#2E7D32]">
                            {' '}
                            (已筛选 {initialProducts.length - filteredProducts.length} 项)
                          </span>
                        )}
                      </span>
                    )}
                  </p>
                </div>

                {loading ? (
                  <div className="w-full text-center py-12 text-gray-500">
                    加载中...
                  </div>
                ) : (
                  <Grid columns={{ base: 1, sm: 2, md: 3, lg: 3 }} gap="gap-6">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <GridItem key={product.id}>
                          <ProductCard product={product} href={`/${locale}/products/${product.id}`} />
                        </GridItem>
                      ))
                    ) : (
                      <GridItem className="col-span-full">
                        <div className="w-full text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-3xl">
                          {t('noContent')}
                          {Object.keys(filters).some((key) => {
                            const filterKey = key as keyof FilterState;
                            if (filterKey === 'categories') return filters.categories.length > 0;
                            if (filterKey === 'priceRange')
                              return filters.priceRange.min !== null || filters.priceRange.max !== null;
                            if (filterKey === 'makers') return filters.makers.length > 0;
                            return false;
                          }) && (
                            <div className="mt-4">
                              <button
                                onClick={() => setFilters({ categories: [], priceRange: { min: null, max: null }, makers: [] })}
                                className="text-[#2E7D32] hover:underline"
                              >
                                清除筛选条件
                              </button>
                            </div>
                          )}
                        </div>
                      </GridItem>
                    )}
                  </Grid>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}

