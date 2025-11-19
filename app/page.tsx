import { redirect } from 'next/navigation';

/**
 * Root Page Handler
 * 
 * Redirects all requests to the default locale (en).
 * 
 * Supported locales:
 * - /en -> /en (homepage)
 * - /ar -> /ar (homepage)
 * - /zh -> /zh (homepage)
 * 
 * Special query parameter:
 * - ?no-redirect=true -> Shows homepage without redirect (for testing)
 * 
 * Future: Add locale detection based on Accept-Language header
 */
export default async function RootPage({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  // Allow bypassing redirect for testing
  if (searchParams?.['no-redirect'] === 'true') {
    // This shouldn't normally happen, but if it does, redirect anyway
    redirect('/en?no-redirect=true');
  }

  // Default locale is 'en' (English)
  // Future: Detect user's preferred locale from Accept-Language header or cookies
  redirect('/en');
}
