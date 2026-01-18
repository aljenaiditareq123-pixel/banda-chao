'use client';

import { useState, useEffect } from 'react';
import { reviewsAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import UserNameWithBadge from '@/components/common/UserNameWithBadge';
import { Star } from 'lucide-react';

interface ProductReviewsProps {
  productId: string;
  locale: string;
  productName: string;
  currentRating?: number;
  currentReviewsCount?: number;
}

export default function ProductReviews({
  productId,
  locale,
  productName,
  currentRating,
  currentReviewsCount,
}: ProductReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getProductReviews(productId, { limit: 10 });
      if (response.success && response.reviews) {
        setReviews(response.reviews);
      }
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      setError(locale === 'ar' ? 'يجب تسجيل الدخول أولاً' : locale === 'zh' ? '请先登录' : 'Please log in first');
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      setError(locale === 'ar' ? 'التقييم يجب أن يكون بين 1 و 5' : locale === 'zh' ? '评分必须在1到5之间' : 'Rating must be between 1 and 5');
      return;
    }

    try {
      setSubmittingReview(true);
      setError(null);
      const response = await reviewsAPI.create({
        productId,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });

      if (response.success) {
        // Refresh reviews
        await fetchReviews();
        setShowReviewForm(false);
        setReviewComment('');
        setReviewRating(5);
      } else {
        setError(response.error || (locale === 'ar' ? 'فشل في إضافة التقييم' : locale === 'zh' ? '添加评价失败' : 'Failed to submit review'));
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || (locale === 'ar' ? 'فشل في إضافة التقييم' : locale === 'zh' ? '添加评价失败' : 'Failed to submit review'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const userHasReviewed = user ? reviews.some((r) => r.user.id === user.id) : false;
  const averageRating = currentRating || (reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0);
  const totalReviews = currentReviewsCount || reviews.length;

  return (
    <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">⭐</span>
        {locale === 'ar' ? 'التقييمات والمراجعات' : locale === 'zh' ? '评价和评论' : 'Reviews & Ratings'}
        {totalReviews > 0 && (
          <span className="text-sm font-normal text-gray-500">
            ({totalReviews.toLocaleString()})
          </span>
        )}
      </h3>

      {/* Rating Summary */}
      {averageRating > 0 && (
        <div className="mb-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-black text-yellow-600">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {totalReviews} {locale === 'ar' ? 'تقييم' : locale === 'zh' ? '评价' : 'reviews'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Review Form (only if user is logged in and hasn't reviewed) */}
      {user && !userHasReviewed && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {!showReviewForm ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              {locale === 'ar' ? 'أضف تقييمك' : locale === 'zh' ? '添加评价' : 'Add Your Review'}
            </button>
          ) : (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">
                {locale === 'ar' ? 'أضف تقييمك' : locale === 'zh' ? '添加评价' : 'Add Your Review'}
              </h4>

              {/* Rating Stars */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'التقييم' : locale === 'zh' ? '评分' : 'Rating'}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`w-8 h-8 ${
                        star <= reviewRating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      } transition-colors`}
                    >
                      <Star className="w-full h-full" />
                    </button>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">{reviewRating}/5</span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'التعليق (اختياري)' : locale === 'zh' ? '评论（可选）' : 'Comment (Optional)'}
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={
                    locale === 'ar'
                      ? 'شارك تجربتك مع هذا المنتج...'
                      : locale === 'zh'
                      ? '分享您对这个产品的体验...'
                      : 'Share your experience with this product...'
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingReview
                    ? locale === 'ar'
                      ? 'جاري الإرسال...'
                      : locale === 'zh'
                      ? '提交中...'
                      : 'Submitting...'
                    : locale === 'ar'
                    ? 'إرسال التقييم'
                    : locale === 'zh'
                    ? '提交评价'
                    : 'Submit Review'}
                </button>
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setReviewComment('');
                    setError(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {locale === 'ar' ? 'إلغاء' : locale === 'zh' ? '取消' : 'Cancel'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8 text-gray-600">
          {locale === 'ar' ? 'جاري التحميل...' : locale === 'zh' ? '加载中...' : 'Loading reviews...'}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {review.user.profilePicture ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={review.user.profilePicture}
                        alt={review.user.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold">
                      {(review.user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <UserNameWithBadge
                    name={review.user.name || 'Anonymous'}
                    isVerified={review.user.isVerified || false}
                    className="font-semibold text-gray-900"
                    badgeSize={14}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : locale === 'zh' ? 'zh-CN' : 'en-US')}
                  </span>
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600">
          {locale === 'ar'
            ? 'لا توجد تقييمات بعد'
            : locale === 'zh'
            ? '暂无评价'
            : 'No reviews yet'}
        </div>
      )}
    </div>
  );
}
