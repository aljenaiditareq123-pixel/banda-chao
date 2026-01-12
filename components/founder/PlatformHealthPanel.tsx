'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getApiBaseUrl } from '@/lib/api-utils';
import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface StatusItem {
  label: string;
  status: 'online' | 'warning' | 'offline';
  lastChecked?: string;
}

/**
 * Platform Health Panel - Shows API, DB, AI service status
 * Luxury Gulf Founder Style
 */
export default function PlatformHealthPanel() {
  const { token } = useAuth();
  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPlatformHealth();
    // Check every 30 seconds
    const interval = setInterval(checkPlatformHealth, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const checkPlatformHealth = async () => {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const checks: StatusItem[] = [];

      // Check API endpoint
      try {
        const response = await fetch(`${apiBaseUrl}/founder/analytics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        checks.push({
          label: 'API Server',
          status: response.ok ? 'online' : 'warning',
          lastChecked: new Date().toLocaleTimeString('ar-SA'),
        });
      } catch (error) {
        checks.push({
          label: 'API Server',
          status: 'offline',
        });
      }

      // Check AI Service (Gemini) - via health endpoint
      try {
        const aiResponse = await fetch(`${apiBaseUrl}/ai/health`);
        const aiData = await aiResponse.json();
        checks.push({
          label: 'AI Service (Gemini)',
          status: aiData.status === 'ok' ? 'online' : 'warning',
          lastChecked: new Date().toLocaleTimeString('ar-SA'),
        });
      } catch (error) {
        checks.push({
          label: 'AI Service (Gemini)',
          status: 'offline',
        });
      }

      // Database status (assume OK if API works)
      checks.push({
        label: 'Database',
        status: checks[0]?.status === 'online' ? 'online' : 'warning',
        lastChecked: new Date().toLocaleTimeString('ar-SA'),
      });

      setStatuses(checks);
    } catch (error) {
      console.error('[PlatformHealth] Error checking health:', error);
      setStatuses([
        { label: 'API Server', status: 'offline' },
        { label: 'Database', status: 'warning' },
        { label: 'AI Service (Gemini)', status: 'offline' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: StatusItem['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
    }
  };

  const getStatusText = (status: StatusItem['status']) => {
    switch (status) {
      case 'online':
        return 'متصل';
      case 'warning':
        return 'تحذير';
      case 'offline':
        return 'غير متصل';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900 mb-1">صحة المنصة</h3>
        <p className="text-xs text-slate-500">حالة الخدمات الأساسية</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="sm" />
        </div>
      ) : (
        <div className="space-y-3">
          {statuses.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 rtl:flex-row-reverse"
            >
              <div className="flex items-center gap-3 rtl:flex-row-reverse">
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(item.status)} animate-pulse`}
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  {item.lastChecked && (
                    <p className="text-xs text-slate-500">
                      آخر فحص: {item.lastChecked}
                    </p>
                  )}
                </div>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  item.status === 'online'
                    ? 'bg-green-50 text-green-700'
                    : item.status === 'warning'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {getStatusText(item.status)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer note */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          يتم التحقق تلقائياً كل 30 ثانية
        </p>
      </div>
    </div>
  );
}

