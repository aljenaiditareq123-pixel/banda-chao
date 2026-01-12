import { Suspense } from 'react';
import FounderRoute from '@/components/FounderRoute';
import FounderLayout from '@/components/founder/FounderLayout';
import FounderAnalyticsClient from './page-client';

export const dynamic = 'force-dynamic';

/**
 * Founder Analytics Page
 * 
 * Protected by FounderRoute wrapper (client-side) and app/founder/layout.tsx (server-side)
 */
export default function FounderAnalyticsPage() {
  return (
    <FounderRoute locale="ar">
      <FounderLayout
        title="لوحة التحليلات"
        description="إحصائيات وإحصاءات شاملة عن المنصة"
        showSidebar={true}
        showAssistantNav={false}
      >
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        }>
          <FounderAnalyticsClient />
        </Suspense>
      </FounderLayout>
    </FounderRoute>
  );
}

