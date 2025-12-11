'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface SignInPageClientProps {
  locale: string;
}

export default function SignInPageClient({ locale }: SignInPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const callbackUrl = searchParams?.get('callbackUrl') || `/${locale}`;

  const texts = {
    ar: {
      welcome: 'مرحباً بك في',
      title: 'Banda Chao',
      subtitle: 'بوابة عالم الحرفيين المستقلين',
      description: 'اكتشف منتجات يدوية فريدة من حرفيين موهوبين حول العالم',
      guestButton: 'تجربة زائر',
      guestSubtext: 'دخول فوري للاختبار',
      wechatButton: 'دخول عبر WeChat',
      googleButton: 'دخول عبر Google',
      errorMessage: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    },
    en: {
      welcome: 'Welcome to',
      title: 'Banda Chao',
      subtitle: 'Gateway to Independent Makers',
      description: 'Discover unique handmade products from talented artisans around the world',
      guestButton: 'Try as Guest',
      guestSubtext: 'Instant login for testing',
      wechatButton: 'Sign in with WeChat',
      googleButton: 'Sign in with Google',
      errorMessage: 'An error occurred. Please try again.',
    },
    zh: {
      welcome: '欢迎来到',
      title: 'Banda Chao',
      subtitle: '独立手工艺人的门户',
      description: '发现来自世界各地才华横溢的手工艺人的独特手工产品',
      guestButton: '游客试用',
      guestSubtext: '即时登录测试',
      wechatButton: '使用微信登录',
      googleButton: '使用 Google 登录',
      errorMessage: '发生错误。请重试。',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  const handleGuestLogin = async () => {
    try {
      setLoading('guest');
      setError('');
      
      // Use 'credentials' as provider id (matches CredentialsProvider id)
      const result = await signIn('credentials', {
        callbackUrl,
        redirect: true,
      });

      if (result?.error) {
        setError(t.errorMessage);
        setLoading(null);
      }
    } catch (err) {
      setError(t.errorMessage);
      setLoading(null);
    }
  };

  const handleProviderSignIn = async (provider: string) => {
    try {
      setLoading(provider);
      setError('');

      if (provider === 'wechat') {
        const appId = process.env.NEXT_PUBLIC_WECHAT_APP_ID;
        if (!appId) {
          setError('WeChat is not configured. Please use Guest Login for now.');
          setLoading(null);
          return;
        }
        // WeChat redirect logic here
        return;
      }

      await signIn(provider, { callbackUrl, redirect: true });
    } catch (err) {
      setError(t.errorMessage);
      setLoading(null);
    }
  };

  // Check if already signed in
  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push(callbackUrl);
      }
    });
  }, [router, callbackUrl]);

  return (
    <div 
      className="min-h-screen flex relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Split Screen Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 relative z-10">
        
        {/* Left: Panda Welcome Section */}
        <motion.div
          initial={{ opacity: 0, x: locale === 'ar' ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex flex-col items-center justify-center p-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-9xl mb-8 filter drop-shadow-2xl"
          >
            🐼
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white text-5xl font-bold mb-4"
          >
            {t.welcome}
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-yellow-300 text-6xl font-black mb-4"
          >
            {t.title}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-white/90 text-xl mb-6"
          >
            {t.subtitle}
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-white/70 text-lg max-w-md"
          >
            {t.description}
          </motion.p>

          {/* Floating decorations */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 text-4xl opacity-30"
          >
            ✨
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute bottom-20 left-20 text-4xl opacity-30"
          >
            🎨
          </motion.div>
        </motion.div>

        {/* Right: Sign-in Options */}
        <motion.div
          initial={{ opacity: 0, x: locale === 'ar' ? -50 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 md:p-12 lg:p-16"
        >
          {/* Mobile: Title */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-7xl mb-4">🐼</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.welcome} {t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>

          {/* Desktop: Title */}
          <div className="hidden lg:block text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">ابدأ رحلتك</h2>
            <p className="text-gray-600">اختر طريقة الدخول المناسبة لك</p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-md bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-6 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="w-full max-w-md space-y-4">
            
            {/* Guest Experience Button - PRIMARY (Instant Login) */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGuestLogin}
              disabled={!!loading}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 text-white rounded-2xl px-8 py-6 flex flex-col items-center justify-center gap-2 font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              {loading === 'guest' ? (
                <>
                  <Loader2 className="animate-spin" size={28} />
                  <span>{locale === 'ar' ? 'جاري الدخول...' : locale === 'zh' ? '登录中...' : 'Logging in...'}</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-yellow-300" size={28} />
                    <span>{t.guestButton}</span>
                    <ArrowRight size={24} />
                  </div>
                  <span className="text-sm font-normal opacity-90">{t.guestSubtext}</span>
                </>
              )}
              {/* Shine effect */}
              <div className="absolute inset-0 -top-full group-hover:top-full transition-all duration-1000 bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
            </motion.button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  {locale === 'ar' ? 'أو' : locale === 'zh' ? '或' : 'or'}
                </span>
              </div>
            </div>

            {/* WeChat Button */}
            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleProviderSignIn('wechat')}
              disabled={!!loading || !process.env.NEXT_PUBLIC_WECHAT_APP_ID}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl px-6 py-4 flex items-center justify-center gap-3 font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'wechat' ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.597-6.348z"/>
                  </svg>
                  <span>{t.wechatButton}</span>
                </>
              )}
            </motion.button>

            {/* Google Button */}
            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleProviderSignIn('google')}
              disabled={!!loading || !process.env.GOOGLE_CLIENT_ID}
              className="w-full bg-white border-2 border-gray-300 rounded-xl px-6 py-4 flex items-center justify-center gap-3 font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'google' ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>{t.googleButton}</span>
                </>
              )}
            </motion.button>

            {/* Info text */}
            <p className="text-center text-xs text-gray-500 mt-6">
              {locale === 'ar' 
                ? 'للاستخدام الفوري، استخدم "تجربة زائر"' 
                : locale === 'zh' 
                ? '要立即使用，请使用"游客试用"'
                : 'For instant access, use "Try as Guest"'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
