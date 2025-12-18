'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Share2, Lock, Gift, X, Copy, Check, Sparkles } from 'lucide-react';

// Prize types with viral potential
interface Prize {
  id: string;
  name: { ar: string; en: string; zh: string };
  emoji: string;
  value: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
  glow: string;
}

const PRIZES: Prize[] = [
  {
    id: 'discount50',
    name: { ar: 'خصم 50%', en: '50% Discount', zh: '50% 折扣' },
    emoji: '🎟️',
    value: '50%',
    rarity: 'common',
    color: 'from-yellow-400 to-orange-500',
    glow: 'shadow-yellow-500/50',
  },
  {
    id: 'freeShipping',
    name: { ar: 'شحن مجاني', en: 'Free Shipping', zh: '免费送货' },
    emoji: '🚚',
    value: '$15',
    rarity: 'common',
    color: 'from-blue-400 to-cyan-500',
    glow: 'shadow-cyan-500/50',
  },
  {
    id: 'mysteryGadget',
    name: { ar: 'أداة ذكية مجانية', en: 'Free Smart Gadget', zh: '免费智能小工具' },
    emoji: '📱',
    value: '$99',
    rarity: 'rare',
    color: 'from-purple-500 to-pink-500',
    glow: 'shadow-purple-500/50',
  },
  {
    id: 'vipAccess',
    name: { ar: 'عضوية VIP شهر', en: '1 Month VIP Access', zh: '一个月VIP会员' },
    emoji: '👑',
    value: '$29',
    rarity: 'rare',
    color: 'from-amber-400 to-yellow-500',
    glow: 'shadow-amber-500/50',
  },
  {
    id: 'premiumWatch',
    name: { ar: 'ساعة ذكية فاخرة', en: 'Premium Smart Watch', zh: '高级智能手表' },
    emoji: '⌚',
    value: '$299',
    rarity: 'epic',
    color: 'from-emerald-400 to-teal-500',
    glow: 'shadow-emerald-500/50',
  },
  {
    id: 'jackpot',
    name: { ar: 'الجائزة الكبرى!', en: 'JACKPOT!', zh: '大奖!' },
    emoji: '💎',
    value: '$500',
    rarity: 'legendary',
    color: 'from-rose-500 via-purple-500 to-indigo-500',
    glow: 'shadow-rose-500/50',
  },
];

// Weighted random selection (rarer = less likely)
function getRandomPrize(): Prize {
  const weights = { common: 40, rare: 30, epic: 20, legendary: 10 };
  const totalWeight = PRIZES.reduce((sum, p) => sum + weights[p.rarity], 0);
  let random = Math.random() * totalWeight;
  
  for (const prize of PRIZES) {
    random -= weights[prize.rarity];
    if (random <= 0) return prize;
  }
  return PRIZES[0];
}

interface SocialBlindBoxProps {
  className?: string;
}

