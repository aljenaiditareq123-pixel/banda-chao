'use client';

import { useEffect, useState } from 'react';

export default function StatusPage() {
  const [status, setStatus] = useState<any>({
    loading: true,
    videos: null,
    products: null,
    error: null
  });

  useEffect(() => {
    const testAPIs = async () => {
      try {
        // Test Videos API
        const videosRes = await fetch('https://banda-chao-backend.onrender.com/api/v1/videos?type=short&limit=5');
        const videosData = await videosRes.json();
        
        // Test Products API
        const productsRes = await fetch('https://banda-chao-backend.onrender.com/api/v1/products');
        const productsData = await productsRes.json();
        
        setStatus({
          loading: false,
          videos: {
            success: videosRes.ok,
            status: videosRes.status,
            count: videosData?.data?.length || 0,
            data: videosData
          },
          products: {
            success: productsRes.ok,
            status: productsRes.status,
            count: productsData?.data?.length || (Array.isArray(productsData) ? productsData.length : 0),
            data: productsData
          },
          error: null
        });
      } catch (err: any) {
        setStatus({
          loading: false,
          videos: null,
          products: null,
          error: err.message
        });
      }
    };
    
    testAPIs();
  }, []);

  if (status.loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '20px' }}>⏳ جاري التحقق...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '50px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '30px', color: '#dc2626' }}>
        📊 Status Page - صفحة الحالة
      </h1>
      
      {status.error && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fee2e2', 
          border: '2px solid #dc2626',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#dc2626', fontSize: '24px', marginBottom: '10px' }}>❌ خطأ!</h2>
          <p style={{ color: '#991b1b', fontSize: '18px' }}>{status.error}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* Videos Status */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: status.videos?.success ? '#dcfce7' : '#fee2e2',
          border: `2px solid ${status.videos?.success ? '#16a34a' : '#dc2626'}`,
          borderRadius: '8px'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            marginBottom: '15px',
            color: status.videos?.success ? '#16a34a' : '#dc2626'
          }}>
            📹 Videos API
          </h2>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>
            <strong>Status:</strong> {status.videos?.status || 'N/A'}
          </p>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>
            <strong>Count:</strong> {status.videos?.count || 0}
          </p>
          <p style={{ fontSize: '18px' }}>
            <strong>Success:</strong> {status.videos?.success ? '✅ Yes' : '❌ No'}
          </p>
        </div>

        {/* Products Status */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: status.products?.success ? '#dcfce7' : '#fee2e2',
          border: `2px solid ${status.products?.success ? '#16a34a' : '#dc2626'}`,
          borderRadius: '8px'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            marginBottom: '15px',
            color: status.products?.success ? '#16a34a' : '#dc2626'
          }}>
            🛍️ Products API
          </h2>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>
            <strong>Status:</strong> {status.products?.status || 'N/A'}
          </p>
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>
            <strong>Count:</strong> {status.products?.count || 0}
          </p>
          <p style={{ fontSize: '18px' }}>
            <strong>Success:</strong> {status.products?.success ? '✅ Yes' : '❌ No'}
          </p>
        </div>
      </div>

      {/* Raw Data */}
      <div style={{ marginTop: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>📋 Raw Data:</h2>
        <pre style={{ 
          padding: '20px', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '12px',
          maxHeight: '400px'
        }}>
          {JSON.stringify(status, null, 2)}
        </pre>
      </div>
    </div>
  );
}

