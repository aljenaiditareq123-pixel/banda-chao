import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import { createProviders } from '@/lib/auth/providers';

// OWNER-EXTENSIBLE: Providers are auto-registered from lib/auth/providers.ts
// To add a 9th provider, edit PROVIDERS array in that file only

export const authOptions: NextAuthConfig = {
  providers: createProviders(),
  pages: {
    signIn: '/login', // Social-only login page
    error: '/auth/error', // Error page (optional)
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'BUYER';
        
        // OWNER PRIVILEGE: Force OWNER role if email matches
        const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase().trim();
        if (ownerEmail && user.email?.toLowerCase().trim() === ownerEmail) {
          token.role = 'OWNER';
        }
        
        // Sync user with database (find existing user by email)
        if (user.email) {
          try {
            const { prisma } = await import('@/lib/prisma');
            let dbUser = await prisma.users.findUnique({
              where: { email: user.email },
            });
            
            if (!dbUser) {
              // Create user if doesn't exist (social-only, no password)
              dbUser = await prisma.users.create({
                data: {
                  email: user.email,
                  name: user.name || user.email.split('@')[0],
                  profile_picture: user.image || null,
                  role: ownerEmail && user.email.toLowerCase().trim() === ownerEmail ? 'OWNER' : 'BUYER',
                },
              });
            } else {
              // Update user info if exists
              dbUser = await prisma.users.update({
                where: { email: user.email },
                data: {
                  name: user.name || dbUser.name,
                  profile_picture: user.image || dbUser.profile_picture,
                },
              });
            }
            
            // Use database user ID for consistency
            token.id = dbUser.id;
            token.email = dbUser.email;
            
            // OWNER PRIVILEGE: Always override role for owner email
            if (ownerEmail && dbUser.email.toLowerCase().trim() === ownerEmail) {
              token.role = 'OWNER';
            } else {
              token.role = dbUser.role || token.role;
            }
          } catch (e) {
            // Ignore errors - use token ID
            console.log('Could not sync user to DB:', e);
          }
        }
      }
      
      // OWNER PRIVILEGE: Check token.email in case it's already set
      const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase().trim();
      if (ownerEmail && token.email?.toLowerCase().trim() === ownerEmail) {
        token.role = 'OWNER';
      }
      
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session?.user) {
        (session.user as any).id = token.id as string;
        
        // OWNER PRIVILEGE: Force OWNER role if email matches
        const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase().trim();
        if (ownerEmail && session.user.email?.toLowerCase().trim() === ownerEmail) {
          (session.user as any).role = 'OWNER';
        } else {
          (session.user as any).role = token.role || 'BUYER';
        }
        
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt', // Use JWT strategy (works without database)
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // CRITICAL: AUTH_SECRET is required for NextAuth v5 (changed from NEXTAUTH_SECRET)
  // SECURITY: Kill Switch - Fail fast in production if secret is missing
  secret: (() => {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
    const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    
    if (!authSecret || authSecret.trim() === '') {
      if (isProduction) {
        console.error('❌ [FATAL] AUTH_SECRET or NEXTAUTH_SECRET is not defined in production!');
        console.error('❌ NextAuth cannot operate securely without a secret.');
        console.error('❌ Please set AUTH_SECRET or NEXTAUTH_SECRET in Render environment variables.');
        // Note: In Next.js, we can't call process.exit() here as it would break the build
        // Instead, we throw an error that will be caught by Next.js
        throw new Error('AUTH_SECRET or NEXTAUTH_SECRET must be set in production environment');
      }
      // Development fallback only
      console.warn('[NextAuth] WARNING: AUTH_SECRET/NEXTAUTH_SECRET not found, using development fallback (NOT SECURE)');
      return 'dev-nextauth-secret-only-local-never-use-in-production';
    }
    
    // Double check in production
    if (isProduction && authSecret === 'dev-nextauth-secret-only-local-never-use-in-production') {
      throw new Error('Development NextAuth fallback detected in production - this should be impossible!');
    }
    
    return authSecret.trim();
  })(),
  debug: process.env.NODE_ENV === 'development',
  // CRITICAL: Trust host for Render deployment
  // This fixes "UntrustedHost" errors in production and CSRF token validation issues
  trustHost: true,
  // CRITICAL: Cookie configuration for Render (behind proxy)
  // This fixes CSRF token validation failed errors
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax', // 'lax' works better behind proxy
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Host-' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};

// NextAuth v5 beta - Export handlers directly
// NextAuth v5 returns { handlers: { GET, POST } } structure
const { handlers } = NextAuth(authOptions);

// Export GET and POST handlers
export const { GET, POST } = handlers;