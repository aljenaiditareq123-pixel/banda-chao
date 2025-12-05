'use client';

import { useState, useRef } from 'react';
import { postsAPI } from '@/lib/api';
import Button from '@/components/Button';

interface CreatePostFormProps {
  locale: string;
  onPostCreated?: () => void;
  onCancel?: () => void;
}

export default function CreatePostForm({
  locale,
  onPostCreated,
  onCancel,
}: CreatePostFormProps) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    try {
      const response = await postsAPI.uploadImage(file);
      if (response.success && response.imageUrl) {
        setImages((prev) => [...prev, response.imageUrl!]);
        setError(null);
      } else {
        throw new Error(response.error || 'Failed to upload image');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : (locale === 'ar' ? 'فشل رفع الصورة' : locale === 'zh' ? '上传图片失败' : 'Failed to upload image');
      console.error('Error uploading image:', err);
      setError(errorMessage);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          handleImageUpload(file);
        }
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && images.length === 0) {
      setError(locale === 'ar' ? 'الرجاء إدخال محتوى أو رفع صورة' : locale === 'zh' ? '请输入内容或上传图片' : 'Please enter content or upload an image');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await postsAPI.create({
        content: content.trim() || undefined,
        images: images.length > 0 ? images : undefined,
      });

      if (response.success) {
        // Clear form
        setContent('');
        setImages([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Notify parent
        if (onPostCreated) {
          onPostCreated();
        }
      } else {
        throw new Error(response.error || (locale === 'ar' ? 'فشل إنشاء المنشور' : locale === 'zh' ? '创建帖子失败' : 'Failed to create post'));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : (locale === 'ar' ? 'فشل إنشاء المنشور' : locale === 'zh' ? '创建帖子失败' : 'Failed to create post');
      console.error('Error creating post:', err);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const texts = {
    ar: {
      placeholder: 'ماذا تريد أن تشارك؟',
      addImage: 'إضافة صورة',
      removeImage: 'إزالة',
      submit: 'نشر',
      submitting: 'جاري النشر...',
      cancel: 'إلغاء',
    },
    en: {
      placeholder: 'What do you want to share?',
      addImage: 'Add Image',
      removeImage: 'Remove',
      submit: 'Post',
      submitting: 'Posting...',
      cancel: 'Cancel',
    },
    zh: {
      placeholder: '你想分享什么？',
      addImage: '添加图片',
      removeImage: '删除',
      submit: '发布',
      submitting: '发布中...',
      cancel: '取消',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setError(null);
        }}
        placeholder={t.placeholder}
        rows={4}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        disabled={isSubmitting}
      />

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="post-image-upload"
            disabled={isSubmitting}
          />
          <label
            htmlFor="post-image-upload"
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {t.addImage}
          </label>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {t.cancel}
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || (!content.trim() && images.length === 0)}
          >
            {isSubmitting ? t.submitting : t.submit}
          </Button>
        </div>
      </div>
    </form>
  );
}

