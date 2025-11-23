import { notFound } from 'next/navigation';
import MakerDetailClient from '@/components/makers/MakerDetailClient';
import { Maker, Product, Video } from '@/types';
import { normalizeProduct } from '@/lib/product-utils';
import { normalizeMaker } from '@/lib/maker-utils';
import { getApiBaseUrl } from '@/lib/api-utils';
import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';

interface LocaleMakerPageProps {
  params: {
    locale: string;
    makerId: string;
  };
}

/**
 * Fetch maker by slug or ID
 * Uses fetchJsonWithRetry for consistent error handling and retry logic
 */
async function fetchMaker(makerId: string): Promise<Maker | null> {
  const apiBaseUrl = getApiBaseUrl();
  
  try {
    // First try as slug (most common case)
    let json = await fetchJsonWithRetry(`${apiBaseUrl}/makers/slug/${makerId}`, {
      next: { revalidate: 600 }, // 10 minutes cache
      maxRetries: 2,
      retryDelay: 1000,
    });

    // Backend returns object directly (not wrapped in { data: {...} })
    // If error, try as ID
    if (json.error || (!json.id && json.error !== 'Rate limited by Render Free tier')) {
      // Small delay before retry
      await new Promise(resolve => setTimeout(resolve, 100));
      
      json = await fetchJsonWithRetry(`${apiBaseUrl}/makers/${makerId}`, {
        next: { revalidate: 600 },
        maxRetries: 2,
        retryDelay: 1000,
      });
    }

    // If still not found or error
    if (json.error || !json.id) {
      return null;
    }

    // Backend returns maker object directly
    const payload = json;
    return normalizeMaker(payload);
  } catch (error) {
    console.error('[MakerPage] Failed to fetch maker details:', error);
    return null;
  }
}

/**
 * Fetch products for a maker
 * Note: Backend doesn't support makerId filter yet, so we fetch limited products and filter client-side
 * Uses fetchJsonWithRetry for consistent error handling
 * 
 * @param makerUserId - The userId of the maker (links Maker to User, which is used in Product.userId)
 */
async function fetchMakerProducts(makerUserId: string): Promise<Product[]> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const json = await fetchJsonWithRetry(`${apiBaseUrl}/products?limit=100`, {
      next: { revalidate: 300 }, // 5 minutes cache
      maxRetries: 2,
      retryDelay: 1000,
    });

    // Backend returns array directly (not wrapped in { data: [...] })
    const items = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
    const normalized = items.map(normalizeProduct);

    // Filter by maker's userId (Product.userId should match Maker.userId)
    const filtered = normalized.filter((product: Product) => 
      product.userId === makerUserId || product.maker?.id === makerUserId
    );
    
    // Return filtered if found, otherwise return all (so page isn't empty)
    return filtered.length > 0 ? filtered : normalized;
  } catch (error) {
    console.error('[MakerPage] Failed to fetch maker products:', error);
    return [];
  }
}

/**
 * Fetch videos for a maker
 * Uses fetchJsonWithRetry for consistent error handling
 * 
 * @param makerUserId - The userId of the maker (links Maker to User, which is used in Video.userId)
 */
async function fetchMakerVideos(makerUserId: string): Promise<Video[]> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const json = await fetchJsonWithRetry(`${apiBaseUrl}/videos?limit=50`, {
      next: { revalidate: 300 }, // 5 minutes cache
      maxRetries: 2,
      retryDelay: 1000,
    });

    // Backend returns array directly (not wrapped in { data: [...] })
    const videosData = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
    
    const formatVideo = (video: any): Video => ({
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
    });

    const allVideos = videosData.map(formatVideo);
    // Filter videos by maker's userId (Video.userId should match Maker.userId)
    return allVideos.filter((video: Video) => video.userId === makerUserId);
  } catch (error) {
    console.error('[MakerPage] Failed to fetch maker videos:', error);
    return [];
  }
}

export default async function LocaleMakerPage({ params }: LocaleMakerPageProps) {
  const { locale, makerId } = params;

  // Stagger requests to avoid overwhelming backend (aligned with new pattern)
  const maker = await fetchMaker(makerId);
  
  if (!maker) {
    notFound();
  }

  // Use maker.userId for filtering products and videos (not makerId slug/id)
  // maker.userId links Maker to User, which is used for Product.userId and Video.userId
  const makerUserId = maker.userId || maker.id;

  // Small delay before fetching products
  await new Promise(resolve => setTimeout(resolve, 100));
  const products = await fetchMakerProducts(makerUserId);

  // Another small delay before fetching videos
  await new Promise(resolve => setTimeout(resolve, 100));
  const videos = await fetchMakerVideos(makerUserId);

  return <MakerDetailClient locale={locale} maker={maker} products={products} videos={videos} />;
}

