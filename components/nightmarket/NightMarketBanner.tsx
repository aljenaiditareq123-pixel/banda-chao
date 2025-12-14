'use client';

import React, { useState, useEffect } from 'react';
import { useNightMarketContext } from '@/contexts/NightMarketContext';

interface NightMarketBannerProps {
  locale?: string;
}

export default function NightMarketBanner({ locale = 'en' }: NightMarketBannerProps) {
  const { isNightMarket, timeUntilNextChange } = useNightMarketContext();
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    // Check if user hid the banner in this session
    if (typeof window !== 'undefined') {
      const hidden = sessionStorage.getItem('night_market_banner_hidden') === 'true';
      setIsHidden(hidden);
    }
  }, []);

  if (!isNightMarket || isHidden) return null;

  const translations = {
    ar: {
      title: '🌙 سوق الباندا الليلي مفتوح!',
      subtitle: 'عروض خاصة وخصومات حصرية حتى 6 صباحاً',
      close: 'إغلاق',
    },
    zh: {
      title: '🌙 熊猫夜市开放！',
      subtitle: '特别优惠和独家折扣至早上6点',
      close: '关闭',
    },
    en: {
      title: '🌙 Panda Night Market is Open!',
      subtitle: 'Special offers and exclusive discounts until 6 AM',
      close: 'Close',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  // Format time until next change
  const hours = Math.floor(timeUntilNextChange / (1000 * 60 * 60));
  const minutes = Math.floor((timeUntilNextChange % (1000 * 60 * 60)) / (1000 * 60));
  const timeString = hours > 0 
    ? `${hours}h ${minutes}m`
    : `${minutes}m`;

  return (
    <div className="night-market-banner relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-pink-900 to-cyan-900 animate-gradient-shift opacity-90"></div>
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid-pattern"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Glowing icon */}
          <div className="text-3xl animate-pulse drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]">
            🌙
          </div>
          
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm md:text-base drop-shadow-lg">
              {t.title}
            </h3>
            <p className="text-cyan-200 text-xs md:text-sm opacity-90">
              {t.subtitle} • {locale === 'ar' ? 'ينتهي خلال' : locale === 'zh' ? '结束于' : 'Ends in'} {timeString}
            </p>
          </div>
        </div>

        {/* Glowing close button */}
        <button
          onClick={() => {
            // Hide banner for this session
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('night_market_banner_hidden', 'true');
              // Trigger re-render by removing class temporarily
              document.documentElement.classList.remove('night-market');
              setTimeout(() => {
                document.documentElement.classList.add('night-market');
              }, 100);
            }
          }}
          className="text-white hover:text-cyan-300 transition-colors px-2 py-1 rounded-lg hover:bg-white/10 backdrop-blur-sm"
          aria-label={t.close}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Animated border glow */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
    </div>
  );
}
