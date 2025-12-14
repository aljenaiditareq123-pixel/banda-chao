'use client';

import AdminUsersPageClient from './page-client';

/**
 * Admin Users Management Page
 * Made a client component to prevent SSR issues with hooks
 */
export default function AdminUsersPage() {
  return <AdminUsersPageClient />;
}
