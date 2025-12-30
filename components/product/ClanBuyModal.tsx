'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Copy, Check, Clock, UserPlus } from 'lucide-react';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

interface ClanBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  soloPrice: number;
  clanPrice: number;
  currency?: string;
  locale?: string;
  onSuccess?: () => void;
}

interface ClanBuyData {
  id: string;
  joinToken: string;
  status: 'WAITING' | 'COMPLETE' | 'EXPIRED' | 'CANCELLED';
  memberCount: number;
  requiredCount: number;
  clanPrice: number;
  expiresAt: string;
  product?: {
    id: string;
    name: string;
    image_url?: string;
  };
  creator?: {
    id: string;
    name: string;
    profile_picture?: string;
  };
  members?: Array<{
    id: string;
    name: string;
    profilePicture?: string;
    joinedAt: string;
  }>;
}

export default function ClanBuyModal({
  isOpen,
  onClose,
  productId,
  productName,
  soloPrice,
  clanPrice,
  currency = 'USD',
  locale = 'en',
  onSuccess,
}: ClanBuyModalProps) {
  const { user } = useAuth();
  const [clanBuy, setClanBuy] = useState<ClanBuyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const translations = {
    ar: {
      title: 'شراء العشيرة',
      waiting: 'في انتظار شخص آخر...',
      waitingDesc: 'شارك الرابط مع صديق للانضمام والحصول على السعر المخفض',
      complete: 'اكتمل!',
      completeDesc: 'يمكنك الآن الشراء بالسعر المخفض',
      soloPrice: 'السعر الفردي',
      clanPrice: 'سعر العشيرة',
      shareLink: 'شارك الرابط',
      copyLink: 'نسخ الرابط',
      copied: 'تم النسخ!',
      join: 'انضم',
      joinClan: 'انضم إلى العشيرة',
      close: 'إغلاق',
      expiresIn: 'ينتهي خلال',
      members: 'الأعضاء',
      error: 'حدث خطأ',
      createClan: 'إنشاء عشيرة',
      youAreCreator: 'أنت منشئ العشيرة',
    },
    zh: {
      title: '团购',
      waiting: '等待另一个人加入...',
      waitingDesc: '分享链接给朋友加入并获得折扣价',
      complete: '完成！',
      completeDesc: '您现在可以以折扣价购买',
      soloPrice: '单独价格',
      clanPrice: '团购价格',
      shareLink: '分享链接',
      copyLink: '复制链接',
      copied: '已复制！',
      join: '加入',
      joinClan: '加入团购',
      close: '关闭',
      expiresIn: '剩余时间',
      members: '成员',
      error: '发生错误',
      createClan: '创建团购',
      youAreCreator: '您是创建者',
    },
    en: {
      title: 'Clan Buy',
      waiting: 'Waiting for 1 more person to join...',
      waitingDesc: 'Share the link with a friend to join and get the discounted price',
      complete: 'Complete!',
      completeDesc: 'You can now purchase at the discounted price',
      soloPrice: 'Solo Price',
      clanPrice: 'Clan Price',
      shareLink: 'Share Link',
      copyLink: 'Copy Link',
      copied: 'Copied!',
      join: 'Join',
      joinClan: 'Join Clan',
      close: 'Close',
      expiresIn: 'Expires in',
      members: 'Members',
      error: 'An error occurred',
      createClan: 'Create Clan',
      youAreCreator: 'You are the creator',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

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

  const formatTimeRemaining = (expiresAt: string): string => {
    const remaining = Math.max(0, new Date(expiresAt).getTime() - Date.now());
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Check if we're joining an existing clan (via URL parameter)
  useEffect(() => {
    if (!isOpen) return;

    const urlParams = new URLSearchParams(window.location.search);
    const joinToken = urlParams.get('clan');
    
    if (joinToken) {
      // Joining existing clan
      fetchClanBuy(joinToken);
    } else {
      // Creating new clan
      createClanBuy();
    }
  }, [isOpen, productId]);

  // Poll for updates if waiting
  useEffect(() => {
    if (!isOpen || !clanBuy || clanBuy.status !== 'WAITING') return;

    const interval = setInterval(() => {
      if (clanBuy.joinToken) {
        fetchClanBuy(clanBuy.joinToken);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [isOpen, clanBuy?.joinToken, clanBuy?.status]);

  const createClanBuy = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const { getApiUrl } = await import('@/lib/api-utils');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/clan-buy/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          clanPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || t.error);
      }

      setClanBuy(data.clanBuy);
    } catch (err: any) {
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClanBuy = async (joinToken: string) => {
    try {
      const { getApiUrl } = await import('@/lib/api-utils');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/clan-buy/${joinToken}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || t.error);
      }

      setClanBuy(data.clanBuy);
      
      // If completed, trigger success callback
      if (data.clanBuy.status === 'COMPLETE' && onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || t.error);
    }
  };

  const handleJoinClan = async () => {
    if (!clanBuy?.joinToken) return;

    setIsJoining(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const { getApiUrl } = await import('@/lib/api-utils');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/clan-buy/${clanBuy.joinToken}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || t.error);
      }

      // Refresh clan buy data
      await fetchClanBuy(clanBuy.joinToken);
      
      if (data.clanBuy.isComplete && onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || t.error);
    } finally {
      setIsJoining(false);
    }
  };

  const copyLink = () => {
    if (!clanBuy?.joinToken) return;

    const link = `${window.location.origin}${window.location.pathname}?clan=${clanBuy.joinToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const shareableLink = clanBuy?.joinToken 
    ? `${window.location.origin}${window.location.pathname}?clan=${clanBuy.joinToken}`
    : '';

  const isCreator = user && clanBuy?.creator?.id === user.id;
  const isMember = user && clanBuy?.members?.some(m => m.id === user.id);
  const canJoin = !isCreator && !isMember && clanBuy?.status === 'WAITING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && !clanBuy && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">{t.createClan}...</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {clanBuy && (
            <>
              {/* Price Comparison */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.soloPrice}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 line-through">
                    {formatPrice(soloPrice)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-4 text-center shadow-lg">
                  <p className="text-sm text-white/90 mb-1">{t.clanPrice}</p>
                  <p className="text-3xl font-bold text-white">{formatPrice(clanPrice)}</p>
                </div>
              </div>

              {/* Status */}
              {clanBuy.status === 'WAITING' && (
                <>
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                      <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {t.waiting}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t.waitingDesc}
                    </p>
                  </div>

                  {/* Members List */}
                  {clanBuy.members && clanBuy.members.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t.members} ({clanBuy.memberCount}/{clanBuy.requiredCount})
                      </p>
                      <div className="space-y-2">
                        {clanBuy.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-gray-100">
                                {member.name}
                                {isCreator && member.id === user?.id && (
                                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                                    ({t.youAreCreator})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                        {clanBuy.memberCount < clanBuy.requiredCount && (
                          <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-500">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-500 flex items-center justify-center">
                              <UserPlus className="w-5 h-5 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {locale === 'ar' ? 'مكان متاح' : locale === 'zh' ? '空位' : 'Spot available'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Share Link */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t.shareLink}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={shareableLink}
                        className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100"
                      />
                      <button
                        onClick={copyLink}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            {t.copied}
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            {t.copyLink}
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expiry Timer */}
                  <div className="flex items-center justify-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{t.expiresIn}: {formatTimeRemaining(clanBuy.expiresAt)}</span>
                  </div>

                  {/* Join Button (if not creator and not member) */}
                  {canJoin && (
                    <Button
                      variant="primary"
                      className="w-full mb-4"
                      onClick={handleJoinClan}
                      disabled={isJoining}
                    >
                      {isJoining ? '...' : t.joinClan}
                    </Button>
                  )}
                </>
              )}

              {clanBuy.status === 'COMPLETE' && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {t.complete}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    {t.completeDesc}
                  </p>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      if (onSuccess) onSuccess();
                      onClose();
                    }}
                  >
                    {locale === 'ar' ? 'إضافة إلى السلة' : locale === 'zh' ? '添加到购物车' : 'Add to Cart'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
