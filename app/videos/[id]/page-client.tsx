'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { videosAPI } from '@/lib/api';
import VideoCard from '@/components/VideoCard';
import Comments from '@/components/Comments';
import LikeButton from '@/components/LikeButton';
import EditDeleteButtons from '@/components/EditDeleteButtons';
import { useSafeLanguage } from '@/hooks/useSafeLanguage';
import Link from 'next/link';

export default function VideoDetailPageClient() {
  const params = useParams();
  const videoId = params.id as string;
  const { t } = useSafeLanguage();
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
      // Backend returns array directly (axios wraps it in response.data)
      const relatedArray = Array.isArray(relatedRes.data) ? relatedRes.data : (relatedRes.data?.data || []);
      const relatedData = relatedArray.filter((v: any) => v.id !== videoId);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading') || 'جاري التحميل...'}</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center bg-white rounded-2xl border-2 border-red-200 shadow-lg p-8 max-w-md mx-4">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-red-600 font-semibold text-lg mb-4">{error || t('videoNotFound') || 'الفيديو غير موجود'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-medium"
          >
            <span>←</span>
            <span>{t('backToHome') || 'العودة للصفحة الرئيسية'}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-black aspect-video">
                <video
                  src={video.videoUrl}
                  controls
                  className="w-full h-full"
                  poster={video.thumbnailUrl}
                >
                  {t('videoNotSupported') || 'متصفحك لا يدعم تشغيل الفيديو'}
                </video>
              </div>
            </div>

            {/* Video Info */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                    {video.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <span>👁️</span>
                      <span>{formatViews(video.views || 0)} {t('views') || 'مشاهدة'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span>{formatDuration(video.duration)}</span>
                    </span>
                    {video.type && (
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                        {video.type === 'short' ? t('shortVideo') || 'فيديو قصير' : t('longVideo') || 'فيديو طويل'}
                      </span>
                    )}
                  </div>
                </div>
                <EditDeleteButtons userId={video.userId} videoId={video.id} />
              </div>
              
              <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                <Link
                  href={`/profile/${video.userId}`}
                  className="flex items-center gap-3 hover:opacity-80 transition"
                >
                  {video.user?.profilePicture ? (
                    <img
                      src={video.user.profilePicture}
                      alt={video.user.name || 'User'}
                      className="h-12 w-12 rounded-full border-2 border-primary-200"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-lg">
                      {(video.user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {video.user?.name || t('unknownUser') || 'مستخدم غير معروف'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(video.createdAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </Link>
                <div className="ml-auto">
                  <LikeButton videoId={video.id} initialLikes={video.likes || 0} />
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {t('videoDescription') || 'وصف الفيديو'}
                </h2>
                {video.description ? (
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {video.description}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">
                    {t('noDescription') || 'لم تتم إضافة وصف لهذا الفيديو بعد'}
                  </p>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6 md:p-8">
              <Comments videoId={video.id} />
            </div>
          </div>

          {/* Related Videos Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6 sticky top-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                {t('relatedVideos') || 'فيديوهات أخرى'}
              </h2>
              {relatedVideos.length > 0 ? (
                <div className="space-y-4">
                  {relatedVideos.slice(0, 6).map((relatedVideo) => (
                    <VideoCard key={relatedVideo.id} video={relatedVideo} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t('noRelatedVideos') || 'لا توجد فيديوهات أخرى'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


