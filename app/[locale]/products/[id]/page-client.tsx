'use client';

import { useState, useEffect } from 'react';
import { Grid, GridItem } from '@/components/Grid';
import ProductCard from '@/components/cards/ProductCard';
import Link from 'next/link';
import Button from '@/components/Button';
import EmptyState from '@/components/common/EmptyState';
import { paymentsAPI, reviewsAPI, chatAPI } from '@/lib/api';
import { trackCheckoutStarted } from '@/lib/analytics';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import GroupBuyButton from '@/components/GroupBuyButton';
import ShareModal from '@/components/ShareModal';
import PandaHaggleModal from '@/components/product/PandaHaggleModal';
import ClanBuyModal from '@/components/product/ClanBuyModal';
import { useCart } from '@/contexts/CartContext';
import LikeButton from '@/components/social/LikeButton';
import CommentList from '@/components/social/CommentList';
import CommentForm from '@/components/social/CommentForm';
import CommentsSection from '@/components/shared/CommentsSection';
import VideoReviewsCarousel from '@/components/product/VideoReviewsCarousel';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import AutoTranslator from '@/components/AutoTranslator';
import UserNameWithBadge from '@/components/common/UserNameWithBadge';
import { MessageCircle, Factory, Shield, Lock, Plane, Star } from 'lucide-react';
import GroupBuyWidget from '@/components/product/GroupBuyWidget';
import ProductPoster from '@/components/product/ProductPoster';
import VirtualTryOn from '@/components/product/VirtualTryOn';
import MagicVideoGenerator from '@/components/product/MagicVideoGenerator';

