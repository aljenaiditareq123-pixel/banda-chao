'use client';

import { useEffect, useState } from 'react';
import { videosAPI, productsAPI } from '@/lib/api';

export default function TestAPIPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testAPIs();
  }, []);

  const testAPIs = async () => {
    const testResults: any = {
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
      timestamp: new Date().toISOString(),
      videos: null,
      products: null,
      errors: [],
    };

    try {
      // Test Videos API
      try {
        const videosRes = await videosAPI.getVideos('short', 1, 1);
        testResults.videos = {
          success: true,
          count: videosRes.data?.data?.length || 0,
          data: videosRes.data,
        };
      } catch (err: any) {
        testResults.videos = {
          success: false,
          error: err.message,
          response: err.response?.data,
        };
        testResults.errors.push(`Videos API: ${err.message}`);
      }

      // Test Products API
      try {
        const productsRes = await productsAPI.getProducts();
        const productsData = productsRes.data?.data || (Array.isArray(productsRes.data) ? productsRes.data : []);
        testResults.products = {
          success: true,
          count: productsData.length,
          data: productsData,
        };
      } catch (err: any) {
        testResults.products = {
          success: false,
          error: err.message,
          response: err.response?.data,
        };
        testResults.errors.push(`Products API: ${err.message}`);
      }
    } catch (err: any) {
      testResults.errors.push(`General: ${err.message}`);
    } finally {
      setResults(testResults);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Testing APIs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">API Test Results</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            <p>
              <strong>NEXT_PUBLIC_API_URL:</strong>{' '}
              <span className={results.apiUrl === 'NOT SET' ? 'text-red-600' : 'text-green-600'}>
                {results.apiUrl}
              </span>
            </p>
            <p>
              <strong>Timestamp:</strong> {results.timestamp}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Videos API Test</h2>
          {results.videos?.success ? (
            <div className="text-green-600">
              <p>✅ Success!</p>
              <p>Videos found: {results.videos.count}</p>
              <pre className="mt-4 bg-gray-100 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(results.videos.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-red-600">
              <p>❌ Failed</p>
              <p>Error: {results.videos?.error}</p>
              {results.videos?.response && (
                <pre className="mt-4 bg-gray-100 p-4 rounded overflow-auto text-xs">
                  {JSON.stringify(results.videos.response, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Products API Test</h2>
          {results.products?.success ? (
            <div className="text-green-600">
              <p>✅ Success!</p>
              <p>Products found: {results.products.count}</p>
              <pre className="mt-4 bg-gray-100 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(results.products.data?.slice(0, 2), null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-red-600">
              <p>❌ Failed</p>
              <p>Error: {results.products?.error}</p>
              {results.products?.response && (
                <pre className="mt-4 bg-gray-100 p-4 rounded overflow-auto text-xs">
                  {JSON.stringify(results.products.response, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {results.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-900 mb-4">Errors</h2>
            <ul className="list-disc list-inside space-y-2">
              {results.errors.map((error: string, index: number) => (
                <li key={index} className="text-red-700">{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={testAPIs}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            Test Again
          </button>
        </div>
      </div>
    </div>
  );
}

