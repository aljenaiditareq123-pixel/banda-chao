import AdminLayoutClient from './layout-client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will be handled by the client component for auth check
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
