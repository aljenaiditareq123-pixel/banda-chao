'use client';

import { useState, useEffect } from 'react';
import FounderAssistantsSidebar from './FounderAssistantsSidebar';
import FounderDashboardStats from './FounderDashboardStats';
import FounderChatPanel from './FounderChatPanel';
import { type ModernFounderLayoutProps } from '@/types/founder';

export default function ModernFounderLayout({ 
  initialAssistant = 'founder' 
}: ModernFounderLayoutProps) {
  const [selectedAssistant, setSelectedAssistant] = useState(initialAssistant);
  const [isMobile, setIsMobile] = useState(false);
  const [activePanel, setActivePanel] = useState<'assistants' | 'stats' | 'chat'>('chat');

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAssistantSelect = (assistantId: string) => {
    setSelectedAssistant(assistantId);
    if (isMobile) {
      setActivePanel('chat');
    }
  };

  // Mobile Navigation
  const MobileNavigation = () => (
    <div className="lg:hidden bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-center gap-1">
        {[
          { id: 'assistants', label: 'Assistants', icon: '🐼' },
          { id: 'stats', label: 'Stats', icon: '📊' },
          { id: 'chat', label: 'Chat', icon: '💬' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePanel(tab.id as any)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
              activePanel === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* RTL-aware grid layout */}
          <div className="grid gap-6 lg:grid-cols-[280px,1fr,400px] h-[calc(100vh-4rem)] rtl:lg:grid-cols-[400px,1fr,280px]">
            {/* Column 1: Assistants Sidebar (right in RTL) */}
            <div className="h-full lg:order-1 rtl:lg:order-3">
              <FounderAssistantsSidebar
                selectedAssistant={selectedAssistant}
                onAssistantSelect={handleAssistantSelect}
              />
            </div>

            {/* Column 2: Dashboard Stats (center) */}
            <div className="h-full overflow-y-auto lg:order-2 rtl:lg:order-2">
              <FounderDashboardStats />
            </div>

            {/* Column 3: AI Chat Panel (left in RTL) */}
            <div className="h-full lg:order-3 rtl:lg:order-1">
              <FounderChatPanel
                assistantId={selectedAssistant}
                currentMode="STRATEGY_MODE"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen flex flex-col">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🐼</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Banda Chao</h1>
                <p className="text-xs text-gray-600">مركز القيادة</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Founder Console</p>
              <p className="text-sm font-medium text-gray-900">Tariq AlJenaidi</p>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 p-4 overflow-hidden">
          {activePanel === 'assistants' && (
            <div className="h-full">
              <FounderAssistantsSidebar
                selectedAssistant={selectedAssistant}
                onAssistantSelect={handleAssistantSelect}
              />
            </div>
          )}
          
          {activePanel === 'stats' && (
            <div className="h-full overflow-y-auto">
              <FounderDashboardStats />
            </div>
          )}
          
          {activePanel === 'chat' && (
            <div className="h-full">
              <FounderChatPanel
                assistantId={selectedAssistant}
                currentMode="STRATEGY_MODE"
              />
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation />
      </div>
    </div>
  );
}
