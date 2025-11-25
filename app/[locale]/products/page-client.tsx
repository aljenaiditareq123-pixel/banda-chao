'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Grid, GridItem } from '@/components/Grid';
import ProductCard from '@/components/cards/ProductCard';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/Button';
import { useClientFilters } from '@/hooks/useClientFilters';
import { productsAPI } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images?: Array<{ url: string; alt?: string }>;
  imageUrl?: string;
  category?: string;
  makerId?: string;
  maker?: {
    id: string;
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
  products: initialProducts, 
  pagination: initialPagination,
  loading = false,
  error = null,
  onRetry 
}: ProductsPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [retryLoading, setRetryLoading] = useState(false);
  
  // Read and normalize page from URL
  const normalizePage = (pageParam: string | null): number => {
    if (!pageParam) return 1;
    const parsed = parseInt(pageParam, 10);
    if (isNaN(parsed) || parsed < 1) return 1;
    return parsed;
  };

  // State for filters (read from URL initially)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedMakerId, setSelectedMakerId] = useState(searchParams.get('makerId') || '');
  const [products, setProducts] = useState(initialProducts);
  
  // Get unique categories and makers from products
  const { categories, makers } = useMemo(() => {
    const cats = new Set<string>();
    const makerMap = new Map<string, { id: string; displayName: string }>();
    
    products.forEach((product) => {
      if (product.category) {
        cats.add(product.category);
      }
      if (product.makerId && product.maker) {
        makerMap.set(product.makerId, product.maker);
      }
    });
    
    return {
      categories: Array.from(cats).sort(),
      makers: Array.from(makerMap.values()),
    };
  }, [products]);

  // Apply client-side filtering
  const filteredProducts = useClientFilters({
    items: products,
    filters: {
      search: searchQuery,
      category: selectedCategory || undefined,
      makerId: selectedMakerId || undefined,
    },
    getSearchableText: (item) => `${item.name} ${item.description || ''}`,
    getCategory: (item) => item.category,
    getMakerId: (item) => item.makerId,
  });

  // Calculate pagination
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const urlPage = normalizePage(searchParams.get('page'));
  const [currentPage, setCurrentPage] = useState(() => {
    // Clamp to valid range
    if (urlPage > totalPages && totalPages > 0) return totalPages;
    return urlPage;
  });

  // Update currentPage when URL changes or totalPages changes
  useEffect(() => {
    const urlPage = normalizePage(searchParams.get('page'));
    const clampedPage = urlPage > totalPages && totalPages > 0 ? totalPages : (urlPage < 1 ? 1 : urlPage);
    if (clampedPage !== currentPage) {
      setCurrentPage(clampedPage);
    }
  }, [searchParams, totalPages]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedMakerId]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, pageSize]);

  // Update URL when filters or page change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedMakerId) params.set('makerId', selectedMakerId);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const newUrl = `/${locale}/products${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, selectedCategory, selectedMakerId, currentPage, locale, router]);

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Retry function
  const handleRetry = async () => {
    setRetryLoading(true);
    try {
      const response = await productsAPI.getAll({
        limit: 100,
        category: selectedCategory || undefined,
        makerId: selectedMakerId || undefined,
        search: searchQuery || undefined,
      });
      setProducts(response.products || []);
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setRetryLoading(false);
    }
  };

  const handleFilterChange = (type: 'category' | 'maker' | 'search', value: string) => {
    if (type === 'category') {
      setSelectedCategory(value === selectedCategory ? '' : value);
    } else if (type === 'maker') {
      setSelectedMakerId(value === selectedMakerId ? '' : value);
    } else if (type === 'search') {
      setSearchQuery(value);
    }
  };

  if (loading || retryLoading) {
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
          <ErrorState 
            message={error} 
            onRetry={onRetry || handleRetry} 
            locale={locale} 
          />
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'بحث' : locale === 'zh' ? '搜索' : 'Search'}
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder={locale === 'ar' ? 'ابحث عن منتج...' : locale === 'zh' ? '搜索产品...' : 'Search products...'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'الفئة' : locale === 'zh' ? '类别' : 'Category'}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">{locale === 'ar' ? 'جميع الفئات' : locale === 'zh' ? '所有类别' : 'All Categories'}</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Maker Filter */}
            {makers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'الصانع' : locale === 'zh' ? '制作者' : 'Maker'}
                </label>
                <select
                  value={selectedMakerId}
                  onChange={(e) => handleFilterChange('maker', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">{locale === 'ar' ? 'جميع الصانعين' : locale === 'zh' ? '所有制作者' : 'All Makers'}</option>
                  {makers.map((maker) => (
                    <option key={maker.id} value={maker.id}>
                      {maker.displayName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Active Filters */}
          {(selectedCategory || selectedMakerId || searchQuery) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">{locale === 'ar' ? 'الفلاتر النشطة:' : 'Active filters:'}</span>
              {searchQuery && (
                <span className="px-3 py-1 bg-primary-100 text-primary rounded-full text-sm">
                  {locale === 'ar' ? 'بحث:' : 'Search:'} {searchQuery}
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mr-2 hover:text-primary-700"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="px-3 py-1 bg-primary-100 text-primary rounded-full text-sm">
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="mr-2 hover:text-primary-700"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedMakerId && (
                <span className="px-3 py-1 bg-primary-100 text-primary rounded-full text-sm">
                  {makers.find(m => m.id === selectedMakerId)?.displayName}
                  <button
                    onClick={() => setSelectedMakerId('')}
                    className="mr-2 hover:text-primary-700"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {paginatedItems.length > 0 ? (
          <>
            <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="gap-6">
              {paginatedItems.map((product) => {
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  onClick={handlePreviousPage}
                  disabled={currentPage <= 1}
                  variant="secondary"
                >
                  {locale === 'ar' ? 'السابق' : locale === 'zh' ? '上一页' : 'Previous'}
                </Button>
                <span className="text-gray-600">
                  {locale === 'ar' 
                    ? `صفحة ${currentPage} من ${totalPages}`
                    : locale === 'zh'
                    ? `第 ${currentPage} 页，共 ${totalPages} 页`
                    : `Page ${currentPage} of ${totalPages}`
                  }
                </span>
                <Button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  variant="secondary"
                >
                  {locale === 'ar' ? 'التالي' : locale === 'zh' ? '下一页' : 'Next'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon="🛍️"
            title={locale === 'ar' ? 'لا توجد منتجات' : locale === 'zh' ? '没有产品' : 'No products found'}
            message={
              searchQuery || selectedCategory || selectedMakerId
                ? (locale === 'ar' 
                    ? 'لم يتم العثور على منتجات تطابق الفلاتر المحددة.'
                    : locale === 'zh'
                    ? '没有找到匹配筛选条件的产品。'
                    : 'No products match the selected filters.')
                : (locale === 'ar' 
                    ? 'لم يتم العثور على منتجات في الوقت الحالي.'
                    : locale === 'zh'
                    ? '目前没有产品。'
                    : 'No products available at the moment.')
            }
          />
        )}
      </div>
    </div>
  );
}
