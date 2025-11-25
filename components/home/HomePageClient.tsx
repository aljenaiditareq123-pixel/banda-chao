'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Grid, GridItem } from '@/components/Grid';
import Button from '@/components/Button';
import ProductCard from '@/components/cards/ProductCard';
import MakerCard from '@/components/cards/MakerCard';
import VideoCard from '@/components/cards/VideoCard';
import { useLanguage } from '@/contexts/LanguageContext';
import EmptyState from '@/components/common/EmptyState';
import OnboardingModal from '@/components/common/OnboardingModal';

interface HomePageClientProps {
  locale: string;
  featuredMakers: any[];
  featuredProducts: any[];
  featuredVideos: any[];
}

export default function HomePageClient({
  locale,
  featuredMakers,
  featuredProducts,
  featuredVideos,
}: HomePageClientProps) {
  const { setLanguage, t } = useLanguage();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (locale === 'zh' || locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    } else {
      setLanguage('zh');
    }
  }, [locale, setLanguage]);

  const heroTexts = {
    ar: {
      headline: 'منصة عالمية للحرفيين المستقلين',
      description: 'اكتشف منتجات يدوية فريدة من حرفيين موهوبين حول العالم. اربط مباشرة مع الصانعين وادعم الإبداع الحقيقي.',
      cta1: 'استكشف الحرفيين',
      cta2: 'استكشف المنتجات',
    },
    en: {
      headline: 'A Global Home for Independent Makers',
      description: 'Discover unique handmade products from talented artisans worldwide. Connect directly with makers and support real creativity.',
      cta1: 'Explore Makers',
      cta2: 'Explore Products',
    },
    zh: {
      headline: '全球独立手工艺人的家园',
      description: '发现来自世界各地才华横溢的手工艺人制作的独特手工产品。直接与制作者联系，支持真正的创造力。',
      cta1: '探索手工艺人',
      cta2: '探索产品',
    },
  };

  const texts = heroTexts[locale as keyof typeof heroTexts] || heroTexts.en;

  const helpTexts = {
    ar: {
      help: 'مساعدة',
    },
    en: {
      help: 'Help',
    },
    zh: {
      help: '帮助',
    },
  };

  const helpT = helpTexts[locale as keyof typeof helpTexts] || helpTexts.en;

  return (
    <div className="bg-white" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Help/Onboarding Button - Floating */}
      <button
        onClick={() => setShowOnboarding(true)}
        className="fixed bottom-6 right-6 z-[60] bg-primary text-white rounded-full w-14 h-14 shadow-lg hover:bg-primary-600 flex items-center justify-center text-xl"
        aria-label={helpT.help}
      >
        ?
      </button>

      {/* Onboarding Modal */}
      <OnboardingModal
        locale={locale}
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            {texts.headline}
          </h1>
          <p className="text-lg md:text-xl text-primary-50 max-w-3xl mx-auto mb-10">
            {texts.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/makers`}>
              <Button variant="secondary" className="px-8 py-3 text-base md:text-lg bg-white text-primary hover:bg-primary-50">
                {texts.cta1}
              </Button>
            </Link>
            <Link href={`/${locale}/products`}>
              <Button variant="secondary" className="px-8 py-3 text-base md:text-lg border-2 border-white text-white hover:bg-white hover:text-primary">
                {texts.cta2}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Makers */}
      {featuredMakers.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {locale === 'ar' ? 'الحرفيون المميزون' : locale === 'zh' ? '精选手工艺人' : 'Featured Makers'}
                </h2>
                <p className="text-gray-600">
                  {locale === 'ar' ? 'اكتشف مواهب حرفيين موهوبين من حول العالم' : locale === 'zh' ? '发现来自世界各地的才华横溢的手工艺人' : 'Discover talented makers from around the world'}
                </p>
              </div>
              <Link href={`/${locale}/makers`}>
                <Button variant="text">
                  {locale === 'ar' ? 'عرض الكل' : 'View All'}
                </Button>
              </Link>
            </div>
            <Grid columns={{ base: 1, sm: 2, md: 3 }} gap="gap-6">
              {featuredMakers.slice(0, 6).map((maker) => (
                <GridItem key={maker.id}>
                  <MakerCard
                    maker={maker}
                    href={`/${locale}/makers/${maker.id}`}
                    locale={locale}
                  />
                </GridItem>
              ))}
            </Grid>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {locale === 'ar' ? 'المنتجات المميزة' : locale === 'zh' ? '精选产品' : 'Featured Products'}
                </h2>
                <p className="text-gray-600">
                  {locale === 'ar' ? 'اكتشف منتجات يدوية فريدة من حرفيين موهوبين' : locale === 'zh' ? '发现来自才华横溢的手工艺人的独特手工产品' : 'Discover unique handmade products from talented makers'}
                </p>
              </div>
              <Link href={`/${locale}/products`}>
                <Button variant="text">
                  {locale === 'ar' ? 'عرض الكل' : 'View All'}
                </Button>
              </Link>
            </div>
            <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="gap-6">
              {featuredProducts.slice(0, 8).map((product) => {
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
          </div>
        </section>
      )}

      {/* Featured Videos */}
      {featuredVideos.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {locale === 'ar' ? 'الفيديوهات المميزة' : locale === 'zh' ? '精选视频' : 'Featured Videos'}
                </h2>
                <p className="text-gray-600">
                  {locale === 'ar' ? 'شاهد فيديوهات من حرفيين موهوبين' : locale === 'zh' ? '观看来自才华横溢的手工艺人的视频' : 'Watch videos from talented makers'}
                </p>
              </div>
              <Link href={`/${locale}/videos`}>
                <Button variant="text">
                  {locale === 'ar' ? 'عرض الكل' : 'View All'}
                </Button>
              </Link>
            </div>
            <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="gap-6">
              {featuredVideos.slice(0, 6).map((video) => (
                <GridItem key={video.id}>
                  <VideoCard
                    video={video}
                    href={`/${locale}/videos/${video.id}`}
                    locale={locale}
                  />
                </GridItem>
              ))}
            </Grid>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'ar' ? 'ابدأ رحلتك مع Banda Chao اليوم' : locale === 'zh' ? '今天开始您的 Banda Chao 之旅' : 'Start Your Journey with Banda Chao Today'}
          </h2>
          <p className="text-lg text-primary-100 mb-8">
            {locale === 'ar' ? 'انضم إلى مجتمع الحرفيين واكتشف إبداعاً لا حدود له' : locale === 'zh' ? '加入手工艺人社区，发现无限的创造力' : 'Join our community of makers and discover endless creativity'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}/makers`}>
              <Button variant="secondary" className="px-8 py-3 bg-white text-primary hover:bg-primary-50">
                {locale === 'ar' ? 'استكشف الحرفيين' : locale === 'zh' ? '探索手工艺人' : 'Explore Makers'}
              </Button>
            </Link>
            <Link href={`/${locale}/products`}>
              <Button variant="secondary" className="px-8 py-3 border-2 border-white text-white hover:bg-white hover:text-primary">
                {locale === 'ar' ? 'تصفح المنتجات' : locale === 'zh' ? '浏览产品' : 'Browse Products'}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
