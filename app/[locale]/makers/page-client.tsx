'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Maker } from '@/types';
import { makersAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import { Grid, GridItem } from '@/components/Grid';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

const AVATAR_PLACEHOLDER = 'https://via.placeholder.com/200x200?text=Maker';
const COVER_PLACEHOLDER = 'https://via.placeholder.com/800x400?text=Maker+Cover';

interface MakersPageClientProps {
  locale: string;
  initialMakers: Maker[];
  initialSearch?: string;
}

export default function MakersPageClient({ locale, initialMakers, initialSearch }: MakersPageClientProps) {
  const { setLanguage, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [makers, setMakers] = useState<Maker[]>(initialMakers);
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (locale === 'zh' || locale === 'ar' || locale === 'en') {
      setLanguage(locale);
    } else {
      setLanguage('zh');
    }
  }, [locale, setLanguage]);

  // Extract unique locations
  const locations = useMemo(() => {
    const locs = makers
      .map((maker) => maker.location)
      .filter((loc): loc is string => Boolean(loc));
    return Array.from(new Set(locs)).sort();
  }, [makers]);

  // Handle search with API call
  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await makersAPI.getMakers({ search: query || undefined });
      // Backend returns array directly (axios wraps it in response.data)
      const items = Array.isArray(response.data) ? response.data : [];
      const normalized = items.map((item: any) => {
        // Use normalizeMaker helper
        const maker: Maker = {
          id: item.id,
          userId: item.userId,
          slug: item.slug,
          name: item.name,
          bio: item.bio,
          story: item.story,
          profilePictureUrl: item.profilePictureUrl,
          coverPictureUrl: item.coverPictureUrl,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          user: item.user,
          coverImage: item.coverPictureUrl,
          profilePicture: item.profilePictureUrl || item.user?.profilePicture,
        };
        return maker;
      });
      setMakers(normalized);
    } catch (err: any) {
      console.error('[MakersPage] Failed to search makers:', err);
      setError(t('unexpectedError') || 'فشل في البحث. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    router.push(`/${locale}/makers?${params.toString()}`);
    handleSearch(searchQuery);
  };

  // Filter makers based on location (client-side only, search is done via API)
  const filteredMakers = useMemo(() => {
    return makers.filter((maker) => {
      const matchesLocation = !selectedLocation || maker.location === selectedLocation;
      return matchesLocation;
    });
  }, [makers, selectedLocation]);

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      return year;
    } catch {
      return '';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center md:text-right">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              {t('exploreMakers') || 'استكشف الحرفيين'}
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto md:mx-0">
              {t('discoverTalentedMakers') || 'اكتشف الحرفيين الموهوبين ومنتجاتهم الفريدة'}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <form onSubmit={handleSearchSubmit} className="w-full">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('search') || 'بحث'}
                </label>
                <div className="flex gap-2">
                  <input
                    id="search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchMakers') || 'ابحث عن حرفي...'}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Button type="submit" variant="primary" disabled={isLoading}>
                    {isLoading ? (t('loading') || '...') : (t('search') || 'بحث')}
                  </Button>
                </div>
              </form>

              {/* Location Filter */}
              {locations.length > 0 && (
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('location') || 'الموقع'}
                  </label>
                  <select
                    id="location"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">{t('allLocations') || 'جميع المواقع'}</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && filteredMakers.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">{t('loadingMakers') || 'Loading makers...'}</p>
            </div>
          )}

          {/* Results Count */}
          {!isLoading && filteredMakers.length > 0 && (
            <div className="mb-6 text-gray-600 text-sm sm:text-base">
              {t('showing') || 'عرض'} <span className="font-semibold text-gray-900">{filteredMakers.length}</span>{' '}
              {t('of') || 'من'} <span className="font-semibold text-gray-900">{makers.length}</span>{' '}
              {t('makers') || 'حرفي'}
            </div>
          )}

          {/* Makers Grid */}
          {!isLoading && filteredMakers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMakers.map((maker) => {
                const profileImage = maker.profilePictureUrl || maker.profilePicture || maker.user?.profilePicture || AVATAR_PLACEHOLDER;
                const coverImage = maker.coverPictureUrl || maker.coverImage || COVER_PLACEHOLDER;
                const displayBio = maker.bio || maker.tagline || '';
                const makerSince = maker.createdAt ? formatDate(maker.createdAt) : '';

                return (
                  <Link
                    key={maker.id}
                    href={`/${locale}/makers/${maker.slug || maker.id}`}
                    className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-200"
                  >
                    {/* Cover Image */}
                    <div className="h-40 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
                      <img
                        src={coverImage}
                        alt={maker.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Profile Section */}
                    <div className="p-5 -mt-16 relative">
                      {/* Avatar */}
                      <div className="h-24 w-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 mb-4 relative z-10">
                        <img
                          src={profileImage}
                          alt={maker.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = AVATAR_PLACEHOLDER;
                          }}
                        />
                      </div>

                      {/* Maker Info */}
                      <div className="mt-2">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {maker.name}
                        </h3>
                        {displayBio && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                            {displayBio}
                          </p>
                        )}
                        {makerSince && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span>🎨</span>
                            <span>{t('makerSince') || 'حرفي منذ'} {makerSince}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : !isLoading ? (
            <EmptyState
              icon="🔍"
              title={t('noMakersFound') || 'No makers found'}
              description={t('tryDifferentSearch') || 'Try a different search or change filters'}
              action={{
                label: t('clearFilters') || 'Clear filters',
                href: `/${locale}/makers`,
              }}
            />
          ) : null}
        </div>
      </div>
    </Layout>
  );
}

