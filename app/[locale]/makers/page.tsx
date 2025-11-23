import MakersPageClient from './page-client';
import { Maker } from '@/types';
import { normalizeMaker } from '@/lib/maker-utils';
import { getApiBaseUrl } from '@/lib/api-utils';
import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';
import type { Metadata } from 'next';

interface LocaleMakersPageProps {
  params: {
    locale: string;
  };
  searchParams?: {
    search?: string;
  };
}

export async function generateMetadata({ params }: LocaleMakersPageProps): Promise<Metadata> {
  const { locale } = params;
  const validLocale = (locale === 'zh' || locale === 'ar' || locale === 'en') ? locale : 'zh';
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://banda-chao-frontend.onrender.com';

  const titles = {
    zh: '手作人专区 — Banda Chao',
    ar: 'Banda Chao - الحرفيون',
    en: 'Banda Chao - Makers',
  };

  return {
    title: titles[validLocale],
    alternates: {
      canonical: `${baseUrl}/${validLocale}/makers`,
    },
  };
}

async function fetchAllMakers(search?: string): Promise<Maker[]> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const url = search
      ? `${apiBaseUrl}/makers?search=${encodeURIComponent(search)}&limit=100`
      : `${apiBaseUrl}/makers?limit=100`;

    const json = await fetchJsonWithRetry(url, {
      next: { revalidate: 600 }, // 10 minutes cache
      maxRetries: 2,
      retryDelay: 1000,
    });

    // Backend returns array directly (not wrapped in { data: [...] })
    const items = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
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

