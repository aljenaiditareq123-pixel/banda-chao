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
  const [testResults, setTestResults] = useState<string>('Initializing...');
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
    setTestResults('useEffect triggered - starting fetch...');
    fetchAllData();
  }, []);

  // Function to fetch all data
  const fetchAllData = async () => {
    console.log('📡 [HomePage] fetchAllData called');
    setTestResults('fetchAllData called...');
    
    try {
      console.log('🔄 [HomePage] Setting loading to true');
      setLoading(true);
      setError(null);
      setTestResults('Loading started...');

      // Fetch short videos
      console.log('🎬 [HomePage] Step 1: Fetching short videos...');
      setTestResults('Step 1: Fetching short videos...');
      await fetchShortVideos();

      // Fetch long videos
      console.log('🎥 [HomePage] Step 2: Fetching long videos...');
      setTestResults('Step 2: Fetching long videos...');
      await fetchLongVideos();

      // Fetch products
      console.log('🛍️ [HomePage] Step 3: Fetching products...');
      setTestResults('Step 3: Fetching products...');
      await fetchProducts();

      console.log('✅ [HomePage] All data fetched successfully!');
      setTestResults(`✅ Success! Videos: ${shortVideos.length} short, ${longVideos.length} long | Products: ${products.length}`);
    } catch (err: any) {
      console.error('❌ [HomePage] Error in fetchAllData:', err);
      console.error('❌ [HomePage] Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        code: err.code,
        stack: err.stack
      });
      
      // More detailed error message
      let errorMessage = 'Failed to load content';
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network')) {
        errorMessage = 'Network error: Cannot connect to backend. Please check your connection.';
        setTestResults(`❌ Network Error: ${err.message}`);
      } else if (err.response?.status === 401) {
        errorMessage = 'Unauthorized: Please check authentication.';
        setTestResults(`❌ 401 Unauthorized`);
      } else if (err.response?.status === 403) {
        errorMessage = 'Forbidden: Access denied.';
        setTestResults(`❌ 403 Forbidden`);
      } else if (err.response?.status === 404) {
        errorMessage = 'Not found: API endpoint not found.';
        setTestResults(`❌ 404 Not Found: ${err.config?.url}`);
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error: Backend is having issues.';
        setTestResults(`❌ 500 Server Error`);
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        setTestResults(`❌ Error: ${errorMessage}`);
      } else if (err.message) {
        errorMessage = err.message;
        setTestResults(`❌ Error: ${err.message}`);
      }
      
      setError(errorMessage);
    } finally {
      console.log('🏁 [HomePage] Setting loading to false');
      setLoading(false);
    }
  };

  // Function to fetch short videos
  const fetchShortVideos = async () => {
    try {
      console.log('📹 [HomePage] Calling videosAPI.getVideos("short", 1, 5)');
      setTestResults('Calling Videos API (short)...');
      
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

      if (videosData.length === 0) {
        setTestResults('⚠️ API returned empty array for short videos');
        console.warn('⚠️ [HomePage] No short videos returned from API');
      }

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
      setTestResults(`✅ Short videos: ${formattedVideos.length} loaded`);
      console.log('💾 [HomePage] Short videos state updated:', formattedVideos.length);
    } catch (err: any) {
      console.error('❌ [HomePage] Error fetching short videos:', err);
      setTestResults(`❌ Short videos error: ${err.message}`);
      throw err;
    }
  };

  // Function to fetch long videos
  const fetchLongVideos = async () => {
    try {
      console.log('📹 [HomePage] Calling videosAPI.getVideos("long", 1, 3)');
      setTestResults('Calling Videos API (long)...');
      
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
      setTestResults(`✅ Long videos: ${formattedVideos.length} loaded`);
      console.log('💾 [HomePage] Long videos state updated:', formattedVideos.length);
    } catch (err: any) {
      console.error('❌ [HomePage] Error fetching long videos:', err);
      setTestResults(`❌ Long videos error: ${err.message}`);
      throw err;
    }
  };

  // Function to fetch products
  const fetchProducts = async () => {
    try {
      console.log('🛍️ [HomePage] Calling productsAPI.getProducts()');
      setTestResults('Calling Products API...');
      
      const response = await productsAPI.getProducts();
      
      console.log('✅ [HomePage] Products API response received:', response);
      console.log('📊 [HomePage] Response structure:', {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data)
      });

      // Products API now returns { data: [...], total: ... } to match videos API format
      const productsData = response.data?.data || (Array.isArray(response.data) ? response.data : []);
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
      setTestResults(`✅ Products: ${formattedProducts.length} loaded`);
      console.log('💾 [HomePage] Products state updated:', formattedProducts.length);
    } catch (err: any) {
      console.error('❌ [HomePage] Error fetching products:', err);
      setTestResults(`❌ Products error: ${err.message}`);
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
          <p className="text-blue-600 text-xs mt-4 font-mono">{testResults}</p>
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
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-blue-600 text-xs mb-6 font-mono bg-blue-50 p-3 rounded">{testResults}</p>
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
      {/* Debug Info Banner - Always visible for troubleshooting - ULTRA VISIBLE */}
      <div className="bg-red-600 text-white border-b-4 border-red-800 p-6 text-base font-bold sticky top-0 z-[9999] shadow-2xl" style={{ position: 'sticky', top: 0 }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <strong className="text-white text-2xl block">🔍 DEBUG INFO - معلومات التشخيص</strong>
            <button 
              onClick={fetchAllData}
              className="bg-white text-red-600 px-4 py-2 rounded font-bold hover:bg-gray-200"
            >
              إعادة المحاولة / Retry
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="bg-white text-red-600 p-3 rounded-lg">
              <span className="font-bold block mb-1">Short Videos:</span>
              <span className="text-3xl font-bold">{shortVideos.length}</span>
            </div>
            <div className="bg-white text-red-600 p-3 rounded-lg">
              <span className="font-bold block mb-1">Long Videos:</span>
              <span className="text-3xl font-bold">{longVideos.length}</span>
            </div>
            <div className="bg-white text-red-600 p-3 rounded-lg">
              <span className="font-bold block mb-1">Products:</span>
              <span className="text-3xl font-bold">{products.length}</span>
            </div>
            <div className={`p-3 rounded-lg ${loading ? 'bg-yellow-400 text-yellow-900' : 'bg-green-400 text-green-900'}`}>
              <span className="font-bold block mb-1">Loading:</span>
              <span className="text-2xl font-bold">{loading ? 'نعم / Yes' : 'لا / No'}</span>
            </div>
            <div className={`p-3 rounded-lg ${error ? 'bg-red-400 text-red-900' : 'bg-green-400 text-green-900'}`}>
              <span className="font-bold block mb-1">Error:</span>
              <span className="text-2xl font-bold">{error ? 'نعم / Yes' : 'لا / No'}</span>
            </div>
          </div>
          {testResults && (
            <div className="mt-3 bg-red-800 p-3 rounded text-sm">
              <strong>Status / الحالة:</strong> {testResults}
            </div>
          )}
          {error && (
            <div className="mt-3 bg-red-900 p-3 rounded text-sm">
              <strong>Error / الخطأ:</strong> {error}
            </div>
          )}
        </div>
      </div>

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
