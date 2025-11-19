import FounderPageClient from "./page-client";
import FounderRoute from "@/components/FounderRoute";

/**
 * Founder Page - Main Dashboard for the Founder
 * 
 * Protection Logic:
 * - Server-side: app/founder/layout.tsx uses requireFounder() to check cookies
 * - Client-side: FounderRoute component checks AuthContext for role === 'FOUNDER'
 * 
 * Access Scenarios:
 * 1. Not authenticated → Redirects to /[locale]/login?redirect=/founder
 * 2. Authenticated but NOT FOUNDER → Redirects to /[locale] (home page)
 * 3. Authenticated AND FOUNDER → Shows founder dashboard
 * 
 * Note: FOUNDER role is determined by:
 * - Database: user.role === 'FOUNDER'
 * - OR: user.email matches FOUNDER_EMAIL environment variable (backend check)
 * 
 * TODO: Consider consolidating server-side and client-side checks if needed.
 */
export default function FounderPage() {
  return (
    <FounderRoute locale="en">
      <FounderPageClient />
    </FounderRoute>
  );
}
