import ProfilePageClient from './page-client';
import { getApiBaseUrl } from '@/lib/api-utils';
import { fetchJsonWithRetry } from '@/lib/fetch-with-retry';

interface LocaleProfilePageProps {
  params: {
    locale: string;
    userId: string;
  };
}

async function fetchUserProfile(userId: string) {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetchJsonWithRetry(`${apiBaseUrl}/users/${userId}`, {
      next: { revalidate: 300 }, // 5 minutes cache
      maxRetries: 2,
      retryDelay: 1000,
      headers: {
        // Note: This is a public profile endpoint, but backend requires auth
        // We'll handle auth in the client component
      },
    });
    return response;
  } catch (error) {
    console.error('[ProfilePage] Failed to load user:', error);
    return null;
  }
}

export const dynamic = 'force-dynamic';

export default async function LocaleProfilePage({ params }: LocaleProfilePageProps) {
  const { locale, userId } = params;
  
  // Validate locale
  const validLocale = (locale === 'zh' || locale === 'ar' || locale === 'en') ? locale : 'zh';
  
  // Try to fetch user profile (optional - client will handle if this fails)
  const userProfile = await fetchUserProfile(userId).catch(() => null);

  return <ProfilePageClient locale={validLocale} userId={userId} initialProfile={userProfile} />;
}

