'use client';

import { useState, useEffect } from 'react';
import { videosAPI } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function EditVideoPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'short' | 'long'>('short');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const videoId = params.id as string;

  useEffect(() => {
    const loadVideo = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const response = await videosAPI.getVideo(videoId);
        const video = response.data;

        if (video.userId !== user.id) {
          setError('无权编辑此视频');
          return;
        }

        setTitle(video.title);
        setDescription(video.description || '');
        setType(video.type);
      } catch (err: any) {
        setError(err.response?.data?.error || '视频不存在');
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [videoId, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('请先登录');
      }

      await videosAPI.updateVideo(videoId, {
        title,
        description: description || undefined,
        type,
      });

      router.push(`/videos/${videoId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || '更新失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除此视频吗？此操作无法撤销。')) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('请先登录');
      }

      await videosAPI.deleteVideo(videoId);
      router.push('/videos/short');
    } catch (err: any) {
      setError(err.message || '删除失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">编辑视频</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              视频类型 *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'short' | 'long')}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="short">短视频 (&lt; 3分钟)</option>
              <option value="long">长视频 (&gt; 3分钟)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标题 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              删除
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存更改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

