'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI, postsAPI, productsAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string | null;
  profilePicture: string | null;
  createdAt: string;
}

interface Post {
  id: string;
  content: string;
  images: string[];
  userId: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  externalLink: string;
  price: number | null;
  userId: string;
  createdAt: string;
}

export default function ProfilePageClient({ userId }: { userId: string }) {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'products'>('posts');

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    try {
      // Load user profile
      const userResponse = await usersAPI.getUser(userId);
      setProfile(userResponse.data);

      // Load user's posts (from Express API)
      try {
        const postsResponse = await postsAPI.getPosts();
        const allPosts = Array.isArray(postsResponse.data) ? postsResponse.data : [];
        const userPosts = allPosts.filter((post: Post) => post.userId === userId);
        setPosts(userPosts);
      } catch (error) {
        console.error('Failed to load posts:', error);
      }

      // Load user's products
      const productsResponse = await productsAPI.getProducts();
      const allProducts = Array.isArray(productsResponse.data) ? productsResponse.data : [];
      const userProducts = allProducts.filter((product: Product) => product.userId === userId);
      setProducts(userProducts);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const isOwnProfile = currentUser?.id === userId;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">用户不存在</p>
          <Link href="/" className="mt-4 text-red-600 hover:text-red-700">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              {profile.profilePicture ? (
                <Image
                  src={profile.profilePicture}
                  alt={profile.name || 'User'}
                  width={128}
                  height={128}
                  className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                  unoptimized
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-red-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {(profile.name || profile.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile.name || profile.email || '未命名用户'}
              </h1>
              <div className="flex space-x-6 text-sm mb-4">
                <div>
                  <span className="font-semibold">{posts.length}</span>
                  <span className="text-gray-600 ml-1">动态</span>
                </div>
                <div>
                  <span className="font-semibold">{products.length}</span>
                  <span className="text-gray-600 ml-1">商品</span>
                </div>
              </div>
              {isOwnProfile && (
                <Link
                  href={`/profile/${userId}/edit`}
                  className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  编辑资料
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'posts'
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                动态 ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'products'
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                商品 ({products.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'posts' ? (
              posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <div key={post.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                      <p className="text-gray-900 mb-4 whitespace-pre-wrap">{post.content}</p>
                      {post.images && post.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {post.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Post image ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  暂无动态
                </div>
              )
            ) : (
              products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      {product.imageUrl ? (
                        <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">无图片</span>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        {product.price && (
                          <p className="text-lg font-bold text-red-600 mb-2">
                            ¥{product.price}
                          </p>
                        )}
                        <a
                          href={product.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          查看商品 →
                        </a>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  暂无商品
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

