import dynamic from 'next/dynamic';

// Dynamically import the client component to prevent SSR issues
// This page uses client-side hooks that require browser APIs
const AdminUsersPageClient = dynamic(() => import('./page-client'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري تحميل المستخدمين...</p>
      </div>
    </div>
  ),
});

export default function AdminUsersPage() {
  return <AdminUsersPageClient />;
}
