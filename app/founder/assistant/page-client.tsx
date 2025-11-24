'use client';

import FounderChatPanel from '@/components/founder/FounderChatPanel';
import { useAuth } from '@/hooks/useAuth';

export default function FounderAssistantPageClient() {
  const { user, loading } = useAuth();

  return (
    <div className="h-screen flex flex-col">
      <FounderChatPanel user={user} loading={loading} />
    </div>
  );
}



