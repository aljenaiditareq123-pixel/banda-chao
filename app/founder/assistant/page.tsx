'use client';

import { Suspense } from 'react';
import FounderAIAssistant from '@/components/FounderAIAssistant';

export const dynamic = 'force-dynamic';

export default function FounderAssistantPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <FounderAIAssistant />
    </Suspense>
  );
}

