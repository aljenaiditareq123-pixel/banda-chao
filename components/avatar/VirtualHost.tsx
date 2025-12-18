'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronUp, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Persona types
interface Persona {
  id: string;
  emoji: string;
  name: { ar: string; en: string; zh: string };
  title: { ar: string; en: string; zh: string };
  greeting: { ar: string; en: string; zh: string };
  color: string;
  bgGradient: string;
  specialEffect?: 'coins' | 'sparkles' | 'hearts' | 'tech';
}

const PERSONAS: Persona[] = [
  {
    id: 'banda',
    emoji: '🐼',
    name: { ar: 'باندا', en: 'Banda', zh: '熊猫' },
    title: { ar: 'الساحر', en: 'Wizard', zh: '魔法师' },
    greeting: { 
      ar: 'مرحباً بك في عالمي السحري! ✨', 
      en: 'Welcome to my magical world! ✨', 
      zh: '欢迎来到我的魔法世界！✨' 
    },
    color: 'from-purple-500 to-indigo-600',
    bgGradient: 'from-purple-500/20 to-indigo-600/20',
    specialEffect: 'sparkles',
  },
  {
    id: 'li',
    emoji: '👩',
    name: { ar: 'لي', en: 'Li', zh: '丽' },
    title: { ar: 'خبيرة الموضة', en: 'Fashionista', zh: '时尚达人' },
    greeting: { 
      ar: 'تبدو أنيقاً اليوم! 💅', 
      en: 'You look stylish today! 💅', 
      zh: '你今天看起来很时尚！💅' 
    },
    color: 'from-pink-500 to-rose-600',
    bgGradient: 'from-pink-500/20 to-rose-600/20',
    specialEffect: 'hearts',
  },
  {
    id: 'chen',
    emoji: '🧑‍💻',
    name: { ar: 'تشن', en: 'Chen', zh: '陈' },
    title: { ar: 'خبير التقنية', en: 'Tech Guru', zh: '技术大师' },
    greeting: { 
      ar: 'اطلع على أحدث الأجهزة! 🔧', 
      en: 'Check out the latest gadgets! 🔧', 
      zh: '看看最新的科技产品！🔧' 
    },
    color: 'from-cyan-500 to-blue-600',
    bgGradient: 'from-cyan-500/20 to-blue-600/20',
    specialEffect: 'tech',
  },
  {
    id: 'lucky',
    emoji: '🐱',
    name: { ar: 'لاكي', en: 'Lucky', zh: '招财猫' },
    title: { ar: 'القط الذهبي', en: 'Golden Cat', zh: '金猫' },
    greeting: { 
      ar: 'أشم رائحة المال! 💰', 
      en: 'I smell money! 💰', 
      zh: '我闻到钱的味道！💰' 
    },
    color: 'from-yellow-500 to-amber-600',
    bgGradient: 'from-yellow-500/20 to-amber-600/20',
    specialEffect: 'coins',
  },
];

// Coin component for the falling animation
const Coin = ({ delay, x }: { delay: number; x: number }) => (
  <motion.div
    className="absolute text-3xl pointer-events-none"
    style={{ left: `${x}%` }}
    initial={{ y: -50, opacity: 1, rotate: 0 }}
    animate={{ 
      y: '100vh', 
      opacity: [1, 1, 0],
      rotate: 720,
    }}
    transition={{ 
      duration: 3,
      delay,
      ease: 'easeIn',
    }}
  >
    🪙
  </motion.div>
);

// Sparkle component
const Sparkle = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div
    className="absolute text-2xl pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%` }}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ 
      scale: [0, 1.5, 0],
      opacity: [0, 1, 0],
      rotate: [0, 180, 360],
    }}
    transition={{ 
      duration: 1.5,
      delay,
      ease: 'easeOut',
    }}
  >
    ✨
  </motion.div>
);

