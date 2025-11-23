'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import LikeButton from '@/components/LikeButton';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductCardProps {
  product: Product;
  href?: string;
  locale?: string;
}

/**
 * Format Chinese product description with title and description separated by ｜
 * Only used for zh locale
 * Example: "多用途健身球" + "适合瑜伽和力量训练" -> "多用途健身球｜适合瑜伽和力量训练"
 */
function formatChineseDescription(title: string, description: string): string {
  if (!description || !title) return title;
  // Extract first short keyword/phrase from description (max 15 chars for better UI)
  // Remove punctuation and extract meaningful phrase
  const cleaned = description.trim().replace(/[，。！？,\.!?\n\r]/g, ' ').trim();
  const shortDesc = cleaned.slice(0, 15).trim();
  // Only add if we have meaningful content after cleaning
  return shortDesc && shortDesc.length > 0 ? `${title}｜${shortDesc}` : title;
}

export default function ProductCard({ product, href, locale }: ProductCardProps) {
  const { t, language } = useLanguage();
  const [imageError, setImageError] = useState(false);
  const currentLocale = locale || language || 'zh';
  const isZhLocale = currentLocale === 'zh';

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) {
      return t('priceTBD');
    }
    // Use proper currency formatting based on locale
    return new Intl.NumberFormat(currentLocale === 'ar' ? 'ar-EG' : currentLocale === 'zh' ? 'zh-CN' : 'en-US', {
      style: 'currency',
      currency: currentLocale === 'ar' ? 'AED' : currentLocale === 'en' ? 'USD' : 'CNY',
      maximumFractionDigits: 2,
    }).format(price);
  };

  // Format product title/name for Chinese locale
  const displayTitle = isZhLocale && product.description
    ? formatChineseDescription(product.name || '', product.description || '')
    : product.name;

  const hasImage = product.images && product.images.length > 0;
  const showPlaceholder = !hasImage || imageError;

  return (
    <Link href={href ?? `/products/${product.id}`} className="block group" aria-label={product.name || 'Product'}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative aspect-square bg-gray-100">
          {!showPlaceholder ? (
            <Image
              src={product.images[0]}
              alt={product.name || 'Product image'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-pink-100" aria-label={`${product.name || 'Product'} placeholder`}>
              <span className="text-4xl" aria-hidden="true">📦</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-red-600 transition">
            {displayTitle}
          </h3>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-red-600 font-bold text-lg">{formatPrice(product.price)}</span>
              {product.rating > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({product.reviewCount})</span>
                </div>
              )}
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <LikeButton productId={product.id} initialLikes={product.rating || 0} locale={locale} />
            </div>
          </div>
          {/* Only show full description for non-Chinese locales */}
          {!isZhLocale && product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          )}
          {/* Chinese locale: Show sales and rating info */}
          {isZhLocale && (
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
              <span>销量: {(product as any).salesCount || 0}</span>
              <span>评分: {product.rating > 0 ? product.rating.toFixed(1) : '5.0'}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
