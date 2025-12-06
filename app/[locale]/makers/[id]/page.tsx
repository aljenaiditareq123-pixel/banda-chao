import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import MakerDetailClient from './page-client';
import { makersAPI, productsAPI, videosAPI } from '@/lib/api';

interface PageProps {
  params: {
    locale: string;
    id: string;
  };
}

const validLocales = ['zh', 'en', 'ar'];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = params;
  
  // Get base URL for metadataBase
  const metadataBaseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 
                          'https://banda-chao-frontend.onrender.com';
  
  try {
    const response = await makersAPI.getById(id);
    const maker = response.maker;

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
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return {
    metadataBase: new URL(metadataBaseUrl),
    title: 'Maker - Banda Chao',
  };
}

export default async function MakerDetailPage({ params }: PageProps) {
  const { locale, id } = params;

  if (!validLocales.includes(locale)) {
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

