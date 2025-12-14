'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check, Gift, Flame, Sparkles } from 'lucide-react';
import { gamesAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
// @ts-ignore - canvas-confetti types may not be perfect
import confetti from 'canvas-confetti';

interface DailyCheckInProps {
  locale: string;
}

export default function DailyCheckIn({ locale }: DailyCheckInProps) {
  const { user } = useAuth();
  const [checkInStatus, setCheckInStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [weeklyHistory, setWeeklyHistory] = useState<boolean[]>([]);

  useEffect(() => {
    if (user) {
      loadCheckInStatus();
    }
  }, [user]);

  const loadCheckInStatus = async () => {
    try {
      const response = await gamesAPI.getCheckInStatus();
      if (response.success) {
        setCheckInStatus(response);
        setWeeklyHistory(response.weeklyHistory || []);
      }
    } catch (error) {
      console.error('Error loading check-in status:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!user || checkingIn) return;

    setCheckingIn(true);
    try {
      const response = await gamesAPI.performCheckIn();
      if (response.success) {
        // Celebrate!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Reload status
        await loadCheckInStatus();
      } else {
        alert(response.error || (locale === 'ar' ? 'حدث خطأ' : locale === 'zh' ? '出错了' : 'Error occurred'));
      }
    } catch (error) {
      console.error('Error checking in:', error);
      alert(locale === 'ar' ? 'حدث خطأ' : locale === 'zh' ? '出错了' : 'Error occurred');
    } finally {
      setCheckingIn(false);
    }
  };

  const dayNames = locale === 'ar'
    ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
    : locale === 'zh'
    ? ['日', '一', '二', '三', '四', '五', '六']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDayLabel = (index: number) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return dayNames[date.getDay()];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {locale === 'ar' ? 'تسجيل الحضور اليومي' : locale === 'zh' ? '每日签到' : 'Daily Check-In'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {locale === 'ar' ? 'سجل حضورك واحصل على نقاط!' : locale === 'zh' ? '签到并获得积分！' : 'Check in and earn points!'}
            </p>
          </div>
        </div>
        {checkInStatus?.streak > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
            <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              {checkInStatus.streak} {locale === 'ar' ? 'يوم' : locale === 'zh' ? '天' : 'days'}
            </span>
          </div>
        )}
      </div>

      {/* Weekly Calendar */}
      <div className="mb-6">
        <div className="grid grid-cols-7 gap-2">
          {weeklyHistory.map((checked, index) => (
            <div
              key={index}
              className={`flex flex-col items-center p-2 rounded-lg ${
                checked
                  ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                  : 'bg-gray-100 dark:bg-gray-700 border-2 border-transparent'
              }`}
            >
              <span className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {getDayLabel(index)}
              </span>
              {checked ? (
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Check-In Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCheckIn}
        disabled={checkInStatus?.hasCheckedIn || checkingIn}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          checkInStatus?.hasCheckedIn
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {checkingIn ? (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            {locale === 'ar' ? 'جاري التسجيل...' : locale === 'zh' ? '正在签到...' : 'Checking in...'}
          </span>
        ) : checkInStatus?.hasCheckedIn ? (
          <span className="flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            {locale === 'ar' ? 'تم التسجيل اليوم' : locale === 'zh' ? '今日已签到' : 'Already Checked In'}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Gift className="w-5 h-5" />
            {locale === 'ar' ? 'سجل حضورك الآن!' : locale === 'zh' ? '立即签到！' : 'Check In Now!'}
          </span>
        )}
      </motion.button>

      {/* Rewards Info */}
      {checkInStatus && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
            {locale === 'ar'
              ? `🎁 احصل على ${10 + Math.min((checkInStatus.streak || 0) * 2, 50)} نقطة ${checkInStatus.streak > 0 ? `+ ${Math.min((checkInStatus.streak || 0) * 2, 50)} مكافأة سلسلة` : ''}`
              : locale === 'zh'
              ? `🎁 获得 ${10 + Math.min((checkInStatus.streak || 0) * 2, 50)} 积分${checkInStatus.streak > 0 ? ` + ${Math.min((checkInStatus.streak || 0) * 2, 50)} 连续奖励` : ''}`
              : `🎁 Earn ${10 + Math.min((checkInStatus.streak || 0) * 2, 50)} points${checkInStatus.streak > 0 ? ` + ${Math.min((checkInStatus.streak || 0) * 2, 50)} streak bonus` : ''}`}
          </p>
        </div>
      )}
    </div>
  );
}
