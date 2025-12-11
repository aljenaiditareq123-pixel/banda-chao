"use client";

import React, { useState, useEffect } from 'react';
import { Users, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

interface GroupBuyCardProps {
  id?: string;
  image?: string;
  title?: string;
  singlePrice?: number;
  groupPrice?: number;
  href?: string;
  locale?: string;
}

export default function GroupBuyCard({
  id,
  image,
  title = "سماعات باندا المحيطية",
  singlePrice = 199,
  groupPrice = 99,
  href = "#",
  locale = 'ar',
}: GroupBuyCardProps) {
  const { language } = useLanguage();
  const currentLocale = locale || language;
  const [timeLeft, setTimeLeft] = useState(86400); // 24 hours in seconds
  const [showCelebration, setShowCelebration] = useState(false);

  // عداد تنازلي وهمي
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 86400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleGroupBuy = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
    // يمكن إضافة redirect أو modal هنا
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('ar-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const texts = {
    ar: {
      save: "توفير 50%",
      waiting: "ينتظرون شريكاً",
      single: "منفرد",
      groupBuy: "شراء جماعي",
      celebrate: "🎉 انضممت للمجموعة!",
    },
    zh: {
      save: "节省50%",
      waiting: "等待伙伴",
      single: "单独",
      groupBuy: "团购",
      celebrate: "🎉 已加入团队！",
    },
    en: {
      save: "Save 50%",
      waiting: "Waiting for partner",
      single: "Single",
      groupBuy: "Group Buy",
      celebrate: "🎉 Joined the group!",
    },
  };

  const t = texts[currentLocale as keyof typeof texts] || texts.en;
  const discount = Math.round(((singlePrice - groupPrice) / singlePrice) * 100);

  return (
    <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
      
      {/* صورة المنتج */}
      <Link href={href} className="block">
        <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 group cursor-pointer overflow-hidden">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-4xl">
              📦
            </div>
          )}
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-lg">
            {t.save}
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={href}>
          <h3 className="font-bold text-gray-800 text-lg mb-2 hover:text-red-600 transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
        
        {/* شريط الانضمام السريع */}
        <div className="flex items-center justify-between bg-orange-50 p-2 rounded-lg mb-4 border border-orange-100">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm">
              A
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm">
              B
            </div>
            <div className="w-8 h-8 rounded-full bg-red-100 border-2 border-white flex items-center justify-center text-red-500 text-xs font-bold shadow-sm animate-pulse">
              ?
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500">{t.waiting}</p>
            <div className="flex items-center gap-1 text-red-600 text-xs font-bold font-mono">
              <Clock size={12} />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* الأزرار المقارنة */}
        <div className="flex gap-3">
          {/* الشراء الفردي */}
          <Link href={href} className="flex-1">
            <button className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl flex flex-col items-center justify-center transition">
              <span className="text-gray-500 text-xs font-medium">{t.single}</span>
              <span className="text-gray-800 font-bold">{formatPrice(singlePrice)}</span>
            </button>
          </Link>

          {/* الشراء الجماعي (المميز) */}
          <button 
            onClick={handleGroupBuy}
            className="flex-[1.5] py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl flex flex-col items-center justify-center shadow-lg transform active:scale-95 transition relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <div className="flex items-center gap-1 z-10">
              <Users size={16} />
              <span className="text-xs font-medium opacity-90">{t.groupBuy}</span>
            </div>
            <span className="text-xl font-black z-10">{formatPrice(groupPrice)}</span>
          </button>
        </div>

        {/* Celebration Effect */}
        {showCelebration && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-50 rounded-3xl pointer-events-none">
            <div className="bg-white px-6 py-3 rounded-full shadow-2xl text-green-600 font-bold text-lg animate-bounce">
              {t.celebrate}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
