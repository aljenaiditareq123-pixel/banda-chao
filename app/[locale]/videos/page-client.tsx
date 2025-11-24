'use client';

import { Grid, GridItem } from '@/components/Grid';
import Link from 'next/link';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  language: string;
  duration: number;
  type: 'SHORT' | 'LONG';
  viewsCount: number;
  likesCount: number;
  maker?: {
    displayName: string;
    user?: {
      name: string;
    };
  };
  _count?: {
    videoLikes: number;
    comments: number;
  };
}

interface VideosPageClientProps {
  locale: string;
  videos: Video[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function VideosPageClient({ 
  locale, 
  videos, 
  pagination,
  loading = false,
  error = null,
  onRetry 
}: VideosPageClientProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState message={locale === 'ar' ? 'جاري التحميل...' : 'Loading...'} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {locale === 'ar' ? 'الفيديوهات' : locale === 'zh' ? '视频' : 'Videos'}
        </h1>

        {videos.length > 0 ? (
          <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="gap-6">
            {videos.map((video) => (
              <GridItem key={video.id}>
                <Link href={`/${locale}/videos/${video.id}`}>
                  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="aspect-video bg-gray-200 relative">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          ▶️
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(video.duration)}
                      </div>
                      {video.type === 'SHORT' && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          {locale === 'ar' ? 'قصير' : 'SHORT'}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      {video.maker && (
                        <p className="text-sm text-gray-600 mb-2">{video.maker.displayName}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>👁️ {video.viewsCount.toLocaleString()}</span>
                        <span>❤️ {video.likesCount || video._count?.videoLikes || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </GridItem>
            ))}
          </Grid>
        ) : (
          <EmptyState
            icon="🎬"
            title={locale === 'ar' ? 'لا توجد فيديوهات' : locale === 'zh' ? '没有视频' : 'No videos found'}
            message={locale === 'ar' ? 'لم يتم العثور على فيديوهات في الوقت الحالي.' : 'No videos available at the moment.'}
          />
        )}
      </div>
    </div>
  );
}
