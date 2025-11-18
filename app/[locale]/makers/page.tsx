import MakersPageClient from './page-client';
import { Maker } from '@/types';
import { normalizeMaker } from '@/lib/maker-utils';

interface LocaleMakersPageProps {
  params: {
    locale: string;
  };
  searchParams?: {
    search?: string;
  };
}

async function fetchAllMakers(search?: string): Promise<Maker[]> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const url = search
      ? `${apiBaseUrl}/makers?search=${encodeURIComponent(search)}`
      : `${apiBaseUrl}/makers`;

    const response = await fetch(url, {
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch makers: ${response.status}`);
    }

    const json = await response.json();
    const items = Array.isArray(json.data) ? json.data : [];
    return items.map(normalizeMaker);
  } catch (error) {
    console.error('[MakersPage] Failed to load makers from backend:', error);
    return [];
  }
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

export default async function LocaleMakersPage({ params, searchParams }: LocaleMakersPageProps) {
  const { locale } = params;
  const search = searchParams?.search;
  const makers = await fetchAllMakers(search);

  return <MakersPageClient locale={locale} initialMakers={makers} initialSearch={search} />;
}

