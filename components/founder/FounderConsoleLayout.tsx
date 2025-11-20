'use client';

import { ReactNode } from 'react';
import FounderSidebar from './FounderSidebar';
import FounderChatPanel from './FounderChatPanel';
import AssistantNav from './AssistantNav';

interface FounderConsoleLayoutProps {
  children?: ReactNode;
  /**
   * Selected assistant ID for chat panel
   */
  selectedAssistantId?: string;
  /**
   * Callback when assistant is selected
   */
  onAssistantSelect?: (assistantId: string) => void;
}

/**
 * Founder Console Layout - Unified three-column layout
 * 
 * Layout:
 * - Left (col-span-3): Sidebar with stats and quick links
 * - Center (col-span-6): Chat panel with selected assistant
 * - Right (col-span-3): Assistants list
 * 
 * Responsive:
 * - Mobile: Single column (sidebar → assistants → chat)
 * - Tablet: Two columns
 * - Desktop: Three columns
 */
export default function FounderConsoleLayout({
  children,
  selectedAssistantId,
  onAssistantSelect,
}: FounderConsoleLayoutProps) {
  const handleAssistantSelect = (assistantId: string) => {
    if (onAssistantSelect) {
      onAssistantSelect(assistantId);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Three-column grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar: Stats and Quick Links (col-span-3 on desktop) */}
          <aside className="lg:col-span-3 order-1 lg:order-1">
            <FounderSidebar />
          </aside>

          {/* Center: Chat Panel (col-span-6 on desktop) */}
          <div className="lg:col-span-6 order-3 lg:order-2">
            {selectedAssistantId ? (
              <FounderChatPanel assistantId={selectedAssistantId} />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 h-full min-h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl mb-4 block" aria-hidden="true">🐼</span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    مركز القيادة للمؤسس
                  </h2>
                  <p className="text-gray-600 mb-6">
                    اختر أحد المساعدين من القائمة على اليمين لبدء المحادثة
                  </p>
                  <div className="inline-block bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4">
                    <p className="text-sm text-primary-700">
                      💡 نصيحة: يمكنك التبديل بين المساعدين في أي وقت
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Assistants List (col-span-3 on desktop) */}
          <aside className="lg:col-span-3 order-2 lg:order-3">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  مساعدوك الستة
                </h2>
                <p className="text-sm text-gray-600">
                  اختر مساعداً للبدء
                </p>
              </div>
              <AssistantNav 
                currentAssistantId={selectedAssistantId}
                onAssistantSelect={handleAssistantSelect}
              />
            </div>
          </aside>
        </div>

        {/* Additional children if provided */}
        {children && (
          <div className="mt-8">
            {children}
          </div>
        )}
      </div>
    </main>
  );
}

