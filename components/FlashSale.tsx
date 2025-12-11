"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function FlashSale() {
  const { language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // حساب الوقت المتبقي حتى منتصف الليل
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const difference = endOfDay.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // تشغيل فوري

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-black text-yellow-400 py-2 px-4 flex flex-col sm:flex-row justify-center items-center gap-3 shadow-md z-40 relative">
      <div className="flex items-center gap-2">
        <span className="text-xl animate-pulse">⚡</span>
        <span className="font-bold text-sm sm:text-base tracking-wide text-white">
          {language === 'ar' 
            ? 'عروض باندا الخاطفة تنتهي خلال:' 
            : language === 'zh' 
            ? '熊猫闪购即将结束：'
            : 'Banda Flash Sale Ends In:'}
        </span>
      </div>
      
      <div className="flex items-center gap-2 font-mono text-lg font-black bg-red-600 px-3 py-1 rounded text-white shadow-inner transform -skew-x-12">
        <span>{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="animate-pulse">:</span>
        <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="animate-pulse">:</span>
        <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
      </div>

      <span className="hidden sm:inline-block text-xs font-bold bg-yellow-400 text-black px-2 py-0.5 rounded-full">
        {language === 'ar' 
          ? 'خصم يصل لـ 70%' 
          : language === 'zh' 
          ? '折扣高达70%'
          : 'Up to 70% OFF'}
      </span>
    </div>
  );
}
