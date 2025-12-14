'use client';

import { useState, useEffect } from 'react';
import AdminProductsPageClient from './page-client';
import LoadingState from '@/components/common/LoadingState';

/**
 * Admin Products Management Page
 * Client component with mounted check to prevent hydration errors
 */
export default function AdminProductsPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Only set mounted to true after browser loads
    setIsMounted(true);
  }, []);

  // Prevent rendering until mounted (prevents hydration mismatch)
  if (!isMounted) {
    return (
      <div dir="rtl" lang="ar">
        <LoadingState fullScreen message="جاري تحميل المنتجات..." locale="ar" />
      </div>
    );
  }

  return (
    <div dir="rtl" lang="ar">
      <AdminProductsPageClient />
    </div>
  );
}
