import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import MakerDetailClient from './page-client';
import { makersAPI, productsAPI, videosAPI } from '@/lib/api';

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

const validLocales = ['zh', 'en', 'ar'];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  let locale: string;
  let id: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
    id = resolvedParams.id;
  } catch (error) {
    console.error('Error resolving params in generateMetadata:', error);
    locale = 'ar';
    id = '';
  }
  
  // Get base URL for metadataBase
  const metadataBaseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 
                          'https://banda-chao-frontend.onrender.com';
  
  // Validate id before making API call
  if (!id || id === 'favicon.ico' || id.includes('.')) {
    return {
      metadataBase: new URL(metadataBaseUrl),
      title: 'Maker - Banda Chao',
    };
  }
  
  try {
    const response = await makersAPI.getById(id);
    const maker = response?.maker;

    if (maker) {
      return {
        metadataBase: new URL(metadataBaseUrl),
        title: `${maker.displayName} - Banda Chao`,
        description: maker.bio || `View ${maker.displayName}'s profile and products on Banda Chao`,
        openGraph: {
          title: maker.displayName,
          description: maker.bio || `View ${maker.displayName}'s profile and products on Banda Chao`,
          images: maker.avatarUrl || maker.user?.profilePicture ? [maker.avatarUrl || maker.user.profilePicture] : [],
        },
      };
    }
  } catch (error: any) {
    // Silently handle 404 errors - they're expected for invalid maker IDs
    if (error?.response?.status !== 404) {
      console.error('Error generating metadata:', error);
    }
  }

  return {
    metadataBase: new URL(metadataBaseUrl),
    title: 'Maker - Banda Chao',
  };
}

export default async function MakerDetailPage({ params }: PageProps) {
  let locale: string;
  let id: string;
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale;
    id = resolvedParams.id;
  } catch (error) {
    console.error('Error resolving params:', error);
    notFound();
  }

  if (!validLocales.includes(locale)) {
    notFound();
  }
  
  // Validate id - reject file-like paths
  if (!id || id === 'favicon.ico' || id.includes('.')) {
    notFound();
  }

  try {
    const [makerResponse, productsResponse, videosResponse] = await Promise.all([
      makersAPI.getById(id),
      productsAPI.getByMaker(id, { limit: 12 }),
      videosAPI.getByMaker(id, { limit: 6 }),
    ]);

    const maker = makerResponse.maker;
    const products = productsResponse.products || [];
    const videos = videosResponse.videos || [];

    if (!maker) {
      notFound();
    }

    return (
      <MakerDetailClient
        locale={locale}
        maker={maker}
        products={products}
        videos={videos}
      />
    );
  } catch (error) {
    console.error('Error fetching maker details:', error);
    notFound();
  }
}

