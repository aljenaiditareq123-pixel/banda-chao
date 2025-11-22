/**
 * Safe Language Hook
 * Provides a fallback when useLanguage is used outside LanguageProvider
 */

import { useContext } from 'react';
import { LanguageContext } from '@/contexts/LanguageContext';

interface SafeLanguageReturn {
  language: 'zh' | 'ar' | 'en';
  t: (key: string) => string;
  isRTL: boolean;
}

/**
 * Safe version of useLanguage that provides fallbacks
 * when used outside of LanguageProvider (e.g., during prerendering)
 */
export function useSafeLanguage(): SafeLanguageReturn {
  // Use useContext directly to avoid throwing errors
  const context = useContext(LanguageContext);
  
  // If context is null/undefined (not within provider), return safe defaults
  if (!context) {
    if (typeof window !== 'undefined') {
      console.warn('[useSafeLanguage] LanguageProvider not available, using defaults');
    }
    
    return {
      language: 'zh', // Default language
      t: (key: string) => key, // Return key as-is
      isRTL: false,
    };
  }
  
  return {
    language: context.language,
    t: context.t,
    isRTL: context.language === 'ar',
  };
}

/**
 * Hook that safely checks if we're in an RTL context
 */
export function useSafeRTL(): boolean {
  const context = useContext(LanguageContext);
  
  if (!context) {
    // Safe default during prerendering
    return false;
  }
  
  return context.language === 'ar';
}

/**
 * Hook that safely gets the current language
 */
export function useSafeCurrentLanguage(): 'zh' | 'ar' | 'en' {
  const context = useContext(LanguageContext);
  
  if (!context) {
    // Safe default during prerendering
    return 'zh';
  }
  
  return context.language;
}
