import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';
import type { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import TwitterProvider from 'next-auth/providers/twitter';
// import EmailProvider from 'next-auth/providers/email'; // DISABLED: Requires adapter
import CredentialsProvider from 'next-auth/providers/credentials';

// Credentials Provider - Connects to Backend API
const CredentialsLoginProvider = CredentialsProvider({
  id: 'credentials',
  name: 'Credentials',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      return null;
    }

    try {
      // Get API URL from environment or use fallback
      // CRITICAL: Backend routes are mounted at /api/v1/* (see server/src/index.ts line 410)
      // app.use('/api/v1/auth', authRoutes) → /api/v1/auth/login
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://banda-chao.onrender.com';
      // Use /api/v1/auth/login to match Backend routes
      const fullApiUrl = `${apiUrl}/api/v1/auth/login`;

      // Call Backend login API
      const response = await fetch(fullApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
        credentials: 'include', // Include cookies for CSRF
      });

      if (!response.ok) {
        console.error('[NextAuth] Login failed:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();

      if (data.success && data.user && data.token) {
        // Return user object for NextAuth
        return {
          id: data.user.id || data.user.email,
          email: data.user.email,
          name: data.user.name || data.user.email.split('@')[0],
          image: data.user.profilePicture || null,
          role: data.user.role || 'BUYER',
        };
      }

      return null;
    } catch (error) {
      console.error('[NextAuth] Authorization error:', error);
      return null;
    }
  },
});

// Custom WeChat Provider (using Credentials flow)
// WeChat OAuth requires server-side token exchange
const WeChatProvider = CredentialsProvider({
  id: 'wechat',
  name: 'WeChat',
  credentials: {
    code: { label: 'Code', type: 'text' },
  },
  async authorize(credentials) {
    if (!credentials?.code) {
      return null;
    }

    try {
      // Exchange code for WeChat access token
      const tokenResponse = await fetch(
        `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${process.env.WECHAT_APP_ID}&secret=${process.env.WECHAT_APP_SECRET}&code=${credentials.code}&grant_type=authorization_code`
      );
      
      const tokenData = await tokenResponse.json();
      
      if (tokenData.errcode) {
        console.error('WeChat token error:', tokenData);
        return null;
      }

      const { access_token, openid } = tokenData;

      // Get user info from WeChat
      const userResponse = await fetch(
        `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`
      );
      
      const userData = await userResponse.json();
      
      if (userData.errcode) {
        console.error('WeChat user info error:', userData);
        return null;
      }

      return {
        id: openid,
        name: userData.nickname || 'WeChat User',
        email: `${openid}@wechat.banda-chao.com`, // WeChat doesn't provide email
        image: userData.headimgurl,
        provider: 'wechat',
      };
    } catch (error) {
      console.error('WeChat authorization error:', error);
      return null;
    }
  },
});

// Note: We can add PrismaAdapter later if needed
// For now, we'll use JWT strategy which works without a database

export const authOptions: NextAuthConfig = {
  providers: [
    // Credentials Login - Connects to Backend API
    CredentialsLoginProvider,
    
    // WeChat - Priority for Chinese market (جاهز للإضافة لاحقاً)
    ...(process.env.WECHAT_APP_ID && process.env.WECHAT_APP_SECRET
      ? [WeChatProvider]
      : []),
    // Google - Universal default (جاهز للإضافة لاحقاً)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    // Facebook
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    // Twitter
    ...(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET
      ? [
          TwitterProvider({
            clientId: process.env.TWITTER_CLIENT_ID,
            clientSecret: process.env.TWITTER_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    // Email (Magic Link) - DISABLED: Requires adapter in NextAuth v5
    // TODO: Re-enable when PrismaAdapter is added
    // EmailProvider({
    //   server: {
    //     host: process.env.SMTP_HOST || 'smtp.gmail.com',
    //     port: parseInt(process.env.SMTP_PORT || '587'),
    //     auth: {
    //       user: process.env.SMTP_USER || '',
    //       pass: process.env.SMTP_PASSWORD || '',
    //     },
    //   },
    //   from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@banda-chao.com',
    //   sendVerificationRequest({ identifier, url, provider }) {
    //     console.log(`Sending magic link to ${identifier}: ${url}`);
    //   },
    // }),
  ],
  pages: {
    signIn: '/auth/signin', // Custom sign-in page
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
        
        // CRITICAL: Override role for founder@banda-chao.com to ADMIN
        if (user.email === 'founder@banda-chao.com') {
          token.role = 'ADMIN';
        }
        
        // Sync user with database (find existing user by email)
        if (user.email) {
          try {
            const { prisma } = await import('@/lib/prisma');
            const dbUser = await prisma.users.findUnique({
              where: { email: user.email },
            });
            
            if (dbUser) {
              // Use database user ID for consistency
              token.id = dbUser.id;
              token.email = dbUser.email;
              // Override role for founder@banda-chao.com even if DB has different role
              if (dbUser.email === 'founder@banda-chao.com') {
                token.role = 'ADMIN';
              } else {
                token.role = dbUser.role || token.role;
              }
            }
          } catch (e) {
            // Ignore errors - use token ID
            console.log('Could not sync user to DB:', e);
          }
        }
      }
      
      // Also check token.email in case it's already set (for subsequent calls)
      if (token.email === 'founder@banda-chao.com') {
        token.role = 'ADMIN';
      }
      
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session?.user) {
        (session.user as any).id = token.id as string;
        
        // CRITICAL: Override role for founder@banda-chao.com to ADMIN
        if (session.user.email === 'founder@banda-chao.com') {
          (session.user as any).role = 'ADMIN';
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
  // Render will auto-generate this via generateValue: true in render.yaml
  // Support both old (NEXTAUTH_SECRET) and new (AUTH_SECRET) variable names for compatibility
  // FALLBACK: Use hardcoded secret if environment variable is missing (ensures server always works)
  secret: (() => {
    const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'BandaChaoSecretKey2026SecureNoSymbols';
    if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production') {
      console.warn('[NextAuth] WARNING: AUTH_SECRET or NEXTAUTH_SECRET not found, using fallback value');
    }
    return authSecret;
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