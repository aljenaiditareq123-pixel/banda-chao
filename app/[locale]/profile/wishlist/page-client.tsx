'use client';

import { motion } from 'framer-motion';
import { Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingState from '@/components/common/LoadingState';

interface WishlistPageClientProps {
  locale: string;
}

export default function WishlistPageClient({ locale }: WishlistPageClientProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/auth/signin?callbackUrl=/${locale}/profile/wishlist`);
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
      title: 'المفضلة',
      empty: 'قائمة المفضلة فارغة',
      emptyDesc: 'أضف المنتجات التي تحبها إلى قائمة المفضلة',
      browseProducts: 'تصفح المنتجات',
    },
    en: {
      title: 'Wishlist',
      empty: 'Your wishlist is empty',
      emptyDesc: 'Add products you love to your wishlist',
      browseProducts: 'Browse Products',
    },
    zh: {
      title: '收藏夹',
      empty: '您的收藏夹是空的',
      emptyDesc: '将您喜欢的产品添加到收藏夹',
      browseProducts: '浏览产品',
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
        <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
      </div>

      {/* Empty State */}
      <div className="max-w-md mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t.empty}</h2>
          <p className="text-gray-600 mb-8">{t.emptyDesc}</p>
          <Link href={`/${locale}/products`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold"
            >
              {t.browseProducts}
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
