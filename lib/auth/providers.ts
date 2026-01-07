/**
 * OWNER-EXTENSIBLE AUTHENTICATION PROVIDERS
 * 
 * TO ADD A 9TH PROVIDER:
 * 1. Add provider config to PROVIDERS array below
 * 2. Add env vars to .env.example
 * 3. Provider will auto-register if env vars are present
 */

import type { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';

// ============================================
// PROVIDER DEFINITIONS
// ============================================

export interface ProviderConfig {
  id: string;
  name: string;
  icon: string; // Brand icon component name
  color: string; // Brand color for UI
  envVars: {
    clientId: string;
    clientSecret: string;
  };
  // For custom providers (China), use Credentials flow
  isCustom?: boolean;
  customAuthUrl?: string;
}

export const PROVIDERS: ProviderConfig[] = [
  // Gate 1: Google (Global)
  {
    id: 'google',
    name: 'Google',
    icon: 'Google',
    color: '#4285F4',
    envVars: {
      clientId: 'GOOGLE_CLIENT_ID',
      clientSecret: 'GOOGLE_CLIENT_SECRET',
    },
  },
  // Gate 2: Apple (Global)
  {
    id: 'apple',
    name: 'Apple',
    icon: 'Apple',
    color: '#000000',
    envVars: {
      clientId: 'APPLE_CLIENT_ID',
      clientSecret: 'APPLE_CLIENT_SECRET',
    },
  },
  // Gate 3: Huawei ID (HarmonyOS)
  {
    id: 'huawei',
    name: 'Huawei ID',
    icon: 'Huawei',
    color: '#FF6900',
    isCustom: true,
    customAuthUrl: 'https://oauth-login.cloud.huawei.com/oauth2/v3/authorize',
    envVars: {
      clientId: 'HUAWEI_CLIENT_ID',
      clientSecret: 'HUAWEI_CLIENT_SECRET',
    },
  },
  // Gate 4: WeChat (China Social)
  {
    id: 'wechat',
    name: 'WeChat',
    icon: 'WeChat',
    color: '#07C160',
    isCustom: true,
    customAuthUrl: 'https://open.weixin.qq.com/connect/qrconnect',
    envVars: {
      clientId: 'WECHAT_APP_ID',
      clientSecret: 'WECHAT_APP_SECRET',
    },
  },
  // Gate 5: Alipay (China Commerce)
  {
    id: 'alipay',
    name: 'Alipay',
    icon: 'Alipay',
    color: '#1677FF',
    isCustom: true,
    customAuthUrl: 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm',
    envVars: {
      clientId: 'ALIPAY_APP_ID',
      clientSecret: 'ALIPAY_APP_SECRET',
    },
  },
  // Gate 6: QQ (China Gaming)
  {
    id: 'qq',
    name: 'QQ',
    icon: 'QQ',
    color: '#12B7F5',
    isCustom: true,
    customAuthUrl: 'https://graph.qq.com/oauth2.0/authorize',
    envVars: {
      clientId: 'QQ_APP_ID',
      clientSecret: 'QQ_APP_SECRET',
    },
  },
  // Gate 7: Douyin (China Video)
  {
    id: 'douyin',
    name: 'Douyin',
    icon: 'Douyin',
    color: '#000000',
    isCustom: true,
    customAuthUrl: 'https://open.douyin.com/platform/oauth/connect',
    envVars: {
      clientId: 'DOUYIN_CLIENT_KEY',
      clientSecret: 'DOUYIN_CLIENT_SECRET',
    },
  },
  // Gate 8: Weibo (China Microblogging)
  {
    id: 'weibo',
    name: 'Weibo',
    icon: 'Weibo',
    color: '#E6162D',
    isCustom: true,
    customAuthUrl: 'https://api.weibo.com/oauth2/authorize',
    envVars: {
      clientId: 'WEIBO_CLIENT_ID',
      clientSecret: 'WEIBO_CLIENT_SECRET',
    },
  },
];

// ============================================
// PROVIDER REGISTRATION
// ============================================

/**
 * Creates NextAuth provider instances based on available env vars
 */
export function createProviders(): NextAuthConfig['providers'] {
  const providers: any[] = [];

  for (const providerConfig of PROVIDERS) {
    const { id, name, envVars, isCustom, customAuthUrl } = providerConfig;
    const clientId = process.env[envVars.clientId];
    const clientSecret = process.env[envVars.clientSecret];

    // Skip if env vars not configured
    if (!clientId || !clientSecret) {
      continue;
    }

    if (isCustom) {
      // Custom providers use Credentials flow with OAuth code exchange
      providers.push(
        CredentialsProvider({
          id,
          name,
          credentials: {
            code: { label: 'Code', type: 'text' },
          },
          async authorize(credentials) {
            if (!credentials?.code) {
              return null;
            }

            try {
              // Exchange code for access token (implement per provider)
              const code = credentials.code || '';
              const user = await exchangeOAuthCode(id, code, {
                clientId: clientId!,
                clientSecret: clientSecret!,
                customAuthUrl: customAuthUrl || '',
              });

              return user;
            } catch (error) {
              console.error(`[${id}] Authorization error:`, error);
              return null;
            }
          },
        })
      );
    } else {
      // Standard OAuth providers
      switch (id) {
        case 'google':
          providers.push(
            GoogleProvider({
              clientId,
              clientSecret,
              allowDangerousEmailAccountLinking: true,
            })
          );
          break;
        case 'apple':
          providers.push(
            AppleProvider({
              clientId,
              clientSecret,
              allowDangerousEmailAccountLinking: true,
            })
          );
          break;
      }
    }
  }

  return providers;
}

// ============================================
// CUSTOM OAUTH CODE EXCHANGE
// ============================================

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  customAuthUrl?: string;
}

async function exchangeOAuthCode(
  providerId: string,
  code: string,
  config: OAuthConfig
): Promise<any> {
  // WeChat implementation
  if (providerId === 'wechat') {
    const tokenResponse = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.clientId}&secret=${config.clientSecret}&code=${code}&grant_type=authorization_code`
    );
    const tokenData = await tokenResponse.json();

    if (tokenData.errcode) {
      throw new Error(`WeChat token error: ${JSON.stringify(tokenData)}`);
    }

    const { access_token, openid } = tokenData;
    const userResponse = await fetch(
      `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`
    );
    const userData = await userResponse.json();

    if (userData.errcode) {
      throw new Error(`WeChat user info error: ${JSON.stringify(userData)}`);
    }

    return {
      id: openid,
      name: userData.nickname || 'WeChat User',
      email: `${openid}@wechat.banda-chao.com`,
      image: userData.headimgurl,
      provider: 'wechat',
    };
  }

  // Add other custom providers here following same pattern
  // Huawei, Alipay, QQ, Douyin, Weibo...

  throw new Error(`OAuth code exchange not implemented for ${providerId}`);
}

