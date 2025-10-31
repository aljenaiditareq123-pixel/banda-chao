'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import VideoCard from '@/components/VideoCard';
import ProductCard from '@/components/ProductCard';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    videos: any[];
    products: any[];
  }>({ videos: [], products: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const supabase = createClient();

  const handleSearch = async () => {
    if (!query.trim()) {
      setSearchResults({ videos: [], products: [] });
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // Search videos
      const { data: videos } = await supabase
        .from('videos')
        .select('*, profiles(username, avatar_url)')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20);

      // Search products
      const { data: products } = await supabase
        .from('products')
        .select('*, profiles(username, avatar_url)')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20);

      setSearchResults({
        videos: videos || [],
        products: products || [],
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ videos: [], products: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setSearchResults({ videos: [], products: [] });
        setSearched(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">搜索</h1>

        {/* Search Input */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索视频、商品..."
              className="w-full px-4 py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-2 text-gray-600">搜索中...</p>
          </div>
        )}

        {!loading && searched && (
          <>
            {/* Videos Results */}
            {searchResults.videos.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  视频结果 ({searchResults.videos.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.videos.map((video) => (
                    <VideoCard
                      key={video.id}
                      video={{
                        id: video.id,
                        userId: video.user_id,
                        title: video.title,
                        description: video.description,
                        thumbnail: video.thumbnail_url,
                        videoUrl: video.video_url,
                        duration: video.duration,
                        views: video.views,
                        likes: video.likes,
                        comments: 0,
                        createdAt: video.created_at,
                        type: video.type,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Products Results */}
            {searchResults.products.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  商品结果 ({searchResults.products.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={{
                        id: product.id,
                        userId: product.user_id,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        images: [],
                        category: product.category,
                        stock: product.stock,
                        rating: product.rating,
                        reviewCount: product.review_count,
                        createdAt: product.created_at,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchResults.videos.length === 0 && searchResults.products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">未找到结果</p>
                <p className="text-gray-500 mt-2">尝试使用不同的关键词搜索</p>
              </div>
            )}
          </>
        )}

        {!searched && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">输入关键词开始搜索</p>
          </div>
        )}
      </div>
    </div>
  );
}

