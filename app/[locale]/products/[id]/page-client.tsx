'use client';

import { useState, useEffect } from 'react';
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
import CommentsSection from '@/components/shared/CommentsSection';
import { useAuth } from '@/hooks/useAuth';
import AutoTranslator from '@/components/AutoTranslator';
import { MessageCircle, Factory, Shield, Lock, Plane } from 'lucide-react';
import GroupBuyWidget from '@/components/product/GroupBuyWidget';
import ProductPoster from '@/components/product/ProductPoster';

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
  const [isMobile, setIsMobile] = useState(false);
  const [lowStockCount] = useState(Math.floor(Math.random() * 9) + 1); // Random number 1-9

  // Detect mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
  
  // Generate product URL for QR code
  const productUrl = typeof window !== 'undefined' 
    ? window.location.href 
    : `/${locale}/products/${product.id}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Add bottom padding on mobile to account for sticky bar */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isMobile ? 'pb-24' : ''}`}>
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
              <div className="flex items-center gap-3 mb-2">
                <p className="text-4xl font-bold text-primary">
                  {formatPrice(product.price, product.currency)}
                </p>
                {/* Urgency Indicator - Low Stock Warning */}
                {product.stock !== undefined && product.stock > 0 && product.stock <= 50 && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full">
                    <div className="relative">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400 whitespace-nowrap">
                      {locale === 'ar'
                        ? `بقي ${lowStockCount} فقط!`
                        : locale === 'zh'
                        ? `仅剩 ${lowStockCount} 件！`
                        : `Only ${lowStockCount} left!`}
                    </p>
                  </div>
                )}
              </div>
              {product.stock !== undefined && (
                <p className="text-sm text-gray-600">
                  {product.stock > 0 
                    ? `${product.stock} ${locale === 'ar' ? 'متوفر' : locale === 'zh' ? '有库存' : 'in stock'}`
                    : locale === 'ar' ? 'غير متوفر' : locale === 'zh' ? '缺货' : 'Out of stock'
                  }
                </p>
              )}
            </div>

            {/* Group Buy Widget - Pinduoduo-style */}
            <GroupBuyWidget
              soloPrice={product.price}
              teamPrice={Math.round(product.price * 0.6)} // 40% discount for team price
              currency={product.currency || 'AED'}
              locale={locale}
              productId={product.id}
              onCreateTeam={() => {
                // Open share modal to invite friends when creating new team
                setIsShareModalOpen(true);
              }}
            />

            {/* Product Poster Generator - WeChat-style sharing */}
            <ProductPoster
              productName={product.name}
              productImage={mainImage}
              soloPrice={product.price}
              teamPrice={Math.round(product.price * 0.6)}
              currency={product.currency || 'AED'}
              locale={locale}
              productUrl={productUrl}
            />

            {product.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {locale === 'ar' ? 'الوصف' : locale === 'zh' ? '描述' : 'Description'}
                </h3>
                {/* Auto Translator - Magic Translation Feature */}
                <AutoTranslator
                  originalText={
                    // إذا كان الوصف يحتوي على أحرف صينية، استخدمه كـ original
                    /[\u4e00-\u9fff]/.test(product.description)
                      ? product.description
                      : // إذا لم يكن صيني، استخدم نص تجريبي صيني للعرض
                        '这是一款高品质的手工竹椅，由中国大师精心制作。坚固耐用，环保设计。适合现代家居装饰，带来自然与艺术的完美结合。'
                  }
                  translatedText={
                    // إذا كان الوصف عربي أو إنجليزي، استخدمه كـ translated
                    /[\u4e00-\u9fff]/.test(product.description)
                      ? // إذا كان الوصف صيني، استخدم ترجمة تجريبية
                        'هذا كرسي خيزران عالي الجودة مصنوع يدوياً، تم تصنيعه بعناية من قبل أساتذة صينيين. قوي ومتين، وبتصميم صديق للبيئة. مناسب لديكور المنازل الحديثة، يجلب مزيجاً مثالياً بين الطبيعة والفن.'
                      : product.description
                  }
                  originalLang={/[\u4e00-\u9fff]/.test(product.description) ? 'zh' : locale === 'ar' ? 'ar' : 'en'}
                  translatedLang={locale === 'ar' ? 'ar' : locale === 'zh' ? 'zh' : 'en'}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                />
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
                <CommentsSection
                  targetType="PRODUCT"
                  targetId={product.id}
                  locale={locale}
                  showTitle={false}
                />
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
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
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
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
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
                {/* Add to Cart Button - Enhanced for Mobile */}
                <Button
                  variant="primary"
                  className="flex-1 min-h-[48px] text-base font-semibold"
                  onClick={() => {
                    if (product && (product.stock === undefined || product.stock > 0)) {
                      addItem({
                        productId: product.id,
                        name: product.name,
                        imageUrl: mainImage,
                        price: product.price,
                        currency: product.currency || 'USD',
                        quantity: quantity,
                      });
                    }
                  }}
                  disabled={product.stock !== undefined && product.stock === 0}
                >
                  {locale === 'ar' ? 'أضف إلى السلة' : locale === 'zh' ? '添加到购物车' : 'Add to Cart'}
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 min-h-[48px] text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
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
                    ? 'شراء مباشر'
                    : locale === 'zh'
                    ? '直接购买'
                    : 'Buy Now'}
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

              {/* Trust Badges Section */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg border border-amber-200/50 dark:border-amber-700/50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Factory className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                      {locale === 'ar'
                        ? 'مباشرة من الصين'
                        : locale === 'zh'
                        ? '直接从中国'
                        : 'Direct from China'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg border border-amber-200/50 dark:border-amber-700/50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                      {locale === 'ar'
                        ? 'ضمان الجودة'
                        : locale === 'zh'
                        ? '质量保证'
                        : 'Quality Guarantee'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg border border-amber-200/50 dark:border-amber-700/50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                      {locale === 'ar'
                        ? 'دفع آمن'
                        : locale === 'zh'
                        ? '安全支付'
                        : 'Secure Payment'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg border border-amber-200/50 dark:border-amber-700/50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Plane className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                      {locale === 'ar'
                        ? 'شحن سريع'
                        : locale === 'zh'
                        ? '快速发货'
                        : 'Fast Shipping'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-6">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
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

        {/* Mobile Sticky Action Bar */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-gradient-to-r from-gray-900 via-black to-gray-900 backdrop-blur-lg border-t border-amber-500/30 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center gap-2">
                {/* Chat Button */}
                {product.makerId && (
                  <Link
                    href={`/${locale}/messages/${product.makerId}`}
                    className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </Link>
                )}
                
                {/* Add to Cart Button */}
                <Button
                  variant="secondary"
                  className="flex-1 h-12 border-2 border-amber-500/50 text-amber-400 hover:bg-amber-500/10 font-semibold bg-transparent"
                  onClick={() => {
                    if (product && (product.stock === undefined || product.stock > 0)) {
                      addItem({
                        productId: product.id,
                        name: product.name,
                        imageUrl: mainImage,
                        price: product.price,
                        currency: product.currency || 'USD',
                        quantity: quantity,
                      });
                    }
                  }}
                  disabled={product.stock !== undefined && product.stock === 0}
                >
                  {locale === 'ar' ? 'إضافة' : locale === 'zh' ? '加入购物车' : 'Add to Cart'}
                </Button>
                
                {/* Buy Now Button - Large & Prominent */}
                <Button
                  variant="primary"
                  className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={async () => {
                    setCheckoutLoading(true);
                    setCheckoutError(null);
                    try {
                      trackCheckoutStarted(product.id, quantity, product.price * quantity);

                      const response = await paymentsAPI.createCheckout({
                        productId: product.id,
                        quantity: quantity,
                        currency: product.currency || 'USD',
                      });

                      if (response.checkoutUrl) {
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
                    ? (locale === 'ar' ? '...' : '...')
                    : locale === 'ar'
                    ? 'شراء الآن'
                    : locale === 'zh'
                    ? '立即购买'
                    : 'Buy Now'}
                </Button>
              </div>
            </div>
          </div>
        )}

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

