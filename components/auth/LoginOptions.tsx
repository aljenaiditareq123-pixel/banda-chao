'use client';

import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoginOptionsProps {
  locale: string;
  callbackUrl?: string;
  loadingProvider?: string | null;
  onProviderClick?: (providerId: string) => void;
}

// Brand Icons (SVG components)
const BrandIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Google: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  ),
  Apple: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  ),
  Huawei: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l8 4v8.64l-8 4-8-4V8.18l8-4z" />
    </svg>
  ),
  WeChat: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.597-6.348z" />
    </svg>
  ),
  Alipay: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.358 10.786c.156.426.24.878.24 1.348 0 2.287-1.856 4.141-4.143 4.141H12.03c-2.286 0-4.142-1.854-4.142-4.141 0-.47.084-.922.24-1.348H2.925v4.141C2.925 19.636 5.289 22 8.143 22h8.312c2.855 0 5.218-2.364 5.218-5.286v-4.141h-5.315zm-7.51-8.214c2.855 0 5.218 2.364 5.218 5.286v1.715h-5.218V8.073h5.218c.156-.426.24-.878.24-1.348 0-2.287-1.856-4.142-4.143-4.142H8.143c-2.286 0-4.142 1.855-4.142 4.142 0 .47.084.922.24 1.348h5.218v1.5H4.24c-.156.426-.24.878-.24 1.348 0 2.287 1.856 4.141 4.142 4.141h10.526c.156-.426.24-.878.24-1.348 0-2.287-1.856-4.141-4.143-4.141H8.143z" />
    </svg>
  ),
  QQ: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.895 12.495c-.266-.051-1.523-.277-2.13-.452-.561-.163-1.036-.276-1.365-.316-.407-.049-.624-.103-.624-.213 0-.102.159-.163.478-.163.492 0 1.036.113 1.644.346.07.041.148.02.193-.051l.32-.429c.075-.122.07-.276-.015-.385-.315-.405-.726-.668-1.23-.785-.51-.118-1.003-.108-1.479.03-.476.138-.858.388-1.146.749-.08.097-.096.23-.045.348l.23.449c.063.122.158.214.28.266.234.099.474.188.723.266.062.02.12.06.155.113l.338.47c.078.11.084.25.016.368l-.32.485c-.075.11-.198.176-.33.164-.624-.056-1.126-.21-1.505-.46-.516-.338-.79-.831-.82-1.479-.013-.28.03-.56.128-.83.094-.265.231-.51.41-.732.078-.097.095-.23.045-.348l-.27-.45c-.063-.122-.158-.214-.28-.266-.234-.099-.474-.188-.723-.266-.062-.02-.12-.06-.155-.113l-.338-.47c-.078-.11-.084-.25-.016-.368l.32-.485c.075-.11.198-.176.33-.164 1.275.114 2.31.554 3.102 1.32.8.773 1.2 1.74 1.2 2.904 0 .921-.4 1.737-1.2 2.449-.51.457-1.14.808-1.89 1.054-.266.087-.54.163-.82.23-.06.015-.115.058-.136.12l-.122.471c-.028.111.017.227.117.292.245.16.618.369 1.12.628.062.032.136.036.198.01.456-.192 1.01-.422 1.664-.69.494-.204.842-.348 1.044-.433.404-.17.672-.28.806-.33l.471-.184c.096-.038.16-.132.16-.236v-.471c0-.108-.067-.201-.16-.236z" />
    </svg>
  ),
  Douyin: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  ),
  Weibo: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.585 12.23c.28 0 .546-.008.807-.021-1.13-3.58.187-6.723 3.407-9.012 2.718-1.968 5.693-2.587 8.173-2.032.982.22 1.785.7 2.404 1.305.486.468.814 1.022 1.003 1.632.193.627.186 1.347-.027 2.092-.219.769-.618 1.51-1.193 2.208-1.18 1.424-2.983 2.517-5.365 3.256-2.333.721-5.01 1.062-7.934 1.062-.018 0-.037 0-.056 0C5.583 13.848 2.972 13.54.818 13.111c.602-1.857 1.771-3.444 3.451-4.702a9.884 9.884 0 0 1 5.316-1.779zm3.808-1.617c-3.64 1.684-5.48 4.956-4.648 8.678.695 3.084 3.444 4.96 6.137 4.19 1.648-.475 2.987-1.533 3.96-3.15 1.494-2.475 1.02-5.5-1.081-7.324-1.001-.862-2.291-1.394-3.368-1.394zm8.733-.413c.173 1.23-.263 2.44-1.222 3.38a5.84 5.84 0 0 1-4.017 1.637c-.174 0-.349-.007-.523-.02-.582-.052-1.143-.163-1.68-.331-.286-.09-.558-.194-.815-.312a6.94 6.94 0 0 1-1.05-.58c-.028-.018-.057-.036-.085-.056-.026-.018-.05-.037-.075-.056-.28-.2-.534-.415-.76-.645a7.87 7.87 0 0 1-1.365-1.91c-.06-.11-.117-.222-.17-.334-.035-.073-.068-.147-.1-.222-.066-.152-.126-.308-.18-.467-.022-.063-.042-.127-.061-.19-.154-.514-.247-1.046-.276-1.585a7.96 7.96 0 0 1 .333-2.29c.35-1.13 1.013-2.143 1.91-2.938.95-.838 2.12-1.296 3.358-1.32 1.31-.027 2.54.38 3.52 1.146.98.77 1.67 1.834 1.98 3.04.17.66.218 1.346.142 2.02z" />
    </svg>
  ),
};

