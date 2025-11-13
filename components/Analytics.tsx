'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Analytics Component
 * Tracks page views and user interactions
 * 
 * Currently uses simple console logging and can be extended with:
 * - Vercel Analytics (@vercel/analytics)
 * - Google Analytics
 * - Custom analytics service
 */
function AnalyticsContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page view
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Log page view (can be replaced with actual analytics service)
    if (typeof window !== 'undefined') {
      console.log('[Analytics] Page view:', url);
      
      // Example: Send to analytics service
      // if (window.gtag) {
      //   window.gtag('config', 'GA_MEASUREMENT_ID', {
      //     page_path: url,
      //   });
      // }
      
      // Example: Vercel Analytics
      // import { track } from '@vercel/analytics';
      // track('page_view', { path: url });
    }
  }, [pathname, searchParams]);

  // Track custom events
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      console.log('[Analytics] Event:', eventName, properties);
      
      // Example: Send to analytics service
      // if (window.gtag) {
      //   window.gtag('event', eventName, properties);
      // }
    }
  };

  // Expose trackEvent globally for use in other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).trackEvent = trackEvent;
    }
  }, []);

  return null; // This component doesn't render anything
}

export default function Analytics() {
  return (
    <Suspense fallback={null}>
      <AnalyticsContent />
    </Suspense>
  );
}

