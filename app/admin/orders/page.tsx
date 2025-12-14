'use client';

import AdminOrdersPageClient from './page-client';

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';

/**
 * Admin Orders Management Page
 * Displays all orders in a table format
 * This page is ALWAYS in Arabic regardless of site locale
 * Made a client component to prevent SSR issues with hooks
 */
export default function AdminOrdersPage() {
  return (
    <div dir="rtl" lang="ar">
      <AdminOrdersPageClient />
    </div>
  );
}

