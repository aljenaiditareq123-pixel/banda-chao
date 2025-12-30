'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { opsAPI } from '@/lib/api';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

interface SystemHealth {
  database: 'healthy' | 'degraded' | 'down';
  lastRecoveryTime?: string;
  maintenanceActions: number;
}

interface SalesStats {
  totalRevenue: number;
  numberOfOrders: number;
  averageOrderValue: number;
  currency: string;
}

interface InventoryAlert {
  id: string;
  name: string;
  currentStock: number;
  status: 'LOW_STOCK' | 'OUT_OF_STOCK';
}

interface DailyBriefing {
  timestamp: string;
  systemHealth: SystemHealth;
  salesStats: SalesStats;
  inventoryAlerts: InventoryAlert[];
  summary: {
    totalAlerts: number;
    criticalIssues: number;
    systemStatus: 'operational' | 'attention_required' | 'critical';
  };
}

export default function OperationsDashboardClient() {
  const { user, loading: authLoading } = useAuth();
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!authLoading && user?.role === 'FOUNDER') {
      fetchBriefing();
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchBriefing();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [authLoading, user]);

  const fetchBriefing = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Log API call for debugging
      const { getApiUrl } = await import('@/lib/api-utils');
      const apiUrl = getApiUrl();
      console.log('[Founder Dashboard] Fetching briefing from:', `${apiUrl}/ops/briefing`);
      
      const response = await opsAPI.getBriefing();
      
      // Handle different response structures
      if (response && response.briefing) {
        setBriefing(response.briefing);
      } else if (response && !response.briefing) {
        // If response exists but no briefing, use response directly
        console.warn('[Founder Dashboard] Response structure unexpected:', response);
        setBriefing(response as any);
      } else {
        throw new Error('Invalid response structure');
      }
      
      setLastUpdate(new Date());
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load operations data';
      setError(errorMessage);
      console.error('[Founder Dashboard] Error fetching briefing:', {
        message: errorMessage,
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        data: err?.response?.data,
        fullError: err,
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#00ff00] font-mono">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-pulse mb-4">
              <div className="w-16 h-16 border-4 border-[#00ff00] border-t-transparent rounded-full"></div>
            </div>
            <p className="text-[#00ff00] text-sm">LOADING OPERATIONS DATA...</p>
          </div>
        </div>
      </div>
    );
  }

  // Auth check
  if (!user || user.role !== 'FOUNDER') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#ff0000] font-mono flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="mb-4">
            <svg className="w-16 h-16 text-[#ff0000] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#ff0000] mb-2">ACCESS DENIED</h3>
          <p className="text-[#888] mb-4">FOUNDER CLEARANCE REQUIRED</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !briefing) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#ff0000] font-mono">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-[#ff0000] mb-4">ERROR: {error}</p>
            <button
              onClick={fetchBriefing}
              className="px-4 py-2 bg-[#1a1a1a] border border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000] hover:text-[#0a0a0a] transition-colors"
            >
              RETRY
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!briefing) {
    return null;
  }

  const { systemHealth, salesStats, inventoryAlerts, summary } = briefing;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#00ff00] font-mono">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#0f0f0f] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#00ff00]">BANDA OPS</h1>
            <p className="text-xs text-[#666] mt-1">
              OPERATIONS CENTER • {lastUpdate?.toLocaleTimeString() || 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#666]">STATUS: {summary.systemStatus.toUpperCase()}</p>
            <button
              onClick={fetchBriefing}
              className="mt-2 px-3 py-1 bg-[#1a1a1a] border border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-[#0a0a0a] transition-colors text-xs"
            >
              REFRESH
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* System Health Card */}
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#00ff00]">SYSTEM HEALTH</h2>
              <div className={`w-4 h-4 rounded-full ${
                systemHealth.database === 'healthy' ? 'bg-[#00ff00]' :
                systemHealth.database === 'degraded' ? 'bg-[#ffaa00]' :
                'bg-[#ff0000] animate-pulse'
              }`}></div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#666]">DATABASE:</span>
                <span className={`font-bold ${
                  systemHealth.database === 'healthy' ? 'text-[#00ff00]' :
                  systemHealth.database === 'degraded' ? 'text-[#ffaa00]' :
                  'text-[#ff0000]'
                }`}>
                  {systemHealth.database.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">MAINTENANCE ACTIONS:</span>
                <span className="text-[#00ff00]">{systemHealth.maintenanceActions}</span>
              </div>
              {systemHealth.lastRecoveryTime && (
                <div className="flex justify-between">
                  <span className="text-[#666]">LAST RECOVERY:</span>
                  <span className="text-[#00ff00] text-xs">
                    {new Date(systemHealth.lastRecoveryTime).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Money Card */}
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#00ff00]">SALES TODAY</h2>
              <span className="text-xs text-[#666]">{salesStats.currency}</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#666] mb-1">TOTAL REVENUE</p>
                <p className="text-3xl font-bold text-[#00ff00]">
                  ${salesStats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#1a1a1a]">
                <div>
                  <p className="text-xs text-[#666] mb-1">ORDERS</p>
                  <p className="text-xl font-bold text-[#00ff00]">{salesStats.numberOfOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-[#666] mb-1">AVG ORDER</p>
                  <p className="text-xl font-bold text-[#00ff00]">
                    ${salesStats.averageOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#00ff00]">INVENTORY ALERTS</h2>
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#666]">
                TOTAL: <span className="text-[#00ff00]">{summary.totalAlerts}</span>
              </span>
              {summary.criticalIssues > 0 && (
                <span className="text-xs text-[#ff0000]">
                  CRITICAL: <span className="font-bold">{summary.criticalIssues}</span>
                </span>
              )}
            </div>
          </div>

          {inventoryAlerts.length === 0 ? (
            <div className="text-center py-8 text-[#666]">
              <p className="text-sm">NO ALERTS • ALL SYSTEMS NOMINAL</p>
            </div>
          ) : (
            <div className="space-y-2">
              {inventoryAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border ${
                    alert.status === 'OUT_OF_STOCK'
                      ? 'border-[#ff0000] bg-[#1a0000]'
                      : 'border-[#ffaa00] bg-[#1a0a00]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold ${
                          alert.status === 'OUT_OF_STOCK' ? 'text-[#ff0000]' : 'text-[#ffaa00]'
                        }`}>
                          [{alert.status === 'OUT_OF_STOCK' ? 'CRITICAL' : 'WARNING'}]
                        </span>
                        <span className="text-[#00ff00] font-semibold">{alert.name}</span>
                      </div>
                      <p className="text-xs text-[#666]">
                        STOCK LEVEL: <span className="text-[#00ff00]">{alert.currentStock}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold ${
                        alert.status === 'OUT_OF_STOCK' ? 'text-[#ff0000]' : 'text-[#ffaa00]'
                      }`}>
                        {alert.status === 'OUT_OF_STOCK' ? 'OUT OF STOCK' : 'LOW STOCK'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 text-center text-xs text-[#666]">
          <p>LAST UPDATE: {lastUpdate?.toLocaleString() || 'N/A'}</p>
          <p className="mt-1">
            SYSTEM STATUS: <span className={`font-bold ${
              summary.systemStatus === 'operational' ? 'text-[#00ff00]' :
              summary.systemStatus === 'attention_required' ? 'text-[#ffaa00]' :
              'text-[#ff0000]'
            }`}>
              {summary.systemStatus.toUpperCase().replace('_', ' ')}
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}

