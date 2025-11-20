import Link from 'next/link';
import { Video } from '@/types';

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const formatViews = (views: number) => {
    if (views >= 10000) {
      return `${(views / 10000).toFixed(1)}万`;
    }
    return views.toString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Link href={`/videos/${video.id}`} className="block group">
      <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {formatDuration(video.duration)}
        </div>
        {video.type === 'short' && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
            短视频
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-red-600 transition">
          {video.title}
        </h3>
        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
          <span>{formatViews(video.views)} 次观看</span>
          <span>{video.likes} 点赞</span>
        </div>
      </div>
    </Link>
  );
}
