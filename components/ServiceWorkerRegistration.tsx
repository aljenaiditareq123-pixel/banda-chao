'use client';

import { useEffect } from 'react';

/**
 * Service Worker Registration Component
 * 
 * DISABLED to avoid console errors.
 * PWA features are optional for now.
 * 
 * To re-enable in the future:
 * 1. Set NEXT_PUBLIC_ENABLE_SW=true in environment variables
 * 2. Uncomment the code below
 * 3. Uncomment <ServiceWorkerRegistration /> in app/layout.tsx
 * 4. Ensure all URLs in public/sw.js exist and are accessible
 * 5. Test thoroughly before enabling in production
 */
export default function ServiceWorkerRegistration() {
  // Service Worker is disabled by default
  // Only enable if NEXT_PUBLIC_ENABLE_SW environment variable is set to 'true'
  const enableSW = process.env.NEXT_PUBLIC_ENABLE_SW === 'true';
  
  useEffect(() => {
    // Early return if SW is disabled
    if (!enableSW) {
      return;
    }

    // Only run in browser
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Register service worker with error handling
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered:', registration);
      } catch (error) {
        console.warn('⚠️ Service Worker registration failed:', error);
      }
    };

    // Wait for page to load before registering
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => {
        window.removeEventListener('load', registerSW);
      };
    }
  }, [enableSW]);

  return null;
}

