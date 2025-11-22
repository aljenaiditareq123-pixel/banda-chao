'use client';

import { Suspense, useState } from 'react';
import FounderRoute from '@/components/FounderRoute';
import FounderCommandCenterLayout from '@/components/founder/FounderCommandCenterLayout';
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
 * Uses FounderConsoleLayout which provides:
 * - Three-column layout (Sidebar, Chat Panel, Assistants List)
 * - Chat interface with FounderChatPanel
 * - Integration with backend AI endpoint /api/v1/ai/assistant
 * 
 * All data fetching and side effects are handled by client components.
 */
export default function FounderAssistantPageClient() {
  const [currentMode, setCurrentMode] = useState<FounderOperatingMode>('STRATEGY_MODE');

  return (
    <FounderRoute locale="ar">
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
        <FounderCommandCenterLayout currentPage="assistant">
          <div className="h-full flex flex-col">
            {/* Mode Selector */}
            <div className="mb-6">
              <ModeSelector
                currentMode={currentMode}
                onModeChange={setCurrentMode}
              />
            </div>
            
            {/* Main Chat Interface */}
            <div className="flex-1 min-h-0">
              <FounderChatPanel 
                assistantId="founder"
                currentMode={currentMode}
              />
            </div>
          </div>
        </FounderCommandCenterLayout>
      </Suspense>
    </FounderRoute>
  );
}

