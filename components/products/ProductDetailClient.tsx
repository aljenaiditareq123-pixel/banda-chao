'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Button from '@/components/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import ProductVideos from '@/components/videos/ProductVideos';

const MAIN_IMAGE_PLACEHOLDER = 'https://via.placeholder.com/640x640?text=Product';
const THUMB_PLACEHOLDERS = [
  'https://via.placeholder.com/160x160?text=Preview+1',
  'https://via.placeholder.com/160x160?text=Preview+2',
  'https://via.placeholder.com/160x160?text=Preview+3',
  'https://via.placeholder.com/160x160?text=Preview+4',
];

interface ProductDetailClientProps {
  locale: string;
  product: Product;
}

export default function ProductDetailClient({ locale, product }: ProductDetailClientProps) {
  const { setLanguage, t } = useLanguage();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (locale === 'zh' || locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    } else {
      setLanguage('zh');
    }
  }, [locale, setLanguage]);

  const mainImage = product.images && product.images.length > 0 ? product.images[0] : MAIN_IMAGE_PLACEHOLDER;

  const thumbnails = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images.slice(0, 4);
    }
    return THUMB_PLACEHOLDERS;
  }, [product.images]);

  const makerName = product.maker?.name ?? t('productDetailPlaceholderMaker');
  const makerLink = product.maker?.id ? `/${locale}/makers/${product.maker.id}` : `/${locale}/makers`;

  const priceLabel =
    typeof product.price === 'number'
      ? new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : locale === 'zh' ? 'zh-CN' : 'en-US', {
          style: 'currency',
          currency: locale === 'ar' ? 'AED' : locale === 'en' ? 'USD' : 'CNY',
          maximumFractionDigits: 2,
        }).format(product.price)
      : t('productDetailPlaceholderPrice');

  const storyParagraphs =
    product.description && product.description.trim().length > 0
      ? product.description
          .split(/\n+/)
          .map((paragraph) => paragraph.trim())
          .filter((paragraph) => paragraph.length > 0)
      : [
          t('productDetailStoryParagraph1'),
          t('productDetailStoryParagraph2'),
          t('productDetailStoryParagraph3'),
        ];

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <Layout showHeader={false}>
      <div className="bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {thumbnails.map((thumb, index) => (
                <div
                  key={`${thumb}-${index}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <img
                      src={thumb}
                      alt={`${product.name} preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-6">
            <div className="space-y-4">
              <Link
                href={makerLink}
                className="inline-block text-sm font-medium text-[#2E7D32] hover:text-[#256628] transition"
              >
                {t('productDetailBy')} {makerName}
              </Link>
              <h1 className="text-3xl font-semibold text-gray-900">{product.name}</h1>
              <p className="text-2xl font-bold text-[#2E7D32]">{priceLabel}</p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                {t('productDetailQuantity')}
              </p>
              <div className="inline-flex items-center rounded-full border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  className="px-4 py-2 text-lg font-semibold text-gray-600 hover:bg-gray-100 transition"
                  aria-label={t('productDetailQuantity')}
                >
                  −
                </button>
                <span className="px-4 py-2 text-base font-medium text-gray-900" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={increaseQuantity}
                  className="px-4 py-2 text-lg font-semibold text-gray-600 hover:bg-gray-100 transition"
                  aria-label={t('productDetailQuantity')}
                >
                  +
                </button>
              </div>
              <Button className="px-6 py-3 text-base" onClick={handleAddToCart}>
                {t('productDetailAddToCart')}
              </Button>
              {product.externalLink && (
                <a
                  href={product.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-[#2E7D32] hover:text-[#256628] mt-2"
                >
                  {t('viewMore')} ↗
                </a>
              )}
            </div>

            <div className="pt-4 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('productDetailStoryTitle')}
              </h2>
              {storyParagraphs.map((paragraph, index) => (
                <p key={index} className="text-sm leading-relaxed text-gray-600">
                  {paragraph}
                </p>
              ))}
              <p className="text-xs text-gray-400">
                Product ID: {product.id}
              </p>
            </div>
          </div>
        </div>

        {/* Product Videos Section */}
        <div className="mt-10">
          <ProductVideos productId={product.id} />
        </div>
        </div>
      </div>
    </Layout>
  );
}

