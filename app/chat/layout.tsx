import Providers from '@/components/Providers';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers showHeader={true} showFooter={false} showChatWidget={false}>
      {children}
    </Providers>
  );
}

