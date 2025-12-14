'use client';

import { useState, useEffect } from 'react';
import AdminOrdersPageClient from './page-client';
import LoadingState from '@/components/common/LoadingState';

/**
 * Admin Orders Management Page
 * Displays all orders in a table format
 * This page is ALWAYS in Arabic regardless of site locale
 * Client component with mounted check to prevent hydration errors
 */
export default function AdminOrdersPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Only set mounted to true after browser loads
    setIsMounted(true);
  }, []);

  // Prevent rendering until mounted (prevents hydration mismatch)
  if (!isMounted) {
    return (
      <div dir="rtl" lang="ar">
        <LoadingState fullScreen message="جاري تحميل الطلبات..." locale="ar" />
      </div>
    );
  }

  return (
    <div dir="rtl" lang="ar">
      <AdminOrdersPageClient />
    </div>
  );
}

