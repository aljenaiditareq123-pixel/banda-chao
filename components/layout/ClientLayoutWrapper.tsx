'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Disable SSR for interactive components to prevent React Error #310
// These must be in a Client Component because ssr: false is not allowed in Server Components
const Navbar = dynamic(() => import('@/components/layout/Navbar'), { ssr: false });
const CartDrawer = dynamic(() => import('@/components/CartDrawer'), { ssr: false });
const FlashSale = dynamic(() => import('@/components/FlashSale'), { ssr: false });
const NightMarketBanner = dynamic(() => import('@/components/nightmarket/NightMarketBanner'), { ssr: false });
const BottomNav = dynamic(() => import('@/components/BottomNav'), { ssr: false });
const BandaPet = dynamic(() => import('@/components/pet/BandaPet'), { ssr: false });
const SmartToasts = dynamic(() => import('@/components/SmartToasts'), { ssr: false });
const CartToast = dynamic(() => import('@/components/cart/CartToast'), { ssr: false });
const PandaChatBubble = dynamic(() => import('@/components/chat/PandaChatBubble'), { ssr: false });
const LanguageSync = dynamic(() => import('@/components/providers/LanguageSync'), { ssr: false });

interface ClientLayoutWrapperProps {
  locale: string;
}

export default function ClientLayoutWrapper({ locale }: ClientLayoutWrapperProps) {
  return (
    <>
      {/* Night Market Banner - Shows during 8 PM - 6 AM */}
      <Suspense fallback={null}>
        <NightMarketBanner locale={locale} />
      </Suspense>
      
      {/* Flash Sale Countdown Banner - Top of Page */}
      <Suspense fallback={null}>
        <FlashSale />
      </Suspense>
      
      {/* Navbar - Client-only to prevent hydration mismatches */}
      <Suspense fallback={<div className="bg-white border-b border-gray-200 sticky top-0 h-16" />}>
        <Navbar locale={locale} />
      </Suspense>
      
      {/* Smart Social Proof Toasts - Premium Live Activity Notifications */}
      <Suspense fallback={null}>
        <SmartToasts />
      </Suspense>
      
      {/* Cart Toast Notifications */}
      <Suspense fallback={null}>
        <CartToast />
      </Suspense>
      
      {/* Footer stays in server component, only interactive parts here */}
      
      {/* Cart Drawer */}
      <Suspense fallback={null}>
        <CartDrawer locale={locale} />
      </Suspense>
      
      {/* Bottom Navigation Bar - Mobile Only */}
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
      
      {/* Banda Pet - Floating */}
      <Suspense fallback={null}>
        <BandaPet locale={locale} position="floating" size="medium" />
      </Suspense>
      
      {/* Panda Chat Bubble - AI Butler */}
      <Suspense fallback={null}>
        <PandaChatBubble locale={locale} />
      </Suspense>
      
      {/* Language Sync - Client-only to prevent hydration mismatches */}
      <Suspense fallback={null}>
        <LanguageSync locale={locale as 'zh' | 'en' | 'ar'} />
      </Suspense>
    </>
  );
}
