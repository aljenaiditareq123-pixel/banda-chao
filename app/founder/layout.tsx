import type { ReactNode } from "react";
import { redirect } from 'next/navigation';
import { requireFounder } from '@/lib/auth-server';
import Providers from "@/components/Providers";

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

