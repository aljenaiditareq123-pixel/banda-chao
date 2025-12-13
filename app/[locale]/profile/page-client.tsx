'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  Package, 
  Heart, 
  MapPin, 
  Settings, 
  User, 
  ShoppingBag,
  ChevronRight,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import LoadingState from '@/components/common/LoadingState';

interface ProfilePageClientProps {
  locale: string;
}

export default function ProfilePageClient({ locale }: ProfilePageClientProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/auth/signin?callbackUrl=/${locale}/profile`);
    }
  }, [user, loading, locale, router]);

  if (loading) {
    return <LoadingState fullScreen />;
  }

  if (!user) {
    return null; // Will redirect
  }

  const texts = {
    ar: {
      title: 'حسابي',
      myOrders: 'طلباتي',
      wishlist: 'المفضلة',
      addresses: 'عناويني',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج',
      comingSoon: 'قريباً',
      ordersDesc: 'تتبع طلباتك',
      wishlistDesc: 'منتجاتك المفضلة',
      addressesDesc: 'إدارة العناوين',
      settingsDesc: 'إعدادات الحساب',
    },
    en: {
      title: 'My Account',
      myOrders: 'My Orders',
      wishlist: 'Wishlist',
      addresses: 'My Addresses',
      settings: 'Settings',
      logout: 'Sign Out',
      comingSoon: 'Coming Soon',
      ordersDesc: 'Track your orders',
      wishlistDesc: 'Your favorite products',
      addressesDesc: 'Manage addresses',
      settingsDesc: 'Account settings',
    },
    zh: {
      title: '我的账户',
      myOrders: '我的订单',
      wishlist: '收藏夹',
      addresses: '我的地址',
      settings: '设置',
      logout: '退出登录',
      comingSoon: '即将推出',
      ordersDesc: '跟踪您的订单',
      wishlistDesc: '您喜欢的产品',
      addressesDesc: '管理地址',
      settingsDesc: '账户设置',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  const menuItems = [
    {
      icon: Package,
      label: t.myOrders,
      desc: t.ordersDesc,
      href: `/${locale}/profile/orders`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Heart,
      label: t.wishlist,
      desc: t.wishlistDesc,
      href: `/${locale}/profile/wishlist`,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: MapPin,
      label: t.addresses,
      desc: t.addressesDesc,
      href: `/${locale}/profile/addresses`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Settings,
      label: t.settings,
      desc: t.settingsDesc,
      href: `/${locale}/profile/settings`,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('bandaChao_user');
    localStorage.removeItem('bandaChao_userRole');
    localStorage.removeItem('bandaChao_isLoggedIn');
    router.push(`/${locale}`);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header with User Info */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white pt-8 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">{t.title}</h1>
          
          {/* User Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
              {user.image || user.profilePicture ? (
                <img
                  src={user.image || user.profilePicture}
                  alt={user.name || 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">{user.name || user.email || 'User'}</h2>
              <p className="text-white/80 text-sm">{user.email || ''}</p>
              {user.role && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {user.role === 'MAKER' ? (locale === 'ar' ? 'صانع' : locale === 'zh' ? '手工艺人' : 'Maker') : 
                   user.role === 'FOUNDER' ? (locale === 'ar' ? 'مؤسس' : locale === 'zh' ? '创始人' : 'Founder') :
                   locale === 'ar' ? 'مشتري' : locale === 'zh' ? '买家' : 'Buyer'}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-3">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: locale === 'ar' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={item.href}>
              <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all active:scale-98 flex items-center gap-4">
                <div className={`${item.bgColor} p-3 rounded-xl`}>
                  <item.icon className={item.color} size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{item.label}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <ChevronRight 
                  className="text-gray-400" 
                  size={20}
                  style={{ transform: locale === 'ar' ? 'rotate(180deg)' : 'none' }}
                />
              </div>
            </Link>
          </motion.div>
        ))}

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, x: locale === 'ar' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: menuItems.length * 0.1 }}
        >
          <button
            onClick={handleLogout}
            className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all active:scale-98 flex items-center gap-4 text-red-600"
          >
            <div className="bg-red-50 p-3 rounded-xl">
              <LogOut className="text-red-600" size={24} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold">{t.logout}</h3>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
