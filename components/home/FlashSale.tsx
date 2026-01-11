'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Timer, Flame } from 'lucide-react';
import ProductCard from '@/components/cards/ProductCard';
import { getAllMockProducts, mockProductToApiFormat } from '@/lib/mock-products';

interface FlashSaleProps {
  locale: string;
}

export default function FlashSale({ locale }: FlashSaleProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 30,
    seconds: 45,
  });
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only running timer after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run timer on client after mount
    if (!mounted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Reset when timer reaches 0
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mounted]);

  // Get flash sale products (first 4 products with discounts, or all if none have discounts)
  const allProducts = getAllMockProducts();
  const flashSaleProducts = (allProducts.filter(p => p.originalPrice && p.originalPrice > p.price).length > 0
    ? allProducts.filter(p => p.originalPrice && p.originalPrice > p.price)
    : allProducts)
    .slice(0, 4)
    .map(p => mockProductToApiFormat(p, locale));

  const texts = {
    ar: {
      title: 'عروض فلاش',
      subtitle: 'عروض محدودة الوقت',
      viewAll: 'عرض الكل →',
    },
    en: {
      title: 'Flash Sale',
      subtitle: 'Limited Time Offers',
      viewAll: 'View All →',
    },
    zh: {
      title: '限时抢购',
      subtitle: '限时优惠',
      viewAll: '查看全部 →',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  const formatTime = (value: number) => String(value).padStart(2, '0');

  return (
    <div className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
              {t.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t.subtitle}</p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg">
          <Timer className="w-5 h-5 text-red-600 dark:text-red-400" />
          <div className="flex items-center gap-1 font-mono font-bold text-red-700 dark:text-red-400">
            <span className="bg-red-600 text-white px-2 py-1 rounded">{formatTime(timeLeft.hours)}</span>
            <span>:</span>
            <span className="bg-red-600 text-white px-2 py-1 rounded">{formatTime(timeLeft.minutes)}</span>
            <span>:</span>
            <span className="bg-red-600 text-white px-2 py-1 rounded">{formatTime(timeLeft.seconds)}</span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {flashSaleProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Flash Sale Badge */}
            <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              {locale === 'ar' ? 'عرض فلاش' : locale === 'zh' ? '限时抢购' : 'FLASH'}
            </div>
            <ProductCard
              product={{
                id: product.id,
                name: product.name,
                description: product.description || '',
                imageUrl: product.imageUrl || '',
                userId: product.makerId || '',
                price: product.price,
                currency: product.currency,
                category: product.category,
                createdAt: product.createdAt || '2024-01-01T00:00:00.000Z',
                updatedAt: product.updatedAt || '2024-01-01T00:00:00.000Z',
              }}
              href={`/${locale}/products/${product.id}`}
            />
          </motion.div>
        ))}
      </div>

      {/* View All Link */}
      <div className="text-center mt-6">
        <Link
          href={`/${locale}/products?flash=true`}
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold"
        >
          {t.viewAll}
        </Link>
      </div>
    </div>
  );
}
