'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SessionList from './SessionList';
import DocumentList from './DocumentList';

interface SidebarNavigationProps {
  currentPage: string;
  onPandaStatusChange: (status: 'online' | 'thinking' | 'offline') => void;
}

export default function SidebarNavigation({ 
  currentPage, 
  onPandaStatusChange 
}: SidebarNavigationProps) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<'chat' | 'strategy' | 'sessions' | 'documents' | 'settings'>('chat');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Navigation items
  const navItems = [
    {
      id: 'chat',
      label: 'Panda Chat',
      icon: '🐼',
      href: '/ar/founder/assistant',
      description: 'AI Assistant Chat'
    },
    {
      id: 'strategy',
      label: 'Strategy & KPIs',
      icon: '📊',
      href: '/ar/founder/analytics',
      description: 'Strategic Overview'
    },
    {
      id: 'sessions',
      label: 'Sessions',
      icon: '📚',
      href: '/ar/founder/sessions',
      description: 'Saved Conversations'
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: '📄',
      href: '/ar/founder/documents',
      description: 'Core Documents'
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: '⚙️',
      href: '/ar/founder/settings',
      description: 'Configuration'
    }
  ];

  // Set active section based on current path
  useEffect(() => {
    if (pathname?.includes('/assistant')) setActiveSection('chat');
    else if (pathname?.includes('/analytics')) setActiveSection('strategy');
    else if (pathname?.includes('/sessions')) setActiveSection('sessions');
    else if (pathname?.includes('/documents')) setActiveSection('documents');
    else if (pathname?.includes('/settings')) setActiveSection('settings');
    else setActiveSection('chat');
  }, [pathname]);

  // Simulate panda status changes
  useEffect(() => {
    const interval = setInterval(() => {
      const statuses: ('online' | 'thinking' | 'offline')[] = ['online', 'thinking'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      onPandaStatusChange(randomStatus);
    }, 5000);

    return () => clearInterval(interval);
  }, [onPandaStatusChange]);

  return (
    <div className="h-full flex flex-col">
      {/* Panda Avatar Section */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex flex-col items-center text-center">
          {/* Panda Avatar with Glow */}
          <div className="relative mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">🐼</span>
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full blur-md opacity-30 animate-pulse" />
            </div>
            {/* Status Indicator */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
          </div>
          
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            Founder Panda v2.0
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Your Strategic AI Assistant
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 dark:text-blue-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
              }`}
              onClick={() => setActiveSection(item.id as any)}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  isActive ? 'text-blue-700 dark:text-blue-300' : ''
                }`}>
                  {item.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {item.description}
                </p>
              </div>
              {isActive && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Dynamic Content Based on Active Section */}
      <div className="border-t border-gray-200 dark:border-slate-700">
        {activeSection === 'sessions' && (
          <div className="p-4">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
              Recent Sessions
            </h4>
            <SessionList limit={3} compact={true} />
          </div>
        )}
        
        {activeSection === 'documents' && (
          <div className="p-4">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
              Core Documents
            </h4>
            <DocumentList compact={true} />
          </div>
        )}
        
        {activeSection === 'chat' && (
          <div className="p-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-3">
              <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                Quick Tip
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Use slash commands like <code className="bg-white dark:bg-slate-800 px-1 rounded">/plan</code> for instant structured outputs.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Banda Chao Command Center
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            v2.0 • UAE Neutral Platform
          </p>
        </div>
      </div>
    </div>
  );
}
