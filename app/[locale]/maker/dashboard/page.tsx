import { notFound } from 'next/navigation';
import MakerDashboard from '@/components/MakerDashboard';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function MakerDashboardPage({ params }: PageProps) {
  let locale: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params in maker dashboard page:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }

  // Render the new Maker Dashboard
  return <MakerDashboard />;
}



