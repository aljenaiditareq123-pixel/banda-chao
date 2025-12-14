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
  const [todayData, setTodayData] = useState<FengShuiData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Get today's date as seed for consistent daily result
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    // Use seed to get consistent random selection for the day
    const index = seed % fengShuiData.length;
    const selected = fengShuiData[index];
    
    setTodayData(selected);
    
    if (onColorChange) {
      onColorChange(selected.color, selected.element);
    }
  }, [onColorChange]);

  if (!todayData) return null;

  const t = {
    ar: {
      title: 'حظي اليومي',
      luckyColor: 'اللون الميمون',
      element: 'العنصر',
      clickToSee: 'انقر لرؤية التفاصيل',
      close: 'إغلاق',
    },
    zh: {
      title: '我的每日运势',
      luckyColor: '幸运颜色',
      element: '元素',
      clickToSee: '点击查看详情',
      close: '关闭',
    },
    en: {
      title: 'My Daily Luck',
      luckyColor: 'Lucky Color',
      element: 'Element',
      clickToSee: 'Click to see details',
      close: 'Close',
    },
  };

  const translations = t[locale as keyof typeof t] || t.en;

  const colorClasses: Record<string, string> = {
    red: 'bg-red-500',
    gold: 'bg-yellow-400',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-300',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
  };

  return (
    <div className="relative">
      {/* Compact Widget */}
      <button
        onClick={() => setIsExpanded(true)}
        className={`w-full p-4 rounded-xl shadow-lg transition-all hover:shadow-xl transform hover:scale-105 ${
          colorClasses[todayData.color] || 'bg-gradient-to-r from-yellow-400 to-orange-500'
        } text-white`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{todayData.emoji}</div>
            <div className="text-right" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              <p className="text-sm font-medium opacity-90">{translations.title}</p>
              <p className="text-lg font-bold">
                {translations.luckyColor}: {todayData.colorName[locale as keyof typeof todayData.colorName] || todayData.colorName.en}
              </p>
            </div>
          </div>
          <div className="text-2xl">🔮</div>
        </div>
        <p className="text-xs mt-2 opacity-80 text-right" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          {translations.clickToSee}
        </p>
      </button>

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsExpanded(false)}
          />

          {/* Modal */}
          <div
            className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-in fade-in zoom-in duration-200 ${
              colorClasses[todayData.color] || 'bg-gradient-to-br from-yellow-400 to-orange-500'
            } text-white`}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label={translations.close}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="text-center">
              <div className="text-6xl mb-4">{todayData.emoji}</div>
              <h2 className="text-3xl font-bold mb-2">{translations.title}</h2>
              
              <div className="bg-white/20 rounded-xl p-4 mb-4 backdrop-blur-sm">
                <div className="mb-3">
                  <p className="text-sm opacity-90 mb-1">{translations.luckyColor}</p>
                  <p className="text-2xl font-bold">
                    {todayData.colorName[locale as keyof typeof todayData.colorName] || todayData.colorName.en}
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-90 mb-1">{translations.element}</p>
                  <p className="text-xl font-semibold">
                    {todayData.elementName[locale as keyof typeof todayData.elementName] || todayData.elementName.en}
                  </p>
                </div>
              </div>

              <p className="text-sm opacity-90 leading-relaxed">
                {todayData.description[locale as keyof typeof todayData.description] || todayData.description.en}
              </p>

              <div className="mt-6 pt-4 border-t border-white/20">
                <p className="text-xs opacity-75">
                  {locale === 'ar'
                    ? 'ابحث عن المنتجات بهذا اللون للحصول على حظ أفضل!'
                    : locale === 'zh'
                    ? '寻找这个颜色的产品以获得更好的运气！'
                    : 'Look for products in this color for better luck!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
