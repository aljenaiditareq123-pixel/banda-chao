'use client';

import { Suspense } from 'react';
import LongVideosPageClient from './page-client';

export default function LongVideosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    }>
      <LongVideosPageClient />
    </Suspense>
  );
}
