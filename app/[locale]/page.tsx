import { notFound } from 'next/navigation';
import HomePageClient from '@/components/home/HomePageClient';
import { makersAPI, productsAPI, videosAPI } from '@/lib/api';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;

  if (!validLocales.includes(locale)) {
    notFound();
  }

  // Fetch featured content from API with caching
  let featuredMakers: any[] = [];
  let featuredProducts: any[] = [];
  let featuredVideos: any[] = [];

  try {
    const [makersResponse, productsResponse, videosResponse] = await Promise.all([
      makersAPI.getAll({ limit: 6 }),
      productsAPI.getAll({ limit: 8 }),
      videosAPI.getAll({ limit: 6 }),
    ]);

    featuredMakers = makersResponse.makers || [];
    featuredProducts = productsResponse.products || [];
    featuredVideos = videosResponse.videos || [];
  } catch (error) {
    console.error('Error fetching featured content:', error);
    // Continue with empty arrays
  }

  return (
    <HomePageClient
      locale={locale}
      featuredMakers={featuredMakers}
      featuredProducts={featuredProducts}
      featuredVideos={featuredVideos}
    />
  );
}
