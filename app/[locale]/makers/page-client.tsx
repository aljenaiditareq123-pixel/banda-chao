'use client';

import { useState, useEffect, useMemo } from 'react';
<<<<<<< HEAD
import { useSearchParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Grid, GridItem } from '@/components/Grid';
import MakerCard from '@/components/cards/MakerCard';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/Button';
import { useClientFilters } from '@/hooks/useClientFilters';
import { makersAPI } from '@/lib/api';

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
  makers: initialMakers, 
  pagination: initialPagination,
  loading = false,
  error = null,
  onRetry 
}: MakersPageClientProps) {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [retryLoading, setRetryLoading] = useState(false);
  
  // Read and normalize page from URL
  const normalizePage = (pageParam: string | null): number => {
    if (!pageParam) return 1;
    const parsed = parseInt(pageParam, 10);
    if (isNaN(parsed) || parsed < 1) return 1;
    return parsed;
  };

  // State for filters (read from URL initially)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || '');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || '');
  const [makers, setMakers] = useState(initialMakers);

  // Get unique countries and languages from makers
  const { countries, languages } = useMemo(() => {
    const countrySet = new Set<string>();
    const languageSet = new Set<string>();
    
    makers.forEach((maker) => {
      if (maker.country) {
        countrySet.add(maker.country);
      }
      if (maker.languages && maker.languages.length > 0) {
        maker.languages.forEach((lang) => languageSet.add(lang));
      }
    });
    
    return {
      countries: Array.from(countrySet).sort(),
      languages: Array.from(languageSet).sort(),
    };
  }, [makers]);

  // Apply client-side filtering
  const filteredMakers = useClientFilters({
    items: makers,
    filters: {
      search: searchQuery,
      country: selectedCountry || undefined,
      language: selectedLanguage || undefined,
    },
    getSearchableText: (item) => `${item.displayName} ${item.bio || ''} ${item.city || ''} ${item.country || ''}`,
    getCountry: (item) => item.country,
    getLanguage: (item) => item.languages,
  });

  // Calculate pagination
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(filteredMakers.length / pageSize));
  const urlPage = normalizePage(searchParams.get('page'));
  const [currentPage, setCurrentPage] = useState(() => {
    // Clamp to valid range
    if (urlPage > totalPages && totalPages > 0) return totalPages;
    return urlPage;
  });

  // Update currentPage when URL changes or totalPages changes
  useEffect(() => {
    const urlPage = normalizePage(searchParams.get('page'));
    const clampedPage = urlPage > totalPages && totalPages > 0 ? totalPages : (urlPage < 1 ? 1 : urlPage);
    if (clampedPage !== currentPage) {
      setCurrentPage(clampedPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, totalPages]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCountry, selectedLanguage]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredMakers.slice(startIndex, endIndex);
  }, [filteredMakers, currentPage, pageSize]);

  // Update URL when filters or page change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCountry) params.set('country', selectedCountry);
    if (selectedLanguage) params.set('language', selectedLanguage);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const newUrl = `/${locale}/makers${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, selectedCountry, selectedLanguage, currentPage, locale, router]);

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Retry function
  const handleRetry = async () => {
    setRetryLoading(true);
    try {
      const response = await makersAPI.getAll({
        limit: 100,
        country: selectedCountry || undefined,
        language: selectedLanguage || undefined,
        search: searchQuery || undefined,
      });
      setMakers(response.makers || []);
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setRetryLoading(false);
    }
  };

  const handleFilterChange = (type: 'country' | 'language' | 'search', value: string) => {
    if (type === 'country') {
      setSelectedCountry(value === selectedCountry ? '' : value);
    } else if (type === 'language') {
      setSelectedLanguage(value === selectedLanguage ? '' : value);
    } else if (type === 'search') {
      setSearchQuery(value);
    }
  };

  if (loading || retryLoading) {
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
          <ErrorState 
            message={error} 
            onRetry={onRetry || handleRetry} 
            locale={locale} 
          />
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ar' ? 'بحث' : locale === 'zh' ? '搜索' : 'Search'}
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder={locale === 'ar' ? 'ابحث عن حرفي...' : locale === 'zh' ? '搜索手工艺人...' : 'Search makers...'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Country Filter */}
            {countries.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'البلد' : locale === 'zh' ? '国家' : 'Country'}
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">{locale === 'ar' ? 'جميع البلدان' : locale === 'zh' ? '所有国家' : 'All Countries'}</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Language Filter */}
            {languages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {locale === 'ar' ? 'اللغة' : locale === 'zh' ? '语言' : 'Language'}
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleFilterChange('language', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">{locale === 'ar' ? 'جميع اللغات' : locale === 'zh' ? '所有语言' : 'All Languages'}</option>
                  {languages.map((language) => (
                    <option key={language} value={language}>
                      {language.toUpperCase()}
                    </option>
                  ))}
                </select>
=======
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
>>>>>>> dda36a71131520c8b820410d3f4341ee1b66fdf0
              </div>
            )}
          </div>

<<<<<<< HEAD
          {/* Active Filters */}
          {(selectedCountry || selectedLanguage || searchQuery) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">{locale === 'ar' ? 'الفلاتر النشطة:' : 'Active filters:'}</span>
              {searchQuery && (
                <span className="px-3 py-1 bg-primary-100 text-primary rounded-full text-sm">
                  {locale === 'ar' ? 'بحث:' : 'Search:'} {searchQuery}
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mr-2 hover:text-primary-700"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCountry && (
                <span className="px-3 py-1 bg-primary-100 text-primary rounded-full text-sm">
                  {selectedCountry}
                  <button
                    onClick={() => setSelectedCountry('')}
                    className="mr-2 hover:text-primary-700"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedLanguage && (
                <span className="px-3 py-1 bg-primary-100 text-primary rounded-full text-sm">
                  {selectedLanguage.toUpperCase()}
                  <button
                    onClick={() => setSelectedLanguage('')}
                    className="mr-2 hover:text-primary-700"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Makers Grid */}
        {paginatedItems.length > 0 ? (
          <>
            <Grid columns={{ base: 1, md: 2, lg: 3 }} gap="gap-6">
              {paginatedItems.map((maker) => (
                <GridItem key={maker.id}>
                  <MakerCard
                    maker={maker}
                    href={`/${locale}/makers/${maker.id}`}
                    locale={locale}
                  />
                </GridItem>
              ))}
            </Grid>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  onClick={handlePreviousPage}
                  disabled={currentPage <= 1}
                  variant="secondary"
                >
                  {locale === 'ar' ? 'السابق' : locale === 'zh' ? '上一页' : 'Previous'}
                </Button>
                <span className="text-gray-600">
                  {locale === 'ar' 
                    ? `صفحة ${currentPage} من ${totalPages}`
                    : locale === 'zh'
                    ? `第 ${currentPage} 页，共 ${totalPages} 页`
                    : `Page ${currentPage} of ${totalPages}`
                  }
                </span>
                <Button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  variant="secondary"
                >
                  {locale === 'ar' ? 'التالي' : locale === 'zh' ? '下一页' : 'Next'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon="👥"
            title={locale === 'ar' ? 'لا توجد حرفيون' : locale === 'zh' ? '没有手工艺人' : 'No makers found'}
            message={
              searchQuery || selectedCountry || selectedLanguage
                ? (locale === 'ar' 
                    ? 'لم يتم العثور على حرفيين يطابقون الفلاتر المحددة.'
                    : locale === 'zh'
                    ? '没有找到匹配筛选条件的手工艺人。'
                    : 'No makers match the selected filters.')
                : (locale === 'ar' 
                    ? 'لم يتم العثور على حرفيين في الوقت الحالي.'
                    : locale === 'zh'
                    ? '目前没有手工艺人。'
                    : 'No makers available at the moment.')
            }
          />
        )}
      </div>
    </div>
  );
}
=======
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

>>>>>>> dda36a71131520c8b820410d3f4341ee1b66fdf0
