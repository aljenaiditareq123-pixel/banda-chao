"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingCart, User, Plus, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { language } = useLanguage();

  // دالة لتحديد هل الرابط نشط أم لا
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.includes(path)) return true;
    return false;
  };

  const texts = {
    ar: {
      home: 'الرئيسية',
      categories: 'الفئات',
      sellNow: 'بع الآن',
      cart: 'السلة',
      profile: 'حسابي',
    },
    zh: {
      home: '首页',
      categories: '分类',
      sellNow: '立即销售',
      cart: '购物车',
      profile: '我的',
    },
    en: {
      home: 'Home',
      categories: 'Categories',
      sellNow: 'Sell Now',
      cart: 'Cart',
      profile: 'Profile',
    },
  };

  const t = texts[language as keyof typeof texts] || texts.en;

  // استخراج locale من pathname
  const locale = pathname?.split('/')[1] || 'ar';
  const validLocale = ['ar', 'en', 'zh'].includes(locale) ? locale : 'ar';

  const navItems = [
    { icon: Home, label: t.home, path: `/${validLocale}` },
    { icon: LayoutGrid, label: t.categories, path: `/${validLocale}/products` },
    // الزر الأوسط (فراغ لأنه سيعالج بشكل خاص)
    { icon: null, label: '', path: '' }, 
    { icon: ShoppingCart, label: t.cart, path: `/${validLocale}/cart` },
    { icon: User, label: t.profile, path: `/${validLocale}/maker/dashboard` },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      
      {/* الشريط الخلفي */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]"></div>

      <div className="relative flex justify-around items-center h-16 px-2 pb-safe">
        
        {navItems.map((item, index) => {
          // معالجة الزر الأوسط (زر الصانع)
          if (index === 2) {
            return (
              <div key="maker-btn" className="relative -top-6">
                <Link href={`/${validLocale}/maker/studio`}>
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-16 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white text-black transition-colors"
                  >
                    <Plus size={32} strokeWidth={3} />
                  </motion.div>
                </Link>
                <span className="text-[10px] font-bold text-gray-500 absolute -bottom-4 left-1/2 -translate-x-1/2 w-max whitespace-nowrap">
                  {t.sellNow}
                </span>
              </div>
            );
          }

          // الأزرار العادية
          const active = isActive(item.path);
          const Icon = item.icon;
          
          if (!Icon) return null;

          return (
            <Link 
              key={index} 
              href={item.path} 
              className="flex flex-col items-center justify-center w-12 h-full gap-1"
            >
              <div className={`relative transition-colors duration-300 ${active ? 'text-black' : 'text-gray-400'}`}>
                <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                {active && (
                  <motion.div 
                    layoutId="nav-dot"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full"
                  />
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors ${active ? 'text-black font-bold' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
