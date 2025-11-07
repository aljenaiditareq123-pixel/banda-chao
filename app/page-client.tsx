'use client';

import { useEffect, useState } from 'react';
import VideoCard from "@/components/VideoCard";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { videosAPI, productsAPI } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface Video {
  id: string;
  userId: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  duration: number;
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
  type: 'short' | 'long';
}

interface Product {
  id: string;
  userId: string;
  name: string;
  description: string;
  price: number | null;
  images: string[];
  category: string | null;
  stock: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export default function HomePageClient() {
  console.log('🚀 [HomePage] Component rendered!');
  
  const [shortVideos, setShortVideos] = useState<Video[]>([]);
  const [longVideos, setLongVideos] = useState<Video[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    console.log('🔥 [HomePage] useEffect triggered!');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [HomePage] Starting to fetch data...');

      // Fetch short videos
      console.log('🔍 [HomePage] Fetching short videos...');
      const shortVideosRes = await videosAPI.getVideos('short', 1, 5);
      console.log('✅ [HomePage] Short videos response:', shortVideosRes);
      console.log('📊 [HomePage] Short videos response.data:', shortVideosRes.data);
      console.log('📊 [HomePage] Short videos response.data.data:', shortVideosRes.data?.data);
      console.log('📊 [HomePage] Short videos response.data.data type:', typeof shortVideosRes.data?.data);
      console.log('📊 [HomePage] Short videos response.data.data isArray:', Array.isArray(shortVideosRes.data?.data));
      const shortVideosData = shortVideosRes.data?.data || [];
      console.log('📋 [HomePage] Short videos data length:', shortVideosData.length);
      console.log('📋 [HomePage] Short videos data sample:', shortVideosData[0] || 'N/A');
      const formattedShortVideos = shortVideosData.map((video: any) => ({
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

      // Fetch long videos
      console.log('🔍 [HomePage] Fetching long videos...');
      const longVideosRes = await videosAPI.getVideos('long', 1, 3);
      console.log('✅ [HomePage] Long videos response:', longVideosRes);
      console.log('📊 [HomePage] Long videos response.data:', longVideosRes.data);
      console.log('📊 [HomePage] Long videos response.data.data:', longVideosRes.data?.data);
      const longVideosData = longVideosRes.data?.data || [];
      console.log('📋 [HomePage] Long videos data length:', longVideosData.length);
      const formattedLongVideos = longVideosData.map((video: any) => ({
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
        type: video.type as 'long',
      }));

      // Fetch products
      console.log('🔍 [HomePage] Fetching products...');
      const productsRes = await productsAPI.getProducts();
      console.log('✅ [HomePage] Products response:', productsRes);
      console.log('📊 [HomePage] Products data:', productsRes.data);
      // Backend returns array directly, axios wraps it in .data
      const productsData = Array.isArray(productsRes.data) ? productsRes.data : [];
      console.log('📋 [HomePage] Formatted products:', productsData.length, 'products');
      const formattedProducts = productsData.slice(0, 6).map((product: any) => ({
        id: product.id,
        userId: product.userId,
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.imageUrl ? [product.imageUrl] : [],
        category: product.category,
        stock: 0,
        rating: 0,
        reviewCount: 0,
        createdAt: product.createdAt,
      }));

      console.log('🔍 [HomePage] Setting state with data...');
      console.log('📊 [HomePage] Short videos to set:', formattedShortVideos.length);
      console.log('📊 [HomePage] Long videos to set:', formattedLongVideos.length);
      console.log('📊 [HomePage] Products to set:', formattedProducts.length);

      setShortVideos(formattedShortVideos);
      setLongVideos(formattedLongVideos);
      setProducts(formattedProducts);

      console.log('✅ [HomePage] Data fetch completed successfully!');
    } catch (err: any) {
      console.error('❌ [HomePage] Error fetching data:', err);
      console.error('❌ [HomePage] Error details:', {
        message: err.message,
        response: err.response,
        data: err.response?.data,
      });
      setError(err.response?.data?.error || 'Failed to load content');
    } finally {
      setLoading(false);
      console.log('🏁 [HomePage] Fetch completed, loading set to false');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{t('loading')}</p>
          <p className="text-gray-500 text-sm mt-2">请稍候，正在加载内容...</p>
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
            {error || '抱歉，加载内容时出现问题。可能是服务器响应缓慢，请稍后再试。'}
          </p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">{t('welcome')}</h1>
          <p className="text-xl mb-8">
            {t('subtitle')}
            <br />
            {t('subtitle2')}
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/videos/short"
              className="px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              {t('watchShortVideos')}
            </Link>
            <Link
              href="/products"
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-red-600 transition"
            >
              {t('browseProducts')}
            </Link>
          </div>
        </div>
      </section>

      {/* Short Videos Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{t('hotShortVideos')}</h2>
            <Link
              href="/videos/short"
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              {t('viewMore')} →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {(() => {
              console.log('🔍 [HomePage] Rendering short videos section, count:', shortVideos.length);
              return shortVideos.length > 0 ? (
                shortVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  {t('noContent')}
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Long Videos Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{t('featuredLongVideos')}</h2>
            <Link
              href="/videos/long"
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              {t('viewMore')} →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              console.log('🔍 [HomePage] Rendering long videos section, count:', longVideos.length);
              return longVideos.length > 0 ? (
                longVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  {t('noContent')}
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{t('recommendedProducts')}</h2>
            <Link
              href="/products"
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              {t('viewMore')} →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {(() => {
              console.log('🔍 [HomePage] Rendering products section, count:', products.length);
              return products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  {t('noContent')}
                </div>
              );
            })()}
          </div>
        </div>
      </section>
    </div>
  );
}

