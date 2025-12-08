import AdminOrdersPageClient from './page-client';

/**
 * Admin Orders Management Page
 * Displays all orders in a table format
 * This page is ALWAYS in Arabic regardless of site locale
 */
export default function AdminOrdersPage() {
  return (
    <div dir="rtl" lang="ar">
      <AdminOrdersPageClient />
    </div>
  );
}

