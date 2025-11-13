'use client';

import { useState, useEffect } from 'react';
import { searchAPI } from '@/lib/api';
import Link from 'next/link';
import VideoCard from '@/components/VideoCard';
import ProductCard from '@/components/ProductCard';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

type TabType = 'all' | 'products' | 'videos';

export default function SearchPage() {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchResults, setSearchResults] = useState<{
    videos: any[];
    products: any[];
    users: any[];
  }>({ videos: [], products: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const isRTL = language === 'ar';

  const handleSearch = async (searchQuery?: string) => {
    const searchTerm = searchQuery || query.trim();
    
    if (!searchTerm) {
      setSearchResults({ videos: [], products: [], users: [] });
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // Determine which type to search based on active tab
      let searchType: 'videos' | 'products' | 'users' | undefined;
      if (activeTab === 'videos') searchType = 'videos';
      else if (activeTab === 'products') searchType = 'products';
      // 'all' searches everything (no type filter)

      const response = await searchAPI.search(searchTerm, searchType);
      const data = response.data;

      // Format videos
      const formattedVideos = (data.videos || []).map((video: any) => ({
        id: video.id,
        userId: video.userId,
        title: video.title,
        thumbnail: video.thumbnailUrl || video.thumbnail,
        videoUrl: video.videoUrl,
        duration: video.duration,
        views: video.views || 0,
        likes: video.likes || 0,
        comments: 0,
        createdAt: video.createdAt,
        type: video.type as 'short' | 'long',
      }));

      // Format products
      const formattedProducts = (data.products || []).map((product: any) => ({
        id: product.id,
        userId: product.userId,
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.imageUrl ? [product.imageUrl] : product.images || [],
        category: product.category,
        stock: 0,
        rating: 0,
        reviewCount: 0,
        createdAt: product.createdAt,
        externalLink: product.externalLink,
        maker: product.maker || product.user,
      }));

      setSearchResults({
        videos: formattedVideos,
        products: formattedProducts,
        users: data.users || [],
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ videos: [], products: [], users: [] });
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setSearchResults({ videos: [], products: [], users: [] });
        setSearched(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeTab]);

  const getTotalResults = () => {
    return searchResults.videos.length + searchResults.products.length + searchResults.users.length;
  };

  const getTabResults = () => {
    switch (activeTab) {
      case 'products':
        return searchResults.products.length;
      case 'videos':
        return searchResults.videos.length;
      default:
        return getTotalResults();
    }
  };

  return (
    <Layout showHeader={false}>
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('search') || '搜索'}</h1>

          {/* Search Input */}
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search') || '搜索视频、商品...'}
                className={`w-full px-4 py-3 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Tabs */}
          {searched && (
            <div className="mb-6 border-b border-gray-200">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                    activeTab === 'all'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  全部 ({getTotalResults()})
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                    activeTab === 'products'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  商品 ({searchResults.products.length})
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                    activeTab === 'videos'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  视频 ({searchResults.videos.length})
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p className="mt-4 text-gray-500">搜索中...</p>
            </div>
          )}

          {/* Results */}
          {!loading && searched && (
            <div className="space-y-8">
              {/* No Results */}
              {getTabResults() === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-500 text-lg mb-2">未找到结果</p>
                  <p className="text-gray-400 text-sm">尝试使用不同的关键词</p>
                </div>
              )}

              {/* Products Tab */}
              {(activeTab === 'all' || activeTab === 'products') && searchResults.products.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    商品 ({searchResults.products.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {searchResults.products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        href={`/products/${product.id}`}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Videos Tab */}
              {(activeTab === 'all' || activeTab === 'videos') && searchResults.videos.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    视频 ({searchResults.videos.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {searchResults.videos.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                </section>
              )}

              {/* Users Tab (if needed) */}
              {activeTab === 'all' && searchResults.users.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    用户 ({searchResults.users.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {searchResults.users.map((user: any) => (
                      <Link
                        key={user.id}
                        href={`/profile/${user.id}`}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.profilePicture || '/default-avatar.png'}
                            alt={user.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Initial State */}
          {!searched && !loading && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">输入关键词开始搜索</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
