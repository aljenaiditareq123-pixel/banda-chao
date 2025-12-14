'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Clock, MapPin } from 'lucide-react';
import VisualTimeline from '@/components/tracking/VisualTimeline';
import MapPlaceholder from '@/components/tracking/MapPlaceholder';
import { trackingAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface TrackingPageClientProps {
  locale: string;
  orderId: string;
}

interface TrackingEvent {
  id: string;
  status: string;
  title: string;
  description: string;
  timestamp: Date | string;
  location?: string;
  completed: boolean;
  isCurrent?: boolean;
}

interface TrackingTimeline {
  orderId: string;
  currentStatus: string;
  events: TrackingEvent[];
  estimatedArrival?: Date | string;
  trackingNumber?: string;
}

export default function TrackingPageClient({ locale, orderId }: TrackingPageClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [trackingData, setTrackingData] = useState<{
    order?: any;
    timeline?: TrackingTimeline;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadTrackingData();
    } else {
      setLoading(false);
      setError(locale === 'ar' ? 'يرجى تسجيل الدخول' : locale === 'zh' ? '请登录' : 'Please log in');
    }
  }, [user, orderId]);

  useEffect(() => {
    if (trackingData?.timeline?.estimatedArrival) {
      const interval = setInterval(() => {
        updateTimeRemaining();
      }, 1000);
      updateTimeRemaining();
      return () => clearInterval(interval);
    }
  }, [trackingData?.timeline?.estimatedArrival]);

  const loadTrackingData = async () => {
    try {
      const response = await trackingAPI.getTracking(orderId, locale);
      if (response.success) {
        setTrackingData({
          order: response.order,
          timeline: response.timeline,
        });
      } else {
        setError(response.error || (locale === 'ar' ? 'حدث خطأ' : locale === 'zh' ? '出错了' : 'Error occurred'));
      }
    } catch (error) {
      console.error('Error loading tracking data:', error);
      setError(locale === 'ar' ? 'حدث خطأ' : locale === 'zh' ? '出错了' : 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateTimeRemaining = () => {
    if (!trackingData?.timeline?.estimatedArrival) return;

    const arrival = typeof trackingData.timeline.estimatedArrival === 'string'
      ? new Date(trackingData.timeline.estimatedArrival)
      : trackingData.timeline.estimatedArrival;
    
    const now = new Date();
    const diff = arrival.getTime() - now.getTime();

    if (diff <= 0) {
      setTimeRemaining(locale === 'ar' ? 'وصل' : locale === 'zh' ? '已到达' : 'Arrived');
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      setTimeRemaining(
        locale === 'ar'
          ? `${days} يوم و ${hours} ساعة`
          : locale === 'zh'
          ? `${days} 天 ${hours} 小时`
          : `${days} days ${hours} hours`
      );
    } else if (hours > 0) {
      setTimeRemaining(
        locale === 'ar'
          ? `${hours} ساعة و ${minutes} دقيقة`
          : locale === 'zh'
          ? `${hours} 小时 ${minutes} 分钟`
          : `${hours} hours ${minutes} minutes`
      );
    } else {
      setTimeRemaining(
        locale === 'ar'
          ? `${minutes} دقيقة`
          : locale === 'zh'
          ? `${minutes} 分钟`
          : `${minutes} minutes`
      );
    }
  };

  const formatPrice = (amount: number, currency: string = 'USD') => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      CNY: '¥',
      SAR: 'ر.س',
      AED: 'د.إ',
    };
    return `${symbols[currency] || currency} ${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {locale === 'ar' ? 'جاري التحميل...' : locale === 'zh' ? '加载中...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {locale === 'ar' ? 'رجوع' : locale === 'zh' ? '返回' : 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{locale === 'ar' ? 'رجوع' : locale === 'zh' ? '返回' : 'Back'}</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {locale === 'ar' ? 'تتبع الطلب' : locale === 'zh' ? '订单跟踪' : 'Track Order'}
              </h1>
              {trackingData.timeline?.trackingNumber && (
                <p className="text-gray-600 dark:text-gray-400">
                  {locale === 'ar' ? 'رقم التتبع' : locale === 'zh' ? '跟踪号' : 'Tracking Number'}:{' '}
                  <span className="font-mono font-semibold">{trackingData.timeline.trackingNumber}</span>
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {locale === 'ar' ? 'المبلغ الإجمالي' : locale === 'zh' ? '总金额' : 'Total Amount'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {trackingData.order
                  ? formatPrice(trackingData.order.totalAmount || 0, trackingData.order.currency || 'USD')
                  : formatPrice(0)}
              </p>
            </div>
          </div>
        </div>

        {/* Estimated Arrival */}
        {trackingData.timeline?.estimatedArrival && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-8 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-white/80 mb-1">
                    {locale === 'ar' ? 'الوصول المتوقع' : locale === 'zh' ? '预计到达' : 'Estimated Arrival'}
                  </p>
                  <p className="text-2xl font-bold">{timeRemaining}</p>
                </div>
              </div>
              <Package className="w-12 h-12 text-white/80" />
            </div>
          </motion.div>
        )}

        {/* Map Placeholder */}
        {trackingData.order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <MapPlaceholder
              from={locale === 'ar' ? 'الصين' : locale === 'zh' ? '中国' : 'China'}
              to={trackingData.order.shippingCountry || (locale === 'ar' ? 'وجهتك' : locale === 'zh' ? '目的地' : 'Your Destination')}
              locale={locale}
            />
          </motion.div>
        )}

        {/* Visual Timeline */}
        {trackingData.timeline && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {locale === 'ar' ? 'حالة الطلب' : locale === 'zh' ? '订单状态' : 'Order Status'}
            </h2>
            <VisualTimeline events={trackingData.timeline.events} locale={locale} />
          </motion.div>
        )}

        {/* Order Items */}
        {trackingData.order?.items && trackingData.order.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {locale === 'ar' ? 'عناصر الطلب' : locale === 'zh' ? '订单项目' : 'Order Items'}
            </h2>
            <div className="space-y-4">
              {trackingData.order.items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {item.products?.image_url && (
                    <img
                      src={item.products.image_url}
                      alt={item.products.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {item.products?.name || 'Product'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {locale === 'ar' ? 'الكمية' : locale === 'zh' ? '数量' : 'Quantity'}: {item.quantity || 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
