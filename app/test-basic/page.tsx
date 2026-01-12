'use client';

import { getApiBaseUrl } from '@/lib/api-utils';

export default function TestBasicPage() {
  return (
    <div style={{ padding: '50px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: 'red', fontSize: '32px', fontWeight: 'bold' }}>
        ✅ صفحة الاختبار البسيطة تعمل!
      </h1>
      <p style={{ fontSize: '18px', marginTop: '20px' }}>
        إذا رأيت هذه الرسالة، يعني أن Next.js يعمل بشكل صحيح.
      </p>
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
        <h2 style={{ color: '#333' }}>اختبار API:</h2>
        <button 
          onClick={async () => {
            try {
              const apiBaseUrl = getApiBaseUrl();
              const res = await fetch(`${apiBaseUrl}/videos?type=short&limit=5`);
              const data = await res.json();
              alert(`نجح! عدد الفيديوهات: ${data.data?.length || 0}`);
            } catch (err: any) {
              alert(`خطأ: ${err.message}`);
            }
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          اختبار Videos API
        </button>
      </div>
    </div>
  );
}

