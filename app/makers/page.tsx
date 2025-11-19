import { redirect } from 'next/navigation';

/**
 * Redirect non-locale makers route to default locale route
 * Defaults to Arabic locale (ar)
 * 
 * Supported redirects:
 * - /makers -> /ar/makers
 * 
 * Future: Detect user's preferred locale from Accept-Language header
 */
export default function MakersPage() {
  redirect('/ar/makers');
}

