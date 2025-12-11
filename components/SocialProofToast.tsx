"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ShoppingBag, CheckCircle2, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// بيانات عشوائية للمحاكاة
const names = {
  ar: ["محمد", "سارة", "عبدالله", "نورة", "فهد", "ليلى", "خالد", "ريم", "يوسف", "مريم"],
  zh: ["Li Wei", "Chen", "Zhang", "Wang", "Liu", "Yang", "Huang", "Zhou", "Wu", "Xu"],
  en: ["Ahmed", "Sarah", "Ali", "Fatima", "Omar", "Layla", "Hassan", "Aisha", "Yusuf", "Mariam"],
};

const cities = {
  ar: ["دبي", "الرياض", "جدة", "الدوحة", "أبوظبي", "الكويت", "المنامة", "مسقط"],
  zh: ["بكين", "شنغهاي", "Guangzhou", "Shenzhen", "Hangzhou", "Chengdu", "Wuhan", "Xi'an"],
  en: ["Dubai", "Riyadh", "Beijing", "Shanghai", "Doha", "Abu Dhabi", "Kuwait", "Manama"],
};

const products = {
  ar: ["سماعة باندا", "ساعة ذكية", "حقيبة سفر", "شاحن سريع", "طقم شاي", "حذاء رياضي", "نظارة شمسية", "محفظة جلدية"],
  zh: ["熊猫耳机", "智能手表", "旅行包", "快速充电器", "茶具", "运动鞋", "太阳镜", "皮钱包"],
  en: ["Panda Headphones", "Smart Watch", "Travel Bag", "Fast Charger", "Tea Set", "Sports Shoes", "Sunglasses", "Leather Wallet"],
};

const actions = {
  ar: {
    bought: "اشترى",
    ordered: "طلب",
    rated: "قيّم 5 نجوم",
    reviewed: "قيّم",
  },
  zh: {
    bought: "购买了",
    ordered: "订购了",
    rated: "评价了5星",
    reviewed: "评价了",
  },
  en: {
    bought: "bought",
    ordered: "ordered",
    rated: "rated 5 stars",
    reviewed: "reviewed",
  },
};

export default function SocialProofToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState({ name: "", city: "", product: "", action: "", isRated: false });
  const pathname = usePathname();
  const { language } = useLanguage();

  // إخفاء الإشعار في صفحات حساسة
  const isHiddenPage = pathname?.includes('/checkout') || 
                       pathname?.includes('/login') || 
                       pathname?.includes('/register') ||
                       pathname?.includes('/auth');

  useEffect(() => {
    if (isHiddenPage) {
      setIsVisible(false);
      return;
    }

    const showRandomToast = () => {
      // اختيار بيانات عشوائية بناءً على اللغة
      const langNames = names[language as keyof typeof names] || names.en;
      const langCities = cities[language as keyof typeof cities] || cities.en;
      const langProducts = products[language as keyof typeof products] || products.en;
      const langActions = actions[language as keyof typeof actions] || actions.en;

      const name = langNames[Math.floor(Math.random() * langNames.length)];
      const city = langCities[Math.floor(Math.random() * langCities.length)];
      const product = langProducts[Math.floor(Math.random() * langProducts.length)];
      
      // اختيار نوع الإجراء (شراء أو تقييم)
      const actionTypes = ['bought', 'ordered', 'rated'] as const;
      const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
      const action = langActions[actionType];
      const isRated = actionType === 'rated';

      setData({ name, city, product, action, isRated });
      setIsVisible(true);

      // إخفاء بعد 4 ثواني
      setTimeout(() => {
        setIsVisible(false);
      }, 4000);
    };

    // تشغيل أول مرة بعد ثانيتين
    const initialTimeout = setTimeout(showRandomToast, 2000);

    // تكرار العملية كل 8-15 ثانية بشكل عشوائي
    const interval = setInterval(() => {
      showRandomToast();
    }, Math.random() * 7000 + 8000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isHiddenPage, language]);

  if (isHiddenPage) return null;

  const texts = {
    ar: {
      justNow: "للتو",
      from: "من",
    },
    zh: {
      justNow: "刚刚",
      from: "来自",
    },
    en: {
      justNow: "just now",
      from: "from",
    },
  };

  const t = texts[language as keyof typeof texts] || texts.en;

  return (
    <div className="fixed top-24 left-4 z-40 pointer-events-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-full p-2 pr-5 pl-2 flex items-center gap-3 w-max max-w-[320px] pointer-events-auto hover:shadow-2xl transition-shadow"
          >
            {/* الصورة الرمزية */}
            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr flex items-center justify-center text-white shadow-sm shrink-0 ${
              data.isRated 
                ? 'from-yellow-400 to-orange-500' 
                : 'from-green-400 to-green-600'
            }`}>
              {data.isRated ? (
                <Star size={18} fill="currentColor" />
              ) : (
                <ShoppingBag size={18} />
              )}
            </div>

            {/* النص */}
            <div className="flex flex-col text-right rtl:text-right">
              <span className="text-[11px] text-gray-800 font-bold leading-tight">
                {data.name} {t.from} {data.city}
              </span>
              <span className="text-[10px] text-gray-500 truncate max-w-[180px]">
                {data.action} <span className="font-bold text-green-600">{data.product}</span> {t.justNow}
              </span>
            </div>

            {/* أيقونة التحقق */}
            <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white shadow-md">
              <CheckCircle2 size={10} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
