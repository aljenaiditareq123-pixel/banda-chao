import type { ReactNode } from "react";
import { redirect } from 'next/navigation';
import { requireFounder } from '@/lib/auth-server';
import Providers from "@/components/Providers";

// Force dynamic rendering because we use cookies() in requireFounder()
export const dynamic = 'force-dynamic';

/**
 * Founder Layout - Protected Layout for all /founder/** routes
 * Only accessible to users with FOUNDER role or FOUNDER_EMAIL
 * 
 * IMPORTANT: Founder Console is Arabic-only for the Arabic founder
 * - Always uses Arabic (ar) locale
 * - Always uses RTL layout
 * - No language switcher shown
 */
export default async function FounderLayout({ children }: { children: ReactNode }) {
  // Check if user is founder - redirects if not
  await requireFounder();

  // Force Arabic locale for all founder pages
  return (
    <Providers initialLocale="ar" showHeader={false} showFooter={false} showChatWidget={false}>
      {children}
    </Providers>
  );
}

