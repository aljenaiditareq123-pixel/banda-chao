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
    
    // Add small delay between requests to avoid overwhelming backend
    const [shortJson, longJson] = await Promise.all([
      fetchJsonWithRetry(`${apiBaseUrl}/videos?type=short&limit=20`, {
        next: { revalidate: 300 }, // 5 minutes cache
        maxRetries: 2,
        retryDelay: 1000,
      }),
      // Delay second request by 300ms to avoid hitting rate limit
      new Promise((resolve) => setTimeout(resolve, 300)).then(() =>
        fetchJsonWithRetry(`${apiBaseUrl}/videos?type=long&limit=20`, {
          next: { revalidate: 300 }, // 5 minutes cache
          maxRetries: 2,
          retryDelay: 1000,
        })
      ),
    ]);

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
    const longVideos = (longJson.data?.data || longJson.data || []).map(formatVideo);

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

