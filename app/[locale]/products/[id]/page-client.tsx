'use client';

import { useState } from 'react';
import { Grid, GridItem } from '@/components/Grid';
import ProductCard from '@/components/cards/ProductCard';
import Link from 'next/link';
import Button from '@/components/Button';
import EmptyState from '@/components/common/EmptyState';
import { paymentsAPI } from '@/lib/api';
import { trackCheckoutStarted } from '@/lib/analytics';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import GroupBuyButton from '@/components/GroupBuyButton';
import ShareModal from '@/components/ShareModal';
import { useCart } from '@/contexts/CartContext';
import LikeButton from '@/components/social/LikeButton';
import CommentList from '@/components/social/CommentList';
import CommentForm from '@/components/social/CommentForm';
import { useAuth } from '@/hooks/useAuth';

interface Maker {
  id: string;
  displayName?: string;
  name?: string;
  bio?: string;
  country?: string;
  city?: string;
  avatarUrl?: string;
  profile_picture_url?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  stock?: number;
  category?: string;
  images?: Array<{ url: string }>;
  imageUrl?: string;
  maker?: Maker;
  makerId?: string;
  userId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface ProductDetailClientProps {
  locale: string;
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ locale, product, relatedProducts }: ProductDetailClientProps) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);

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

  const images = product.images || [];
  const mainImage = images[0]?.url || product.imageUrl || '';

  return (
    <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="aspect-square bg-gray-200 relative">
              {mainImage ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const placeholder = target.nextElementSibling as HTMLElement;
                      if (placeholder) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="w-full h-full flex items-center justify-center text-6xl text-gray-400 absolute inset-0" style={{ display: 'none' }}>
                    🛍️
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-gray-400">
                  🛍️
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 p-4">
                {images.slice(1, 5).map((img, index) => (
                  <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = target.nextElementSibling as HTMLElement;
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400 absolute inset-0" style={{ display: 'none' }}>
                      🛍️
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            
            {product.maker && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {locale === 'ar' ? 'من صنع' : locale === 'zh' ? '制作' : 'Made by'}
                </p>
                <Link href={`/${locale}/makers/${product.maker.id || product.makerId}`}>
                  <div className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                    {product.maker.avatarUrl || product.maker.profile_picture_url ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.maker.avatarUrl || product.maker.profile_picture_url}
                          alt={product.maker.displayName || product.maker.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">👤</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {product.maker.displayName || product.maker.name}
                      </p>
                      {product.maker.bio && (
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {product.maker.bio}
                        </p>
                      )}
                      {product.maker.country && (
                        <p className="text-xs text-gray-500 mt-1">
                          📍 {product.maker.city ? `${product.maker.city}, ` : ''}{product.maker.country}
                        </p>
                      )}
                    </div>
                    <Button variant="text" className="text-primary flex-shrink-0">
                      {locale === 'ar' ? 'عرض الملف الشخصي →' : locale === 'zh' ? '查看个人资料 →' : 'View Profile →'}
                    </Button>
                  </div>
                </Link>
              </div>
            )}

            <div className="mb-6">
              <p className="text-4xl font-bold text-primary mb-2">
                {formatPrice(product.price, product.currency)}
              </p>
              {product.stock !== undefined && (
                <p className="text-sm text-gray-600">
                  {product.stock > 0 
                    ? `${product.stock} ${locale === 'ar' ? 'متوفر' : 'in stock'}`
                    : locale === 'ar' ? 'غير متوفر' : 'Out of stock'
                  }
                </p>
              )}
            </div>

            {product.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {locale === 'ar' ? 'الوصف' : locale === 'zh' ? '描述' : 'Description'}
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {product.category && (
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-primary-50 text-primary rounded-full text-sm">
                  {product.category}
                </span>
              </div>
            )}

            {/* Like Button */}
            <div className="mb-6 flex items-center gap-4">
              <LikeButton
                targetType="PRODUCT"
                targetId={product.id}
                locale={locale}
                showCount={true}
              />
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="text-sm">
                  {locale === 'ar' ? 'التعليقات' : locale === 'zh' ? '评论' : 'Comments'}
                </span>
              </button>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="mb-6 pt-6 border-t border-gray-200">
                <CommentList
                  targetType="PRODUCT"
                  targetId={product.id}
                  locale={locale}
                />
                {user && (
                  <div className="mt-4">
                    <CommentForm
                      targetType="PRODUCT"
                      targetId={product.id}
                      locale={locale}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              {product.stock !== undefined && product.stock > 0 && (
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">
                    {locale === 'ar' ? 'الكمية' : locale === 'zh' ? '数量' : 'Quantity'}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock || 100}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock || 100, parseInt(e.target.value) || 1)))}
                      className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock || 100, quantity + 1))}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      disabled={quantity >= (product.stock || 100)}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {checkoutError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{checkoutError}</p>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={async () => {
                    setCheckoutLoading(true);
                    setCheckoutError(null);
                    try {
                      // Track checkout started
                      trackCheckoutStarted(product.id, quantity, product.price * quantity);

                      const response = await paymentsAPI.createCheckout({
                        productId: product.id,
                        quantity: quantity,
                        currency: product.currency || 'USD',
                      });

                      if (response.checkoutUrl) {
                        // Redirect to Stripe checkout
                        window.location.href = response.checkoutUrl;
                      } else {
                        setCheckoutError(
                          locale === 'ar'
                            ? 'فشل إنشاء جلسة الدفع'
                            : 'Failed to create checkout session'
                        );
                      }
                    } catch (error: unknown) {
                      const errorMessage = error && typeof error === 'object' && 'response' in error
                        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                        : undefined;
                      setCheckoutError(
                        errorMessage ||
                        (locale === 'ar' ? 'حدث خطأ أثناء بدء عملية الدفع' : 'Error starting checkout process')
                      );
                    } finally {
                      setCheckoutLoading(false);
                    }
                  }}
                  disabled={checkoutLoading || (product.stock !== undefined && product.stock === 0)}
                >
                  {checkoutLoading
                    ? (locale === 'ar' ? 'جاري المعالجة...' : 'Processing...')
                    : locale === 'ar'
                    ? 'شراء تجريبي (Test Mode)'
                    : locale === 'zh'
                    ? '测试购买'
                    : 'Buy (Test Mode)'}
                </Button>
                <Button variant="secondary">
                  ❤️
                </Button>
              </div>

              {/* Group Buy Button */}
              <div className="mt-4">
                <GroupBuyButton
                  onClick={() => {
                    setIsShareModalOpen(true);
                  }}
                  className="w-full"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  {locale === 'ar'
                    ? '⚠️ هذا دفع تجريبي في وضع الاختبار (لا يتم خصم أموال حقيقية).'
                    : locale === 'zh'
                    ? '⚠️ 这是测试模式的试付款（不会扣除真实资金）。'
                    : '⚠️ This is a test payment in test mode (no real money will be charged).'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {locale === 'ar' 
                ? `منتجات أخرى من ${product.maker?.displayName || 'نفس الصانع'}`
                : locale === 'zh'
                ? `来自${product.maker?.displayName || '同一制作者'}的其他产品`
                : `More from ${product.maker?.displayName || 'this maker'}`
              }
            </h2>
            <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="gap-6">
              {relatedProducts.map((relatedProduct) => (
                <GridItem key={relatedProduct.id}>
                  <ProductCard
                    product={{
                      id: relatedProduct.id,
                      name: relatedProduct.name,
                      description: relatedProduct.description || '',
                      imageUrl: relatedProduct.images?.[0]?.url || relatedProduct.imageUrl || '',
                      userId: relatedProduct.userId || '',
                      price: relatedProduct.price,
                      currency: relatedProduct.currency,
                      category: relatedProduct.category,
                      createdAt: relatedProduct.createdAt?.toString() || new Date().toISOString(),
                      updatedAt: relatedProduct.updatedAt?.toString() || new Date().toISOString(),
                    }}
                    href={`/${locale}/products/${relatedProduct.id}`}
                  />
                </GridItem>
              ))}
            </Grid>
          </section>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        productId={product.id}
        productName={product.name}
        locale={locale}
      />
    </div>
  );
}

