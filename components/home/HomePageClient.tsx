'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Grid, GridItem } from '@/components/Grid';
import Button from '@/components/Button';
import ProductCard from '@/components/ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product } from '@/types';

const MAKER_PLACEHOLDER_CLASS =
  'w-full aspect-[4/3] rounded-2xl bg-gray-200 flex items-center justify-center text-4xl text-gray-400 mb-4';

interface HomePageClientProps {
  locale: string;
  products: Product[];
}

export default function HomePageClient({ locale, products }: HomePageClientProps) {
  const { setLanguage, t } = useLanguage();

  useEffect(() => {
    if (locale === 'zh' || locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    } else {
      setLanguage('zh');
    }
  }, [locale, setLanguage]);

  const featuredMakers = [
    {
      id: 'maker-1',
      name: t('featuredMakerName1'),
      bio: t('featuredMakerBio1'),
    },
    {
      id: 'maker-2',
      name: t('featuredMakerName2'),
      bio: t('featuredMakerBio2'),
    },
    {
      id: 'maker-3',
      name: t('featuredMakerName3'),
      bio: t('featuredMakerBio3'),
    },
  ];

  const howItWorksSteps = [
    {
      id: 'step-1',
      icon: '🔍',
      title: t('howItWorksStep1Title'),
      description: t('howItWorksStep1Description'),
    },
    {
      id: 'step-2',
      icon: '🤝',
      title: t('howItWorksStep2Title'),
      description: t('howItWorksStep2Description'),
    },
    {
      id: 'step-3',
      icon: '🎁',
      title: t('howItWorksStep3Title'),
      description: t('howItWorksStep3Description'),
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#2E7D32] to-[#66BB6A] text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            {t('homeHeroHeadline')}
          </h1>
          <p className="text-lg md:text-xl text-green-50 max-w-2xl mx-auto mb-10">
            {t('homeHeroDescription')}
          </p>
          <div className="flex justify-center">
            <Link href={`/${locale}/products`} className="inline-flex">
              <Button variant="primary" className="px-6 py-3 text-base md:text-lg">
                {t('homeHeroCTA')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Makers */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-gray-900">{t('featuredMakersTitle')}</h2>
          </div>
          <Grid columns={{ base: 1, md: 3 }} gap="gap-8">
            {featuredMakers.map((maker, index) => (
              <GridItem key={maker.id}>
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-8 h-full flex flex-col">
                  <div className={MAKER_PLACEHOLDER_CLASS}>
                    <span>{['🧵', '🫖', '🎋'][index] ?? '🧶'}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{maker.name}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1">{maker.bio}</p>
                </div>
              </GridItem>
            ))}
          </Grid>
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-3xl font-semibold text-gray-900">{t('latestProductsTitle')}</h2>
            <Link href={`/${locale}/products`} className="inline-flex">
              <Button variant="text" className="text-[#2E7D32] hover:text-[#256628]">
                {t('homeHeroCTA')}
              </Button>
            </Link>
          </div>
          <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="gap-6">
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

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-gray-900">{t('howItWorksTitle')}</h2>
          </div>
          <Grid columns={{ base: 1, md: 3 }} gap="gap-8">
            {howItWorksSteps.map((step) => (
              <GridItem key={step.id}>
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-8 h-full">
                  <div className="h-14 w-14 rounded-full bg-[#E8F5E9] text-2xl flex items-center justify-center text-[#2E7D32] mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </GridItem>
            ))}
          </Grid>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#111111] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-semibold leading-snug">
            {t('ctaHeadline')}
          </h2>
          <Link href={`/${locale}/start`} className="inline-flex">
            <Button
              variant="secondary"
              className="px-6 py-3 text-base md:text-lg border-white text-white hover:bg-white hover:text-[#111111]"
            >
              {t('ctaButtonText')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
