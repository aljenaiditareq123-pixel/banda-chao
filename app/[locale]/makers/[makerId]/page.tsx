import { notFound } from 'next/navigation';
import MakerDetailClient from '@/components/makers/MakerDetailClient';
import { Maker, Product, Video } from '@/types';
import { PRODUCTS_ENDPOINT, normalizeProduct, BACKEND_BASE_URL } from '@/lib/product-utils';
import { normalizeMaker } from '@/lib/maker-utils';

interface LocaleMakerPageProps {
  params: {
    locale: string;
    makerId: string;
  };
}

// Helper function to get API base URL (server-side safe)
function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001/api/v1';
  }
  return 'https://banda-chao-backend.onrender.com/api/v1';
}

async function fetchMaker(makerId: string): Promise<Maker | null> {
  const apiBaseUrl = getApiBaseUrl();
  
  try {
    // First try as slug
    let response = await fetch(`${apiBaseUrl}/makers/slug/${makerId}`, {
      next: { revalidate: 120 },
    });

    // If 404, try as ID
    if (response.status === 404) {
      response = await fetch(`${apiBaseUrl}/makers/${makerId}`, {
        next: { revalidate: 120 },
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
    const response = await fetch(`${PRODUCTS_ENDPOINT}?makerId=${encodeURIComponent(makerId)}`, {
      next: { revalidate: 60 },
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
    // Fetch all videos and filter by userId (makerId)
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/videos?limit=50`, {
      next: { revalidate: 60 },
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

  const [maker, products, videos] = await Promise.all([
    fetchMaker(makerId),
    fetchMakerProducts(makerId),
    fetchMakerVideos(makerId),
  ]);

  if (!maker) {
    notFound();
  }

  return <MakerDetailClient locale={locale} maker={maker} products={products} videos={videos} />;
}

