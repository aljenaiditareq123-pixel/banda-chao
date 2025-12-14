'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Grid, GridItem } from '@/components/Grid';
import Button from '@/components/Button';
import ProductCard from '@/components/cards/ProductCard';
import ServiceCard from '@/components/cards/ServiceCard';
import MakerCard from '@/components/cards/MakerCard';
import VideoCard from '@/components/cards/VideoCard';
import GroupBuyCard from '@/components/GroupBuyCard';
import ChineseProductCard from '@/components/cards/ChineseProductCard';
import { useLanguage } from '@/contexts/LanguageContext';
import EmptyState from '@/components/common/EmptyState';
import OnboardingModal from '@/components/common/OnboardingModal';
import RedEnvelope from '@/components/RedEnvelope';
import MysteryBox from '@/components/MysteryBox';
import LuckyWheel from '@/components/LuckyWheel';
import LiveStreamModal from '@/components/LiveStreamModal';
import FameEngine from '@/components/home/FameEngine';
import HeroSlider from '@/components/home/HeroSlider';
import CategoryCircles from '@/components/home/CategoryCircles';
import FlashSale from '@/components/home/FlashSale';
import ProductGrid from '@/components/home/ProductGrid';
import DailyFengShui from '@/components/home/DailyFengShui';
import { servicesAPI } from '@/lib/api';
import { getAllMockProducts, mockProductToApiFormat } from '@/lib/mock-products';

// Helper function to check if product matches lucky color
function checkProductColorMatch(product: any, luckyColor: string): boolean {
  // Check product name, description, category, or image for color keywords
  const searchText = `${product.name || ''} ${product.description || ''} ${product.category || ''}`.toLowerCase();
  
  const colorKeywords: Record<string, string[]> = {
    red: ['red', 'أحمر', '红色', 'crimson', 'scarlet', 'ruby', '红'],
    gold: ['gold', 'ذهبي', '金色', 'golden', 'yellow', 'amber', '金'],
    green: ['green', 'أخضر', '绿色', 'emerald', 'jade', 'mint', '绿'],
    blue: ['blue', 'أزرق', '蓝色', 'navy', 'azure', 'cyan', '蓝'],
    yellow: ['yellow', 'أصفر', '黄色', 'golden', 'amber', 'lemon', '黄'],
    purple: ['purple', 'بنفسجي', '紫色', 'violet', 'lavender', 'plum', '紫'],
    orange: ['orange', 'برتقالي', '橙色', 'tangerine', 'coral', 'peach', '橙'],
    pink: ['pink', 'وردي', '粉色', 'rose', 'salmon', 'fuchsia', '粉'],
  };

  const keywords = colorKeywords[luckyColor] || [];
  return keywords.some(keyword => searchText.includes(keyword));
}

// Filter and return exactly 3 products matching lucky color
function getLuckyProducts(products: any[], luckyColor: string | null, maxCount: number = 3): any[] {
  if (!luckyColor) return [];
  
  const matching = products.filter(p => checkProductColorMatch(p, luckyColor));
  return matching.slice(0, maxCount);
}

interface HomePageClientProps {
  locale: string;
  featuredMakers: any[];
  featuredProducts: any[];
  featuredVideos: any[];
  featuredServices?: any[];
}