// Heart component
const Heart = ({ delay, x }: { delay: number; x: number }) => (
  <motion.div
    className="absolute text-2xl pointer-events-none"
    style={{ left: `${x}%`, bottom: '120px' }}
    initial={{ y: 0, opacity: 1, scale: 0 }}
    animate={{ 
      y: -200,
      opacity: [1, 1, 0],
      scale: [0, 1.2, 1],
    }}
    transition={{ 
      duration: 2,
      delay,
      ease: 'easeOut',
    }}
  >
    💖
  </motion.div>
);

// Tech particle component
const TechParticle = ({ delay, angle }: { delay: number; angle: number }) => {
  const symbols = ['⚡', '🔧', '💻', '📱', '🎮', '🔌'];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const distance = 80 + Math.random() * 40;
  
  return (
    <motion.div
      className="absolute text-xl pointer-events-none"
      style={{ 
        left: '50%', 
        bottom: '70px',
        transformOrigin: 'center',
      }}
      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
      animate={{ 
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * -distance,
        opacity: [0, 1, 0],
        scale: [0, 1, 0.5],
      }}
      transition={{ 
        duration: 1.5,
        delay,
        ease: 'easeOut',
      }}
    >
      {symbol}
    </motion.div>
  );
};

export default function VirtualHost() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<Persona>(PERSONAS[0]);
  const [showBubble, setShowBubble] = useState(true);
  const [showEffect, setShowEffect] = useState(false);
  const [coins, setCoins] = useState<{ id: number; x: number; delay: number }[]>([]);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const [hearts, setHearts] = useState<{ id: number; x: number; delay: number }[]>([]);
  const [techParticles, setTechParticles] = useState<{ id: number; angle: number; delay: number }[]>([]);

  const locale = language as 'ar' | 'en' | 'zh';

  // Trigger special effects
  const triggerEffect = useCallback((effect: string | undefined) => {
    if (!effect) return;
    
    setShowEffect(true);
    
    if (effect === 'coins') {
      // Generate falling coins
      const newCoins = Array.from({ length: 30 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        delay: Math.random() * 1.5,
      }));
      setCoins(newCoins);
      setTimeout(() => {
        setCoins([]);
        setShowEffect(false);
      }, 4500);
    } else if (effect === 'sparkles') {
      // Generate sparkles
      const newSparkles = Array.from({ length: 20 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1,
      }));
      setSparkles(newSparkles);
      setTimeout(() => {
        setSparkles([]);
        setShowEffect(false);
      }, 2500);
    } else if (effect === 'hearts') {
      // Generate floating hearts
      const newHearts = Array.from({ length: 15 }, (_, i) => ({
        id: Date.now() + i,
        x: 70 + Math.random() * 25,
        delay: Math.random() * 1,
      }));
      setHearts(newHearts);
      setTimeout(() => {
        setHearts([]);
        setShowEffect(false);
      }, 3000);
    } else if (effect === 'tech') {
      // Generate tech particles in a circle
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        angle: (i / 8) * Math.PI * 2,
        delay: i * 0.1,
      }));
      setTechParticles(newParticles);
      setTimeout(() => {
        setTechParticles([]);
        setShowEffect(false);
      }, 2000);
    }
  }, []);

  // Handle persona change
  const handlePersonaChange = (persona: Persona) => {
    setCurrentPersona(persona);
    setShowBubble(true);
    setIsOpen(false);
    triggerEffect(persona.specialEffect);
    
    // Hide bubble after 5 seconds
    setTimeout(() => setShowBubble(false), 5000);
  };

  // Show bubble on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const texts = {
    ar: {
      chooseHost: 'اختر مضيفك الافتراضي',
      close: 'إغلاق',
    },
    en: {
      chooseHost: 'Choose your Virtual Host',
      close: 'Close',
    },
    zh: {
      chooseHost: '选择您的虚拟主播',
      close: '关闭',
    },
  };

  const t = texts[locale] || texts.en;

  return (
    <>
      {/* Effects Layer (Full Screen) */}
      <AnimatePresence>
        {showEffect && (
          <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden">
            {/* Falling Coins */}
            {coins.map((coin) => (
              <Coin key={coin.id} delay={coin.delay} x={coin.x} />
            ))}
            
            {/* Sparkles */}
            {sparkles.map((sparkle) => (
              <Sparkle key={sparkle.id} delay={sparkle.delay} x={sparkle.x} y={sparkle.y} />
            ))}
            
            {/* Hearts */}
            {hearts.map((heart) => (
              <Heart key={heart.id} delay={heart.delay} x={heart.x} />
            ))}
            
            {/* Tech Particles */}
            {techParticles.map((particle) => (
              <TechParticle key={particle.id} delay={particle.delay} angle={particle.angle} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Avatar Container */}
      <div className="fixed bottom-24 right-4 z-[9999] flex flex-col items-end gap-2">
        {/* Chat Bubble */}
        <AnimatePresence>
          {showBubble && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              className={`relative max-w-[200px] p-3 rounded-2xl rounded-br-sm bg-gradient-to-br ${currentPersona.bgGradient} backdrop-blur-sm border border-white/20 shadow-lg`}
            >
              {/* Close bubble button */}
              <button
                onClick={() => setShowBubble(false)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
              
              <p className="text-sm text-white font-medium leading-relaxed">
                {currentPersona.greeting[locale] || currentPersona.greeting.en}
              </p>
              
              {/* Persona name */}
              <p className="text-xs text-white/60 mt-1">
                — {currentPersona.name[locale] || currentPersona.name.en}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar Button */}
        <motion.button
          onClick={() => {
            if (!isOpen) {
              setShowBubble(true);
              setTimeout(() => setShowBubble(false), 5000);
            }
            setIsOpen(!isOpen);
          }}
          className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${currentPersona.color} shadow-lg hover:shadow-xl transition-shadow overflow-hidden border-2 border-white/30`}
          animate={{
            y: [0, -5, 0],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Glowing ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(255,255,255,0.4)',
                '0 0 0 10px rgba(255,255,255,0)',
                '0 0 0 0 rgba(255,255,255,0)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
          
          {/* Avatar emoji */}
          <span className="text-3xl flex items-center justify-center w-full h-full">
            {currentPersona.emoji}
          </span>
          
          {/* Expand indicator */}
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md"
            animate={{ rotate: isOpen ? 180 : 0 }}
          >
            <ChevronUp className="w-3 h-3 text-gray-700" />
          </motion.div>
        </motion.button>

        {/* Persona Selector */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute bottom-20 right-0 bg-slate-900/95 backdrop-blur-lg rounded-2xl p-4 border border-white/10 shadow-2xl min-w-[220px]"
            >
              <h3 className="text-white/80 text-xs font-medium mb-3 text-center">
                {t.chooseHost}
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                {PERSONAS.map((persona) => (
                  <motion.button
                    key={persona.id}
                    onClick={() => handlePersonaChange(persona)}
                    className={`p-3 rounded-xl transition-all ${
                      currentPersona.id === persona.id
                        ? `bg-gradient-to-br ${persona.color} shadow-lg`
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-2xl mb-1">{persona.emoji}</div>
                    <div className="text-white text-xs font-medium">
                      {persona.name[locale] || persona.name.en}
                    </div>
                    <div className="text-white/60 text-[10px]">
                      {persona.title[locale] || persona.title.en}
                    </div>
                  </motion.button>
                ))}
              </div>
              
              {/* Special effects hint */}
              <div className="mt-3 pt-3 border-t border-white/10 text-center">
                <div className="flex items-center justify-center gap-1 text-white/40 text-[10px]">
                  <Sparkles className="w-3 h-3" />
                  <span>
                    {locale === 'ar' ? 'كل شخصية لها تأثير سحري!' : 
                     locale === 'zh' ? '每个角色都有魔法效果！' : 
                     'Each host has a magic effect!'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

