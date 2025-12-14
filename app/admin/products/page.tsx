import AdminProductsPageClient from './page-client';

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Admin Products Management Page
 * Server component wrapper that prevents SSR/prerendering
 */
export default function AdminProductsPage() {
  return (
    <div dir="rtl" lang="ar">
      <AdminProductsPageClient />
    </div>
  );
}
