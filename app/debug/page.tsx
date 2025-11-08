'use client';

import { useEffect, useState } from 'react';
import { videosAPI, productsAPI } from '@/lib/api';

interface LogEntry {
  time: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

export default function DebugPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState<string>('');

  const addLog = (type: LogEntry['type'], message: string, data?: any) => {
    setLogs(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      type,
      message,
      data
    }]);
  };

  useEffect(() => {
    // Get API URL
    const url = process.env.NEXT_PUBLIC_API_URL || 'https://banda-chao-backend.onrender.com/api/v1';
    setApiUrl(url);
    addLog('info', '🔗 API Base URL:', url);

    // Test API calls
    testAPIs();
  }, []);

  const testAPIs = async () => {
    addLog('info', '🚀 Starting API tests...');

    // Test Videos API
    try {
      addLog('info', '📹 Testing Videos API...');
      const videosRes = await videosAPI.getVideos('short', 1, 5);
      addLog('success', '✅ Videos API Response:', {
        status: videosRes.status,
        hasData: !!videosRes.data,
        hasDataData: !!videosRes.data?.data,
        dataLength: videosRes.data?.data?.length || 0,
        firstVideo: videosRes.data?.data?.[0] || null
      });
    } catch (err: any) {
      addLog('error', '❌ Videos API Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
    }

    // Test Products API
    try {
      addLog('info', '🛍️ Testing Products API...');
      const productsRes = await productsAPI.getProducts();
      const productsData = productsRes.data?.data || (Array.isArray(productsRes.data) ? productsRes.data : []);
      addLog('success', '✅ Products API Response:', {
        status: productsRes.status,
        hasData: !!productsRes.data,
        hasDataData: !!productsRes.data?.data,
        isArray: Array.isArray(productsData),
        dataLength: productsData.length,
        firstProduct: productsData[0] || null
      });
    } catch (err: any) {
      addLog('error', '❌ Products API Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
    }

    setLoading(false);
    addLog('info', '🏁 Tests completed!');
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  const getLogBg = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🔍 Debug Information</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            <p>
              <strong>API URL:</strong>{' '}
              <span className={apiUrl ? 'text-green-600' : 'text-red-600'}>
                {apiUrl || 'NOT SET'}
              </span>
            </p>
            <p>
              <strong>NEXT_PUBLIC_API_URL:</strong>{' '}
              <span className={process.env.NEXT_PUBLIC_API_URL ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Test Logs</h2>
            <button
              onClick={testAPIs}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Testing...' : 'Run Tests Again'}
            </button>
          </div>

          {loading && logs.length === 0 && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Running tests...</p>
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getLogBg(log.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`font-semibold ${getLogColor(log.type)}`}>
                      [{log.time}] {log.message}
                    </p>
                    {log.data && (
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!loading && logs.length === 0 && (
            <p className="text-gray-500 text-center py-8">No logs yet. Click &quot;Run Tests Again&quot; to start.</p>
          )}
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>📋 Instructions:</strong> Copy all the information above and send it to me. This will help me understand what&apos;s happening with the API calls.
          </p>
        </div>
      </div>
    </div>
  );
}

