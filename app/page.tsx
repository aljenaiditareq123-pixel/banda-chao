import HomePageClient from '@/components/home/HomePageClient';
import { normalizeProduct } from '@/lib/product-utils';
import { normalizeMaker } from '@/lib/maker-utils';
import { getApiBaseUrl } from '@/lib/api-utils';
import { Product, Maker, Video } from '@/types';
import { redirect } from 'next/navigation';

import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';

async function fetchProducts(): Promise<Product[]> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const json = await fetchJsonWithRetry(`${apiBaseUrl}/products?limit=8`, {
      next: { revalidate: 300 }, // 5 minutes cache
      maxRetries: 1,
      retryDelay: 1000,
    });

    const items = Array.isArray(json.data) ? json.data : [];
    return items.slice(0, 8).map(normalizeProduct);
  } catch { return []; }
}

async function fetchMakers(): Promise<Maker[]> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const json = await fetchJsonWithRetry(`${apiBaseUrl}/makers?limit=6`, {
      next: { revalidate: 600 }, // 10 minutes cache
      maxRetries: 1,
      retryDelay: 1000,
    });
    
    const items = Array.isArray(json.data) ? json.data : [];
    return items.slice(0, 6).map(normalizeMaker);
  } catch { return []; }
}

async function fetchVideos(): Promise<Video[]> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const json = await fetchJsonWithRetry(`${apiBaseUrl}/videos?limit=6`, {
      next: { revalidate: 600 }, // 10 minutes cache
      maxRetries: 1,
      retryDelay: 1000,
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
  } catch { return []; }
}

export default async function Page({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  if (searchParams?.['no-redirect'] === 'true') {
    // Stagger requests to avoid overwhelming backend (aligned with new pattern)
    const products = await fetchProducts();
    await new Promise(resolve => setTimeout(resolve, 100));
    const makers = await fetchMakers();
    await new Promise(resolve => setTimeout(resolve, 100));
    const videos = await fetchVideos();
    
    return <main className="p-6"><HomePageClient locale="en" products={products} makers={makers} videos={videos} /></main>;
  }

  redirect('/en');
}
