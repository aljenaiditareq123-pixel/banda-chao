'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { postsAPI, likesAPI } from '@/lib/api';
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

interface Post {
  id: string;
  content?: string;
  images?: string[];
  created_at?: string | Date;
  users?: {
    id: string;
    name: string | null;
    profile_picture: string | null;
  };
  _count?: {
    post_likes: number;
  };
  [key: string]: unknown;
}

export default function PostsFeed({ locale, makerId }: PostsFeedProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isLoadingRef = useRef(false); // 🌟 Use ref to prevent duplicate requests

  const loadPosts = useCallback(async () => {
    // 🌟 Prevent multiple simultaneous requests using ref
    if (isLoadingRef.current) {
      console.log('[PostsFeed] Already loading, skipping duplicate request');
      return;
    }

    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      
      console.log('[PostsFeed] Fetching posts...', { page, makerId });
      const response = await postsAPI.getAll({
        page,
        limit: 20,
        makerId,
      });
      
      console.log('[PostsFeed] Response received:', { 
        hasResponse: !!response,
        hasPosts: !!(response?.posts),
        hasData: !!(response?.data),
        responseType: typeof response,
        responseKeys: response ? Object.keys(response) : [],
      });
      
      // 🌟 Handle both 200 OK and 304 Not Modified responses
      // 304 responses may have empty or undefined response.data
      // axios treats 304 as success, but response.data might be undefined
      const postsData = response?.posts || response?.data || [];
      
      console.log('[PostsFeed] Posts data:', { 
        isArray: Array.isArray(postsData),
        length: Array.isArray(postsData) ? postsData.length : 0,
      });
      
      if (Array.isArray(postsData) && postsData.length > 0) {
        // We have posts data
        console.log('[PostsFeed] Setting posts:', postsData.length);
        setPosts((prevPosts) => {
          // Use functional update to avoid dependency on posts
          const newPosts = page === 1 ? postsData : [...prevPosts, ...postsData];
          return newPosts;
        });
        
        // Handle pagination if available
        if (response?.pagination) {
          setHasMore(response.pagination.page < response.pagination.totalPages);
        } else {
          // If no pagination info, assume there's more if we got a full page
          setHasMore(postsData.length === 20);
        }
        
        // Check which posts the user liked (if authenticated)
        if (user && postsData.length > 0) {
          const likedSet = new Set<string>();
          await Promise.all(
            postsData.map(async (post: Post) => {
              try {
                const likeStatus = await likesAPI.getStatus('POST', post.id);
                if (likeStatus.liked) {
                  likedSet.add(post.id);
                }
              } catch (err) {
                // Silently fail - user might not be authenticated or post might not exist
                console.warn('Failed to check like status for post:', post.id);
              }
            })
          );
          setLikedPosts((prevLiked) => {
            // Merge with existing liked posts
            const merged = new Set(prevLiked);
            likedSet.forEach((id) => merged.add(id));
            return merged;
          });
        }
      } else {
        // 🌟 Handle empty response (304 Not Modified with no body, or empty array)
        console.log('[PostsFeed] Empty response - 304 or no data');
        // If we have existing posts, keep them. Otherwise, show empty state.
        setPosts((prevPosts) => {
          // If this is page 1 and we have no data, clear posts
          if (page === 1) {
            console.log('[PostsFeed] Page 1 with no data - clearing posts');
            return [];
          }
          // Otherwise, keep existing posts (for pagination)
          console.log('[PostsFeed] Keeping existing posts:', prevPosts.length);
          return prevPosts;
        });
        setHasMore(false);
        // Don't set error - 304 is a valid response, and empty array is also valid
      }
    } catch (err: any) {
      console.error('[PostsFeed] Error loading posts:', err);
      setError(err.message || 'Failed to load posts');
      // 🌟 On error, clear posts only if it's the first page
      if (page === 1) {
        setPosts([]);
      }
    } finally {
      // 🌟 CRITICAL: Always stop loading regardless of response status (200, 304, or error)
      console.log('[PostsFeed] Stopping loading state');
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, [makerId, page, user]); // 🌟 Removed 'posts' and 'loading' from dependencies to prevent infinite loop

  useEffect(() => {
    // 🌟 Only load posts when page or makerId changes, not on every render
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, makerId]); // 🌟 Removed loadPosts from dependencies to prevent infinite loop

  const handlePostCreated = () => {
    setShowCreateForm(false);
    setPage(1);
    setPosts([]);
    setLikedPosts(new Set());
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
                  id: post.id,
                  content: post.content || '',
                  images: post.images || [],
                  created_at: post.created_at || new Date(),
                  users: post.users || {
                    id: '',
                    name: null,
                    profile_picture: null,
                  },
                  _count: {
                    post_likes: post._count?.post_likes || 0,
                  },
                }}
                locale={locale}
                initialLiked={likedPosts.has(post.id)}
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

