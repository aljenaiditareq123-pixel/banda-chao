import { notFound } from 'next/navigation';
import HomePageClient from '@/components/home/HomePageClient';
import { makersAPI, productsAPI, videosAPI, servicesAPI } from '@/lib/api';

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

  // Fetch featured content from API with caching
  let featuredMakers: any[] = [];
  let featuredProducts: any[] = [];
  let featuredVideos: any[] = [];
  let featuredServices: any[] = [];

  try {
    const [makersResponse, productsResponse, videosResponse, servicesResponse] = await Promise.all([
      makersAPI.getAll({ limit: 6 }).catch(() => ({ makers: [] })),
      productsAPI.getAll({ limit: 8 }).catch(() => ({ products: [] })),
      videosAPI.getAll({ limit: 6 }).catch(() => ({ videos: [] })),
      servicesAPI.getPublicServices({ limit: 8 }).catch(() => ({ success: false, services: [] })),
    ]);

    featuredMakers = makersResponse?.makers || [];
    featuredProducts = productsResponse?.products || [];
    featuredVideos = videosResponse?.videos || [];
    featuredServices = servicesResponse?.services || [];
  } catch (error) {
    console.error('Error fetching featured content:', error);
    // Continue with empty arrays - don't throw error
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
