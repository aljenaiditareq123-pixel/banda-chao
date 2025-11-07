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

  // State declarations
  const [shortVideos, setShortVideos] = useState<Video[]>([]);
  const [longVideos, setLongVideos] = useState<Video[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { t } = useLanguage();

  console.log('📊 [HomePage] Initial state:', {
    shortVideos: shortVideos.length,
    longVideos: longVideos.length,
    products: products.length,
    loading,
    error
  });

  // useEffect to fetch data on component mount
  useEffect(() => {
    console.log('🔥 [HomePage] useEffect triggered!');
    console.log('🔍 [HomePage] Starting to fetch data...');
    
    fetchAllData();
  }, []);

  // Function to fetch all data
  const fetchAllData = async () => {
    console.log('📡 [HomePage] fetchAllData called');
    
    try {
      console.log('🔄 [HomePage] Setting loading to true');
      setLoading(true);
      setError(null);

      // Fetch short videos
      console.log('🎬 [HomePage] Step 1: Fetching short videos...');
      await fetchShortVideos();

      // Fetch long videos
      console.log('🎥 [HomePage] Step 2: Fetching long videos...');
      await fetchLongVideos();

      // Fetch products
      console.log('🛍️ [HomePage] Step 3: Fetching products...');
      await fetchProducts();

      console.log('✅ [HomePage] All data fetched successfully!');
    } catch (err: any) {
      console.error('❌ [HomePage] Error in fetchAllData:', err);
      console.error('❌ [HomePage] Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.error || 'Failed to load content');
    } finally {
      console.log('🏁 [HomePage] Setting loading to false');
      setLoading(false);
    }
  };

  // Function to fetch short videos
  const fetchShortVideos = async () => {
    try {
      console.log('📹 [HomePage] Calling videosAPI.getVideos("short", 1, 5)');
      const response = await videosAPI.getVideos('short', 1, 5);
      
      console.log('✅ [HomePage] Short videos API response received:', response);
      console.log('📊 [HomePage] Response structure:', {
        hasData: !!response.data,
        hasDataData: !!response.data?.data,
        dataType: typeof response.data?.data,
        isArray: Array.isArray(response.data?.data)
      });

      const videosData = response.data?.data || [];
      console.log('📋 [HomePage] Short videos raw data:', {
        count: videosData.length,
        firstVideo: videosData[0] || 'N/A'
      });

      const formattedVideos = videosData.map((video: any) => {
        console.log('🔄 [HomePage] Formatting video:', video.id, video.title);
        return {
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
          type: 'short' as const,
        };
      });

      console.log('✅ [HomePage] Formatted short videos:', formattedVideos.length);
      setShortVideos(formattedVideos);
      console.log('💾 [HomePage] Short videos state updated:', formattedVideos.length);
    } catch (err: any) {
      console.error('❌ [HomePage] Error fetching short videos:', err);
      throw err;
    }
  };

  // Function to fetch long videos
  const fetchLongVideos = async () => {
    try {
      console.log('📹 [HomePage] Calling videosAPI.getVideos("long", 1, 3)');
      const response = await videosAPI.getVideos('long', 1, 3);
      
      console.log('✅ [HomePage] Long videos API response received:', response);
      console.log('📊 [HomePage] Response structure:', {
        hasData: !!response.data,
        hasDataData: !!response.data?.data,
        dataType: typeof response.data?.data,
        isArray: Array.isArray(response.data?.data)
      });

      const videosData = response.data?.data || [];
      console.log('📋 [HomePage] Long videos raw data:', {
        count: videosData.length,
        firstVideo: videosData[0] || 'N/A'
      });

      const formattedVideos = videosData.map((video: any) => {
        console.log('🔄 [HomePage] Formatting video:', video.id, video.title);
        return {
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
          type: 'long' as const,
        };
      });

      console.log('✅ [HomePage] Formatted long videos:', formattedVideos.length);
      setLongVideos(formattedVideos);
      console.log('💾 [HomePage] Long videos state updated:', formattedVideos.length);
    } catch (err: any) {
      console.error('❌ [HomePage] Error fetching long videos:', err);
      throw err;
    }
  };

  // Function to fetch products
  const fetchProducts = async () => {
    try {
      console.log('🛍️ [HomePage] Calling productsAPI.getProducts()');
      const response = await productsAPI.getProducts();
      
      console.log('✅ [HomePage] Products API response received:', response);
      console.log('📊 [HomePage] Response structure:', {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data)
      });

      const productsData = Array.isArray(response.data) ? response.data : [];
      console.log('📋 [HomePage] Products raw data:', {
        count: productsData.length,
        firstProduct: productsData[0] || 'N/A'
      });

      const formattedProducts = productsData.slice(0, 6).map((product: any) => {
        console.log('🔄 [HomePage] Formatting product:', product.id, product.name);
        return {
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
        };
      });

      console.log('✅ [HomePage] Formatted products:', formattedProducts.length);
      setProducts(formattedProducts);
      console.log('💾 [HomePage] Products state updated:', formattedProducts.length);
    } catch (err: any) {
      console.error('❌ [HomePage] Error fetching products:', err);
      throw err;
    }
  };

  // Loading state
  if (loading) {
    console.log('⏳ [HomePage] Rendering loading state');
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

  // Error state
  if (error) {
    console.log('❌ [HomePage] Rendering error state:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('error')}</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={fetchAllData}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  // Main render
  console.log('🎨 [HomePage] Rendering main content with data:', {
    shortVideos: shortVideos.length,
    longVideos: longVideos.length,
    products: products.length
  });

  return (
    <div className="min-h-screen">
      {/* Debug Info Banner - Remove after fixing */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-100 border-b border-blue-300 p-2 text-xs">
          <strong>Debug:</strong> Short Videos: {shortVideos.length} | Long Videos: {longVideos.length} | Products: {products.length} | Loading: {loading ? 'Yes' : 'No'} | Error: {error || 'None'}
        </div>
      )}
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

      {/* Short Videos Section - Grid Layout */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {(() => {
              console.log('🎬 [HomePage] Rendering short videos grid, count:', shortVideos.length);
              if (shortVideos.length > 0) {
                return shortVideos.map((video) => {
                  console.log('📹 [HomePage] Rendering video card:', video.id);
                  return <VideoCard key={video.id} video={video} />;
                });
              } else {
                console.log('⚠️ [HomePage] No short videos to display');
                return (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    {t('noContent')}
                  </div>
                );
              }
            })()}
          </div>
        </div>
      </section>

      {/* Long Videos Section - Grid Layout */}
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
              console.log('🎥 [HomePage] Rendering long videos grid, count:', longVideos.length);
              if (longVideos.length > 0) {
                return longVideos.map((video) => {
                  console.log('📹 [HomePage] Rendering video card:', video.id);
                  return <VideoCard key={video.id} video={video} />;
                });
              } else {
                console.log('⚠️ [HomePage] No long videos to display');
                return (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    {t('noContent')}
                  </div>
                );
              }
            })()}
          </div>
        </div>
      </section>

      {/* Products Section - Grid Layout */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {(() => {
              console.log('🛍️ [HomePage] Rendering products grid, count:', products.length);
              if (products.length > 0) {
                return products.map((product) => {
                  console.log('📦 [HomePage] Rendering product card:', product.id);
                  return <ProductCard key={product.id} product={product} />;
                });
              } else {
                console.log('⚠️ [HomePage] No products to display');
                return (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    {t('noContent')}
                  </div>
                );
              }
            })()}
          </div>
        </div>
      </section>
    </div>
  );
}
