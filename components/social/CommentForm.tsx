'use client';

import { useState, useRef } from 'react';
import { commentsAPI, videoUploadAPI } from '@/lib/api';
import Button from '@/components/Button';
import { Video, X, Upload, Loader2 } from 'lucide-react';

interface CommentFormProps {
  targetType: 'POST' | 'VIDEO' | 'PRODUCT';
  targetId: string;
  locale: string;
  onCommentAdded?: () => void;
  showVideoUpload?: boolean; // Show video upload for product reviews
  showRating?: boolean; // Show rating for product reviews
}

export default function CommentForm({
  targetType,
  targetId,
  locale,
  onCommentAdded,
  showVideoUpload = false,
  showRating = false,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate video file (15 seconds max, 10MB max)
  const validateVideo = (file: File): Promise<{ valid: boolean; error?: string; duration?: number }> => {
    return new Promise((resolve) => {
      if (file.size > 10 * 1024 * 1024) {
        resolve({ valid: false, error: locale === 'ar' ? 'حجم الفيديو أكبر من 10MB' : locale === 'zh' ? '视频大小超过10MB' : 'Video size exceeds 10MB' });
        return;
      }

      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        if (duration > 15) {
          resolve({ valid: false, error: locale === 'ar' ? 'مدة الفيديو أطول من 15 ثانية' : locale === 'zh' ? '视频时长超过15秒' : 'Video duration exceeds 15 seconds', duration });
        } else {
          resolve({ valid: true, duration });
        }
      };
      video.onerror = () => {
        resolve({ valid: false, error: locale === 'ar' ? 'فشل قراءة الفيديو' : locale === 'zh' ? '无法读取视频' : 'Failed to read video' });
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const validation = await validateVideo(file);
    
    if (!validation.valid) {
      setError(validation.error || 'Invalid video');
      return;
    }

    setVideoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);
  };

  const handleRemoveVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && !videoFile) {
      setError(locale === 'ar' ? 'الرجاء إدخال تعليق أو رفع فيديو' : locale === 'zh' ? '请输入评论或上传视频' : 'Please enter a comment or upload a video');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let videoUrl: string | undefined;

      // Upload video if provided
      if (videoFile) {
        setIsUploadingVideo(true);
        const uploadResult = await videoUploadAPI.uploadReview(videoFile);
        if (!uploadResult.success || !uploadResult.videoUrl) {
          throw new Error(uploadResult.error || 'Failed to upload video');
        }
        videoUrl = uploadResult.videoUrl;
        setIsUploadingVideo(false);
      }

      await commentsAPI.create({
        targetType,
        targetId,
        content: content.trim() || '',
        reviewVideoUrl: videoUrl,
        reviewRating: showRating && rating > 0 ? rating : undefined,
      });

      // Clear form
      setContent('');
      setRating(0);
      handleRemoveVideo();
      
      // Notify parent
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err: any) {
      console.error('Error creating comment:', err);
      setError(err.message || (locale === 'ar' ? 'فشل إضافة التعليق' : locale === 'zh' ? '添加评论失败' : 'Failed to add comment'));
      setIsUploadingVideo(false);
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
    <form onSubmit={handleSubmit} className="space-y-3" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {error && (
        <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</div>
      )}

      {/* Rating (for product reviews) */}
      {showRating && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {locale === 'ar' ? 'التقييم:' : locale === 'zh' ? '评分:' : 'Rating:'}
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-2xl focus:outline-none"
                disabled={isSubmitting}
              >
                {star <= rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Video Upload (for product reviews) */}
      {showVideoUpload && (
        <div className="space-y-2">
          {videoPreview ? (
            <div className="relative">
              <video
                src={videoPreview}
                className="w-full max-w-xs rounded-lg"
                controls={false}
                muted
              />
              <button
                type="button"
                onClick={handleRemoveVideo}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                disabled={isSubmitting}
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-xs text-gray-500 mt-1">
                {locale === 'ar' ? 'حد أقصى 15 ثانية، 10MB' : locale === 'zh' ? '最多15秒，10MB' : 'Max 15s, 10MB'}
              </p>
            </div>
          ) : (
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                onChange={handleVideoSelect}
                className="hidden"
                disabled={isSubmitting}
              />
              <Video className="w-5 h-5" />
              <span>
                {locale === 'ar' ? 'إضافة فيديو مراجعة (15 ثانية، 10MB)' : locale === 'zh' ? '添加视频评论（15秒，10MB）' : 'Add video review (15s, 10MB)'}
              </span>
            </label>
          )}
        </div>
      )}

      {/* Text Comment */}
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
          disabled={isSubmitting || isUploadingVideo}
        />
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || isUploadingVideo || (!content.trim() && !videoFile)}
          className="self-end"
        >
          {isUploadingVideo ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isSubmitting ? (
            t.submitting
          ) : (
            t.submit
          )}
        </Button>
      </div>
    </form>
  );
}

