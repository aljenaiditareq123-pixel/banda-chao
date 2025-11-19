'use client';

import { Suspense } from 'react';
import FounderRoute from '@/components/FounderRoute';
import FounderLayout from '@/components/founder/FounderLayout';
import FounderAIAssistant from '@/components/FounderAIAssistant';

export const dynamic = 'force-dynamic';

/**
 * Founder Brain Page - Founder Panda Assistant
 * 
 * Protected by:
 * - Server-side: app/founder/layout.tsx (requireFounder())
 * - Client-side: FounderRoute wrapper
 */
export default function FounderBrainPage() {
  return (
    <FounderRoute locale="en">
    <FounderLayout
      title="الباندا المؤسس"
      description="يرسم القرارات المصيرية ويحوّل الرؤية إلى خطط تنفيذية واضحة."
      showSidebar={false}
      showAssistantNav={true}
      currentAssistantId="founder"
    >
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      }>
        <div className="bg-white rounded-2xl border-2 border-primary-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">🐼</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">الباندا المؤسس</h2>
              <p className="text-gray-600">يمكنك استخدام هذا المساعد من مركز المساعدين الرئيسي</p>
            </div>
          </div>
          <a
            href="/founder/assistant"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <span>🚀</span>
            <span>اذهب إلى مركز المساعدين</span>
          </a>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <FounderAIAssistant initialAssistantId="founder" />
        </div>
      </Suspense>
    </FounderLayout>
    </FounderRoute>
  );
}
