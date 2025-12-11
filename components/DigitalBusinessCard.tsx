"use client";

import React, { useRef, useCallback } from 'react';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import { Download, Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DigitalBusinessCardProps {
  shopName?: string;
  productName?: string;
  makerId?: string;
  productId?: string;
  locale?: string;
}

export default function DigitalBusinessCard({ 
  shopName = "متجر المبدع", 
  productName = "منتج مميز",
  makerId,
  productId,
  locale = 'ar'
}: DigitalBusinessCardProps) {
  const { language } = useLanguage();
  const currentLocale = locale || language;
  const cardRef = useRef<HTMLDivElement>(null);

  // Generate QR Code URL - link to maker's page or product page
  const qrCodeUrl = productId 
    ? `https://bandachao.com/${currentLocale}/products/${productId}`
    : makerId 
    ? `https://bandachao.com/${currentLocale}/makers/${makerId}`
    : `https://bandachao.com/${currentLocale}`;

  const handleDownload = useCallback(() => {
    if (cardRef.current === null) {
      return;
    }

    toPng(cardRef.current, { 
      cacheBust: true,
      backgroundColor: '#111827',
      quality: 1.0,
      pixelRatio: 2,
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = currentLocale === 'ar' 
          ? 'بطاقة-باندا-للأعمال.png' 
          : currentLocale === 'zh'
          ? '熊猫商务卡.png'
          : 'panda-business-card.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Failed to download image', err);
      });
  }, [cardRef, currentLocale]);

  const texts = {
    ar: {
      brand: "BANDA CHAO",
      scanToBuy: "امسح الكود للشراء",
      available: "● متاح الآن",
      download: "تحميل البطاقة",
      tip: "اطبع هذه البطاقة وألصقها على منتجك ليزيد مبيعاتك!",
    },
    zh: {
      brand: "BANDA CHAO",
      scanToBuy: "扫码购买",
      available: "● 现在可用",
      download: "下载卡片",
      tip: "打印这张卡片并贴在您的产品上以增加销量！",
    },
    en: {
      brand: "BANDA CHAO",
      scanToBuy: "Scan to Buy",
      available: "● Available Now",
      download: "Download Card",
      tip: "Print this card and stick it on your product to increase sales!",
    },
  };

  const t = texts[currentLocale as keyof typeof texts] || texts.en;

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      
      {/* البطاقة نفسها - سيتم تحويل هذا الجزء لصورة */}
      <div 
        ref={cardRef}
        className="w-full max-w-sm aspect-[1.58/1] bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-6 relative overflow-hidden shadow-2xl border border-gray-700 flex flex-row items-center justify-between text-white"
      >
        {/* خلفية زخرفية */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

        {/* شعار الباندا في الزاوية */}
        <div className="absolute top-2 left-2 text-2xl opacity-20">🐼</div>

        {/* الجانب الأيمن: المعلومات */}
        <div className="z-10 flex flex-col justify-between h-full w-1/2 pr-2">
          <div>
            <div className="text-xs text-yellow-500 font-bold tracking-widest mb-1">{t.brand}</div>
            <h2 className="text-xl font-bold leading-tight mb-1 line-clamp-2">{shopName}</h2>
            <p className="text-gray-400 text-xs line-clamp-2">{productName}</p>
          </div>
          
          <div className="mt-auto">
            <p className="text-[10px] text-gray-500 mb-1">{t.scanToBuy}</p>
            <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
              <span>●</span> {t.available}
            </div>
          </div>
        </div>

        {/* الجانب الأيسر: QR Code */}
        <div className="z-10 bg-white p-2 rounded-xl shadow-lg">
          <div style={{ height: "auto", margin: "0 auto", maxWidth: 96, width: "100%" }}>
            <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={qrCodeUrl}
              viewBox={`0 0 256 256`}
            />
          </div>
        </div>
      </div>

      {/* أزرار التحكم */}
      <div className="flex gap-4 w-full max-w-sm">
        <button 
          onClick={handleDownload}
          className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95"
        >
          <Download size={20} />
          {t.download}
        </button>
      </div>
      
      <p className="text-gray-400 text-sm text-center px-4">
        {t.tip}
      </p>
    </div>
  );
}
