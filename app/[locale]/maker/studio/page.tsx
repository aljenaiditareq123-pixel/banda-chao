import { notFound } from 'next/navigation';
import MakerStudio from '@/components/MakerStudio';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export default async function MakerStudioPage({ params }: PageProps) {
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

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Simple Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <a
          href={`/${locale}`}
          className="bg-white text-gray-700 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-medium hover:bg-gray-50"
        >
          <span className={locale === 'ar' ? 'ml-1' : ''}>←</span>
          <span>{locale === 'ar' ? 'العودة' : locale === 'zh' ? '返回' : 'Back'}</span>
        </a>
      </div>
      
      <MakerStudio />
    </div>
  );
}
