"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, MapPin, Package, CreditCard, ChevronRight, Award, Zap, Crown, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

export default function GamifiedProfile() {
  const { language } = useLanguage();

  // بيانات وهمية للمحاكاة
  const user = {
    name: language === 'ar' ? "أحمد الباندا" : language === 'zh' ? "熊猫阿明" : "Ahmed Panda",
    level: language === 'ar' ? "باندا فضي" : language === 'zh' ? "银熊猫" : "Silver Panda",
    xp: 75, // 75%
    nextLevel: language === 'ar' ? "باندا ذهبي" : language === 'zh' ? "金熊猫" : "Golden Panda",
    points: 1250,
    coupons: 3,
    balance: language === 'ar' ? "450 درهم" : language === 'zh' ? "450迪拉姆" : "AED 450"
  };

  const badges = [
    { 
      icon: Award, 
      label: language === 'ar' ? "موثوق" : language === 'zh' ? "可信" : "Trusted", 
      active: true, 
      color: "text-blue-400" 
    },
    { 
      icon: Zap, 
      label: language === 'ar' ? "سريع" : language === 'zh' ? "快速" : "Fast", 
      active: true, 
      color: "text-yellow-400" 
    },
    { 
      icon: Crown, 
      label: "VIP", 
      active: false, 
      color: "text-gray-500" 
    },
    { 
      icon: Users, 
      label: language === 'ar' ? "سفير" : language === 'zh' ? "大使" : "Ambassador", 
      active: false, 
      color: "text-gray-500" 
    },
  ];

  const texts = {
    ar: {
      currentXP: "الخبرة الحالية",
      next: "القادم:",
      remaining: "باقي 250 نقطة للترقية!",
      points: "النقاط",
      coupons: "الكوبونات",
      wallet: "المحفظة",
      myBadges: "أوسمتي",
      myOrders: "طلباتي",
      ordersSub: "2 قيد التوصيل",
      addresses: "عناويني",
      addressesSub: "المنزل، العمل",
      payment: "طرق الدفع",
      paymentSub: "Visa **4242",
    },
    zh: {
      currentXP: "当前经验",
      next: "下一个：",
      remaining: "还需250点升级！",
      points: "积分",
      coupons: "优惠券",
      wallet: "钱包",
      myBadges: "我的徽章",
      myOrders: "我的订单",
      ordersSub: "2个配送中",
      addresses: "我的地址",
      addressesSub: "家，工作",
      payment: "支付方式",
      paymentSub: "Visa **4242",
    },
    en: {
      currentXP: "Current XP",
      next: "Next:",
      remaining: "250 points to level up!",
      points: "Points",
      coupons: "Coupons",
      wallet: "Wallet",
      myBadges: "My Badges",
      myOrders: "My Orders",
      ordersSub: "2 in delivery",
      addresses: "My Addresses",
      addressesSub: "Home, Work",
      payment: "Payment Methods",
      paymentSub: "Visa **4242",
    },
  };

  const t = texts[language as keyof typeof texts] || texts.en;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* Header - منطقة المكانة والتباهي */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6 rounded-b-[2.5rem] shadow-2xl relative overflow-hidden">
        
        {/* تأثيرات خلفية */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="w-20 h-20 rounded-full border-4 border-yellow-500 p-1 relative">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-3xl">
              🐼
            </div>
            <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full border-2 border-gray-900 shadow-lg">
              Lv.3
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <div className="text-yellow-400 text-sm font-medium flex items-center gap-1">
              <Crown size={14} />
              {user.level}
            </div>
          </div>
          <button className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
            <Settings size={20} />
          </button>
        </div>

        {/* شريط التقدم */}
        <div className="mb-2 relative z-10">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{t.currentXP}</span>
            <span>{t.next} {user.nextLevel}</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${user.xp}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg"
            />
          </div>
          <p className="text-[10px] text-right mt-1 text-yellow-500/80">{t.remaining}</p>
        </div>
      </div>

      {/* Stats - إحصائيات الثروة */}
      <div className="grid grid-cols-3 gap-4 px-4 -mt-8 relative z-20">
        {[
          { label: t.points, value: user.points, color: "text-purple-600", bg: "bg-purple-50" },
          { label: t.coupons, value: user.coupons, color: "text-red-500", bg: "bg-red-50" },
          { label: t.wallet, value: user.balance, color: "text-green-600", bg: "bg-green-50" },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${stat.bg} p-3 rounded-2xl shadow-lg text-center flex flex-col items-center justify-center`}
          >
            <span className={`font-black text-lg ${stat.color}`}>{stat.value}</span>
            <span className="text-xs text-gray-600 font-medium">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Badges - لوحة الشرف */}
      <div className="px-4 mt-6">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Award className="text-yellow-500" size={20} />
          {t.myBadges}
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {badges.map((badge, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                badge.active 
                  ? 'bg-white border-yellow-100 shadow-sm hover:shadow-md' 
                  : 'bg-gray-100 border-transparent opacity-60 grayscale'
              }`}
            >
              <badge.icon size={24} className={`mb-1 ${badge.color}`} />
              <span className="text-[10px] font-bold text-center">{badge.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Menu - القائمة التقليدية */}
      <div className="px-4 mt-6 space-y-3">
        {[
          { icon: Package, label: t.myOrders, sub: t.ordersSub, href: '/orders' },
          { icon: MapPin, label: t.addresses, sub: t.addressesSub, href: '/addresses' },
          { icon: CreditCard, label: t.payment, sub: t.paymentSub, href: '/payment' },
        ].map((item, i) => (
          <Link key={i} href={item.href || '#'}>
            <motion.button 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="w-full bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between hover:bg-gray-50 transition active:scale-98"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-2 rounded-full text-gray-600">
                  <item.icon size={20} />
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">{item.label}</div>
                  <div className="text-xs text-gray-400">{item.sub}</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </motion.button>
          </Link>
        ))}
      </div>
    </div>
  );
}
