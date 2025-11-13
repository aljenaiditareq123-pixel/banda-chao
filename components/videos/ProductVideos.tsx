'use client';

import { useState, useEffect } from 'react';
import { videosAPI } from '@/lib/api';
import { Video } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductVideosProps {
  productId: string;
}

export default function ProductVideos({ productId }: ProductVideosProps) {
  const { t } = useLanguage();
  const [shortVideos, setShortVideos] = useState<Video[]>([]);
  const [longVideos, setLongVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, [productId]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all videos and filter by productId
      // Note: This assumes the backend supports filtering by productId
      // If not, you may need to add a new endpoint: GET /videos?productId=xxx
      const [shortResponse, longResponse] = await Promise.all([
        videosAPI.getVideos('short'),
        videosAPI.getVideos('long'),
      ]);

      const allShortVideos = shortResponse.data?.data || shortResponse.data || [];
      const allLongVideos = longResponse.data?.data || longResponse.data || [];

      // Filter videos by productId (assuming video has productId field)
      // If backend doesn't support this, you'll need to filter on the backend
      const filteredShort = allShortVideos.filter(
        (video: any) => video.productId === productId || (video.productIds && video.productIds.includes(productId))
      );
      const filteredLong = allLongVideos.filter(
        (video: any) => video.productId === productId || (video.productIds && video.productIds.includes(productId))
      );

      setShortVideos(filteredShort);
      setLongVideos(filteredLong);
    } catch (err: any) {
      console.error('Failed to fetch videos:', err);
      setError('无法加载视频');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        加载视频中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  if (shortVideos.length === 0 && longVideos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Short Videos Section */}
      {shortVideos.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">相关短视频</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shortVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition">
                    <button className="bg-white/90 text-gray-900 px-4 py-2 rounded-lg font-semibold">
                      播放
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {video.title}
                  </h4>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{video.views} 次观看</span>
                    <span>❤️ {video.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Long Videos Section */}
      {longVideos.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">制作过程视频</h3>
          <div className="space-y-4">
            {longVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <div className="aspect-video bg-gray-100 relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">
                        {video.title}
                      </h4>
                      {video.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {video.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{video.views} 次观看</span>
                      <span>❤️ {video.likes}</span>
                      <button className="px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#256628] transition">
                        观看视频
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

