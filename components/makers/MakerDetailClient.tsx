'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Button from '@/components/Button';
import ProductCard from '@/components/ProductCard';
import VideoCard from '@/components/VideoCard';
import { Grid, GridItem } from '@/components/Grid';
import { useLanguage } from '@/contexts/LanguageContext';
import { Maker, Product, Video } from '@/types';

const COVER_PLACEHOLDER = 'https://via.placeholder.com/1440x480?text=Maker+Cover';
const AVATAR_PLACEHOLDER = 'https://via.placeholder.com/200x200?text=Maker';

interface MakerDetailClientProps {
  locale: string;
  maker: Maker;
  products: Product[];
  videos?: Video[];
}

export default function MakerDetailClient({ locale, maker, products, videos = [] }: MakerDetailClientProps) {
  const { setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'products' | 'videos'>('products');
  const [isFollowing, setIsFollowing] = useState(false);

  // Check if following on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const following = localStorage.getItem(`following_${maker.id}`);
      setIsFollowing(following === 'true');
    }
  }, [maker.id]);

  const handleFollow = () => {
    if (typeof window !== 'undefined') {
      const newFollowState = !isFollowing;
      setIsFollowing(newFollowState);
      localStorage.setItem(`following_${maker.id}`, String(newFollowState));
      
      // TODO: Replace with actual API call when backend endpoint is ready
      // await followAPI.followMaker(maker.id);
    }
  };

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

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' });
    } catch {
      return '';
    }
  };

  const makerSince = maker.createdAt ? formatDate(maker.createdAt) : '';

  return (
    <Layout showHeader={false}>
      <div className="bg-gray-50 pb-16">
        {/* Hero Section with Cover */}
        <div className="w-full h-64 md:h-96 bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 relative overflow-hidden">
          <img
            src={coverImage}
            alt={maker.name || t('makerCoverAlt')}
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Hero Card */}
          <section className="-mt-20 md:-mt-32 bg-white rounded-3xl border border-gray-100 shadow-xl p-6 md:p-10 relative z-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar */}
                <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={profileImage}
                    alt={maker.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = AVATAR_PLACEHOLDER;
                    }}
                  />
                </div>
                
                {/* Maker Info */}
                <div className="text-center md:text-right space-y-3 flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{maker.name}</h1>
                  {displayBio && (
                    <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
                      {displayBio}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                    {makerSince && (
                      <div className="flex items-center gap-1">
                        <span>🎨</span>
                        <span>{t('makerSince') || 'حرفي منذ'} {makerSince}</span>
                      </div>
                    )}
                    {products.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span>📦</span>
                        <span>{products.length} {t('products') || 'منتج'}</span>
                      </div>
                    )}
                    {videos.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span>🎬</span>
                        <span>{videos.length} {t('videos') || 'فيديو'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Follow Button */}
              <div className="flex justify-center md:justify-end">
                <Button
                  variant={isFollowing ? 'secondary' : 'primary'}
                  className="px-8 py-3 text-base"
                  onClick={handleFollow}
                >
                  {isFollowing
                    ? t('makerUnfollowButton') || 'إلغاء المتابعة'
                    : t('makerFollowButton') || 'متابعة'}
                </Button>
              </div>
            </div>
          </section>

          {/* Story Section */}
          <section className="mt-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              {t('makerStoryTitle') || 'عن الحرفي / القصة'}
            </h2>
            {maker.story ? (
              <div className="space-y-4">
                {storyParagraphs.map((paragraph, index) => (
                  <p key={index} className="text-base text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">{t('noStoryYet') || 'لم يقم الحرفي بإضافة قصة بعد.'}</p>
              </div>
            )}
          </section>

          {/* Products & Videos Section */}
          <section className="mt-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 md:p-10">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex -mb-px gap-4 sm:gap-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-4 py-3 text-base font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'products'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('products') || 'المنتجات'} ({products.length})
                </button>
                {videos.length > 0 && (
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`px-4 py-3 text-base font-semibold border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'videos'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {t('videos') || 'الفيديوهات'} ({videos.length})
                  </button>
                )}
              </nav>
            </div>

            {/* Content */}
            {activeTab === 'products' ? (
              <>
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.slice(0, 8).map((product) => (
                      <ProductCard key={product.id} product={product} href={`/${locale}/products/${product.id}`} locale={locale} />
                    ))}
                  </div>
                ) : (
                  <div className="w-full text-center py-16 text-gray-500 border border-dashed border-gray-200 rounded-2xl">
                    <div className="text-5xl mb-4">📦</div>
                    <p className="text-lg">{t('noProductsYet') || 'لا توجد منتجات مضافة بعد'}</p>
                  </div>
                )}
                {products.length > 8 && (
                  <div className="mt-6 text-center">
                    <Link href={`/${locale}/products`}>
                      <Button variant="outline">
                        {t('viewAllProducts') || 'View all maker products'}
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <>
                {videos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {videos.slice(0, 6).map((video) => (
                      <VideoCard key={video.id} video={video} locale={locale} />
                    ))}
                  </div>
                ) : (
                  <div className="w-full text-center py-16 text-gray-500 border border-dashed border-gray-200 rounded-2xl">
                    <div className="text-5xl mb-4">🎬</div>
                    <p className="text-lg">{t('noVideosYet') || 'لا توجد فيديوهات مضافة بعد'}</p>
                  </div>
                )}
                {videos.length > 6 && (
                  <div className="mt-6 text-center">
                    <Link href={`/${locale}/videos`}>
                      <Button variant="outline">
                        {t('viewAllVideos') || 'View all maker videos'}
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}
