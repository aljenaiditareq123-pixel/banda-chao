'use client';

import { SessionProvider } from 'next-auth/react';

export default function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Add basePath and refetchInterval for better compatibility
  return (
    <SessionProvider
      basePath="/api/auth"
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  );
}
