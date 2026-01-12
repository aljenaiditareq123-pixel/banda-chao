'use client';

import { useState, useEffect } from 'react';
import { moderationAPI } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import Button from '@/components/Button';

interface Report {
  id: string;
  userId: string;
  targetId: string;
  targetType: string;
  reason: string;
  resolved: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    profilePicture: string | null;
  };
}

export default function FounderModerationClient() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<'all' | 'resolved' | 'unresolved'>('unresolved');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadReports();
  }, [filter, targetTypeFilter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (filter === 'resolved') {
        params.resolved = true;
      } else if (filter === 'unresolved') {
        params.resolved = false;
      }
      if (targetTypeFilter !== 'all') {
        params.targetType = targetTypeFilter;
      }
      const response = await moderationAPI.getReports(params);
      setReports(response.data?.data || []);
    } catch (err: any) {
      console.error('[Moderation] Failed to load reports:', err);
      setError(err.response?.data?.error || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId: string, resolved: boolean) => {
    try {
      await moderationAPI.resolveReport(reportId, resolved);
      await loadReports(); // Reload reports
    } catch (err: any) {
      console.error('[Moderation] Failed to resolve report:', err);
      alert(err.response?.data?.error || 'Failed to resolve report');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 font-semibold mb-4">{error}</p>
        <button
          onClick={loadReports}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          {t('retry') || 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('filterByStatus') || 'Filter by Status'}
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'resolved' | 'unresolved')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">{t('all') || 'All'}</option>
              <option value="unresolved">{t('unresolved') || 'Unresolved'}</option>
              <option value="resolved">{t('resolved') || 'Resolved'}</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('filterByType') || 'Filter by Type'}
            </label>
            <select
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">{t('all') || 'All'}</option>
              <option value="PRODUCT">{t('product') || 'Product'}</option>
              <option value="MAKER">{t('maker') || 'Maker'}</option>
              <option value="POST">{t('post') || 'Post'}</option>
              <option value="VIDEO">{t('video') || 'Video'}</option>
              <option value="COMMENT">{t('comment') || 'Comment'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className={cn(
          'flex items-center justify-between mb-4',
          isRTL && 'rtl-flip-row'
        )}>
          <h3 className={cn('text-xl font-bold text-gray-900', isRTL && 'rtl-text-right')}>
            {t('reports') || 'Reports'} ({reports.length})
          </h3>
          <button
            onClick={loadReports}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            {t('refresh') || 'Refresh'}
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('noReports') || 'No reports found'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className={`p-4 rounded-lg border-2 ${
                  report.resolved
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className={cn(
                  'flex items-start justify-between mb-3',
                  isRTL && 'rtl-flip-row'
                )}>
                  <div className="flex-1">
                    <div className={cn('flex items-center gap-3 mb-2', isRTL && 'rtl-flip-row')}>
                      {report.user.profilePicture && (
                        <img
                          src={report.user.profilePicture}
                          alt={report.user.name || report.user.email}
                          className="h-8 w-8 rounded-full"
                        />
                      )}
                      <div>
                        <p className={cn('font-semibold text-gray-900', isRTL && 'rtl-text-right')}>
                          {report.user.name || report.user.email}
                        </p>
                        <p className={cn('text-xs text-gray-500', isRTL && 'rtl-text-right')}>
                          {new Date(report.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        report.targetType === 'PRODUCT' ? 'bg-blue-100 text-blue-700' :
                        report.targetType === 'MAKER' ? 'bg-purple-100 text-purple-700' :
                        report.targetType === 'POST' ? 'bg-green-100 text-green-700' :
                        report.targetType === 'VIDEO' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {report.targetType}
                      </span>
                      {report.resolved && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
                          {t('resolved') || 'Resolved'}
                        </span>
                      )}
                    </div>
                    <p className={cn('text-sm text-gray-700 mb-2', isRTL && 'rtl-text-right')}>
                      <span className="font-semibold">{t('reason') || 'Reason'}:</span> {report.reason}
                    </p>
                    <p className={cn('text-xs text-gray-500', isRTL && 'rtl-text-right')}>
                      {t('targetId') || 'Target ID'}: {report.targetId.slice(0, 20)}...
                    </p>
                  </div>
                </div>
                {!report.resolved && (
                  <div className={cn('flex gap-2 mt-4', isRTL && 'rtl-flip-row')}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleResolve(report.id, true)}
                    >
                      {t('markAsResolved') || 'Mark as Resolved'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement hide content functionality
                        alert('Hide content functionality coming soon');
                      }}
                    >
                      {t('hideContent') || 'Hide Content'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

