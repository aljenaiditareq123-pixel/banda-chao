import FounderAssistantPageClient from './page-client';

/**
 * Founder Assistant Page
 * Consultant Panda AI Assistant for the founder
 * This page requires FOUNDER role authentication
 * This page is ALWAYS in Arabic regardless of site locale
 */
export default function FounderAssistantPage() {
  return (
    <div dir="rtl" lang="ar">
      <FounderAssistantPageClient />
    </div>
  );
}



