'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import FounderLayout from '@/components/founder/FounderLayout';
import FounderAIAssistant from '@/components/FounderAIAssistant';

export const dynamic = 'force-dynamic';

export default function LogisticsBrainPage() {
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
      title="باندا اللوجستيات"
      description="يضبط المخزون، التوصيل، وسلاسل الإمداد لضمان تجربة بلا تأخير."
      showSidebar={false}
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
  );
}
