'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, X, Check } from 'lucide-react';

interface ChineseSocialLoginProps {
  locale?: string;
  onProviderClick?: (provider: string) => void;
  className?: string;
}

export default function ChineseSocialLogin({
  locale = 'en',
  onProviderClick,
  className = '',
}: ChineseSocialLoginProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const handleProviderClick = async (provider: string, providerName: string) => {
    setLoading(provider);
    
    // Mock action - show toast notification
    const messages = {
      ar: {
        wechat: 'جارٍ إعادة التوجيه إلى WeChat...',
        alipay: 'جارٍ إعادة التوجيه إلى Alipay...',
        douyin: 'جارٍ إعادة التوجيه إلى Douyin...',
        qq: 'جارٍ إعادة التوجيه إلى QQ...',
        phone: 'جارٍ فتح نموذج تسجيل الدخول بالهاتف...',
      },
      zh: {
        wechat: '正在跳转到微信...',
        alipay: '正在跳转到支付宝...',
        douyin: '正在跳转到抖音...',
        qq: '正在跳转到QQ...',
        phone: '正在打开手机登录...',
      },
      en: {
        wechat: 'Redirecting to WeChat...',
        alipay: 'Redirecting to Alipay...',
        douyin: 'Redirecting to Douyin...',
        qq: 'Redirecting to QQ...',
        phone: 'Opening mobile login...',
      },
    };

    const t = messages[locale as keyof typeof messages] || messages.en;
    const message = t[provider as keyof typeof t] || `Redirecting to ${providerName}...`;

    // Show notification
    setNotification({ message, type: 'success' });
    setTimeout(() => setNotification(null), 2000);

    // Call custom handler if provided
    if (onProviderClick) {
      onProviderClick(provider);
    }

    // Simulate API call delay
    setTimeout(() => {
      setLoading(null);
      
      // In production, this would redirect to OAuth URL:
      // window.location.href = `/api/auth/${provider}`;
    }, 1500);
  };

  const texts = {
    ar: {
      title: 'تسجيل الدخول عبر',
      phoneLogin: 'تسجيل دخول بلمسة واحدة عبر الهاتف',
      or: 'أو',
    },
    zh: {
      title: '通过以下方式登录',
      phoneLogin: '一键手机登录',
      or: '或',
    },
    en: {
      title: 'Login with',
      phoneLogin: 'One-Click Mobile Login',
      or: 'or',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  // Provider configurations
  const providers = [
    {
      id: 'wechat',
      name: 'WeChat',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 4.138-1.98 6.37-2.024-.576-3.583-4.196-6.348-8.615-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 3.328c-1.901 0-3.607.832-4.81 2.156-.64.711-.99 1.565-.99 2.483 0 .918.35 1.772.99 2.484 1.203 1.323 2.909 2.155 4.81 2.155 1.284 0 2.49-.347 3.526-.955a.741.741 0 0 1 .618-.082l1.622.95c.06.035.127.052.192.052.088 0 .174-.035.237-.1a.303.303 0 0 0 .086-.204.422.422 0 0 0-.032-.151l-.408-1.545a.623.623 0 0 1 .227-.717c1.497-1.024 2.445-2.63 2.445-4.383 0-2.514-2.17-4.551-4.854-4.551zm-2.776 3.204c.396 0 .717.326.717.728a.722.722 0 0 1-.717.727.722.722 0 0 1-.717-.727c0-.402.321-.728.717-.728zm4.346 0c.396 0 .717.326.717.728a.722.722 0 0 1-.717.727.722.722 0 0 1-.717-.727c0-.402.321-.728.717-.728z"/>
        </svg>
      ),
      color: 'bg-[#07C160] hover:bg-[#06AD56]',
      textColor: 'text-white',
    },
    {
      id: 'alipay',
      name: 'Alipay',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M21.714 6.576c.178.676.282 1.378.282 2.11 0 4.237-3.123 7.782-7.284 8.474l-2.784-6.396c.668-.96 1.067-2.157 1.067-3.44 0-.91-.23-1.767-.634-2.518l9.353-.23zM15.517 3.05l-9.518.233c.92-1.062 2.293-1.742 3.837-1.742 1.712 0 3.24.822 4.238 2.097l1.443-.588zm-5.74 1.97c-.453.507-.785 1.117-.957 1.8l-2.563.063c.507-1.408 1.657-2.537 3.06-3.18-.67.633-1.207 1.47-1.54 2.317zm8.253.076l-2.623.064c.203.84.193 1.713-.023 2.487l2.623-.064c.28-.856.35-1.747.202-2.577l-.18.09zm-4.986 4.025l-2.623.064c.253 1.173.95 2.143 1.87 2.75l2.563-.063c-.29-.903-.39-1.837-.29-2.75l-.52-.001zm-4.796 3.8l-2.623.064c.93 1.49 2.433 2.547 4.156 3.063l-1.533 3.523C5.08 18.54 3.797 17.37 2.81 15.94l1.438-3.02zm8.05.147c-1.33.032-2.53.517-3.5 1.323l-2.563.063c1.22 1.247 2.93 2.05 4.816 2.253l1.247-2.87zm-4.03 1.17l1.863-4.283c.453.19.93.327 1.423.4l-1.863 4.283c-.493-.073-.97-.21-1.423-.4z"/>
        </svg>
      ),
      color: 'bg-[#1677FF] hover:bg-[#0958D9]',
      textColor: 'text-white',
    },
    {
      id: 'douyin',
      name: 'Douyin',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ),
      color: 'bg-black hover:bg-gray-900',
      textColor: 'text-white',
    },
    {
      id: 'qq',
      name: 'QQ',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12.032 12.63h-.038c-1.463.022-2.833-.598-3.838-1.53-.448-.43-.788-.947-1.017-1.513a6.071 6.071 0 0 1 .804-5.913 6.103 6.103 0 0 1 5.17-2.864c1.432.02 2.785.57 3.787 1.531a6.066 6.066 0 0 1 .786 5.913c-.25.623-.643 1.177-1.152 1.628-1.005.932-2.376 1.552-3.839 1.53zM5.848 16.561c.455-.12.923-.196 1.393-.226.295.266.616.51.96.73-.789.56-1.678 1.02-2.628 1.36.212-.61.455-1.21.725-1.794.096-.01.194-.02.29-.038zm12.293.038c.27.584.514 1.183.726 1.793-.95-.34-1.84-.8-2.629-1.36.345-.22.666-.464.96-.73.47.03.938.106 1.393.226.096.018.194.028.29.038zm-3.018 2.337c.89.37 1.814.68 2.767.92a15.15 15.15 0 0 1-2.767.922 13.8 13.8 0 0 1-2.623.242 13.88 13.88 0 0 1-2.623-.242 15.08 15.08 0 0 1-2.768-.922c.953-.24 1.878-.55 2.768-.92a13.8 13.8 0 0 1 2.623-.242c.872 0 1.738.082 2.623.242zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.818A9.818 9.818 0 1 1 21.818 12 9.828 9.828 0 0 1 12 21.818z"/>
        </svg>
      ),
      color: 'bg-[#12B7F5] hover:bg-[#0FA3D9]',
      textColor: 'text-white',
    },
  ];

  return (
    <div className={`w-full ${className}`}>
      {/* Title */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
        {t.title}
      </p>

      {/* Social Login Buttons */}
      <div className="flex items-center justify-center gap-3 mb-4">
        {providers.map((provider) => (
          <motion.button
            key={provider.id}
            type="button"
            onClick={() => handleProviderClick(provider.id, provider.name)}
            disabled={loading === provider.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`
              w-12 h-12 rounded-full ${provider.color} ${provider.textColor}
              flex items-center justify-center
              shadow-lg hover:shadow-xl
              transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
              relative overflow-hidden
            `}
            aria-label={`Login with ${provider.name}`}
          >
            {/* Loading spinner */}
            {loading === provider.id ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              provider.icon
            )}
            
            {/* Shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </motion.button>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
        <span className="text-xs text-gray-500 dark:text-gray-400">{t.or}</span>
        <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
      </div>

      {/* Phone Login Button */}
      <motion.button
        type="button"
        onClick={() => handleProviderClick('phone', 'Phone')}
        disabled={loading === 'phone'}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'phone' ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>
              {locale === 'ar' ? 'جارٍ المعالجة...' : locale === 'zh' ? '处理中...' : 'Processing...'}
            </span>
          </>
        ) : (
          <>
            <Smartphone className="w-5 h-5" />
            <span>{t.phoneLogin}</span>
          </>
        )}
      </motion.button>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 max-w-sm"
          >
            <Check className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="ml-auto w-5 h-5 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
