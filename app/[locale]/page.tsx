import HomePageClient from '@/components/home/HomePageClient';
import { Product, Maker, Video } from '@/types';
import { normalizeProduct } from '@/lib/product-utils';
import { normalizeMaker } from '@/lib/maker-utils';
import { getApiBaseUrl } from '@/lib/api-utils';
import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';

interface LocalePageProps {
  params: {
    locale: string;
  };
}

async function fetchLatestProducts(): Promise<Product[]> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const json = await fetchJsonWithRetry(`${apiBaseUrl}/products`, {
      next: { revalidate: 60 },
      maxRetries: 2, // Reduce retries for homepage to avoid delays
      retryDelay: 500, // Faster retry for better UX
    });

    const items = Array.isArray(json.data) ? json.data : [];
    return items.slice(0, 8).map(normalizeProduct);
  } catch (error) {
    console.error('[HomePage] Failed to load products from backend:', error);
    return [];
  }
}

async function fetchFeaturedMakers(): Promise<Maker[]> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const json = await fetchJsonWithRetry(`${apiBaseUrl}/makers`, {
      next: { revalidate: 120 },
      maxRetries: 2,
      retryDelay: 500,
    });

    const items = Array.isArray(json.data) ? json.data : [];
    return items.slice(0, 6).map(normalizeMaker);
  } catch (error) {
    console.error('[HomePage] Failed to load makers from backend:', error);
    return [];
  }
}

async function fetchFeaturedVideos(): Promise<Video[]> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const json = await fetchJsonWithRetry(`${apiBaseUrl}/videos?limit=6`, {
      next: { revalidate: 120 },
      maxRetries: 2,
      retryDelay: 500,
    });

    const items = Array.isArray(json.data) ? json.data : [];
    return items.slice(0, 6).map((video: any) => ({
      id: video.id,
      userId: video.userId,
      title: video.title,
      description: video.description || '',
      thumbnail: video.thumbnailUrl || video.thumbnail || '',
      videoUrl: video.videoUrl || '',
      duration: video.duration || 0,
      views: video.views || 0,
      likes: video.likes || 0,
      comments: video.comments || 0,
      createdAt: video.createdAt || new Date().toISOString(),
      type: (video.type || 'long') as 'short' | 'long',
    }));
  } catch (error) {
    console.error('[HomePage] Failed to load videos from backend:', error);
    return [];
  }
}

export default async function LocaleHomePage({ params }: LocalePageProps) {
  const { locale } = params;
  const [products, makers, videos] = await Promise.all([
    fetchLatestProducts(),
    fetchFeaturedMakers(),
    fetchFeaturedVideos(),
  ]);

  return <HomePageClient locale={locale} products={products} makers={makers} videos={videos} />;
}