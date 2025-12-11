"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChineseProductCardProps {
  id: string;
  image?: string;
  title: string;
  price: number;
  originalPrice?: number;
  soldCount: number;
  href: string;
  locale?: string;
}

export default function ChineseProductCard({
  id,
  image,
  title,
  price,
  originalPrice,
  soldCount,
  href,
  locale = 'ar',
}: ChineseProductCardProps) {
  const { language } = useLanguage();
  const currentLocale = locale || language;

  // Format price
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('ar-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format sold count - Chinese style
  const formatSoldCount = (count: number) => {
    if (currentLocale === 'zh') {
      // Chinese format: 万 (10,000)
      if (count >= 10000) {
        return `${(count / 10000).toFixed(1)}万+`;
      } else if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}千+`;
      }
      return `${count}+`;
    } else {
      // Arabic/English format: K for thousands
      if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K+`;
      }
      return `${count}+`;
    }
  };

  const texts = {
    ar: {
      sold: 'تم بيع',
      pieces: 'قطعة',
      addToCart: 'أضف للسلة',
    },
    zh: {
      sold: '已售',
      pieces: '件',
      addToCart: '加入购物车',
    },
    en: {
      sold: 'Sold',
      pieces: 'pieces',
      addToCart: 'Add to Cart',
    },
  };

  const t = texts[currentLocale as keyof typeof texts] || texts.en;

  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 relative border border-gray-100">
        {/* HOT Badge */}
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <span>🔥</span>
          <span>HOT</span>
        </div>

        {/* Product Image */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
              📦
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3">
          {/* Title */}
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
            {title}
          </h3>

          {/* Price Section */}
          <div className="mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-red-600">
                {formatPrice(price)}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Sold Count - Social Proof */}
          <div className="mb-3">
            <p className="text-xs text-gray-500">
              {t.sold} <span className="font-bold text-gray-700">{formatSoldCount(soldCount)}</span> {t.pieces}
            </p>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              // Handle add to cart logic here
              // You can dispatch to cart context or call API
            }}
            className="w-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 rounded-full transition-colors duration-200 flex items-center justify-center gap-1"
          >
            <span>🛒</span>
            <span>{t.addToCart}</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
