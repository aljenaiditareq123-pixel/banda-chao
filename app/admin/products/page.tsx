'use client';

import AdminProductsPageClient from './page-client';

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';

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
