'use client';

import React, { useState, useEffect } from 'react';

interface DailyFengShuiProps {
  locale?: string;
  onColorChange?: (color: string, element: string) => void;
}

interface FengShuiData {
  color: string;
  colorName: {
    ar: string;
    zh: string;
    en: string;
  };
  element: string;
  elementName: {
    ar: string;
    zh: string;
    en: string;
  };
  emoji: string;
  description: {
    ar: string;
    zh: string;
    en: string;
  };
}

const fengShuiData: FengShuiData[] = [
  {
    color: 'red',
    colorName: { ar: 'أحمر', zh: '红色', en: 'Red' },
    element: 'fire',
    elementName: { ar: 'نار', zh: '火', en: 'Fire' },
    emoji: '🔥',
    description: {
      ar: 'اليوم يومك الميمون! الأحمر يجلب الطاقة والثروة.',
      zh: '今天是你的幸运日！红色带来能量和财富。',
      en: 'Today is your lucky day! Red brings energy and wealth.',
    },
  },
  {
    color: 'gold',
    colorName: { ar: 'ذهبي', zh: '金色', en: 'Gold' },
    element: 'metal',
    elementName: { ar: 'معدن', zh: '金', en: 'Metal' },
    emoji: '✨',
    description: {
      ar: 'الذهب يجلب الثروة والنجاح في الأعمال.',
      zh: '金色带来财富和商业成功。',
      en: 'Gold brings wealth and business success.',
    },
  },
  {
    color: 'green',
    colorName: { ar: 'أخضر', zh: '绿色', en: 'Green' },
    element: 'wood',
    elementName: { ar: 'خشب', zh: '木', en: 'Wood' },
    emoji: '🌳',
    description: {
      ar: 'الأخضر يجلب النمو والازدهار.',
      zh: '绿色带来成长和繁荣。',
      en: 'Green brings growth and prosperity.',
    },
  },
  {
    color: 'blue',
    colorName: { ar: 'أزرق', zh: '蓝色', en: 'Blue' },
    element: 'water',
    elementName: { ar: 'ماء', zh: '水', en: 'Water' },
    emoji: '💧',
    description: {
      ar: 'الأزرق يجلب السلام والحكمة.',
      zh: '蓝色带来和平与智慧。',
      en: 'Blue brings peace and wisdom.',
    },
  },
  {
    color: 'yellow',
    colorName: { ar: 'أصفر', zh: '黄色', en: 'Yellow' },
    element: 'earth',
    elementName: { ar: 'أرض', zh: '土', en: 'Earth' },
    emoji: '🌍',
    description: {
      ar: 'الأصفر يجلب الاستقرار والثقة.',
      zh: '黄色带来稳定和信任。',
      en: 'Yellow brings stability and trust.',
    },
  },
  {
    color: 'purple',
    colorName: { ar: 'بنفسجي', zh: '紫色', en: 'Purple' },
    element: 'fire',
    elementName: { ar: 'نار', zh: '火', en: 'Fire' },
    emoji: '💜',
    description: {
      ar: 'البنفسجي يجلب الإبداع والروحانية.',
      zh: '紫色带来创造力和灵性。',
      en: 'Purple brings creativity and spirituality.',
    },
  },
  {
    color: 'orange',
    colorName: { ar: 'برتقالي', zh: '橙色', en: 'Orange' },
    element: 'fire',
    elementName: { ar: 'نار', zh: '火', en: 'Fire' },
    emoji: '🧡',
    description: {
      ar: 'البرتقالي يجلب الفرح والحماس.',
      zh: '橙色带来快乐和热情。',
      en: 'Orange brings joy and enthusiasm.',
    },
  },
  {
    color: 'pink',
    colorName: { ar: 'وردي', zh: '粉色', en: 'Pink' },
    element: 'fire',
    elementName: { ar: 'نار', zh: '火', en: 'Fire' },
    emoji: '🌸',
    description: {
      ar: 'الوردي يجلب الحب والانسجام.',
      zh: '粉色带来爱与和谐。',
      en: 'Pink brings love and harmony.',
    },
  },
];

