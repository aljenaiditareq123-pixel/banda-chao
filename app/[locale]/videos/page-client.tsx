'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Grid, GridItem } from '@/components/Grid';
import VideoCard from '@/components/VideoCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Video } from '@/types';

interface VideosPageClientProps {
  locale: string;
  shortVideos: Video[];
  longVideos: Video[];
}

type VideoTab = 'all' | 'short' | 'long';

export default function VideosPageClient({ locale, shortVideos, longVideos }: VideosPageClientProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<VideoTab>('all');

  const getDisplayVideos = (): Video[] => {
    switch (activeTab) {
      case 'short':
        return shortVideos;
      case 'long':
        return longVideos;
      default:
        return [...shortVideos, ...longVideos].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  };

  const videos = getDisplayVideos();

  // Get empty state message based on active tab
  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 'short':
        return {
          title: t('noShortVideos') || 'لا توجد فيديوهات قصيرة حالياً',
          description: t('noShortVideosDescription') || 'لم يتم رفع أي فيديوهات قصيرة بعد',
        };
      case 'long':
        return {
          title: t('noLongVideos') || 'لا توجد فيديوهات طويلة حالياً',
          description: t('noLongVideosDescription') || 'لم يتم رفع أي فيديوهات طويلة بعد',
        };
      default:
        return {
          title: t('noVideos') || 'لا توجد فيديوهات متاحة حالياً',
          description: t('noVideosDescription') || 'يمكنك تصفح الحرفيين أو المنتجات',
        };
    }
  };

  const emptyState = getEmptyStateMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center md:text-right">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('videos') || 'الفيديوهات'}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto md:mx-0">
            {t('videosSubtitle') || 'شاهد فيديوهات الحرفيين والمحتوى الإبداعي'}
          </p>
        </div>
        
        {/* Tabs */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center md:justify-start border-b-2 border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-semibold text-sm md:text-base rounded-t-xl transition-all duration-200 ${
              activeTab === 'all'
                ? 'text-primary-700 bg-primary-50 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {t('allVideos') || 'الكل'} ({shortVideos.length + longVideos.length})
          </button>
          <button
            onClick={() => setActiveTab('short')}
            className={`px-6 py-3 font-semibold text-sm md:text-base rounded-t-xl transition-all duration-200 ${
              activeTab === 'short'
                ? 'text-primary-700 bg-primary-50 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {t('shortVideos') || 'قصيرة'} ({shortVideos.length})
          </button>
          <button
            onClick={() => setActiveTab('long')}
            className={`px-6 py-3 font-semibold text-sm md:text-base rounded-t-xl transition-all duration-200 ${
              activeTab === 'long'
                ? 'text-primary-700 bg-primary-50 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {t('longVideos') || 'طويلة'} ({longVideos.length})
          </button>
        </div>

        {/* Videos Grid */}
        {videos.length > 0 ? (
          <Grid columns={{ base: 1, sm: 2, md: 3 }} gap="gap-6">
            {videos.map((video) => (
              <GridItem key={video.id}>
                <VideoCard video={video} />
              </GridItem>
            ))}
          </Grid>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              {emptyState.title}
            </p>
            <p className="text-gray-500 mb-6">
              {emptyState.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}/makers`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-medium"
              >
                <span>👥</span>
                <span>{t('browseMakers') || 'تصفح الحرفيين'}</span>
              </Link>
              <Link
                href={`/${locale}/products`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 border-2 border-primary-200 rounded-xl hover:bg-primary-50 transition font-medium"
              >
                <span>📦</span>
                <span>{t('browseProducts') || 'تصفح المنتجات'}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

