'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, Users, CheckCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/Button';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string | null;
}

interface TeamData {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  soloPrice: number;
  teamPrice: number;
  currency: string;
  leaderName: string;
  leaderAvatar?: string | null;
  members: TeamMember[];
  maxMembers: number;
  expiresAt: number;
}

interface GroupBuyLobbyClientProps {
  locale: string;
  teamId: string;
  teamData: TeamData;
}

export default function GroupBuyLobbyClient({
  locale,
  teamId,
  teamData,
}: GroupBuyLobbyClientProps) {
  const router = useRouter();
  const [now, setNow] = useState(Date.now());
  const [isExpired, setIsExpired] = useState(false);

  // Update time every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime >= teamData.expiresAt) {
        setIsExpired(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [teamData.expiresAt]);

  const formatPrice = (price: number) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      CNY: '¥',
      SAR: 'ر.س',
      AED: 'د.إ',
    };
    return `${symbols[teamData.currency] || teamData.currency} ${price.toLocaleString()}`;
  };

  const formatTimeRemaining = (): string => {
    if (isExpired) return '00:00';
    const remaining = Math.max(0, teamData.expiresAt - now);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleConfirmAndPay = () => {
    // In production, redirect to checkout with team price
    router.push(`/${locale}/checkout?teamId=${teamId}&teamPrice=${teamData.teamPrice}`);
  };

  const spotsLeft = teamData.maxMembers - teamData.members.length;
  const timeRemaining = formatTimeRemaining();

  const texts = {
    ar: {
      waitingForYou: 'ينتظرك!',
      endsIn: 'ينتهي خلال',
      teamMembers: 'أعضاء الفريق',
      you: 'أنت',
      confirmAndPay: 'تأكيد والدفع',
      expired: 'انتهى الوقت',
      productSummary: 'ملخص المنتج',
      soloPrice: 'السعر الفردي',
      teamPrice: 'سعر الفريق',
      savings: 'توفير',
    },
    zh: {
      waitingForYou: '在等你！',
      endsIn: '还剩',
      teamMembers: '团队成员',
      you: '你',
      confirmAndPay: '确认并支付',
      expired: '已过期',
      productSummary: '产品摘要',
      soloPrice: '单独购买价',
      teamPrice: '团队价格',
      savings: '节省',
    },
    en: {
      waitingForYou: 'is waiting for you!',
      endsIn: 'Ends in',
      teamMembers: 'Team Members',
      you: 'You',
      confirmAndPay: 'Confirm & Pay',
      expired: 'Expired',
      productSummary: 'Product Summary',
      soloPrice: 'Solo Price',
      teamPrice: 'Team Price',
      savings: 'Save',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;
  const savings = teamData.soloPrice - teamData.teamPrice;
  const savingsPercent = Math.round((savings / teamData.soloPrice) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-amber-500/30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/${locale}/products/${teamData.productId}`}>
            <button className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">
              Team #{teamId.slice(-6).toUpperCase()} {t.waitingForYou}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
        {/* Countdown Timer */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block"
          >
            <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-8 shadow-2xl border-2 border-red-500/50">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-white animate-pulse" />
                <p className="text-white/90 text-sm font-medium">{t.endsIn}</p>
              </div>
              <p className={`text-6xl font-black ${isExpired ? 'text-gray-400' : 'text-white'}`}>
                {timeRemaining}
              </p>
              {isExpired && (
                <p className="text-red-300 text-sm font-bold mt-2">{t.expired}</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Team Members */}
        <div className="bg-gradient-to-br from-amber-900/20 via-yellow-900/20 to-orange-900/20 rounded-2xl border-2 border-amber-500/30 p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            {t.teamMembers}
          </h2>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Member Slots */}
            {Array.from({ length: teamData.maxMembers }).map((_, index) => {
              const member = teamData.members[index];
              const isEmpty = !member;
              const isUser = isEmpty && index === teamData.members.length;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    relative aspect-square rounded-xl p-4 flex flex-col items-center justify-center
                    ${isEmpty 
                      ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-2 border-dashed border-amber-500/50' 
                      : 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50'
                    }
                    ${isUser ? 'animate-pulse' : ''}
                  `}
                >
                  {member ? (
                    <>
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold mb-2 border-4 border-amber-400/50">
                        {member.name.charAt(0)}
                      </div>
                      <p className="text-white text-sm font-semibold">{member.name}</p>
                      {index === 0 && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          {locale === 'ar' ? 'القائد' : locale === 'zh' ? '队长' : 'Leader'}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center mb-2">
                        <span className="text-gray-500 text-3xl">+</span>
                      </div>
                      <p className="text-gray-400 text-sm font-medium">
                        {isUser ? t.you : `${locale === 'ar' ? 'شاغر' : locale === 'zh' ? '空缺' : 'Empty'}`}
                      </p>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="mt-4 text-center">
            <p className="text-amber-400 text-sm font-medium">
              {spotsLeft > 0 
                ? `${spotsLeft} ${locale === 'ar' ? 'مقعد متبقي' : locale === 'zh' ? '个名额' : 'spot'}${spotsLeft > 1 ? (locale === 'zh' ? '' : 's') : ''} ${locale === 'ar' ? 'للانضمام' : locale === 'zh' ? '待加入' : 'left to join'}`
                : locale === 'ar' ? 'الفريق مكتمل!' : locale === 'zh' ? '团队已满！' : 'Team is full!'
              }
            </p>
          </div>
        </div>

        {/* Product Summary */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border-2 border-gray-700/50 p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            {t.productSummary}
          </h3>
          
          <div className="flex gap-4">
            {/* Product Image */}
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0 border-2 border-amber-500/30">
              {teamData.productImage ? (
                <img
                  src={teamData.productImage}
                  alt={teamData.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  🛍️
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-2">{teamData.productName}</h4>
              
              {/* Prices */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-red-400">
                    {formatPrice(teamData.teamPrice)}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(teamData.soloPrice)}
                  </span>
                </div>
                <p className="text-xs text-amber-400 font-medium">
                  {t.teamPrice} • {t.savings} {savingsPercent}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-black via-gray-900 to-black border-t border-amber-500/30 shadow-2xl">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Button
            variant="primary"
            onClick={handleConfirmAndPay}
            disabled={isExpired || spotsLeft === 0}
            className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold text-lg py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-6 h-6" />
            <span>
              {t.confirmAndPay} {formatPrice(teamData.teamPrice)}
            </span>
          </Button>
          
          {isExpired && (
            <p className="text-center text-red-400 text-sm mt-2 font-medium">
              {locale === 'ar' ? 'انتهى وقت الفريق. يرجى إنشاء فريق جديد.' : locale === 'zh' ? '团队时间已到。请创建新团队。' : 'Team time expired. Please create a new team.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
