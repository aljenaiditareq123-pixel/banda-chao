import ShortVideosPageClient from './page-client';
import { Video } from '@/types';
import { getApiBaseUrl } from '@/lib/api-utils';
import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';

interface LocaleShortVideosPageProps {
  params: {
    locale: string;
  };
}

async function fetchShortVideos(): Promise<Video[]> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    
    const shortJson = await fetchJsonWithRetry(`${apiBaseUrl}/videos?type=short&limit=20`, {
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
    
    const shortVideos = (shortJson.data?.data || shortJson.data || []).map(formatVideo);
    return shortVideos;
  } catch (error) {
    console.error('[ShortVideosPage] Failed to load short videos:', error);
    return [];
  }
}

export default async function LocaleShortVideosPage({ params }: LocaleShortVideosPageProps) {
  const { locale } = params;
  const shortVideos = await fetchShortVideos();

  return <ShortVideosPageClient locale={locale} shortVideos={shortVideos} />;
}

