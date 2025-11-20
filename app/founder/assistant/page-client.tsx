'use client';

import { Suspense } from 'react';
import FounderRoute from '@/components/FounderRoute';
import FounderLayout from '@/components/founder/FounderLayout';
import FounderAIAssistant from '@/components/FounderAIAssistant';

/**
 * Founder Assistant Page Client Component
 * 
 * Protected by FounderRoute wrapper which handles:
 * - Unauthenticated users → Redirects to /[locale]/login?redirect=/founder/assistant
 * - Non-FOUNDER users → Redirects to /[locale] (home page)
 * - FOUNDER users → Allows access
 * 
 * All data fetching and side effects are handled by client components.
 */
export default function FounderAssistantPageClient() {
  return (
    <FounderRoute locale="en">
      <FounderLayout
        title="مركز مساعدي المؤسس"
        description="يمكنك التبديل بين المساعدين الستة المتخصصين للحصول على استشارات في القرارات الاستراتيجية، التقنية، الأمان، التجارة، المحتوى، واللوجستيات."
        showSidebar={false}
      >
        {/* Login Success Redirect Marker - for TestSprite to detect successful login redirect */}
        {/* Hidden but present in DOM when user is logged in */}
        <div 
          id="login-success-redirect-marker" 
          style={{ display: 'none' }}
          aria-hidden="true"
        />
        
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        }>
          <FounderAIAssistant />
        </Suspense>
      </FounderLayout>
    </FounderRoute>
  );
}

