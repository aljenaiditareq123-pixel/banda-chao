import VideosPageClient from './page-client';
import { Video } from '@/types';
import { getApiBaseUrl } from '@/lib/api-utils';
import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';

interface LocaleVideosPageProps {
  params: {
    locale: string;
  };
}

async function fetchAllVideos(): Promise<{ short: Video[]; long: Video[] }> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    
    // Fully stagger requests to avoid overwhelming backend (aligned with new pattern)
    const shortJson = await fetchJsonWithRetry(`${apiBaseUrl}/videos?type=short&limit=20`, {
      next: { revalidate: 300 }, // 5 minutes cache
      maxRetries: 2,
      retryDelay: 1000,
    });
    
    // Delay second request by 200ms to avoid hitting rate limit
    await new Promise(resolve => setTimeout(resolve, 200));
    
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
    
    // Backend returns array directly (not wrapped in { data: [...] })
    const shortVideos = (Array.isArray(shortJson) ? shortJson : (Array.isArray(shortJson.data) ? shortJson.data : [])).map(formatVideo);
    const longVideos = (Array.isArray(longJson) ? longJson : (Array.isArray(longJson.data) ? longJson.data : [])).map(formatVideo);

    return { short: shortVideos, long: longVideos };
  } catch (error) {
    console.error('[VideosPage] Failed to load videos:', error);
    return { short: [], long: [] };
  }
}

export default async function LocaleVideosPage({ params }: LocaleVideosPageProps) {
  const { locale } = params;
  const { short, long } = await fetchAllVideos();

  return <VideosPageClient locale={locale} shortVideos={short} longVideos={long} />;
}

