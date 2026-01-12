import { redirect } from 'next/navigation';

/**
 * Redirect non-locale videos route to default locale route
 * Defaults to Arabic locale (ar)
 * 
 * Supported redirects:
 * - /videos -> /ar/videos
 * 
 * Future: Detect user's preferred locale from Accept-Language header
 */
export default function VideosPage() {
  redirect('/ar/videos');
}

