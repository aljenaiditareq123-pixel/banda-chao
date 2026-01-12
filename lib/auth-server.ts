/**
 * Server-side Authentication Utilities
 * For use in Next.js Server Components and API Routes only
 */

import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getApiBaseUrl } from '@/lib/api-utils';

export type CurrentUser = {
  id: string;
  email: string;
  name?: string | null;
  profilePicture?: string | null;
  role: 'USER' | 'MAKER' | 'FOUNDER' | string;
  createdAt: Date;
};

/**
 * Get the current authenticated user from the backend
 * @returns Current user object or null if not authenticated
 */
export async function getCurrentUserServer(): Promise<CurrentUser | null> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const cookieStore = cookies();
    
    // Try to get token from cookie (auth_token)
    const tokenCookie = cookieStore.get('auth_token');
    
    // If no cookie, try to get from Authorization header (for API routes)
    // For server components, we rely on cookies
    if (!tokenCookie) {
      return null;
    }
    
    const token = tokenCookie.value;
    
    if (!token) {
      return null;
    }

    const res = await fetch(`${apiBaseUrl}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      profilePicture: data.profilePicture,
      role: data.role || 'USER',
      createdAt: new Date(data.createdAt),
    };
  } catch (error) {
    console.error('[Auth Server] Error fetching current user:', error);
    return null;
  }
}

/**
 * Check if the current user is the founder
 * @param user - Current user object (optional, will fetch if not provided)
 * @returns Object with allowed flag and reason if not allowed
 */
export async function assertFounderOrRedirect(
  user?: CurrentUser | null
): Promise<{ allowed: true; user: CurrentUser } | { allowed: false; reason: 'not-authenticated' | 'not-founder' }> {
  // Fetch user if not provided
  const currentUser = user ?? await getCurrentUserServer();

  if (!currentUser) {
    return { allowed: false, reason: 'not-authenticated' };
  }

  // Check if user has FOUNDER role
  const isFounderRole = currentUser.role === 'FOUNDER';

  // Also check email match as additional security layer
  const FOUNDER_EMAIL = process.env.FOUNDER_EMAIL;
  const isFounderEmail =
    FOUNDER_EMAIL &&
    currentUser.email &&
    currentUser.email.toLowerCase() === FOUNDER_EMAIL.toLowerCase();

  if (!isFounderRole && !isFounderEmail) {
    return { allowed: false, reason: 'not-founder' };
  }

  // If email matches but role doesn't, this should be fixed in the database
  // But we still allow access for now (the OAuth handler should fix the role)
  return { allowed: true, user: currentUser };
}

/**
 * Protect a route by checking if user is founder
 * Redirects to login if not authenticated, or home if not founder
 * Use this in Server Components and Layouts
 */
export async function requireFounder(): Promise<CurrentUser> {
  const result = await assertFounderOrRedirect();

  if (!result.allowed) {
    if (result.reason === 'not-authenticated') {
      // For server components, we can't use window, so use a generic redirect
      redirect('/login?redirect=/founder');
    }
    redirect('/'); // Not founder - redirect to home
  }

  return result.user;
}

