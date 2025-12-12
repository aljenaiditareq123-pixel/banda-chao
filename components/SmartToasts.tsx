'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, TrendingUp, Gift, Star, Award } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  icon: React.ReactNode;
  timestamp: number;
}

// Dummy data for social proof
const ARABIC_NAMES = [
  'أحمد', 'فاطمة', 'محمد', 'سارة', 'علي', 'مريم', 'خالد', 'نورا',
  'عبدالله', 'ليلى', 'حسن', 'ريم', 'يوسف', 'هند', 'عمر', 'زينب',
  'طارق', 'دينا', 'ماجد', 'لينا', 'سامر', 'يارا', 'باسل', 'جنى'
];

const CITIES = [
  // UAE
  'دبي', 'أبوظبي', 'الشارقة', 'عجمان', 'رأس الخيمة',
  // China
  'بكين', 'شنغهاي', 'قوانغتشو', 'شينزن', 'هونغ كونغ',
  // Saudi Arabia
  'الرياض', 'جدة', 'الدمام', 'المدينة', 'مكة'
];

const PRODUCTS = [
  'ساعة ذكية', 'سماعات لاسلكية', 'حقيبة يد', 'نظارات شمسية',
  'سوار ذهبي', 'عطر فاخر', 'محفظة جلدية', 'ساعة فاخرة',
  'طقم مجوهرات', 'قميص حريري', 'حذاء رياضي', 'نظارة ذكية'
];

const COUPON_TYPES = [
  'خصم 20%', 'خصم 30%', 'كوبون مجاني', 'شحن مجاني',
  'هدية مجانية', 'خصم 50%', 'كوبون ذهبي'
];

// Generate random toast messages
const generateToastMessage = (): { message: string; icon: React.ReactNode } => {
  const randomName = ARABIC_NAMES[Math.floor(Math.random() * ARABIC_NAMES.length)];
  const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
  const randomProduct = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
  const randomCoupon = COUPON_TYPES[Math.floor(Math.random() * COUPON_TYPES.length)];
  const randomLevel = Math.floor(Math.random() * 50) + 1; // Level 1-50

  const messageTypes = [
    {
      message: `${randomName} من ${randomCity} اشترى ${randomProduct}`,
      icon: <ShoppingBag className="w-4 h-4" />,
      probability: 0.4, // 40% chance
    },
    {
      message: `${randomName} ارتقى إلى المستوى ${randomLevel}`,
      icon: <TrendingUp className="w-4 h-4" />,
      probability: 0.25, // 25% chance
    },
    {
      message: `${randomName} ربح ${randomCoupon}`,
      icon: <Gift className="w-4 h-4" />,
      probability: 0.2, // 20% chance
    },
    {
      message: `${randomName} أضاف ${randomProduct} إلى السلة`,
      icon: <Star className="w-4 h-4" />,
      probability: 0.1, // 10% chance
    },
    {
      message: `${randomName} حقق إنجاز جديد! 🎉`,
      icon: <Award className="w-4 h-4" />,
      probability: 0.05, // 5% chance
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

  // Detect RTL from document direction
  useEffect(() => {
    const checkRTL = () => {
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
  }, []);

  // Generate new toasts at intervals
  useEffect(() => {
    const interval = setInterval(() => {
      const { message, icon } = generateToastMessage();
      const newToast: Toast = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        message,
        icon,
        timestamp: Date.now(),
      };

      setToasts((prev) => {
        // Keep maximum 3 toasts visible
        const updated = [...prev, newToast].slice(-3);
        return updated;
      });
    }, 4000 + Math.random() * 2000); // Random interval between 4-6 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-remove toasts after 6 seconds
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setToasts((prev) => prev.filter((toast) => now - toast.timestamp < 6000));
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

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
                    الآن
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
