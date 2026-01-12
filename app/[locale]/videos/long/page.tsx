import LongVideosPageClient from './page-client';
import { Video } from '@/types';
import { getApiBaseUrl } from '@/lib/api-utils';
import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';

interface LocaleLongVideosPageProps {
  params: {
    locale: string;
  };
}

async function fetchLongVideos(): Promise<Video[]> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    
    const longJson = await fetchJsonWithRetry(`${apiBaseUrl}/videos?type=long&limit=20`, {
      next: { revalidate: 300 }, // 5 minutes cache
      maxRetries: 2,
      retryDelay: 1000,
    });

    const formatVideo = (video: any): Video => ({
      id: video.id,
      userId: video.userId,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnailUrl || video.thumbnail,
      videoUrl: video.videoUrl,
      duration: video.duration,
      views: video.views || 0,
      likes: video.likes || 0,
      comments: video.comments || 0,
      createdAt: video.createdAt,
      type: video.type as 'short' | 'long',
    });
    
    const longVideos = (longJson.data?.data || longJson.data || []).map(formatVideo);
    return longVideos;
  } catch (error) {
    console.error('[LongVideosPage] Failed to load long videos:', error);
    return [];
  }
}

export default async function LocaleLongVideosPage({ params }: LocaleLongVideosPageProps) {
  const { locale } = params;
  const longVideos = await fetchLongVideos();

  return <LongVideosPageClient locale={locale} longVideos={longVideos} />;
}





