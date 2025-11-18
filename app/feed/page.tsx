'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { postsAPI, postsLikesAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

interface Post {
  id: string;
  content: string;
  images: string[];
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    profilePicture: string | null;
  };
}

interface PostLikeState {
  liked: boolean;
  likesCount: number;
  loading: boolean;
}

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <FeedContent />
    </ProtectedRoute>
  );
}

function FeedContent() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [postLikes, setPostLikes] = useState<Record<string, PostLikeState>>({});
  const postsPerPage = 10;

  useEffect(() => {
    loadPosts(true);
  }, []);

  // Load like status for all posts when posts change
  useEffect(() => {
    if (user && posts.length > 0) {
      loadPostLikes();
    }
  }, [posts, user]);

  const loadPostLikes = async () => {
    if (!user) return;

    const likesPromises = posts.map(async (post) => {
      try {
        const response = await postsLikesAPI.getLikeStatus(post.id);
        return {
          postId: post.id,
          ...response.data,
        };
      } catch (error) {
        console.error(`[Feed] Failed to load like status for post ${post.id}:`, error);
        return {
          postId: post.id,
          liked: false,
          likesCount: 0,
        };
      }
    });

    const likesResults = await Promise.all(likesPromises);
    const likesMap: Record<string, PostLikeState> = {};

    likesResults.forEach((result) => {
      likesMap[result.postId] = {
        liked: result.liked || false,
        likesCount: result.likesCount || 0,
        loading: false,
      };
    });

    setPostLikes(likesMap);
  };

  const handleToggleLike = async (postId: string) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    const currentState = postLikes[postId];
    if (currentState?.loading) return; // Prevent double clicks

    // Optimistic update
    setPostLikes((prev) => ({
      ...prev,
      [postId]: {
        liked: !currentState?.liked,
        likesCount: (currentState?.likesCount || 0) + (currentState?.liked ? -1 : 1),
        loading: true,
      },
    }));

    try {
      if (currentState?.liked) {
        await postsLikesAPI.unlike(postId);
      } else {
        await postsLikesAPI.like(postId);
      }

      // Refresh like status to get accurate count
      const response = await postsLikesAPI.getLikeStatus(postId);
      setPostLikes((prev) => ({
        ...prev,
        [postId]: {
          liked: response.data.liked,
          likesCount: response.data.likesCount,
          loading: false,
        },
      }));
    } catch (error: any) {
      console.error('[Feed] Failed to toggle like:', error);
      // Revert optimistic update on error
      setPostLikes((prev) => ({
        ...prev,
        [postId]: {
          liked: currentState?.liked || false,
          likesCount: currentState?.likesCount || 0,
          loading: false,
        },
      }));
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000) {
        if (!loadingMore && hasMore) {
          loadMorePosts();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore]);

  const loadPosts = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }
      const response = await postsAPI.getPosts();
      const postsData = Array.isArray(response.data) ? response.data : [];
      if (reset) {
        setPosts(postsData);
        setHasMore(postsData.length >= postsPerPage);
      } else {
        setPosts((prev) => [...prev, ...postsData]);
        setHasMore(postsData.length >= postsPerPage);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await postsAPI.getPosts();
      const postsData = Array.isArray(response.data) ? response.data : [];
      const newPosts = postsData.slice((nextPage - 1) * postsPerPage, nextPage * postsPerPage);
      if (newPosts.length > 0) {
        setPosts((prev) => [...prev, ...newPosts]);
        setPage(nextPage);
        setHasMore(newPosts.length >= postsPerPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setCreating(true);
    try {
      await postsAPI.createPost({
        content: newPostContent,
        images: newPostImages,
      });

      setNewPostContent('');
      setNewPostImages([]);
      setShowCreateModal(false);
      loadPosts(true); // Reload posts
    } catch (error: any) {
      console.error('Failed to create post:', error);
      alert('فشل إنشاء المنشور: ' + (error.response?.data?.error || error.message));
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center md:text-right">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            {t('feed') || 'الخلاصة'}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {t('feedSubtitle') || 'منشورات المجتمع والمحتوى الإبداعي'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>✍️</span>
            <span>{t('createPost') || 'إنشاء منشور'}</span>
          </button>
        </div>

        {/* Create Post Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-6 md:p-8 max-w-2xl w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {t('createNewPost') || 'إنشاء منشور جديد'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPostContent('');
                    setNewPostImages([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={t('shareYourThoughts') || 'شارك أفكارك...'}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                  rows={6}
                  required
                />
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewPostContent('');
                      setNewPostImages([]);
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
                  >
                    {t('cancel') || 'إلغاء'}
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newPostContent.trim()}
                    className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold shadow-lg"
                  >
                    {creating ? (
                      <>
                        <span className="inline-block animate-spin mr-2">⏳</span>
                        {t('publishing') || 'جاري النشر...'}
                      </>
                    ) : (
                      t('publish') || 'نشر'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading') || 'جاري التحميل...'}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              {t('noPosts') || 'لا توجد منشورات بعد'}
            </p>
            <p className="text-gray-500 mb-6">
              {t('noPostsDescription') || 'كن أول من يشارك منشوراً في المجتمع'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-semibold"
            >
              <span>✍️</span>
              <span>{t('createFirstPost') || 'إنشاء أول منشور'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6 md:p-8 hover:shadow-xl transition-shadow">
                {/* Post Header */}
                <div className="flex items-center gap-4 mb-5">
                  <Link href={`/profile/${post.user.id}`} className="flex-shrink-0">
                    {post.user.profilePicture ? (
                      <img
                        src={post.user.profilePicture}
                        alt={post.user.name || 'User'}
                        className="w-12 h-12 rounded-full border-2 border-primary-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-lg">
                        {(post.user.name || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/profile/${post.user.id}`}
                      className="font-semibold text-gray-900 hover:text-primary-600 transition block"
                    >
                      {post.user.name || t('user') || 'مستخدم'}
                    </Link>
                    <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-gray-900 mb-4 whitespace-pre-wrap leading-relaxed text-base">
                  {post.content}
                </p>

                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                  <div className={`grid gap-3 mb-4 ${
                    post.images.length === 1 ? 'grid-cols-1' :
                    post.images.length === 2 ? 'grid-cols-2' :
                    'grid-cols-2'
                  }`}>
                    {post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${t('postImage') || 'صورة المنشور'} ${index + 1}`}
                        className="w-full h-64 object-cover rounded-xl border border-gray-200"
                      />
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    disabled={!user || postLikes[post.id]?.loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                      postLikes[post.id]?.liked
                        ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : ''} ${
                      postLikes[post.id]?.loading ? 'opacity-50 cursor-wait' : ''
                    }`}
                  >
                    <span className="text-xl">
                      {postLikes[post.id]?.liked ? '❤️' : '🤍'}
                    </span>
                    <span className="text-sm font-semibold">
                      {postLikes[post.id]?.likesCount || 0}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Infinite Scroll Loading */}
        {loadingMore && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 text-sm">{t('loadingMore') || 'جاري تحميل المزيد...'}</p>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>{t('noMorePosts') || 'لا توجد منشورات أخرى'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

