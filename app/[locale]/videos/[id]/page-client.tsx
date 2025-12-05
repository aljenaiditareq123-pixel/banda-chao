'use client';

import { useState } from 'react';
import { Grid, GridItem } from '@/components/Grid';
import VideoCard from '@/components/cards/VideoCard';
import Link from 'next/link';
import Button from '@/components/Button';
import EmptyState from '@/components/common/EmptyState';
import LikeButton from '@/components/social/LikeButton';
import CommentList from '@/components/social/CommentList';
import CommentForm from '@/components/social/CommentForm';
import { useAuth } from '@/hooks/useAuth';

interface VideoDetailClientProps {
  locale: string;
  video: any;
  relatedVideos: any[];
}

export default function VideoDetailClient({ locale, video, relatedVideos }: VideoDetailClientProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="aspect-video bg-gray-900 relative">
                {video.videoUrl ? (
                  <video
                    src={video.videoUrl}
                    controls
                    className="w-full h-full"
                    poster={video.thumbnailUrl}
                  >
                    {locale === 'ar' ? 'متصفحك لا يدعم تشغيل الفيديو' : 'Your browser does not support video playback'}
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl text-gray-400">
                    ▶️
                  </div>
                )}
              </div>
              <div className="p-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {video.title}
                </h1>
                {video.description && (
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line mb-4">
                    {video.description}
                  </p>
                )}
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                  <span>👁️ {video.viewsCount?.toLocaleString() || 0}</span>
                  <LikeButton
                    targetType="VIDEO"
                    targetId={video.id}
                    initialLikesCount={video.likesCount || video._count?.videoLikes || 0}
                    locale={locale}
                    showCount={true}
                  />
                  <span>⏱️ {formatDuration(video.duration)}</span>
                  {video.type && (
                    <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-medium">
                      {video.type}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span className="text-sm">
                      {locale === 'ar' ? 'التعليقات' : locale === 'zh' ? '评论' : 'Comments'}
                    </span>
                  </button>
                </div>
                {/* Comments Section */}
                {showComments && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <CommentList
                      targetType="VIDEO"
                      targetId={video.id}
                      locale={locale}
                    />
                    {user && (
                      <div className="mt-4">
                        <CommentForm
                          targetType="VIDEO"
                          targetId={video.id}
                          locale={locale}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
              {video.maker && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-3">
                    {locale === 'ar' ? 'من صنع' : locale === 'zh' ? '制作' : 'Made by'}
                  </p>
                  <Link href={`/${locale}/makers/${video.maker.id || video.makerId}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {video.maker.avatarUrl || video.maker.user?.profilePicture ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={video.maker.avatarUrl || video.maker.user?.profilePicture}
                            alt={video.maker.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">👤</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {video.maker.displayName || video.maker.name}
                        </p>
                        {video.maker.country && (
                          <p className="text-sm text-gray-600 truncate">
                            {video.maker.city ? `${video.maker.city}, ` : ''}{video.maker.country}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <LikeButton
                    targetType="VIDEO"
                    targetId={video.id}
                    initialLikesCount={video.likesCount || video._count?.videoLikes || 0}
                    locale={locale}
                    size="lg"
                    showCount={true}
                  />
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => setShowComments(!showComments)}
                >
                  💬 {locale === 'ar' ? 'تعليق' : locale === 'zh' ? '评论' : 'Comment'}
                </Button>
                <Button variant="text" className="w-full">
                  🔗 {locale === 'ar' ? 'مشاركة' : locale === 'zh' ? '分享' : 'Share'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Videos */}
        {relatedVideos.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {locale === 'ar' 
                ? `فيديوهات أخرى من ${video.maker?.displayName || 'نفس الصانع'}`
                : locale === 'zh'
                ? `来自${video.maker?.displayName || '同一制作者'}的其他视频`
                : `More from ${video.maker?.displayName || 'this maker'}`
              }
            </h2>
            <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="gap-6">
              {relatedVideos.map((relatedVideo) => (
                <GridItem key={relatedVideo.id}>
                  <VideoCard
                    video={relatedVideo}
                    href={`/${locale}/videos/${relatedVideo.id}`}
                    locale={locale}
                  />
                </GridItem>
              ))}
            </Grid>
          </section>
        )}
      </div>
    </div>
  );
}

