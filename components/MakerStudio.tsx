"use client";

import React, { useState } from 'react';
import { Camera, Mic, Check, Sparkles, ArrowRight, UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import DigitalBusinessCard from '@/components/DigitalBusinessCard';

export default function MakerStudio() {
  const { language } = useLanguage();
  const [step, setStep] = useState(1); // 1: تصوير، 2: تسجيل صوت، 3: معالجة، 4: نجاح
  const [isRecording, setIsRecording] = useState(false);

  // محاكاة عملية النشر الذكية
  const startMagicUpload = () => {
    setStep(3);
    // محاكاة الذكاء الاصطناعي وهو يعمل
    setTimeout(() => {
      setStep(4);
    }, 3000);
  };

  const texts = {
    ar: {
      title: "استوديو الصانع",
      step1Title: "شو صنعت اليوم؟",
      step1Subtitle: "ورجينا إبداعك بصورة حلوة",
      step1Button: "اضغط للتصوير",
      step2Title: "خبرنا عنه؟",
      step2Subtitle: "ما في داعي للكتابة.. بس احكي!",
      step2Recording: "جاري الاستماع...",
      step2Instruction: "اضغط الميكروفون وابدأ الوصف",
      step2Publish: "انشر السحر",
      step3Title: "الروبوت عم يكتبلك الإعلان...",
      step3Subtitle: "عم نلمع الصور ونضبط الأسعار",
      step4Title: "مبروك يا معلم! 🎉",
      step4Subtitle: "بضاعتك صارت بالسوق والكل شايفها",
      step4TipTitle: "نصيحة الباندا:",
      step4TipText: "شارك الرابط مع أهلك عالواتساب لتزيد مبيعاتك!",
      step4Again: "عندي شغلة تانية بدي بيعها",
    },
    zh: {
      title: "手工艺人工作室",
      step1Title: "你今天做了什么？",
      step1Subtitle: "给我们看看你的创意",
      step1Button: "点击拍照",
      step2Title: "告诉我们吧？",
      step2Subtitle: "不需要写...只要说！",
      step2Recording: "正在聆听...",
      step2Instruction: "点击麦克风开始描述",
      step2Publish: "发布魔法",
      step3Title: "机器人正在为你写广告...",
      step3Subtitle: "正在美化图片和调整价格",
      step4Title: "恭喜你，师傅！🎉",
      step4Subtitle: "你的商品已经在市场上，大家都能看到",
      step4TipTitle: "熊猫建议：",
      step4TipText: "在微信上分享链接以增加销量！",
      step4Again: "我还有另一个东西要卖",
    },
    en: {
      title: "Maker Studio",
      step1Title: "What did you make today?",
      step1Subtitle: "Show us your creativity with a nice photo",
      step1Button: "Tap to Capture",
      step2Title: "Tell us about it?",
      step2Subtitle: "No need to write... just speak!",
      step2Recording: "Listening...",
      step2Instruction: "Press the microphone and start describing",
      step2Publish: "Publish Magic",
      step3Title: "AI is writing your ad...",
      step3Subtitle: "Polishing images and setting prices",
      step4Title: "Congratulations, Master! 🎉",
      step4Subtitle: "Your product is now in the market for everyone to see",
      step4TipTitle: "Panda Tip:",
      step4TipText: "Share the link on WhatsApp to increase your sales!",
      step4Again: "I have another item to sell",
    },
  };

  const t = texts[language as keyof typeof texts] || texts.en;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden border-8 border-gray-100 relative min-h-[600px] flex flex-col">
        
        {/* شريط علوي بسيط */}
        <div className="bg-green-600 p-6 text-white text-center rounded-b-[2rem] shadow-lg z-10">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="text-yellow-300 animate-spin-slow" size={24} />
            {t.title}
          </h1>
        </div>

        <div className="flex-1 p-6 flex flex-col justify-center relative">
          <AnimatePresence mode='wait'>
            
            {/* الخطوة 1: صور منتجك */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 50 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -50 }}
                className="flex flex-col items-center text-center space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-gray-800">{t.step1Title}</h2>
                  <p className="text-gray-500 text-lg">{t.step1Subtitle}</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(2)}
                  className="w-64 h-64 bg-gray-100 border-4 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 hover:bg-green-50 transition-all group shadow-sm"
                >
                  <div className="bg-white p-6 rounded-full shadow-md mb-4 group-hover:shadow-lg">
                    <Camera size={48} />
                  </div>
                  <span className="font-bold text-xl">{t.step1Button}</span>
                </motion.button>
              </motion.div>
            )}

            {/* الخطوة 2: تكلّم (لا تكتب) */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 50 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -50 }}
                className="flex flex-col items-center text-center space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-gray-800">{t.step2Title}</h2>
                  <p className="text-gray-500 text-lg">{t.step2Subtitle}</p>
                </div>

                <div className="relative">
                  {isRecording && (
                    <motion.div 
                      className="absolute inset-0 bg-red-200 rounded-full opacity-50"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                  <motion.button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`relative z-10 w-40 h-40 rounded-full flex items-center justify-center shadow-xl transition-all ${
                      isRecording ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Mic size={64} />
                  </motion.button>
                </div>

                {isRecording ? (
                  <p className="text-red-500 font-bold animate-pulse text-xl">{t.step2Recording}</p>
                ) : (
                  <p className="text-gray-400 font-medium">{t.step2Instruction}</p>
                )}

                {!isRecording && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    onClick={startMagicUpload}
                    className="w-full bg-black text-white py-4 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 shadow-lg mt-4"
                  >
                    <span>{t.step2Publish}</span>
                    <Sparkles size={20} className="text-yellow-400" />
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* الخطوة 3: المعالجة السحرية */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center justify-center h-full space-y-6"
              >
                <motion.div 
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ rotate: { duration: 3, repeat: Infinity, ease: "linear" }, scale: { duration: 1.5, repeat: Infinity } }}
                  className="relative"
                >
                  <Sparkles size={100} className="text-yellow-400" />
                </motion.div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{t.step3Title}</h3>
                  <p className="text-gray-500">{t.step3Subtitle}</p>
                </div>
                
                {/* محاكاة ظهور نصوص */}
                <div className="w-full max-w-xs bg-gray-100 p-4 rounded-xl space-y-2 opacity-50">
                  <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
                </div>
              </motion.div>
            )}

            {/* الخطوة 4: النجاح */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ scale: 0.5, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center text-center justify-center h-full space-y-6"
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
                  className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner mb-4 relative z-10"
                >
                  <Check size={64} strokeWidth={4} />
                </motion.div>
                
                <div className="relative z-10">
                  <h2 className="text-4xl font-black text-gray-800 mb-2">{t.step4Title}</h2>
                  <p className="text-gray-600 text-lg">{t.step4Subtitle}</p>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl w-full relative z-10">
                  <p className="font-bold text-yellow-800 text-sm">{t.step4TipTitle}</p>
                  <p className="text-yellow-700 text-sm">{t.step4TipText}</p>
                </div>

                {/* Digital Business Card */}
                <div className="w-full relative z-10 mt-4">
                  <DigitalBusinessCard 
                    shopName={language === 'ar' ? 'متجر المبدع' : language === 'zh' ? '创意商店' : 'Creative Shop'}
                    productName={language === 'ar' ? 'منتج مميز' : language === 'zh' ? '特色产品' : 'Featured Product'}
                    locale={language}
                  />
                </div>

                <button 
                  onClick={() => { setStep(1); setIsRecording(false); }}
                  className="text-blue-600 font-bold text-lg hover:underline mt-4 relative z-10"
                >
                  {t.step4Again}
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
