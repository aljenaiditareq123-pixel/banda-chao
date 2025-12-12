'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Gift, TrendingUp } from 'lucide-react';

interface GamificationBarProps {
  locale?: string;
}

interface RankData {
  currentRank: string;
  nextRank: string;
  progress: number;
  nextReward: string;
  level: number;
}

const RANKS = [
  { name: 'Bronze Artisan', level: 1, color: 'from-orange-600 to-orange-800', icon: '🥉' },
  { name: 'Silver Artisan', level: 2, color: 'from-gray-400 to-gray-600', icon: '🥈' },
  { name: 'Gold Dragon', level: 3, color: 'from-yellow-400 to-yellow-600', icon: '🐉' },
  { name: 'Platinum Master', level: 4, color: 'from-cyan-400 to-cyan-600', icon: '💎' },
  { name: 'Diamond Legend', level: 5, color: 'from-purple-400 to-purple-600', icon: '👑' },
];

export default function GamificationBar({ locale = 'en' }: GamificationBarProps) {
  const [rankData, setRankData] = useState<RankData>({
    currentRank: 'Silver Artisan',
    nextRank: 'Gold Dragon',
    progress: 70,
    nextReward: 'Unlock 0% Commission',
    level: 2,
  });
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Load rank data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('banda_artisan_rank');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setRankData(data);
      } catch (e) {
        console.error('Error loading rank data:', e);
      }
    }
  }, []);

  // Check for level up
  useEffect(() => {
    if (rankData.progress >= 100) {
      setShowLevelUp(true);
      triggerConfetti();
      
      // Update to next rank
      const currentRankIndex = RANKS.findIndex(r => r.name === rankData.currentRank);
      if (currentRankIndex < RANKS.length - 1) {
        const nextRank = RANKS[currentRankIndex + 1];
        const newData = {
          currentRank: nextRank.name,
          nextRank: RANKS[currentRankIndex + 2]?.name || 'Max Level',
          progress: 0,
          nextReward: getNextReward(nextRank.level),
          level: nextRank.level,
        };
        setRankData(newData);
        localStorage.setItem('banda_artisan_rank', JSON.stringify(newData));
      }
      
      setTimeout(() => setShowLevelUp(false), 5000);
    }
  }, [rankData.progress]);

  const triggerConfetti = () => {
    // Simple confetti effect using DOM elements
    const colors = ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE047', '#FEF08A'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-10px';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = '50%';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      document.body.appendChild(confetti);
      
      const animation = confetti.animate(
        [
          { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
          { transform: `translateY(${window.innerHeight + 100}px) rotate(720deg)`, opacity: 0 }
        ],
        {
          duration: 2000 + Math.random() * 1000,
          easing: 'cubic-bezier(0.5, 0, 0.5, 1)',
        }
      );
      
      animation.onfinish = () => confetti.remove();
    }
  };

  const getNextReward = (level: number): string => {
    const rewards: Record<number, string> = {
      1: 'Unlock Analytics Dashboard',
      2: 'Unlock 0% Commission',
      3: 'Unlock Priority Support',
      4: 'Unlock Custom Branding',
      5: 'Unlock All Features',
    };
    return rewards[level] || 'Continue Growing';
  };

  const currentRankInfo = RANKS.find(r => r.name === rankData.currentRank) || RANKS[1];
  const nextRankInfo = RANKS.find(r => r.name === rankData.nextRank) || RANKS[2];

  const texts = {
    ar: {
      rank: 'الرتبة',
      progress: 'التقدم',
      nextReward: 'المكافأة القادمة',
      levelUp: 'ترقية المستوى!',
      congratulations: 'تهانينا!',
    },
    en: {
      rank: 'Rank',
      progress: 'Progress',
      nextReward: 'Next Reward',
      levelUp: 'Level Up!',
      congratulations: 'Congratulations!',
    },
    zh: {
      rank: '等级',
      progress: '进度',
      nextReward: '下一个奖励',
      levelUp: '升级！',
      congratulations: '恭喜！',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <>
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border-2 border-amber-500/30 p-4 mb-4">
        {/* Current Rank Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${currentRankInfo.color} flex items-center justify-center text-2xl shadow-lg`}>
              {currentRankInfo.icon}
            </div>
            <div>
              <p className="text-xs text-gray-400">{t.rank}</p>
              <p className="text-sm font-bold text-white">{rankData.currentRank}</p>
              <p className="text-[10px] text-amber-400">Level {rankData.level}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">{t.nextReward}</p>
            <p className="text-xs font-semibold text-amber-400">{rankData.nextReward}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">{t.progress} to {rankData.nextRank}</span>
            <span className="text-amber-400 font-bold">{rankData.progress}%</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${rankData.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${nextRankInfo.color} rounded-full shadow-lg`}
            />
          </div>
        </div>
      </div>

      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-gradient-to-br from-amber-500 to-yellow-500 rounded-3xl p-8 text-center shadow-2xl border-4 border-yellow-300">
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-3xl font-black text-white mb-2">{t.levelUp}</h2>
              <p className="text-xl font-bold text-yellow-100">{t.congratulations}</p>
              <p className="text-lg text-white mt-2">You are now a</p>
              <p className="text-2xl font-black text-yellow-200">{rankData.currentRank}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
