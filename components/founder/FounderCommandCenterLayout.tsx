'use client';

import { ReactNode, useState, useEffect } from 'react';
import SidebarNavigation from './SidebarNavigation';
import RightSidebarPanel from './RightSidebarPanel';

interface FounderCommandCenterLayoutProps {
  children: ReactNode;
  currentPage?: string;
}

export default function FounderCommandCenterLayout({ 
  children, 
  currentPage = 'assistant' 
}: FounderCommandCenterLayoutProps) {
  const [pandaStatus, setPandaStatus] = useState<'online' | 'thinking' | 'offline'>('online');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNewSession = () => {
    // Clear current chat and start fresh
    if (typeof window !== 'undefined') {
      localStorage.removeItem('founder_panda_history');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Top Bar */}
      <header className="h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Left: Logo & Founder Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Banda Chao Mini Logo */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">BC</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Banda Chao
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Command Center
                </p>
              </div>
            </div>
            
            <div className="h-6 w-px bg-gray-300 dark:bg-slate-600" />
            
            {/* Founder Identity */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">TA</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Tariq AlJenaidi
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Founder & CEO
                </p>
              </div>
            </div>
          </div>

          {/* Center: Panda Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-full">
              <div className={`w-2 h-2 rounded-full ${
                pandaStatus === 'online' ? 'bg-green-500 animate-pulse' :
                pandaStatus === 'thinking' ? 'bg-yellow-500 animate-pulse' :
                'bg-gray-400'
              }`} />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                🐼 Panda {
                  pandaStatus === 'online' ? 'Online' :
                  pandaStatus === 'thinking' ? 'Thinking' :
                  'Offline'
                }
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              {currentTime}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewSession}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span className="hidden sm:inline">Start New Session</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Left Sidebar */}
        <aside className="w-60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-r border-gray-200 dark:border-slate-700 flex-shrink-0">
          <SidebarNavigation 
            currentPage={currentPage}
            onPandaStatusChange={setPandaStatus}
          />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-65 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-l border-gray-200 dark:border-slate-700 flex-shrink-0">
          <RightSidebarPanel 
            onNewSession={handleNewSession}
          />
        </aside>
      </div>

      {/* New Session Modal */}
      {isNewSessionModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Start New Session
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              This will clear your current conversation and start fresh with Founder Panda. 
              Make sure to save any important information first.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsNewSessionModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleNewSession();
                  setIsNewSessionModalOpen(false);
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
