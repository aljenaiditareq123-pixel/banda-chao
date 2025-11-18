'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import FounderLayout from '@/components/founder/FounderLayout';
import FounderAIAssistant from '@/components/FounderAIAssistant';

export const dynamic = 'force-dynamic';

export default function FounderAssistantPage() {
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
  );
}

