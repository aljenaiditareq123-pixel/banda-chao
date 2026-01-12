import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { makersAPI, productsAPI, videosAPI, servicesAPI } from '@/lib/api';

// Disable SSR for HomePageClient to prevent React Error #310 (hydration mismatch)
const HomePageClient = dynamic(
  () => import('@/components/home/HomePageClient'),
  { ssr: false }
);

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function HomePage({ params }: PageProps) {
  let locale: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params:', error);
    // Fallback to default locale if params resolution fails
    locale = 'ar';
  }

  // Validate locale and fallback to default if invalid
  if (!validLocales.includes(locale)) {
    console.warn(`Invalid locale: ${locale}, falling back to 'ar'`);
    locale = 'ar';
  }

  // Fetch featured content from API with caching and better error handling
  let featuredMakers: any[] = [];
  let featuredProducts: any[] = [];
  let featuredVideos: any[] = [];
  let featuredServices: any[] = [];

  try {
    // Use Promise.allSettled to ensure all requests complete even if some fail
    const [makersResult, productsResult, videosResult, servicesResult] = await Promise.allSettled([
      makersAPI.getAll({ limit: 6 }),
      productsAPI.getAll({ limit: 8 }),
      videosAPI.getAll({ limit: 6 }),
      servicesAPI.getPublicServices({ limit: 8 }),
    ]);

    // Extract data from settled promises, defaulting to empty arrays on failure
    featuredMakers = makersResult.status === 'fulfilled' ? (makersResult.value?.makers || []) : [];
    featuredProducts = productsResult.status === 'fulfilled' ? (productsResult.value?.products || []) : [];
    featuredVideos = videosResult.status === 'fulfilled' ? (videosResult.value?.videos || []) : [];
    featuredServices = servicesResult.status === 'fulfilled' ? (servicesResult.value?.services || []) : [];

    // Log errors only in development or if critical
    if (process.env.NODE_ENV === 'development') {
      if (makersResult.status === 'rejected') console.warn('Failed to fetch makers:', makersResult.reason?.message);
      if (productsResult.status === 'rejected') console.warn('Failed to fetch products:', productsResult.reason?.message);
      if (videosResult.status === 'rejected') console.warn('Failed to fetch videos:', videosResult.reason?.message);
      if (servicesResult.status === 'rejected') console.warn('Failed to fetch services:', servicesResult.reason?.message);
    }
  } catch (error) {
    // This catch should rarely trigger now with Promise.allSettled, but keep as safety net
    console.error('Unexpected error in homepage data fetching:', error);
    // Continue with empty arrays - don't throw error to prevent error page
  }

  // Use mock products as fallback if API fails or returns empty
  if (featuredProducts.length === 0) {
    const { getAllMockProducts, mockProductToApiFormat } = await import('@/lib/mock-products');
    const mockProducts = getAllMockProducts();
    featuredProducts = mockProducts.slice(0, 8).map(p => mockProductToApiFormat(p, locale));
  }

  return (
    <HomePageClient
      locale={locale}
      featuredMakers={featuredMakers}
      featuredProducts={featuredProducts}
      featuredVideos={featuredVideos}
      featuredServices={featuredServices}
    />
  );
}
