'use client';

import { useState, useRef, useEffect } from 'react';
import { Video, Square, Upload, Camera, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BandaStudioProps {
  locale?: string;
}

export default function BandaStudio({ locale = 'en' }: BandaStudioProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [tiktokLinked, setTiktokLinked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Request camera access on mount
  useEffect(() => {
    const requestCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };

    requestCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleRecord = () => {
    setIsRecording(true);
    setHasRecorded(true);
  };

  const handleStop = () => {
    setIsRecording(false);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setShowSuccess(true);
          
          // Save video to localStorage
          const videoData = {
            id: Date.now(),
            type: 'short',
            thumbnail: 'https://images.unsplash.com/photo-1556906781-9a412961d289?q=80&w=800&auto=format&fit=crop',
            url: `https://www.youtube.com/watch?v=${Date.now()}`,
            title: `My Video - ${new Date().toLocaleDateString()}`,
            views: '0',
            isNew: true,
            uploadedAt: new Date().toISOString(),
          };
          
          // Get existing videos from localStorage
          const existingVideos = JSON.parse(localStorage.getItem('banda_user_videos') || '[]');
          const updatedVideos = [videoData, ...existingVideos];
          localStorage.setItem('banda_user_videos', JSON.stringify(updatedVideos));
          
          // Update gamification progress (add 5% per video)
          const rankData = JSON.parse(localStorage.getItem('banda_artisan_rank') || JSON.stringify({
            currentRank: 'Silver Artisan',
            nextRank: 'Gold Dragon',
            progress: 70,
            nextReward: 'Unlock 0% Commission',
            level: 2,
          }));
          rankData.progress = Math.min(100, rankData.progress + 5);
          localStorage.setItem('banda_artisan_rank', JSON.stringify(rankData));
          
          // Trigger storage event for other components
          window.dispatchEvent(new Event('storage'));
          
          setTimeout(() => setShowSuccess(false), 3000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const texts = {
    ar: {
      title: 'استوديو بندا الذكي',
      cameraPreview: 'معاينة الكاميرا',
      record: 'تسجيل',
      stop: 'إيقاف',
      upload: 'رفع',
      tiktokLink: 'ربط مع TikTok',
      optimizing: 'جاري التحسين للسحابة الصينية...',
      success: 'تم الرفع بنجاح!',
    },
    en: {
      title: 'Banda Smart Studio',
      cameraPreview: 'Camera Preview',
      record: 'Record',
      stop: 'Stop',
      upload: 'Upload',
      tiktokLink: 'Link to TikTok',
      optimizing: 'Optimizing for China Cloud...',
      success: 'Upload Successful!',
    },
    zh: {
      title: 'Banda 智能工作室',
      cameraPreview: '相机预览',
      record: '录制',
      stop: '停止',
      upload: '上传',
      tiktokLink: '链接到 TikTok',
      optimizing: '正在为中国云优化...',
      success: '上传成功！',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 mb-2">
            {t.title}
          </h1>
          <p className="text-gray-400">
            {locale === 'ar' 
              ? 'سجل وشارك مقاطع الفيديو الخاصة بك مباشرة'
              : locale === 'zh'
              ? '直接录制和分享您的视频'
              : 'Record and publish your videos directly'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Recording Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Camera Preview */}
            <div className="bg-black rounded-2xl border-2 border-amber-500/20 overflow-hidden shadow-2xl">
              <div className="aspect-video relative bg-gray-900 flex items-center justify-center">
                {videoRef.current?.srcObject ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-gray-500">
                    <Camera className="w-16 h-16" />
                    <p className="text-lg">{t.cameraPreview}</p>
                    <p className="text-sm text-gray-600">
                      {locale === 'ar' 
                        ? 'جاري تحميل الكاميرا...'
                        : locale === 'zh'
                        ? '正在加载相机...'
                        : 'Loading camera...'}
                    </p>
                  </div>
                )}

                {/* Recording Indicator */}
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-4 py-2 rounded-full"
                  >
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    <span className="text-white font-bold text-sm">REC</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border-2 border-amber-500/20 p-6">
              <div className="flex flex-wrap items-center justify-center gap-4">
                {/* Record Button */}
                {!isRecording ? (
                  <button
                    onClick={handleRecord}
                    disabled={isUploading}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Video className="w-6 h-6" />
                    <span className="text-lg">{t.record}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Square className="w-6 h-6 fill-white" />
                    <span className="text-lg">{t.stop}</span>
                  </button>
                )}

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={!hasRecorded || isRecording || isUploading}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                  <span className="text-lg">{t.upload}</span>
                </button>
              </div>

              {/* Upload Progress */}
              <AnimatePresence>
                {isUploading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                      <span>{t.optimizing}</span>
                      <span className="font-bold text-amber-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Message */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 flex items-center gap-2 text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg p-4"
                  >
                    <Check className="w-5 h-5" />
                    <span className="font-semibold">{t.success}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* TikTok Link Toggle */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border-2 border-amber-500/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                {locale === 'ar' ? 'التكامل' : locale === 'zh' ? '集成' : 'Integrations'}
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                    <span className="text-xl">🎵</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{t.tiktokLink}</p>
                    <p className="text-xs text-gray-400">
                      {locale === 'ar' 
                        ? 'ربط تلقائي'
                        : locale === 'zh'
                        ? '自动链接'
                        : 'Auto-link'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setTiktokLinked(!tiktokLinked)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    tiktokLinked ? 'bg-amber-500' : 'bg-gray-600'
                  }`}
                >
                  <motion.div
                    animate={{ x: tiktokLinked ? 24 : 0 }}
                    className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-amber-900/20 to-yellow-900/20 backdrop-blur-sm rounded-2xl border-2 border-amber-500/30 p-6">
              <h3 className="text-lg font-bold text-amber-400 mb-3">
                {locale === 'ar' ? 'نصائح' : locale === 'zh' ? '提示' : 'Tips'}
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>
                    {locale === 'ar' 
                      ? 'استخدم إضاءة جيدة للحصول على أفضل جودة'
                      : locale === 'zh'
                      ? '使用良好的照明以获得最佳质量'
                      : 'Use good lighting for best quality'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>
                    {locale === 'ar' 
                      ? 'تأكد من وجود اتصال إنترنت مستقر'
                      : locale === 'zh'
                      ? '确保有稳定的互联网连接'
                      : 'Ensure stable internet connection'}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>
                    {locale === 'ar' 
                      ? 'سيتم تحسين الفيديو تلقائياً للسحابة الصينية'
                      : locale === 'zh'
                      ? '视频将自动为中国云优化'
                      : 'Video will be auto-optimized for China Cloud'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
