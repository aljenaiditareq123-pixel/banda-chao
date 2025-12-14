'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Grid, GridItem } from '@/components/Grid';
import ProductCard from '@/components/cards/ProductCard';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  images?: Array<{ url: string }>;
  category?: string;
  userId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface SimilarProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  locale: string;
  uploadedImageUrl?: string;
}

export default function SimilarProductsModal({
  isOpen,
  onClose,
  products,
  locale,
  uploadedImageUrl,
}: SimilarProductsModalProps) {
  const translations = {
    ar: {
      title: 'منتجات مشابهة',
      subtitle: 'بناءً على الصورة التي قمت برفعها',
      noResults: 'لم نجد منتجات مشابهة',
      close: 'إغلاق',
    },
    zh: {
      title: '相似产品',
      subtitle: '根据您上传的图片',
      noResults: '未找到相似产品',
      close: '关闭',
    },
    en: {
      title: 'Similar Products',
      subtitle: 'Based on the image you uploaded',
      noResults: 'No similar products found',
      close: 'Close',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t.subtitle}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label={t.close}
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Uploaded Image Preview */}
            {uploadedImageUrl && (
              <div className="mt-4 flex items-center gap-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {locale === 'ar' ? 'الصورة المرفوعة:' : locale === 'zh' ? '上传的图片:' : 'Uploaded image:'}
                </div>
                <img
                  src={uploadedImageUrl}
                  alt="Uploaded"
                  className="w-16 h-16 object-cover rounded-lg border-2 border-primary-500"
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">{t.noResults}</p>
              </div>
            ) : (
              <Grid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} gap="gap-4">
                {products.map((product) => (
                  <GridItem key={product.id}>
                    <ProductCard
                      product={{
                        id: product.id,
                        name: product.name,
                        description: product.description || '',
                        imageUrl: product.imageUrl || product.images?.[0]?.url || '',
                        userId: product.userId || '',
                        price: product.price,
                        currency: product.currency,
                        category: product.category,
                        createdAt: product.createdAt?.toString() || new Date().toISOString(),
                        updatedAt: product.updatedAt?.toString() || new Date().toISOString(),
                      }}
                      href={`/${locale}/products/${product.id}`}
                    />
                  </GridItem>
                ))}
              </Grid>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
