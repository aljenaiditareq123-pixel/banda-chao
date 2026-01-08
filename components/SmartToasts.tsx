'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, TrendingUp, Gift, Star, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Toast {
  id: string;
  message: string;
  icon: React.ReactNode;
  timestamp: number;
}

// Chinese Names - Primary Market (1.5 Billion People)
const CHINESE_NAMES = [
  'Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao',
  'Wu', 'Zhou', 'Xu', 'Sun', 'Ma', 'Zhu', 'Hu', 'Guo',
  'He', 'Gao', 'Lin', 'Luo', 'Song', 'Zheng', 'Liang', 'Xie',
  'Tang', 'Han', 'Cao', 'Feng', 'Cui', 'Cheng', 'Pan', 'Peng'
];

// Major Chinese Cities - Showing Scale
const CHINESE_CITIES = [
  'Shanghai', 'Beijing', 'Shenzhen', 'Guangzhou', 'Yiwu', 'Hangzhou',
  'Chengdu', 'Wuhan', 'Xi\'an', 'Nanjing', 'Chongqing', 'Dongguan',
  'Tianjin', 'Qingdao', 'Suzhou', 'Xiamen', 'Foshan', 'Hefei'
];

// Products in different languages (but actors are always Chinese)
const PRODUCTS = {
  ar: [
    'ساعة ذكية', 'سماعات لاسلكية', 'حقيبة يد', 'نظارات شمسية',
    'سوار ذهبي', 'عطر فاخر', 'محفظة جلدية', 'ساعة فاخرة',
    'طقم مجوهرات', 'قميص حريري', 'حذاء رياضي', 'نظارة ذكية'
  ],
  zh: [
    '智能手表', '无线耳机', '手提包', '太阳镜',
    '金手镯', '香水', '皮夹', '豪华手表',
    '珠宝套装', '丝质衬衫', '运动鞋', '智能眼镜'
  ],
  en: [
    'Smart Watch', 'Wireless Earbuds', 'Handbag', 'Sunglasses',
    'Gold Bracelet', 'Luxury Perfume', 'Leather Wallet', 'Premium Watch',
    'Jewelry Set', 'Silk Shirt', 'Sports Shoes', 'Smart Glasses'
  ]
};

const COUPON_TYPES = {
  ar: [
    'خصم 20%', 'خصم 30%', 'كوبون مجاني', 'شحن مجاني',
    'هدية مجانية', 'خصم 50%', 'كوبون ذهبي'
  ],
  zh: [
    '20% 折扣', '30% 折扣', '免费优惠券', '免费送货',
    '免费礼品', '50% 折扣', '黄金优惠券'
  ],
  en: [
    '20% Off', '30% Off', 'Free Coupon', 'Free Shipping',
    'Free Gift', '50% Off', 'Gold Coupon'
  ]
};

// Generate random toast messages - Chinese market focused
const generateToastMessage = (language: 'ar' | 'zh' | 'en' = 'en'): { message: string; icon: React.ReactNode } => {
  const randomName = CHINESE_NAMES[Math.floor(Math.random() * CHINESE_NAMES.length)];
  const randomCity = CHINESE_CITIES[Math.floor(Math.random() * CHINESE_CITIES.length)];
  const langProducts = PRODUCTS[language] || PRODUCTS.en;
  const langCoupons = COUPON_TYPES[language] || COUPON_TYPES.en;
  const randomProduct = langProducts[Math.floor(Math.random() * langProducts.length)];
  const randomCoupon = langCoupons[Math.floor(Math.random() * langCoupons.length)];
  const randomLevel = Math.floor(Math.random() * 50) + 1; // Level 1-50

  // Message templates based on language (actors are always Chinese)
  const templates = {
    ar: {
      bought: (name: string, city: string, product: string) => `${name} من ${city} اشترى ${product} للتو`,
      leveledUp: (name: string, level: number) => `${name} ارتقى إلى المستوى ${level}`,
      wonCoupon: (name: string, coupon: string) => `${name} ربح ${coupon}`,
      addedToCart: (name: string, product: string) => `${name} أضاف ${product} إلى السلة`,
      achievement: (name: string) => `${name} حقق إنجاز جديد! 🎉`,
    },
    zh: {
      bought: (name: string, city: string, product: string) => `${city} 的 ${name} 刚刚购买了 ${product}`,
      leveledUp: (name: string, level: number) => `${name} 升级到了 ${level} 级`,
      wonCoupon: (name: string, coupon: string) => `${name} 获得了 ${coupon}`,
      addedToCart: (name: string, product: string) => `${name} 将 ${product} 添加到购物车`,
      achievement: (name: string) => `${name} 达成了新成就！🎉`,
    },
    en: {
      bought: (name: string, city: string, product: string) => `${name} from ${city} just bought ${product}`,
      leveledUp: (name: string, level: number) => `${name} leveled up to Level ${level}`,
      wonCoupon: (name: string, coupon: string) => `${name} won ${coupon}`,
      addedToCart: (name: string, product: string) => `${name} added ${product} to cart`,
      achievement: (name: string) => `${name} unlocked a new achievement! 🎉`,
    },
  };

  const t = templates[language];

  const messageTypes = [
    {
      message: t.bought(randomName, randomCity, randomProduct),
      icon: <ShoppingBag className="w-4 h-4" />,
      probability: 0.45, // 45% chance - most common
    },
    {
      message: t.leveledUp(randomName, randomLevel),
      icon: <TrendingUp className="w-4 h-4" />,
      probability: 0.25, // 25% chance
    },
    {
      message: t.wonCoupon(randomName, randomCoupon),
      icon: <Gift className="w-4 h-4" />,
      probability: 0.2, // 20% chance
    },
    {
      message: t.addedToCart(randomName, randomProduct),
      icon: <Star className="w-4 h-4" />,
      probability: 0.08, // 8% chance
    },
    {
      message: t.achievement(randomName),
      icon: <Award className="w-4 h-4" />,
      probability: 0.02, // 2% chance - rare
    },
  ];

  // Select message type based on probability
  const rand = Math.random();
  let cumulative = 0;
  for (const type of messageTypes) {
    cumulative += type.probability;
    if (rand <= cumulative) {
      return { message: type.message, icon: type.icon };
    }
  }

  // Fallback to first type
  return messageTypes[0];
};

