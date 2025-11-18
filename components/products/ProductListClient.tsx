'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Grid, GridItem } from '@/components/Grid';
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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
  }, [filters, initialProducts]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <Layout showHeader={false}>
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10">

            <aside className="lg:w-72 flex-shrink-0">
              <ProductFilters onFilterChange={handleFilterChange} />
            </aside>

            <section className="flex-1">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h1 className="text-3xl font-semibold text-gray-900">{t('productsPageTitle') || 'Products'}</h1>

                  <p className="text-sm text-gray-500">
                    {loading ? (
                      <span>Loading...</span>
                    ) : (
                      <span>
                        {filteredProducts.length} items
                      </span>
                    )}
                  </p>
                </div>

                {/* Category Buttons - 全部, 电子产品, 时尚, 家居, 运动 */}
                <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200">
                  <button
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, categories: [] }));
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      filters.categories.length === 0
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-label="全部 - All categories"
                  >
                    全部
                  </button>
                  {['电子产品', '时尚', '家居', '运动'].map((category) => {
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
                  <div className="w-full text-center py-12 text-gray-500">Loading...</div>
                ) : (
                  <>
                    <Grid columns={{ base: 1, sm: 2, md: 3, lg: 3 }} gap="gap-6">
                      {filteredProducts.length > 0 ? (
                        filteredProducts
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((product) => (
                            <GridItem key={product.id}>
                              <ProductCard product={product} href={`/${locale}/products/${product.id}`} />
                            </GridItem>
                          ))
                      ) : (
                        <GridItem className="col-span-full">
                          <div className="w-full text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-3xl">
                            {filters.categories.length === 1 ? (
                              <p className="text-lg">
                                {t('noContent') || '暂无内容'} - {filters.categories[0]}分类的商品
                              </p>
                            ) : (
                              <p className="text-lg">{t('noContent') || '暂无内容'}</p>
                            )}
                          </div>
                        </GridItem>
                      )}
                    </Grid>
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