interface Maker {
  id: string;
  displayName?: string;
  name?: string;
  bio?: string;
  country?: string;
  city?: string;
  avatarUrl?: string;
  profile_picture_url?: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    profile_picture: string | null;
    isVerified?: boolean;
  };
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
  const [isHaggleModalOpen, setIsHaggleModalOpen] = useState(false);
  const [isClanBuyModalOpen, setIsClanBuyModalOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [lowStockCount, setLowStockCount] = useState<number | null>(null); // Initialize as null to prevent hydration mismatch
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [translatedDescription, setTranslatedDescription] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [reviewSummary, setReviewSummary] = useState<{
    pros: string[];
    cons: string[];
    summary: string;
  } | null>(null);
  const [loadingReviewSummary, setLoadingReviewSummary] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [userHasPurchased, setUserHasPurchased] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Detect mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check for clan join link in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const clanToken = urlParams.get('clan');
      if (clanToken) {
        setIsClanBuyModalOpen(true);
      }
    }
  }, []);

  // Set random low stock count on client side only to prevent hydration mismatch
  useEffect(() => {
    if (lowStockCount === null) {
      setLowStockCount(Math.floor(Math.random() * 9) + 1); // Random number 1-9
    }
  }, [lowStockCount]);

  // Fetch AI-powered recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoadingRecommendations(true);
        const response = await fetch(`/api/products/${product.id}/recommendations`);
        if (response.ok) {
          const data = await response.json();
          if (data.products && data.products.length > 0) {
            setAiRecommendations(data.products);
          }
        }
      } catch (error) {
        console.error('Error fetching AI recommendations:', error);
        // Silently fail - recommendations are optional
      } finally {
        setLoadingRecommendations(false);
      }
    };

    if (product.id) {
      fetchRecommendations();
    }
  }, [product.id]);

  // Fetch AI review summary
  useEffect(() => {
    const fetchReviewSummary = async () => {
      try {
        setLoadingReviewSummary(true);
        const response = await fetch('/api/ai/summarize-reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.summary) {
            setReviewSummary(data.summary);
          }
        }
      } catch (error) {
        console.error('Error fetching review summary:', error);
        // Silently fail - summary is optional
      } finally {
        setLoadingReviewSummary(false);
      }
    };

    if (product.id) {
      fetchReviewSummary();
    }
  }, [product.id]);

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

  const handleTranslate = async () => {
    if (!product.description) return;

    setIsTranslating(true);
    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: product.description,
          targetLanguage: locale === 'ar' ? 'ar' : locale === 'zh' ? 'zh' : 'en',
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      setTranslatedDescription(data.translatedText);
      setShowOriginal(false);
    } catch (error) {
      console.error('Translation error:', error);
      alert(locale === 'ar' ? 'فشلت الترجمة. يرجى المحاولة مرة أخرى.' : locale === 'zh' ? '翻译失败，请重试' : 'Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleShowOriginal = () => {
    setShowOriginal(true);
  };

  const handleShowTranslation = () => {
    setShowOriginal(false);
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
                      <UserNameWithBadge
                        name={product.maker.displayName || product.maker.name || ''}
                        isVerified={product.maker.user?.isVerified || false}
                        showBadge={true}
                        badgeSize="sm"
                        className="font-semibold text-gray-900 truncate"
                      />
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

            {/* Price Section - AliExpress/Temu Style */}
            <div className="mb-6 p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
              <div className="flex items-baseline gap-3 mb-2">
                <p className="text-5xl font-black text-red-600">
                  {formatPrice(product.price, product.currency)}
                </p>
                {(product as any).originalPrice && (product as any).originalPrice > product.price && (
                  <div className="flex flex-col">
                    <p className="text-lg text-gray-500 line-through">
                      {formatPrice((product as any).originalPrice, product.currency)}
                    </p>
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                      {Math.round(((product as any).originalPrice - product.price) / (product as any).originalPrice * 100)}% OFF
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                {/* Urgency Indicator - Low Stock Warning */}
                {product.stock !== undefined && product.stock > 0 && product.stock <= 50 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 border-2 border-red-300 rounded-full">
                    <div className="relative">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-2 h-2 bg-red-600 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <p className="text-sm font-bold text-red-700 whitespace-nowrap">
                      {locale === 'ar'
                        ? `بقي ${lowStockCount ?? 5} فقط!`
                        : locale === 'zh'
                        ? `仅剩 ${lowStockCount ?? 5} 件！`
                        : `Only ${lowStockCount ?? 5} left!`}
                    </p>
                  </div>
                )}
                {(product as any).sold && (
                  <p className="text-sm font-semibold text-gray-700">
                    {locale === 'ar' 
                      ? `✅ ${(product as any).sold.toLocaleString()} تم البيع`
                      : locale === 'zh'
                      ? `✅ 已售出 ${(product as any).sold.toLocaleString()} 件`
                      : `✅ ${(product as any).sold.toLocaleString()} sold`}
                  </p>
                )}
                {(product as any).rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 text-lg">⭐</span>
                    <span className="text-sm font-bold text-gray-700">{(product as any).rating}</span>
                    {(product as any).reviews && (
                      <span className="text-xs text-gray-500">
                        ({((product as any).reviews / 1000).toFixed(1)}k)
                      </span>
                    )}
                  </div>
                )}
              </div>
              {product.stock !== undefined && (
                <p className="text-sm text-gray-600 mt-2">
                  {product.stock > 0 
                    ? `📦 ${product.stock} ${locale === 'ar' ? 'متوفر في المخزون' : locale === 'zh' ? '有库存' : 'in stock'}`
                    : locale === 'ar' ? '❌ غير متوفر' : locale === 'zh' ? '❌ 缺货' : '❌ Out of stock'
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

            {/* Specifications Section */}
            {(product as any).specifications && Object.keys((product as any).specifications).length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  {locale === 'ar' ? 'المواصفات' : locale === 'zh' ? '规格' : 'Specifications'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries((product as any).specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                      <span className="text-sm font-medium text-gray-600">{key}:</span>
                      <span className="text-sm font-bold text-gray-900">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description Section */}
            {product.description && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">📝</span>
                    {locale === 'ar' ? 'الوصف' : locale === 'zh' ? '描述' : 'Description'}
                  </h3>
                  {!translatedDescription && (
                    <button
                      onClick={handleTranslate}
                      disabled={isTranslating}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={locale === 'ar' ? 'ترجمة إلى العربية' : locale === 'zh' ? '翻译成中文' : 'Translate to your language'}
                    >
                      {isTranslating ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>{locale === 'ar' ? 'جاري الترجمة...' : locale === 'zh' ? '翻译中...' : 'Translating...'}</span>
                        </>
                      ) : (
                        <>
                          <span>🌍</span>
                          <span>{locale === 'ar' ? 'ترجمة' : locale === 'zh' ? '翻译' : 'Translate'}</span>
                        </>
                      )}
                    </button>
                  )}
                  {translatedDescription && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleShowOriginal}
                        disabled={showOriginal}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          showOriginal
                            ? 'bg-gray-200 text-gray-700 cursor-not-allowed'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        {locale === 'ar' ? 'الأصل' : locale === 'zh' ? '原文' : 'Original'}
                      </button>
                      <button
                        onClick={handleShowTranslation}
                        disabled={!showOriginal}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          !showOriginal
                            ? 'bg-primary-100 text-primary-600 cursor-not-allowed'
                            : 'bg-primary-50 hover:bg-primary-100 text-primary-600'
                        }`}
                      >
                        {locale === 'ar' ? 'المترجم' : locale === 'zh' ? '翻译' : 'Translated'}
                      </button>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {translatedDescription && !showOriginal ? translatedDescription : product.description}
                  </p>
                </div>
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

            {/* Color Options Section */}
            {(product as any).colors && Array.isArray((product as any).colors) && (product as any).colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🎨</span>
                  {locale === 'ar' ? 'الألوان المتاحة' : locale === 'zh' ? '可选颜色' : 'Available Colors'}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {(product as any).colors.map((color: string, index: number) => (
                    <button
                      key={index}
                      className="px-4 py-2 rounded-lg border-2 border-gray-300 hover:border-primary-500 transition-colors font-medium text-sm"
                      style={{ 
                        backgroundColor: color.toLowerCase() === 'white' ? '#fff' : color.toLowerCase(),
                        color: ['white', 'yellow', 'lightyellow'].includes(color.toLowerCase()) ? '#000' : '#fff',
                        borderColor: color.toLowerCase() === 'white' ? '#ccc' : color.toLowerCase()
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <ProductReviews
              productId={product.id}
              locale={locale}
              productName={product.name}
              currentRating={(product as any).rating}
              currentReviewsCount={(product as any).reviews_count || (product as any).reviews}
            />

            {/* AI Review Summary */}
            {reviewSummary && (
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  {locale === 'ar' ? 'ملخص الذكاء الاصطناعي' : locale === 'zh' ? 'AI摘要' : 'AI Summary'}
                </h3>
                
                {reviewSummary.pros.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                      <span>✅</span>
                      {locale === 'ar' ? 'إيجابيات' : locale === 'zh' ? '优点' : 'Pros'}
                    </h4>
                    <ul className="space-y-1">
                      {reviewSummary.pros.map((pro, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {reviewSummary.cons.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-2">
                      <span>⚠️</span>
                      {locale === 'ar' ? 'سلبيات' : locale === 'zh' ? '缺点' : 'Cons'}
                    </h4>
                    <ul className="space-y-1">
                      {reviewSummary.cons.map((con, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {reviewSummary.summary && (
                  <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                      <span>💡</span>
                      {locale === 'ar' ? 'الخلاصة النهائية' : locale === 'zh' ? '总结' : 'Summary'}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {reviewSummary.summary}
                    </p>
                  </div>
                )}
              </div>
            )}

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
                      id="product-quantity"
                      name="quantity"
                      min="1"
                      max={product.stock || 100}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock || 100, parseInt(e.target.value) || 1)))}
                      className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                      aria-label={locale === 'ar' ? 'الكمية' : locale === 'zh' ? '数量' : 'Quantity'}
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

              {/* Action Buttons - AliExpress/Temu Style */}
              <div className="space-y-3">
                {/* Try On Button (Fashion category only) */}
                {(product.category?.toLowerCase().includes('fashion') || 
                  product.category?.toLowerCase().includes('clothing') ||
                  product.category?.toLowerCase().includes('apparel') ||
                  product.category?.toLowerCase().includes('ملابس') ||
                  product.category?.toLowerCase().includes('服装')) && (
                  <Button
                    variant="secondary"
                    className="w-full h-12 border-2 border-primary-500 text-primary-600 hover:bg-primary-50 font-semibold flex items-center justify-center gap-2"
                    onClick={() => setIsTryOnOpen(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    {locale === 'ar' ? 'جرب الآن' : locale === 'zh' ? '试穿' : 'Try On'}
                  </Button>
                )}
                
                {/* Buy Now Button - Large & Prominent (Red) */}
                <Button
                  variant="primary"
                  className="w-full min-h-[56px] text-lg font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all"
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
                    ? (locale === 'ar' ? '⏳ جاري المعالجة...' : '⏳ Processing...')
                    : locale === 'ar'
                    ? '🛒 شراء الآن'
                    : locale === 'zh'
                    ? '🛒 立即购买'
                    : '🛒 Buy Now'}
                </Button>
                
                {/* Clan Buy Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Buy Alone Button */}
                  <Button
                    variant="secondary"
                    className="min-h-[52px] text-base font-bold border-2 border-primary-600 text-primary-600 hover:bg-primary-50 transition-all"
                    onClick={() => {
                      if (product && (product.stock === undefined || product.stock > 0)) {
                        addItem({
                          productId: product.id,
                          name: product.name,
                          imageUrl: mainImage,
                          price: product.price,
                          currency: product.currency || 'USD',
                          quantity: quantity,
                        }, locale);
                      }
                    }}
                    disabled={product.stock !== undefined && product.stock === 0}
                  >
                    {locale === 'ar' 
                      ? `شراء فردي (${formatPrice(product.price, product.currency || 'USD')})`
                      : locale === 'zh'
                      ? `单独购买 (${formatPrice(product.price, product.currency || 'USD')})`
                      : `Buy Alone (${formatPrice(product.price, product.currency || 'USD')})`}
                  </Button>

                  {/* Start Clan Button */}
                  <Button
                    variant="primary"
                    className="min-h-[52px] text-base font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all"
                    onClick={() => {
                      // Check if product has clan_price, otherwise use 50% of regular price
                      const clanPrice = (product as any).clan_price || Math.round(product.price * 0.5);
                      setIsClanBuyModalOpen(true);
                    }}
                    disabled={product.stock !== undefined && product.stock === 0}
                  >
                    {locale === 'ar'
                      ? `ابدأ عشيرة (${formatPrice((product as any).clan_price || Math.round(product.price * 0.5), product.currency || 'USD')})`
                      : locale === 'zh'
                      ? `开始团购 (${formatPrice((product as any).clan_price || Math.round(product.price * 0.5), product.currency || 'USD')})`
                      : `Start Clan (${formatPrice((product as any).clan_price || Math.round(product.price * 0.5), product.currency || 'USD')})`}
                  </Button>
                </div>

                {/* Haggle Button - Panda Negotiation */}
                <Button
                  variant="outline"
                  className="w-full min-h-[52px] text-base font-bold border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 transition-all flex items-center justify-center gap-2"
                  onClick={() => setIsHaggleModalOpen(true)}
                  disabled={product.stock !== undefined && product.stock === 0}
                >
                  <span className="text-xl">🐼</span>
                  {locale === 'ar' ? 'تفاوض مع الباندا' : locale === 'zh' ? '与熊猫讨价还价' : 'Haggle with Panda'}
                </Button>

                {/* Magic Video Generator - Create marketing video from product images */}
                <MagicVideoGenerator
                  productName={product.name}
                  productPrice={formatPrice(product.price, product.currency || 'USD')}
                  productImages={images.map(img => ({ url: img.url || img, alt: product.name }))}
                  locale={locale}
                />
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
                  <button
                    onClick={async () => {
                      if (!user) {
                        router.push(`/${locale}/login`);
                        return;
                      }

                      try {
                        const response = await chatAPI.startConversation({
                          sellerId: product.makerId || product.userId || '',
                          productId: product.id,
                        });

                        if (response.success && response.conversation) {
                          router.push(`/${locale}/messages?conversation=${response.conversation.id}`);
                        } else {
                          alert(response.error || (locale === 'ar' ? 'فشل بدء المحادثة' : 'Failed to start conversation'));
                        }
                      } catch (error) {
                        console.error('Error starting conversation:', error);
                        alert(locale === 'ar' ? 'حدث خطأ' : 'An error occurred');
                      }
                    }}
                    className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
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
                        isBlindBox: (product as any).is_blind_box || false,
                      }, locale);
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

        {/* AI-Powered Recommendations */}
        {aiRecommendations.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
              <span>🎯</span>
              {locale === 'ar' 
                ? 'منتجات قد تعجبك'
                : locale === 'zh'
                ? '您可能喜欢的产品'
                : 'You Might Also Like'
              }
            </h2>
            <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="gap-6">
              {aiRecommendations.map((recommendedProduct) => (
                <GridItem key={recommendedProduct.id}>
                  <ProductCard
                    product={{
                      id: recommendedProduct.id,
                      name: recommendedProduct.name || recommendedProduct.displayName || '',
                      description: recommendedProduct.description || recommendedProduct.displayDescription || '',
                      imageUrl: recommendedProduct.images?.[0]?.url || recommendedProduct.imageUrl || '',
                      userId: recommendedProduct.userId || '',
                      price: recommendedProduct.price,
                      currency: recommendedProduct.currency,
                      category: recommendedProduct.category,
                      createdAt: recommendedProduct.createdAt?.toString() || new Date().toISOString(),
                      updatedAt: recommendedProduct.updatedAt?.toString() || new Date().toISOString(),
                    }}
                    href={`/${locale}/products/${recommendedProduct.id}`}
                  />
                </GridItem>
              ))}
            </Grid>
          </section>
        )}

        {/* Related Products (from same maker) */}
        {relatedProducts.length > 0 && (
          <section className={aiRecommendations.length > 0 ? 'mt-12' : ''}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
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

      <PandaHaggleModal
        isOpen={isHaggleModalOpen}
        onClose={() => setIsHaggleModalOpen(false)}
        productId={product.id}
        productName={product.name}
        originalPrice={product.price}
        currency={product.currency || 'USD'}
        locale={locale}
        onSuccess={(haggledPrice) => {
          // Product already added to cart in modal
          console.log('Haggle successful! Price:', haggledPrice);
        }}
      />

      {/* Clan Buy Modal */}
      {isClanBuyModalOpen && (
        <ClanBuyModal
          isOpen={isClanBuyModalOpen}
          onClose={() => setIsClanBuyModalOpen(false)}
          productId={product.id}
          productName={product.name}
          soloPrice={product.price}
          clanPrice={(product as any).clan_price || Math.round(product.price * 0.5)}
          currency={product.currency || 'USD'}
          locale={locale}
          onSuccess={() => {
            // Add to cart at clan price when complete
            const clanPrice = (product as any).clan_price || Math.round(product.price * 0.5);
            addItem({
              productId: product.id,
              name: product.name,
              imageUrl: mainImage,
              price: clanPrice,
              currency: product.currency || 'USD',
              quantity: quantity,
              isBlindBox: (product as any).is_blind_box || false,
            }, locale);
            setIsClanBuyModalOpen(false);
          }}
        />
      )}

      {/* Virtual Try-On Modal */}
      <VirtualTryOn
        productImage={mainImage}
        productName={product.name}
        locale={locale}
        isOpen={isTryOnOpen}
        onClose={() => setIsTryOnOpen(false)}
      />
    </div>
  );
}

