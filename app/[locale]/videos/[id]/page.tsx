import { notFound } from 'next/navigation';
import VideoDetailClient from './page-client';
import { videosAPI } from '@/lib/api';

interface PageProps {
  params: {
    locale: string;
    id: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export default async function VideoDetailPage({ params }: PageProps) {
  const { locale, id } = params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  try {
    const response = await videosAPI.getById(id);
    const video = response.video;

    if (!video) {
      notFound();
    }

    // Fetch other videos from same maker
    let relatedVideos: any[] = [];
    if (video.makerId) {
      try {
        const relatedResponse = await videosAPI.getByMaker(video.makerId, { limit: 4 });
        relatedVideos = (relatedResponse.videos || []).filter((v: any) => v.id !== video.id);
      } catch (error) {
        console.error('Error fetching related videos:', error);
      }
    }

    return (
      <VideoDetailClient
        locale={locale}
        video={video}
        relatedVideos={relatedVideos}
      />
    );
  } catch (error) {
    console.error('Error fetching video details:', error);
    notFound();
  }
}



