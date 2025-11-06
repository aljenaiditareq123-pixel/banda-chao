'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { videosAPI } from '@/lib/api';
import VideoCard from '@/components/VideoCard';
import Comments from '@/components/Comments';
import LikeButton from '@/components/LikeButton';
import EditDeleteButtons from '@/components/EditDeleteButtons';
import Image from 'next/image';
import Link from 'next/link';

export default function VideoDetailPageClient() {
  const params = useParams();
  const videoId = params.id as string;
  const [video, setVideo] = useState<any>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideo();
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      const [videoRes, relatedRes] = await Promise.all([
        videosAPI.getVideo(videoId),
        videosAPI.getVideos(video?.type || 'short', 1, 8)
      ]);

      const videoData = videoRes.data;
      setVideo(videoData);

      // Get related videos (excluding current video)
      const relatedData = (relatedRes.data.data || []).filter((v: any) => v.id !== videoId);
      const formattedRelated = relatedData.map((v: any) => ({
        id: v.id,
        userId: v.userId,
        title: v.title,
        thumbnail: v.thumbnailUrl,
        videoUrl: v.videoUrl,
        duration: v.duration,
        views: v.views || 0,
        likes: v.likes || 0,
        comments: 0,
        createdAt: v.createdAt,
        type: v.type as 'short' | 'long',
      }));
      setRelatedVideos(formattedRelated);
    } catch (err: any) {
      console.error('Error fetching video:', err);
      setError(err.response?.data?.error || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Video not found'}</p>
          <Link
            href="/"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg aspect-video mb-4">
              <video
                src={video.videoUrl}
                controls
                className="w-full h-full rounded-lg"
                poster={video.thumbnailUrl}
              >
                您的浏览器不支持视频播放。
              </video>
            </div>

            {/* Video Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{video.title}</h1>
                <EditDeleteButtons userId={video.userId} videoId={video.id} />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Link
                    href={`/profile/${video.userId}`}
                    className="flex items-center space-x-3"
                  >
                    {video.user?.profilePicture ? (
                      <Image
                        src={video.user.profilePicture}
                        alt={video.user.name || 'User'}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full"
                        unoptimized
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white">
                        {(video.user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold text-gray-900">
                      {video.user?.name || '未命名用户'}
                    </span>
                  </Link>
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
            {relatedVideos.length > 0 ? (
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

