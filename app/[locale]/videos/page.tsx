import VideosPageClient from './page-client';
import { Video } from '@/types';
import { videosAPI } from '@/lib/api';

interface LocaleVideosPageProps {
  params: {
    locale: string;
  };
}

async function fetchAllVideos(): Promise<{ short: Video[]; long: Video[] }> {
  try {
    const [shortRes, longRes] = await Promise.all([
      videosAPI.getVideos('short', 1, 20),
      videosAPI.getVideos('long', 1, 20),
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

    const shortVideos = (shortRes.data?.data || []).map(formatVideo);
    const longVideos = (longRes.data?.data || []).map(formatVideo);

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

