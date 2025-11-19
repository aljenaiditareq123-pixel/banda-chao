import MakersPageClient from './page-client';
import { Maker } from '@/types';
import { normalizeMaker } from '@/lib/maker-utils';
import { getApiBaseUrl } from '@/lib/api-utils';
import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';

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

    const json = await fetchJsonWithRetry(url, {
      next: { revalidate: 120 },
      maxRetries: 2,
      retryDelay: 1000,
    });

    const items = Array.isArray(json.data) ? json.data : [];
    return items.map(normalizeMaker);
  } catch (error) {
    console.error('[MakersPage] Failed to load makers from backend:', error);
    return [];
  }
}

export default async function LocaleMakersPage({ params, searchParams }: LocaleMakersPageProps) {
  const { locale } = params;
  const search = searchParams?.search;
  const makers = await fetchAllMakers(search);

  return <MakersPageClient locale={locale} initialMakers={makers} initialSearch={search} />;
}

