'use client';

import { useState, useEffect } from 'react';
import AdminUsersPageClient from './page-client';
import LoadingState from '@/components/common/LoadingState';

/**
 * Admin Users Management Page
 * Client component with mounted check to prevent hydration errors
 */
export default function AdminUsersPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Only set mounted to true after browser loads
    setIsMounted(true);
  }, []);

  // Prevent rendering until mounted (prevents hydration mismatch)
  if (!isMounted) {
    return (
      <div dir="rtl" lang="ar">
        <LoadingState fullScreen message="جاري تحميل المستخدمين..." locale="ar" />
      </div>
    );
  }

  return <AdminUsersPageClient />;
}
