'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import ProductCard from '@/components/cards/ProductCard';

interface Product {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  price: number;
  currency?: string;
  category?: string;
  rating?: number;
  reviews?: number;
  originalPrice?: number;
}

interface ProductGridProps {
  locale: string;
  products: Product[];
  title?: string;
  showLoadMore?: boolean;
}

export default function ProductGrid({ locale, products, title, showLoadMore = true }: ProductGridProps) {
  const { addItem } = useCart();
  const [displayCount, setDisplayCount] = useState(12);

  const displayedProducts = products.slice(0, displayCount);
  const hasMore = products.length > displayCount;

  const formatPrice = (price: number, currency: string = 'AED') => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      CNY: '¥',
      SAR: 'ر.س',
      AED: 'د.إ',
    };
    return `${symbols[currency] || currency} ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      currency: product.currency || 'AED',
      quantity: 1,
    }, locale);
  };

  return (
    <div className="mb-12">
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h2>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {displayedProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="group"
          >
            <Link href={`/${locale}/products/${product.id}`}>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all">
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🛍️
                    </div>
                  )}
                  
                  {/* Quick Add to Cart Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleAddToCart(product, e)}
                    className={`absolute bottom-2 ${locale === 'ar' ? 'left-2' : 'right-2'} w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10`}
                    aria-label={locale === 'ar' ? 'إضافة للسلة' : locale === 'zh' ? '添加到购物车' : 'Add to cart'}
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </motion.button>

                  {/* Discount Badge */}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className={`absolute top-2 ${locale === 'ar' ? 'right-2' : 'left-2'} bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10`}>
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {product.rating}
                      </span>
                      {product.reviews && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({product.reviews > 1000 ? `${(product.reviews / 1000).toFixed(1)}k` : product.reviews})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-red-600">
                      {formatPrice(product.price, product.currency)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-gray-500 line-through">
                        {formatPrice(product.originalPrice, product.currency)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Load More Button */}
      {showLoadMore && hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => setDisplayCount(prev => Math.min(prev + 12, products.length))}
            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
          >
            {locale === 'ar' ? 'عرض المزيد' : locale === 'zh' ? '加载更多' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
