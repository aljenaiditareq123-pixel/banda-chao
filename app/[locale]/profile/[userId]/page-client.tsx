'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { usersAPI, postsAPI, productsAPI } from '@/lib/api';
import { getApiBaseUrl } from '@/lib/api-utils';
import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';
import { apiCall, handleApiError } from '@/lib/api-error-handler';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string | null;
  profilePicture: string | null;
  createdAt: string;
  role?: string;
}

interface Post {
  id: string;
  content: string;
  images: string[];
  userId: string;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    profilePicture: string | null;
  };
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

interface ProfilePageClientProps {
  locale: string;
  userId: string;
  initialProfile?: User | null;
}

export default function ProfilePageClient({ locale, userId, initialProfile }: ProfilePageClientProps) {
  const { user: currentUser } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(initialProfile || null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(!initialProfile);
  const [activeTab, setActiveTab] = useState<'posts' | 'products' | 'videos'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    try {
      setError(null);
      
      // Load user profile
      if (!profile) {
        try {
          const userResponse = await usersAPI.getUser(userId);
          setProfile(userResponse.data);
        } catch (err: any) {
          if (err.response?.status === 404) {
            setError('userNotFound');
          } else {
            setError('loadError');
          }
          setLoading(false);
          return;
        }
      }

      // Load user's posts, products, and videos in parallel with staggered requests
      const apiBaseUrl = getApiBaseUrl();
      
      try {
        // Load posts
        const postsResponse = await postsAPI.getPosts();
        const allPosts = Array.isArray(postsResponse.data) ? postsResponse.data : [];
        const userPosts = allPosts.filter((post: Post) => post.userId === userId);
        setPosts(userPosts);
      } catch (err) {
        console.error('[Profile] Failed to load posts:', err);
      }

      // Stagger products request
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        // Load products
        const productsResponse = await productsAPI.getProducts();
        const allProducts = productsResponse.data?.data || (Array.isArray(productsResponse.data) ? productsResponse.data : []);
        const userProducts = allProducts.filter((product: Product) => product.userId === userId);
        setProducts(userProducts);
      } catch (err) {
        console.error('[Profile] Failed to load products:', err);
      }

      // Stagger videos request
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        // Load videos
        const videosResponse = await fetchJsonWithRetry(`${apiBaseUrl}/videos?limit=100`, {
          maxRetries: 2,
          retryDelay: 1000,
        });
        const allVideos = videosResponse.data?.data || (Array.isArray(videosResponse.data) ? videosResponse.data : []);
        const userVideos = allVideos.filter((video: any) => video.userId === userId);
        setVideos(userVideos);
      } catch (err) {
        console.error('[Profile] Failed to load videos:', err);
      }

      // Load follow status if not own profile
      if (currentUser && currentUser.id !== userId) {
        await loadFollowStatus();
      }
    } catch (error: any) {
      console.error('[Profile] Failed to load profile data:', error);
      setError('loadError');
    } finally {
      setLoading(false);
    }
  };

  const loadFollowStatus = async () => {
    if (!currentUser || isOwnProfile) return;

    try {
      const apiBaseUrl = getApiBaseUrl();
      
      // Load followers and following counts
      const [followersRes, followingRes] = await Promise.all([
        fetchJsonWithRetry(`${apiBaseUrl}/users/${userId}/followers`, {
          maxRetries: 2,
          retryDelay: 1000,
        }).catch(() => []),
        fetchJsonWithRetry(`${apiBaseUrl}/users/${userId}/following`, {
          maxRetries: 2,
          retryDelay: 1000,
        }).catch(() => []),
      ]);

      // Backend returns array directly (fetchJsonWithRetry returns JSON directly)
      const followers = Array.isArray(followersRes) ? followersRes : (followersRes.data || []);
      const following = Array.isArray(followingRes) ? followingRes : (followingRes.data || []);
      
      setFollowersCount(followers.length);
      setFollowingCount(following.length);

      // Check if current user is following this user
      const isCurrentUserFollowing = followers.some((f: any) => f.id === currentUser.id);
      setIsFollowing(isCurrentUserFollowing);
    } catch (error) {
      console.error('[Profile] Failed to load follow status:', error);
    }
  };

  const handleToggleFollow = async () => {
    if (!currentUser) {
      router.push(`/${locale}/login?redirect=/${locale}/profile/${userId}`);
      return;
    }

    if (followLoading) return;

    setFollowLoading(true);
    const previousState = isFollowing;

    // Optimistic update
    setIsFollowing(!previousState);
    setFollowersCount((prev) => prev + (previousState ? -1 : 1));

    try {
      const apiBaseUrl = getApiBaseUrl();
      const token = localStorage.getItem('auth_token');
      
      if (previousState) {
        await apiCall(`${apiBaseUrl}/users/${userId}/follow`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } else {
        await apiCall(`${apiBaseUrl}/users/${userId}/follow`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      // Refresh follow status
      await loadFollowStatus();
    } catch (error: any) {
      console.error('[Profile] Failed to toggle follow:', error);
      const userFriendlyMessage = handleApiError(error);
      console.error('[Profile] User-friendly error:', userFriendlyMessage);
      // Revert optimistic update
      setIsFollowing(previousState);
      setFollowersCount((prev) => prev + (previousState ? 1 : -1));
    } finally {
      setFollowLoading(false);
    }
  };

  const isOwnProfile = currentUser?.id === userId;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading') || 'جاري التحميل...'}</p>
        </div>
      </div>
    );
  }

  if (error === 'userNotFound' || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-8 max-w-md mx-4">
          <div className="text-6xl mb-4">👤</div>
          <p className="text-gray-600 text-lg font-semibold mb-4">{t('userNotFound') || 'المستخدم غير موجود'}</p>
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-medium">
            <span>←</span>
            <span>{t('backToHome') || 'العودة للصفحة الرئيسية'}</span>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-8 max-w-md mx-4">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-gray-600 text-lg font-semibold mb-4">{t('loadError') || 'حدث خطأ أثناء تحميل البيانات'}</p>
          <button
            onClick={loadProfileData}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-medium"
          >
            <span>🔄</span>
            <span>{t('retry') || 'إعادة المحاولة'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-b-2 border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={profile.name || 'User'}
                  className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover border-4 border-white shadow-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="h-32 w-32 md:h-40 md:w-40 rounded-full bg-primary-600 flex items-center justify-center text-white text-5xl md:text-6xl font-bold shadow-xl">${(profile.name || profile.email || 'U').charAt(0).toUpperCase()}</div>`;
                    }
                  }}
                />
              ) : (
                <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-primary-600 flex items-center justify-center text-white text-5xl md:text-6xl font-bold shadow-xl">
                  {(profile.name || profile.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-right">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {profile.name || profile.email || t('unnamedUser') || 'مستخدم غير معروف'}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm mb-6">
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
                  <span className="font-bold text-primary-600 text-lg">{posts.length}</span>
                  <span className="text-gray-600 mr-1">{t('posts') || 'منشورات'}</span>
                </div>
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
                  <span className="font-bold text-primary-600 text-lg">{products.length}</span>
                  <span className="text-gray-600 mr-1">{t('products') || 'منتجات'}</span>
                </div>
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
                  <span className="font-bold text-primary-600 text-lg">{videos.length}</span>
                  <span className="text-gray-600 mr-1">{t('videos') || 'فيديوهات'}</span>
                </div>
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
                  <span className="font-bold text-primary-600 text-lg">{followersCount}</span>
                  <span className="text-gray-600 mr-1">{t('followers') || 'متابعون'}</span>
                </div>
                <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
                  <span className="font-bold text-primary-600 text-lg">{followingCount}</span>
                  <span className="text-gray-600 mr-1">{t('following') || 'متابَعون'}</span>
                </div>
              </div>
              <div className="flex justify-center md:justify-start gap-3">
                {isOwnProfile ? (
                  <Link
                    href={`/${locale}/profile/${userId}/edit`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-semibold shadow-lg"
                  >
                    <span>✏️</span>
                    <span>{t('editProfile') || 'تعديل الملف الشخصي'}</span>
                  </Link>
                ) : (
                  <button
                    onClick={handleToggleFollow}
                    disabled={followLoading || !currentUser}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl transition font-semibold shadow-lg ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    } ${followLoading ? 'opacity-50 cursor-wait' : ''} ${
                      !currentUser ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {followLoading ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>{t('processing') || 'جاري المعالجة...'}</span>
                      </>
                    ) : isFollowing ? (
                      <>
                        <span>✓</span>
                        <span>{t('following') || 'متابع'}</span>
                      </>
                    ) : (
                      <>
                        <span>+</span>
                        <span>{t('follow') || 'متابعة'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
          <div className="border-b-2 border-gray-200">
            <nav className="flex flex-wrap gap-2 p-4">
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-6 py-3 font-semibold text-sm md:text-base rounded-xl transition-all duration-200 ${
                  activeTab === 'posts'
                    ? 'text-primary-700 bg-primary-50 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {t('posts') || 'المنشورات'} ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-3 font-semibold text-sm md:text-base rounded-xl transition-all duration-200 ${
                  activeTab === 'products'
                    ? 'text-primary-700 bg-primary-50 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {t('products') || 'المنتجات'} ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-6 py-3 font-semibold text-sm md:text-base rounded-xl transition-all duration-200 ${
                  activeTab === 'videos'
                    ? 'text-primary-700 bg-primary-50 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {t('videos') || 'الفيديوهات'} ({videos.length})
              </button>
            </nav>
          </div>

          <div className="p-6 md:p-8">
            {activeTab === 'posts' ? (
              posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-gray-50 rounded-xl border-2 border-gray-200 p-6 hover:shadow-md transition">
                      <p className="text-gray-900 mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                      {post.images && post.images.length > 0 && (
                        <div className={`grid gap-3 mb-4 ${
                          post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                        }`}>
                          {post.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${t('postImage') || 'صورة المنشور'} ${index + 1}`}
                              className="w-full h-64 object-cover rounded-xl border border-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'zh' ? 'zh-CN' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">{t('noPosts') || 'لا توجد منشورات'}</p>
                  <p className="text-gray-500">{t('noPostsDescription') || 'لم يتم نشر أي منشورات بعد'}</p>
                </div>
              )
            ) : activeTab === 'products' ? (
              products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/${locale}/products/${product.id}`}
                      className="group bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
                    >
                      {product.imageUrl ? (
                        <div className="w-full h-48 bg-gray-200 overflow-hidden">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/400x300?text=Product';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center border-b-2 border-gray-200">
                          <span className="text-gray-400 text-4xl">📦</span>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        {product.price && (
                          <p className="text-lg font-bold text-primary-600 mb-2">
                            ¥{product.price.toFixed(2)}
                          </p>
                        )}
                        <a
                          href={product.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {t('viewProduct') || 'عرض المنتج'} →
                        </a>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">{t('noProducts') || 'لا توجد منتجات'}</p>
                  <p className="text-gray-500">{t('noProductsDescription') || 'لم يتم إضافة أي منتجات بعد'}</p>
                </div>
              )
            ) : (
              videos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => (
                    <Link
                      key={video.id}
                      href={`/${locale}/videos/${video.id}`}
                      className="group bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
                    >
                      {video.thumbnailUrl || video.thumbnail ? (
                        <div className="w-full h-48 bg-gray-200 overflow-hidden relative">
                          <img
                            src={video.thumbnailUrl || video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/640x360?text=Video';
                            }}
                          />
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {video.duration ? `${Math.floor(video.duration / 60)}:${String(video.duration % 60).padStart(2, '0')}` : '0:00'}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center border-b-2 border-gray-200">
                          <span className="text-gray-400 text-4xl">🎥</span>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition">
                          {video.title}
                        </h3>
                        {video.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>👁️ {video.views || 0}</span>
                          <span>❤️ {video.likes || 0}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🎥</div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">{t('noVideos') || 'لا توجد فيديوهات'}</p>
                  <p className="text-gray-500">{t('noVideosDescription') || 'لم يتم إضافة أي فيديوهات بعد'}</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

