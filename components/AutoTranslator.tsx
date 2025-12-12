"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Languages, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TranslatorProps {
  originalText: string;
  translatedText: string;
  originalLang?: 'zh' | 'ar' | 'en';
  translatedLang?: 'zh' | 'ar' | 'en';
  className?: string;
}

export default function AutoTranslator({ 
  originalText, 
  translatedText,
  originalLang = 'zh',
  translatedLang = 'ar',
  className = ""
}: TranslatorProps) {
  
  const { language } = useLanguage();
  const [isTranslated, setIsTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = () => {
    if (isTranslated) {
      // العودة للنص الأصلي فوراً
      setIsTranslated(false);
      return;
    }

    // بدء سحر الترجمة
    setIsTranslating(true);
    setTimeout(() => {
      setIsTranslating(false);
      setIsTranslated(true);
    }, 1500); // 1.5 ثانية وقت المعالجة الوهمي
  };

  const langLabels = {
    ar: {
      zh: "CN - الصيني",
      ar: "AR - العربية",
      en: "EN - الإنجليزية",
      translate: "ترجمة فورية",
      original: "أصل",
      processing: "جاري المعالجة بواسطة الذكاء الاصطناعي...",
    },
    zh: {
      zh: "CN - 中文",
      ar: "AR - 阿拉伯语",
      en: "EN - 英语",
      translate: "即时翻译",
      original: "原文",
      processing: "AI正在处理...",
    },
    en: {
      zh: "CN - Chinese",
      ar: "AR - Arabic",
      en: "EN - English",
      translate: "Instant Translate",
      original: "Original",
      processing: "Processing with AI...",
    },
  };

  const t = langLabels[language as keyof typeof langLabels] || langLabels.en;

  return (
    <div className={`relative group ${className}`}>
      
      {/* شريط الأدوات العلوي */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {isTranslated ? t[translatedLang] : t[originalLang]}
          </span>
          {isTranslated && <Sparkles size={12} className="text-yellow-500 animate-pulse" />}
        </div>
        
        <button
          onClick={handleTranslate}
          disabled={isTranslating}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            isTranslated 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isTranslating ? (
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Wand2 size={14} />
            </motion.div>
          ) : (
            <Languages size={14} />
          )}
          <span>{isTranslated ? t.original : t.translate}</span>
        </button>
      </div>

      {/* منطقة النص */}
      <div className="relative min-h-[60px]">
        <AnimatePresence mode='wait'>
          
          {/* حالة التحميل (تأثير المسح) */}
          {isTranslating ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col gap-2"
            >
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
              <span className="text-xs text-blue-500 font-bold mt-2 flex items-center gap-1">
                <Sparkles size={12} />
                {t.processing}
              </span>
            </motion.div>
          ) : (
            
            /* النص المعروض */
            <motion.p
              key={isTranslated ? "translated" : "original"}
              initial={{ opacity: 0, filter: "blur(5px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(5px)" }}
              transition={{ duration: 0.3 }}
              className={`text-sm leading-relaxed ${
                isTranslated 
                  ? 'text-gray-800 font-medium' 
                  : 'text-gray-500 font-normal'
              }`}
              dir={
                isTranslated 
                  ? (translatedLang === 'ar' ? 'rtl' : 'ltr')
                  : (originalLang === 'ar' ? 'rtl' : 'ltr')
              }
            >
              {isTranslated ? translatedText : originalText}
            </motion.p>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}



