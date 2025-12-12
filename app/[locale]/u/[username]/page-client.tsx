'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Share2, MapPin, Briefcase, Sparkles } from 'lucide-react';
import VideoMirror from '@/components/profile/VideoMirror';
import SocialHub from '@/components/profile/SocialHub';
import Button from '@/components/Button';

interface PublicProfileClientProps {
  locale: string;
  username: string;
}

// Mock user data
const mockUserData = {
  id: '1',
  username: 'example',
  name: 'Ahmed Al-Mansoori',
  displayName: 'Ahmed Al-Mansoori',
  role: 'Senior Technician at BYD',
  verified: true,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
  coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&h=400&fit=crop',
  bio: 'Master artisan specializing in premium handcrafted products. 15+ years of experience in traditional and modern techniques.',
  location: 'Dubai, UAE',
  followers: 1240,
  following: 320,
  products: 45,
};

export default function PublicProfileClient({ locale, username }: PublicProfileClientProps) {
  const [user, setUser] = useState(mockUserData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch user data by username
    // For now, use mock data
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const texts = {
    ar: {
      verified: 'موثق',
      share: 'مشاركة',
      follow: 'متابعة',
      following: 'متابع',
      followers: 'متابع',
      followingCount: 'متابع',
      products: 'منتج',
      location: 'الموقع',
      role: 'الدور',
      bio: 'نبذة',
      videos: 'الفيديوهات',
      social: 'وسائل التواصل',
    },
    zh: {
      verified: '已验证',
      share: '分享',
      follow: '关注',
      following: '正在关注',
      followers: '粉丝',
      followingCount: '关注',
      products: '产品',
      location: '位置',
      role: '角色',
      bio: '简介',
      videos: '视频',
      social: '社交媒体',
    },
    en: {
      verified: 'Verified',
      share: 'Share',
      follow: 'Follow',
      following: 'Following',
      followers: 'Followers',
      followingCount: 'Following',
      products: 'Products',
      location: 'Location',
      role: 'Role',
      bio: 'Bio',
      videos: 'Videos',
      social: 'Social',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Golden Cover Image */}
      <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700"
          style={{
            backgroundImage: `url(${user.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
        
        {/* Share Button */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="secondary"
            className="bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white border-white/20"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${user.name} - Banda Chao`,
                  text: user.bio,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert(locale === 'ar' ? 'تم نسخ الرابط!' : locale === 'zh' ? '链接已复制！' : 'Link copied!');
              }
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            {t.share}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        {/* Identity Card (Floating) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-2xl border-2 border-amber-500/30 shadow-2xl p-6 md:p-8 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 p-1">
                  <div className="w-full h-full rounded-2xl bg-gray-800 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {user.verified && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center border-4 border-gray-900">
                    <Check className="w-5 h-5 text-black" />
                  </div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 mb-2">
                    {user.name}
                  </h1>
                  {user.role && (
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-amber-400" />
                      <p className="text-lg font-semibold text-white">{user.role}</p>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="primary"
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold px-6 py-2 rounded-xl"
                >
                  {t.follow}
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mb-4">
                <div>
                  <p className="text-2xl font-bold text-white">{user.followers.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">{t.followers}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{user.following.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">{t.followingCount}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{user.products}</p>
                  <p className="text-sm text-gray-400">{t.products}</p>
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-gray-300 leading-relaxed">{user.bio}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Video Mirror Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border-2 border-amber-500/20 p-6 md:p-8 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">
              {t.videos}
            </h2>
          </div>
          <VideoMirror locale={locale} />
        </motion.div>

        {/* Social Hub Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border-2 border-amber-500/20 p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Share2 className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">
              {t.social}
            </h2>
          </div>
          <SocialHub 
            locale={locale}
            socialLinks={{
              wechat: 'wechat://add?username=example',
              twitter: 'https://twitter.com/example',
              phone: '+971 50 123 4567',
              whatsapp: 'https://wa.me/971501234567',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
