import OperationsDashboardClient from './page-client';

/**
 * Founder Operations Dashboard
 * Visualizes Operations Center data
 * This page requires FOUNDER role authentication
 * Dark mode, military-style UI
 */
export default function OperationsDashboardPage() {
  return (
    <div dir="ltr" lang="en">
      <OperationsDashboardClient />
    </div>
  );
}



