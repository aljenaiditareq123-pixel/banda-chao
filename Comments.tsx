'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  likes: number;
  created_at: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  };
  user_liked?: boolean;
}

interface CommentsProps {
  videoId?: string;
  productId?: string;
}

export default function Comments({ videoId, productId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (user !== null) {
      loadComments();
    }
  }, [videoId, productId, user]);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq(videoId ? 'video_id' : 'product_id', videoId || productId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Check if user liked each comment
      if (user) {
        const commentIds = data.map(c => c.id);
        const { data: likes } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentIds);

        const likedIds = new Set(likes?.map(l => l.comment_id) || []);
        data.forEach((comment: any) => {
          comment.user_liked = likedIds.has(comment.id);
        });
      }
      setComments(data as Comment[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setLoading(true);
    const { error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        video_id: videoId || null,
        product_id: productId || null,
        content: newComment.trim(),
      });

    if (!error) {
      setNewComment('');
      loadComments();
    }
    setLoading(false);
  };

  const handleLike = async (commentId: string, currentlyLiked: boolean) => {
    if (!user) return;

    if (currentlyLiked) {
      await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('comment_likes')
        .insert({
          user_id: user.id,
          comment_id: commentId,
        });
    }
    loadComments();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900">评论 ({comments.length})</h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="添加评论..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? '发送中...' : '发送'}
          </button>
        </form>
      ) : (
        <p className="text-gray-500">请登录后发表评论</p>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暂无评论，成为第一个评论的人吧！</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex-shrink-0">
                {comment.profiles?.avatar_url ? (
                  <img
                    src={comment.profiles.avatar_url}
                    alt={comment.profiles.username || 'User'}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white">
                    {(comment.profiles?.username || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-gray-900">
                    {comment.profiles?.username || '未命名用户'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{comment.content}</p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(comment.id, comment.user_liked || false)}
                    className={`flex items-center space-x-1 text-sm ${
                      comment.user_liked ? 'text-red-600' : 'text-gray-500'
                    } hover:text-red-600`}
                  >
                    <span>❤️</span>
                    <span>{comment.likes || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

