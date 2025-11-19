import type { ReactNode } from "react";
import { redirect } from 'next/navigation';
import { requireFounder } from '@/lib/auth-server';
import Providers from "@/components/Providers";

// Force dynamic rendering because we use cookies() in requireFounder()
export const dynamic = 'force-dynamic';

/**
 * Founder Layout - Protected Layout for all /founder/** routes
 * Only accessible to users with FOUNDER role or FOUNDER_EMAIL
 */
export default async function FounderLayout({ children }: { children: ReactNode }) {
  // Check if user is founder - redirects if not
  await requireFounder();

  return (
    <Providers>
      {children}
    </Providers>
  );
}

