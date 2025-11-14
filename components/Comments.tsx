'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { commentsAPI } from '@/lib/api';

interface Comment {
  id: string;
  userId: string;
  content: string;
  likes: number;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    profilePicture: string | null;
  };
  userLiked?: boolean;
}

interface CommentsProps {
  videoId?: string;
  productId?: string;
}

export default function Comments({ videoId, productId }: CommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadComments();
  }, [videoId, productId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await commentsAPI.getComments(videoId, productId);
      // Transform API response to match our Comment interface
      const commentsData = response.data?.data || response.data || [];
      setComments(commentsData.map((comment: any) => ({
        id: comment.id,
        userId: comment.userId || comment.user_id,
        content: comment.content,
        likes: comment.likes || 0,
        createdAt: comment.createdAt || comment.created_at,
        user: comment.user || {
          id: comment.userId || comment.user_id,
          name: comment.user?.name || comment.user?.username || null,
          profilePicture: comment.user?.profilePicture || comment.user?.avatar_url || null,
        },
        userLiked: comment.userLiked || comment.user_liked || false,
      })));
    } catch (error) {
      console.error('Error loading comments:', error);
      // If endpoint doesn't exist, show empty state
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || sending) return;

    setSending(true);
    try {
      await commentsAPI.createComment({
        videoId: videoId || undefined,
        productId: productId || undefined,
        content: newComment.trim(),
      });
      setNewComment('');
      // Reload comments after successful submission
      await loadComments();
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      const errorMessage = error.response?.data?.error || error.message || '发送失败，请重试';
      alert(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleLike = async (commentId: string, currentlyLiked: boolean) => {
    if (!user) {
      alert('请先登录');
      return;
    }

    try {
      if (currentlyLiked) {
        await commentsAPI.unlikeComment(commentId);
      } else {
        await commentsAPI.likeComment(commentId);
      }
      // Reload comments to get updated like status
      await loadComments();
    } catch (error: any) {
      console.error('Error toggling comment like:', error);
      const errorMessage = error.response?.data?.error || error.message || '操作失败';
      alert(errorMessage);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;
    if (!confirm('确定要删除这条评论吗？')) return;

    try {
      await commentsAPI.deleteComment(commentId);
      // Remove comment from list optimistically
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      const errorMessage = error.response?.data?.error || error.message || '删除失败';
      alert(errorMessage);
      // Reload comments to sync state
      await loadComments();
    }
  };

  if (loading && comments.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">评论</h3>
        <div className="text-center py-8 text-gray-500">加载中...</div>
      </div>
    );
  }

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
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newComment.trim()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {sending ? '发送中...' : '发送'}
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
                {comment.user?.profilePicture ? (
                  <img
                    src={comment.user.profilePicture}
                    alt={comment.user.name || 'User'}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white">
                    {(comment.user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">
                      {comment.user?.name || '未命名用户'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  {/* Show delete button if user is the owner */}
                  {user && user.id === comment.userId && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      删除
                    </button>
                  )}
                </div>
                <p className="text-gray-700 mb-2">{comment.content}</p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(comment.id, comment.userLiked || false)}
                    className={`flex items-center space-x-1 text-sm ${
                      comment.userLiked ? 'text-red-600' : 'text-gray-500'
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
