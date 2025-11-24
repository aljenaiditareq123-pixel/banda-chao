import FounderPageClient from './page-client';

/**
 * Founder Dashboard Page
 * Displays KPIs and metrics for the founder
 * This page is ALWAYS in Arabic regardless of site locale
 */
export default function FounderPage() {
  return (
    <div dir="rtl" lang="ar">
      <FounderPageClient />
    </div>
  );
}



