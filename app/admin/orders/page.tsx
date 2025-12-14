import AdminOrdersPageClient from './page-client';

// Force dynamic rendering - prevent static generation and prerendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Admin Orders Management Page
 * Displays all orders in a table format
 * This page is ALWAYS in Arabic regardless of site locale
 * Server component wrapper that prevents build-time prerendering
 */
export default function AdminOrdersPage() {
  return (
    <div dir="rtl" lang="ar">
      <AdminOrdersPageClient />
    </div>
  );
}

