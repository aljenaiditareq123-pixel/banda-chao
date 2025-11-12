'use client';

import { useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import Button from '@/components/Button';
import ProductCard from '@/components/ProductCard';
import { Grid, GridItem } from '@/components/Grid';
import { useLanguage } from '@/contexts/LanguageContext';
import { Maker, Product } from '@/types';

const COVER_PLACEHOLDER = 'https://via.placeholder.com/1440x480?text=Maker+Cover';
const AVATAR_PLACEHOLDER = 'https://via.placeholder.com/200x200?text=Maker';

interface MakerDetailClientProps {
  locale: string;
  maker: Maker;
  products: Product[];
}

export default function MakerDetailClient({ locale, maker, products }: MakerDetailClientProps) {
  const { setLanguage, t } = useLanguage();

  useEffect(() => {
    if (locale === 'zh' || locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    } else {
      setLanguage('zh');
    }
  }, [locale, setLanguage]);

  const storyParagraphs = useMemo(() => {
    if (maker.story) {
      return maker.story
        .split(/\n+/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
    }
    return [
      t('makerStoryParagraph1'),
      t('makerStoryParagraph2'),
      t('makerStoryParagraph3'),
    ];
  }, [maker.story, t]);

  const displayBio = maker.bio ?? maker.tagline ?? t('makerProfilePlaceholderBio');
  const coverImage = maker.coverImage ?? COVER_PLACEHOLDER;
  const profileImage = maker.profilePicture ?? AVATAR_PLACEHOLDER;

  return (
    <Layout showHeader={false}>
      <div className="bg-gray-50 pb-16">
        <div className="w-full h-64 md:h-80 bg-gray-200 relative">
          <img
            src={coverImage}
            alt={maker.name || t('makerCoverAlt')}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="-mt-16 md:-mt-24 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start space-x-6">
                <div className="h-28 w-28 md:h-36 md:w-36 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
                  <img
                    src={profileImage}
                    alt={maker.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-semibold text-gray-900">{maker.name}</h1>
                  <p className="text-sm text-gray-600 max-w-xl leading-relaxed">
                    {displayBio}
                  </p>
                  {maker.location && (
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      {maker.location}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex md:flex-col gap-3">
                <Button variant="secondary" className="px-6 py-2">
                  {t('makerFollowButton')}
                </Button>
              </div>
            </div>
          </section>

          <section className="mt-10 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">{t('makerStoryTitle')}</h2>
            {storyParagraphs.map((paragraph, index) => (
              <p key={index} className="text-sm text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>

          <section className="mt-10 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">{t('makerCreationsTitle')}</h2>
              <span className="text-sm text-gray-500">{products.length} items</span>
            </div>
            <Grid columns={{ base: 1, sm: 2, md: 3 }} gap="gap-6">
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
          </section>
        </div>
      </div>
    </Layout>
  );
}
