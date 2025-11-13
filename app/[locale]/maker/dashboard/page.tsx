'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import VideoUpload from '@/components/videos/VideoUpload';
import Button from '@/components/Button';
import { videosAPI, productsAPI } from '@/lib/api';
import { Video, Product } from '@/types';

interface MakerDashboardPageProps {
  params: {
    locale: string;
  };
}

export default function MakerDashboardPage({ params }: MakerDashboardPageProps) {
  const { locale } = params;
  const { user, loading: authLoading } = useAuth();
  const { t, setLanguage } = useLanguage();
  const router = useRouter();
  
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [uploadType, setUploadType] = useState<'short' | 'long' | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (locale === 'zh' || locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    }
  }, [locale, setLanguage]);

  useEffect(() => {
    if (user) {
      fetchData();
    } else if (!authLoading) {
      router.push(`/${locale}/login`);
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch user's videos
      const videosResponse = await videosAPI.getVideos();
      const videosData = videosResponse.data?.data || videosResponse.data || [];
      setVideos(videosData.filter((v: Video) => v.userId === user.id));
      
      // Fetch user's products
      const productsResponse = await productsAPI.getProducts();
      const productsData = productsResponse.data?.data || productsResponse.data || [];
      setProducts(productsData.filter((p: Product) => p.userId === user.id));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setShowVideoUpload(false);
    setUploadType(null);
    fetchData();
  };

  if (authLoading || loading) {
    return (
      <Layout showHeader={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-500">加载中...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout showHeader={false}>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">创作者中心</h1>
            <p className="text-gray-600">管理您的视频和产品</p>
          </div>

          {/* Upload Buttons */}
          {!showVideoUpload && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => {
                  setUploadType('short');
                  setShowVideoUpload(true);
                }}
                className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-[#2E7D32] hover:bg-[#2E7D32]/5 transition"
              >
                <div className="text-4xl mb-3">🎬</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">上传短视频</h3>
                <p className="text-sm text-gray-600">最多60秒，用于吸引注意力</p>
              </button>
              <button
                onClick={() => {
                  setUploadType('long');
                  setShowVideoUpload(true);
                }}
                className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-[#2E7D32] hover:bg-[#2E7D32]/5 transition"
              >
                <div className="text-4xl mb-3">📹</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">上传长视频</h3>
                <p className="text-sm text-gray-600">最多10分钟，用于记录制作过程</p>
              </button>
            </div>
          )}

          {/* Video Upload Form */}
          {showVideoUpload && uploadType && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {uploadType === 'short' ? '上传短视频' : '上传长视频'}
                </h2>
                <Button
                  variant="text"
                  onClick={() => {
                    setShowVideoUpload(false);
                    setUploadType(null);
                  }}
                >
                  取消
                </Button>
              </div>
              <VideoUpload
                type={uploadType}
                onSuccess={handleUploadSuccess}
                onCancel={() => {
                  setShowVideoUpload(false);
                  setUploadType(null);
                }}
              />
            </div>
          )}

          {/* Videos List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">我的视频</h2>
            {videos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">还没有上传视频</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
                  >
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
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {video.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{video.type === 'short' ? '短视频' : '长视频'}</span>
                        <span>{video.views} 次观看</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Products List */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">我的产品</h2>
            {products.length === 0 ? (
              <p className="text-gray-500 text-center py-8">还没有添加产品</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
                  >
                    <div className="aspect-square bg-gray-100">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">📦</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm font-bold text-[#2E7D32]">
                        {product.price ? `¥${product.price.toFixed(2)}` : '价格待定'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

