'use client';

import { motion } from 'framer-motion';
import { MapPin, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingState from '@/components/common/LoadingState';

interface AddressesPageClientProps {
  locale: string;
}

export default function AddressesPageClient({ locale }: AddressesPageClientProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/auth/signin?callbackUrl=/${locale}/profile/addresses`);
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
      title: 'عناويني',
      empty: 'لا توجد عناوين محفوظة',
      emptyDesc: 'أضف عنواناً لتسهيل عملية الشراء',
      addAddress: 'إضافة عنوان',
    },
    en: {
      title: 'My Addresses',
      empty: 'No saved addresses',
      emptyDesc: 'Add an address to make checkout easier',
      addAddress: 'Add Address',
    },
    zh: {
      title: '我的地址',
      empty: '没有保存的地址',
      emptyDesc: '添加地址以使结账更容易',
      addAddress: '添加地址',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4">
        <Link href={`/${locale}/profile`}>
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-5 h-5" style={{ transform: locale === 'ar' ? 'rotate(180deg)' : 'none' }} />
          </button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900 flex-1">{t.title}</h1>
        <button className="p-2 hover:bg-gray-100 rounded-full transition">
          <Plus className="w-5 h-5 text-primary-600" />
        </button>
      </div>

      {/* Empty State */}
      <div className="max-w-md mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t.empty}</h2>
          <p className="text-gray-600 mb-8">{t.emptyDesc}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            {t.addAddress}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
