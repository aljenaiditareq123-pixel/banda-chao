import Providers from '@/components/Providers';

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers showHeader={false} showFooter={false} showChatWidget={false}>
      {children}
    </Providers>
  );
}