export default function SmartToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isRTL, setIsRTL] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { language } = useLanguage();

  // Prevent hydration mismatch - only run after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect RTL from document direction (only after mount)
  useEffect(() => {
    if (!mounted) return;

    const checkRTL = () => {
      if (typeof document === 'undefined') return;
      const dir = document.documentElement.dir || document.documentElement.getAttribute('dir');
      setIsRTL(dir === 'rtl');
    };

    checkRTL();
    // Watch for direction changes
    const observer = new MutationObserver(checkRTL);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
    });

    return () => observer.disconnect();
  }, [mounted]);

  // Generate new toasts at frequent intervals (showing high Chinese market traffic) - only after mount
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      const { message, icon } = generateToastMessage(language as 'ar' | 'zh' | 'en');
      const newToast: Toast = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        message,
        icon,
        timestamp: Date.now(),
      };

      setToasts((prev) => {
        // Keep maximum 4 toasts visible (increased to show more activity)
        const updated = [...prev, newToast].slice(-4);
        return updated;
      });
    }, 3000 + Math.random() * 2000); // Random interval between 3-5 seconds (simulates bustling Chinese marketplace traffic)

    return () => clearInterval(interval);
  }, [mounted, language]);

  // Auto-remove toasts after 5 seconds (shorter duration = higher turnover = more activity) - only after mount
  useEffect(() => {
    if (!mounted) return;

    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setToasts((prev) => prev.filter((toast) => now - toast.timestamp < 5000));
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, [mounted]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div
      className="fixed bottom-6 z-50 pointer-events-none"
      style={{
        [isRTL ? 'right' : 'left']: '24px',
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: isRTL ? 20 : -20, scale: 0.9 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
            className="mb-3 pointer-events-auto"
            style={{
              marginBottom: `${index * 8}px`,
            }}
          >
            <div
              className={`
                relative overflow-hidden group
                bg-gradient-to-br from-amber-50/90 via-yellow-50/90 to-orange-50/90
                dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20
                backdrop-blur-md
                border border-amber-200/50 dark:border-amber-700/50
                shadow-xl shadow-amber-900/20 dark:shadow-amber-950/40
                rounded-2xl
                px-4 py-3
                max-w-xs
                cursor-pointer
                hover:shadow-2xl hover:shadow-amber-900/30 dark:hover:shadow-amber-950/50
                transition-all duration-300
                ${isRTL ? 'text-right' : 'text-left'}
              `}
              onClick={() => removeToast(toast.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {/* Gold accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400" />

              {/* Content */}
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                    {toast.icon}
                  </div>
                </div>

                {/* Message */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-relaxed">
                    {toast.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {language === 'zh' ? '刚刚' : language === 'ar' ? 'الآن' : 'just now'}
                  </p>
                </div>

              </div>

              {/* Shine effect - subtle shimmer on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                   style={{
                     animation: 'shimmer 2s infinite',
                   }} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
