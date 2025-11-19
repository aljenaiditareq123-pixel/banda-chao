'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import FounderLayout from '@/components/founder/FounderLayout';
import FounderAIAssistant from '@/components/FounderAIAssistant';

export const dynamic = 'force-dynamic';

export default function PhilosopherBrainPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'FOUNDER') {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'FOUNDER') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
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
  );
}

