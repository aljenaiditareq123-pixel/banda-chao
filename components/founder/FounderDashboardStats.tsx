'use client';

import { useState, useEffect } from 'react';
import { type StatCardProps, type QuickLinkProps, type TrendDirection, type AccentColor } from '@/types/founder';

function StatCard({ title, titleAr, value, change, trend, icon, accentColor = 'blue' }: StatCardProps) {
  const getTrendColor = (): string => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (): string => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '➡️';
    }
  };

  const getAccentGradient = (): string => {
    const gradients: Record<AccentColor, string> = {
      blue: 'from-blue-500 to-cyan-500',
      green: 'from-green-500 to-emerald-500',
      purple: 'from-purple-500 to-violet-500',
      orange: 'from-orange-500 to-amber-500',
      pink: 'from-pink-500 to-rose-500',
      indigo: 'from-indigo-500 to-blue-500',
    };
    return gradients[accentColor] || gradients.blue;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 rtl:flex-row-reverse">
        <div className={`w-12 h-12 bg-gradient-to-br ${getAccentGradient()} rounded-xl flex items-center justify-center shadow-sm`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div className="flex items-center gap-1 rtl:flex-row-reverse">
          <span className="text-xs">{getTrendIcon()}</span>
          <span className={`text-xs font-medium ${getTrendColor()}`}>
            {change}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
          {titleAr}
        </h3>
        <p className="text-2xl font-bold text-gray-900">
          {value}
        </p>
        <p className="text-xs text-gray-500">
          {title}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 w-full bg-gray-100 rounded-full h-1">
        <div 
          className={`bg-gradient-to-r ${getAccentGradient()} h-1 rounded-full transition-all duration-500 group-hover:shadow-sm`}
          style={{ width: trend === 'up' ? '75%' : trend === 'down' ? '35%' : '50%' }}
        />
      </div>
    </div>
  );
}

function QuickLink({ title, titleAr, description, icon, href, gradient }: QuickLinkProps) {
  return (
    <a
      href={href}
      className={`block p-4 bg-gradient-to-r ${gradient} rounded-xl text-white hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]`}
    >
      <div className="flex items-center gap-3 rtl:flex-row-reverse">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 rtl:text-right">
          <h4 className="font-semibold text-sm">{titleAr}</h4>
          <p className="text-xs opacity-90">{description}</p>
        </div>
        <span className="text-white/60 rtl:rotate-180">→</span>
      </div>
    </a>
  );
}

export default function FounderDashboardStats() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    // Simulate loading
    const timeout = setTimeout(() => setIsLoading(false), 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const stats = [
    {
      title: 'Total Users',
      titleAr: 'إجمالي المستخدمين',
      value: '2,847',
      change: '+12.5%',
      trend: 'up' as const,
      icon: '👥',
      accentColor: 'blue' as const
    },
    {
      title: 'Active Makers',
      titleAr: 'الصناع النشطون',
      value: '156',
      change: '+8.2%',
      trend: 'up' as const,
      icon: '🎨',
      accentColor: 'green' as const
    },
    {
      title: 'Total Products',
      titleAr: 'إجمالي المنتجات',
      value: '1,234',
      change: '+15.7%',
      trend: 'up' as const,
      icon: '📦',
      accentColor: 'purple' as const
    },
    {
      title: 'Total Videos',
      titleAr: 'إجمالي الفيديوهات',
      value: '892',
      change: '+22.1%',
      trend: 'up' as const,
      icon: '🎬',
      accentColor: 'orange' as const
    },
    {
      title: 'Monthly Revenue',
      titleAr: 'الإيرادات الشهرية',
      value: '$67.2K',
      change: '+31.4%',
      trend: 'up' as const,
      icon: '💰',
      accentColor: 'pink' as const
    },
    {
      title: 'AI Interactions',
      titleAr: 'تفاعلات الذكي الاصطناعي',
      value: '5,678',
      change: '+45.8%',
      trend: 'up' as const,
      icon: '🤖',
      accentColor: 'indigo' as const
    }
  ];

  const quickLinks = [
    {
      title: 'Analytics Dashboard',
      titleAr: 'لوحة التحليلات',
      description: 'View detailed metrics',
      icon: '📊',
      href: '/ar/founder/analytics',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Moderation Center',
      titleAr: 'مركز الإشراف',
      description: 'Content moderation',
      icon: '🛡️',
      href: '/ar/founder/moderation',
      gradient: 'from-emerald-500 to-green-500'
    },
    {
      title: 'System Settings',
      titleAr: 'إعدادات النظام',
      description: 'Platform configuration',
      icon: '⚙️',
      href: '/ar/founder/settings',
      gradient: 'from-purple-500 to-violet-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        
        {/* Loading Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-6">
        <div className="flex items-center justify-between rtl:flex-row-reverse">
          <div className="rtl:text-right ltr:text-left">
            <h1 className="text-xl font-bold mb-1">مركز القيادة</h1>
            <p className="text-blue-100 text-sm">Founder Command Center</p>
          </div>
          <div className="text-right rtl:text-left">
            <p className="text-blue-100 text-xs">Current Time</p>
            <p className="text-lg font-mono">{currentTime}</p>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-100">Platform Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-100">AI Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-100">Real-time Sync</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            titleAr={stat.titleAr}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
            accentColor={stat.accentColor}
          />
        ))}
      </div>

      {/* Quick Links */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
        {quickLinks.map((link, index) => (
          <QuickLink
            key={index}
            title={link.title}
            titleAr={link.titleAr}
            description={link.description}
            icon={link.icon}
            href={link.href}
            gradient={link.gradient}
          />
        ))}
      </div>
    </div>
  );
}
