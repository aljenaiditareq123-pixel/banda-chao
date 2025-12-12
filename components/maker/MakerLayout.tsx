'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Wallet, 
  Settings,
  Menu,
  X,
  Sparkles,
  Video
} from 'lucide-react';
import { useState } from 'react';

interface MakerLayoutProps {
  children: ReactNode;
  locale: string;
  makerName?: string;
}

interface NavItem {
  id: string;
  label: { ar: string; en: string; zh: string };
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const navItems: NavItem[] = [
  {
    id: 'overview',
    label: { ar: 'نظرة عامة', en: 'Overview', zh: '概览' },
    icon: LayoutDashboard,
    href: '/overview',
  },
  {
    id: 'products',
    label: { ar: 'منتجاتي', en: 'My Products', zh: '我的产品' },
    icon: Package,
    href: '/products',
  },
  {
    id: 'orders',
    label: { ar: 'الطلبات', en: 'Orders', zh: '订单' },
    icon: ShoppingBag,
    href: '/orders',
  },
  {
    id: 'studio',
    label: { ar: 'استوديو ذكي', en: 'Smart Studio', zh: '智能工作室' },
    icon: Video,
    href: '/studio',
  },
  {
    id: 'wallet',
    label: { ar: 'المحفظة', en: 'Wallet', zh: '钱包' },
    icon: Wallet,
    href: '/wallet',
  },
  {
    id: 'settings',
    label: { ar: 'الإعدادات', en: 'Settings', zh: '设置' },
    icon: Settings,
    href: '/settings',
  },
];

export default function MakerLayout({ children, locale, makerName = 'Master Artisan' }: MakerLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getLabel = (item: NavItem) => {
    return item.label[locale as keyof typeof item.label] || item.label.en;
  };

  const isActive = (href: string) => {
    return pathname?.endsWith(href) || pathname?.includes(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-amber-500/20 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-amber-400 hover:text-amber-300 transition-colors"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
          {locale === 'ar' ? 'استوديو الصانع' : locale === 'zh' ? '制造商工作室' : 'Maker Studio'}
        </h1>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 ${locale === 'ar' ? 'right-0' : 'left-0'} 
          h-full w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-black 
          border-${locale === 'ar' ? 'l' : 'r'} border-amber-500/20
          z-40 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : locale === 'ar' ? 'translate-x-full' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-amber-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {locale === 'ar' ? 'استوديو الصانع' : locale === 'zh' ? '制造商工作室' : 'Maker Studio'}
                </h2>
                <p className="text-xs text-amber-400/80">Merchant Dashboard</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-lg border border-amber-500/20">
              <p className="text-xs text-amber-300/60 mb-1">
                {locale === 'ar' ? 'مرحباً بعودتك' : locale === 'zh' ? '欢迎回来' : 'Welcome back'}
              </p>
              <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">
                {makerName}
              </p>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full">
                <span className="text-[10px] font-bold text-black">⭐ MASTER ARTISAN</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={`/${locale}/maker/dashboard${item.href}`}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${active
                      ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-400'
                      : 'text-gray-400 hover:text-amber-400 hover:bg-gray-800/50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-amber-400' : ''}`} />
                  <span className="font-medium">{getLabel(item)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-amber-500/20">
            <div className="text-xs text-gray-500 text-center">
              {locale === 'ar' ? 'بندا تشاو' : locale === 'zh' ? '班达超' : 'Banda Chao'}
              <br />
              <span className="text-amber-500/60">v1.0</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`lg:${locale === 'ar' ? 'mr-64' : 'ml-64'} pt-16 lg:pt-0`}>
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
