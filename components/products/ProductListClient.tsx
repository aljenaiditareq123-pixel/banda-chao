'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Grid, GridItem } from '@/components/Grid';
import ProductCard from '@/components/ProductCard';
import ProductFilters, { FilterState } from '@/components/products/ProductFilters';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

interface ProductListClientProps {
  locale: string;
  products: Product[];
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'newest';

export default function ProductListClient({ locale, products: initialProducts }: ProductListClientProps) {
  const { setLanguage, t } = useLanguage();

  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: { min: null, max: null },
    makers: [],
  });

  const [loading, setLoading] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [sortedProducts, setSortedProducts] = useState<Product[]>(initialProducts);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Extract unique categories from products
  const availableCategories = Array.from(
    new Set(initialProducts.map((p) => p.category).filter(Boolean))
  ) as string[];

  // Sorting logic
  useEffect(() => {
    let sorted = [...filteredProducts];
    
    switch (sortOption) {
      case 'price-asc':
        sorted.sort((a, b) => {
          const priceA = a.price ?? 0;
          const priceB = b.price ?? 0;
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        sorted.sort((a, b) => {
          const priceA = a.price ?? 0;
          const priceB = b.price ?? 0;
          return priceB - priceA;
        });
        break;
      case 'newest':
        sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      default:
        // Keep original order
        break;
    }
    
    setSortedProducts(sorted);
    setCurrentPage(1); // Reset to first page when sorting changes
  }, [filteredProducts, sortOption]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (locale === 'zh' || locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    } else {
      setLanguage('zh');
    }
  }, [locale, setLanguage]);

  // Local-only filtering (no API requests)
  const applyFilters = () => {
    setLoading(true);
    let filtered = [...initialProducts];

    if (filters.categories.length > 0) {
      filtered = filtered.filter((product) =>
        filters.categories.includes(product.category)
      );
    }

    if (filters.priceRange.min !== null || filters.priceRange.max !== null) {
      filtered = filtered.filter((product) => {
        if (product.price === null || product.price === undefined) return false;
        const price = product.price;
        const min = filters.priceRange.min ?? 0;
        const max = filters.priceRange.max ?? Infinity;
        return price >= min && price <= max;
      });
    }

    if (filters.makers.length > 0) {
      filtered = filtered.filter((product) => {
        const makerId = product.maker?.id || product.userId;
        return filters.makers.includes(makerId);
      });
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
    setLoading(false);
  };

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, initialProducts]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <Layout showHeader={false}>
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10">

            <aside className="lg:w-56 flex-shrink-0">
              <ProductFilters onFilterChange={handleFilterChange} products={initialProducts} />
            </aside>

            <section className="flex-1">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h1 className="text-3xl font-semibold text-gray-900">{t('productsPageTitle') || 'Products'}</h1>

                  <p className="text-sm text-gray-500">
                    {loading ? (
                      <span>{t('loading') || 'Loading...'}</span>
                    ) : (
                      <span>
                        {t('itemsCount')?.replace('{count}', sortedProducts.length.toString()) || `${sortedProducts.length} items`}
                      </span>
                    )}
                  </p>
                </div>

                {/* Sorting Bar - Only show for Chinese locale */}
                {locale === 'zh' && (
                  <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200">
                    <button
                      onClick={() => setSortOption('default')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        sortOption === 'default'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      综合排序
                    </button>
                    <button
                      onClick={() => setSortOption('price-asc')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        sortOption === 'price-asc'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      价格从低到高
                    </button>
                    <button
                      onClick={() => setSortOption('price-desc')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        sortOption === 'price-desc'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      价格从高到低
                    </button>
                    <button
                      onClick={() => setSortOption('newest')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        sortOption === 'newest'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      最新上架
                    </button>
                  </div>
                )}

                {/* Category Quick Filter Buttons */}
                <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200">
                  <button
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, categories: [] }));
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      filters.categories.length === 0
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-label={t('allCategories') || 'All categories'}
                  >
                    {t('allCategories') || 'All'}
                  </button>
                  {availableCategories.map((category) => {
                    const isActive = filters.categories.includes(category);
                    return (
                      <button
                        key={category}
                        onClick={() => {
                          if (isActive) {
                            setFilters((prev) => ({
                              ...prev,
                              categories: prev.categories.filter((c) => c !== category),
                            }));
                          } else {
                            setFilters((prev) => ({
                              ...prev,
                              categories: [...prev.categories, category],
                            }));
                          }
                          setCurrentPage(1);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          isActive
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        aria-label={`${category} category filter`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>

                {loading ? (
                  <div className="w-full py-16">
                    <LoadingSpinner size="lg" className="mx-auto" />
                  </div>
                ) : (
                  <>
                    <Grid columns={{ base: 1, sm: 2, md: 3, lg: locale === 'zh' ? 4 : 3 }} gap="gap-6">
                      {paginatedProducts.length > 0 ? (
                        paginatedProducts.map((product) => (
                          <GridItem key={product.id}>
                            <ProductCard product={product} href={`/${locale}/products/${product.id}`} locale={locale} />
                          </GridItem>
                        ))
                      ) : (
                        <GridItem className="col-span-full">
                          <EmptyState
                            icon="📦"
                            title={
                              filters.categories.length === 1
                                ? t('noProductsInCategory') || t('noContent') || 'No products in this category'
                                : t('noContent') || 'No products available'
                            }
                            description={
                              filters.categories.length === 1
                                ? t('noProductsInCategory') || 'This category has no products yet.'
                                : t('noProductsDescription') || 'No products available at the moment.'
                            }
                          />
                        </GridItem>
                      )}
                    </Grid>

                    {/* Pagination */}
                    {sortedProducts.length > itemsPerPage && (
                      <div className="flex items-center justify-center gap-2 pt-8 border-t border-gray-200">
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          aria-label="Previous page"
                        >
                          {t('previous') || 'Previous'}
                        </button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                                  currentPage === pageNum
                                    ? 'bg-primary-600 text-white'
                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                                aria-label={`Page ${pageNum}`}
                                aria-current={currentPage === pageNum ? 'page' : undefined}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          aria-label="Next page"
                        >
                          {t('next') || 'Next'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
