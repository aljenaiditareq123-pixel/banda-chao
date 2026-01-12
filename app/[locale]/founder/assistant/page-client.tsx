'use client';

import { Suspense } from 'react';
import FounderRoute from '@/components/FounderRoute';
import ModernFounderLayout from '@/components/founder/ModernFounderLayout';
import FounderErrorBoundary from '@/components/founder/FounderErrorBoundary';

/**
 * Localized Founder Assistant Page Client Component
 * 
 * Protected by FounderRoute wrapper which handles:
 * - Unauthenticated users → Redirects to /[locale]/login?redirect=/[locale]/founder/assistant
 * - Non-FOUNDER users → Redirects to /[locale] (home page)
 * - FOUNDER users → Allows access
 * 
 * Uses ModernFounderLayout which provides:
 * - Clean 3-column responsive layout (Assistants, Stats, Chat)
 * - RTL support for Arabic
 * - Mobile-friendly navigation
 * - Integration with backend AI endpoints
 * 
 * All data fetching and side effects are handled by client components.
 */
export default function FounderAssistantPageClient() {
  return (
    <FounderRoute locale="ar">
      <FounderErrorBoundary>
        {/* Login Success Redirect Marker - for TestSprite to detect successful login redirect */}
        {/* Hidden but present in DOM when user is logged in */}
        <div 
          id="login-success-redirect-marker" 
          style={{ display: 'none' }}
          aria-hidden="true"
        />
        
        <Suspense fallback={
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل مركز المؤسس...</p>
            </div>
          </div>
        }>
          <ModernFounderLayout initialAssistant="founder" />
        </Suspense>
      </FounderErrorBoundary>
    </FounderRoute>
  );
}
