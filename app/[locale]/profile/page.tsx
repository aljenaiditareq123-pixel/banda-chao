import { notFound } from 'next/navigation';
import GamifiedProfile from '@/components/GamifiedProfile';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function ProfilePage({ params }: PageProps) {
  let locale: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
  } catch (error) {
    console.error('Error resolving params:', error);
    locale = 'ar';
  }

  // Validate locale and fallback to default if invalid
  if (!validLocales.includes(locale)) {
    console.warn(`Invalid locale: ${locale}, falling back to 'ar'`);
    locale = 'ar';
  }

  return <GamifiedProfile />;
}
