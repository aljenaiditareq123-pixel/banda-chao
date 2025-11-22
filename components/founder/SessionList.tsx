'use client';

import { useState, useEffect } from 'react';
import { getApiBaseUrl } from '@/lib/api-utils';
import { apiCall } from '@/lib/api-error-handler';

interface FounderSession {
  id: string;
  title: string;
  summary: string;
  tasks: string[] | null;
  mode: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SessionListProps {
  limit?: number;
  compact?: boolean;
}

export default function SessionList({ limit = 5, compact = false }: SessionListProps) {
  const [sessions, setSessions] = useState<FounderSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sessions from API
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        const apiBaseUrl = getApiBaseUrl();
        const data = await apiCall(`${apiBaseUrl}/founder/sessions?limit=${limit}`, {
          method: 'GET',
        });
        
        if (data.success) {
          setSessions(data.data.sessions);
        } else {
          setError('Failed to load sessions');
        }
      } catch (err) {
        console.warn('[SessionList] Failed to load sessions:', err);
        setError('Unable to load sessions');
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [limit]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getModeIcon = (mode: string | null) => {
    switch (mode) {
      case 'STRATEGY_MODE':
        return '🎯';
      case 'PRODUCT_MODE':
        return '🛠️';
      case 'TECH_MODE':
        return '💻';
      case 'MARKETING_MODE':
        return '📢';
      case 'CHINA_MODE':
        return '🇨🇳';
      default:
        return '💬';
    }
  };

  const getModeLabel = (mode: string | null) => {
    switch (mode) {
      case 'STRATEGY_MODE':
        return 'Strategy';
      case 'PRODUCT_MODE':
        return 'Product';
      case 'TECH_MODE':
        return 'Tech';
      case 'MARKETING_MODE':
        return 'Marketing';
      case 'CHINA_MODE':
        return 'China';
      default:
        return 'General';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-slate-700 rounded-lg p-3">
              <div className="h-4 bg-gray-300 dark:bg-slate-600 rounded mb-2" />
              <div className="h-3 bg-gray-300 dark:bg-slate-600 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-6">
        <span className="text-3xl mb-2 block">📚</span>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No sessions saved yet
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Start chatting to create sessions
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-${compact ? '2' : '3'}`}>
      {sessions.map((session) => (
        <div
          key={session.id}
          className={`bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 cursor-pointer group ${
            compact ? 'p-2' : 'p-3'
          }`}
          onClick={() => {
            // In a real app, this would load the session
            console.log('Load session:', session.id);
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={compact ? 'text-sm' : 'text-base'}>
                {getModeIcon(session.mode)}
              </span>
              <h4 className={`font-medium text-gray-900 dark:text-white truncate ${
                compact ? 'text-xs' : 'text-sm'
              }`}>
                {session.title}
              </h4>
            </div>
            {session.mode && (
              <span className={`px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full font-medium ${
                compact ? 'text-xs' : 'text-xs'
              }`}>
                {getModeLabel(session.mode)}
              </span>
            )}
          </div>
          
          <p className={`text-gray-600 dark:text-gray-300 mb-2 ${
            compact ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'
          }`}>
            {session.summary}
          </p>
          
          <div className="flex items-center justify-between">
            <span className={`text-gray-400 dark:text-gray-500 ${
              compact ? 'text-xs' : 'text-xs'
            }`}>
              {formatDate(session.createdAt)}
            </span>
            {session.tasks && session.tasks.length > 0 && (
              <span className={`text-blue-600 dark:text-blue-400 font-medium ${
                compact ? 'text-xs' : 'text-xs'
              }`}>
                {session.tasks.length} tasks
              </span>
            )}
          </div>
          
          {/* Hover indicator */}
          <div className="w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      ))}
    </div>
  );
}
