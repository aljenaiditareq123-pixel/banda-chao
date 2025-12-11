"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MysteryBox() {
  const { language } = useLanguage();
  const [isShaking, setIsShaking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // قائمة الجوائز المحتملة (يمكن ربطها بقاعدة البيانات لاحقاً)
  const rewards = [
    { 
      name: language === 'ar' ? 'iPhone 15 Pro' : language === 'zh' ? 'iPhone 15 Pro' : 'iPhone 15 Pro', 
      icon: "📱", 
      price: language === 'ar' ? "9999 درهم" : language === 'zh' ? "¥9999" : "$999", 
      color: "bg-gray-800" 
    },
    { 
      name: language === 'ar' ? 'ساعة ذكية رياضية' : language === 'zh' ? '智能运动手表' : 'Smart Sports Watch', 
      icon: "⌚", 
      price: language === 'ar' ? "299 درهم" : language === 'zh' ? "¥299" : "$299", 
      color: "bg-blue-600" 
    },
    { 
      name: language === 'ar' ? 'سماعات محيطية' : language === 'zh' ? '环绕声耳机' : 'Surround Headphones', 
      icon: "🎧", 
      price: language === 'ar' ? "150 درهم" : language === 'zh' ? "¥150" : "$150", 
      color: "bg-red-500" 
    },
    { 
      name: language === 'ar' ? 'كوبون خصم 50%' : language === 'zh' ? '50%折扣券' : '50% Discount Coupon', 
      icon: "🎟️", 
      price: language === 'ar' ? "مجاني" : language === 'zh' ? "免费" : "Free", 
      color: "bg-yellow-500" 
    },
  ];

  const [reward, setReward] = useState(rewards[0]);

  const handleOpen = () => {
    if (isOpen) return;
    setIsShaking(true);
    
    // اختيار جائزة عشوائية
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    setReward(randomReward);

    // إيقاف الاهتزاز وفتح الصندوق بعد 2 ثانية
    setTimeout(() => {
      setIsShaking(false);
      setIsOpen(true);
    }, 2000);
  };

  const resetBox = () => {
    setIsOpen(false);
    setIsShaking(false);
  };

  const texts = {
    ar: {
      title: "🎁 صندوق الباندا الغامض",
      subtitle: "جرب حظك! ماذا يخبئ لك الباندا؟",
      value: "قيمة:",
      tryAgain: "جرب مرة أخرى (¥10)",
      clickToOpen: "اضغط على الصندوق لفتحه!",
    },
    zh: {
      title: "🎁 神秘熊猫盒",
      subtitle: "试试你的运气！熊猫为你准备了什么？",
      value: "价值：",
      tryAgain: "再试一次 (¥10)",
      clickToOpen: "点击盒子打开！",
    },
    en: {
      title: "🎁 Mystery Panda Box",
      subtitle: "Try your luck! What does the panda have for you?",
      value: "Value:",
      tryAgain: "Try Again (¥10)",
      clickToOpen: "Click the box to open!",
    },
  };

  const t = texts[language as keyof typeof texts] || texts.en;

  return (
    <div className="w-full max-w-md mx-auto p-6 text-center my-10 bg-gradient-to-b from-purple-900 to-purple-700 rounded-3xl shadow-2xl border-4 border-purple-400/30">
      
      <h2 className="text-2xl font-bold text-white mb-2">{t.title}</h2>
      <p className="text-purple-200 text-sm mb-8">{t.subtitle}</p>

      <div className="h-64 flex items-center justify-center relative overflow-hidden">
        {/* Confetti Effect */}
        {isOpen && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
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
        )}

        <AnimatePresence mode='wait'>
          {!isOpen ? (
            <motion.div
              key="box"
              onClick={handleOpen}
              className="text-9xl cursor-pointer filter drop-shadow-2xl relative z-10"
              animate={isShaking ? {
                x: [-5, 5, -5, 5, 0],
                rotate: [-5, 5, -5, 5, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              } : {
                y: [0, -10, 0] // طفو هادئ
              }}
              transition={isShaking ? { duration: 0.4, repeat: 5 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              🎁
            </motion.div>
          ) : (
            <motion.div
              key="reward"
              initial={{ scale: 0, rotate: 180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: -180, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`p-8 rounded-full ${reward.color} text-white shadow-inner flex flex-col items-center justify-center relative z-10`}
            >
              <motion.div 
                className="text-6xl mb-2"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: 2,
                  ease: "easeInOut"
                }}
              >
                {reward.icon}
              </motion.div>
              <div className="font-bold text-lg">{reward.name}</div>
              <div className="text-yellow-300 font-mono mt-1 text-sm">{t.value} {reward.price}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8">
        {isOpen ? (
          <button 
            onClick={resetBox}
            className="bg-white text-purple-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-105"
          >
            {t.tryAgain}
          </button>
        ) : (
          <p className="text-white/60 animate-pulse text-sm">{t.clickToOpen}</p>
        )}
      </div>
    </div>
  );
}
