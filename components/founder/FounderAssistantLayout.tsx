'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import SessionList from './SessionList';
import { useAuth } from '@/contexts/AuthContext';
import FounderTopBar from './FounderTopBar';

interface FounderAssistantLayoutProps {
  children: ReactNode;
  assistantId?: string;
  assistantName?: string;
  assistantRole?: string;
}

/**
 * Founder Assistant Layout - War Room Style
 * 
 * Layout:
 * - Top Bar: Founder identity + status
 * - Left Sidebar: Sessions history (25-30% width)
 * - Main Content: Chat panel (70-75% width)
 * 
 * Luxury Gulf Founder Style
 */
export default function FounderAssistantLayout({
  children,
  assistantId = 'founder',
  assistantName = 'الباندا المؤسس',
  assistantRole = 'مستشار استراتيجي',
}: FounderAssistantLayoutProps) {
  const { user } = useAuth();
  const [showSessions, setShowSessions] = useState(true);

  const handleNewSession = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('founder_panda_history');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <FounderTopBar />

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar: Sessions List */}
        <aside
          className={`
            ${showSessions ? 'w-80' : 'w-0'} 
            bg-slate-900 border-r border-amber-500/20 
            transition-all duration-300 overflow-hidden
            flex flex-col
          `}
        >
          <div className="p-6 border-b border-amber-500/20">
            <div className="flex items-center justify-between mb-4 rtl:flex-row-reverse">
              <h2 className="text-lg font-bold text-slate-50">الجلسات السابقة</h2>
              <button
                onClick={() => setShowSessions(!showSessions)}
                className="text-slate-400 hover:text-slate-50 transition-colors"
              >
                <span className="text-xl">{showSessions ? '←' : '→'}</span>
              </button>
            </div>
            <button
              onClick={handleNewSession}
              className="w-full px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 rounded-xl text-sm font-medium transition-all duration-200"
            >
              + جلسة جديدة
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <SessionList limit={10} compact={false} />
          </div>
        </aside>

        {/* Main Content: Chat Panel */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Assistant Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between rtl:flex-row-reverse">
              <div className="flex items-center gap-3 rtl:flex-row-reverse">
                <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center border border-amber-500/40">
                  <span className="text-amber-400 text-lg">🐼</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{assistantName}</h2>
                  <p className="text-xs text-amber-600 font-medium">{assistantRole}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-slate-600">متصل</span>
              </div>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

