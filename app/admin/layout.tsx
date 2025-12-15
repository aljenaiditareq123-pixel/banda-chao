import AdminLayoutClient from './layout-client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Restored layout with bulletproof client component
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
