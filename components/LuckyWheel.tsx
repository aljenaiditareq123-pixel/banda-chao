"use client";

import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LuckyWheel() {
  const { language } = useLanguage();
  const [isSpinning, setIsSpinning] = useState(false);
  const [prize, setPrize] = useState<string | null>(null);
  const controls = useAnimation();

  // قائمة الجوائز وزواياها
  const segments = [
    { label: language === 'ar' ? "خصم 10%" : language === 'zh' ? "10%折扣" : "10% OFF", color: "#FF5252", text: "#FFF" },
    { label: language === 'ar' ? "شحن مجاني" : language === 'zh' ? "免费送货" : "Free Shipping", color: "#FFC107", text: "#000" },
    { label: language === 'ar' ? "5 نقاط" : language === 'zh' ? "5积分" : "5 Points", color: "#7C4DFF", text: "#FFF" },
    { label: language === 'ar' ? "حظ أوفر" : language === 'zh' ? "下次好运" : "Try Again", color: "#607D8B", text: "#FFF" },
    { label: language === 'ar' ? "خصم 50%" : language === 'zh' ? "50%折扣" : "50% OFF", color: "#E040FB", text: "#FFF" },
    { label: language === 'ar' ? "جائزة كبرى" : language === 'zh' ? "大奖" : "Grand Prize", color: "#FFD700", text: "#000" },
  ];

  const spinWheel = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setPrize(null);

    // تحديد الزاوية العشوائية (مع انحياز لعدم الفوز بالجائزة الكبرى بسهولة)
    // سنجعل الدوران يدور 5 لفات كاملة (1800 درجة) + زاوية عشوائية
    const randomDegree = Math.floor(Math.random() * 360);
    const totalRotation = 1800 + randomDegree;

    await controls.start({
      rotate: totalRotation,
      transition: { duration: 4, ease: "circOut" } // حركة تباطؤ واقعية
    });

    // حساب الجائزة بناءً على الزاوية النهائية
    // منطق "حظ" بسيط: احتمالية قليلة للجائزة الكبرى (10%)
    const randomPrize = Math.random() > 0.9 
      ? segments[5].label // جائزة كبرى
      : segments[Math.floor(Math.random() * 5)].label; // جائزة عادية

    setTimeout(() => {
      setPrize(randomPrize);
      setIsSpinning(false);
    }, 500);
  };

  const texts = {
    ar: {
      title: "عجلة الحظ",
      subtitle: "دوّر واربح جوائز يومية!",
      spinning: "جاري الدوران...",
      spin: "جرّب حظك مجاناً!",
      congrats: "مبارك!",
      won: "ربحت:",
      claim: "استلم الجائزة",
    },
    zh: {
      title: "幸运轮盘",
      subtitle: "旋转并赢得每日奖品！",
      spinning: "旋转中...",
      spin: "免费试试你的运气！",
      congrats: "恭喜！",
      won: "你赢得了：",
      claim: "领取奖品",
    },
    en: {
      title: "Lucky Wheel",
      subtitle: "Spin and win daily prizes!",
      spinning: "Spinning...",
      spin: "Try Your Luck Free!",
      congrats: "Congratulations!",
      won: "You Won:",
      claim: "Claim Prize",
    },
  };

  const t = texts[language as keyof typeof texts] || texts.en;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-purple-900 via-purple-800 to-black rounded-3xl shadow-2xl border-4 border-yellow-500/50 max-w-md mx-auto my-8 relative overflow-hidden">
      
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-purple-400/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,215,0,0.1) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(255,192,7,0.1) 0%, transparent 50%)`,
        }}></div>
      </div>

      <div className="text-center z-10 mb-6 relative">
        <h2 className="text-3xl font-black text-yellow-400 drop-shadow-md flex items-center justify-center gap-2">
          <Sparkles size={28} /> {t.title}
        </h2>
        <p className="text-purple-200 text-sm mt-2">{t.subtitle}</p>
      </div>

      {/* العجلة */}
      <div className="relative w-64 h-64 mb-8 z-10">
        {/* المؤشر */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-8 h-12">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-yellow-400 drop-shadow-lg"></div>
        </div>

        {/* جسم العجلة الدوار */}
        <motion.div
          animate={controls}
          className="w-full h-full rounded-full border-8 border-yellow-500 shadow-[0_0_30px_rgba(255,215,0,0.6)] relative overflow-hidden bg-white"
          style={{ transformOrigin: "center" }}
        >
          {segments.map((seg, i) => {
            const angle = i * 60; // كل قسم 60 درجة
            const nextAngle = (i + 1) * 60;
            return (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 origin-bottom"
                style={{
                  width: '50%',
                  height: '50%',
                  backgroundColor: seg.color,
                  transform: `rotate(${angle}deg)`,
                  clipPath: `polygon(0 0, 100% 0, 50% 100%)`,
                  borderRight: '2px solid rgba(0,0,0,0.2)',
                }}
              >
                <span 
                  className="absolute text-xs font-bold whitespace-nowrap"
                  style={{ 
                    color: seg.text,
                    transform: `rotate(${(angle + nextAngle) / 2 - 90}deg)`,
                    left: '25%',
                    top: '20%',
                    transformOrigin: 'center',
                    textShadow: seg.text === '#000' ? '0 1px 2px rgba(255,255,255,0.8)' : '0 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  {seg.label}
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* زر المركز */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-yellow-500 flex items-center justify-center shadow-lg z-10 cursor-pointer hover:scale-110 transition-transform">
          <Gift className="text-purple-600" size={24} />
        </div>
      </div>

      {/* زر التحكم */}
      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className={`w-full py-4 rounded-xl font-black text-xl shadow-lg transition transform relative z-10 ${
          isSpinning 
            ? 'bg-gray-500 cursor-not-allowed' 
            : 'bg-yellow-400 hover:bg-yellow-300 text-purple-900 hover:scale-105 active:scale-95'
        }`}
      >
        {isSpinning ? t.spinning : t.spin}
      </button>

      {/* نافذة الفوز */}
      {prize && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-30 p-4 text-center backdrop-blur-sm rounded-3xl"
        >
          {/* Confetti Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#FFE66D', '#FF6B9D'][Math.floor(Math.random() * 5)],
                }}
                initial={{ y: -20, opacity: 1, scale: 0 }}
                animate={{ 
                  y: [0, 100, 200],
                  opacity: [1, 1, 0],
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{ 
                  duration: 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative z-10"
          >
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-2xl font-bold text-white mb-2">{t.congrats}</h3>
            <p className="text-yellow-400 text-xl font-black mb-6">{t.won} {prize}</p>
            <button 
              onClick={() => setPrize(null)}
              className="bg-green-500 text-white px-8 py-3 rounded-full font-bold hover:bg-green-600 transition transform hover:scale-105"
            >
              {t.claim}
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
