'use client';

import dynamic from 'next/dynamic';

// Disable SSR for HomePageClient to prevent hydration mismatch (Error #310)
// This wrapper must be a Client Component because ssr: false is not allowed in Server Components
const HomePageClient = dynamic(
  () => import('@/components/home/HomePageClient'),
  { ssr: false }
);

interface HomePageClientWrapperProps {
  locale: string;
  featuredMakers: any[];
  featuredProducts: any[];
  featuredVideos: any[];
  featuredServices?: any[];
}

export default function HomePageClientWrapper(props: HomePageClientWrapperProps) {
  return <HomePageClient {...props} />;
}
