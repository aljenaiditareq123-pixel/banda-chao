'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, ShoppingBag, Share2, MoreVertical, Play, Pause } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import LikeButton from '@/components/social/LikeButton';

interface VideoItem {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  product?: {
    id: string;
    name: string;
    price: number;
    currency?: string;
    imageUrl?: string;
  };
  maker?: {
    id: string;
    name: string;
    profilePicture?: string;
  };
  likesCount: number;
  viewsCount: number;
  duration?: number;
}

interface VideoFeedProps {
  videos: VideoItem[];
  locale: string;
}

export default function VideoFeed({ videos: initialVideos, locale }: VideoFeedProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});

  // Mock videos if none provided
  useEffect(() => {
    if (videos.length === 0) {
      setVideos([
        {
          id: '1',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          title: 'Demo Product Video 1',
          description: 'Amazing product showcase',
          product: {
            id: 'p1',
            name: 'Premium Watch',
            price: 199.99,
            currency: 'USD',
            imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
          },
          maker: {
            id: 'm1',
            name: 'Designer Store',
            profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Designer',
          },
          likesCount: 1234,
          viewsCount: 5678,
        },
        {
          id: '2',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          title: 'Demo Product Video 2',
          description: 'Check out this amazing item',
          product: {
            id: 'p2',
            name: 'Smartphone Pro',
            price: 599.99,
            currency: 'USD',
            imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
          },
          maker: {
            id: 'm2',
            name: 'Tech Store',
            profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech',
          },
          likesCount: 2345,
          viewsCount: 8901,
        },
        {
          id: '3',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          title: 'Demo Product Video 3',
          description: 'Limited time offer',
          product: {
            id: 'p3',
            name: 'Fashion Dress',
            price: 89.99,
            currency: 'USD',
            imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
          },
          maker: {
            id: 'm3',
            name: 'Fashion Boutique',
            profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fashion',
          },
          likesCount: 3456,
          viewsCount: 12345,
        },
      ]);
    }
  }, [videos.length]);

  // Auto-play current video
  useEffect(() => {
    const currentVideo = videos[currentIndex];
    if (!currentVideo) return;

    const videoElement = videoRefs.current[currentVideo.id];
    if (videoElement) {
      videoElement.play().catch(() => {
        // Autoplay failed, user interaction required
        setIsPlaying((prev) => ({ ...prev, [currentVideo.id]: false }));
      });
      setIsPlaying((prev) => ({ ...prev, [currentVideo.id]: true }));
    }

    // Pause other videos
    Object.keys(videoRefs.current).forEach((id) => {
      if (id !== currentVideo.id) {
        const video = videoRefs.current[id];
        if (video) {
          video.pause();
          setIsPlaying((prev) => ({ ...prev, [id]: false }));
        }
      }
    });
  }, [currentIndex, videos]);

  // Touch handlers for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    if (isUpSwipe && currentIndex < videos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
    if (isDownSwipe && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Scroll to current video
  useEffect(() => {
    if (containerRef.current) {
      const videoElement = containerRef.current.children[currentIndex] as HTMLElement;
      if (videoElement) {
        videoElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentIndex]);

  const handleVideoClick = (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (video) {
      if (isPlaying[videoId]) {
        video.pause();
        setIsPlaying((prev) => ({ ...prev, [videoId]: false }));
      } else {
        video.play();
        setIsPlaying((prev) => ({ ...prev, [videoId]: true }));
      }
    }
  };

  const handleQuickBuy = (product: VideoItem['product']) => {
    if (!product) return;
    
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      currency: product.currency || 'USD',
      quantity: 1,
    }, locale);

    // Show success feedback
    alert(locale === 'ar' 
      ? `تمت إضافة ${product.name} للسلة`
      : locale === 'zh'
      ? `已将${product.name}添加到购物车`
      : `${product.name} added to cart`);
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      CNY: '¥',
      SAR: 'ر.س',
      AED: 'د.إ',
    };
    return `${symbols[currency] || currency} ${price.toLocaleString()}`;
  };

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">
          {locale === 'ar' ? 'لا توجد فيديوهات' : locale === 'zh' ? '没有视频' : 'No videos'}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {videos.map((video, index) => (
        <div
          key={video.id}
          className="h-screen w-full snap-start snap-always relative bg-black"
          style={{ scrollSnapAlign: 'start' }}
        >
          {/* Video Player */}
          <div className="absolute inset-0">
            <video
              ref={(el) => {
                if (el) videoRefs.current[video.id] = el;
              }}
              src={video.videoUrl}
              className="w-full h-full object-cover"
              loop
              muted={false}
              playsInline
              onPlay={() => setIsPlaying((prev) => ({ ...prev, [video.id]: true }))}
              onPause={() => setIsPlaying((prev) => ({ ...prev, [video.id]: false }))}
            />
            
            {/* Play/Pause Overlay */}
            {!isPlaying[video.id] && (
              <button
                onClick={() => handleVideoClick(video.id)}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
              >
                <div className="bg-white/90 rounded-full p-6">
                  <Play className="w-12 h-12 text-gray-900" fill="currentColor" />
                </div>
              </button>
            )}
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
              {/* Product Info */}
              {video.product && (
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    {video.product.imageUrl && (
                      <img
                        src={video.product.imageUrl}
                        alt={video.product.name}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-white"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1">{video.product.name}</h3>
                      <p className="text-white/90 text-sm font-semibold">
                        {formatPrice(video.product.price, video.product.currency)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleQuickBuy(video.product)}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2 shadow-lg"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      {locale === 'ar' ? 'شراء سريع' : locale === 'zh' ? '快速购买' : 'Quick Buy'}
                    </button>
                  </div>
                </div>
              )}

              {/* Video Info */}
              <div className="mb-4">
                <h2 className="text-white font-bold text-xl mb-1">{video.title}</h2>
                {video.description && (
                  <p className="text-white/80 text-sm line-clamp-2">{video.description}</p>
                )}
              </div>

              {/* Maker Info */}
              {video.maker && (
                <div className="flex items-center gap-3 mb-4">
                  {video.maker.profilePicture ? (
                    <img
                      src={video.maker.profilePicture}
                      alt={video.maker.name}
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                      {video.maker.name[0]?.toUpperCase() || '👤'}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-semibold">{video.maker.name}</p>
                    <p className="text-white/70 text-xs">
                      {video.viewsCount.toLocaleString()} {locale === 'ar' ? 'مشاهدة' : locale === 'zh' ? '观看' : 'views'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="absolute right-4 bottom-24 flex flex-col gap-4 pointer-events-auto">
              {/* Like Button */}
              <div className="flex flex-col items-center gap-1">
                <LikeButton
                  targetType="VIDEO"
                  targetId={video.id}
                  initialLikesCount={video.likesCount}
                  locale={locale}
                  size="lg"
                  showCount={true}
                />
              </div>

              {/* Share Button */}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: video.title,
                      text: video.description,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert(locale === 'ar' ? 'تم نسخ الرابط' : locale === 'zh' ? '链接已复制' : 'Link copied');
                  }
                }}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-colors"
              >
                <Share2 className="w-6 h-6 text-white" />
              </button>

              {/* More Options */}
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-colors">
                <MoreVertical className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Scroll Indicator (dots) - Hidden on mobile */}
          <div className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 pointer-events-none">
            {videos.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white w-3' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
