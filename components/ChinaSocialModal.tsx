"use client";

import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { X, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChinaSocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  wechatId?: string;
  qqId?: string;
  locale?: string;
}

export default function ChinaSocialModal({ 
  isOpen, 
  onClose, 
  wechatId = "BandaChao_Seller", 
  qqId = "88888888",
  locale = 'ar'
}: ChinaSocialModalProps) {
  const { language } = useLanguage();
  const currentLocale = locale || language;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(wechatId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQQ = () => {
    // فتح QQ Chat
    const qqUrl = `tencent://message/?uin=${qqId}`;
    window.open(qqUrl, '_blank');
  };

  const texts = {
    ar: {
      title: "تواصل عبر WeChat",
      subtitle: "扫码加好友，谈谈价格 (امسح الكود للتفاوض)",
      scanToChat: "Scan to Chat",
      wechatId: "WeChat ID",
      copy: "نسخ",
      qqButton: "🐧 تواصل عبر QQ بدلاً من ذلك",
    },
    zh: {
      title: "通过微信联系",
      subtitle: "扫码加好友，谈谈价格",
      scanToChat: "扫码聊天",
      wechatId: "微信号",
      copy: "复制",
      qqButton: "🐧 改用QQ联系",
    },
    en: {
      title: "Connect via WeChat",
      subtitle: "Scan QR code to add friend and negotiate price",
      scanToChat: "Scan to Chat",
      wechatId: "WeChat ID",
      copy: "Copy",
      qqButton: "🐧 Use QQ Instead",
    },
  };

  const t = texts[currentLocale as keyof typeof texts] || texts.en;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* خلفية معتمة */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* النافذة المنبثقة */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* رأس النافذة - أخضر WeChat */}
          <div className="bg-[#07C160] p-6 text-white text-center relative">
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-1">{t.title}</h3>
            <p className="text-white/90 text-sm">{t.subtitle}</p>
          </div>

          <div className="p-8 flex flex-col items-center">
            
            {/* منطقة الـ QR Code */}
            <div className="bg-white p-4 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.1)] border-2 border-gray-100 mb-6">
              <QRCode 
                value={`weixin://dl/chat?${wechatId}`} // رابط تجريبي لـ WeChat
                size={180}
                fgColor="#2b2b2b"
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox="0 0 256 256"
              />
              <div className="mt-3 flex items-center justify-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <div className="w-2 h-2 bg-[#07C160] rounded-full animate-pulse"></div>
                {t.scanToChat}
              </div>
            </div>

            {/* WeChat ID */}
            <div className="w-full bg-gray-50 rounded-xl p-3 flex items-center justify-between border border-gray-200 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#07C160] rounded-lg flex items-center justify-center text-white">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M8.5,13.5A1.5,1.5 0 1,1 10,12A1.5,1.5 0 0,1 8.5,13.5M14.5,13.5A1.5,1.5 0 1,1 16,12A1.5,1.5 0 0,1 14.5,13.5M11.5,2C6.8,2 3,5.6 3,10c0,2.3 1.1,4.4 2.9,6L5,19l3.5-1.9c1 .3 2 .5 3 .5 4.7,0 8.5-3.6 8.5-8S16.2,2 11.5,2Z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold">{t.wechatId}</p>
                  <p className="font-bold text-gray-800">{wechatId}</p>
                </div>
              </div>
              <button 
                onClick={handleCopy}
                className="text-gray-400 hover:text-[#07C160] transition p-2"
                title={t.copy}
              >
                {copied ? <Check size={20} className="text-[#07C160]" /> : <Copy size={20} />}
              </button>
            </div>

            {/* زر QQ (للشباب) */}
            <button 
              onClick={handleQQ}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition flex items-center justify-center gap-2 text-sm font-bold"
            >
              {t.qqButton}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
