import AdminUsersPageClient from './page-client';

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Admin Users Management Page
 * Server component wrapper that prevents SSR/prerendering
 */
export default function AdminUsersPage() {
  return <AdminUsersPageClient />;
}
