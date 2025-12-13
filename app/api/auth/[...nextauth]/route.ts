import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';
import type { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import TwitterProvider from 'next-auth/providers/twitter';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';

// Guest Login Provider (Demo/Testing Mode)
// Hardcoded demo user for instant login without password
const GuestLoginProvider = CredentialsProvider({
  id: 'credentials',
  name: 'Guest',
  credentials: {
    // No credentials needed - instant login
  },
  async authorize() {
    // Hardcoded demo user
    return {
      id: '1',
      name: 'Ahmed Panda',
      email: 'panda@bandachao.com',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Panda',
      role: 'BUYER',
    };
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
    // Guest Login - Demo/Testing Mode (Instant login without password)
    GuestLoginProvider,
    
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
    // Email (Magic Link)
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASSWORD || '',
        },
      },
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@banda-chao.com',
      sendVerificationRequest({ identifier, url, provider }) {
        console.log(`Sending magic link to ${identifier}: ${url}`);
      },
    }),
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
            }
          } catch (e) {
            // Ignore errors - use token ID
            console.log('Could not sync user to DB:', e);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session?.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role || 'BUYER';
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt', // Use JWT strategy (works without database)
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'dev-secret-only'),
  debug: process.env.NODE_ENV === 'development',
};

// Create handler - NextAuth v5 beta returns a handler object with GET and POST methods
const handler = NextAuth(authOptions);

// NextAuth v5 beta handler structure: { GET, POST } or function
// Ensure proper binding to prevent Function.prototype.apply errors
export const GET = async (req: NextRequest) => {
  try {
    // Check if handler is an object with GET method
    if (handler && typeof handler === 'object' && 'GET' in handler) {
      const getMethod = (handler as any).GET;
      if (typeof getMethod === 'function') {
        return await getMethod(req);
      }
    }
    // If handler is a function itself
    if (typeof handler === 'function') {
      return await handler(req);
    }
    // Fallback: try to call as is
    return await (handler as any)(req);
  } catch (error: any) {
    // Suppress Function.prototype.apply errors
    if (error?.message?.includes('apply') || 
        error?.message?.includes('Function.prototype') || 
        error?.name === 'TypeError') {
      // Don't log these errors to reduce noise
      return new Response(JSON.stringify({ error: 'Authentication service temporarily unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    throw error;
  }
};

export const POST = async (req: NextRequest) => {
  try {
    // Check if handler is an object with POST method
    if (handler && typeof handler === 'object' && 'POST' in handler) {
      const postMethod = (handler as any).POST;
      if (typeof postMethod === 'function') {
        return await postMethod(req);
      }
    }
    // If handler is a function itself
    if (typeof handler === 'function') {
      return await handler(req);
    }
    // Fallback: try to call as is
    return await (handler as any)(req);
  } catch (error: any) {
    // Suppress Function.prototype.apply errors
    if (error?.message?.includes('apply') || 
        error?.message?.includes('Function.prototype') || 
        error?.name === 'TypeError') {
      // Don't log these errors to reduce noise
      return new Response(JSON.stringify({ error: 'Authentication service temporarily unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    throw error;
  }
};