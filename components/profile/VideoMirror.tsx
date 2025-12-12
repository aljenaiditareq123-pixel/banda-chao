'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Play, X, Youtube, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamic import for react-player
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as React.ComponentType<{
  url: string;
  width?: string;
  height?: string;
  playing?: boolean;
  controls?: boolean;
  light?: boolean | string;
  config?: {
    youtube?: {
      playerVars?: {
        autoplay?: number;
        controls?: number;
        modestbranding?: number;
        rel?: number;
      };
    };
    tiktok?: {
      playerVars?: Record<string, any>;
    };
  };
}>;

interface Video {
  id: string;
  url: string;
  platform: 'youtube' | 'tiktok';
  title: string;
  thumbnail?: string;
  duration?: string;
}

interface VideoMirrorProps {
  locale: string;
  videos?: Video[];
}

// Mock videos if none provided
const mockVideos: Video[] = [
  {
    id: '1',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    platform: 'youtube',
    title: 'Product Showcase - Premium Quality',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  },
  {
    id: '2',
    url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    platform: 'youtube',
    title: 'Behind the Scenes - Making Process',
    thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
  },
  {
    id: '3',
    url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    platform: 'youtube',
    title: 'Customer Testimonials',
    thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
  },
  {
    id: '4',
    url: 'https://www.tiktok.com/@example/video/1234567890',
    platform: 'tiktok',
    title: 'Quick Product Demo',
  },
  {
    id: '5',
    url: 'https://www.tiktok.com/@example/video/0987654321',
    platform: 'tiktok',
    title: 'Daily Life as an Artisan',
  },
  {
    id: '6',
    url: 'https://www.tiktok.com/@example/video/1122334455',
    platform: 'tiktok',
    title: 'Workshop Tour',
  },
];

export default function VideoMirror({ locale, videos = mockVideos }: VideoMirrorProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const youtubeVideos = videos.filter(v => v.platform === 'youtube');
  const tiktokVideos = videos.filter(v => v.platform === 'tiktok');

  const openTheaterMode = (video: Video) => {
    setSelectedVideo(video);
    setIsPlaying(true);
  };

  const closeTheaterMode = () => {
    setIsPlaying(false);
    setTimeout(() => setSelectedVideo(null), 300);
  };

  const renderVideoCard = (video: Video) => {
    const isYouTube = video.platform === 'youtube';
    const thumbnail = video.thumbnail || (isYouTube 
      ? `https://img.youtube.com/vi/${video.url.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`
      : undefined);

    return (
      <motion.div
        key={video.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        className="relative aspect-video rounded-xl overflow-hidden bg-gray-800 cursor-pointer group"
        onClick={() => openTheaterMode(video)}
      >
        {/* Thumbnail or Light Mode Player */}
        <ReactPlayer
          url={video.url}
          width="100%"
          height="100%"
          playing={false}
          light={thumbnail || true}
          controls={false}
          config={{
            youtube: {
              playerVars: {
                modestbranding: 1,
                rel: 0,
              },
            },
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Platform Badge */}
        <div className="absolute top-2 right-2">
          {isYouTube ? (
            <div className="bg-red-600 text-white px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold">
              <Youtube className="w-3 h-3" />
              YouTube
            </div>
          ) : (
            <div className="bg-black text-white px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold">
              <Music className="w-3 h-3" />
              TikTok
            </div>
          )}
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
          <p className="text-white text-sm font-semibold line-clamp-2">{video.title}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* YouTube Videos Section */}
      {youtubeVideos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Youtube className="w-5 h-5 text-red-600" />
            <h3 className="text-xl font-bold text-white">
              {locale === 'ar' ? 'فيديوهات YouTube' : locale === 'zh' ? 'YouTube 视频' : 'YouTube Videos'}
            </h3>
            <span className="text-sm text-gray-400">({youtubeVideos.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {youtubeVideos.map(renderVideoCard)}
          </div>
        </div>
      )}

      {/* TikTok Videos Section */}
      {tiktokVideos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Music className="w-5 h-5 text-black dark:text-white" />
            <h3 className="text-xl font-bold text-white">
              {locale === 'ar' ? 'فيديوهات TikTok' : locale === 'zh' ? 'TikTok 视频' : 'TikTok Videos'}
            </h3>
            <span className="text-sm text-gray-400">({tiktokVideos.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiktokVideos.map(renderVideoCard)}
          </div>
        </div>
      )}

      {/* Theater Mode Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeTheaterMode}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeTheaterMode}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Video Title */}
              <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-white font-semibold">{selectedVideo.title}</p>
              </div>

              {/* Video Player */}
              <ReactPlayer
                url={selectedVideo.url}
                width="100%"
                height="100%"
                playing={isPlaying}
                controls={true}
                config={{
                  youtube: {
                    playerVars: {
                      autoplay: 1,
                      controls: 1,
                      modestbranding: 1,
                      rel: 0,
                    },
                  },
                  tiktok: {
                    playerVars: {},
                  },
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
