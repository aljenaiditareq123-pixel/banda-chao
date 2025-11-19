'use client';

import { useEffect, useState } from 'react';
import { getApiBaseUrl } from '@/lib/api-utils';

export default function TestSimplePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        setLoading(true);
        const apiBaseUrl = getApiBaseUrl();
        
        // Test Videos API
        const videosRes = await fetch(`${apiBaseUrl}/videos?type=short&limit=5`);
        const videosData = await videosRes.json();
        
        // Test Products API
        const productsRes = await fetch(`${apiBaseUrl}/products`);
        const productsData = await productsRes.json();
        
        setData({
          videos: videosData,
          products: productsData,
          videosStatus: videosRes.status,
          productsStatus: productsRes.status,
        });
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    testAPI();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ!</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🔍 Test Page - Simple API Test</h1>
        
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">📹 Videos API</h2>
          <p className="text-lg mb-2">
            <span className="font-medium">Status:</span>{' '}
            <span className={data?.videosStatus === 200 ? 'text-green-600' : 'text-red-600'}>
              {data?.videosStatus}
            </span>
          </p>
          <p className="text-lg mb-2">
            <span className="font-medium">Videos Count:</span>{' '}
            <span className="text-red-600 font-bold">
              {data?.videos?.data?.length || 0}
            </span>
          </p>
          {data?.videos?.data && data.videos.data.length > 0 && (
            <div className="bg-gray-100 p-4 rounded-md mt-2">
              <p className="font-semibold">First Video:</p>
              <p className="text-sm">{data.videos.data[0].title}</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">🛍️ Products API</h2>
          <p className="text-lg mb-2">
            <span className="font-medium">Status:</span>{' '}
            <span className={data?.productsStatus === 200 ? 'text-green-600' : 'text-red-600'}>
              {data?.productsStatus}
            </span>
          </p>
          <p className="text-lg mb-2">
            <span className="font-medium">Products Count:</span>{' '}
            <span className="text-red-600 font-bold">
              {data?.products?.data?.length || (Array.isArray(data?.products) ? data.products.length : 0)}
            </span>
          </p>
          {(data?.products?.data?.[0] || (Array.isArray(data?.products) && data.products[0])) && (
            <div className="bg-gray-100 p-4 rounded-md mt-2">
              <p className="font-semibold">First Product:</p>
              <p className="text-sm">
                {(data?.products?.data?.[0] || data?.products?.[0])?.name}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">📋 Raw Data (JSON)</h2>
          <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}


