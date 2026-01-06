'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Filter, X, SlidersHorizontal, Grid3x3, List } from 'lucide-react';
import SmartSearchBar from '@/components/search/SmartSearchBar';
import ProductCard from '@/components/cards/ProductCard';
import EmptyState from '@/components/common/EmptyState';

interface SearchPageClientProps {
  locale: string;
  query: string;
  searchResults: {
    products: any[];
    total: number;
    keywords: string[];
    suggestions: string[];
  };
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  page: number;
}

const categories = [
  { value: 'Fashion', label: { ar: 'أزياء', en: 'Fashion', zh: '时尚' } },
  { value: 'Electronics', label: { ar: 'إلكترونيات', en: 'Electronics', zh: '电子产品' } },
  { value: 'Beauty', label: { ar: 'جمال', en: 'Beauty', zh: '美容' } },
  { value: 'Home', label: { ar: 'منزل', en: 'Home', zh: '家居' } },
  { value: 'Sports', label: { ar: 'رياضة', en: 'Sports', zh: '运动' } },
  { value: 'Books', label: { ar: 'كتب', en: 'Books', zh: '书籍' } },
];

// Separate component that uses useSearchParams - must be inside Suspense
function SearchPageContent({
  locale,
  query,
  searchResults,
  filters: initialFilters,
  page: initialPage,
}: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState(initialFilters);
  const [priceRange, setPriceRange] = useState({
    min: initialFilters.minPrice?.toString() || '',
    max: initialFilters.maxPrice?.toString() || '',
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    setPriceRange((prev) => ({ ...prev, [type]: value }));
  };

  const applyFilters = (newFilters: typeof filters) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice.toString());
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice.toString());
    
    router.push(`/${locale}/search?${params.toString()}`);
  };

  const handleApplyPriceFilter = () => {
    const newFilters = {
      ...filters,
      minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
      maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
    };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setPriceRange({ min: '', max: '' });
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    router.push(`/${locale}/search?${params.toString()}`);
  };

  const totalPages = Math.ceil(searchResults.total / 24);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SmartSearchBar
            locale={locale}
            className="max-w-3xl mx-auto"
            onSearch={(searchQuery) => {
              router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery)}`);
            }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {query ? (
                <>
                  {locale === 'ar' ? 'نتائج البحث عن' : locale === 'zh' ? '搜索结果' : 'Search Results for'}{' '}
                  <span className="text-primary-600">"{query}"</span>
                </>
              ) : (
                locale === 'ar' ? 'البحث' : locale === 'zh' ? '搜索' : 'Search'
              )}
            </h1>
            {searchResults.total > 0 && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {locale === 'ar'
                  ? `${searchResults.total} منتج`
                  : locale === 'zh'
                  ? `${searchResults.total} 个产品`
                  : `${searchResults.total} products`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {locale === 'ar' ? 'فلاتر' : locale === 'zh' ? '筛选' : 'Filters'}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {locale === 'ar' ? 'الفلاتر' : locale === 'zh' ? '筛选器' : 'Filters'}
              </h2>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {locale === 'ar' ? 'مسح الكل' : locale === 'zh' ? '清除全部' : 'Clear All'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {locale === 'ar' ? 'الفئة' : locale === 'zh' ? '类别' : 'Category'}
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{locale === 'ar' ? 'الكل' : locale === 'zh' ? '全部' : 'All'}</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label[locale as keyof typeof cat.label] || cat.label.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {locale === 'ar' ? 'الحد الأدنى للسعر' : locale === 'zh' ? '最低价格' : 'Min Price'}
                </label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {locale === 'ar' ? 'الحد الأقصى للسعر' : locale === 'zh' ? '最高价格' : 'Max Price'}
                </label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  placeholder="1000"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleApplyPriceFilter}
              className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {locale === 'ar' ? 'تطبيق' : locale === 'zh' ? '应用' : 'Apply'}
            </button>
          </motion.div>
        )}

        {/* Keywords */}
        {searchResults.keywords.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {locale === 'ar' ? 'الكلمات المفتاحية:' : locale === 'zh' ? '关键词：' : 'Keywords:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {searchResults.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {searchResults.products.length > 0 ? (
          <>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
              {searchResults.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.displayName || product.name,
                    description: product.displayDescription || product.description,
                    price: product.price,
                    currency: 'USD',
                    imageUrl: product.imageUrl,
                    category: product.category,
                    userId: product.userId,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt,
                  }}
                  href={`/${locale}/products/${product.id}`}
                  locale={locale}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('page', pageNum.toString());
                      router.push(`/${locale}/search?${params.toString()}`);
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      pageNum === initialPage
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title={locale === 'ar' ? 'لا توجد نتائج' : locale === 'zh' ? '没有结果' : 'No Results'}
            description={
              query
                ? locale === 'ar'
                  ? `لم نجد منتجات تطابق "${query}"`
                  : locale === 'zh'
                  ? `没有找到与"${query}"匹配的产品`
                  : `No products found matching "${query}"`
                : locale === 'ar'
                ? 'ابدأ البحث عن منتجات'
                : locale === 'zh'
                ? '开始搜索产品'
                : 'Start searching for products'
            }
          />
        )}
      </div>
    </div>
  );
}

// Main component that wraps SearchPageContent in Suspense boundary
// This is REQUIRED to prevent React hydration error #310 when using useSearchParams
export default function SearchPageClient(props: SearchPageClientProps) {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={props.locale === 'ar' ? 'rtl' : 'ltr'}>
          <div className="text-gray-600">
            {props.locale === 'ar' ? 'جاري التحميل...' : props.locale === 'zh' ? '加载中...' : 'Loading...'}
          </div>
        </div>
      }
    >
      <SearchPageContent {...props} />
    </Suspense>
  );
}
