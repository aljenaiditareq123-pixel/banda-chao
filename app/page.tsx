import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import HomePageClient to ensure it loads as a client component
// Using ssr: false to force client-side rendering only
const HomePageClient = dynamic(() => import('./page-client'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">加载中...</p>
        <p className="text-gray-500 text-sm mt-2">正在加载页面内容...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <HomePageClient />;
}
