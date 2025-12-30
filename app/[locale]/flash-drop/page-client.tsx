'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, Zap, ShoppingBag, TrendingDown } from 'lucide-react';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';

interface FlashDropData {
  id: string;
  product: {
    id: string;
    name: string;
    name_ar?: string;
    name_zh?: string;
    description?: string;
    description_ar?: string;
    description_zh?: string;
    image_url?: string;
    currency?: string;
  };
  startingPrice: number;
  currentPrice: number;
  minPrice?: number;
  priceDecrement: number;
  intervalSeconds: number;
  status: 'ACTIVE' | 'FROZEN' | 'SOLD' | 'EXPIRED';
  frozenByUserId?: string;
  frozenAt?: string;
  startedAt: string;
  lastPriceUpdate: string;
}

interface FlashDropPageClientProps {
  locale: string;
}

export default function FlashDropPageClient({ locale }: FlashDropPageClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [flashDrop, setFlashDrop] = useState<FlashDropData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFreezing, setIsFreezing] = useState(false);
  const [localPrice, setLocalPrice] = useState<number | null>(null);
  const [timeUntilNextDrop, setTimeUntilNextDrop] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const priceUpdateRef = useRef<NodeJS.Timeout | null>(null);

  const translations = {
    ar: {
      title: '⚡ عرض البرق',
      subtitle: 'السعر ينخفض كل 10 ثوانٍ!',
      startingPrice: 'السعر الابتدائي',
      currentPrice: 'السعر الحالي',
      minPrice: 'أقل سعر',
      buyNow: 'اشتري الآن',
      freezing: 'جاري التجميد...',
      frozen: 'تم تجميد السعر!',
      sold: 'تم البيع',
      expired: 'انتهى العرض',
      noActiveDrop: 'لا يوجد عرض برق نشط حالياً',
      checkBack: 'تحقق لاحقاً',
      priceDropsIn: 'السعر سينخفض خلال',
      seconds: 'ثانية',
      loginRequired: 'يجب تسجيل الدخول للشراء',
      login: 'تسجيل الدخول',
      description: 'كن أول من يشتري! السعر ينخفض كل 10 ثوانٍ. اضغط "اشتري الآن" لتجميد السعر الحالي.',
    },
    zh: {
      title: '⚡ 闪电特卖',
      subtitle: '价格每10秒下降！',
      startingPrice: '起始价格',
      currentPrice: '当前价格',
      minPrice: '最低价格',
      buyNow: '立即购买',
      freezing: '正在冻结...',
      frozen: '价格已冻结！',
      sold: '已售出',
      expired: '已过期',
      noActiveDrop: '目前没有活跃的闪电特卖',
      checkBack: '稍后再查看',
      priceDropsIn: '价格将在',
      seconds: '秒后下降',
      loginRequired: '需要登录才能购买',
      login: '登录',
      description: '成为第一个购买者！价格每10秒下降。点击"立即购买"冻结当前价格。',
    },
    en: {
      title: '⚡ Flash Drop',
      subtitle: 'Price drops every 10 seconds!',
      startingPrice: 'Starting Price',
      currentPrice: 'Current Price',
      minPrice: 'Minimum Price',
      buyNow: 'Buy Now',
      freezing: 'Freezing...',
      frozen: 'Price Frozen!',
      sold: 'Sold',
      expired: 'Expired',
      noActiveDrop: 'No active flash drop at the moment',
      checkBack: 'Check back later',
      priceDropsIn: 'Price drops in',
      seconds: 'seconds',
      loginRequired: 'Login required to purchase',
      login: 'Login',
      description: 'Be the first to buy! Price drops every 10 seconds. Click "Buy Now" to freeze the current price.',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  const formatPrice = (price: number, currency: string = 'USD') => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      CNY: '¥',
      SAR: 'ر.س',
      AED: 'د.إ',
    };
    return `${symbols[currency] || currency} ${price.toLocaleString()}`;
  };

  // Fetch flash drop data
  useEffect(() => {
    fetchFlashDrop();
    
    // Poll for updates every 2 seconds
    const pollInterval = setInterval(fetchFlashDrop, 2000);
    
    return () => {
      clearInterval(pollInterval);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (priceUpdateRef.current) clearInterval(priceUpdateRef.current);
    };
  }, []);

  // Update local price and timer
  useEffect(() => {
    if (!flashDrop || flashDrop.status !== 'ACTIVE') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (priceUpdateRef.current) clearInterval(priceUpdateRef.current);
      return;
    }

    // Initialize local price
    if (localPrice === null) {
      setLocalPrice(flashDrop.currentPrice);
    }

    // Calculate time until next drop
    const updateTimer = () => {
      const now = new Date();
      const lastUpdate = new Date(flashDrop.lastPriceUpdate);
      const elapsedSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
      const secondsUntilNext = flashDrop.intervalSeconds - (elapsedSeconds % flashDrop.intervalSeconds);
      setTimeUntilNextDrop(secondsUntilNext);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    // Update local price every second (client-side simulation)
    const priceUpdateInterval = setInterval(() => {
      setLocalPrice((prev) => {
        if (prev === null) return flashDrop.currentPrice;
        
        // Check if it's time for a price drop
        const now = new Date();
        const lastUpdate = new Date(flashDrop.lastPriceUpdate);
        const elapsedSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
        const intervalsElapsed = Math.floor(elapsedSeconds / flashDrop.intervalSeconds);
        
        if (intervalsElapsed > 0) {
          // Fetch fresh data from server
          fetchFlashDrop();
          return prev;
        }
        
        return prev;
      });
    }, 1000);

    intervalRef.current = timerInterval;
    priceUpdateRef.current = priceUpdateInterval;

    return () => {
      clearInterval(timerInterval);
      clearInterval(priceUpdateInterval);
    };
  }, [flashDrop]);

  const fetchFlashDrop = async () => {
    try {
      const { getApiUrl } = await import('@/lib/api-utils');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/flash-drop/active`);
      const data = await response.json();

      if (data.success) {
        if (data.flashDrop) {
          setFlashDrop(data.flashDrop);
          setLocalPrice(data.flashDrop.currentPrice);
        } else {
          setFlashDrop(null);
        }
      }
    } catch (err: any) {
      console.error('Error fetching flash drop:', err);
      setError(err.message || 'Failed to fetch flash drop');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      router.push(`/${locale}/auth/signin?callbackUrl=/${locale}/flash-drop`);
      return;
    }

    if (!flashDrop) return;

    setIsFreezing(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const { getApiUrl } = await import('@/lib/api-utils');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/flash-drop/freeze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 409) {
          // Already claimed by someone else
          setError(data.message || t.frozen);
          // Refresh to show updated status
          setTimeout(() => fetchFlashDrop(), 1000);
        } else {
          throw new Error(data.message || 'Failed to freeze price');
        }
        return;
      }

      // Success! Add to cart and redirect to checkout
      const frozenPrice = data.flashDrop.frozenPrice;
      addItem({
        productId: flashDrop.product.id,
        name: flashDrop.product.name,
        imageUrl: flashDrop.product.image_url,
        price: frozenPrice,
        currency: flashDrop.product.currency || 'USD',
        quantity: 1,
      }, locale);

      // Redirect to checkout
      router.push(`/${locale}/checkout`);
    } catch (err: any) {
      setError(err.message || 'Failed to freeze price');
    } finally {
      setIsFreezing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{locale === 'ar' ? 'جاري التحميل...' : locale === 'zh' ? '加载中...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!flashDrop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">⚡</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{t.noActiveDrop}</p>
          <Button
            variant="primary"
            onClick={() => router.push(`/${locale}/products`)}
          >
            {t.checkBack}
          </Button>
        </div>
      </div>
    );
  }

  const productName = locale === 'ar' 
    ? flashDrop.product.name_ar || flashDrop.product.name
    : locale === 'zh'
    ? flashDrop.product.name_zh || flashDrop.product.name
    : flashDrop.product.name;

  const displayPrice = localPrice !== null ? localPrice : flashDrop.currentPrice;
  const isFrozen = flashDrop.status === 'FROZEN';
  const isSold = flashDrop.status === 'SOLD';
  const canBuy = flashDrop.status === 'ACTIVE' && !isFrozen && !isSold;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
            <Zap className="w-10 h-10 text-yellow-500 animate-pulse" />
            {t.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{t.subtitle}</p>
        </motion.div>

        {/* Flash Drop Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-400"
        >
          {/* Product Image */}
          <div className="relative h-64 md:h-96 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20">
            {flashDrop.product.image_url ? (
              <img
                src={flashDrop.product.image_url}
                alt={productName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                🎁
              </div>
            )}
            
            {/* Status Badge */}
            {isFrozen && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                {t.frozen}
              </div>
            )}
            {isSold && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                {t.sold}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Product Name */}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {productName}
            </h2>

            {/* Price Display */}
            <div className="mb-8">
              <div className="flex items-baseline gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.currentPrice}</p>
                  <motion.p
                    key={displayPrice}
                    initial={{ scale: 1.2, color: '#ef4444' }}
                    animate={{ scale: 1, color: '#000' }}
                    className="text-6xl font-black text-gray-900 dark:text-white"
                  >
                    {formatPrice(displayPrice, flashDrop.product.currency || 'USD')}
                  </motion.p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.startingPrice}</p>
                  <p className="text-2xl font-bold text-gray-400 line-through">
                    {formatPrice(flashDrop.startingPrice, flashDrop.product.currency || 'USD')}
                  </p>
                </div>
              </div>

              {/* Timer */}
              {canBuy && (
                <div className="flex items-center gap-2 text-lg text-gray-700 dark:text-gray-300 mb-4">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span>
                    {t.priceDropsIn} <span className="font-bold text-yellow-600">{timeUntilNextDrop}</span> {t.seconds}
                  </span>
                </div>
              )}

              {/* Price Trend Indicator */}
              {canBuy && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <TrendingDown className="w-4 h-4" />
                  <span>
                    {formatPrice(flashDrop.priceDecrement, flashDrop.product.currency || 'USD')} {locale === 'ar' ? 'كل' : locale === 'zh' ? '每' : 'every'} {flashDrop.intervalSeconds}s
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {flashDrop.product.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {locale === 'ar' 
                  ? flashDrop.product.description_ar || flashDrop.product.description
                  : locale === 'zh'
                  ? flashDrop.product.description_zh || flashDrop.product.description
                  : flashDrop.product.description}
              </p>
            )}

            {/* Buy Now Button */}
            {canBuy ? (
              <Button
                variant="primary"
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-black text-xl py-6 shadow-2xl"
                onClick={handleBuyNow}
                disabled={isFreezing}
              >
                {isFreezing ? (
                  <>
                    <Clock className="w-5 h-5 inline-block mr-2 animate-spin" />
                    {t.freezing}
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 inline-block mr-2" />
                    {t.buyNow} - {formatPrice(displayPrice, flashDrop.product.currency || 'USD')}
                  </>
                )}
              </Button>
            ) : isFrozen ? (
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl p-4 text-center">
                <p className="text-green-700 dark:text-green-400 font-bold">
                  {locale === 'ar' 
                    ? 'تم تجميد السعر بواسطة مستخدم آخر'
                    : locale === 'zh'
                    ? '价格已被其他用户冻结'
                    : 'Price frozen by another user'}
                </p>
              </div>
            ) : isSold ? (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4 text-center">
                <p className="text-red-700 dark:text-red-400 font-bold">{t.sold}</p>
              </div>
            ) : null}

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {!user && canBuy && (
              <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                {t.loginRequired}{' '}
                <button
                  onClick={() => router.push(`/${locale}/auth/signin?callbackUrl=/${locale}/flash-drop`)}
                  className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                >
                  {t.login}
                </button>
              </p>
            )}
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            {locale === 'ar' ? 'كيف يعمل' : locale === 'zh' ? '如何运作' : 'How It Works'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {t.description}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