export default function DailyFengShui({ locale = 'en', onColorChange }: DailyFengShuiProps) {
  const [sessionData, setSessionData] = useState<FengShuiData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run after mount to prevent hydration mismatch
    if (!mounted) return;

    // Session-based: Get or create random luck for this session
    const sessionKey = 'feng_shui_session_luck';
    let selected: FengShuiData;
    
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(sessionKey);
      if (stored) {
        // Use stored session luck
        const parsed = JSON.parse(stored);
        selected = fengShuiData.find(d => d.color === parsed.color) || fengShuiData[0];
      } else {
        // Generate new random luck for this session
        const randomIndex = Math.floor(Math.random() * fengShuiData.length);
        selected = fengShuiData[randomIndex];
        sessionStorage.setItem(sessionKey, JSON.stringify({ color: selected.color, element: selected.element }));
      }
    } else {
      // Fallback for SSR
      selected = fengShuiData[0];
    }
    
    setSessionData(selected);
    
    if (onColorChange) {
      onColorChange(selected.color, selected.element);
    }
  }, [mounted, onColorChange]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted || !sessionData) return null;

  const t = {
    ar: {
      title: 'حظي اليوم',
      luckyColor: 'اللون الميمون',
      element: 'العنصر',
      close: 'إغلاق',
    },
    zh: {
      title: '我的今日运势',
      luckyColor: '幸运颜色',
      element: '元素',
      close: '关闭',
    },
    en: {
      title: 'My Daily Luck',
      luckyColor: 'Lucky Color',
      element: 'Element',
      close: 'Close',
    },
  };

  const translations = t[locale as keyof typeof t] || t.en;

  // Chinese aesthetic color gradients
  const colorGradients: Record<string, string> = {
    red: 'bg-gradient-to-r from-red-600 to-red-500',
    gold: 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-400',
    green: 'bg-gradient-to-r from-green-600 to-emerald-500',
    blue: 'bg-gradient-to-r from-blue-600 to-cyan-500',
    yellow: 'bg-gradient-to-r from-yellow-400 to-yellow-300',
    purple: 'bg-gradient-to-r from-purple-600 to-pink-500',
    orange: 'bg-gradient-to-r from-orange-500 to-red-500',
    pink: 'bg-gradient-to-r from-pink-500 to-rose-500',
  };

  return (
    <div className="relative">
      {/* Compact Widget - Chinese Style */}
      <div
        className={`w-full p-5 rounded-2xl shadow-xl transition-all hover:shadow-2xl transform hover:scale-[1.02] ${
          colorGradients[sessionData.color] || 'bg-gradient-to-r from-yellow-400 to-orange-500'
        } text-white border-2 border-white/20`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Large Icon */}
            <div className="text-5xl drop-shadow-lg">{sessionData.emoji}</div>
            
            {/* Info */}
            <div className="text-right" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              <h3 className="text-xl font-bold mb-1 drop-shadow-md">
                {locale === 'zh' ? '今日运势' : locale === 'ar' ? translations.title : translations.title}
              </h3>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <p className="text-xs opacity-90 mb-0.5">{translations.luckyColor}</p>
                  <p className="text-lg font-bold">
                    {sessionData.colorName[locale as keyof typeof sessionData.colorName] || sessionData.colorName.zh}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <p className="text-xs opacity-90 mb-0.5">{translations.element}</p>
                  <p className="text-lg font-bold">
                    {sessionData.elementName[locale as keyof typeof sessionData.elementName] || sessionData.elementName.zh}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Element */}
          <div className="text-4xl opacity-80">🔮</div>
        </div>
      </div>

      {/* Expanded Modal - Simplified Chinese Style */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsExpanded(false)}
          />

          {/* Modal */}
          <div
            className={`relative rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in fade-in zoom-in duration-200 ${
              colorGradients[sessionData.color] || 'bg-gradient-to-br from-yellow-400 to-orange-500'
            } text-white border-4 border-white/30`}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/30 hover:bg-white/40 transition-colors backdrop-blur-sm"
              aria-label={translations.close}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content - Chinese Aesthetic */}
            <div className="text-center">
              <div className="text-7xl mb-6 drop-shadow-2xl">{sessionData.emoji}</div>
              <h2 className="text-3xl font-bold mb-6 drop-shadow-md">
                {locale === 'zh' ? '今日运势' : translations.title}
              </h2>
              
              <div className="bg-white/25 backdrop-blur-md rounded-2xl p-6 mb-6 border-2 border-white/30">
                <div className="mb-4">
                  <p className="text-sm opacity-90 mb-2 font-medium">{translations.luckyColor}</p>
                  <p className="text-3xl font-bold drop-shadow-md">
                    {sessionData.colorName[locale as keyof typeof sessionData.colorName] || sessionData.colorName.zh}
                  </p>
                </div>
                <div className="pt-4 border-t border-white/30">
                  <p className="text-sm opacity-90 mb-2 font-medium">{translations.element}</p>
                  <p className="text-2xl font-semibold drop-shadow-md">
                    {sessionData.elementName[locale as keyof typeof sessionData.elementName] || sessionData.elementName.zh}
                  </p>
                </div>
              </div>

              <p className="text-base opacity-95 leading-relaxed mb-4 drop-shadow-sm">
                {sessionData.description[locale as keyof typeof sessionData.description] || sessionData.description.zh}
              </p>

              <div className="mt-6 pt-6 border-t border-white/30">
                <p className="text-sm opacity-90 font-medium">
                  {locale === 'ar'
                    ? '✨ ابحث عن 3 منتجات بهذا اللون للحظ الأفضل'
                    : locale === 'zh'
                    ? '✨ 寻找3个这个颜色的产品以获得最佳运气'
                    : '✨ Find 3 products in this color for best luck'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
