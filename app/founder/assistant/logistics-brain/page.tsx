'use client';

import { Suspense } from 'react';
import FounderRoute from '@/components/FounderRoute';
import FounderLayout from '@/components/founder/FounderLayout';
import FounderAIAssistant from '@/components/FounderAIAssistant';

export const dynamic = 'force-dynamic';

/**
 * Logistics Brain Page - Logistics Panda Assistant
 * 
 * Protected by FounderRoute wrapper (client-side) and app/founder/layout.tsx (server-side)
 */
export default function LogisticsBrainPage() {
  return (
    <FounderRoute locale="en">
    <FounderLayout
      title="باندا اللوجستيات"
      description="يضبط المخزون، التوصيل، وسلاسل الإمداد لضمان تجربة بلا تأخير."
      showSidebar={false}
      showAssistantNav={true}
      currentAssistantId="logistics"
    >
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      }>
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">📦</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">باندا اللوجستيات</h2>
              <p className="text-gray-600">يمكنك استخدام هذا المساعد من مركز المساعدين الرئيسي</p>
            </div>
          </div>
          <a
            href="/founder/assistant"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
          >
            <span>🚀</span>
            <span>اذهب إلى مركز المساعدين</span>
          </a>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <FounderAIAssistant initialAssistantId="logistics" />
        </div>
      </Suspense>
    </FounderLayout>
    </FounderRoute>
  );
}
