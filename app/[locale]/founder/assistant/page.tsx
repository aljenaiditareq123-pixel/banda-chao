import FounderAssistantPageClient from './page-client';

export const dynamic = 'force-dynamic';

/**
 * Localized Founder Assistant Page - AI Assistants Center
 * 
 * Pure Server Component - no client-side logic, hooks, or data fetching.
 * All client-side logic is delegated to FounderAssistantPageClient.
 * 
 * Protection:
 * - Server-side: app/[locale]/layout.tsx handles locale routing
 * - Client-side: FounderRoute component in page-client.tsx checks AuthContext for role === 'FOUNDER'
 * 
 * Access Scenarios:
 * 1. Not authenticated → Redirects to /[locale]/login?redirect=/[locale]/founder/assistant
 * 2. Authenticated but NOT FOUNDER → Redirects to /[locale] (home page)
 * 3. Authenticated AND FOUNDER → Shows founder assistant page
 */
export default function FounderAssistantPage() {
  return <FounderAssistantPageClient />;
}