export default function HomePageClient({
  locale,
  featuredMakers,
  featuredProducts,
  featuredVideos,
  featuredServices = [],
}: HomePageClientProps) {
  const { setLanguage, t } = useLanguage();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');
  const [services, setServices] = useState<any[]>(featuredServices);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [luckyColor, setLuckyColor] = useState<string | null>(null);
  // Use ref to track if we've attempted to fetch services (prevents infinite loop)
  const hasFetchedServicesRef = useRef(false);

  useEffect(() => {
    if (locale === 'zh' || locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    } else {
      setLanguage('ar');
    }
  }, [locale, setLanguage]);

  useEffect(() => {
    // If services tab is active and we don't have services yet, fetch them
    // Use ref to prevent infinite loop - only fetch once per tab activation
    if (activeTab === 'services' && services.length === 0 && !loadingServices && !hasFetchedServicesRef.current) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/2c67604d-7559-48d9-bc71-1425d33c34f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomePageClient.tsx:54',message:'Starting services fetch',data:{activeTab,servicesLength:services.length,loadingServices,hasFetched:hasFetchedServicesRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      hasFetchedServicesRef.current = true;
      setLoadingServices(true);
      servicesAPI.getPublicServices({ limit: 8 })
        .then((response) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/2c67604d-7559-48d9-bc71-1425d33c34f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomePageClient.tsx:62',message:'Services API response received',data:{success:response.success,servicesCount:response.services?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          
          if (response.success && response.services) {
            setServices(response.services);
          } else {
            // Set empty array to prevent re-fetching, but mark as fetched
            setServices([]);
          }
        })
        .catch((error) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/2c67604d-7559-48d9-bc71-1425d33c34f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomePageClient.tsx:73',message:'Services API error',data:{error:error?.message || 'Unknown error'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          
          console.error('Error fetching services:', error);
          // Set empty array to prevent re-fetching
          setServices([]);
        })
        .finally(() => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/2c67604d-7559-48d9-bc71-1425d33c34f8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomePageClient.tsx:81',message:'Services fetch completed',data:{servicesLength:services.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          
          setLoadingServices(false);
        });
    }
  }, [activeTab, services.length, loadingServices]);
  
  // Reset fetch flag when switching away from services tab
  useEffect(() => {
    if (activeTab !== 'services') {
      hasFetchedServicesRef.current = false;
    }
  }, [activeTab]);

  // Initialize services from props if available
  useEffect(() => {
    if (featuredServices.length > 0 && services.length === 0) {
      setServices(featuredServices);
      // If we have featured services, mark as fetched to prevent API call
      hasFetchedServicesRef.current = true;
    }
  }, [featuredServices, services.length]);

  const heroTexts = {
    ar: {
      headline: 'منصة عالمية للحرفيين المستقلين',
      description: 'اكتشف منتجات يدوية فريدة من حرفيين موهوبين حول العالم. اربط مباشرة مع الصانعين وادعم الإبداع الحقيقي.',
      cta1: 'استكشف الحرفيين',
      cta2: 'استكشف المنتجات',
    },
    en: {
      headline: 'A Global Home for Independent Makers',
      description: 'Discover unique handmade products from talented artisans worldwide. Connect directly with makers and support real creativity.',
      cta1: 'Explore Makers',
      cta2: 'Explore Products',
    },
    zh: {
      headline: '全球独立手工艺人的家园',
      description: '发现来自世界各地才华横溢的手工艺人制作的独特手工产品。直接与制作者联系，支持真正的创造力。',
      cta1: '探索手工艺人',
      cta2: '探索产品',
    },
  };

  const texts = heroTexts[locale as keyof typeof heroTexts] || heroTexts.en;

  const helpTexts = {
    ar: {
      help: 'مساعدة',
    },
    en: {
      help: 'Help',
    },
    zh: {
      help: '帮助',
    },
  };

  const helpT = helpTexts[locale as keyof typeof helpTexts] || helpTexts.en;

  return (
    <div className="bg-white" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Help/Onboarding Button - Floating */}
      <button
        onClick={() => setShowOnboarding(true)}
        className="fixed bottom-6 right-6 z-[60] bg-primary text-white rounded-full w-14 h-14 shadow-lg hover:bg-primary-600 flex items-center justify-center text-xl"
        aria-label={helpT.help}
      >
        ?
      </button>

      {/* Onboarding Modal */}
      <OnboardingModal
        locale={locale}
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* Main Storefront Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Slider */}
        <HeroSlider locale={locale} />

        {/* Category Circles */}
        <CategoryCircles locale={locale} />

        {/* Flash Sale */}
        <FlashSale locale={locale} />

        {/* Lucky Products Section - Show 3 matching products */}
        {luckyColor && (() => {
          const allProducts = featuredProducts.length > 0 
            ? featuredProducts.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                imageUrl: p.images?.[0]?.url || p.imageUrl || '',
                price: p.price,
                currency: p.currency,
                category: p.category,
                rating: (p as any).rating,
                reviews: (p as any).reviews,
                originalPrice: (p as any).originalPrice,
              }))
            : getAllMockProducts().map(p => {
                const apiProduct = mockProductToApiFormat(p, locale);
                return {
                  id: apiProduct.id,
                  name: apiProduct.name,
                  description: apiProduct.description,
                  imageUrl: apiProduct.imageUrl || '',
                  price: apiProduct.price,
                  currency: apiProduct.currency,
                  category: apiProduct.category,
                  rating: apiProduct.rating,
                  reviews: apiProduct.reviews,
                  originalPrice: apiProduct.originalPrice,
                };
              });
          
          const luckyProducts = getLuckyProducts(allProducts, luckyColor, 3);
          
          if (luckyProducts.length > 0) {
            return (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-3xl">🔮</div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {locale === 'ar' 
                      ? 'منتجاتك المحظوظة' 
                      : locale === 'zh' 
                      ? '你的幸运产品' 
                      : 'Your Lucky Products'}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {luckyProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl shadow-lg border-4 border-yellow-400 overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105"
                    >
                      <div className="relative">
                        <div className="absolute top-3 left-3 z-10 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                          <span>🔮</span>
                          <span>{locale === 'zh' ? '幸运' : locale === 'ar' ? 'محظوظ' : 'Lucky'}</span>
                        </div>
                        <Link href={`/${locale}/products/${product.id}`}>
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-64 object-cover"
                            />
                          ) : (
                            <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                              <span className="text-5xl">🛍️</span>
                            </div>
                          )}
                        </Link>
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-2xl font-bold text-red-600 mb-3">
                          {product.currency || 'USD'} {product.price.toLocaleString()}
                        </p>
                        <Link href={`/${locale}/products/${product.id}`}>
                          <Button variant="primary" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                            {locale === 'ar' ? 'عرض المنتج' : locale === 'zh' ? '查看产品' : 'View Product'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }
          return null;
        })()}

        {/* All Products Grid */}
        <ProductGrid
          locale={locale}
          products={featuredProducts.length > 0 
            ? featuredProducts.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                imageUrl: p.images?.[0]?.url || p.imageUrl || '',
                price: p.price,
                currency: p.currency,
                category: p.category,
                rating: (p as any).rating,
                reviews: (p as any).reviews,
                originalPrice: (p as any).originalPrice,
              }))
            : getAllMockProducts().map(p => {
                const apiProduct = mockProductToApiFormat(p, locale);
                return {
                  id: apiProduct.id,
                  name: apiProduct.name,
                  description: apiProduct.description,
                  imageUrl: apiProduct.imageUrl || '',
                  price: apiProduct.price,
                  currency: apiProduct.currency,
                  category: apiProduct.category,
                  rating: apiProduct.rating,
                  reviews: apiProduct.reviews,
                  originalPrice: apiProduct.originalPrice,
                };
              })
          }
          title={locale === 'ar' ? 'جميع المنتجات' : locale === 'zh' ? '所有产品' : 'All Products'}
          showLoadMore={true}
        />
      </div>

      {/* Hall of Fame Leaderboards - Keep for gamification */}
      <FameEngine />

      {/* Panda Stories Ring - Live Streaming Section */}
      <section className="py-6 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {locale === 'ar' 
              ? 'قصص الباندا 🐼' 
              : locale === 'zh' 
              ? '熊猫故事 🐼'
              : 'Panda Stories 🐼'}
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {/* Live Stream Circle - First and Special */}
            <button
              onClick={() => setShowLiveStream(true)}
              className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-red-500 animate-pulse shadow-lg group-hover:scale-110 transition-transform duration-200 flex items-center justify-center">
                  <span className="text-2xl">🐼</span>
                </div>
                {/* Red pulsing ring */}
                <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75"></div>
                {/* LIVE badge */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  LIVE
                </div>
              </div>
              <span className="text-xs text-gray-600 font-medium max-w-[64px] text-center truncate">
                {locale === 'ar' ? 'باندا لايف' : locale === 'zh' ? '熊猫直播' : 'Panda Live'}
              </span>
            </button>

            {/* Other Story Circles */}
            {[
              { name: locale === 'ar' ? 'عروض اليوم' : locale === 'zh' ? '今日优惠' : 'Today Deals', emoji: '🔥' },
              { name: locale === 'ar' ? 'منتجات جديدة' : locale === 'zh' ? '新产品' : 'New Products', emoji: '✨' },
              { name: locale === 'ar' ? 'شحن مجاني' : locale === 'zh' ? '免费送货' : 'Free Shipping', emoji: '🚚' },
              { name: locale === 'ar' ? 'خصومات' : locale === 'zh' ? '折扣' : 'Discounts', emoji: '💸' },
              { name: locale === 'ar' ? 'أكثر مبيعاً' : locale === 'zh' ? '最畅销' : 'Best Sellers', emoji: '⭐' },
            ].map((story, index) => (
              <button
                key={index}
                className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-400 group-hover:scale-110 transition-transform duration-200 flex items-center justify-center shadow-md">
                  <span className="text-2xl">{story.emoji}</span>
                </div>
                <span className="text-xs text-gray-600 font-medium max-w-[64px] text-center truncate">
                  {story.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Live Stream Modal */}
      <LiveStreamModal
        isOpen={showLiveStream}
        onClose={() => setShowLiveStream(false)}
        videoUrl="https://www.youtube.com/shorts/5e5L9-3fWlI"
      />

      {/* Best Sellers Section - Chinese Style */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {locale === 'ar' 
                  ? 'الأكثر رواجاً في الصين 🔥' 
                  : locale === 'zh' 
                  ? '中国最热销 🔥'
                  : 'Best Sellers in China 🔥'}
              </h2>
              <p className="text-gray-600 text-sm">
                {locale === 'ar' 
                  ? 'المنتجات الأكثر مبيعاً هذا الأسبوع' 
                  : locale === 'zh' 
                  ? '本周最畅销产品'
                  : 'This week\'s best sellers'}
              </p>
            </div>
          </div>
          
          <Grid columns={{ base: 2, sm: 2, md: 4 }} gap="gap-4">
            {/* Sample Products - Chinese Style */}
            <GridItem>
              <ChineseProductCard
                id="1"
                image="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
                title={locale === 'ar' ? 'سماعة بلوتوث' : locale === 'zh' ? '蓝牙耳机' : 'Bluetooth Headphones'}
                price={50}
                originalPrice={80}
                soldCount={1200}
                href={`/${locale}/products/1`}
                locale={locale}
              />
            </GridItem>
            
            <GridItem>
              <ChineseProductCard
                id="2"
                image="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"
                title={locale === 'ar' ? 'ساعة ذكية' : locale === 'zh' ? '智能手表' : 'Smart Watch'}
                price={80}
                originalPrice={120}
                soldCount={5000}
                href={`/${locale}/products/2`}
                locale={locale}
              />
            </GridItem>
            
            <GridItem>
              <ChineseProductCard
                id="3"
                image="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400"
                title={locale === 'ar' ? 'شاحن سريع' : locale === 'zh' ? '快速充电器' : 'Fast Charger'}
                price={30}
                originalPrice={50}
                soldCount={850}
                href={`/${locale}/products/3`}
                locale={locale}
              />
            </GridItem>
            
            <GridItem>
              <ChineseProductCard
                id="4"
                image="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"
                title={locale === 'ar' ? 'حقيبة ظهر' : locale === 'zh' ? '背包' : 'Backpack'}
                price={45}
                originalPrice={70}
                soldCount={300}
                href={`/${locale}/products/4`}
                locale={locale}
              />
            </GridItem>
          </Grid>
        </div>
      </section>

      {/* Mystery Panda Box Section - Gamification */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MysteryBox />
        </div>
      </section>

      {/* Featured Makers */}
      {featuredMakers.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {locale === 'ar' ? 'الحرفيون المميزون' : locale === 'zh' ? '精选手工艺人' : 'Featured Makers'}
                </h2>
                <p className="text-gray-600">
                  {locale === 'ar' ? 'اكتشف مواهب حرفيين موهوبين من حول العالم' : locale === 'zh' ? '发现来自世界各地的才华横溢的手工艺人' : 'Discover talented makers from around the world'}
                </p>
              </div>
              <Link href={`/${locale}/makers`}>
                <Button variant="text">
                  {locale === 'ar' ? 'عرض الكل' : 'View All'}
                </Button>
              </Link>
            </div>
            <Grid columns={{ base: 1, sm: 2, md: 3 }} gap="gap-6">
              {featuredMakers.slice(0, 6).map((maker) => (
                <GridItem key={maker.id}>
                  <MakerCard
                    maker={maker}
                    href={`/${locale}/makers/${maker.id}`}
                    locale={locale}
                  />
                </GridItem>
              ))}
            </Grid>
          </div>
        </section>
      )}

      {/* Daily Deals Section (Chinese UX Focus) */}
      {locale === 'zh' && featuredProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  🔥 每日特惠
                  <span className="text-lg font-normal text-red-600">限时抢购</span>
                </h2>
                <p className="text-gray-600">今日独家优惠，即将结束！</p>
              </div>
              <Link href={`/${locale}/deals`}>
                <Button variant="primary" className="bg-red-500 hover:bg-red-600">
                  查看全部 →
                </Button>
              </Link>
            </div>
            <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="gap-6">
              {featuredProducts.slice(0, 4).map((product) => {
                // Add discount simulation for Chinese market
                const discount = Math.floor(Math.random() * 30) + 10;
                const originalPrice = product.price;
                const discountedPrice = originalPrice * (1 - discount / 100);

                return (
                  <GridItem key={product.id}>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      <div className="relative">
                        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          -{discount}% 折扣
                        </div>
                        <Link href={`/${locale}/products/${product.id}`}>
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
                        </Link>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl font-bold text-red-600">
                            {product.currency || 'CNY'} {discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {product.currency || 'CNY'} {originalPrice.toFixed(2)}
                          </span>
                        </div>
                        <Link href={`/${locale}/products/${product.id}`}>
                          <Button variant="primary" className="w-full bg-red-500 hover:bg-red-600">
                            立即查看
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </GridItem>
                );
              })}
            </Grid>
          </div>
        </section>
      )}

      {/* Products & Services Section with Tabs */}
      {(featuredProducts.length > 0 || featuredServices.length > 0 || activeTab === 'services') && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Tab Navigation */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      activeTab === 'products'
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {locale === 'ar' ? 'المنتجات' : locale === 'zh' ? '产品' : 'Products'}
                  </button>
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      activeTab === 'services'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {locale === 'ar' ? 'الخدمات' : locale === 'zh' ? '服务' : 'Services'}
                  </button>
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {activeTab === 'products'
                      ? locale === 'ar' ? 'المنتجات المميزة' : locale === 'zh' ? '精选产品' : 'Featured Products'
                      : locale === 'ar' ? 'الخدمات المتاحة' : locale === 'zh' ? '可用服务' : 'Available Services'}
                  </h2>
                  <p className="text-gray-600">
                    {activeTab === 'products'
                      ? locale === 'ar' ? 'اكتشف منتجات يدوية فريدة من حرفيين موهوبين' : locale === 'zh' ? '发现来自才华横溢的手工艺人的独特手工产品' : 'Discover unique handmade products from talented makers'
                      : locale === 'ar' ? 'اكتشف خدمات متنوعة من حرفيين موهوبين' : locale === 'zh' ? '发现来自才华横溢的手工艺人的多样化服务' : 'Discover diverse services from talented makers'}
                  </p>
                </div>
              </div>
              {activeTab === 'products' && (
                <Link href={`/${locale}/products`}>
                  <Button variant="text">
                    {locale === 'ar' ? 'عرض الكل' : 'View All'}
                  </Button>
                </Link>
              )}
            </div>

            {/* Products Tab Content */}
            {activeTab === 'products' && featuredProducts.length > 0 && (
              <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="gap-6">
                {featuredProducts.slice(0, 8).map((product) => {
                  const imageUrl = product.images?.[0]?.url || product.imageUrl || '';
                  return (
                    <GridItem key={product.id}>
                      <ProductCard
                        product={{
                          ...product,
                          imageUrl,
                        }}
                        href={`/${locale}/products/${product.id}`}
                      />
                    </GridItem>
                  );
                })}
              </Grid>
            )}

            {/* Services Tab Content */}
            {activeTab === 'services' && (
              <>
                {loadingServices ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">
                      {locale === 'ar' ? 'جاري التحميل...' : locale === 'zh' ? '加载中...' : 'Loading...'}
                    </div>
                  </div>
                ) : services.length > 0 ? (
                  <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="gap-6">
                    {services.slice(0, 8).map((service) => (
                      <GridItem key={service.id}>
                        <ServiceCard
                          service={service}
                          href={`/${locale}/services/${service.id}`}
                          locale={locale}
                        />
                      </GridItem>
                    ))}
                  </Grid>
                ) : (
                  <EmptyState
                    title={locale === 'ar' ? 'لا توجد خدمات متاحة' : locale === 'zh' ? '暂无可用服务' : 'No services available'}
                  />
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Featured Videos */}
      {featuredVideos.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {locale === 'ar' ? 'الفيديوهات المميزة' : locale === 'zh' ? '精选视频' : 'Featured Videos'}
                </h2>
                <p className="text-gray-600">
                  {locale === 'ar' ? 'شاهد فيديوهات من حرفيين موهوبين' : locale === 'zh' ? '观看来自才华横溢的手工艺人的视频' : 'Watch videos from talented makers'}
                </p>
              </div>
              <Link href={`/${locale}/videos`}>
                <Button variant="text">
                  {locale === 'ar' ? 'عرض الكل' : 'View All'}
                </Button>
              </Link>
            </div>
            <Grid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="gap-6">
              {featuredVideos.slice(0, 6).map((video) => (
                <GridItem key={video.id}>
                  <VideoCard
                    video={video}
                    href={`/${locale}/videos/${video.id}`}
                    locale={locale}
                  />
                </GridItem>
              ))}
            </Grid>
          </div>
        </section>
      )}

      {/* Group Buy Section - Viral Marketing */}
      <section className="py-16 bg-gradient-to-b from-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {locale === 'ar' 
                  ? 'شراء جماعي (وفّر مع أصدقائك) 👯‍♀️' 
                  : locale === 'zh' 
                  ? '团购（与朋友一起省钱）👯‍♀️'
                  : 'Group Buy (Save with Friends) 👯‍♀️'}
              </h2>
              <p className="text-gray-600">
                {locale === 'ar' 
                  ? 'اشترِ مع صديق واحصل على خصم 50%!' 
                  : locale === 'zh' 
                  ? '与朋友一起购买，享受50%折扣！'
                  : 'Buy with a friend and get 50% off!'}
              </p>
            </div>
          </div>
          
          <Grid columns={{ base: 1, sm: 2, md: 2 }} gap="gap-6">
            {/* Sample Group Buy Products */}
            <GridItem>
              <GroupBuyCard
                id="group-1"
                image="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
                title={locale === 'ar' ? 'سماعات باندا المحيطية' : locale === 'zh' ? '熊猫环绕声耳机' : 'Panda Surround Headphones'}
                singlePrice={199}
                groupPrice={99}
                href={`/${locale}/products/group-1`}
                locale={locale}
              />
            </GridItem>
            
            <GridItem>
              <GroupBuyCard
                id="group-2"
                image="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"
                title={locale === 'ar' ? 'ساعة ذكية رياضية' : locale === 'zh' ? '智能运动手表' : 'Smart Sports Watch'}
                singlePrice={299}
                groupPrice={149}
                href={`/${locale}/products/group-2`}
                locale={locale}
              />
            </GridItem>
          </Grid>
        </div>
      </section>

      {/* Daily Rewards - Lucky Wheel Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {locale === 'ar' 
                ? 'مكافآت يومية 🎁' 
                : locale === 'zh' 
                ? '每日奖励 🎁'
                : 'Daily Rewards 🎁'}
            </h2>
            <p className="text-gray-600 text-lg">
              {locale === 'ar' 
                ? 'دوّر العجلة كل يوم واربح خصومات وجوائز حصرية!' 
                : locale === 'zh' 
                ? '每天旋转轮盘，赢取折扣和独家奖品！'
                : 'Spin the wheel every day and win discounts and exclusive prizes!'}
            </p>
          </div>
          <LuckyWheel />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'ar' ? 'ابدأ رحلتك مع Banda Chao اليوم' : locale === 'zh' ? '今天开始您的 Banda Chao 之旅' : 'Start Your Journey with Banda Chao Today'}
          </h2>
          <p className="text-lg text-primary-100 mb-8">
            {locale === 'ar' ? 'انضم إلى مجتمع الحرفيين واكتشف إبداعاً لا حدود له' : locale === 'zh' ? '加入手工艺人社区，发现无限的创造力' : 'Join our community of makers and discover endless creativity'}
          </p>
          <div className="flex justify-center">
            <Link href={`/${locale}/makers`}>
              <Button variant="secondary" className="px-8 py-3 bg-white text-primary hover:bg-primary-50">
                {locale === 'ar' ? 'استكشف الحرفيين' : locale === 'zh' ? '探索手工艺人' : 'Explore Makers'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Lucky Red Envelope - Chinese Gamification Feature */}
      <RedEnvelope />
    </div>
  );
}
