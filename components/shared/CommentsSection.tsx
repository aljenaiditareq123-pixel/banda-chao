'use client';

import { useState, useCallback } from 'react';
import CommentForm from '@/components/social/CommentForm';
import CommentList from '@/components/social/CommentList';
import Card from '@/components/common/Card';

interface CommentsSectionProps {
  targetType: 'POST' | 'VIDEO' | 'PRODUCT';
  targetId: string;
  locale: string;
  showTitle?: boolean;
  className?: string;
}

export default function CommentsSection({
  targetType,
  targetId,
  locale,
  showTitle = true,
  className = '',
}: CommentsSectionProps) {
  const [commentsCount, setCommentsCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCommentAdded = useCallback(() => {
    // Trigger refresh of comment list
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleCommentsCountChange = useCallback((count: number) => {
    setCommentsCount(count);
  }, []);

  const texts = {
    ar: {
      sectionTitle: 'التعليقات والمراجعات',
      commentsCount: (count: number) => `(${count} تعليق${count !== 1 ? 'ات' : ''})`,
      noComments: 'كن أول من يعلق على هذا المحتوى.',
    },
    en: {
      sectionTitle: 'Comments & Reviews',
      commentsCount: (count: number) => `(${count} comment${count !== 1 ? 's' : ''})`,
      noComments: 'Be the first to comment on this content.',
    },
    zh: {
      sectionTitle: '评论和评价',
      commentsCount: (count: number) => `(${count}条评论)`,
      noComments: '成为第一个评论此内容的人。',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <section className={`mt-12 ${className}`} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {showTitle && (
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
          {t.sectionTitle}{' '}
          {commentsCount > 0 && (
            <span className="text-xl font-normal text-sky-600 dark:text-sky-400">
              {t.commentsCount(commentsCount)}
            </span>
          )}
        </h2>
      )}

      {/* Comment Form */}
      <Card className="p-6 mb-8">
        <CommentForm
          targetType={targetType}
          targetId={targetId}
          locale={locale}
          onCommentAdded={handleCommentAdded}
        />
      </Card>

      {/* Comment List */}
      <Card className="p-6">
        <CommentList
          key={refreshKey}
          targetType={targetType}
          targetId={targetId}
          locale={locale}
          onCommentsCountChange={handleCommentsCountChange}
        />
      </Card>
    </section>
  );
}

