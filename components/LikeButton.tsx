'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { videosAPI, productsAPI } from '@/lib/api';

interface LikeButtonProps {
  videoId?: string;
  productId?: string;
  initialLikes: number;
  initialLiked?: boolean;
  locale?: string;
}

export default function LikeButton({ videoId, productId, initialLikes, initialLiked, locale }: LikeButtonProps) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked || false);
  const [loading, setLoading] = useState(false);
  const isZhLocale = locale === 'zh';
  
  const ariaLabel = isZhLocale ? (liked ? '取消收藏' : '收藏') : (liked ? 'Unlike' : 'Like');

  useEffect(() => {
    setLikes(initialLikes);
    setLiked(initialLiked || false);
  }, [initialLikes, initialLiked]);

  useEffect(() => {
    // Check if user has liked this item when component mounts
    if (user && (videoId || productId)) {
      checkLikeStatus();
    }
  }, [user, videoId, productId]);

  const checkLikeStatus = async () => {
    if (!user) return;

    try {
      if (videoId) {
        const response = await videosAPI.checkVideoLike(videoId);
        setLiked(response.data?.liked || false);
      } else if (productId) {
        const response = await productsAPI.checkProductLike(productId);
        setLiked(response.data?.liked || false);
      }
    } catch (error) {
      // If endpoint doesn't exist yet, use initialLiked value
      console.warn('Could not check like status:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('请先登录');
      return;
    }

    setLoading(true);

    try {
      if (videoId) {
        if (liked) {
          await videosAPI.unlikeVideo(videoId);
          setLikes((prev) => Math.max(0, prev - 1));
        } else {
          await videosAPI.likeVideo(videoId);
          setLikes((prev) => prev + 1);
        }
      } else if (productId) {
        if (liked) {
          await productsAPI.unlikeProduct(productId);
          setLikes((prev) => Math.max(0, prev - 1));
        } else {
          await productsAPI.likeProduct(productId);
          setLikes((prev) => prev + 1);
        }
      }
      setLiked(!liked);
    } catch (error: any) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setLiked(liked);
      setLikes(initialLikes);
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.error || error.message || '操作失败，请重试';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
        liked
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } disabled:opacity-50`}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
      <span>{likes}</span>
    </button>
  );
}