// Provider configurations from providers.ts
const PROVIDER_CONFIGS = [
  { id: 'google', name: 'Google', icon: 'Google', color: '#4285F4' },
  { id: 'apple', name: 'Apple', icon: 'Apple', color: '#000000' },
  { id: 'huawei', name: 'Huawei ID', icon: 'Huawei', color: '#FF6900' },
  { id: 'wechat', name: 'WeChat', icon: 'WeChat', color: '#07C160' },
  { id: 'alipay', name: 'Alipay', icon: 'Alipay', color: '#1677FF' },
  { id: 'qq', name: 'QQ', icon: 'QQ', color: '#12B7F5' },
  { id: 'douyin', name: 'Douyin', icon: 'Douyin', color: '#000000' },
  { id: 'weibo', name: 'Weibo', icon: 'Weibo', color: '#E6162D' },
];

export default function LoginOptions({ locale, callbackUrl, loadingProvider, onProviderClick }: LoginOptionsProps) {
  const handleProviderClick = async (providerId: string) => {
    if (onProviderClick) {
      onProviderClick(providerId);
    }

    try {
      // Custom providers need special handling (WeChat, etc.)
      if (['wechat', 'huawei', 'alipay', 'qq', 'douyin', 'weibo'].includes(providerId)) {
        // Redirect to custom OAuth URL
        const provider = PROVIDER_CONFIGS.find(p => p.id === providerId);
        // TODO: Implement custom OAuth redirect logic
        console.warn(`Custom OAuth not yet implemented for ${providerId}`);
        return;
      }

      // Standard OAuth providers
      await signIn(providerId, { callbackUrl: callbackUrl || `/${locale}`, redirect: true });
    } catch (error) {
      console.error(`[${providerId}] Sign in error:`, error);
    }
  };

  const texts = {
    ar: {
      title: 'مرحباً بك في Banda Chao',
    },
    en: {
      title: 'Welcome to Banda Chao',
    },
    zh: {
      title: '欢迎来到 Banda Chao',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 flex items-center justify-center p-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-2xl">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12"
        >
          {t.title}
        </motion.h1>

        {/* Provider Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PROVIDER_CONFIGS.map((provider, index) => {
            const IconComponent = BrandIcons[provider.icon];
            const isLoading = loadingProvider === provider.id;

            return (
              <motion.button
                key={provider.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleProviderClick(provider.id)}
                disabled={!!loadingProvider}
                className="aspect-square bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center gap-3 p-6 disabled:opacity-50 disabled:cursor-not-allowed group"
                style={{
                  border: `2px solid ${provider.color}`,
                }}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={32} style={{ color: provider.color }} />
                ) : (
                  <>
                    {IconComponent && (
                      <div className="w-12 h-12 transition-transform group-hover:scale-110" style={{ color: provider.color }}>
                        <IconComponent className="w-full h-full" />
                      </div>
                    )}
                    <span className="text-xs font-semibold text-gray-700" style={{ color: provider.color }}>
                      {provider.name}
                    </span>
                  </>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

