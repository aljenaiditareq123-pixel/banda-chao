'use client';

import { useState } from 'react';
import { commentsAPI } from '@/lib/api';
import Button from '@/components/Button';

interface CommentFormProps {
  targetType: 'POST' | 'VIDEO' | 'PRODUCT';
  targetId: string;
  locale: string;
  onCommentAdded?: () => void;
}

export default function CommentForm({
  targetType,
  targetId,
  locale,
  onCommentAdded,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError(locale === 'ar' ? 'الرجاء إدخال تعليق' : locale === 'zh' ? '请输入评论' : 'Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await commentsAPI.create({
        targetType,
        targetId,
        content: content.trim(),
      });

      // Clear form
      setContent('');
      
      // Notify parent
      if (onCommentAdded) {
        onCommentAdded();
      }

      // Reload comments (parent component should handle this)
      // For now, we'll just clear the form and let the parent refresh
    } catch (err: any) {
      console.error('Error creating comment:', err);
      setError(err.message || (locale === 'ar' ? 'فشل إضافة التعليق' : locale === 'zh' ? '添加评论失败' : 'Failed to add comment'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const texts = {
    ar: {
      placeholder: 'اكتب تعليقاً...',
      submit: 'إرسال',
      submitting: 'جاري الإرسال...',
    },
    en: {
      placeholder: 'Write a comment...',
      submit: 'Post',
      submitting: 'Posting...',
    },
    zh: {
      placeholder: '写评论...',
      submit: '发布',
      submitting: '发布中...',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <form onSubmit={handleSubmit} className="space-y-2" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      <div className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError(null);
          }}
          placeholder={t.placeholder}
          rows={2}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          disabled={isSubmitting}
        />
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !content.trim()}
          className="self-end"
        >
          {isSubmitting ? t.submitting : t.submit}
        </Button>
      </div>
    </form>
  );
}

