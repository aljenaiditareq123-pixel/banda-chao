'use client';

import { useState } from 'react';

interface ChinaModeSuggestionsProps {
  onSuggestionClick: (text: string) => void;
}

/**
 * Quick action suggestions for China Mode
 * Appears below the mode selector when CHINA_MODE is active
 */
export default function ChinaModeSuggestions({ onSuggestionClick }: ChinaModeSuggestionsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const suggestions = [
    {
      text: 'اقترح لي خطة دخول السوق الصيني خلال 6 أشهر',
      icon: '📋',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900'
    },
    {
      text: 'اكتب لي وصفاً إعلانياً بالصينية لصفحة الهوم',
      icon: '✍️',
      color: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-900'
    },
    {
      text: 'اقترح أفكار فيديوهات قصيرة موجهة للمستخدم الصيني',
      icon: '🎬',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900'
    },
    {
      text: 'حلّل لي مخاطر الشحن من الصين إلى الخليج',
      icon: '🚚',
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-900'
    },
    {
      text: 'ما هي أفضل طرق بناء الثقة مع الحرفيين الصينيين؟',
      icon: '🤝',
      color: 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-900'
    },
    {
      text: 'اكتب لي عنواناً جذاباً بالصينية لمنتج يدوي',
      icon: '📝',
      color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-900'
    }
  ];

  return (
    <div className="mb-4">
      <p className="text-xs text-slate-600 mb-2 text-right rtl:text-left">
        اقتراحات سريعة لوضع الصين:
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`
              px-3 py-2 rounded-lg text-xs font-medium 
              border transition-all duration-200
              ${suggestion.color}
              ${hoveredIndex === index ? 'scale-105 shadow-md' : 'shadow-sm'}
            `}
          >
            <span className="mr-1 rtl:mr-0 rtl:ml-1">{suggestion.icon}</span>
            {suggestion.text}
          </button>
        ))}
      </div>
    </div>
  );
}

