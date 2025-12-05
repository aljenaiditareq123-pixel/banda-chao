'use client';

import { useState } from 'react';
import Link from 'next/link';
import LikeButton from './LikeButton';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { useAuth } from '@/hooks/useAuth';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    images: string[];
    created_at: string | Date;
    users: {
      id: string;
      name: string | null;
      profile_picture: string | null;
    };
    _count?: {
      post_likes: number;
    };
  };
  locale: string;
  initialLiked?: boolean;
}

export default function PostCard({ post, locale, initialLiked = false }: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : locale === 'zh' ? 'zh-CN' : 'en-US');
    } else if (days > 0) {
      return locale === 'ar' ? `منذ ${days} يوم` : locale === 'zh' ? `${days}天前` : `${days}d ago`;
    } else if (hours > 0) {
      return locale === 'ar' ? `منذ ${hours} ساعة` : locale === 'zh' ? `${hours}小时前` : `${hours}h ago`;
    } else if (minutes > 0) {
      return locale === 'ar' ? `منذ ${minutes} دقيقة` : locale === 'zh' ? `${minutes}分钟前` : `${minutes}m ago`;
    } else {
      return locale === 'ar' ? 'الآن' : locale === 'zh' ? '刚刚' : 'now';
    }
  };

  const texts = {
    ar: {
      showComments: 'عرض التعليقات',
      hideComments: 'إخفاء التعليقات',
      comments: 'تعليق',
      noComments: 'لا توجد تعليقات',
    },
    en: {
      showComments: 'Show comments',
      hideComments: 'Hide comments',
      comments: 'comment',
      noComments: 'No comments yet',
    },
    zh: {
      showComments: '显示评论',
      hideComments: '隐藏评论',
      comments: '评论',
      noComments: '暂无评论',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Post Header */}
      <div className="flex items-start gap-3 mb-4">
        <Link href={`/${locale}/makers/${post.users.id}`}>
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {post.users.profile_picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.users.profile_picture}
                alt={post.users.name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl">👤</span>
            )}
          </div>
        </Link>
        <div className="flex-1">
          <Link href={`/${locale}/makers/${post.users.id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-primary transition-colors">
              {post.users.name || 'Anonymous'}
            </h3>
          </Link>
          <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {post.images.map((image, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`Post image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
        <LikeButton
          targetType="POST"
          targetId={post.id}
          initialLiked={initialLiked}
          initialLikesCount={post._count?.post_likes || 0}
          locale={locale}
          showCount={true}
        />
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-sm">
            {showComments ? t.hideComments : t.showComments}
            {commentsCount > 0 && ` (${commentsCount})`}
          </span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <CommentList
            targetType="POST"
            targetId={post.id}
            locale={locale}
            onCommentsCountChange={setCommentsCount}
          />
          {user && (
            <div className="mt-4">
              <CommentForm
                targetType="POST"
                targetId={post.id}
                locale={locale}
                onCommentAdded={() => {
                  setCommentsCount((prev) => prev + 1);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

