'use client';

import { motion } from 'framer-motion';
import { Settings, ArrowLeft, User, Bell, Globe, Shield, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingState from '@/components/common/LoadingState';

interface SettingsPageClientProps {
  locale: string;
}

export default function SettingsPageClient({ locale }: SettingsPageClientProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/auth/signin?callbackUrl=/${locale}/profile/settings`);
    }
  }, [user, loading, locale, router]);

  if (loading) {
    return <LoadingState fullScreen />;
  }

  if (!user) {
    return null;
  }

  const texts = {
    ar: {
      title: 'الإعدادات',
      profile: 'الملف الشخصي',
      notifications: 'الإشعارات',
      language: 'اللغة',
      privacy: 'الخصوصية والأمان',
      help: 'المساعدة والدعم',
      comingSoon: 'قريباً',
    },
    en: {
      title: 'Settings',
      profile: 'Profile',
      notifications: 'Notifications',
      language: 'Language',
      privacy: 'Privacy & Security',
      help: 'Help & Support',
      comingSoon: 'Coming Soon',
    },
    zh: {
      title: '设置',
      profile: '个人资料',
      notifications: '通知',
      language: '语言',
      privacy: '隐私和安全',
      help: '帮助和支持',
      comingSoon: '即将推出',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  const settingsItems = [
    { icon: User, label: t.profile, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { icon: Bell, label: t.notifications, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { icon: Globe, label: t.language, color: 'text-green-600', bgColor: 'bg-green-50' },
    { icon: Shield, label: t.privacy, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { icon: HelpCircle, label: t.help, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4">
        <Link href={`/${locale}/profile`}>
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-5 h-5" style={{ transform: locale === 'ar' ? 'rotate(180deg)' : 'none' }} />
          </button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
      </div>

      {/* Settings List */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {settingsItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: locale === 'ar' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all active:scale-98 flex items-center gap-4">
              <div className={`${item.bgColor} p-3 rounded-xl`}>
                <item.icon className={item.color} size={24} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-900">{item.label}</h3>
              </div>
              <span className="text-xs text-gray-400">{t.comingSoon}</span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
