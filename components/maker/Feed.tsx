'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/Button';
import { postsAPI } from '@/lib/api';
import LoadingState from '@/components/common/LoadingState';

interface Post {
  id: string;
  content: string;
  images?: string[];
  created_at: string;
  likes?: number;
}

interface FeedProps {
  locale: string;
  onRefresh?: () => void;
}

export default function Feed({ locale, onRefresh }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    content: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postsAPI.getMe();
      if (response.success && response.posts) {
        setPosts(response.posts);
      } else {
        setError(response.error || 'Failed to load posts');
      }
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPost(null);
    setFormData({ content: '' });
    setShowForm(true);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({ content: post.content });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.content.trim()) {
      setError(locale === 'ar' ? 'المحتوى مطلوب' : 'Content is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const postData = {
        content: formData.content.trim(),
      };

      let response;
      if (editingPost) {
        // TODO: Implement update API when available
        setError(locale === 'ar' ? 'تعديل المنشورات غير متاح حالياً' : 'Post editing not available yet');
        return;
      } else {
        response = await postsAPI.create(postData);
      }

      if (response.success) {
        setShowForm(false);
        setEditingPost(null);
        await fetchPosts();
        if (onRefresh) onRefresh();
      } else {
        setError(response.error || (locale === 'ar' ? 'فشل الحفظ' : 'Failed to save'));
      }
    } catch (err: any) {
      console.error('Error saving post:', err);
      setError(err.message || (locale === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving post'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      setDeletingId(postId);
      setError(null);

      const response = await postsAPI.delete(postId);
      if (response.success) {
        await fetchPosts();
        if (onRefresh) onRefresh();
      } else {
        setError(response.error || (locale === 'ar' ? 'فشل الحذف' : 'Failed to delete'));
      }
    } catch (err: any) {
      console.error('Error deleting post:', err);
      setError(err.message || (locale === 'ar' ? 'حدث خطأ أثناء الحذف' : 'Error deleting post'));
    } finally {
      setDeletingId(null);
    }
  };

  const texts = {
    ar: {
      title: 'سجلي',
      description: 'شارك تحديثات نصية ومنشورات مع متابعيك',
      addNew: 'إنشاء منشور جديد',
      noPosts: 'لا توجد منشورات بعد',
      emptyDescription: 'ابدأ بمشاركة تحديثاتك وأخبارك مع متابعيك',
      edit: 'تعديل',
      delete: 'حذف',
      deleting: 'جاري الحذف...',
      likes: 'إعجاب',
      posted: 'نُشر',
      ago: 'منذ',
    },
    en: {
      title: 'My Feed',
      description: 'Share text updates and posts with your followers',
      addNew: 'Create New Post',
      noPosts: 'No posts yet',
      emptyDescription: 'Start sharing your updates and news with your followers',
      edit: 'Edit',
      delete: 'Delete',
      deleting: 'Deleting...',
      likes: 'likes',
      posted: 'Posted',
      ago: 'ago',
    },
    zh: {
      title: '我的动态',
      description: '与您的关注者分享文本更新和帖子',
      addNew: '创建新帖子',
      noPosts: '还没有帖子',
      emptyDescription: '开始与您的关注者分享您的更新和新闻',
      edit: '编辑',
      delete: '删除',
      deleting: '删除中...',
      likes: '赞',
      posted: '发布于',
      ago: '前',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  if (loading) {
    return <LoadingState />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return locale === 'ar' ? 'الآن' : 'Just now';
    if (diffMins < 60) return `${diffMins} ${locale === 'ar' ? 'دقيقة' : 'min'} ${t.ago}`;
    if (diffHours < 24) return `${diffHours} ${locale === 'ar' ? 'ساعة' : 'hour'} ${t.ago}`;
    if (diffDays < 7) return `${diffDays} ${locale === 'ar' ? 'يوم' : 'day'} ${t.ago}`;
    return date.toLocaleDateString(locale);
  };

  return (
    <div className="space-y-6">
      {error && !showForm && (
        <Card className="bg-red-50 border-red-200">
          <div className="p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
          <p className="text-sm text-gray-600 mt-1">{t.description}</p>
        </div>
        {!showForm && (
          <Button variant="primary" onClick={handleAdd}>
            {t.addNew}
          </Button>
        )}
      </div>

      {showForm ? (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingPost
                ? (locale === 'ar' ? 'تعديل المنشور' : locale === 'zh' ? '编辑帖子' : 'Edit Post')
                : (locale === 'ar' ? 'إنشاء منشور جديد' : locale === 'zh' ? '创建新帖子' : 'Create New Post')}
            </h3>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'المحتوى' : locale === 'zh' ? '内容' : 'Content'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={locale === 'ar' ? 'ماذا تريد أن تشارك؟' : 'What do you want to share?'}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="text"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPost(null);
                    setError(null);
                  }}
                  disabled={saving}
                >
                  {locale === 'ar' ? 'إلغاء' : locale === 'zh' ? '取消' : 'Cancel'}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? (locale === 'ar' ? 'جاري النشر...' : locale === 'zh' ? '发布中...' : 'Publishing...')
                    : (locale === 'ar' ? 'نشر' : locale === 'zh' ? '发布' : 'Publish')}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : posts.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.noPosts}</h3>
            <p className="text-gray-500 mb-6">{t.emptyDescription}</p>
            <Button variant="primary" onClick={handleAdd}>
              {t.addNew}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                    {post.images && post.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {post.images.slice(0, 4).map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Post image ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatDate(post.created_at)}</span>
                    {post.likes !== undefined && (
                      <span>
                        {post.likes} {t.likes}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="text"
                      className="text-sm"
                      onClick={() => handleEdit(post)}
                    >
                      {t.edit}
                    </Button>
                    <Button
                      variant="text"
                      className="text-sm text-red-600 hover:text-red-700"
                      disabled={deletingId === post.id}
                      onClick={() => {
                        if (confirm(locale === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) {
                          handleDelete(post.id);
                        }
                      }}
                    >
                      {deletingId === post.id ? t.deleting : t.delete}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
