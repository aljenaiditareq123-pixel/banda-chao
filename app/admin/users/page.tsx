'use client';

import AdminUsersPageClient from './page-client';

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';

/**
 * Admin Users Management Page
 * Made a client component to prevent SSR issues with hooks
 */
export default function AdminUsersPage() {
  return <AdminUsersPageClient />;
}
