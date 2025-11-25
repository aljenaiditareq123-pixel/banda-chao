import Link from 'next/link';
import Card from '@/components/common/Card';

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    description?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    language: string;
    duration: number;
    type: 'SHORT' | 'LONG';
    viewsCount: number;
    likesCount: number;
    maker?: {
      displayName: string;
    };
  };
  href: string;
  locale: string;
}

export default function VideoCard({ video, href, locale }: VideoCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Link href={href} className="block">
      <Card hover>
        <div className="aspect-video bg-gray-200 relative overflow-hidden">
          {video.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl text-gray-400">
              ▶️
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
          {video.type === 'SHORT' && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
              {locale === 'ar' ? 'قصير' : 'SHORT'}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
            {video.title}
          </h3>
          {video.maker && (
            <p className="text-sm text-gray-600 mb-3">{video.maker.displayName}</p>
          )}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>👁️ {video.viewsCount.toLocaleString()}</span>
            <span>❤️ {video.likesCount || 0}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

