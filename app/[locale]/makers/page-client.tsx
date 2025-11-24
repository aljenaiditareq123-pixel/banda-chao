'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Grid, GridItem } from '@/components/Grid';
import Link from 'next/link';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';

interface Maker {
  id: string;
  displayName: string;
  bio?: string;
  country?: string;
  city?: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  avatarUrl?: string;
  user?: {
    name: string;
    profilePicture?: string;
  };
  _count?: {
    products: number;
    videos: number;
  };
}

interface MakersPageClientProps {
  locale: string;
  makers: Maker[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function MakersPageClient({ 
  locale, 
  makers, 
  pagination,
  loading = false,
  error = null,
  onRetry 
}: MakersPageClientProps) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState message={locale === 'ar' ? 'جاري التحميل...' : 'Loading...'} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {locale === 'ar' ? 'الحرفيون' : locale === 'zh' ? '手工艺人' : 'Makers'}
        </h1>

        {makers.length > 0 ? (
          <>
            <Grid columns={{ base: 1, md: 2, lg: 3 }} gap="gap-6">
              {makers.map((maker) => (
                <GridItem key={maker.id}>
                  <Link href={`/${locale}/makers/${maker.id}`}>
                    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {maker.avatarUrl || maker.user?.profilePicture ? (
                            <img
                              src={maker.avatarUrl || maker.user?.profilePicture}
                              alt={maker.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">👤</span>
                          )}
                        </div>
                        <div className="mr-4 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{maker.displayName}</h3>
                          {maker.country && (
                            <p className="text-sm text-gray-600">{maker.city ? `${maker.city}, ` : ''}{maker.country}</p>
                          )}
                        </div>
                      </div>
                      {maker.bio && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{maker.bio}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          {maker._count?.products || 0} {locale === 'ar' ? 'منتج' : 'products'}
                        </span>
                        {maker.rating > 0 && (
                          <span>⭐ {maker.rating.toFixed(1)} ({maker.reviewCount})</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </GridItem>
              ))}
            </Grid>
          </>
        ) : (
          <EmptyState
            icon="👥"
            title={locale === 'ar' ? 'لا توجد حرفيون' : locale === 'zh' ? '没有手工艺人' : 'No makers found'}
            message={locale === 'ar' ? 'لم يتم العثور على حرفيين في الوقت الحالي.' : 'No makers available at the moment.'}
          />
        )}
      </div>
    </div>
  );
}
