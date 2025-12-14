'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Mail, Link2, Users, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface ViralShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  clanPrice: number;
  soloPrice: number;
  currency?: string;
  joinToken?: string;
  memberCount?: number;
  requiredCount?: number;
  expiresAt?: string;
  locale?: string;
}

export default function ViralShareModal({
  isOpen,
  onClose,
  productId,
  productName,
  clanPrice,
  soloPrice,
  currency = 'USD',
  joinToken,
  memberCount = 1,
  requiredCount = 3,
  expiresAt,
  locale = 'en',
}: ViralShareModalProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (isOpen && joinToken) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const url = `${baseUrl}/${locale}/products/${productId}?clan=${joinToken}`;
      setShareUrl(url);
    }
  }, [isOpen, joinToken, productId, locale]);

  const handleCopyLink = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleShare = async (platform: 'whatsapp' | 'email' | 'native') => {
    const message = locale === 'ar'
      ? `انضم إلى شراء جماعي واحصل على ${clanPrice} ${currency} بدلاً من ${soloPrice} ${currency}! ${shareUrl}`
      : locale === 'zh'
      ? `加入团购，以 ${clanPrice} ${currency} 而不是 ${soloPrice} ${currency} 的价格购买！${shareUrl}`
      : `Join group buy and get ${clanPrice} ${currency} instead of ${soloPrice} ${currency}! ${shareUrl}`;

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(productName)}&body=${encodeURIComponent(message)}`;
    } else if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: message,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  const remainingMembers = requiredCount - memberCount;
  const discountPercent = Math.round(((soloPrice - clanPrice) / soloPrice) * 100);

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

  const formatTimeRemaining = () => {
    if (!expiresAt) return '';
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return locale === 'ar' ? 'انتهى' : locale === 'zh' ? '已过期' : 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return locale === 'ar' 
        ? `${hours} ساعة و ${minutes} دقيقة`
        : locale === 'zh'
        ? `${hours} 小时 ${minutes} 分钟`
        : `${hours}h ${minutes}m`;
    }
    return locale === 'ar'
      ? `${minutes} دقيقة`
      : locale === 'zh'
      ? `${minutes} 分钟`
      : `${minutes}m`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {locale === 'ar' ? 'شارك واحصل على خصم!' : locale === 'zh' ? '分享并获得折扣！' : 'Share & Get Discount!'}
                  </h2>
                  <p className="text-sm text-white/90">
                    {remainingMembers === 1
                      ? locale === 'ar'
                        ? 'شخص واحد متبقي!'
                        : locale === 'zh'
                        ? '还剩一个人！'
                        : 'One person left!'
                      : locale === 'ar'
                      ? `${remainingMembers} أشخاص متبقين`
                      : locale === 'zh'
                      ? `还剩 ${remainingMembers} 个人`
                      : `${remainingMembers} people left`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>{memberCount}/{requiredCount} {locale === 'ar' ? 'أعضاء' : locale === 'zh' ? '成员' : 'members'}</span>
                <span className="font-bold">{discountPercent}% OFF</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(memberCount / requiredCount) * 100}%` }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Price Comparison */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300">
                  {locale === 'ar' ? 'السعر الفردي' : locale === 'zh' ? '单独价格' : 'Solo Price'}
                </span>
                <span className="text-lg font-semibold text-gray-400 line-through">
                  {formatPrice(soloPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  {locale === 'ar' ? 'سعر الفريق' : locale === 'zh' ? '团购价格' : 'Clan Price'}
                </span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatPrice(clanPrice)}
                </span>
              </div>
            </div>

            {/* Time Remaining */}
            {expiresAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <Clock className="w-4 h-4" />
                <span>
                  {locale === 'ar'
                    ? `ينتهي خلال: ${formatTimeRemaining()}`
                    : locale === 'zh'
                    ? `剩余时间：${formatTimeRemaining()}`
                    : `Expires in: ${formatTimeRemaining()}`}
                </span>
              </div>
            )}

            {/* Share Link */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {locale === 'ar' ? 'رابط المشاركة' : locale === 'zh' ? '分享链接' : 'Share Link'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className={`p-2 rounded-lg transition-colors ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              {copied && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  {locale === 'ar' ? 'تم النسخ!' : locale === 'zh' ? '已复制！' : 'Copied!'}
                </p>
              )}
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => handleShare('email')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>{locale === 'ar' ? 'بريد' : locale === 'zh' ? '邮件' : 'Email'}</span>
              </button>
              {navigator.share && (
                <button
                  onClick={() => handleShare('native')}
                  className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span>{locale === 'ar' ? 'مشاركة أخرى' : locale === 'zh' ? '其他分享' : 'More Options'}</span>
                </button>
              )}
            </div>

            {/* Call to Action */}
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                {locale === 'ar'
                  ? `🎉 شارك مع ${remainingMembers} ${remainingMembers === 1 ? 'صديق' : 'أصدقاء'} واحصل على خصم ${discountPercent}%!`
                  : locale === 'zh'
                  ? `🎉 与 ${remainingMembers} 个${remainingMembers === 1 ? '朋友' : '朋友'}分享并获得 ${discountPercent}% 折扣！`
                  : `🎉 Share with ${remainingMembers} ${remainingMembers === 1 ? 'friend' : 'friends'} and get ${discountPercent}% off!`}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
