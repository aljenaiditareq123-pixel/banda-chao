import { redirect } from 'next/navigation';

// Root page redirects to default locale
export default function HomePage() {
  redirect('/ar');
}



