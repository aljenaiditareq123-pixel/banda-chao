import Link from 'next/link';
import Image from 'next/image';
import { Video } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface VideoCardProps {
  video: Video;
  locale?: string;
}

export default function VideoCard({ video, locale = 'zh' }: VideoCardProps) {
  const { t } = useLanguage();
  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Link href={`/${locale}/videos/${video.id}`} className="block group">
      <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="relative aspect-video bg-gray-200 overflow-hidden">
          <Image
            src={video.thumbnail || 'https://via.placeholder.com/640x360?text=Video'}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-md font-semibold backdrop-blur-sm">
            {formatDuration(video.duration)}
          </div>
          {video.type === 'short' && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md font-semibold">
              {t('shortVideos')}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors mb-2 leading-snug">
            {video.title}
          </h3>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <span>👁️</span>
              <span>{formatViews(video.views)}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>❤️</span>
              <span>{video.likes || 0}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
