import HomePageClient from '@/components/home/HomePageClient';
import { BACKEND_BASE_URL, normalizeProduct } from '@/lib/product-utils';
import { normalizeMaker } from '@/lib/maker-utils';
import { Product, Maker, Video } from '@/types';
import { redirect } from 'next/navigation';

async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/products`, { next: { revalidate: 60 } });

    if (!response.ok) throw new Error('Failed to fetch products');

    const json = await response.json();
    const items = Array.isArray(json.data) ? json.data : [];
    return items.slice(0, 8).map(normalizeProduct);
  } catch { return []; }
}

async function fetchMakers(): Promise<Maker[]> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/makers`, { next: { revalidate: 120 } });
    if (!response.ok) throw new Error('Failed to fetch makers');
    const json = await response.json();
    const items = Array.isArray(json.data) ? json.data : [];
    return items.slice(0, 6).map(normalizeMaker);
  } catch { return []; }
}

async function fetchVideos(): Promise<Video[]> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/videos?limit=6`, { next: { revalidate: 120 } });
    if (!response.ok) throw new Error('Failed to fetch videos');
    const json = await response.json();
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
    const [products, makers, videos] = await Promise.all([
      fetchProducts(),
      fetchMakers(),
      fetchVideos(),
    ]);
    return <main className="p-6"><HomePageClient locale="en" products={products} makers={makers} videos={videos} /></main>;
  }

  redirect('/en');
}
