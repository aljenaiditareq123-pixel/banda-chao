'use client';

import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface MapPlaceholderProps {
  from: string;
  to: string;
  locale: string;
}

export default function MapPlaceholder({ from, to, locale }: MapPlaceholderProps) {
  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 overflow-hidden">
      {/* Map Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 400 300" fill="none">
          <path
            d="M50 150 Q200 50 350 150"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="text-blue-600"
          />
          <circle cx="50" cy="150" r="8" fill="currentColor" className="text-green-600" />
          <circle cx="350" cy="150" r="8" fill="currentColor" className="text-red-600" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {locale === 'ar' ? 'مسار الشحن' : locale === 'zh' ? '运输路线' : 'Shipping Route'}
          </h3>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {locale === 'ar' ? 'من' : locale === 'zh' ? '从' : 'From'}
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">{from}</p>
            </div>
          </div>

          <div className="flex-1 mx-4">
            <div className="h-0.5 bg-gradient-to-r from-green-500 via-blue-500 to-red-500"></div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {locale === 'ar' ? 'إلى' : locale === 'zh' ? '到' : 'To'}
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">{to}</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {locale === 'ar'
              ? 'سيتم إضافة خريطة تفاعلية قريباً'
              : locale === 'zh'
              ? '即将添加交互式地图'
              : 'Interactive map coming soon'}
          </p>
        </div>
      </div>
    </div>
  );
}
