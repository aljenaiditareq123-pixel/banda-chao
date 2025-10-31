import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import VideoCard from '@/components/VideoCard';
import Comments from '@/components/Comments';
import LikeButton from '@/components/LikeButton';
import EditDeleteButtons from '@/components/EditDeleteButtons';
import Image from 'next/image';

export default async function VideoDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // Get video data
  const { data: video, error } = await supabase
    .from('videos')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        avatar_url
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !video) {
    notFound();
  }

  // Increment views
  await supabase
    .from('videos')
    .update({ views: (video.views || 0) + 1 })
    .eq('id', params.id);

  // Get related videos
  const { data: relatedVideos } = await supabase
    .from('videos')
    .select('*')
    .eq('type', video.type)
    .neq('id', params.id)
    .limit(8);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 10000) {
      return `${(views / 10000).toFixed(1)}万`;
    }
    return views.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg aspect-video mb-4">
              <video
                src={video.video_url}
                controls
                className="w-full h-full rounded-lg"
                poster={video.thumbnail_url}
              >
                您的浏览器不支持视频播放。
              </video>
            </div>

            {/* Video Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{video.title}</h1>
                <EditDeleteButtons userId={video.user_id} videoId={video.id} />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <a
                    href={`/profile/${video.user_id}`}
                    className="flex items-center space-x-3"
                  >
                    {video.profiles?.avatar_url ? (
                      <Image
                        src={video.profiles.avatar_url}
                        alt={video.profiles.username || 'User'}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full"
                        unoptimized
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white">
                        {(video.profiles?.username || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold text-gray-900">
                      {video.profiles?.username || '未命名用户'}
                    </span>
                  </a>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{formatViews(video.views || 0)} 次观看</span>
                  <LikeButton videoId={video.id} initialLikes={video.likes || 0} />
                  <span className="text-sm text-gray-600">{formatDuration(video.duration)}</span>
                </div>
              </div>

              {video.description && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-gray-700 whitespace-pre-line">{video.description}</p>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
              <Comments videoId={video.id} />
            </div>
          </div>

          {/* Related Videos Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {video.type === 'short' ? '相关短视频' : '相关长视频'}
            </h2>
            {relatedVideos && relatedVideos.length > 0 ? (
              <div className="space-y-4">
                {relatedVideos.map((relatedVideo) => (
                  <VideoCard key={relatedVideo.id} video={relatedVideo} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">暂无相关视频</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
