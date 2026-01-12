'use client';

import { Grid, GridItem } from '@/components/Grid';
import VideoCard from '@/components/VideoCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Video } from '@/types';
import EmptyState from '@/components/ui/EmptyState';

interface ShortVideosPageClientProps {
  locale: string;
  shortVideos: Video[];
}

export default function ShortVideosPageClient({ locale, shortVideos }: ShortVideosPageClientProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center md:text-right">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('shortVideos') || 'الفيديوهات القصيرة'}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto md:mx-0">
            {t('shortVideosDescription') || 'شاهد فيديوهات قصيرة من الحرفيين والمحتوى الإبداعي'}
          </p>
        </div>

        {/* Videos Grid */}
        {shortVideos.length > 0 ? (
          <Grid columns={{ base: 1, sm: 2, md: 3 }} gap="gap-6">
            {shortVideos.map((video) => (
              <GridItem key={video.id}>
                <VideoCard video={video} locale={locale} />
              </GridItem>
            ))}
          </Grid>
        ) : (
          <EmptyState
            icon="🎬"
            title={t('noShortVideos') || 'لا توجد فيديوهات قصيرة حالياً'}
            description={t('noShortVideosDescription') || 'لم يتم رفع أي فيديوهات قصيرة بعد'}
            action={{
              label: t('browseProducts') || 'تصفح المنتجات',
              href: `/${locale}/products`,
            }}
          />
        )}
      </div>
    </div>
  );
}





