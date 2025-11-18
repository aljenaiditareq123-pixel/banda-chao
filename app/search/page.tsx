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
      <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Header */}
          <div className="mb-10 text-center md:text-right">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('search') || 'البحث'}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto md:mx-0">
              {t('searchSubtitle') || 'ابحث عن المنتجات، الفيديوهات، والحرفيين'}
            </p>
          </div>

          {/* Search Input */}
          <div className="mb-8">
            <div className="relative max-w-3xl mx-auto">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder') || 'ابحث عن المنتجات، الفيديوهات...'}
                className={`w-full px-6 py-4 text-lg ${isRTL ? 'pr-14 pl-6' : 'pl-14 pr-6'} border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-5' : 'left-0 pl-5'} flex items-center pointer-events-none`}>
                <svg
                  className="h-6 w-6 text-gray-400"
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
            <div className="mb-8 flex flex-wrap gap-2 justify-center md:justify-start border-b-2 border-gray-200 pb-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-3 font-semibold text-sm md:text-base rounded-t-xl transition-all duration-200 ${
                  activeTab === 'all'
                    ? 'text-primary-700 bg-primary-50 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {t('all') || 'الكل'} ({getTotalResults()})
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-3 font-semibold text-sm md:text-base rounded-t-xl transition-all duration-200 ${
                  activeTab === 'products'
                    ? 'text-primary-700 bg-primary-50 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {t('products') || 'المنتجات'} ({searchResults.products.length})
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-6 py-3 font-semibold text-sm md:text-base rounded-t-xl transition-all duration-200 ${
                  activeTab === 'videos'
                    ? 'text-primary-700 bg-primary-50 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {t('videos') || 'الفيديوهات'} ({searchResults.videos.length})
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">{t('searching') || 'جاري البحث...'}</p>
            </div>
          )}

          {/* Results */}
          {!loading && searched && (
            <div className="space-y-8">
              {/* No Results */}
              {getTabResults() === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">
                    {t('noResults') || 'لم يتم العثور على نتائج'}
                  </p>
                  <p className="text-gray-500">
                    {t('tryDifferentKeywords') || 'جرب استخدام كلمات مفتاحية مختلفة'}
                  </p>
                </div>
              )}

              {/* Products Tab */}
              {(activeTab === 'all' || activeTab === 'products') && searchResults.products.length > 0 && (
                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    {t('products') || 'المنتجات'} ({searchResults.products.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    {t('videos') || 'الفيديوهات'} ({searchResults.videos.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {searchResults.videos.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                </section>
              )}

              {/* Users Tab (if needed) */}
              {activeTab === 'all' && searchResults.users.length > 0 && (
                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    {t('users') || 'المستخدمون'} ({searchResults.users.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {searchResults.users.map((user: any) => (
                      <Link
                        key={user.id}
                        href={`/profile/${user.id}`}
                        className="bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-lg transition p-6"
                      >
                        <div className="flex items-center gap-4">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.name}
                              className="w-14 h-14 rounded-full border-2 border-primary-200"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-lg">
                              {(user.name || 'U')[0].toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{user.name || t('user') || 'مستخدم'}</p>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
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
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                {t('startSearching') || 'ابدأ البحث'}
              </p>
              <p className="text-gray-500">
                {t('enterKeywordsToSearch') || 'أدخل كلمات مفتاحية للبحث عن المنتجات، الفيديوهات، والمستخدمين'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
