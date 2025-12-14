import AdminDashboardClient from './page-client';

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Admin Dashboard Page
 * Server component wrapper that prevents SSR/prerendering
 */
export default function AdminDashboard() {
  return <AdminDashboardClient />;
}
