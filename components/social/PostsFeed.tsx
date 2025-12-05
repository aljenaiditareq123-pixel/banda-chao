'use client';

import { useState, useEffect } from 'react';
import { postsAPI } from '@/lib/api';
import PostCard from './PostCard';
import CreatePostForm from './CreatePostForm';
import { useAuth } from '@/hooks/useAuth';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import Button from '@/components/Button';

interface PostsFeedProps {
  locale: string;
  makerId?: string;
}

export default function PostsFeed({ locale, makerId }: PostsFeedProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [makerId, page]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postsAPI.getAll({
        page,
        limit: 20,
        makerId,
      });
      if (response.posts) {
        if (page === 1) {
          setPosts(response.posts);
        } else {
          setPosts((prev) => [...prev, ...response.posts]);
        }
        setHasMore(response.pagination.page < response.pagination.totalPages);
      }
    } catch (err: any) {
      console.error('Error loading posts:', err);
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    setShowCreateForm(false);
    setPage(1);
    loadPosts();
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const texts = {
    ar: {
      title: 'المنشورات',
      createPost: 'إنشاء منشور',
      loadMore: 'تحميل المزيد',
      noPosts: 'لا توجد منشورات بعد',
      loginToPost: 'سجل الدخول لإنشاء منشور',
    },
    en: {
      title: 'Posts',
      createPost: 'Create Post',
      loadMore: 'Load More',
      noPosts: 'No posts yet',
      loginToPost: 'Login to create a post',
    },
    zh: {
      title: '帖子',
      createPost: '创建帖子',
      loadMore: '加载更多',
      noPosts: '暂无帖子',
      loginToPost: '登录以创建帖子',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <LoadingState fullScreen />
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <ErrorState message={error} fullScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          {user && (
            <Button
              variant="primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? (locale === 'ar' ? 'إلغاء' : locale === 'zh' ? '取消' : 'Cancel') : t.createPost}
            </Button>
          )}
        </div>

        {/* Create Post Form */}
        {showCreateForm && user && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <CreatePostForm
              locale={locale}
              onPostCreated={handlePostCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">{t.noPosts}</p>
            {!user && (
              <p className="text-sm text-gray-400">{t.loginToPost}</p>
            )}
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  ...post,
                  _count: {
                    post_likes: post._count?.post_likes || 0,
                  },
                }}
                locale={locale}
                initialLiked={false} // TODO: Check if user liked this post
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-6">
                <Button
                  variant="secondary"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? (locale === 'ar' ? 'جاري التحميل...' : locale === 'zh' ? '加载中...' : 'Loading...') : t.loadMore}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

