// DEBUGGING: Temporarily bypassing layout to test if layout is causing the crash
// import AdminLayoutClient from './layout-client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // DEBUGGING: Strip layout completely - just render children directly
  return <>{children}</>;
  
  // ORIGINAL CODE (commented out for debugging):
  // return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
