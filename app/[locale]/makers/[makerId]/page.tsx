import { notFound } from 'next/navigation';
import MakerDetailClient from '@/components/makers/MakerDetailClient';
import { Maker, Product, Video } from '@/types';
import { PRODUCTS_ENDPOINT, normalizeProduct } from '@/lib/product-utils';
import { normalizeMaker } from '@/lib/maker-utils';
import { getApiBaseUrl } from '@/lib/api-utils';

interface LocaleMakerPageProps {
  params: {
    locale: string;
    makerId: string;
  };
}

async function fetchMaker(makerId: string): Promise<Maker | null> {
  const apiBaseUrl = getApiBaseUrl();
  
  try {
    // First try as slug
    let response = await fetch(`${apiBaseUrl}/makers/slug/${makerId}`, {
      next: { revalidate: 600 }, // 10 minutes cache (aligned with makers page)
    });

    // If 404, try as ID
    if (response.status === 404) {
      response = await fetch(`${apiBaseUrl}/makers/${makerId}`, {
        next: { revalidate: 600 }, // 10 minutes cache
      });
    }

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch maker ${makerId}: ${response.status}`);
    }

    const json = await response.json();
    const payload = json.data ?? json;
    return normalizeMaker(payload);
  } catch (error) {
    console.error('[MakerPage] Failed to fetch maker details:', error);
    return null;
  }
}

async function fetchMakerProducts(makerId: string): Promise<Product[]> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    // Note: Backend doesn't support makerId filter yet, so we fetch limited products and filter client-side
    const response = await fetch(`${apiBaseUrl}/products?limit=100`, {
      next: { revalidate: 300 }, // 5 minutes cache
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch maker products ${makerId}: ${response.status}`);
    }

    const json = await response.json();
    const items = Array.isArray(json.data) ? json.data : [];
    const normalized = items.map(normalizeProduct);

    const filtered = normalized.filter((product: Product) => product.userId === makerId || product.maker?.id === makerId);
    return filtered.length > 0 ? filtered : normalized;
  } catch (error) {
    console.error('[MakerPage] Failed to fetch maker products:', error);
    return [];
  }
}

async function fetchMakerVideos(makerId: string): Promise<Video[]> {
  try {
    // Fetch limited videos and filter by userId (makerId)
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/videos?limit=50`, {
      next: { revalidate: 300 }, // 5 minutes cache
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch videos: ${response.status}`);
    }

    const json = await response.json();
    const videosData = json.data?.data || json.data || [];
    
    const formatVideo = (video: any): Video => ({
      id: video.id,
      userId: video.userId,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnailUrl || video.thumbnail,
      videoUrl: video.videoUrl,
      duration: video.duration,
      views: video.views || 0,
      likes: video.likes || 0,
      comments: video.comments || 0,
      createdAt: video.createdAt,
      type: video.type as 'short' | 'long',
    });

    const allVideos = videosData.map(formatVideo);
    // Filter videos by makerId (userId)
    return allVideos.filter((video: Video) => video.userId === makerId);
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

  // Small delay before fetching products
  await new Promise(resolve => setTimeout(resolve, 100));
  const products = await fetchMakerProducts(makerId);

  // Another small delay before fetching videos
  await new Promise(resolve => setTimeout(resolve, 100));
  const videos = await fetchMakerVideos(makerId);

  return <MakerDetailClient locale={locale} maker={maker} products={products} videos={videos} />;
}

