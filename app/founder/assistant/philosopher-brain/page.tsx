'use client';

import { Suspense } from 'react';
import FounderRoute from '@/components/FounderRoute';
import FounderLayout from '@/components/founder/FounderLayout';
import FounderAIAssistant from '@/components/FounderAIAssistant';

export const dynamic = 'force-dynamic';

/**
 * Philosopher Brain Page - Philosopher Architect Panda Assistant
 * 
 * Protected by FounderRoute wrapper (client-side) and app/founder/layout.tsx (server-side)
 */
export default function PhilosopherBrainPage() {
  return (
    <FounderRoute locale="en">
    <FounderLayout
      title="الباندا الفيلسوف المعماري"
      description="مراقب معماري ومشرف على جميع الباندات. يفكر في الصورة الكبيرة والتنسيق بين الأنظمة."
      showSidebar={false}
      showAssistantNav={true}
      currentAssistantId="philosopher"
    >
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      }>
        <div className="bg-gradient-to-l from-indigo-700 via-purple-600 to-indigo-500 rounded-2xl border-2 border-indigo-200 p-6 mb-6 text-white">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">🎓</span>
            <div>
              <h2 className="text-2xl font-bold">الباندا الفيلسوف المعماري</h2>
              <p className="text-indigo-100">العقل المعماري الأعلى لمنصة Banda Chao</p>
            </div>
          </div>
          <p className="text-base text-white/90 leading-relaxed">
            هذا الباندا هو العقل المعماري الأعلى لمنصة Banda Chao. يراجع قرارات الباندات الأخرى، 
            يقترح مسارات التطوير طويلة الأمد، ويساعدك كمؤسس على رؤية &quot;الصورة الكبيرة&quot; للمشروع.
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <FounderAIAssistant initialAssistantId="philosopher" />
        </div>
      </Suspense>
    </FounderLayout>
    </FounderRoute>
  );
}

