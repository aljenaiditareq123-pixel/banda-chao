'use client';

import React, { useState } from 'react';
import { X, Search, Share2, Heart, Gift } from 'lucide-react';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';

interface PetState {
  id: string;
  hungerLevel: number;
  happinessLevel: number;
  lastFedAt: string | null;
  totalFeeds: number;
}

interface PetFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  petState: PetState;
  locale?: string;
  onFeed: (feedType: 'BROWSE' | 'SHARE' | 'DIRECT_FEED', metadata?: any) => void;
}

export default function PetFeedModal({
  isOpen,
  onClose,
  petState,
  locale = 'en',
  onFeed,
}: PetFeedModalProps) {
  const router = useRouter();
  const [browseCount, setBrowseCount] = useState(0);
  const [isFeeding, setIsFeeding] = useState(false);

  if (!isOpen) return null;

  const translations = {
    ar: {
      title: 'إطعام رفيقي 🐼',
      subtitle: 'اختر طريقة لإطعام رفيقك',
      browse: 'تصفح 5 منتجات',
      browseDesc: 'تصفح 5 منتجات مختلفة لإطعام رفيقك',
      share: 'شارك منتج',
      shareDesc: 'شارك منتج مع صديق لإطعام رفيقك',
      directFeed: 'إطعام مباشر',
      directFeedDesc: 'إطعام رفيقك مباشرة (متاح مرة واحدة يومياً)',
      currentHunger: 'الجوع الحالي',
      feedNow: 'إطعام الآن',
      browseProducts: 'تصفح المنتجات',
      close: 'إغلاق',
      reward: 'مكافأة',
      rewardDesc: 'عندما يكون رفيقك شبعان، ستحصل على كود خصم!',
    },
    zh: {
      title: '喂我的宠物 🐼',
      subtitle: '选择喂食方式',
      browse: '浏览5个产品',
      browseDesc: '浏览5个不同的产品来喂你的宠物',
      share: '分享产品',
      shareDesc: '与朋友分享产品来喂你的宠物',
      directFeed: '直接喂食',
      directFeedDesc: '直接喂你的宠物（每天一次）',
      currentHunger: '当前饥饿度',
      feedNow: '立即喂食',
      browseProducts: '浏览产品',
      close: '关闭',
      reward: '奖励',
      rewardDesc: '当你的宠物吃饱时，你会得到一个折扣码！',
    },
    en: {
      title: 'Feed My Pet 🐼',
      subtitle: 'Choose how to feed your pet',
      browse: 'Browse 5 Products',
      browseDesc: 'Browse 5 different products to feed your pet',
      share: 'Share a Product',
      shareDesc: 'Share a product with a friend to feed your pet',
      directFeed: 'Direct Feed',
      directFeedDesc: 'Feed your pet directly (once per day)',
      currentHunger: 'Current Hunger',
      feedNow: 'Feed Now',
      browseProducts: 'Browse Products',
      close: 'Close',
      reward: 'Reward',
      rewardDesc: 'When your pet is fully fed, you\'ll get a discount code!',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  const handleBrowse = () => {
    router.push(`/${locale}/products`);
    // Track browsing - this would be handled by a browsing tracker
    // For now, we'll use direct feed as fallback
    onFeed('BROWSE', { action: 'browse_products' });
    onClose();
  };

  const handleShare = () => {
    // This would open share modal or track sharing
    // For now, we'll use direct feed as fallback
    onFeed('SHARE', { action: 'share_product' });
    onClose();
  };

  const handleDirectFeed = async () => {
    setIsFeeding(true);
    try {
      await onFeed('DIRECT_FEED');
    } finally {
      setIsFeeding(false);
    }
  };

  const getPetExpression = () => {
    if (petState.hungerLevel >= 80) return '😊';
    if (petState.hungerLevel >= 50) return '😐';
    if (petState.hungerLevel >= 25) return '😟';
    return '😢';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Pet Status */}
        <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{getPetExpression()}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.currentHunger}: {petState.hungerLevel}%
              </p>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    petState.hungerLevel >= 80 ? 'bg-green-500' :
                    petState.hungerLevel >= 50 ? 'bg-yellow-500' :
                    petState.hungerLevel >= 25 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${petState.hungerLevel}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feed Options */}
        <div className="p-6 space-y-4">
          {/* Browse Option */}
          <button
            onClick={handleBrowse}
            className="w-full p-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-all text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{t.browse}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.browseDesc}</p>
              </div>
            </div>
          </button>

          {/* Share Option */}
          <button
            onClick={handleShare}
            className="w-full p-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-all text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Share2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{t.share}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.shareDesc}</p>
              </div>
            </div>
          </button>

          {/* Direct Feed Option */}
          <button
            onClick={handleDirectFeed}
            disabled={isFeeding}
            className="w-full p-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{t.directFeed}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.directFeedDesc}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Reward Info */}
        <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <Gift className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">{t.reward}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t.rewardDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
