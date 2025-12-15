import AdminLayoutClient from './layout-client';
import SessionProviderWrapper from '@/components/providers/SessionProviderWrapper';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Wrap with SessionProvider to ensure useSession works correctly
  return (
    <SessionProviderWrapper>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </SessionProviderWrapper>
  );
}
