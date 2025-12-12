'use client';

import React from 'react';
import { TrendingUp, Users, Package, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';

interface StatsCardsProps {
  locale: string;
  stats: {
    totalRevenue: number;
    activeGroupBuys: number;
    productsSold: number;
    shopRating: number;
  };
}

export default function MakerStatsCards({ locale, stats }: StatsCardsProps) {
  const cards = [
    {
      id: 'revenue',
      title: locale === 'ar' ? 'إجمالي الإيرادات' : locale === 'zh' ? '总收入' : 'Total Revenue',
      value: formatCurrency(stats.totalRevenue, 'AED', locale),
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-500/10 to-emerald-600/10',
      borderColor: 'border-green-500/30',
      trend: '+12.5%',
    },
    {
      id: 'groupBuys',
      title: locale === 'ar' ? 'شراء جماعي نشط' : locale === 'zh' ? '活跃团购' : 'Active Group Buys',
      value: `${stats.activeGroupBuys} ${locale === 'ar' ? 'فريق' : locale === 'zh' ? '团队' : 'Teams'}`,
      icon: Users,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-500/10 to-orange-600/10',
      borderColor: 'border-amber-500/30',
      trend: `${stats.activeGroupBuys > 0 ? '+' : ''}${stats.activeGroupBuys}`,
    },
    {
      id: 'productsSold',
      title: locale === 'ar' ? 'المنتجات المباعة' : locale === 'zh' ? '已售产品' : 'Products Sold',
      value: `${stats.productsSold} ${locale === 'ar' ? 'قطعة' : locale === 'zh' ? '件' : 'items'}`,
      icon: Package,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-500/10 to-cyan-600/10',
      borderColor: 'border-blue-500/30',
      trend: '+8.2%',
    },
    {
      id: 'rating',
      title: locale === 'ar' ? 'تقييم المتجر' : locale === 'zh' ? '商店评分' : 'Shop Rating',
      value: `${stats.shopRating.toFixed(1)}/5`,
      icon: Star,
      gradient: 'from-yellow-500 to-amber-600',
      bgGradient: 'from-yellow-500/10 to-amber-600/10',
      borderColor: 'border-yellow-500/30',
      trend: `${stats.shopRating >= 4.5 ? '⭐' : '✨'}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`
              relative overflow-hidden rounded-2xl border-2 ${card.borderColor}
              bg-gradient-to-br ${card.bgGradient} backdrop-blur-sm
              p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
            `}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-gradient-to-r ${card.bgGradient} ${card.borderColor} border text-amber-300`}>
                  {card.trend}
                </span>
              </div>
              
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                {card.title}
              </h3>
              
              <p className="text-3xl font-black text-white mb-1">
                {card.value}
              </p>
              
              {card.id === 'revenue' && (
                <p className="text-xs text-green-400 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {locale === 'ar' ? 'نمو إيجابي' : locale === 'zh' ? '正增长' : 'Trending Up'}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