export default function SocialBlindBox({ className = '' }: SocialBlindBoxProps) {
  const { language } = useLanguage();
  const [boxState, setBoxState] = useState<'locked' | 'shaking' | 'unlocking' | 'revealed'>('locked');
  const [showShareModal, setShowShareModal] = useState(false);
  const [prize, setPrize] = useState<Prize | null>(null);
  const [copied, setCopied] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<number[]>([]);
  const [glowIntensity, setGlowIntensity] = useState(0);

  // Pulsing glow effect
  useEffect(() => {
    if (boxState === 'locked') {
      const interval = setInterval(() => {
        setGlowIntensity(prev => (prev + 1) % 100);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [boxState]);

  const texts = {
    ar: {
      title: '🎁 صندوق السر الاجتماعي',
      subtitle: 'افتح الصندوق واكسب جوائز مذهلة!',
      openBox: 'افتح الصندوق',
      locked: '🔒 مقفل!',
      lockedMessage: 'شارك مع صديق لفتح هذه الجائزة',
      shareNow: 'شارك الآن',
      shareTitle: 'شارك واربح!',
      shareMessage: 'أنا على وشك فتح صندوق غامض في Banda Chao! انضم لي واحصل على صندوقك المجاني!',
      copyLink: 'نسخ الرابط',
      copied: 'تم النسخ!',
      unlocking: 'جاري الفتح...',
      congrats: 'مبروك! 🎉',
      youWon: 'لقد فزت بـ:',
      value: 'القيمة:',
      claimPrize: 'احصل على جائزتك',
      tryAgain: 'حاول مرة أخرى',
      close: 'إغلاق',
    },
    en: {
      title: '🎁 Social Mystery Box',
      subtitle: 'Open the box and win amazing prizes!',
      openBox: 'Open Box',
      locked: '🔒 Locked!',
      lockedMessage: 'Invite a friend to unlock this prize',
      shareNow: 'Share Now',
      shareTitle: 'Share & Win!',
      shareMessage: "I'm about to open a mystery box on Banda Chao! Join me and get your free box!",
      copyLink: 'Copy Link',
      copied: 'Copied!',
      unlocking: 'Unlocking...',
      congrats: 'Congratulations! 🎉',
      youWon: 'You won:',
      value: 'Value:',
      claimPrize: 'Claim Your Prize',
      tryAgain: 'Try Again',
      close: 'Close',
    },
    zh: {
      title: '🎁 社交神秘盒',
      subtitle: '打开盒子赢取惊人奖品！',
      openBox: '打开盒子',
      locked: '🔒 已锁定！',
      lockedMessage: '邀请朋友解锁这个奖品',
      shareNow: '立即分享',
      shareTitle: '分享赢好礼！',
      shareMessage: '我即将在Banda Chao打开一个神秘盒子！加入我，获得你的免费盒子！',
      copyLink: '复制链接',
      copied: '已复制！',
      unlocking: '正在解锁...',
      congrats: '恭喜！🎉',
      youWon: '你赢得了：',
      value: '价值：',
      claimPrize: '领取奖品',
      tryAgain: '再试一次',
      close: '关闭',
    },
  };

  const t = texts[language as keyof typeof texts] || texts.en;

  const handleBoxClick = () => {
    if (boxState === 'locked') {
      // Show shake animation then locked modal
      setBoxState('shaking');
      setTimeout(() => {
        setBoxState('locked');
        setShowShareModal(true);
      }, 600);
    }
  };

  const handleShare = async () => {
    // Generate share link
    const shareUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}?ref=blindbox&invite=${Date.now()}`
      : 'https://banda-chao.com';
    
    // Try native share first
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Banda Chao Mystery Box',
          text: t.shareMessage,
          url: shareUrl,
        });
        startUnlocking();
      } catch (err) {
        // User cancelled or share failed, copy link instead
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      // Start unlocking after copying
      setTimeout(() => startUnlocking(), 1000);
    }
  };

  const startUnlocking = () => {
    setShowShareModal(false);
    setBoxState('unlocking');
    
    // Simulate unlock delay (the "magic")
    setTimeout(() => {
      const selectedPrize = getRandomPrize();
      setPrize(selectedPrize);
      setConfettiPieces(Array.from({ length: 50 }, (_, i) => i));
      setBoxState('revealed');
    }, 3000);
  };

  const resetBox = () => {
    setBoxState('locked');
    setPrize(null);
    setConfettiPieces([]);
  };

  const glowValue = Math.sin(glowIntensity / 15) * 20 + 30;

  return (
    <div className={`relative ${className}`}>
      {/* Main Container */}
      <div className="w-full max-w-lg mx-auto">
        {/* Background Glow */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-orange-500/30 blur-3xl rounded-full"
          style={{ opacity: boxState === 'locked' ? glowValue / 100 : 0.3 }}
        />

        {/* Card Container */}
        <motion.div
          className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-8 border border-purple-500/30 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Sparkle Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Header */}
          <div className="text-center mb-6 relative z-10">
            <motion.h2 
              className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {t.title}
            </motion.h2>
            <p className="text-purple-300/80 mt-2 text-sm md:text-base">{t.subtitle}</p>
          </div>

          {/* Box Area */}
          <div className="relative h-64 flex items-center justify-center">
            {/* Confetti */}
            <AnimatePresence>
              {boxState === 'revealed' && confettiPieces.map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#FFE66D', '#FF6B9D', '#A855F7'][i % 6],
                  }}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{
                    x: (Math.random() - 0.5) * 400,
                    y: (Math.random() - 0.5) * 400,
                    scale: [0, 1.5, 0],
                    opacity: [1, 1, 0],
                    rotate: Math.random() * 720,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 2.5,
                    delay: Math.random() * 0.3,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* Locked/Shaking Box */}
              {(boxState === 'locked' || boxState === 'shaking') && (
                <motion.div
                  key="box"
                  className="relative cursor-pointer"
                  onClick={handleBoxClick}
                  animate={boxState === 'shaking' ? {
                    x: [-10, 10, -10, 10, -5, 5, 0],
                    rotate: [-5, 5, -5, 5, -2, 2, 0],
                  } : {
                    y: [0, -8, 0],
                    rotateY: [0, 5, 0, -5, 0],
                  }}
                  transition={boxState === 'shaking' ? {
                    duration: 0.5,
                    ease: 'easeInOut',
                  } : {
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* 3D Box */}
                  <div 
                    className="relative w-32 h-32 md:w-40 md:h-40"
                    style={{
                      perspective: '1000px',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {/* Box Shadow/Glow */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl blur-xl"
                      style={{ 
                        opacity: 0.3 + glowValue / 200,
                        transform: 'translateZ(-20px)',
                      }}
                    />
                    
                    {/* Box Body */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl shadow-2xl flex items-center justify-center border-2 border-white/20">
                      <div className="text-6xl md:text-7xl">🎁</div>
                      
                      {/* Lock Icon */}
                      <motion.div
                        className="absolute -top-3 -right-3 bg-slate-900 rounded-full p-2 border-2 border-yellow-400"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Lock className="w-5 h-5 text-yellow-400" />
                      </motion.div>
                    </div>

                    {/* Ribbon */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-16 h-8 bg-yellow-400 rounded-full shadow-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-yellow-700" />
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-purple-300/60 mt-4 text-sm animate-pulse">
                    {t.openBox}
                  </p>
                </motion.div>
              )}

              {/* Unlocking State */}
              {boxState === 'unlocking' && (
                <motion.div
                  key="unlocking"
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <motion.div
                    className="text-8xl mb-4"
                    animate={{
                      rotateY: [0, 360],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    🎁
                  </motion.div>
                  <motion.p 
                    className="text-purple-200 font-medium"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    {t.unlocking}
                  </motion.p>
                  <div className="mt-4 flex justify-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-purple-400 rounded-full"
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Revealed Prize */}
              {boxState === 'revealed' && prize && (
                <motion.div
                  key="prize"
                  className="text-center"
                  initial={{ opacity: 0, scale: 0, rotateY: 180 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <motion.p 
                    className="text-yellow-300 font-bold text-xl mb-4"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: 3 }}
                  >
                    {t.congrats}
                  </motion.p>
                  
                  <motion.div
                    className={`w-28 h-28 md:w-36 md:h-36 mx-auto rounded-2xl bg-gradient-to-br ${prize.color} shadow-2xl ${prize.glow} flex items-center justify-center mb-4`}
                    animate={{ 
                      boxShadow: [
                        '0 0 20px rgba(168, 85, 247, 0.5)',
                        '0 0 40px rgba(168, 85, 247, 0.8)',
                        '0 0 20px rgba(168, 85, 247, 0.5)',
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span className="text-5xl md:text-6xl">{prize.emoji}</span>
                  </motion.div>
                  
                  <p className="text-white/60 text-sm">{t.youWon}</p>
                  <p className="text-white font-bold text-xl mt-1">
                    {prize.name[language as keyof typeof prize.name] || prize.name.en}
                  </p>
                  <p className="text-green-400 font-mono mt-2">
                    {t.value} {prize.value}
                  </p>
                  
                  {/* Rarity Badge */}
                  <div className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    prize.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' :
                    prize.rarity === 'epic' ? 'bg-purple-500 text-white' :
                    prize.rarity === 'rare' ? 'bg-blue-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {prize.rarity}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Button */}
          <div className="mt-6 text-center relative z-10">
            {boxState === 'revealed' ? (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Gift className="w-5 h-5 inline mr-2" />
                  {t.claimPrize}
                </motion.button>
                <motion.button
                  onClick={resetBox}
                  className="bg-white/10 text-white font-medium py-3 px-6 rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t.tryAgain}
                </motion.button>
              </div>
            ) : boxState !== 'unlocking' && (
              <motion.button
                onClick={handleBoxClick}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(168, 85, 247, 0.3)',
                    '0 0 40px rgba(236, 72, 153, 0.5)',
                    '0 0 20px rgba(168, 85, 247, 0.3)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Gift className="w-6 h-6 inline mr-2" />
                {t.openBox}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-8 max-w-md w-full border border-purple-500/30 shadow-2xl"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Lock Animation */}
              <motion.div
                className="text-center mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <motion.div
                  className="inline-block text-6xl mb-4"
                  animate={{ 
                    rotateZ: [-5, 5, -5],
                    y: [0, -5, 0],
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  🔒
                </motion.div>
                <h3 className="text-2xl font-bold text-yellow-400">{t.locked}</h3>
                <p className="text-purple-200/80 mt-2">{t.lockedMessage}</p>
              </motion.div>

              {/* Share Section */}
              <div className="space-y-4">
                <motion.button
                  onClick={handleShare}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Share2 className="w-5 h-5" />
                  {t.shareNow}
                </motion.button>

                {/* Copy Link */}
                <motion.button
                  onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : 'https://banda-chao.com'}?ref=blindbox`)}
                  className={`w-full py-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                    copied 
                      ? 'bg-green-500/20 border-green-500 text-green-400' 
                      : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      {t.copied}
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      {t.copyLink}
                    </>
                  )}
                </motion.button>

                {/* Social Share Buttons */}
                <div className="flex justify-center gap-4 mt-4">
                  {['whatsapp', 'twitter', 'telegram'].map((platform) => (
                    <motion.button
                      key={platform}
                      className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
                        const text = encodeURIComponent(t.shareMessage);
                        let shareUrl = '';
                        
                        if (platform === 'whatsapp') {
                          shareUrl = `https://wa.me/?text=${text}%20${url}`;
                        } else if (platform === 'twitter') {
                          shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                        } else if (platform === 'telegram') {
                          shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
                        }
                        
                        window.open(shareUrl, '_blank');
                        setTimeout(() => startUnlocking(), 1500);
                      }}
                    >
                      {platform === 'whatsapp' && '💬'}
                      {platform === 'twitter' && '🐦'}
                      {platform === 'telegram' && '✈️'}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

