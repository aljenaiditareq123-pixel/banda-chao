'use client';

import { motion } from 'framer-motion';
import { Share2, BadgeCheck, MapPin, Building2 } from 'lucide-react';
import VideoMirror from '@/components/profile/VideoMirror';
import SocialHub from '@/components/profile/SocialHub';

interface PageClientProps {
  locale: string;
  username: string;
}

export default function PublicProfileClient({ locale, username }: PageClientProps) {
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      
      {/* 1. Golden Cover Header */}
      <div className="relative h-48 md:h-64 w-full bg-gradient-to-r from-amber-900 via-yellow-700 to-amber-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative -mt-20">
        
        {/* 2. Identity Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#1A1A1A]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative z-10"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-black shadow-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop" 
                  alt={username}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-[#1A1A1A] rounded-full" title="Online"></div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-white capitalize">{username}</h1>
                <BadgeCheck className="w-6 h-6 text-blue-400 fill-blue-400/20" />
              </div>
              
              <p className="text-amber-500 font-medium flex items-center justify-center sm:justify-start gap-2">
                <Building2 className="w-4 h-4" />
                Senior Technician at BYD
              </p>
              
              <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-white/50">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Shenzhen, China
                </span>
                <span>•</span>
                <span>Member since 2023</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                {['#LeatherCraft', '#Tech', '#Handmade', '#BYD'].map(tag => (
                  <span key={tag} className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/70">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* 3. Content Grid */}
        <div className="mt-8 grid lg:grid-cols-3 gap-8">
          
          {/* Main Column: Video Mirror (The Theater) */}
          <div className="lg:col-span-2 space-y-8">
            <VideoMirror />
            
            {/* Products Preview (Static for now) */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">My Masterpieces</h3>
              <div className="grid grid-cols-2 gap-4">
                 {[1, 2].map(i => (
                   <div key={i} className="aspect-square bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center text-center">
                     <span className="text-4xl mb-2">👜</span>
                     <p className="font-bold">Handmade Bag #{i}</p>
                     <p className="text-amber-500 text-sm">AED 299</p>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Social Hub (No-Exit) */}
          <div className="space-y-6">
            <SocialHub />
            
            {/* Support Card */}
            <div className="bg-gradient-to-br from-amber-900/50 to-black border border-amber-500/30 rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center text-2xl">
                🎁
              </div>
              <div>
                <h3 className="font-bold text-amber-500">Support the Artisan</h3>
                <p className="text-xs text-white/60 mt-1">Love the craft? Buy me a tea!</p>
              </div>
              <button className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-colors text-sm">
                Send Gift ($5)
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
