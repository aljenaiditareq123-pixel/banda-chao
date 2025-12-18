'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Download, Share2, Play, Pause, Volume2, RefreshCw } from 'lucide-react';

interface ProductImage {
  url: string;
  alt?: string;
}

interface MagicVideoGeneratorProps {
  productName: string;
  productPrice: string;
  productImages: ProductImage[];
  locale?: string;
  onClose?: () => void;
}

// Ken Burns Effect Variants
const kenBurnsVariants = [
  { scale: [1, 1.15], x: [0, -20], y: [0, -15] },
  { scale: [1.1, 1], x: [-10, 10], y: [0, -10] },
  { scale: [1, 1.2], x: [0, 15], y: [-5, 5] },
  { scale: [1.15, 1.05], x: [10, -5], y: [5, -5] },
];

export default function MagicVideoGenerator({
  productName,
  productPrice,
  productImages,
  locale = 'en',
  onClose,
}: MagicVideoGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState<'idle' | 'generating' | 'ready'>('idle');
  const [progress, setProgress] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [musicBars, setMusicBars] = useState<number[]>([3, 7, 5, 8, 4, 6, 9, 5, 7, 4]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const texts = {
    ar: {
      buttonText: '✨ إنشاء فيديو سحري',
      modalTitle: '🎬 استوديو الفيديو السحري',
      generating: 'جاري إنشاء الفيديو...',
      processingImages: 'معالجة الصور...',
      addingEffects: 'إضافة التأثيرات...',
      renderingVideo: 'تحويل الفيديو...',
      ready: 'الفيديو جاهز! 🎉',
      download: 'تحميل',
      shareToTikTok: 'مشاركة في TikTok',
      regenerate: 'إعادة إنشاء',
      close: 'إغلاق',
      poweredBy: 'مدعوم بالذكاء الاصطناعي',
      musicLabel: '🎵 موسيقى تجارية',
    },
    en: {
      buttonText: '✨ Create Magic Video',
      modalTitle: '🎬 Magic Video Studio',
      generating: 'Generating video...',
      processingImages: 'Processing images...',
      addingEffects: 'Adding effects...',
      renderingVideo: 'Rendering video...',
      ready: 'Video Ready! 🎉',
      download: 'Download',
      shareToTikTok: 'Share to TikTok',
      regenerate: 'Regenerate',
      close: 'Close',
      poweredBy: 'Powered by AI',
      musicLabel: '🎵 Commercial Music',
    },
    zh: {
      buttonText: '✨ 创建魔法视频',
      modalTitle: '🎬 魔法视频工作室',
      generating: '正在生成视频...',
      processingImages: '处理图片中...',
      addingEffects: '添加特效中...',
      renderingVideo: '渲染视频中...',
      ready: '视频已准备好！🎉',
      download: '下载',
      shareToTikTok: '分享到TikTok',
      regenerate: '重新生成',
      close: '关闭',
      poweredBy: 'AI驱动',
      musicLabel: '🎵 商业音乐',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  // Ensure we have at least one image
  const images = productImages.length > 0 
    ? productImages 
    : [{ url: 'https://via.placeholder.com/600x600?text=Product', alt: 'Product' }];

  // Music visualizer animation
  useEffect(() => {
    if (stage === 'ready' && isPlaying) {
      const musicInterval = setInterval(() => {
        setMusicBars(prev => prev.map(() => Math.floor(Math.random() * 10) + 1));
      }, 150);
      return () => clearInterval(musicInterval);
    }
  }, [stage, isPlaying]);

  // Image slideshow for final video
  useEffect(() => {
    if (stage === 'ready' && isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
      }, 3000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [stage, isPlaying, images.length]);

  const handleOpen = () => {
    setIsOpen(true);
    startGeneration();
  };

  const startGeneration = () => {
    setStage('generating');
    setProgress(0);
    setCurrentImageIndex(0);

    // Simulate video generation progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setStage('ready');
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 400);
  };

  const handleClose = () => {
    setIsOpen(false);
    setStage('idle');
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (onClose) onClose();
  };

  const handleRegenerate = () => {
    setStage('idle');
    setProgress(0);
    setCurrentImageIndex(0);
    setTimeout(() => startGeneration(), 100);
  };

  const getProgressText = () => {
    if (progress < 30) return t.processingImages;
    if (progress < 60) return t.addingEffects;
    if (progress < 90) return t.renderingVideo;
    return t.generating;
  };

  const handleShare = (platform: 'tiktok' | 'download') => {
    if (platform === 'tiktok') {
      // Open TikTok share (would need proper API integration)
      window.open('https://www.tiktok.com/upload', '_blank');
    } else {
      // Simulate download (would generate actual video in production)
      alert(locale === 'ar' 
        ? 'سيتم تحميل الفيديو قريباً!' 
        : 'Video will be downloaded soon!');
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={handleOpen}
        className="w-full min-h-[52px] text-base font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={{
          boxShadow: [
            '0 0 15px rgba(168, 85, 247, 0.3)',
            '0 0 25px rgba(236, 72, 153, 0.4)',
            '0 0 15px rgba(168, 85, 247, 0.3)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Sparkles className="w-5 h-5" />
        {t.buttonText}
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <motion.div
              className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 rounded-3xl overflow-hidden border border-purple-500/30 shadow-2xl"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="p-6 pb-0">
                <h2 className="text-2xl font-bold text-white text-center">
                  {t.modalTitle}
                </h2>
                <p className="text-purple-300/60 text-sm text-center mt-1">
                  {t.poweredBy}
                </p>
              </div>

              {/* Video Preview Area */}
              <div className="relative aspect-[9/16] max-h-[60vh] mx-6 mt-4 rounded-2xl overflow-hidden bg-black shadow-2xl">
                {/* Ken Burns Slideshow */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.img
                      src={images[currentImageIndex]?.url}
                      alt={images[currentImageIndex]?.alt || productName}
                      className="w-full h-full object-cover"
                      animate={kenBurnsVariants[currentImageIndex % kenBurnsVariants.length]}
                      transition={{
                        duration: 3,
                        ease: 'easeInOut',
                      }}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Dark Overlay for Text Visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Product Info Overlay */}
                {stage === 'ready' && (
                  <>
                    {/* Top Brand Watermark */}
                    <motion.div
                      className="absolute top-4 left-4"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="text-white/80 font-bold text-sm">
                        🐼 Banda Chao
                      </span>
                    </motion.div>

                    {/* Product Name & Price */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 p-6"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                    >
                      <motion.h3
                        className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2"
                        animate={{ opacity: [1, 0.8, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {productName}
                      </motion.h3>
                      <motion.div
                        className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold px-4 py-2 rounded-full text-lg"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {productPrice}
                      </motion.div>

                      {/* CTA Badge */}
                      <motion.div
                        className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                      >
                        <span className="text-white text-sm font-medium">
                          {locale === 'ar' ? 'اشترِ الآن! 👆' : locale === 'zh' ? '立即购买！👆' : 'Buy Now! 👆'}
                        </span>
                      </motion.div>
                    </motion.div>

                    {/* Music Visualizer (Bottom Right) */}
                    <motion.div
                      className="absolute bottom-6 right-4 flex items-end gap-0.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="mr-2 text-white/80 hover:text-white"
                      >
                        {isPlaying ? <Volume2 className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </button>
                      {musicBars.map((height, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full"
                          animate={{ height: isPlaying ? `${height * 3}px` : '4px' }}
                          transition={{ duration: 0.15 }}
                        />
                      ))}
                    </motion.div>

                    {/* Play/Pause Indicator */}
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                    >
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </button>

                    {/* Image Counter */}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}

                {/* Generation Progress Overlay */}
                {stage === 'generating' && (
                  <motion.div
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {/* Spinning Magic Icon */}
                    <motion.div
                      className="text-6xl mb-6"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      ✨
                    </motion.div>

                    {/* Progress Text */}
                    <motion.p
                      className="text-white font-medium mb-4"
                      animate={{ opacity: [1, 0.6, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {getProgressText()}
                    </motion.p>

                    {/* Progress Bar */}
                    <div className="w-64 h-3 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
                        initial={{ width: '0%' }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-white/60 text-sm mt-2">
                      {Math.round(Math.min(progress, 100))}%
                    </p>

                    {/* Processing Images Preview */}
                    <div className="flex gap-2 mt-6">
                      {images.slice(0, 4).map((img, i) => (
                        <motion.div
                          key={i}
                          className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/30"
                          animate={{ 
                            borderColor: progress > (i + 1) * 25 
                              ? 'rgba(34, 197, 94, 0.8)' 
                              : 'rgba(255, 255, 255, 0.3)',
                            scale: progress > i * 25 && progress < (i + 1) * 25 
                              ? [1, 1.1, 1] 
                              : 1,
                          }}
                          transition={{ duration: 0.5, repeat: progress > i * 25 && progress < (i + 1) * 25 ? Infinity : 0 }}
                        >
                          <img
                            src={img.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          {progress > (i + 1) * 25 && (
                            <motion.div
                              className="absolute inset-0 bg-green-500/30 flex items-center justify-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <span className="text-white text-lg">✓</span>
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 space-y-3">
                {stage === 'ready' && (
                  <>
                    {/* Ready Status */}
                    <motion.div
                      className="text-center mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <span className="inline-block bg-green-500/20 text-green-400 font-bold px-4 py-2 rounded-full">
                        {t.ready}
                      </span>
                    </motion.div>

                    {/* Share Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        onClick={() => handleShare('download')}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Download className="w-5 h-5" />
                        {t.download}
                      </motion.button>
                      
                      <motion.button
                        onClick={() => handleShare('tiktok')}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 rounded-xl text-white font-bold transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Share2 className="w-5 h-5" />
                        {t.shareToTikTok}
                      </motion.button>
                    </div>

                    {/* Regenerate Button */}
                    <motion.button
                      onClick={handleRegenerate}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl text-purple-300 font-medium transition-colors"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <RefreshCw className="w-4 h-4" />
                      {t.regenerate}
                    </motion.button>
                  </>
                )}

                {/* Music Label */}
                <div className="text-center text-purple-300/60 text-xs">
                  {t.musicLabel}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

