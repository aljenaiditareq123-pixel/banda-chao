/**
 * Cookie utilities for locale preferences
 */

export const PREFERRED_LOCALE_COOKIE = 'preferredLocale';

export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  path?: string;
}

/**
 * Set a cookie
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}) {
  if (typeof document === 'undefined') return;
  
  const {
    maxAge,
    expires,
    httpOnly = false,
    secure = process.env.NODE_ENV === 'production',
    sameSite = 'lax',
    path = '/',
  } = options;

  let cookieString = `${name}=${encodeURIComponent(value)}`;

  if (maxAge) {
    cookieString += `; Max-Age=${maxAge}`;
  }

  if (expires) {
    cookieString += `; Expires=${expires.toUTCString()}`;
  }

  if (path) {
    cookieString += `; Path=${path}`;
  }

  if (sameSite) {
    cookieString += `; SameSite=${sameSite}`;
  }

  if (secure) {
    cookieString += `; Secure`;
  }

  // Note: httpOnly cannot be set from client-side JavaScript
  // It's a security feature that prevents client-side access
  // If httpOnly is needed, cookies must be set server-side (in middleware or API routes)

  document.cookie = cookieString;
}

/**
 * Get a cookie value
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }
  
  return null;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string, path: string = '/') {
  setCookie(name, '', {
    expires: new Date(0),
    path,
  });
}

/**
 * Set preferred locale cookie
 */
export function setPreferredLocale(locale: 'ar' | 'zh' | 'en') {
  // Set cookie to expire in 1 year
  setCookie(PREFERRED_LOCALE_COOKIE, locale, {
    maxAge: 365 * 24 * 60 * 60, // 1 year in seconds
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

/**
 * Get preferred locale from cookie
 */
export function getPreferredLocale(): 'ar' | 'zh' | 'en' | null {
  const locale = getCookie(PREFERRED_LOCALE_COOKIE);
  if (locale === 'ar' || locale === 'zh' || locale === 'en') {
    return locale;
  }
  return null;
}

