import Providers from '@/components/Providers';

export default function LoginLayout({
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

