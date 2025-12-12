'use client';

import React, { useState, useEffect } from 'react';
import { Users, Clock, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
}

interface ActiveTeam {
  id: string;
  leaderName: string;
  leaderAvatar?: string;
  members: TeamMember[];
  maxMembers: number;
  spotsLeft: number;
  expiresAt: number; // timestamp
  teamPrice: number;
}

interface GroupBuyWidgetProps {
  soloPrice: number;
  teamPrice: number;
  currency?: string;
  locale?: string;
  productId?: string;
  onJoinTeam?: (teamId: string) => void;
  onCreateTeam?: () => void;
}

// Chinese Names for Mock Data (matching SmartToasts strategy)
const CHINESE_NAMES = [
  'Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao',
  'Wu', 'Zhou', 'Xu', 'Sun', 'Ma', 'Zhu', 'Hu', 'Guo',
];

// Generate mock active teams
const generateMockTeams = (teamPrice: number): ActiveTeam[] => {
  const teams: ActiveTeam[] = [];
  const now = Date.now();
  
  for (let i = 0; i < 3; i++) {
    const leaderName = CHINESE_NAMES[Math.floor(Math.random() * CHINESE_NAMES.length)];
    const maxMembers = 3; // Typical group buy requires 3 people
    const currentMembers = Math.floor(Math.random() * (maxMembers - 1)) + 1; // 1-2 members
    const spotsLeft = maxMembers - currentMembers;
    
    // Generate random members
    const members: TeamMember[] = [];
    for (let j = 0; j < currentMembers; j++) {
      const memberName = CHINESE_NAMES[Math.floor(Math.random() * CHINESE_NAMES.length)];
      members.push({
        id: `member-${i}-${j}`,
        name: memberName,
      });
    }
    
    teams.push({
      id: `team-${i}`,
      leaderName,
      members,
      maxMembers,
      spotsLeft,
      expiresAt: now + (Math.random() * 15 + 5) * 60 * 1000, // 5-20 minutes
      teamPrice,
    });
  }
  
  return teams;
};

