// DEBUGGING: Temporarily removed client component import to test server component directly
// import AdminOrdersPageClient from './page-client';

// Force dynamic rendering - prevent static generation and prerendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Admin Orders Management Page
 * DEBUGGING MODE: Simple server component return to test if route works
 */
export default function AdminOrdersPage() {
  return <h1>Server Page is Working Direct!</h1>;
  
  // ORIGINAL CODE (commented out for debugging):
  // return (
  //   <div dir="rtl" lang="ar">
  //     <AdminOrdersPageClient />
  //   </div>
  // );
}

