'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { videosAPI, productsAPI } from '@/lib/api';

interface EditDeleteButtonsProps {
  userId: string;
  videoId?: string;
  productId?: string;
  onDelete?: () => void;
}

export default function EditDeleteButtons({ userId, videoId, productId, onDelete }: EditDeleteButtonsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Set loading to false once user is loaded
    setLoading(false);
  }, [user]);

  const handleDelete = async () => {
    if (!confirm('确定要删除吗？此操作无法撤销。')) {
      return;
    }

    if (!user || user.id !== userId) {
      alert('无权删除');
      return;
    }

    setDeleting(true);
    try {
      if (videoId) {
        await videosAPI.deleteVideo(videoId);
        if (onDelete) {
          onDelete();
        } else {
          router.push('/');
          router.refresh();
        }
      } else if (productId) {
        await productsAPI.deleteProduct(productId);
        if (onDelete) {
          onDelete();
        } else {
          router.push('/products');
          router.refresh();
        }
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.error || error.message || '删除失败';
      alert(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  // Don't show buttons if user is not the owner
  if (loading || !user || user.id !== userId) {
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
