import AdminLayoutClient from './layout-client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No SessionProvider needed - we use getSession() directly in the client component
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
