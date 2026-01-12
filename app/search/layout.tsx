import Providers from '@/components/Providers';

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers showHeader={true} showFooter={true} showChatWidget={true}>
      {children}
    </Providers>
  );
}





