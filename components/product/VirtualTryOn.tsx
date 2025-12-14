'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Maximize2, Minimize2, RotateCw } from 'lucide-react';
import Button from '@/components/Button';

interface VirtualTryOnProps {
  productImage: string;
  productName: string;
  locale: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function VirtualTryOn({
  productImage,
  productName,
  locale,
  isOpen,
  onClose,
}: VirtualTryOnProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const productImageRef = useRef<HTMLImageElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Product image position and size
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });

  const translations = {
    ar: {
      tryOn: 'جرب الآن',
      close: 'إغلاق',
      loading: 'جاري تحميل الكاميرا...',
      error: 'فشل الوصول إلى الكاميرا',
      errorMessage: 'يرجى السماح بالوصول إلى الكاميرا',
      snapPhoto: 'التقاط صورة',
      capturing: 'جاري التقاط الصورة...',
      download: 'تحميل',
      reset: 'إعادة تعيين',
      instructions: 'اسحب الصورة لتغيير موضعها، واسحب الزاوية لتغيير الحجم',
    },
    zh: {
      tryOn: '试穿',
      close: '关闭',
      loading: '正在加载摄像头...',
      error: '无法访问摄像头',
      errorMessage: '请允许访问摄像头',
      snapPhoto: '拍照',
      capturing: '正在拍照...',
      download: '下载',
      reset: '重置',
      instructions: '拖动图片改变位置，拖动角落改变大小',
    },
    en: {
      tryOn: 'Try On',
      close: 'Close',
      loading: 'Loading camera...',
      error: 'Failed to access camera',
      errorMessage: 'Please allow camera access',
      snapPhoto: 'Snap Photo',
      capturing: 'Capturing...',
      download: 'Download',
      reset: 'Reset',
      instructions: 'Drag image to move, drag corner to resize',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  // Start webcam when modal opens
  useEffect(() => {
    if (isOpen) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [isOpen]);

  const startWebcam = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Request front-facing camera
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Front camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setError(err.message || t.error);
      setIsLoading(false);
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Initialize product image position to center
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const container = containerRef.current;
      const centerX = container.offsetWidth / 2 - size.width / 2;
      const centerY = container.offsetHeight / 2 - size.height / 2;
      setPosition({ x: centerX, y: centerY });
    }
  }, [isOpen, size.width, size.height]);

  // Handle mouse/touch drag
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !isResizing) {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const newX = e.clientX - rect.left - dragStart.x;
        const newY = e.clientY - rect.top - dragStart.y;
        
        // Constrain to container bounds
        const maxX = container.offsetWidth - size.width;
        const maxY = container.offsetHeight - size.height;
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Handle resize (drag from corner)
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      width: size.width,
      height: size.height,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleResizeMove = (e: React.MouseEvent) => {
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const scale = Math.max(0.5, Math.min(3, 1 + (deltaX + deltaY) / 200));
      
      setSize({
        width: resizeStart.width * scale,
        height: resizeStart.height * scale,
      });
    }
  };

  // Reset product image position and size
  const handleReset = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const centerX = container.offsetWidth / 2 - 200 / 2;
      const centerY = container.offsetHeight / 2 - 200 / 2;
      setPosition({ x: centerX, y: centerY });
      setSize({ width: 200, height: 200 });
    }
  };

  // Capture photo
  const handleSnapPhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw product image overlay
      if (productImageRef.current) {
        const img = productImageRef.current;
        const scaleX = canvas.width / (containerRef.current?.offsetWidth || 1);
        const scaleY = canvas.height / (containerRef.current?.offsetHeight || 1);
        
        ctx.drawImage(
          img,
          position.x * scaleX,
          position.y * scaleY,
          size.width * scaleX,
          size.height * scaleY
        );
      }

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `try-on-${productName}-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
        setIsCapturing(false);
      }, 'image/png');
    } catch (err: any) {
      console.error('Error capturing photo:', err);
      setError(err.message || 'Failed to capture photo');
      setIsCapturing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Video Container */}
          <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black overflow-hidden"
            onMouseMove={isDragging ? handleMouseMove : isResizing ? handleResizeMove : undefined}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>{t.loading}</p>
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white p-4">
                  <p className="text-lg font-semibold mb-2">{t.error}</p>
                  <p className="text-sm">{t.errorMessage}</p>
                </div>
              </div>
            )}

            {/* Product Image Overlay */}
            {!isLoading && !error && productImage && (
              <div
                style={{
                  position: 'absolute',
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  width: `${size.width}px`,
                  height: `${size.height}px`,
                  cursor: isDragging ? 'grabbing' : 'grab',
                }}
                onMouseDown={handleMouseDown}
              >
                <img
                  ref={productImageRef}
                  src={productImage}
                  alt={productName}
                  className="w-full h-full object-contain pointer-events-none"
                  draggable={false}
                />
                
                {/* Resize Handle (bottom-right corner) */}
                <div
                  className="absolute bottom-0 right-0 w-6 h-6 bg-primary-500 rounded-full cursor-nwse-resize flex items-center justify-center"
                  onMouseDown={handleResizeStart}
                  style={{ transform: 'translate(50%, 50%)' }}
                >
                  <Maximize2 className="w-3 h-3 text-white" />
                </div>
              </div>
            )}

            {/* Instructions */}
            {!isLoading && !error && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white text-sm p-2 rounded text-center">
                {t.instructions}
              </div>
            )}
          </div>

          {/* Controls */}
          {!isLoading && !error && (
            <div className="p-4 bg-gray-900 flex items-center justify-center gap-4">
              <Button
                variant="secondary"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                {t.reset}
              </Button>
              
              <Button
                variant="primary"
                onClick={handleSnapPhoto}
                disabled={isCapturing}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700"
              >
                {isCapturing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t.capturing}
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    {t.snapPhoto}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Hidden canvas for capturing */}
          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
