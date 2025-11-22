import { Suspense } from 'react';
import FounderRoute from '@/components/FounderRoute';
import FounderLayout from '@/components/founder/FounderLayout';
import FounderModerationClient from './page-client';

export const dynamic = 'force-dynamic';

/**
 * Founder Moderation Page
 * 
 * Protected by FounderRoute wrapper (client-side) and app/founder/layout.tsx (server-side)
 */
export default function FounderModerationPage() {
  return (
    <FounderRoute locale="ar">
      <FounderLayout
        title="لوحة الإشراف"
        description="إدارة التقارير والإشراف على المحتوى"
        showSidebar={true}
        showAssistantNav={false}
      >
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        }>
          <FounderModerationClient />
        </Suspense>
      </FounderLayout>
    </FounderRoute>
  );
}

