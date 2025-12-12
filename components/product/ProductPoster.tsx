'use client';

import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Copy, Share2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductPosterProps {
  productName: string;
  productImage: string;
  soloPrice: number;
  teamPrice: number;
  currency?: string;
  locale?: string;
  productUrl: string;
  onClose?: () => void;
}

export default function ProductPoster({
  productName,
  productImage,
  soloPrice,
  teamPrice,
  currency = 'AED',
  locale = 'en',
  productUrl,
  onClose,
}: ProductPosterProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  const formatPrice = (price: number) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      CNY: '¥',
      SAR: 'ر.س',
      AED: 'د.إ',
    };
    return `${symbols[currency] || currency} ${price.toLocaleString()}`;
  };

  const generatePoster = async () => {
    if (!posterRef.current) return null;

    setIsGenerating(true);
    try {
      // Use html2canvas with high resolution and CORS support
      const canvas = await html2canvas(posterRef.current, {
        scale: 3, // High resolution (3x)
        useCORS: true, // Handle CORS for external images
        allowTaint: false,
        backgroundColor: '#000000',
        logging: false,
        width: posterRef.current.offsetWidth,
        height: posterRef.current.offsetHeight,
      });

      return canvas.toDataURL('image/png', 1.0);
    } catch (error) {
      console.error('Error generating poster:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await generatePoster();
    if (!dataUrl) return;

    // Create download link
    const link = document.createElement('a');
    link.download = `${productName.replace(/\s+/g, '_')}_poster.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    const dataUrl = await generatePoster();
    if (!dataUrl) return;

    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Copy to clipboard using Clipboard API
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying image:', error);
      // Fallback: download instead
      handleDownload();
    }
  };

  const texts = {
    ar: {
      exclusive: 'عرض حصري',
      groupBuyPrice: 'سعر الشراء الجماعي',
      soloPrice: 'السعر الفردي',
      scanToBuy: 'اضغط مطولاً للمسح والشراء على Banda Chao',
      download: 'حفظ الصورة',
      copy: 'نسخ الصورة',
      generating: 'جاري إنشاء الملصق...',
      share: 'مشاركة',
    },
    zh: {
      exclusive: '独家优惠',
      groupBuyPrice: '团购价',
      soloPrice: '单独购买价',
      scanToBuy: '长按扫描，在 Banda Chao 购买',
      download: '保存图片',
      copy: '复制图片',
      generating: '正在生成海报...',
      share: '分享',
    },
    en: {
      exclusive: 'Exclusive Deal',
      groupBuyPrice: 'Group Buy Price',
      soloPrice: 'Solo Price',
      scanToBuy: 'Long press to scan & buy on Banda Chao',
      download: 'Save Image',
      copy: 'Copy Image',
      generating: 'Generating Poster...',
      share: 'Share',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <>
      {/* Floating Share Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 z-40 lg:bottom-6 lg:right-6 w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:shadow-amber-500/50 hover:scale-110 transition-all duration-300 group"
        aria-label={t.share}
      >
        <Share2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              onClick={() => {
                setIsModalOpen(false);
                onClose?.();
              }}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t.share}
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      onClose?.();
                    }}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Preview */}
                <div className="p-6 space-y-4">
                  {/* Hidden Canvas for html2canvas */}
                  <div className="hidden">
                    <div
                      ref={posterRef}
                      className="relative w-[360px] aspect-[9/16] bg-gradient-to-br from-black via-gray-900 to-amber-950"
                      style={{ width: '360px', height: '640px' }}
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(251, 191, 36, 0.3) 1px, transparent 0)`,
                          backgroundSize: '40px 40px',
                        }} />
                      </div>

                      {/* Header - Logo & Exclusive Badge */}
                      <div className="absolute top-8 left-0 right-0 px-8 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-xl font-bold text-white">BC</span>
                          </div>
                          <span className="text-white font-bold text-lg">Banda Chao</span>
                        </div>
                        <div className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full">
                          <span className="text-white text-xs font-bold uppercase tracking-wider">
                            {t.exclusive}
                          </span>
                        </div>
                      </div>

                      {/* Product Image */}
                      <div className="absolute top-32 left-8 right-8 h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-500/20">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-900/50 to-orange-900/50 flex items-center justify-center">
                            <span className="text-6xl">🛍️</span>
                          </div>
                        )}
                      </div>

                      {/* Product Name */}
                      <div className="absolute top-96 left-8 right-8">
                        <h3 className="text-white text-2xl font-bold leading-tight mb-4 line-clamp-2">
                          {productName}
                        </h3>
                      </div>

                      {/* Prices */}
                      <div className="absolute top-[420px] left-8 right-8">
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className="text-4xl font-bold text-red-500">
                            {formatPrice(teamPrice)}
                          </span>
                          <span className="text-xl text-gray-400 line-through">
                            {formatPrice(soloPrice)}
                          </span>
                        </div>
                        <p className="text-amber-400 text-sm font-medium">
                          {t.groupBuyPrice}
                        </p>
                      </div>

                      {/* Footer - QR Code */}
                      <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center px-8">
                        <div className="bg-white p-4 rounded-2xl shadow-2xl mb-4">
                          <QRCodeSVG
                            value={productUrl}
                            size={140}
                            level="H"
                            includeMargin={false}
                            fgColor="#000000"
                            bgColor="#ffffff"
                          />
                        </div>
                        <p className="text-white/90 text-sm font-medium text-center max-w-[280px] leading-relaxed">
                          {t.scanToBuy}
                        </p>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                    </div>
                  </div>

                  {/* Preview (Visible) */}
                  <div className="flex justify-center">
                    <div
                      className="relative w-[270px] aspect-[9/16] bg-gradient-to-br from-black via-gray-900 to-amber-950 rounded-2xl overflow-hidden shadow-2xl"
                      style={{ width: '270px', height: '480px' }}
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(251, 191, 36, 0.3) 1px, transparent 0)`,
                          backgroundSize: '30px 30px',
                        }} />
                      </div>

                      {/* Header */}
                      <div className="absolute top-6 left-0 right-0 px-6 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-base font-bold text-white">BC</span>
                          </div>
                          <span className="text-white font-bold text-sm">Banda Chao</span>
                        </div>
                        <div className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full">
                          <span className="text-white text-[10px] font-bold uppercase tracking-wider">
                            {t.exclusive}
                          </span>
                        </div>
                      </div>

                      {/* Product Image */}
                      <div className="absolute top-24 left-6 right-6 h-48 rounded-xl overflow-hidden shadow-xl border-2 border-amber-500/20">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-900/50 to-orange-900/50 flex items-center justify-center">
                            <span className="text-5xl">🛍️</span>
                          </div>
                        )}
                      </div>

                      {/* Product Name */}
                      <div className="absolute top-72 left-6 right-6">
                        <h3 className="text-white text-lg font-bold leading-tight mb-3 line-clamp-2">
                          {productName}
                        </h3>
                      </div>

                      {/* Prices */}
                      <div className="absolute top-[340px] left-6 right-6">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-3xl font-bold text-red-500">
                            {formatPrice(teamPrice)}
                          </span>
                          <span className="text-base text-gray-400 line-through">
                            {formatPrice(soloPrice)}
                          </span>
                        </div>
                        <p className="text-amber-400 text-xs font-medium">
                          {t.groupBuyPrice}
                        </p>
                      </div>

                      {/* Footer - QR Code */}
                      <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center px-6">
                        <div className="bg-white p-3 rounded-xl shadow-xl mb-3">
                          <QRCodeSVG
                            value={productUrl}
                            size={105}
                            level="H"
                            includeMargin={false}
                            fgColor="#000000"
                            bgColor="#ffffff"
                          />
                        </div>
                        <p className="text-white/90 text-xs font-medium text-center max-w-[210px] leading-relaxed">
                          {t.scanToBuy}
                        </p>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleDownload}
                      disabled={isGenerating}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{t.generating}</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          <span>{t.download}</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCopy}
                      disabled={isGenerating || copied}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {copied ? (
                        <>
                          <span className="text-green-500">✓</span>
                          <span className="text-green-600 dark:text-green-400">
                            {locale === 'ar' ? 'تم النسخ' : locale === 'zh' ? '已复制' : 'Copied!'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          <span>{t.copy}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
