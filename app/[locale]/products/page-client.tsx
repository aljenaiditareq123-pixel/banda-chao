'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Grid, GridItem } from '@/components/Grid';
import ProductCard from '@/components/cards/ProductCard';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/Button';
import Card from '@/components/common/Card';
import { productsAPI, GetProductsParams } from '@/lib/api';

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
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || searchParams.get('search_term') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || searchParams.get('category_id') || '');
  const [selectedMakerId, setSelectedMakerId] = useState(searchParams.get('makerId') || '');
  const [minPrice, setMinPrice] = useState<string>(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get('max_price') || '');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort_by') || 'created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>((searchParams.get('sort_order') as 'asc' | 'desc') || 'desc');
  const [currentPage, setCurrentPage] = useState(() => normalizePage(searchParams.get('page')));
  
  const [products, setProducts] = useState(initialProducts);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(error);
  
  // Get unique categories from products (for filter dropdown)
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((product) => {
      if (product.category) {
        cats.add(product.category);
      }
    });
    return Array.from(cats).sort();
  }, [products]);

  // Get unique makers from products (for filter dropdown)
  const makers = useMemo(() => {
    const makerMap = new Map<string, { id: string; displayName: string }>();
    products.forEach((product) => {
      if (product.makerId && product.maker) {
        makerMap.set(product.makerId, product.maker);
      }
    });
    return Array.from(makerMap.values());
  }, [products]);

  // Fetch products from API with filters
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setErrorState(null);
    
    try {
      const params: GetProductsParams = {
        page: currentPage,
        limit: 12,
        search_term: searchQuery || undefined,
        category: selectedCategory || undefined,
        category_id: selectedCategory || undefined,
        makerId: selectedMakerId || undefined,
        min_price: minPrice ? parseFloat(minPrice) : undefined,
        max_price: maxPrice ? parseFloat(maxPrice) : undefined,
        sort_by: sortBy as GetProductsParams['sort_by'],
        sort_order: sortOrder,
      };

      const response = await productsAPI.getAll(params);
      
      setProducts(response.products || []);
      if (response.pagination) {
        setPagination({
          page: response.pagination.page || currentPage,
          pageSize: response.pagination.pageSize || response.pagination.limit || 12,
          total: response.pagination.total || 0,
          totalPages: response.pagination.totalPages || 1,
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : (locale === 'ar' ? 'حدث خطأ أثناء جلب المنتجات' : 'Failed to fetch products');
      console.error('Error fetching products:', err);
      setErrorState(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory, selectedMakerId, minPrice, maxPrice, sortBy, sortOrder, locale]);

  // Fetch products when filters or page change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL when filters or page change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search_term', searchQuery);
    if (selectedCategory) params.set('category_id', selectedCategory);
    if (selectedMakerId) params.set('makerId', selectedMakerId);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (sortBy !== 'created_at') params.set('sort_by', sortBy);
    if (sortOrder !== 'desc') params.set('sort_order', sortOrder);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const newUrl = `/${locale}/products${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, selectedCategory, selectedMakerId, minPrice, maxPrice, sortBy, sortOrder, currentPage, locale, router]);

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Retry function
  const handleRetry = async () => {
    await fetchProducts();
  };

  const handleFilterChange = (type: 'category' | 'maker' | 'search', value: string) => {
    if (type === 'category') {
      setSelectedCategory(value === selectedCategory ? '' : value);
    } else if (type === 'maker') {
      setSelectedMakerId(value === selectedMakerId ? '' : value);
    } else if (type === 'search') {
      setSearchQuery(value);
    }
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // fetchProducts will be called by useEffect
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedMakerId('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  if (loading || isLoading || retryLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState message={locale === 'ar' ? 'جاري التحميل...' : locale === 'zh' ? '加载中...' : 'Loading...'} />
        </div>
      </div>
    );
  }

  if (errorState || error) {
    return (
      <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState 
            message={errorState || error || ''} 
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

        {/* Filters Sidebar */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Sidebar */}
          <div className="md:w-1/4">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {locale === 'ar' ? 'تصفية المنتجات' : locale === 'zh' ? '筛选产品' : 'Filter Products'}
                </h2>
                
                <form onSubmit={handleApplyFilters} className="space-y-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'ar' ? 'بحث' : locale === 'zh' ? '搜索' : 'Search'}
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={locale === 'ar' ? 'ابحث بالاسم أو الوصف...' : locale === 'zh' ? '按名称或描述搜索...' : 'Search by name or description...'}
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
                        onChange={(e) => setSelectedCategory(e.target.value)}
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

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'ar' ? 'نطاق السعر' : locale === 'zh' ? '价格范围' : 'Price Range'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder={locale === 'ar' ? 'الحد الأدنى' : locale === 'zh' ? '最低' : 'Min'}
                        min="0"
                        step="0.01"
                        className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder={locale === 'ar' ? 'الحد الأقصى' : locale === 'zh' ? '最高' : 'Max'}
                        min="0"
                        step="0.01"
                        className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'ar' ? 'الترتيب حسب' : locale === 'zh' ? '排序方式' : 'Sort By'}
                    </label>
                    <select
                      value={`${sortBy}_${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split('_');
                        setSortBy(field);
                        setSortOrder(order as 'asc' | 'desc');
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="created_at_desc">{locale === 'ar' ? 'الأحدث أولاً' : locale === 'zh' ? '最新优先' : 'Newest First'}</option>
                      <option value="created_at_asc">{locale === 'ar' ? 'الأقدم أولاً' : locale === 'zh' ? '最旧优先' : 'Oldest First'}</option>
                      <option value="price_asc">{locale === 'ar' ? 'السعر: الأدنى أولاً' : locale === 'zh' ? '价格：从低到高' : 'Price: Low to High'}</option>
                      <option value="price_desc">{locale === 'ar' ? 'السعر: الأعلى أولاً' : locale === 'zh' ? '价格：从高到低' : 'Price: High to Low'}</option>
                      <option value="name_asc">{locale === 'ar' ? 'الاسم: أ-ي' : locale === 'zh' ? '名称：A-Z' : 'Name: A-Z'}</option>
                      <option value="name_desc">{locale === 'ar' ? 'الاسم: ي-أ' : locale === 'zh' ? '名称：Z-A' : 'Name: Z-A'}</option>
                    </select>
                  </div>

                  {/* Maker Filter */}
                  {makers.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {locale === 'ar' ? 'الصانع' : locale === 'zh' ? '制作者' : 'Maker'}
                      </label>
                      <select
                        value={selectedMakerId}
                        onChange={(e) => setSelectedMakerId(e.target.value)}
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

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                    >
                      {locale === 'ar' ? 'تطبيق المرشحات' : locale === 'zh' ? '应用筛选' : 'Apply Filters'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleResetFilters}
                      className="w-full"
                    >
                      {locale === 'ar' ? 'إعادة تعيين' : locale === 'zh' ? '重置' : 'Reset Filters'}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="md:w-3/4">

            {/* Active Filters */}
            {(selectedCategory || selectedMakerId || searchQuery || minPrice || maxPrice) && (
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">{locale === 'ar' ? 'الفلاتر النشطة:' : locale === 'zh' ? '活动筛选:' : 'Active filters:'}</span>
                {searchQuery && (
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
                    {locale === 'ar' ? 'بحث:' : locale === 'zh' ? '搜索:' : 'Search:'} {searchQuery}
                    <button
                      onClick={() => setSearchQuery('')}
                      className="hover:text-primary-700"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory('')}
                      className="hover:text-primary-700"
                    >
                      ×
                    </button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
                    {locale === 'ar' ? 'السعر:' : locale === 'zh' ? '价格:' : 'Price:'} {minPrice || '0'} - {maxPrice || '∞'}
                    <button
                      onClick={() => {
                        setMinPrice('');
                        setMaxPrice('');
                      }}
                      className="hover:text-primary-700"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedMakerId && (
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
                    {makers.find(m => m.id === selectedMakerId)?.displayName}
                    <button
                      onClick={() => setSelectedMakerId('')}
                      className="hover:text-primary-700"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}

            {products.length > 0 ? (
              <>
                <Grid columns={{ base: 1, sm: 2, md: 3, lg: 3 }} gap="gap-6">
                  {products.map((product) => {
                    const imageUrl = product.images?.[0]?.url || product.imageUrl || '';
                    
                    return (
                      <GridItem key={product.id}>
                        <ProductCard
                          product={{
                            ...product,
                            imageUrl,
                            userId: '',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          } as any}
                          href={`/${locale}/products/${product.id}`}
                        />
                      </GridItem>
                    );
                  })}
                </Grid>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
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
                        ? `صفحة ${currentPage} من ${pagination.totalPages}`
                        : locale === 'zh'
                        ? `第 ${currentPage} 页，共 ${pagination.totalPages} 页`
                        : `Page ${currentPage} of ${pagination.totalPages}`
                      }
                    </span>
                    <Button
                      onClick={handleNextPage}
                      disabled={currentPage >= pagination.totalPages}
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
                  searchQuery || selectedCategory || selectedMakerId || minPrice || maxPrice
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
      </div>
    </div>
  );
}
