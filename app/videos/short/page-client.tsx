'use client';

import { useEffect, useState } from 'react';
import VideoCard from "@/components/VideoCard";
import Link from "next/link";
import { videosAPI } from "@/lib/api";
import { useSearchParams } from 'next/navigation';
import { useLanguage } from "@/contexts/LanguageContext";

const ITEMS_PER_PAGE = 12;

export default function ShortVideosPageClient() {
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const [videos, setVideos] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    fetchVideos();
  }, [currentPage]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await videosAPI.getVideos('short', currentPage, ITEMS_PER_PAGE);
      const data = response.data;

      const formattedVideos = (data.data || []).map((video: any) => ({
        id: video.id,
        userId: video.userId,
        title: video.title,
        thumbnail: video.thumbnailUrl,
        videoUrl: video.videoUrl,
        duration: video.duration,
        views: video.views || 0,
        likes: video.likes || 0,
        comments: 0,
        createdAt: video.createdAt,
        type: video.type as 'short',
      }));

      setVideos(formattedVideos);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalVideos(data.pagination?.total || 0);
    } catch (err: any) {
      console.error('Error fetching videos:', err);
      setError(err.response?.data?.error || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{t('loading')}</p>
          <p className="text-gray-500 text-sm mt-2">请稍候，正在加载视频...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('error')}</h2>
          <p className="text-red-600 mb-6">
            {error || '抱歉，加载视频时出现问题。可能是服务器响应缓慢，请稍后再试。'}
          </p>
          <button
            onClick={fetchVideos}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">短视频</h1>
        
        {videos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                {currentPage > 1 && (
                  <Link
                    href={`/videos/short?page=${currentPage - 1}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    上一页
                  </Link>
                )}

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <Link
                          key={page}
                          href={`/videos/short?page=${page}`}
                          className={`px-4 py-2 rounded-lg transition ${
                            page === currentPage
                              ? 'bg-red-600 text-white'
                              : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </Link>
                      );
                    } else if (
                      page === currentPage - 3 ||
                      page === currentPage + 3
                    ) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                {currentPage < totalPages && (
                  <Link
                    href={`/videos/short?page=${currentPage + 1}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    下一页
                  </Link>
                )}
              </div>
            )}

            <div className="text-center mt-4 text-gray-600">
              显示第 {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalVideos)} 条，共 {totalVideos} 条
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            暂无内容
          </div>
        )}
      </div>
    </div>
  );
}