export default function GroupBuyWidget({
  soloPrice,
  teamPrice,
  currency = 'AED',
  locale = 'en',
  productId = '',
  onJoinTeam,
  onCreateTeam,
}: GroupBuyWidgetProps) {
  const router = useRouter();
  const [teams, setTeams] = useState<ActiveTeam[]>(() => generateMockTeams(teamPrice));
  const [now, setNow] = useState(Date.now());

  // Update time every second for countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const formatTimeRemaining = (expiresAt: number): string => {
    const remaining = Math.max(0, expiresAt - now);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleJoinTeam = (teamId: string) => {
    if (onJoinTeam) {
      onJoinTeam(teamId);
    } else {
      // Navigate to Group Buy Lobby page - FIX: Use absolute path to break out of /products/ route
      // Ensure path starts with / to make it absolute and avoid relative path issues
      const normalizedLocale = locale || 'en';
      const normalizedTeamId = teamId.replace(/^\/+/, '').replace(/^products\//, ''); // Remove any leading slashes or products/ prefix
      // Explicitly construct absolute path: /{locale}/group-buy/{teamId}
      const absolutePath = `/${normalizedLocale}/group-buy/${normalizedTeamId}`;
      // Use router.push with absolute path - this should navigate to /{locale}/group-buy/{teamId}
      router.push(absolutePath);
    }
  };
  
  const handleCreateTeam = () => {
    if (onCreateTeam) {
      onCreateTeam();
    } else {
      // Create new team and navigate to lobby - FIX: Use absolute path to break out of /products/ route
      const newTeamId = `team-${Date.now()}`;
      const normalizedLocale = locale || 'en';
      // Explicitly construct absolute path: /{locale}/group-buy/{teamId}
      const absolutePath = `/${normalizedLocale}/group-buy/${newTeamId}`;
      // Use router.push with absolute path - this should navigate to /{locale}/group-buy/{teamId}
      router.push(absolutePath);
    }
  };

  const texts = {
    ar: {
      groupBuy: 'شراء جماعي',
      soloPrice: 'السعر الفردي',
      teamPrice: 'سعر الفريق',
      activeTeams: 'فرق نشطة',
      spotsLeft: 'مقاعد متبقية',
      expiresIn: 'ينتهي خلال',
      join: 'انضم',
      createTeam: 'إنشاء فريق',
      savings: 'توفير',
    },
    zh: {
      groupBuy: '拼团购买',
      soloPrice: '单独购买',
      teamPrice: '团队价格',
      activeTeams: '活跃团队',
      spotsLeft: '剩余名额',
      expiresIn: '剩余时间',
      join: '加入',
      createTeam: '创建团队',
      savings: '节省',
    },
    en: {
      groupBuy: 'Group Buy',
      soloPrice: 'Solo Price',
      teamPrice: 'Team Price',
      activeTeams: 'Active Teams',
      spotsLeft: 'spots left',
      expiresIn: 'Expires in',
      join: 'Join',
      createTeam: 'Create Team',
      savings: 'Save',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;
  const savings = soloPrice - teamPrice;
  const savingsPercent = Math.round((savings / soloPrice) * 100);

  return (
    <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-700 shadow-xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.groupBuy}</h3>
        {savings > 0 && (
          <span className="ml-auto px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
            {t.savings} {savingsPercent}%
          </span>
        )}
      </div>

      {/* Two Price Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Solo Price */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.soloPrice}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 line-through">
            {formatPrice(soloPrice)}
          </p>
        </div>

        {/* Team Price - Highlighted */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-4 border-2 border-amber-500 shadow-lg relative overflow-hidden">
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{ animation: 'shimmer 3s infinite' }} />
          <p className="text-sm text-white/90 mb-1 relative z-10 font-medium">{t.teamPrice}</p>
          <p className="text-3xl font-bold text-white relative z-10">{formatPrice(teamPrice)}</p>
        </div>
      </div>

      {/* Active Teams List */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t.activeTeams}
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {teams.length} {locale === 'ar' ? 'فريق' : locale === 'zh' ? '团队' : 'teams'}
          </span>
        </div>

        <div className="space-y-3">
          {teams.map((team) => {
            const timeRemaining = formatTimeRemaining(team.expiresAt);
            const isExpired = team.expiresAt <= now;
            
            return (
              <div
                key={team.id}
                className={`
                  bg-white dark:bg-gray-800 rounded-xl p-4 border-2
                  ${isExpired ? 'border-gray-200 dark:border-gray-700 opacity-60' : 'border-amber-300 dark:border-amber-700'}
                  transition-all duration-200 hover:shadow-lg
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Team Info */}
                  <div className="flex-1 min-w-0">
                    {/* Leader & Members */}
                    <div className="flex items-center gap-2 mb-2">
                      {/* Avatars Stack */}
                      <div className="flex -space-x-2">
                        {team.members.slice(0, 3).map((member, idx) => (
                          <div
                            key={member.id}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-800"
                            style={{ zIndex: 10 - idx }}
                          >
                            {member.name.charAt(0)}
                          </div>
                        ))}
                        {team.members.length === 1 && (
                          <>
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                              <UserPlus className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                              <UserPlus className="w-4 h-4 text-gray-400" />
                            </div>
                          </>
                        )}
                        {team.members.length === 2 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                            <UserPlus className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {team.leaderName}{locale === 'ar' ? ' فريق' : locale === 'zh' ? '的团队' : "'s Team"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {team.spotsLeft} {t.spotsLeft}
                        </p>
                      </div>
                    </div>

                    {/* Countdown Timer */}
                    {!isExpired && (
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span className="text-gray-600 dark:text-gray-400">{t.expiresIn}:</span>
                        <span className="font-mono font-bold text-red-600 dark:text-red-400">
                          {timeRemaining}
                        </span>
                      </div>
                    )}
                    {isExpired && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {locale === 'ar' ? 'انتهت' : locale === 'zh' ? '已过期' : 'Expired'}
                      </p>
                    )}
                  </div>

                  {/* Join Button */}
                  <Button
                    variant="primary"
                    className="flex-shrink-0 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold px-4 py-2"
                    onClick={() => handleJoinTeam(team.id)}
                    disabled={isExpired || team.spotsLeft === 0}
                  >
                    {t.join}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Team Button */}
      <Button
        variant="secondary"
        className="w-full bg-white dark:bg-gray-800 border-2 border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-semibold py-3"
        onClick={handleCreateTeam}
      >
        {t.createTeam}
      </Button>
    </div>
  );
}
