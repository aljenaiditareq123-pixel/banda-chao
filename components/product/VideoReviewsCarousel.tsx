'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoReview {
  id: string;
  review_video_url: string;
  content?: string;
  review_rating?: number;
  created_at: string | Date;
  users: {
    id: string;
    name: string | null;
    profile_picture: string | null;
  };
}

interface VideoReviewsCarouselProps {
  reviews: VideoReview[];
  locale: string;
}

export default function VideoReviewsCarousel({ reviews, locale }: VideoReviewsCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoReviews = reviews.filter((r) => r.review_video_url);

  if (videoReviews.length === 0) {
    return null;
  }

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    setIsPlaying(true);
  };

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setSelectedIndex(null);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const selectedReview = selectedIndex !== null ? videoReviews[selectedIndex] : null;
  const videoUrl = selectedReview?.review_video_url
    ? selectedReview.review_video_url.startsWith('http')
      ? selectedReview.review_video_url
      : (() => {
          const { getApiBaseUrl } = require('@/lib/api-utils');
          return `${getApiBaseUrl()}${selectedReview.review_video_url}`;
        })()
    : null;

  const translations = {
    ar: {
      videoReviews: 'مراجعات الفيديو',
      noVideoReviews: 'لا توجد مراجعات فيديو',
    },
    zh: {
      videoReviews: '视频评论',
      noVideoReviews: '暂无视频评论',
    },
    en: {
      videoReviews: 'Video Reviews',
      noVideoReviews: 'No video reviews',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  return (
    <div className="w-full" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        {t.videoReviews} ({videoReviews.length})
      </h3>

      {/* Thumbnail Circles (Stories Style) */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {videoReviews.map((review, index) => (
          <button
            key={review.id}
            onClick={() => handleThumbnailClick(index)}
            className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-primary-500 ring-2 ring-offset-2 ring-primary-300 group-hover:scale-110 transition-transform">
              {review.users.profile_picture ? (
                <img
                  src={review.users.profile_picture}
                  alt={review.users.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                  {review.users.name?.[0]?.toUpperCase() || '👤'}
                </div>
              )}
              {/* Play icon overlay */}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-6 h-6 text-white" fill="white" />
              </div>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 text-center max-w-[80px] truncate">
              {review.users.name || 'Anonymous'}
            </span>
          </button>
        ))}
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedIndex !== null && selectedReview && videoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-2xl bg-black rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Video Player */}
              <div className="relative w-full aspect-[9/16] bg-black">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  playsInline
                  muted={isMuted}
                  onEnded={handleVideoEnd}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Controls Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors group">
                  {/* Play/Pause Button */}
                  <button
                    onClick={togglePlayPause}
                    className="opacity-0 group-hover:opacity-100 bg-black/50 hover:bg-black/70 rounded-full p-4 transition-opacity"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white" fill="white" />
                    )}
                  </button>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      {selectedReview.users.profile_picture ? (
                        <img
                          src={selectedReview.users.profile_picture}
                          alt={selectedReview.users.name || 'User'}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold">
                          {selectedReview.users.name?.[0]?.toUpperCase() || '👤'}
                        </div>
                      )}
                      <span className="font-semibold">
                        {selectedReview.users.name || 'Anonymous'}
                      </span>
                      {selectedReview.review_rating && (
                        <span className="text-yellow-400">
                          {'⭐'.repeat(Math.round(selectedReview.review_rating))}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={toggleMute}
                      className="bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 text-white" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                  {selectedReview.content && (
                    <p className="text-white text-sm mt-2 line-clamp-2">
                      {selectedReview.content}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
