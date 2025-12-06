'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Grid, GridItem } from '@/components/Grid';
import ProductCard from '@/components/cards/ProductCard';
import Card from '@/components/common/Card';
import Button from '@/components/Button';
import EmptyState from '@/components/common/EmptyState';
import LoadingState from '@/components/common/LoadingState';

interface DailyDealsPageClientProps {
  locale: string;
  initialProducts: any[];
}

interface DealProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  currency: string;
  images?: Array<{ url: string }>;
  imageUrl?: string;
  category?: string;
  maker?: {
    id: string;
    displayName: string;
  };
  timeLeft?: string; // Time remaining for the deal
}

export default function DailyDealsPageClient({
  locale,
  initialProducts,
}: DailyDealsPageClientProps) {
  const [products, setProducts] = useState<DealProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Calculate time left until midnight (for daily deals reset)
  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (locale === 'zh') {
        setTimeLeft(`${hours}小时 ${minutes}分钟 ${seconds}秒`);
      } else if (locale === 'ar') {
        setTimeLeft(`${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [locale]);

  // Add discount calculation to products
  useEffect(() => {
    const productsWithDeals = initialProducts.map((product) => {
      // Simulate discounts (10-50% off)
      const discount = Math.floor(Math.random() * 40) + 10;
      const originalPrice = product.price;
      const discountedPrice = originalPrice * (1 - discount / 100);

      return {
        ...product,
        originalPrice,
        price: discountedPrice,
        discount,
      };
    });

    setProducts(productsWithDeals);
  }, [initialProducts]);

  const texts = {
    ar: {
      pageTitle: 'العروض اليومية',
      subtitle: 'عروض حصرية تنتهي اليوم!',
      timeLeft: 'الوقت المتبقي',
      discount: 'خصم',
      originalPrice: 'السعر الأصلي',
      viewAll: 'عرض جميع المنتجات',
      noDeals: 'لا توجد عروض متاحة حالياً',
      flashDeal: 'عرض فلاش',
      limitedTime: 'وقت محدود',
    },
    en: {
      pageTitle: 'Daily Deals',
      subtitle: 'Exclusive offers ending today!',
      timeLeft: 'Time Left',
      discount: 'OFF',
      originalPrice: 'Original Price',
      viewAll: 'View All Products',
      noDeals: 'No deals available at the moment',
      flashDeal: 'Flash Deal',
      limitedTime: 'Limited Time',
    },
    zh: {
      pageTitle: '每日特惠',
      subtitle: '今日独家优惠，即将结束！',
      timeLeft: '剩余时间',
      discount: '折扣',
      originalPrice: '原价',
      viewAll: '查看所有产品',
      noDeals: '目前没有可用优惠',
      flashDeal: '限时抢购',
      limitedTime: '限时',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                {t.pageTitle}
              </h1>
              <p className="text-lg text-gray-600">{t.subtitle}</p>
            </div>
            {locale === 'zh' && (
              <div className="hidden md:block">
                <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
                  <div className="text-sm font-medium mb-1">{t.timeLeft}</div>
                  <div className="text-2xl font-bold">{timeLeft}</div>
                </div>
              </div>
            )}
          </div>

          {/* Countdown Timer (Mobile) */}
          {locale === 'zh' && (
            <div className="md:hidden mb-4">
              <Card className="p-4 bg-red-50 border-red-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-red-800">{t.timeLeft}:</span>
                  <span className="text-lg font-bold text-red-600">{timeLeft}</span>
                </div>
              </Card>
            </div>
          )}

          {/* Flash Deal Banner (Chinese Style) */}
          {locale === 'zh' && (
            <Card className="p-4 mb-6 bg-gradient-to-r from-red-500 to-orange-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">🔥 {t.flashDeal}</h2>
                  <p className="text-sm opacity-90">{t.limitedTime}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{timeLeft}</div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <EmptyState
            icon="🛍️"
            title={t.noDeals}
            message={locale === 'zh' ? '请稍后再来查看新的优惠' : locale === 'ar' ? 'يرجى العودة لاحقاً للتحقق من العروض الجديدة' : 'Please check back later for new deals'}
          />
        ) : (
          <>
            <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="gap-6">
              {products.map((product) => (
                <GridItem key={product.id}>
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    {/* Discount Badge */}
                    {product.discount && (
                      <div className="relative">
                        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          -{product.discount}% {t.discount}
                        </div>
                        {product.imageUrl || product.images?.[0]?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl || product.images?.[0]?.url}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <span className="text-4xl">🛍️</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>

                      {/* Price Section */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl font-bold text-red-600">
                          {product.currency} {product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {product.currency} {product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Maker Info */}
                      {product.maker && (
                        <p className="text-xs text-gray-500 mb-3">
                          {locale === 'zh' ? '制作者' : locale === 'ar' ? 'صانع' : 'By'} {product.maker.displayName}
                        </p>
                      )}

                      {/* View Product Button */}
                      <Link href={`/${locale}/products/${product.id}`}>
                        <Button variant="primary" className="w-full">
                          {locale === 'zh' ? '立即查看' : locale === 'ar' ? 'عرض المنتج' : 'View Product'}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </GridItem>
              ))}
            </Grid>

            {/* View All Products Link */}
            <div className="mt-8 text-center">
              <Link href={`/${locale}/products`}>
                <Button variant="secondary" className="px-8 py-3 text-lg">
                  {t.viewAll}
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

