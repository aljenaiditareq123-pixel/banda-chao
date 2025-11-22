'use client';

import { ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import FounderSidebarNav from './FounderSidebarNav';
import AssistantNav from './AssistantNav';

interface FounderLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  showAssistantNav?: boolean;
  currentAssistantId?: string;
  title?: string;
  description?: string;
}

export default function FounderLayout({
  children,
  showSidebar = true,
  showAssistantNav = false,
  currentAssistantId,
  title,
  description,
}: FounderLayoutProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        {(title || description) && (
          <div className={cn('mb-8', isRTL && 'rtl-text-right')}>
            {title && (
              <h1 className={cn('text-3xl font-bold text-gray-900 mb-2', isRTL && 'rtl-text-right')}>
                {title}
              </h1>
            )}
            {description && (
              <p className={cn('text-gray-600 text-lg max-w-3xl', isRTL && 'rtl-text-right')}>
                {description}
              </p>
            )}
          </div>
        )}

        {/* Main Layout - RTL aware */}
        <div className={cn(
          'flex flex-col lg:flex-row gap-8',
          isRTL && 'rtl-flip-row'
        )}>
          {/* Sidebar */}
          {showSidebar && (
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-8">
                <FounderSidebarNav />
              </div>
            </aside>
          )}

          {/* Assistant Navigation */}
          {showAssistantNav && (
            <aside className="lg:w-64 flex-shrink-0">
              <AssistantNav currentAssistantId={currentAssistantId} className="sticky top-8" />
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

