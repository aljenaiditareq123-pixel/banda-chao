'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Gift } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import PetFeedModal from './PetFeedModal';

interface PetState {
  id: string;
  hungerLevel: number;
  happinessLevel: number;
  lastFedAt: string | null;
  totalFeeds: number;
  recentFeeds?: Array<{
    id: string;
    type: string;
    amount: number;
    createdAt: string;
  }>;
}

interface BandaPetProps {
  locale?: string;
  position?: 'bottom-nav' | 'dashboard' | 'floating';
  size?: 'small' | 'medium' | 'large';
}

export default function BandaPet({ 
  locale = 'en', 
  position = 'floating',
  size = 'medium' 
}: BandaPetProps) {
  const { user } = useAuth();
  const [petState, setPetState] = useState<PetState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [showDiscountNotification, setShowDiscountNotification] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPetState();
      // Update hunger every minute
      const interval = setInterval(fetchPetState, 60000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPetState = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://banda-chao.onrender.com'}/api/v1/pet/state`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.pet) {
        setPetState(data.pet);
      }
    } catch (error) {
      console.error('Error fetching pet state:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeed = async (feedType: 'BROWSE' | 'SHARE' | 'DIRECT_FEED', metadata?: any) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://banda-chao.onrender.com'}/api/v1/pet/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          feedType,
          metadata,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPetState(data.pet);
        
        // Show discount notification if code was generated
        if (data.discountCode) {
          setDiscountCode(data.discountCode.code);
          setShowDiscountNotification(true);
          setTimeout(() => setShowDiscountNotification(false), 10000); // Hide after 10s
        }
        
        setIsFeedModalOpen(false);
      }
    } catch (error) {
      console.error('Error feeding pet:', error);
    }
  };

  if (!user || loading) {
    return null;
  }

  if (!petState) {
    return null;
  }

  // Determine pet expression based on hunger
  const getPetExpression = () => {
    if (petState.hungerLevel >= 80) return '😊'; // Happy
    if (petState.hungerLevel >= 50) return '😐'; // Neutral
    if (petState.hungerLevel >= 25) return '😟'; // Worried
    return '😢'; // Sad/Hungry
  };

  // Determine pet color based on hunger
  const getPetColor = () => {
    if (petState.hungerLevel >= 80) return 'bg-green-100 border-green-300';
    if (petState.hungerLevel >= 50) return 'bg-yellow-100 border-yellow-300';
    if (petState.hungerLevel >= 25) return 'bg-orange-100 border-orange-300';
    return 'bg-red-100 border-red-300';
  };

  const sizeClasses = {
    small: 'w-10 h-10 text-xl',
    medium: 'w-14 h-14 text-2xl',
    large: 'w-20 h-20 text-4xl',
  };

  const translations = {
    ar: {
      feed: 'إطعام',
      hungry: 'جائع',
      full: 'شبعان',
    },
    zh: {
      feed: '喂食',
      hungry: '饿了',
      full: '饱了',
    },
    en: {
      feed: 'Feed',
      hungry: 'Hungry',
      full: 'Full',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  // Floating position (bottom-right corner)
  if (position === 'floating') {
    return (
      <>
        <div className="fixed bottom-20 right-4 z-40 lg:bottom-24 lg:right-6">
          <button
            onClick={() => setIsFeedModalOpen(true)}
            className={`
              ${sizeClasses[size]}
              ${getPetColor()}
              rounded-full border-2 shadow-lg hover:shadow-xl transition-all
              flex items-center justify-center cursor-pointer
              hover:scale-110 active:scale-95
            `}
            title={`${t.feed} 🐼 (${petState.hungerLevel}%)`}
          >
            <span className="relative">
              {getPetExpression()}
              {petState.hungerLevel < 50 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </span>
          </button>
          
          {/* Hunger bar */}
          <div className="absolute -bottom-6 left-0 right-0 h-1 bg-gray-200 rounded-full overflow-hidden">
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

        {/* Discount Notification */}
        {showDiscountNotification && discountCode && (
          <div className="fixed bottom-32 right-4 z-50 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg shadow-xl animate-slide-up">
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5" />
              <div>
                <p className="font-bold text-sm">
                  {locale === 'ar' ? '🎉 مبروك! كود خصم:' : locale === 'zh' ? '🎉 恭喜！折扣码：' : '🎉 Congrats! Discount Code:'}
                </p>
                <p className="text-lg font-mono font-bold">{discountCode}</p>
              </div>
            </div>
          </div>
        )}

        <PetFeedModal
          isOpen={isFeedModalOpen}
          onClose={() => setIsFeedModalOpen(false)}
          petState={petState}
          locale={locale}
          onFeed={handleFeed}
        />
      </>
    );
  }

  // Bottom nav position (replace middle button or add as new item)
  if (position === 'bottom-nav') {
    return (
      <>
        <button
          onClick={() => setIsFeedModalOpen(true)}
          className="flex flex-col items-center justify-center w-12 h-full gap-1 relative"
        >
          <div className={`relative ${petState.hungerLevel < 50 ? 'animate-bounce' : ''}`}>
            <span className="text-2xl">{getPetExpression()}</span>
            {petState.hungerLevel < 50 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </div>
          <span className="text-[10px] font-medium text-gray-400">
            {locale === 'ar' ? 'الرفيق' : locale === 'zh' ? '宠物' : 'Pet'}
          </span>
        </button>

        <PetFeedModal
          isOpen={isFeedModalOpen}
          onClose={() => setIsFeedModalOpen(false)}
          petState={petState}
          locale={locale}
          onFeed={handleFeed}
        />
      </>
    );
  }

  // Dashboard position
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {locale === 'ar' ? '🐼 رفيقي' : locale === 'zh' ? '🐼 我的宠物' : '🐼 My Pet'}
        </h3>
        <button
          onClick={() => setIsFeedModalOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold"
        >
          {t.feed}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className={`
          ${sizeClasses.medium}
          ${getPetColor()}
          rounded-full border-2 flex items-center justify-center
        `}>
          <span className="text-4xl">{getPetExpression()}</span>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {locale === 'ar' ? 'الجوع' : locale === 'zh' ? '饥饿' : 'Hunger'}
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {petState.hungerLevel}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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

      <PetFeedModal
        isOpen={isFeedModalOpen}
        onClose={() => setIsFeedModalOpen(false)}
        petState={petState}
        locale={locale}
        onFeed={handleFeed}
      />
    </div>
  );
}
