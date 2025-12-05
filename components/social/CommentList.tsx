'use client';

import { useState, useEffect, useCallback } from 'react';
import { commentsAPI } from '@/lib/api';
import LikeButton from './LikeButton';

interface CommentListProps {
  targetType: 'POST' | 'VIDEO' | 'PRODUCT';
  targetId: string;
  locale: string;
  onCommentsCountChange?: (count: number) => void;
}

interface Comment {
  id: string;
  content: string;
  likes: number;
  created_at: string | Date;
  users: {
    id: string;
    name: string | null;
    profile_picture: string | null;
  };
}

export default function CommentList({
  targetType,
  targetId,
  locale,
  onCommentsCountChange,
}: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commentsAPI.getByTarget(targetType, targetId);
      if (response.comments) {
        setComments(response.comments);
        if (onCommentsCountChange) {
          onCommentsCountChange(response.comments.length);
        }
      }
    } catch (err: any) {
      console.error('Error loading comments:', err);
      setError(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId, onCommentsCountChange]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

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
      loading: 'جاري التحميل...',
      error: 'فشل تحميل التعليقات',
      noComments: 'لا توجد تعليقات بعد',
    },
    en: {
      loading: 'Loading...',
      error: 'Failed to load comments',
      noComments: 'No comments yet',
    },
    zh: {
      loading: '加载中...',
      error: '加载评论失败',
      noComments: '暂无评论',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-500" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {t.loading}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {t.error}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {t.noComments}
      </div>
    );
  }

  return (
    <div className="space-y-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            {comment.users.profile_picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={comment.users.profile_picture}
                alt={comment.users.name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm">👤</span>
            )}
          </div>
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-gray-900">
                  {comment.users.name || 'Anonymous'}
                </span>
                <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
              </div>
              <p className="text-gray-800 text-sm whitespace-pre-wrap">{comment.content}</p>
            </div>
            <div className="mt-1 flex items-center gap-4">
              <LikeButton
                targetType="COMMENT"
                targetId={comment.id}
                initialLikesCount={comment.likes || 0}
                locale={locale}
                size="sm"
                showCount={true}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

