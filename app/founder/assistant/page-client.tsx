'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import FounderRoute from '@/components/FounderRoute';
import FounderAssistantLayout from '@/components/founder/FounderAssistantLayout';
import FounderChatPanel from '@/components/founder/FounderChatPanel';
import ModeSelector from '@/components/founder/ModeSelector';

type FounderOperatingMode = 
  | 'STRATEGY_MODE'
  | 'PRODUCT_MODE' 
  | 'TECH_MODE'
  | 'MARKETING_MODE'
  | 'CHINA_MODE';

/**
 * Founder Assistant Page Client Component
 * 
 * Protected by FounderRoute wrapper which handles:
 * - Unauthenticated users → Redirects to /[locale]/login?redirect=/founder/assistant
 * - Non-FOUNDER users → Redirects to /[locale] (home page)
 * - FOUNDER users → Allows access
 * 
 * Uses FounderAssistantLayout which provides:
 * - Top bar with founder identity
 * - Left sidebar with sessions history
 * - Main chat panel area
 * 
 * All data fetching and side effects are handled by client components.
 */
function FounderAssistantContent() {
  const searchParams = useSearchParams();
  const pandaParam = searchParams.get('panda');
  const assistantId = (pandaParam || 'founder') as string;
  
  const [currentMode, setCurrentMode] = useState<FounderOperatingMode>('STRATEGY_MODE');

  // Map assistant IDs to names and roles
  const assistantInfo: Record<string, { name: string; role: string }> = {
    founder: { name: 'الباندا المؤسس', role: 'مستشار استراتيجي' },
    tech: { name: 'الباندا التقني', role: 'مستشار تقني' },
    guard: { name: 'الباندا الحارس', role: 'مستشار أمني' },
    commerce: { name: 'باندا التجارة', role: 'مستشار تجاري' },
    content: { name: 'باندا المحتوى', role: 'مستشار محتوى' },
    logistics: { name: 'باندا اللوجستيات', role: 'مستشار لوجستي' },
  };

  const info = assistantInfo[assistantId] || assistantInfo.founder;

  return (
    <FounderAssistantLayout
      assistantId={assistantId}
      assistantName={info.name}
      assistantRole={info.role}
    >
      <div className="h-full flex flex-col p-6">
        {/* Mode Selector (only for founder) */}
        {assistantId === 'founder' && (
          <div className="mb-6">
            <ModeSelector
              currentMode={currentMode}
              onModeChange={setCurrentMode}
            />
          </div>
        )}
        
        {/* Chat Panel */}
        <div className="flex-1 min-h-0">
          <FounderChatPanel 
            assistantId={assistantId}
            currentMode={currentMode}
          />
        </div>
      </div>
    </FounderAssistantLayout>
  );
}

export default function FounderAssistantPageClient() {
  return (
    <FounderRoute locale="ar">
      {/* Login Success Redirect Marker - for TestSprite to detect successful login redirect */}
      <div 
        id="login-success-redirect-marker" 
        style={{ display: 'none' }}
        aria-hidden="true"
      />
      
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      }>
        <FounderAssistantContent />
      </Suspense>
    </FounderRoute>
  );
}
