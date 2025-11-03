'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface EditDeleteButtonsProps {
  userId: string;
  videoId?: string;
  productId?: string;
  onDelete?: () => void;
}

export default function EditDeleteButtons({ userId, videoId, productId, onDelete }: EditDeleteButtonsProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      setLoading(false);
    };
    getCurrentUser();
  }, []);

  const handleDelete = async () => {
    if (!confirm('确定要删除吗？此操作无法撤销。')) {
      return;
    }

    setDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        throw new Error('无权删除');
      }

      if (videoId) {
        const { error } = await supabase
          .from('videos')
          .delete()
          .eq('id', videoId)
          .eq('user_id', user.id);

        if (error) throw error;
        router.push('/');
        router.refresh();
      } else if (productId) {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId)
          .eq('user_id', user.id);

        if (error) throw error;
        router.push('/products');
        router.refresh();
      }

      if (onDelete) onDelete();
    } catch (error) {
      console.error('Delete error:', error);
      alert('删除失败');
    } finally {
      setDeleting(false);
    }
  };

  if (loading || currentUserId !== userId) {
    return null;
  }

  const editPath = videoId ? `/videos/${videoId}/edit` : `/products/${productId}/edit`;

  return (
    <div className="flex items-center space-x-2">
      <Link
        href={editPath}
        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
      >
        编辑
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition"
      >
        {deleting ? '删除中...' : '删除'}
      </button>
    </div>
  );
}

