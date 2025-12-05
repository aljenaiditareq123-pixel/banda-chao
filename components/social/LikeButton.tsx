'use client';

import { useState } from 'react';
import { likesAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface LikeButtonProps {
  targetType: 'POST' | 'PRODUCT' | 'VIDEO' | 'COMMENT';
  targetId: string;
  initialLiked?: boolean;
  initialLikesCount?: number;
  locale?: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export default function LikeButton({
  targetType,
  targetId,
  initialLiked = false,
  initialLikesCount = 0,
  locale = 'en',
  size = 'md',
  showCount = true,
}: LikeButtonProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLike = async () => {
    if (!user) {
      // Redirect to login or show message
      if (typeof window !== 'undefined') {
        window.location.href = `/${locale}/login`;
      }
      return;
    }

    if (isLoading) return;

    // Optimistic update
    const previousLiked = liked;
    const previousCount = likesCount;
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    setIsLoading(true);
    setError(null);

    try {
      const result = await likesAPI.toggle({ targetType, targetId });
      if (result.success) {
        setLiked(result.liked);
        setLikesCount(result.likesCount);
      } else {
        // Revert on failure
        setLiked(previousLiked);
        setLikesCount(previousCount);
        setError(locale === 'ar' ? 'فشل تحديث الإعجاب' : 'Failed to update like');
      }
    } catch (err: any) {
      // Revert on error
      setLiked(previousLiked);
      setLikesCount(previousCount);
      setError(err.message || (locale === 'ar' ? 'حدث خطأ' : 'An error occurred'));
      console.error('Like error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const texts = {
    ar: {
      like: 'إعجاب',
      liked: 'معجب',
    },
    en: {
      like: 'Like',
      liked: 'Liked',
    },
    zh: {
      like: '喜欢',
      liked: '已喜欢',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-2 transition-colors ${
        liked
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-500 hover:text-red-500'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={liked ? t.liked : t.like}
    >
      <svg
        className={sizeClasses[size]}
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showCount && (
        <span className={textSizeClasses[size]}>
          {likesCount > 0 ? likesCount : ''}
        </span>
      )}
      {error && (
        <span className="text-red-500 text-xs ml-2">{error}</span>
      )}
    </button>
  );
}

