'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Grid, GridItem } from '@/components/Grid';
import Button from '@/components/Button';
import ProductCard from '@/components/cards/ProductCard';
import MakerCard from '@/components/cards/MakerCard';
import VideoCard from '@/components/cards/VideoCard';
import { useLanguage } from '@/contexts/LanguageContext';
import EmptyState from '@/components/common/EmptyState';

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

  return (
    <div className="bg-white" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
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
                  {locale === 'ar' ? 'منتجات يدوية فريدة من حرفيين موهوبين' : locale === 'zh' ? '来自才华横溢手工艺人的独特手工产品' : 'Unique handmade products from talented makers'}
                </p>
              </div>
              <Link href={`/${locale}/products`}>
                <Button variant="text">
                  {locale === 'ar' ? 'عرض الكل' : 'View All'}
                </Button>
              </Link>
            </div>
            <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <GridItem key={product.id}>
                  <ProductCard
                    product={{
                      ...product,
                      imageUrl: product.images?.[0]?.url || product.imageUrl || '',
                    }}
                    href={`/${locale}/products/${product.id}`}
                  />
                </GridItem>
              ))}
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
                  {locale === 'ar' ? 'شاهد كيف يصنع الحرفيون منتجاتهم' : locale === 'zh' ? '观看手工艺人如何制作他们的产品' : 'Watch how makers create their products'}
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

      {/* About CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {locale === 'ar' ? 'تعرف على Banda Chao' : locale === 'zh' ? '了解 Banda Chao' : 'Learn About Banda Chao'}
          </h2>
          <p className="text-gray-600 mb-6">
            {locale === 'ar' 
              ? 'اكتشف رؤيتنا ورسالتنا وقيمنا، وتعرف على فريق العمل'
              : locale === 'zh'
              ? '了解我们的愿景、使命和价值观，认识我们的团队'
              : 'Discover our vision, mission, and values, and meet our team'
            }
          </p>
          <Link href={`/${locale}/about`}>
            <Button variant="primary" className="px-8 py-3">
              {locale === 'ar' ? 'اعرف المزيد' : locale === 'zh' ? '了解更多' : 'Learn More'}
            </Button>
          </Link>
        </div>
      </section>

      {/* AI Assistant CTA (for Founder) */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {locale === 'ar' ? 'مؤسس؟ استخدم الباندا المستشار' : locale === 'zh' ? '创始人？使用顾问熊猫' : 'Founder? Use Consultant Panda'}
          </h2>
          <p className="text-gray-600 mb-6">
            {locale === 'ar' 
              ? 'لوحة تحكم ذكية مع مساعد AI لمراقبة وإدارة منصة Banda Chao'
              : locale === 'zh'
              ? '智能仪表板，配备 AI 助手，用于监控和管理 Banda Chao 平台'
              : 'Smart dashboard with AI assistant to monitor and manage Banda Chao platform'
            }
          </p>
          <Link href="/founder">
            <Button variant="primary" className="px-8 py-3">
              {locale === 'ar' ? 'الذهاب إلى لوحة المؤسس' : locale === 'zh' ? '前往创始人控制台' : 'Go to Founder Console'}
            </Button>
          </Link>
        </div>
      </section>

      {/* Empty State if no content */}
      {featuredMakers.length === 0 && featuredProducts.length === 0 && featuredVideos.length === 0 && (
        <section className="py-20">
          <EmptyState
            icon="🏠"
            title={locale === 'ar' ? 'مرحباً بك في Banda Chao' : 'Welcome to Banda Chao'}
            message={locale === 'ar' 
              ? 'ابدأ بإضافة حرفيين ومنتجات لملء المنصة بالمحتوى.'
              : 'Start by adding makers and products to fill the platform with content.'
            }
          />
        </section>
      )}
    </div>
  );
}
