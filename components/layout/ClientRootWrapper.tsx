'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Disable SSR for interactive components in root layout to prevent React Error #310
// These must be in a Client Component because ssr: false is not allowed in Server Components
const ChatWidget = dynamic(() => import('@/components/common/ChatWidget'), { ssr: false });
const VirtualHost = dynamic(() => import('@/components/avatar/VirtualHost'), { ssr: false });
const EnvCheckInit = dynamic(() => import('@/components/common/EnvCheckInit'), { ssr: false });

export default function ClientRootWrapper() {
  return (
    <>
      {/* Env Check Init - Client-only to prevent hydration mismatches */}
      <Suspense fallback={null}>
        <EnvCheckInit />
      </Suspense>
      
      {/* Chat Widget - Client-only to prevent hydration mismatches */}
      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>
      
      {/* Virtual Host - Client-only to prevent hydration mismatches */}
      <Suspense fallback={null}>
        <VirtualHost />
      </Suspense>
    </>
  );
}
