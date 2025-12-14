'use client';

import AdminProductsPageClient from './page-client';

/**
 * Admin Products Management Page
 * Made a client component to prevent SSR issues with hooks
 */
export default function AdminProductsPage() {
  return (
    <div dir="rtl" lang="ar">
      <AdminProductsPageClient />
    </div>
  );
}
