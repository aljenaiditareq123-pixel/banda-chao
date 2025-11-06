'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OldLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new login page
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">正在重定向...</p>
      </div>
    </div>
  );
}
