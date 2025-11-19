import VideosPageClient from './page-client';
import { Video } from '@/types';
import { getApiBaseUrl } from '@/lib/api-utils';

interface LocaleVideosPageProps {
  params: {
    locale: string;
  };
}

async function fetchAllVideos(): Promise<{ short: Video[]; long: Video[] }> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    
    const [shortRes, longRes] = await Promise.all([
      fetch(`${apiBaseUrl}/videos?type=short&limit=20`, {
        next: { revalidate: 60 },
      }),
      fetch(`${apiBaseUrl}/videos?type=long&limit=20`, {
        next: { revalidate: 60 },
      }),
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

    const shortJson = await shortRes.json();
    const longJson = await longRes.json();
    
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

