import FounderBetaPageClient from './page-client';

/**
 * Founder Beta Applications Page
 * Shows all Beta applications submitted by makers
 * This page requires FOUNDER role authentication
 * This page is ALWAYS in Arabic regardless of site locale
 */
export default function FounderBetaPage() {
  return (
    <div dir="rtl" lang="ar">
      <FounderBetaPageClient />
    </div>
  );
}

