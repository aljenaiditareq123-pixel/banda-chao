'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Gift } from 'lucide-react';
import DailyCheckIn from '@/components/games/DailyCheckIn';
import SpinWheel from '@/components/games/SpinWheel';
import { gamesAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface GamesPageClientProps {
  locale: string;
}

export default function GamesPageClient({ locale }: GamesPageClientProps) {
  const { user } = useAuth();
  const [gameStats, setGameStats] = useState<{
    points: number;
    level: number;
    streak: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGameStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadGameStats = async () => {
    try {
      const response = await gamesAPI.getStats();
      if (response.success) {
        setGameStats({
          points: response.points || 0,
          level: response.level || 1,
          streak: response.streak || 0,
        });
      }
    } catch (error) {
      console.error('Error loading game stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {locale === 'ar'
              ? 'يرجى تسجيل الدخول للوصول إلى مركز الألعاب'
              : locale === 'zh'
              ? '请登录以访问游戏中心'
              : 'Please log in to access the Games Center'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4"
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {locale === 'ar' ? 'مركز الألعاب' : locale === 'zh' ? '游戏中心' : 'Games Center'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {locale === 'ar'
              ? 'احصل على نقاط وجوائز يومياً!'
              : locale === 'zh'
              ? '每天获得积分和奖品！'
              : 'Earn points and prizes daily!'}
          </p>
        </div>

        {/* Stats Cards */}
        {gameStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {locale === 'ar' ? 'النقاط' : locale === 'zh' ? '积分' : 'Points'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {gameStats.points.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {locale === 'ar' ? 'المستوى' : locale === 'zh' ? '等级' : 'Level'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {gameStats.level}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {locale === 'ar' ? 'السلسلة' : locale === 'zh' ? '连续' : 'Streak'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {gameStats.streak} {locale === 'ar' ? 'يوم' : locale === 'zh' ? '天' : 'days'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Games Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Check-In */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <DailyCheckIn locale={locale} />
          </motion.div>

          {/* Spin Wheel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <SpinWheel locale={locale} />
          </motion.div>
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white"
        >
          <h3 className="text-xl font-bold mb-4">
            {locale === 'ar' ? 'كيف تعمل الألعاب؟' : locale === 'zh' ? '游戏如何运作？' : 'How Games Work?'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">
                {locale === 'ar' ? 'تسجيل الحضور' : locale === 'zh' ? '每日签到' : 'Daily Check-In'}
              </h4>
              <p className="text-sm text-white/90">
                {locale === 'ar'
                  ? 'سجل حضورك يومياً واحصل على نقاط. كلما زادت سلسلة الحضور، زادت المكافآت!'
                  : locale === 'zh'
                  ? '每天签到并获得积分。连续签到越多，奖励越多！'
                  : 'Check in daily and earn points. The longer your streak, the bigger the rewards!'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">
                {locale === 'ar' ? 'عجلة الحظ' : locale === 'zh' ? '幸运轮盘' : 'Spin Wheel'}
              </h4>
              <p className="text-sm text-white/90">
                {locale === 'ar'
                  ? 'ادور العجلة مرة واحدة يومياً واحصل على خصومات أو نقاط مجانية!'
                  : locale === 'zh'
                  ? '每天旋转一次轮盘，获得折扣或免费积分！'
                  : 'Spin the wheel once daily and win discounts or free points!'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
