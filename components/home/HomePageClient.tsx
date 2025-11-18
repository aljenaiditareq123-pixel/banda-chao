'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Grid, GridItem } from '@/components/Grid';
import ProductCard from '@/components/ProductCard';
import VideoCard from '@/components/VideoCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Product, Maker, Video } from '@/types';
import Button from '@/components/Button';

interface HomePageClientProps {
  locale: string;
  products: Product[];
  makers: Maker[];
  videos: Video[];
}

const AVATAR_PLACEHOLDER = 'https://via.placeholder.com/200x200?text=Maker';
const COVER_PLACEHOLDER = 'https://via.placeholder.com/800x400?text=Maker+Cover';

export default function HomePageClient({ locale, products, makers, videos }: HomePageClientProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-16">
      {/* Login Success Redirect Marker - for TestSprite to detect successful login redirect */}
      {/* Hidden but present in DOM when user is logged in */}
      {user && (
        <div 
          id="login-success-redirect-marker" 
          style={{ display: 'none' }}
          aria-hidden="true"
        />
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('homeHeroTitle') || 'منصة Banda Chao للحرفيين والمحتوى'}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('homeHeroDescription') || 'اكتشف منتجات يدوية فريدة، شاهد فيديوهات الحرفيين، وتواصل مع مجتمع من المبدعين'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href={`/${locale}/videos`}
              aria-label={t('watchShortVideos') || '观看短视频'}
            >
              <Button variant="primary" className="px-8 py-4 text-lg font-semibold bg-white text-primary-700 hover:bg-gray-100">
                {t('watchShortVideos') || '观看短视频'}
              </Button>
            </Link>
            <Link 
              href={`/${locale}/products`}
              aria-label={t('browseProducts') || '浏览商品'}
            >
              <Button variant="outline" className="px-8 py-4 text-lg font-semibold border-2 border-white text-white hover:bg-white/10">
                {t('browseProducts') || '浏览商品'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Makers Section */}
      {makers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {t('featuredMakers') || 'حرفيون مميزون'}
            </h2>
            <Link
              href={`/${locale}/makers`}
              className="text-primary-600 hover:text-primary-700 font-medium text-lg"
            >
              {t('viewAll') || 'عرض الكل'} →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {makers.slice(0, 6).map((maker) => {
              const profileImage = maker.profilePictureUrl || maker.profilePicture || maker.user?.profilePicture || AVATAR_PLACEHOLDER;
              const coverImage = maker.coverPictureUrl || maker.coverImage || COVER_PLACEHOLDER;
              const displayBio = maker.bio || '';

              return (
                <Link
                  key={maker.id}
                  href={`/${locale}/makers/${maker.slug || maker.id}`}
                  className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-200"
                >
                  <div className="h-32 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
                    <img
                      src={coverImage}
                      alt={maker.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="p-5 -mt-12 relative">
                    <div className="h-20 w-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 mb-4 relative z-10">
                      <img
                        src={profileImage}
                        alt={maker.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = AVATAR_PLACEHOLDER;
                        }}
                      />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {maker.name}
                    </h3>
                    {displayBio && (
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {displayBio}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t('featuredProducts') || 'منتجات مميزة'}
          </h2>
          <Link
            href={`/${locale}/products`}
            className="text-primary-600 hover:text-primary-700 font-medium text-lg"
          >
            {t('viewAll') || 'عرض الكل'} →
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-lg text-gray-500">{t('noContent') || 'لا توجد منتجات متاحة حالياً'}</p>
          </div>
        ) : (
          <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="gap-6">
            {products.map((product) => (
              <GridItem key={product.id}>
                <ProductCard product={product} href={`/${locale}/products/${product.id}`} />
              </GridItem>
            ))}
          </Grid>
        )}
      </section>

      {/* Featured Videos Section */}
      {videos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {t('featuredVideos') || 'فيديوهات مميزة'}
            </h2>
            <Link
              href={`/${locale}/videos`}
              className="text-primary-600 hover:text-primary-700 font-medium text-lg"
            >
              {t('viewAll') || 'عرض الكل'} →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {videos.slice(0, 6).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}

      {/* Founder Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl border-2 border-primary-200 p-8 md:p-12 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-6xl mb-6">🐼</div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('founderSectionTitle') || 'مركز القيادة للمؤسس'}
          </h2>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            {t('founderSectionDescription') || 'للمؤسس: 6 مساعدين ذكاء اصطناعي متخصصين يساعدونك في القرارات الاستراتيجية، التقنية، الأمان، التجارة، المحتوى، واللوجستيات'}
          </p>
          <Link href="/founder">
            <Button variant="primary" className="px-8 py-3 text-base font-semibold">
              {t('goToFounderConsole') || 'اذهب إلى مركز المؤسس'}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
