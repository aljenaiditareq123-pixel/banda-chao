'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Gift, Sparkles, X } from 'lucide-react';
import { gamesAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
// @ts-ignore - canvas-confetti types may not be perfect
import confetti from 'canvas-confetti';

interface SpinWheelProps {
  locale: string;
}

const PRIZES = [
  { label: '20% OFF', color: '#FF6B6B', type: 'discount', value: 20 },
  { label: '10% OFF', color: '#4ECDC4', type: 'discount', value: 10 },
  { label: '5% OFF', color: '#95E1D3', type: 'discount', value: 5 },
  { label: '200 Points', color: '#F38181', type: 'points', value: 200 },
  { label: '100 Points', color: '#AA96DA', type: 'points', value: 100 },
  { label: '50 Points', color: '#FCBAD3', type: 'points', value: 50 },
  { label: 'Try Again', color: '#C7CEEA', type: 'nothing', value: 0 },
  { label: 'Try Again', color: '#FFD3A5', type: 'nothing', value: 0 },
];

export default function SpinWheel({ locale }: SpinWheelProps) {
  const { user } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const wheelRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  useEffect(() => {
    checkSpinStatus();
  }, [user]);

  const checkSpinStatus = async () => {
    // Check if user can spin today (would need API endpoint)
    // For now, assume they can spin
    setCanSpin(true);
  };

  const handleSpin = async () => {
    if (!user || spinning || !canSpin) return;

    setSpinning(true);
    setResult(null);
    setShowResult(false);

    try {
      // Call API to get result (server-side RNG)
      const response = await gamesAPI.spinWheel();

      if (response.success && response.result) {
        // Find prize index
        const prizeIndex = PRIZES.findIndex(
          (p) => p.type === response.result.prizeType && p.value === response.result.value
        );

        // Calculate rotation (multiple full spins + prize position)
        const fullSpins = 5; // 5 full rotations
        const prizeAngle = (360 / PRIZES.length) * prizeIndex;
        const totalRotation = fullSpins * 360 + (360 - prizeAngle) + 180 / PRIZES.length;

        // Animate wheel
        await controls.start({
          rotate: totalRotation,
          transition: {
            duration: 3,
            ease: [0.17, 0.67, 0.83, 0.67], // Ease out cubic
          },
        });

        // Show result
        setResult(response.result);
        setShowResult(true);
        setCanSpin(false);

        // Celebrate if won something
        if (response.result.prizeType !== 'nothing') {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.5 },
          });
        }
      } else {
        alert(response.error || (locale === 'ar' ? 'حدث خطأ' : locale === 'zh' ? '出错了' : 'Error occurred'));
      }
    } catch (error) {
      console.error('Error spinning wheel:', error);
      alert(locale === 'ar' ? 'حدث خطأ' : locale === 'zh' ? '出错了' : 'Error occurred');
    } finally {
      setSpinning(false);
    }
  };

  const resetWheel = () => {
    controls.set({ rotate: 0 });
    setResult(null);
    setShowResult(false);
  };

  const prizeAngle = 360 / PRIZES.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {locale === 'ar' ? 'عجلة الحظ' : locale === 'zh' ? '幸运轮盘' : 'Spin the Wheel'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {locale === 'ar' ? 'ادور واحصل على جائزة!' : locale === 'zh' ? '旋转并获得奖品！' : 'Spin and win prizes!'}
            </p>
          </div>
        </div>
      </div>

      {/* Wheel Container */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="relative w-64 h-64">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-yellow-500"></div>
          </div>

          {/* Wheel */}
          <motion.div
            ref={wheelRef}
            animate={controls}
            className="relative w-full h-full rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700"
            style={{ transformOrigin: 'center' }}
          >
            {PRIZES.map((prize, index) => {
              const angle = index * prizeAngle;
              return (
                <div
                  key={index}
                  className="absolute inset-0"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.tan((prizeAngle * Math.PI) / 360)}% 0%)`,
                  }}
                >
                  <div
                    className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                    style={{
                      background: prize.color,
                      transform: `rotate(${prizeAngle / 2}deg)`,
                      transformOrigin: '50% 50%',
                    }}
                  >
                    <span className="transform -rotate-90">{prize.label}</span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Spin Button */}
      <motion.button
        whileHover={{ scale: canSpin && !spinning ? 1.02 : 1 }}
        whileTap={{ scale: canSpin && !spinning ? 0.98 : 1 }}
        onClick={handleSpin}
        disabled={spinning || !canSpin}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          spinning || !canSpin
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {spinning ? (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            {locale === 'ar' ? 'جاري الدوران...' : locale === 'zh' ? '正在旋转...' : 'Spinning...'}
          </span>
        ) : !canSpin ? (
          <span>
            {locale === 'ar' ? 'تم الدوران اليوم' : locale === 'zh' ? '今日已旋转' : 'Already Spun Today'}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Gift className="w-5 h-5" />
            {locale === 'ar' ? 'ادور الآن!' : locale === 'zh' ? '立即旋转！' : 'Spin Now!'}
          </span>
        )}
      </motion.button>

      {/* Result Modal */}
      {showResult && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
          >
            <button
              onClick={() => {
                setShowResult(false);
                resetWheel();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              {result.prizeType !== 'nothing' ? (
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-10 h-10 text-white" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">😔</span>
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {result.prize}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{result.message}</p>
            </div>

            {result.prizeType === 'discount' && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {locale === 'ar'
                    ? 'سيتم إرسال كود الخصم إلى بريدك الإلكتروني'
                    : locale === 'zh'
                    ? '折扣代码将发送到您的邮箱'
                    : 'Discount code will be sent to your email'}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setShowResult(false);
                resetWheel();
              }}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
            >
              {locale === 'ar' ? 'حسناً' : locale === 'zh' ? '好的' : 'OK'}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
