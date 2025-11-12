'use client';

import { useEffect } from 'react';
import Layout from '@/components/Layout';
import { Grid, GridItem } from '@/components/Grid';
import Button from '@/components/Button';
import ProductCard from '@/components/ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product } from '@/types';

interface ProductListClientProps {
  locale: string;
  products: Product[];
}

export default function ProductListClient({ locale, products }: ProductListClientProps) {
  const { setLanguage, t } = useLanguage();

  useEffect(() => {
    if (locale === 'zh' || locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    } else {
      setLanguage('zh');
    }
  }, [locale, setLanguage]);

  return (
    <Layout showHeader={false}>
      <div className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-8">
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('productsFilterCategoriesTitle')}
                  </h2>
                  <div className="space-y-3 text-sm text-gray-700">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]"
                      />
                      <span>{t('productsFilterCategoryApparel')}</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]"
                      />
                      <span>{t('productsFilterCategoryHomeDecor')}</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#2E7D32] focus:ring-[#2E7D32]"
                      />
                      <span>{t('productsFilterCategoryAccessories')}</span>
                    </label>
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('productsFilterPriceTitle')}
                  </h2>
                  <div className="rounded-2xl border border-dashed border-gray-200 text-sm text-gray-500 p-4 text-center">
                    {t('productsFilterPricePlaceholder')}
                  </div>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('productsFilterMakersTitle')}
                  </h2>
                  <div className="space-y-3 text-sm text-gray-700">
                    <button className="w-full text-left px-4 py-2 rounded-lg border border-gray-200 hover:border-[#2E7D32] hover:text-[#2E7D32] transition">
                      {t('productsFilterMakerA')}
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-lg border border-gray-200 hover:border-[#2E7D32] hover:text-[#2E7D32] transition">
                      {t('productsFilterMakerB')}
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-lg border border-gray-200 hover:border-[#2E7D32] hover:text-[#2E7D32] transition">
                      {t('productsFilterMakerC')}
                    </button>
                  </div>
                </section>
              </div>
            </aside>

            {/* Main Content */}
            <section className="flex-1">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h1 className="text-3xl font-semibold text-gray-900">{t('productsPageTitle')}</h1>
                  <p className="text-sm text-gray-500">
                    {products.length} items • Filters coming soon
                  </p>
                </div>

                <Grid columns={{ base: 1, sm: 2, md: 3, lg: 3 }} gap="gap-6">
                  {products.length > 0 ? (
                    products.map((product) => (
                      <GridItem key={product.id}>
                        <ProductCard product={product} href={`/${locale}/products/${product.id}`} />
                      </GridItem>
                    ))
                  ) : (
                    <GridItem className="col-span-full">
                      <div className="w-full text-center py-12 text-gray-500 border border-dashed border-gray-200 rounded-3xl">
                        {t('noContent')}
                      </div>
                    </GridItem>
                  )}
                </Grid>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}

