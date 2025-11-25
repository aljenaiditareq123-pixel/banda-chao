'use client';

import { useState } from 'react';
import { Grid, GridItem } from '@/components/Grid';
import ProductCard from '@/components/cards/ProductCard';
import VideoCard from '@/components/cards/VideoCard';
import Link from 'next/link';
import Button from '@/components/Button';
import EmptyState from '@/components/common/EmptyState';

interface MakerDetailClientProps {
  locale: string;
  maker: any;
  products: any[];
  videos: any[];
}

export default function MakerDetailClient({ locale, maker, products, videos }: MakerDetailClientProps) {
  const [isFollowed, setIsFollowed] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Maker Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
                {maker.avatarUrl || maker.user?.profilePicture ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={maker.avatarUrl || maker.user?.profilePicture}
                      alt={maker.displayName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = target.nextElementSibling as HTMLElement;
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                    <span className="text-4xl md:text-5xl absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>👤</span>
                  </>
                ) : (
                  <span className="text-4xl md:text-5xl">👤</span>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {maker.displayName}
                </h1>
                <Button
                  variant={isFollowed ? 'secondary' : 'primary'}
                  onClick={async () => {
                    setFollowLoading(true);
                    // Simulate API call (replace with actual API when available)
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    setIsFollowed(!isFollowed);
                    setFollowLoading(false);
                  }}
                  disabled={followLoading}
                  className="min-w-[120px]"
                >
                  {followLoading
                    ? (locale === 'ar' ? 'جاري...' : 'Loading...')
                    : isFollowed
                    ? (locale === 'ar' ? 'متابع ✓' : locale === 'zh' ? '已关注 ✓' : 'Following ✓')
                    : (locale === 'ar' ? 'متابعة' : locale === 'zh' ? '关注' : 'Follow')}
                </Button>
              </div>
              {maker.bio && (
                <p className="text-lg text-gray-600 mb-4">{maker.bio}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                {maker.country && (
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{maker.city ? `${maker.city}, ` : ''}{maker.country}</span>
                  </div>
                )}
                {maker.languages && maker.languages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span>🌐</span>
                    <span>{maker.languages.join(', ').toUpperCase()}</span>
                  </div>
                )}
                {maker.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-medium">{maker.rating.toFixed(1)}</span>
                    <span>({maker.reviewCount} {locale === 'ar' ? 'تقييم' : 'reviews'})</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {locale === 'ar' ? 'المنتجات' : locale === 'zh' ? '产品' : 'Products'}
            </h2>
            {products.length > 0 && (
              <Link href={`/${locale}/products?makerId=${maker.id}`}>
                <Button variant="text">
                  {locale === 'ar' ? 'عرض الكل' : 'View All'}
                </Button>
              </Link>
            )}
          </div>
          {products.length > 0 ? (
            <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="gap-6">
              {products.map((product) => (
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
          ) : (
            <EmptyState
              icon="🛍️"
              title={locale === 'ar' ? 'لا توجد منتجات' : 'No products yet'}
              message={locale === 'ar' ? 'لم يقم هذا الحرفي بإضافة منتجات بعد.' : 'This maker has not added any products yet.'}
            />
          )}
        </section>

        {/* Videos Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {locale === 'ar' ? 'الفيديوهات' : locale === 'zh' ? '视频' : 'Videos'}
            </h2>
            {videos.length > 0 && (
              <Link href={`/${locale}/videos?makerId=${maker.id}`}>
                <Button variant="text">
                  {locale === 'ar' ? 'عرض الكل' : 'View All'}
                </Button>
              </Link>
            )}
          </div>
          {videos.length > 0 ? (
            <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="gap-6">
              {videos.map((video) => (
                <GridItem key={video.id}>
                  <VideoCard
                    video={video}
                    href={`/${locale}/videos/${video.id}`}
                    locale={locale}
                  />
                </GridItem>
              ))}
            </Grid>
          ) : (
            <EmptyState
              icon="🎬"
              title={locale === 'ar' ? 'لا توجد فيديوهات' : 'No videos yet'}
              message={locale === 'ar' ? 'لم يقم هذا الحرفي بإضافة فيديوهات بعد.' : 'This maker has not added any videos yet.'}
            />
          )}
        </section>
      </div>
    </div>
  );
}

