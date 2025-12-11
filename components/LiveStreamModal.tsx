"use client";

import React, { useState, useEffect } from 'react';
import { X, Heart, Gift, Share2, Send, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// react-player v3.4.0 doesn't have /lazy export, use default import with dynamic
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any;

interface LiveStreamProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string; // رابط فيديو يوتيوب شورتس أو تيك توك
}

// تعليقات وهمية للمحاكاة
const FAKE_COMMENTS = [
  { user: "Ali", text: "كم السعر؟ 😍" },
  { user: "Sara", text: "هل يوجد توصيل للرياض؟" },
  { user: "Chen", text: "الجودة تبدو رائعة!" },
  { user: "PandaFan", text: "طلبت اثنين 🔥" },
  { user: "Amal", text: "ممكن تعرض اللون الأحمر؟" },
  { user: "Mohammed", text: "متى يصل للبحرين؟" },
  { user: "Fatima", text: "أريد واحد فوراً! 💕" },
  { user: "Ahmed", text: "اللون الأزرق موجود؟" },
];

export default function LiveStreamModal({ 
  isOpen, 
  onClose, 
  videoUrl = "https://www.youtube.com/shorts/5e5L9-3fWlI" 
}: LiveStreamProps) {
  
  const [comments, setComments] = useState<any[]>([]);
  const [hearts, setHearts] = useState<number[]>([]);
  const [viewers, setViewers] = useState(1200);

  // محاكاة تدفق التعليقات
  useEffect(() => {
    if (!isOpen) {
      setComments([]);
      setHearts([]);
      return;
    }
    
    const commentInterval = setInterval(() => {
      const randomComment = FAKE_COMMENTS[Math.floor(Math.random() * FAKE_COMMENTS.length)];
      setComments(prev => [...prev.slice(-4), { ...randomComment, id: Date.now() }]);
    }, 2000);

    // زيادة عدد المشاهدين تدريجياً
    const viewerInterval = setInterval(() => {
      setViewers(prev => prev + Math.floor(Math.random() * 5));
    }, 3000);

    return () => {
      clearInterval(commentInterval);
      clearInterval(viewerInterval);
    };
  }, [isOpen]);

  // إضافة قلب
  const addHeart = () => {
    setHearts(prev => [...prev, Date.now()]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      
      {/* مشغل الفيديو الخلفي */}
      <div className="absolute inset-0 pointer-events-none opacity-50 sm:opacity-100">
        <ReactPlayer
          url={videoUrl}
          width="100%"
          height="140%" // تكبير لتغطية الشاشة
          playing={true}
          loop={true}
          controls={false}
          muted={false}
          playing={true}
          style={{ position: 'absolute', top: '-20%', left: 0 }}
          config={{
            youtube: {
              playerVars: {
                autoplay: 1,
                controls: 0,
                modestbranding: 1,
                rel: 0,
              },
            },
          } as any}
        />
      </div>

      {/* طبقة الواجهة */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 bg-gradient-to-b from-black/60 via-transparent to-black/80">
        
        {/* الرأس: معلومات البث */}
        <div className="flex justify-between items-start mt-8">
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md p-1 pr-4 rounded-full border border-white/10">
            <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center">
              <span className="text-black text-xs font-bold">🐼</span>
            </div>
            <div>
              <p className="text-white text-xs font-bold">متجر الباندا</p>
              <p className="text-gray-300 text-[10px]">{viewers.toLocaleString()} مشاهد</p>
            </div>
            <button className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold ml-2 hover:bg-red-600 transition">
              متابعة
            </button>
          </div>
          
          <button 
            onClick={onClose} 
            className="bg-black/20 p-2 rounded-full text-white backdrop-blur-md hover:bg-black/40 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* المنطقة الوسطى: القلوب الطائرة */}
        <div className="absolute right-4 bottom-32 w-12 h-64 pointer-events-none">
          <AnimatePresence>
            {hearts.map(id => (
              <motion.div
                key={id}
                initial={{ opacity: 1, y: 0, x: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 0, 
                  y: -200, 
                  x: Math.random() * 40 - 20,
                  scale: 1.2 
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute bottom-0 right-0 text-red-500"
              >
                <Heart fill="currentColor" size={32} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* الأسفل: التفاعل والمنتج */}
        <div className="flex flex-col gap-4">
          
          {/* التعليقات */}
          <div className="h-32 overflow-hidden flex flex-col justify-end gap-2 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10"></div>
            <AnimatePresence>
              {comments.map((c) => (
                <motion.div 
                  key={c.id}
                  initial={{ opacity: 0, y: 20, x: -20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-black/40 backdrop-blur-sm self-start px-3 py-1.5 rounded-xl text-sm text-white max-w-[80%] z-20"
                >
                  <span className="text-yellow-400 font-bold mr-2">{c.user}:</span>
                  {c.text}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* المنتج المعروض */}
          <div className="bg-white p-3 rounded-2xl flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-gray-400" size={24} />
              </div>
              <div>
                <p className="font-bold text-sm text-black">سماعة محيطية</p>
                <p className="text-red-600 font-black">AED 99</p>
              </div>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg animate-pulse hover:bg-red-700 transition">
              شراء الآن
            </button>
          </div>

          {/* شريط الأدوات */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-black/40 backdrop-blur-md rounded-full h-10 px-4 flex items-center text-gray-400 text-sm border border-white/10">
              قل شيئاً لطيفاً...
            </div>
            <button className="p-3 bg-black/40 rounded-full text-white hover:bg-black/60 transition">
              <Share2 size={20} />
            </button>
            <button className="p-3 bg-black/40 rounded-full text-white hover:bg-black/60 transition">
              <Gift size={20} />
            </button>
            <button 
              onClick={addHeart}
              className="p-3 bg-gradient-to-tr from-pink-500 to-red-500 rounded-full text-white shadow-lg transform active:scale-90 transition hover:scale-105"
            >
              <Heart fill="white" size={24} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
