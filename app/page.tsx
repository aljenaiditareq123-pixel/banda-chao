import { redirect } from 'next/navigation';

/**
 * Root page - redirects to default locale (Chinese)
 * This ensures the proper homepage with locale support is displayed
 */
export default function Home() {
  redirect('/zh');
}
