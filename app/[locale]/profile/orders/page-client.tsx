'use client';

import { motion } from 'framer-motion';
import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingState from '@/components/common/LoadingState';

interface OrdersPageClientProps {
  locale: string;
}

export default function OrdersPageClient({ locale }: OrdersPageClientProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/auth/signin?callbackUrl=/${locale}/profile/orders`);
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
      title: 'طلباتي',
      empty: 'لا توجد طلبات بعد',
      emptyDesc: 'عندما تقوم بعملية شراء، ستظهر طلباتك هنا',
      shopNow: 'تسوق الآن',
    },
    en: {
      title: 'My Orders',
      empty: 'No orders yet',
      emptyDesc: 'When you make a purchase, your orders will appear here',
      shopNow: 'Shop Now',
    },
    zh: {
      title: '我的订单',
      empty: '还没有订单',
      emptyDesc: '当您进行购买时，您的订单将显示在这里',
      shopNow: '立即购物',
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
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t.empty}</h2>
          <p className="text-gray-600 mb-8">{t.emptyDesc}</p>
          <Link href={`/${locale}/products`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold"
            >
              {t.shopNow}
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
