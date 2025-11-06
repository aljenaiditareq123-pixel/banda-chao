'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface LikeButtonProps {
  videoId?: string;
  productId?: string;
  initialLikes: number;
  initialLiked?: boolean;
}

export default function LikeButton({ videoId, productId, initialLikes, initialLiked }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked || false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (user && (videoId || productId)) {
      checkLike();
    }
  }, [user, videoId, productId]);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const checkLike = async () => {
    if (!user) return;

    if (videoId) {
      const { data } = await supabase
        .from('video_likes')
        .select('*')
        .eq('video_id', videoId)
        .eq('user_id', user.id)
        .single();
      setLiked(!!data);
    } else if (productId) {
      const { data } = await supabase
        .from('product_likes')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();
      setLiked(!!data);
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
          await supabase
            .from('video_likes')
            .delete()
            .eq('video_id', videoId)
            .eq('user_id', user.id);
          setLikes(likes - 1);
        } else {
          await supabase
            .from('video_likes')
            .insert({
              video_id: videoId,
              user_id: user.id,
            });
          setLikes(likes + 1);
        }
      } else if (productId) {
        if (liked) {
          await supabase
            .from('product_likes')
            .delete()
            .eq('product_id', productId)
            .eq('user_id', user.id);
          setLikes(likes - 1);
        } else {
          await supabase
            .from('product_likes')
            .insert({
              product_id: productId,
              user_id: user.id,
            });
          setLikes(likes + 1);
        }
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }

    setLoading(false);
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
    >
      <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
      <span>{likes}</span>
    </button>
  );
}

