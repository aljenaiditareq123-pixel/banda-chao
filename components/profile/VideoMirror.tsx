'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Maximize2 } from 'lucide-react';

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white">Loading player...</div>
});

// Mock Data
const VIDEOS = [
  {
    id: 1,
    type: 'short',
    thumbnail: 'https://images.unsplash.com/photo-1556906781-9a412961d289?q=80&w=800&auto=format&fit=crop',
    url: 'https://www.youtube.com/shorts/5v4v6d6d4d4', // Mock Short
    title: 'Precision Crafting',
    views: '1.2M'
  },
  {
    id: 2,
    type: 'short',
    thumbnail: 'https://images.unsplash.com/photo-1576156858277-c99a77759b48?q=80&w=800&auto=format&fit=crop',
    url: 'https://www.youtube.com/shorts/8d8d8d8d8d', 
    title: 'Leather Selection',
    views: '850K'
  },
  {
    id: 3,
    type: 'long',
    thumbnail: 'https://images.unsplash.com/photo-1536838392500-b6f709144865?q=80&w=1200&auto=format&fit=crop',
    url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
    title: 'The Journey of a Handbag: From Raw Hide to Luxury',
    views: '45K'
  }
];

export default function VideoMirror() {
  const [selectedVideo, setSelectedVideo] = useState<typeof VIDEOS[0] | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-bold text-amber-500 flex items-center gap-2">
          <Play className="w-5 h-5 fill-current" />
          Magic Mirror Gallery
        </h3>
        <span className="text-xs text-white/50">3 Videos</span>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {VIDEOS.map((video) => (
          <motion.div
            key={video.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedVideo(video)}
            className={`relative group cursor-pointer overflow-hidden rounded-xl border border-white/10 ${
              video.type === 'long' ? 'col-span-2 aspect-video' : 'aspect-[9/16]'
            }`}
          >
            {/* Thumbnail */}
            <img 
              src={video.thumbnail} 
              alt={video.title} 
              className="w-full h-full object-cover"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            </div>

            {/* Info Badge */}
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
              <p className="text-xs text-white font-medium line-clamp-1">{video.title}</p>
              <p className="text-[10px] text-amber-400">{video.views} views</p>
            </div>
            
            {/* Type Badge */}
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-white border border-white/10 uppercase tracking-wider">
              {video.type}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Theater Mode Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
          >
            <div className="w-full max-w-4xl relative">
              {/* Close Button */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">Close Theater</span>
                  <div className="bg-white/10 p-1.5 rounded-full">
                    <X className="w-5 h-5" />
                  </div>
                </div>
              </button>

              {/* Player Container */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-amber-500/20 shadow-2xl shadow-amber-900/20">
                <ReactPlayer
                  url={selectedVideo.url}
                  width="100%"
                  height="100%"
                  playing={true}
                  controls={true}
                  config={{
                    youtube: { playerVars: { showinfo: 0 } }
                  }}
                />
              </div>

              {/* Video Details */}
              <div className="mt-4 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedVideo.title}</h2>
                  <p className="text-sm text-white/50">Watching in Banda Mirror • {selectedVideo.views} views</p>
                </div>
                <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-full text-sm transition-colors">
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}