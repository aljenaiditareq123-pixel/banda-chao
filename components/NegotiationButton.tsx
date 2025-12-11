"use client";

import React, { useState } from 'react';
import { MessageCircle, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ChinaSocialModal from '@/components/ChinaSocialModal';

interface NegotiationButtonProps {
  productName: string;
  price: string | number;
  sellerPhone?: string; // رقم افتراضي إذا لم يوجد
  locale?: string;
}

export default function NegotiationButton({ 
  productName, 
  price, 
  sellerPhone = "971500000000", // ضع رقمك هنا مؤقتاً للتجربة
  locale = 'ar'
}: NegotiationButtonProps) {
  const { language } = useLanguage();
  const currentLocale = locale || language;
  const [showModal, setShowModal] = useState(false);

  const formatPrice = (price: string | number) => {
    if (typeof price === 'number') {
      return new Intl.NumberFormat('ar-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 0,
      }).format(price);
    }
    return price;
  };

  const handleNegotiate = (e: React.MouseEvent) => {
    e.stopPropagation(); // منع فتح صفحة المنتج عند الضغط على الزر
    e.preventDefault();

    // إذا كانت اللغة صينية، افتح مودال WeChat
    if (currentLocale === 'zh') {
      setShowModal(true);
      return;
    }

    // للعربية والإنجليزية، استخدم WhatsApp
    const messages = {
      ar: `مرحباً 👋\nأنا مهتم بمنتج: *${productName}*\nالمعروض بسعر: *${formatPrice(price)}*\n\nهل يمكنني الحصول على خصم خاص؟ 🤔`,
      en: `Hello 👋\nI'm interested in: *${productName}*\nPrice: *${formatPrice(price)}*\n\nCan I get a special discount? 🤔`,
    };

    const message = messages[currentLocale as keyof typeof messages] || messages.ar;
    
    // تحويل الرسالة لرابط واتساب
    const url = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`;
    
    // فتح في نافذة جديدة
    window.open(url, '_blank');
  };

  const texts = {
    ar: {
      tooltip: "جرب تطلب خصم! 😉",
      label: "كاسر بالسعر",
      ariaLabel: "تحدث مع البائع واتساب",
    },
    zh: {
      tooltip: "试试要折扣！😉",
      label: "讨价还价",
      ariaLabel: "通过WhatsApp与卖家聊天",
    },
    en: {
      tooltip: "Try asking for a discount! 😉",
      label: "Negotiate",
      ariaLabel: "Chat with seller on WhatsApp",
    },
  };

  const t = texts[currentLocale as keyof typeof texts] || texts.ar;

  return (
    <>
      <div className="relative group z-20">
        {/* التلميح المشجع */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {t.tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
        </div>

        <button
          onClick={handleNegotiate}
          className={`${
            currentLocale === 'zh' 
              ? 'bg-[#07C160] hover:bg-[#06B050]' 
              : 'bg-green-500 hover:bg-green-600'
          } text-white p-2 rounded-full shadow-lg transition-transform transform hover:scale-110 active:scale-95 flex items-center justify-center gap-1`}
          aria-label={t.ariaLabel}
        >
          <MessageCircle size={20} />
          <span className="text-xs font-bold hidden sm:inline-block">{t.label}</span>
        </button>
      </div>

      {/* WeChat Modal for Chinese users */}
      <ChinaSocialModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        wechatId={`BandaChao_${productName.slice(0, 10).replace(/\s/g, '_')}`}
        locale={currentLocale}
      />
    </>
  );
}
