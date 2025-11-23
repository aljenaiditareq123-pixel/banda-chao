'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

/**
 * Founder Top Bar - Luxury Gulf Founder Style
 * 
 * Displays:
 * - Founder identity (name, role)
 * - Current time
 * - Platform status
 * - Quick actions
 */
export default function FounderTopBar() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }));
      setCurrentDate(now.toLocaleDateString('ar-SA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const founderName = user?.name || 'طارق الجنيدي';
  const founderRole = 'المؤسس والرئيس التنفيذي';
  const initials = founderName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Left: Logo & Founder Identity */}
          <div className="flex items-center gap-4">
            {/* Banda Chao Logo */}
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-amber-500/40">
              <span className="text-white text-sm font-bold">BC</span>
            </div>
            
            <div className="h-6 w-px bg-slate-200" />
            
            {/* Founder Identity */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center border border-amber-500/40">
                <span className="text-amber-400 text-xs font-bold">{initials}</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-900">
                  {founderName}
                </p>
                <p className="text-xs text-slate-500">
                  {founderRole}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Title with Gold Accent */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="h-px w-8 bg-amber-400/40" />
            <h1 className="text-lg font-bold text-slate-900">
              لوحة تحكم المؤسس
            </h1>
            <div className="h-px w-8 bg-amber-400/40" />
          </div>

          {/* Right: Time & Status */}
          <div className="flex items-center gap-4">
            {/* Current Date & Time */}
            <div className="hidden sm:block text-right rtl:text-left">
              <p className="text-xs text-slate-500 mb-0.5">{currentDate}</p>
              <p className="text-sm font-mono font-semibold text-slate-900">
                {currentTime}
              </p>
            </div>
            
            {/* Platform Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-slate-700">
                جميع الأنظمة متصلة
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

