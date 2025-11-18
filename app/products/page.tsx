import { redirect } from 'next/navigation';

// Redirect non-locale products route to locale route
// Default to Arabic locale, could be enhanced to detect user preference
export default function ProductsPage() {
  redirect('/ar/products');
}
