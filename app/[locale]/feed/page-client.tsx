'use client';

import { useState, useEffect } from 'react';
import VideoFeed from '@/components/feed/VideoFeed';
import { videosAPI } from '@/lib/api';

interface FeedPageClientProps {
  locale: string;
  videos: any[];
}

export default function FeedPageClient({ locale, videos: initialVideos }: FeedPageClientProps) {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Transform API videos to VideoFeed format
    const transformedVideos = initialVideos.map((video: any) => ({
      id: video.id,
      videoUrl: video.video_url || video.videoUrl || '',
      thumbnailUrl: video.thumbnail_url || video.thumbnailUrl,
      title: video.title || video.name || 'Untitled Video',
      description: video.description || '',
      product: video.product || (video.video_products && video.video_products[0]?.products) ? {
        id: video.video_products[0].products.id,
        name: video.video_products[0].products.name,
        price: video.video_products[0].products.price || 0,
        currency: video.video_products[0].products.currency || 'USD',
        imageUrl: video.video_products[0].products.image_url,
      } : undefined,
      maker: video.maker || video.users ? {
        id: video.users?.id || video.user_id,
        name: video.users?.name || video.maker?.displayName || 'Unknown',
        profilePicture: video.users?.profile_picture || video.maker?.avatarUrl,
      } : undefined,
      likesCount: video.likes_count || video.likesCount || 0,
      viewsCount: video.views_count || video.viewsCount || 0,
      duration: video.duration || 0,
    }));

    setVideos(transformedVideos);
    setLoading(false);
  }, [initialVideos]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>{locale === 'ar' ? 'جاري التحميل...' : locale === 'zh' ? '加载中...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden">
      <VideoFeed videos={videos} locale={locale} />
    </div>
  );
}
