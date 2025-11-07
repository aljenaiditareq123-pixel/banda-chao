import { Suspense } from 'react';
import HomePageClient from './page-client';

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">加载中...</p>
        </div>
      </div>
    }>
      <HomePageClient />
    </Suspense>
  );
}
